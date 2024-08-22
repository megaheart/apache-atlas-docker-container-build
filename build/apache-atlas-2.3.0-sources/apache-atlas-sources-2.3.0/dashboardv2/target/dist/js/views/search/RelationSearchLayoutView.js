define([ "require", "backbone", "hbs!tmpl/search/RelationshipSearch_tmpl", "utils/Utils", "utils/UrlLinks", "utils/Globals", "utils/Enums", "collection/VSearchList", "utils/CommonViewFunction", "modules/Modal" ], function(require, Backbone, RelationshipSearchViewTmpl, Utils, UrlLinks, Globals, Enums, VSearchList, CommonViewFunction, Modal) {
    "use strict";
    var RelationshipSearchLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "RelationshipSearchLayoutView",
        template: RelationshipSearchViewTmpl,
        regions: {
            RSaveSearchRelationship: "[data-id='r_saveSearchRelationship']"
        },
        ui: {
            searchBtn: '[data-id="relationshipSearchBtn"]',
            clearSearch: '[data-id="clearRelationSearch"]',
            relationshipLov: '[data-id="relationshipLOV"]',
            relationshipAttrFilter: '[data-id="relationAttrFilter"]',
            refreshBtn: '[data-id="refreshRelationBtn"]'
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.searchBtn] = "findSearchResult", events["change " + this.ui.relationshipLov] = "checkForButtonVisiblity", 
            events["click " + this.ui.clearSearch] = "clearSearchData", events["click " + this.ui.refreshBtn] = "onRefreshButton", 
            events["click " + this.ui.relationshipAttrFilter] = "openAttrFilter", events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "value", "searchVent", "typeHeaders", "searchTableColumns", "searchTableFilters", "entityDefCollection", "enumDefCollection", "classificationDefCollection", "businessMetadataDefCollection", "relationshipDefCollection", "metricCollection", "relationshipEventAgg")), 
            this.value || (this.value = {}), this.bindEvents();
        },
        bindEvents: function() {
            this.listenTo(this.relationshipDefCollection, "reset", function() {
                this.renderRelationshipList(), this.setValues();
            }), this.relationshipEventAgg.on("Relationship:Update", function(options) {
                that.value = Utils.getUrlState.getQueryParams() || {}, that.initializeValues();
            });
        },
        onRender: function() {
            this.initializeValues();
        },
        initializeValues: function() {
            this.renderRelationshipList(), this.checkForButtonVisiblity(), this.setValues(), 
            this.renderSaveSearch();
        },
        renderSaveSearch: function() {
            var that = this;
            require([ "views/search/save/SaveSearchView" ], function(SaveSearchView) {
                function fetchSaveSearchCollection() {
                    saveSearchCollection.fetch({
                        success: function(collection, data) {
                            saveSearchRelationshipCollection.fullCollection.reset(_.where(data, {
                                searchType: "BASIC_RELATIONSHIP"
                            }));
                        },
                        silent: !0
                    });
                }
                var saveSearchRelationshipCollection = new VSearchList(), saveSearchCollection = new VSearchList();
                saveSearchCollection.url = UrlLinks.saveSearchApiUrl(), saveSearchRelationshipCollection.fullCollection.comparator = function(model) {
                    return model.get("name").toLowerCase();
                };
                var obj = {
                    value: that.value,
                    searchVent: that.searchVent,
                    typeHeaders: that.typeHeaders,
                    fetchCollection: fetchSaveSearchCollection,
                    relationshipDefCollection: that.relationshipDefCollection,
                    getValue: function() {
                        var queryObj = that.value, relationshipObj = that.searchTableFilters.relationshipFilters, urlObj = Utils.getUrlState.getQueryParams(), finalObj = _.extend({}, queryObj, urlObj, {
                            relationshipFilters: relationshipObj ? relationshipObj[queryObj.relationshipName] : null,
                            relationshipName: queryObj.relationshipName,
                            query: queryObj.query
                        });
                        return finalObj;
                    },
                    applyValue: function(model, searchType) {
                        that.manualRender(_.extend(searchType, CommonViewFunction.generateUrlFromSaveSearchObject({
                            value: {
                                searchParameters: model.get("searchParameters"),
                                uiParameters: model.get("uiParameters")
                            },
                            relationshipDefCollection: that.relationshipDefCollection
                        })));
                    }
                };
                that.RSaveSearchRelationship.show(new SaveSearchView(_.extend(obj, {
                    isRelationship: !0,
                    collection: saveSearchRelationshipCollection.fullCollection
                }))), fetchSaveSearchCollection();
            });
        },
        makeFilterButtonActive: function(filtertypeParam) {
            var filterObj = this.searchTableFilters.relationshipFilters[this.value.relationshipName];
            this.value.relationshipName ? (filterObj && filterObj.length ? this.ui.relationshipAttrFilter.addClass("active") : this.ui.relationshipAttrFilter.removeClass("active"), 
            this.ui.relationshipAttrFilter.prop("disabled", !1)) : (this.ui.relationshipAttrFilter.removeClass("active"), 
            this.ui.relationshipAttrFilter.prop("disabled", !0));
        },
        setValues: function(paramObj) {
            paramObj && "relationshipSearch" !== paramObj.from && (this.value = paramObj), this.value && (this.ui.relationshipLov.val(this.value.relationshipName), 
            this.ui.relationshipLov.data("select2") && (this.ui.relationshipLov.val() !== this.value.relationshipName ? (this.value.relationshipName = null, 
            this.ui.relationshipLov.val("").trigger("change", {
                manual: !0
            })) : this.ui.relationshipLov.trigger("change", {
                manual: !0
            })));
        },
        renderRelationshipList: function() {
            var relationStr = "<option></option>";
            this.ui.relationshipLov.empty(), this.relationshipDefCollection.fullCollection.each(function(model) {
                var name = Utils.getName(model.toJSON(), "name");
                relationStr += '<option value="' + name + '" data-name="' + name + '">' + name + "</option>";
            }), this.ui.relationshipLov.html(relationStr);
            this.ui.relationshipLov.select2({
                placeholder: "Select Relationship",
                allowClear: !0
            });
        },
        checkForButtonVisiblity: function(e, options) {
            var isBasicSearch = !0;
            if (this.ui.relationshipAttrFilter.prop("disabled", !0), e && e.currentTarget) {
                var $el = $(e.currentTarget), select2Data = ("relationshipLOV" == $el.data("id"), 
                $el.select2("data"));
                if ("change" === e.type && select2Data) {
                    var value = _.first($(this.ui.relationshipLov).select2("data")).id, key = "relationshipName", filterType = "relationshipFilters";
                    if (value = value && value.length ? value : null, this.value) {
                        if (this.value[key] !== value || !value && !this.value[key]) {
                            var temp = {};
                            temp[key] = value, _.extend(this.value, temp), _.isUndefined(options) && (this.value.pageOffset = 0);
                        } else if (isBasicSearch) {
                            if (filterType) {
                                var filterObj = this.searchTableFilters[filterType];
                                filterObj && this.value[key] && (this.searchTableFilters[filterType][this.value[key]] = this.value[filterType] ? this.value[filterType] : null);
                            }
                            if (this.value.relationshipName) if (this.value.attributes) {
                                var attributes = _.sortBy(this.value.attributes.split(",")), tableColumn = this.searchTableColumns[this.value.type];
                                _.isEmpty(this.searchTableColumns) || !tableColumn ? this.searchTableColumns[this.value.relationshipName] = attributes : tableColumn.join(",") !== attributes.join(",") && (this.searchTableColumns[this.value.relationshipName] = attributes);
                            } else this.searchTableColumns[this.value.relationshipName] && (this.searchTableColumns[this.value.relationshipName] = void 0);
                        }
                        isBasicSearch && filterType && this.makeFilterButtonActive();
                    }
                }
            }
            var value = this.ui.relationshipLov.val();
            value && value.length ? this.ui.searchBtn.removeAttr("disabled") : this.ui.searchBtn.attr("disabled", "true");
        },
        manualRender: function(paramObj) {
            paramObj && (this.value = paramObj), this.renderRelationshipList(), this.setValues(paramObj);
        },
        okAttrFilterButton: function(e) {
            function getIdFromRuleObject(rule) {
                return _.map(rule.rules, function(obj, key) {
                    return _.has(obj, "condition") ? getIdFromRuleObject(obj) : col.push(obj.id);
                }), col;
            }
            var filtertype = (!!this.attrModal.tag, "relationshipFilters"), queryBuilderRef = this.attrModal.RQueryBuilder.currentView.ui.builder, col = [];
            if (queryBuilderRef.data("queryBuilder")) var rule = queryBuilderRef.queryBuilder("getRules");
            if (rule) {
                var ruleUrl = CommonViewFunction.attributeFilter.generateUrl({
                    value: rule,
                    formatedDateToLong: !0
                });
                this.searchTableFilters[filtertype][this.value.relationshipName] = ruleUrl, this.makeFilterButtonActive(), 
                this.value && this.value.relationshipName && this.searchTableColumns && (this.searchTableColumns[this.value.relationshipName] || (this.searchTableColumns[this.value.relationshipName] = [ "name", "typeName", "end1", "end2", "label" ]), 
                this.searchTableColumns[this.value.relationshipName] = _.sortBy(_.union(this.searchTableColumns[this.value.relationshipName], getIdFromRuleObject(rule)))), 
                this.attrModal.modal.close(), $(e.currentTarget).hasClass("search") && this.findSearchResult();
            }
        },
        findSearchResult: function() {
            this.triggerSearch(this.ui.relationshipLov.val()), Globals.fromRelationshipSearch = !0;
        },
        triggerSearch: function(value) {
            var param = {
                relationshipName: value,
                relationshipFilters: null,
                searchType: "basic"
            };
            if (!this.dsl) {
                var relationFilterObj = this.searchTableFilters.relationshipFilters;
                this.value && this.value.relationshipName && (param.relationshipFilters = relationFilterObj[this.value.relationshipName]);
                var columnList = this.value.relationshipName && this.searchTableColumns ? this.searchTableColumns[this.value.relationshipName] : null;
                columnList && (param.attributes = columnList.join(","));
            }
            _.extend(this.value, param), Utils.setUrl({
                url: "#!/relationship/relationshipSearchResult",
                urlParams: _.extend({}, param),
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
        },
        fetchCollection: function(e) {
            this.relationshipDefCollection.fetch({
                reset: !0
            });
        },
        onRefreshButton: function() {
            this.disableRefreshButton();
            var that = this, apiCount = 2, updateSearchList = function() {
                if (0 === apiCount) {
                    that.initializeValues();
                    var checkURLValue = Utils.getUrlState.getQueryParams(that.url);
                    that.searchVent && _.has(checkURLValue, "relationshipName") && that.searchVent.trigger("relationSearch:refresh");
                }
            };
            this.relationshipDefCollection.fetch({
                silent: !0,
                complete: function() {
                    --apiCount, updateSearchList();
                }
            });
        },
        disableRefreshButton: function() {
            var that = this;
            this.ui.refreshBtn.attr("disabled", !0), setTimeout(function() {
                $(that.ui.refreshBtn).attr("disabled", !1);
            }, 1e3);
        },
        openAttrFilter: function() {
            var that = this;
            require([ "views/search/SearchQueryView" ], function(SearchQueryView) {
                that.attrModal = new SearchQueryView({
                    value: that.value,
                    relationship: !0,
                    searchVent: that.searchVent,
                    typeHeaders: that.typeHeaders,
                    entityDefCollection: that.entityDefCollection,
                    enumDefCollection: that.enumDefCollection,
                    classificationDefCollection: that.classificationDefCollection,
                    businessMetadataDefCollection: that.businessMetadataDefCollection,
                    relationshipDefCollection: that.relationshipDefCollection,
                    searchTableFilters: that.searchTableFilters
                }), that.attrModal.on("ok", function(scope, e) {
                    that.okAttrFilterButton(e);
                });
            });
        },
        clearSearchData: function() {
            this.ui.relationshipLov.val("").trigger("change"), this.checkForButtonVisiblity(), 
            this.searchTableFilters.relationshipFilters = {}, this.makeFilterButtonActive();
            var type = "relationshipSaveSearch";
            Utils.setUrl({
                url: "#!/relationship",
                urlParams: {
                    searchType: this.type
                },
                mergeBrowserUrl: !1,
                trigger: !0
            }), this.$("." + type + " .saveSearchList").find("li.active").removeClass("active"), 
            this.$("." + type + ' [data-id="saveBtn"]').attr("disabled", !0);
        }
    });
    return RelationshipSearchLayoutView;
});