define([ "require", "hbs!tmpl/site/Header", "utils/CommonViewFunction", "utils/Globals", "utils/Utils", "utils/UrlLinks", "jquery-ui" ], function(require, tmpl, CommonViewFunction, Globals, Utils, UrlLinks) {
    "use strict";
    var Header = Marionette.LayoutView.extend({
        template: tmpl,
        regions: {},
        templateHelpers: function() {
            return {
                glossaryImportTempUrl: UrlLinks.glossaryImportTempUrl(),
                businessMetadataImportTempUrl: UrlLinks.businessMetadataImportTempUrl(),
                apiDocUrl: UrlLinks.apiDocUrl(),
                isDebugMetricsEnabled: Globals.isDebugMetricsEnabled
            };
        },
        ui: {
            backButton: "[data-id='backButton']",
            menuHamburger: "[data-id='menuHamburger']",
            globalSearch: "[data-id='globalSearch']",
            clearGlobalSearch: "[data-id='clearGlobalSearch']",
            signOut: "[data-id='signOut']",
            administrator: "[data-id='administrator']",
            showDebug: "[data-id='showDebug']",
            uiSwitch: "[data-id='uiSwitch']",
            glossaryImport: "[data-id='glossaryImport']",
            businessMetadataImport: "[data-id='businessMetadataImport']"
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.backButton] = function() {
                Utils.backButtonClick();
            }, events["click " + this.ui.clearGlobalSearch] = function() {
                this.ui.globalSearch.val(""), this.ui.globalSearch.autocomplete("search"), this.ui.clearGlobalSearch.removeClass("in");
            }, events["click " + this.ui.menuHamburger] = function() {
                this.setSearchBoxWidth({
                    updateWidth: function(atlasHeaderWidth) {
                        return $("body").hasClass("full-screen") ? atlasHeaderWidth - 350 : atlasHeaderWidth + 350;
                    }
                }), $("body").toggleClass("full-screen");
            }, events["click " + this.ui.signOut] = function() {
                Utils.localStorage.setValue("last_ui_load", "v1");
                var path = Utils.getBaseUrl(window.location.pathname);
                window.location = path + "/logout.html";
            }, events["click " + this.ui.uiSwitch] = function() {
                var path = Utils.getBaseUrl(window.location.pathname) + "/n/index.html";
                window.location.hash.length > 2 && (path += window.location.hash), window.location.href = path;
            }, events["click " + this.ui.administrator] = function() {
                Utils.setUrl({
                    url: "#!/administrator",
                    mergeBrowserUrl: !1,
                    trigger: !0,
                    updateTabState: !0
                });
            }, events["click " + this.ui.glossaryImport] = function() {
                this.onClickImport(!0);
            }, events["click " + this.ui.businessMetadataImport] = function() {
                this.onClickImport();
            }, events["click " + this.ui.showDebug] = function() {
                Utils.setUrl({
                    url: "#!/debugMetrics",
                    mergeBrowserUrl: !1,
                    trigger: !0,
                    updateTabState: !0
                });
            }, events;
        },
        initialize: function(options) {
            this.bindEvent(), this.options = options;
        },
        setSearchBoxWidth: function(options) {
            var atlasHeaderWidth = this.$el.find(".atlas-header").width(), minusWidth = Utils.getUrlState.isDetailPage() || Utils.getUrlState.isRelationshipDetailPage() || Utils.getUrlState.isBSDetail() ? 360 : 210;
            options && options.updateWidth && (atlasHeaderWidth = options.updateWidth(atlasHeaderWidth)), 
            atlasHeaderWidth > minusWidth && this.$el.find(".global-search-container").width(atlasHeaderWidth - minusWidth);
        },
        bindEvent: function() {
            var that = this;
            $(window).resize(function() {
                that.setSearchBoxWidth();
            });
        },
        onRender: function() {
            var that = this;
            Globals.userLogedIn.status && that.$(".userName").html(Globals.userLogedIn.response.userName), 
            this.initializeGlobalSearch();
        },
        onShow: function() {
            this.setSearchBoxWidth();
        },
        onBeforeDestroy: function() {
            this.ui.globalSearch.atlasAutoComplete("destroy");
        },
        manualRender: function() {
            this.setSearchBoxWidth();
        },
        fetchSearchData: function(options) {
            var request = options.request, response = options.response, inputEl = options.inputEl, term = request.term, data = {}, sendResponse = function() {
                var query = data.query, suggestions = data.suggestions;
                void 0 !== query && void 0 !== suggestions && (inputEl.siblings("span.fa-refresh").removeClass("fa-refresh fa-spin-custom").addClass("fa-search"), 
                response(data));
            };
            $.ajax({
                url: UrlLinks.searchApiUrl("quick"),
                contentType: "application/json",
                data: {
                    query: term,
                    limit: 5,
                    offset: 0
                },
                cache: !0,
                success: function(response) {
                    var rData = response.searchResults.entities || [];
                    data.query = {
                        category: "entities",
                        data: rData,
                        order: 1
                    }, sendResponse();
                }
            }), $.ajax({
                url: UrlLinks.searchApiUrl("suggestions"),
                contentType: "application/json",
                data: {
                    prefixString: term
                },
                cache: !0,
                success: function(response) {
                    var rData = response.suggestions || [];
                    data.suggestions = {
                        category: "suggestions",
                        data: rData,
                        order: 2
                    }, sendResponse();
                }
            });
        },
        getSearchString: function(str) {
            return str && str.length && null === str.match(/[+\-&|!(){}[\]^"~*?:/]/g) ? str + "*" : str;
        },
        triggerBuasicSearch: function(query) {
            Utils.setUrl({
                url: "#!/search/searchResult?query=" + encodeURIComponent(query) + "&searchType=basic",
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
        },
        initializeGlobalSearch: function() {
            var that = this;
            this.ui.globalSearch.atlasAutoComplete({
                minLength: 1,
                autoFocus: !1,
                search: function() {
                    $(this).siblings("span.fa-search").removeClass("fa-search").addClass("fa-refresh fa-spin-custom");
                },
                select: function(event, ui) {
                    var item = ui && ui.item;
                    event.preventDefault(), event.stopPropagation();
                    var $el = $(this);
                    return _.isString(item) ? ($el.val(item), $el.data("valSelected", !0), that.triggerBuasicSearch(item)) : _.isObject(item) && item.guid && Utils.setUrl({
                        url: "#!/detailPage/" + item.guid,
                        mergeBrowserUrl: !1,
                        trigger: !0
                    }), $el.blur(), !0;
                },
                source: function(request, response) {
                    that.fetchSearchData({
                        request: request,
                        response: response,
                        inputEl: this.element
                    });
                }
            }).focus(function() {
                $(this).atlasAutoComplete("search");
            }).keyup(function(event) {
                "" === $(this).val().trim() ? that.ui.clearGlobalSearch.removeClass("in") : (that.ui.clearGlobalSearch.addClass("in"), 
                13 == event.keyCode && ($(this).data("valSelected") !== !0 ? that.triggerBuasicSearch($(this).val()) : $(this).data("valSelected", !1)));
            }).atlasAutoComplete("instance")._renderItem = function(ul, searchItem) {
                if (searchItem) {
                    var data = searchItem.data, searchTerm = this.term, getHighlightedTerm = function(resultStr) {
                        try {
                            return resultStr.replace(new RegExp(searchTerm, "gi"), function(foundStr) {
                                return "<span class='searched-term'>" + foundStr + "</span>";
                            });
                        } catch (error) {
                            return resultStr;
                        }
                    };
                    if (data) {
                        if (0 == data.length) return $("<li class='empty'></li>").append("<span class='empty-message'>No " + searchItem.category + " found</span>").appendTo(ul);
                        var items = [];
                        return _.each(data, function(item) {
                            var li = null;
                            if (_.isObject(item)) {
                                item.itemText = Utils.getName(item) + " (" + item.typeName + ")";
                                var options = {};
                                if (void 0 === item.serviceType) {
                                    if (void 0 === Globals.serviceTypeMap[item.typeName] && that.entityDefCollection) {
                                        var defObj = that.entityDefCollection.fullCollection.find({
                                            name: item.typeName
                                        });
                                        defObj && (Globals.serviceTypeMap[item.typeName] = defObj.get("serviceType"));
                                    }
                                } else void 0 === Globals.serviceTypeMap[item.typeName] && (Globals.serviceTypeMap[item.typeName] = item.serviceType);
                                item.serviceType = Globals.serviceTypeMap[item.typeName], options.entityData = item;
                                var img = $('<img src="' + Utils.getEntityIconPath(options) + '">').on("error", function(error, s) {
                                    this.src = Utils.getEntityIconPath(_.extend(options, {
                                        errorUrl: this.src
                                    }));
                                }), span = $("<span>" + getHighlightedTerm(item.itemText) + "</span>").prepend(img);
                                li = $("<li class='with-icon'>").append(span);
                            } else li = $("<li>").append("<span>" + getHighlightedTerm(_.escape(item)) + "</span>");
                            li.data("ui-autocomplete-item", item), searchItem.category && items.push(li.attr("aria-label", searchItem.category + " : " + (_.isObject(item) ? item.itemText : item)));
                        }), ul.append(items);
                    }
                }
            };
        },
        onClickImport: function(isGlossary) {
            var that = this;
            require([ "views/import/ImportLayoutView" ], function(ImportLayoutView) {
                new ImportLayoutView({
                    callback: function() {
                        that.options.importVent && (isGlossary ? that.options.importVent.trigger("Import:Glossary:Update") : that.options.importVent.trigger("Import:BM:Update"));
                    },
                    isGlossary: isGlossary
                });
            });
        }
    });
    return Header;
});