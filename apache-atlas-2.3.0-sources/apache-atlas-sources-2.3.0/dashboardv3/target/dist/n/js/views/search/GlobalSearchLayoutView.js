define([ "require", "backbone", "hbs!tmpl/search/GlobalSearchLayoutView_tmpl", "utils/Utils", "utils/UrlLinks", "utils/Globals", "jquery-ui" ], function(require, Backbone, GlobalSearchLayoutViewTmpl, Utils, UrlLinks, Globals) {
    "use strict";
    var GlobalSearchLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "GlobalSearchLayoutView",
        template: GlobalSearchLayoutViewTmpl,
        regions: {
            RSearchLayoutView: "#r_searchLayout"
        },
        ui: {
            globalSearch: "[data-id='globalSearch']",
            clearGlobalSearch: "[data-id='clearGlobalSearch']",
            detailSearch: "[data-id='detailSearch']",
            searchLayoutView: ".searchLayoutView"
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.clearGlobalSearch] = function() {
                this.ui.globalSearch.val(""), this.ui.globalSearch.atlasAutoComplete("search"), 
                this.ui.clearGlobalSearch.removeClass("in");
            }, events["click " + this.ui.detailSearch] = function() {
                this.ui.searchLayoutView.toggleClass("open"), this.fromDefaultSearch !== !0 && $("body").toggleClass("global-search-active");
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "value", "closeOnSubmit", "fromDefaultSearch", "initialView", "classificationDefCollection", "entityDefCollection", "typeHeaders", "searchVent", "enumDefCollection", "searchTableColumns")), 
            this.bindEvents();
        },
        bindEvents: function() {
            var that = this;
            $("body").on("click", function(e) {
                that.isDestroyed || "detailSearch" === that.$(e.target).data("id") || 0 === $(e.target).parents(".searchLayoutView").length && that.ui.searchLayoutView.hasClass("open") && that.ui.searchLayoutView.removeClass("open");
            });
        },
        onRender: function() {
            this.initializeGlobalSearch(), this.renderSearchLayoutView();
        },
        onBeforeDestroy: function() {
            this.ui.searchLayoutView.removeClass("open"), this.ui.globalSearch.atlasAutoComplete("destroy");
        },
        fetchSearchData: function(options) {
            var request = options.request, response = options.response, term = request.term, data = {}, sendResponse = function() {
                var query = data.query, suggestions = data.suggestions;
                void 0 !== query && void 0 !== suggestions && response(data);
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
        triggerBasicSearch: function(query) {
            Utils.setUrl({
                url: "#!/search/searchResult?query=" + encodeURIComponent(query) + "&searchType=basic",
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
        },
        renderSearchLayoutView: function() {
            var that = this;
            require([ "views/search/AdvanceSearchLayoutView" ], function(AdvanceSearchLayoutView) {
                that.RSearchLayoutView.show(new AdvanceSearchLayoutView(_.extend({
                    isHeaderSearch: !0,
                    onSubmit: function() {
                        that.ui.searchLayoutView.removeClass("open");
                    }
                }, that.options)));
            });
        },
        initializeSearchValue: function() {
            if (this.options.value) {
                CommonViewFunction.generateQueryOfFilter(this.options.value);
            }
        },
        closeSearch: function() {
            this.ui.globalSearch.atlasAutoComplete("close");
        },
        initializeGlobalSearch: function() {
            var that = this;
            this.ui.globalSearch.atlasAutoComplete({
                minLength: 1,
                autoFocus: !1,
                search: function() {
                    that.ui.searchLayoutView.hasClass("open") || $(this).siblings("span.fa-search").removeClass("fa-search").addClass("fa-refresh fa-spin-custom");
                },
                focus: function(event, ui) {
                    return !1;
                },
                open: function() {
                    $(this).siblings("span.fa-refresh").removeClass("fa-refresh fa-spin-custom").addClass("fa-search");
                },
                select: function(event, ui) {
                    var item = ui && ui.item;
                    event.preventDefault(), event.stopPropagation();
                    var $el = $(this);
                    return _.isString(item) ? ($el.val(item), $el.data("valSelected", !0), that.triggerBasicSearch(item)) : _.isObject(item) && item.guid && Utils.setUrl({
                        url: "#!/detailPage/" + item.guid,
                        mergeBrowserUrl: !1,
                        trigger: !0
                    }), $el.blur(), !0;
                },
                source: function(request, response) {
                    that.ui.searchLayoutView.hasClass("open") || that.fetchSearchData({
                        request: request,
                        response: response
                    });
                }
            }).focus(function() {
                that.ui.searchLayoutView.hasClass("open") || $(this).atlasAutoComplete("search");
            }).keyup(function(event) {
                "" === $(this).val().trim() ? 13 == event.keyCode ? (this.value = "*", that.triggerBasicSearch("*")) : that.ui.clearGlobalSearch.removeClass("in") : (that.ui.clearGlobalSearch.addClass("in"), 
                13 == event.keyCode && ($(this).data("valSelected") !== !0 ? (that.closeSearch(), 
                that.triggerBasicSearch($(this).val())) : $(this).data("valSelected", !1)));
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
        }
    });
    return GlobalSearchLayoutView;
});