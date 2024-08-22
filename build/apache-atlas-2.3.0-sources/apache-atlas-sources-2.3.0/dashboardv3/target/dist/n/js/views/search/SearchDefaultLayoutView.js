define([ "require", "backbone", "utils/Globals", "hbs!tmpl/search/SearchDefaultLayoutView_tmpl", "utils/Utils", "utils/CommonViewFunction", "utils/Enums" ], function(require, Backbone, Globals, SearchDefaultLayoutViewTmpl, Utils, CommonViewFunction, Enums) {
    "use strict";
    var SearchDefaultlLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "SearchDefaultlLayoutView",
        template: SearchDefaultLayoutViewTmpl,
        regions: {
            RGlobalSearchLayoutView: "#r_globalSearchLayoutView",
            RSearchResultLayoutView: "#r_searchResultLayoutView",
            RQueryBuilderEntity: "#r_attributeQueryBuilderEntity",
            RQueryBuilderClassification: "#r_attributeQueryBuilderClassification",
            RQueryBuilderRelationship: "#r_attributeQueryBuilderRelationship"
        },
        ui: {
            resizable: '[data-id="resizable"]',
            attrFilter: "[data-id='attrFilter']",
            attrApply: "[data-id='attrApply']",
            attrClose: "[data-id='attrClose']",
            entityRegion: "[data-id='entityRegion']",
            classificationRegion: "[data-id='classificationRegion']",
            relationshipRegion: "[data-id='relationshipRegion']",
            checkDeletedEntity: "[data-id='checkDeletedEntity']",
            checkSubClassification: "[data-id='checkSubClassification']",
            checkSubType: "[data-id='checkSubType']",
            entityName: ".entityName",
            relationshipName: ".relationshipName",
            classificationName: ".classificationName",
            createNewEntity: '[data-id="createNewEntity"]',
            clearQuerySearch: "[data-id='clearQuerySearch']",
            refreshSearchQuery: "[data-id='refreshSearchResult']",
            includeExclude: "[data-id='includeExclude']"
        },
        events: function() {
            var events = {}, that = this;
            return events["click " + this.ui.attrFilter] = function(e) {
                this.$(".attribute-filter-container").hasClass("hide") ? (this.onClickAttrFilter(), 
                this.$(".attributeResultContainer").addClass("overlay")) : this.$(".attributeResultContainer").removeClass("overlay"), 
                this.$(".fa-angle-right").toggleClass("fa-angle-down"), this.$(".attribute-filter-container, .attr-filter-overlay").toggleClass("hide");
            }, events["click " + this.ui.refreshSearchQuery] = function(e) {
                Utils.getUrlState.isSearchTab() && this.options.searchVent.trigger("search:refresh"), 
                Utils.getUrlState.isRelationTab() && this.options.searchVent.trigger("relationSearch:refresh"), 
                this.disableRefreshButton();
            }, events["click " + this.ui.attrApply] = function(e) {
                that.okAttrFilterButton(e);
            }, events["click " + this.ui.attrClose] = function(e) {
                this.$(".attributeResultContainer").removeClass("overlay"), this.$(".fa-angle-right").toggleClass("fa-angle-down"), 
                this.$(".attribute-filter-container, .attr-filter-overlay").toggleClass("hide");
            }, events["click .clear-attr"] = function(e) {
                var type = $(e.currentTarget).data("type"), that = this;
                switch (type) {
                  case "entityFilters":
                    that.filtersQueryUpdate(e, !1, !1);
                    break;

                  case "tagFilters":
                    that.filtersQueryUpdate(e, !0, !1);
                    break;

                  case "relationshipFilters":
                    that.filtersQueryUpdate(e, !1, !0);

                  default:
                    this.options.value[type] = null;
                }
                this.searchAttrFilter();
            }, events["click " + this.ui.clearQuerySearch] = function(e) {
                var notifyObj = {
                    modal: !0,
                    ok: function(argument) {
                        "dsl" === Utils.getUrlState.getQueryParams().searchType && (Globals.advanceSearchData = {}), 
                        Utils.setUrl({
                            url: "#!/search",
                            mergeBrowserUrl: !1,
                            trigger: !0,
                            updateTabState: !0
                        });
                    },
                    cancel: function(argument) {}
                };
                notifyObj.text = "Search parameters will be reset and you will return to the default search page. Continue?", 
                Utils.notifyConfirm(notifyObj);
            }, events["click " + this.ui.createNewEntity] = "onCreateNewEntity", events["click " + this.ui.checkDeletedEntity] = "onCheckExcludeIncludeResult", 
            events["click " + this.ui.checkSubClassification] = "onCheckExcludeIncludeResult", 
            events["click " + this.ui.checkSubType] = "onCheckExcludeIncludeResult", events;
        },
        templateHelpers: function() {
            return {
                entityCreate: Globals.entityCreate
            };
        },
        initialize: function(options) {
            _.extend(this.options, options), this.hidenFilter = !1, this.tagAttributeLength = 0, 
            this.entityAttributeLength = 0, this.relationshipAttributeLength = 0, this.tagEntityCheck = !1, 
            this.typeEntityCheck = !1;
        },
        bindEvents: function() {},
        onRender: function() {
            this.toggleLayoutClass = this.$(".col-sm-9.f-right, .col-sm-12.f-right"), this.renderGlobalSearch(), 
            Utils.getUrlState.isRelationSearch() || this.renderSearchResult(), Utils.getUrlState.isRelationSearch() && this.renderRelationSearchResult(), 
            this.updateView(), this.ui.entityRegion.hide(), this.ui.classificationRegion.hide(), 
            this.ui.relationshipRegion.hide();
        },
        filtersQueryUpdate: function(e, isTag, isRelationship) {
            var filters = CommonViewFunction.attributeFilter.extractUrl({
                value: isTag ? this.options.value.tagFilters : isRelationship ? this.options.value.relationshipFilters : this.options.value.entityFilters,
                formatDate: !0
            }), rules = filters.rules, filtertype = isTag ? "tagFilters" : isRelationship ? "relationshipFilters" : "entityFilters", that = this;
            filters.rules = _.filter(rules, function(obj, key) {
                return obj.id + key != $(e.currentTarget).data("id");
            }), filters && that.updateFilterOptions(filters, filtertype, isTag), 0 == filters.rules.length && (isTag && !isRelationship ? this.options.searchTableFilters.tagFilters[that.options.value.tag] = "" : isRelationship ? this.options.searchTableFilters.relationshipFilters[that.options.value.relationshipName] = "" : this.options.searchTableFilters.entityFilters[that.options.value.type] = "");
        },
        disableRefreshButton: function() {
            var that = this;
            this.ui.refreshSearchQuery.attr("disabled", !0), setTimeout(function() {
                that.ui.refreshSearchQuery.attr("disabled", !1);
            }, 1e3);
        },
        onCheckExcludeIncludeResult: function(e) {
            var flag = !1, val = $(e.currentTarget).attr("data-value");
            e.target.checked && (flag = !0), this.options.value && (this.options.value[val] = flag);
        },
        onCreateNewEntity: function(e) {
            var that = this;
            require([ "views/entity/CreateEntityLayoutView" ], function(CreateEntityLayoutView) {
                new CreateEntityLayoutView({
                    entityDefCollection: that.options.entityDefCollection,
                    typeHeaders: that.options.typeHeaders,
                    searchVent: that.options.searchVent,
                    callback: function() {}
                });
            });
        },
        updateView: function() {
            this.options.fromSearchResultView ? (this.$('.search-container,[data-id="createEntity"]').hide(), 
            $("body").removeClass("ui-autocomplete-small-height"), this.$(".searchResultContainer,.attributeResultContainer").show()) : (this.$('.search-container,[data-id="createEntity"]').show(), 
            $("body").addClass("ui-autocomplete-small-height"), this.$(".searchResultContainer,.attributeResultContainer").hide());
        },
        manualRender: function(options) {
            _.extend(this.options, options), this.updateView(), this.onClickAttrFilter(), Utils.getUrlState.isRelationSearch() || this.renderSearchResult(), 
            Utils.getUrlState.isRelationSearch() && this.renderRelationSearchResult();
        },
        renderGlobalSearch: function() {
            var that = this;
            require([ "views/search/GlobalSearchLayoutView" ], function(GlobalSearchLayoutView) {
                that.RGlobalSearchLayoutView.show(new GlobalSearchLayoutView(_.extend({
                    closeOnSubmit: !0
                }, _.omit(that.options, "value"))));
            });
        },
        renderSearchResult: function() {
            var that = this;
            require([ "views/search/SearchResultLayoutView" ], function(SearchResultLayoutView) {
                that.RSearchResultLayoutView.show(new SearchResultLayoutView(that.options));
            });
        },
        renderRelationSearchResult: function() {
            var that = this;
            require([ "views/search/RelationSearchResultLayoutView" ], function(RelationSearchResultLayoutView) {
                that.RSearchResultLayoutView.show(new RelationSearchResultLayoutView(that.options));
            });
        },
        checkEntityFilter: function(options) {
            return options && options.value && (options.value.type && options.value.entityFilters && (options.searchTableFilters.entityFilters[options.value.type] = options.value.entityFilters), 
            options.value.tag && options.value.tagFilters && (options.searchTableFilters.tagFilters[options.value.tag] = options.value.tagFilters)), 
            options.searchTableFilters;
        },
        onClickAttrFilter: function() {
            var that = this, obj = {
                value: that.options.value,
                relationship: !!Utils.getUrlState.isRelationSearch(),
                searchVent: that.options.searchVent,
                entityDefCollection: that.options.entityDefCollection,
                enumDefCollection: that.options.enumDefCollection,
                typeHeaders: that.options.typeHeaders,
                classificationDefCollection: that.options.classificationDefCollection,
                businessMetadataDefCollection: that.options.businessMetadataDefCollection,
                relationshipDefCollection: that.options.relationshipDefCollection,
                searchTableFilters: that.checkEntityFilter(that.options)
            };
            if (this.tagEntityCheck = !1, this.typeEntityCheck = !1, that.options.value) {
                if (this.ui.checkDeletedEntity.prop("checked", !!this.options.value.includeDE && this.options.value.includeDE), 
                this.ui.checkSubClassification.prop("checked", !!this.options.value.excludeSC && this.options.value.excludeSC), 
                this.ui.checkSubType.prop("checked", !!this.options.value.excludeST && this.options.value.excludeST), 
                that.options.value.tag && that.options.value.type ? (this.$(".attribute-filter-container").removeClass("no-attr"), 
                this.ui.classificationRegion.show(), this.ui.entityRegion.show()) : (that.options.value.tag || that.options.value.type || this.$(".attribute-filter-container").addClass("no-attr"), 
                this.ui.entityRegion.hide(), this.ui.classificationRegion.hide()), that.options.value.tag) {
                    this.ui.classificationRegion.show(), this.ui.includeExclude.show();
                    var attrTagObj = that.options.classificationDefCollection.fullCollection.find({
                        name: that.options.value.tag
                    });
                    attrTagObj && (attrTagObj = Utils.getNestedSuperTypeObj({
                        data: attrTagObj.toJSON(),
                        collection: that.options.classificationDefCollection,
                        attrMerge: !0
                    }), this.tagAttributeLength = attrTagObj.length), (Globals[that.options.value.tag] || Globals[Enums.addOnClassification[0]]) && (obj.systemAttrArr = (Globals[that.options.value.tag] || Globals[Enums.addOnClassification[0]]).attributeDefs, 
                    this.tagAttributeLength = obj.systemAttrArr.length), this.renderQueryBuilder(_.extend({}, obj, {
                        tag: !0,
                        type: !1,
                        attrObj: attrTagObj
                    }), this.RQueryBuilderClassification), this.ui.classificationName.html(that.options.value.tag);
                }
                if (that.options.value.type) {
                    this.ui.entityRegion.show(), this.ui.includeExclude.show();
                    var attrTypeObj = that.options.entityDefCollection.fullCollection.find({
                        name: that.options.value.type
                    });
                    attrTypeObj && (attrTypeObj = Utils.getNestedSuperTypeObj({
                        data: attrTypeObj.toJSON(),
                        collection: that.options.entityDefCollection,
                        attrMerge: !0
                    }), this.entityAttributeLength = attrTypeObj.length), (Globals[that.options.value.type] || Globals[Enums.addOnEntities[0]]) && (obj.systemAttrArr = (Globals[that.options.value.type] || Globals[Enums.addOnEntities[0]]).attributeDefs, 
                    this.entityAttributeLength = obj.systemAttrArr.length), this.renderQueryBuilder(_.extend({}, obj, {
                        tag: !1,
                        type: !0,
                        attrObj: attrTypeObj
                    }), this.RQueryBuilderEntity), this.ui.entityName.html(_.escape(that.options.value.type));
                }
                if (that.options.value.relationshipName) {
                    this.ui.relationshipRegion.show(), this.ui.includeExclude.hide();
                    var attrTypeObj = that.options.relationshipDefCollection.fullCollection.find({
                        name: that.options.value.relationshipName
                    });
                    attrTypeObj && (attrTypeObj = Utils.getNestedSuperTypeObj({
                        data: attrTypeObj.toJSON(),
                        collection: that.options.relationshipDefCollection,
                        attrMerge: !0
                    }), this.relationshipAttributeLength = attrTypeObj.length), this.renderQueryBuilder(_.extend({}, obj, {
                        tag: !1,
                        type: !1,
                        relation: !0,
                        attrObj: attrTypeObj
                    }), this.RQueryBuilderRelationship), this.ui.relationshipName.html(_.escape(that.options.value.relationshipName));
                }
            }
        },
        okAttrFilterButton: function(e) {
            function searchAttribute() {
                var queryBuilderObj = queryBuilderRef.data("queryBuilder");
                if (queryBuilderObj) {
                    var ruleWithInvalid = queryBuilderObj.getRules({
                        allow_invalid: !0
                    }), rule = queryBuilderObj.getRules();
                    if (rule ? that.updateFilterOptions(rule, filtertype, isTag) : isFilterValidate = !1, 
                    ruleWithInvalid && 1 === ruleWithInvalid.rules.length && null === ruleWithInvalid.rules[0].id && (isFilterValidate = !0, 
                    queryBuilderObj.clearErrors()), rule && rule.rules) {
                        if (!that.tagEntityCheck) {
                            var state = _.find(rule.rules, {
                                id: "__state"
                            });
                            state && (that.typeEntityCheck = !("ACTIVE" === state.value && "=" === state.operator || "DELETED" === state.value && "!=" === state.operator), 
                            that.options.value.includeDE = that.typeEntityCheck);
                        }
                        if (!that.typeEntityCheck) {
                            var entityStatus = _.find(rule.rules, {
                                id: "__entityStatus"
                            });
                            entityStatus && (that.tagEntityCheck = !("ACTIVE" === entityStatus.value && "=" === entityStatus.operator || "DELETED" === entityStatus.value && "!=" === entityStatus.operator), 
                            that.options.value.includeDE = that.tagEntityCheck);
                        }
                    }
                }
            }
            function filterPopupStatus() {
                isFilterValidate && $(e.currentTarget).hasClass("search") && (that.$(".fa-angle-right").toggleClass("fa-angle-down"), 
                that.$(".attribute-filter-container, .attr-filter-overlay").toggleClass("hide"), 
                that.searchAttrFilter(), that.$(".attributeResultContainer").removeClass("overlay"));
            }
            var isTag, isRelationship, filtertype, queryBuilderRef, isFilterValidate = !0, that = this;
            this.options.value.tag && (isTag = !0, filtertype = isTag ? "tagFilters" : "entityFilters", 
            0 !== this.tagAttributeLength && (queryBuilderRef = this.RQueryBuilderClassification.currentView.ui.builder, 
            searchAttribute())), this.options.value.type && (isTag = !1, filtertype = isTag ? "tagFilters" : "entityFilters", 
            0 !== this.entityAttributeLength && (queryBuilderRef = this.RQueryBuilderEntity.currentView.ui.builder, 
            searchAttribute())), this.options.value.relationshipName && (isTag = !1, isRelationship = !0, 
            filtertype = "relationshipFilters", 0 !== this.relationshipAttributeLength && (queryBuilderRef = this.RQueryBuilderRelationship.currentView.ui.builder, 
            searchAttribute())), filterPopupStatus();
        },
        getIdFromRuleObj: function(rule) {
            var that = this, col = new Set();
            return _.map(rule.rules, function(obj, key) {
                return _.has(obj, "condition") ? that.getIdFromRuleObj(obj) : col.add(obj.id);
            }), Array.from(col);
        },
        updateFilterOptions: function(rule, filtertype, isTag) {
            var ruleUrl = CommonViewFunction.attributeFilter.generateUrl({
                value: rule,
                formatedDateToLong: !0
            });
            "relationshipFilters" === filtertype ? this.options.searchTableFilters[filtertype][this.options.value.relationshipName] = ruleUrl : this.options.searchTableFilters[filtertype][isTag ? this.options.value.tag : this.options.value.type] = ruleUrl, 
            !isTag && this.options.value && this.options.value.type && this.options.searchTableColumns && (this.options.searchTableColumns[this.options.value.type] || (this.options.searchTableColumns[this.options.value.type] = [ "selected", "name", "description", "typeName", "owner", "tag", "term" ]), 
            this.options.searchTableColumns[this.options.value.type] = _.sortBy(_.union(_.without(this.options.searchTableColumns[this.options.value.type]), this.getIdFromRuleObj(rule)))), 
            !isTag && this.options.value && this.options.value.relationshipName && this.options.searchTableColumns && (this.options.searchTableColumns[this.options.value.relationshipName] || (this.options.searchTableColumns[this.options.value.relationshipName] = [ "name", "typeName", "end1", "end2", "label" ]), 
            this.options.searchTableColumns[this.options.value.relationshipName] = _.sortBy(_.union(this.options.searchTableColumns[this.options.value.relationshipName], this.getIdFromRuleObj(rule))));
        },
        renderQueryBuilder: function(obj, rQueryBuilder) {
            require([ "views/search/QueryBuilderView" ], function(QueryBuilderView) {
                rQueryBuilder.show(new QueryBuilderView(obj));
            });
        },
        searchAttrFilter: function() {
            var updatedUrl, entityFilterObj = (this.options.value.type || this.options.value.tag || this.options.value.relationshipName, 
            this.options.searchTableFilters.entityFilters), tagFilterObj = this.options.searchTableFilters.tagFilters, relationshipFilterObj = this.options.searchTableFilters.relationshipFilters, params = {
                searchType: "basic",
                dslChecked: !1,
                tagFilters: null,
                entityFilters: null,
                relationshipFilterObj: null,
                query: null,
                type: null,
                tag: null,
                term: null,
                attributes: null,
                pageOffset: null,
                pageLimit: null,
                includeDE: null
            };
            if (this.options.value) {
                this.options.value.tag && (params.tag = this.options.value.tag), this.options.value.type && (params.type = this.options.value.type), 
                this.options.value.relationshipName && (params.relationshipName = this.options.value.relationshipName), 
                this.options.value.term && (params.term = this.options.value.term), this.options.value.query && (params.query = this.options.value.query);
                var columnList = this.options.value && this.options.value.type && this.options.searchTableColumns ? this.options.searchTableColumns[this.options.value.type] : null;
                params.attributes = columnList ? columnList.join(",") : null, params.includeDE = !_.isUndefinedNull(this.options.value.includeDE) && this.options.value.includeDE, 
                params.excludeST = !_.isUndefinedNull(this.options.value.excludeST) && this.options.value.excludeST, 
                params.excludeSC = !_.isUndefinedNull(this.options.value.excludeSC) && this.options.value.excludeSC;
            }
            entityFilterObj && (params.entityFilters = entityFilterObj[this.options.value.type]), 
            tagFilterObj && (params.tagFilters = tagFilterObj[this.options.value.tag]), relationshipFilterObj && (params.relationshipFilters = relationshipFilterObj[this.options.value.relationshipName]), 
            params.pageOffset = 0, this.options.value.tag || this.options.value.type || this.options.value.term || this.options.value.query ? updatedUrl = "#!/search/searchResult" : (params.tag = null, 
            params.type = null, params.term = null, params.query = null, params.attributes = null, 
            params.includeDE = null, params.excludeST = null, params.excludeSC = null, updatedUrl = "#!/search"), 
            this.options.value.relationshipName && (updatedUrl = "#!/relationship/relationshipSearchResult"), 
            Utils.setUrl({
                url: updatedUrl,
                urlParams: _.extend({}, params),
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
            var paramObj = Utils.getUrlState.getQueryParams();
            this.options.value = paramObj;
        }
    });
    return SearchDefaultlLayoutView;
});