define([ "require", "backbone", "hbs!tmpl/search/SearchLayoutView_tmpl", "utils/Utils", "utils/UrlLinks", "utils/Globals", "utils/Enums", "collection/VSearchList", "utils/CommonViewFunction", "modules/Modal" ], function(require, Backbone, SearchLayoutViewTmpl, Utils, UrlLinks, Globals, Enums, VSearchList, CommonViewFunction, Modal) {
    "use strict";
    var SearchLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "SearchLayoutView",
        template: SearchLayoutViewTmpl,
        regions: {
            RSaveSearchBasic: "[data-id='r_saveSearchBasic']",
            RSaveSearchAdvance: "[data-id='r_saveSearchAdvance']",
            RRelationSearch: "[data-id='r_relationshipSearch']"
        },
        ui: {
            searchInput: '[data-id="searchInput"]',
            searchType: 'input[name="queryType"]',
            searchBtn: '[data-id="searchBtn"]',
            clearSearch: '[data-id="clearSearch"]',
            typeLov: '[data-id="typeLOV"]',
            tagLov: '[data-id="tagLOV"]',
            termLov: '[data-id="termLOV"]',
            refreshBtn: '[data-id="refreshBtn"]',
            advancedInfoBtn: '[data-id="advancedInfo"]',
            typeAttrFilter: '[data-id="typeAttrFilter"]',
            tagAttrFilter: '[data-id="tagAttrFilter"]',
            tablist: '[data-id="tab-searchlist"] li'
        },
        events: function() {
            var events = {}, that = this;
            return events["keyup " + this.ui.searchInput] = function(e) {
                var code = e.which;
                this.value.query = e.currentTarget.value, this.query[this.type].query = this.value.query, 
                13 == code && that.findSearchResult(), this.checkForButtonVisiblity();
            }, events["change " + this.ui.searchType] = "dslFulltextToggle", events["click " + this.ui.searchBtn] = "findSearchResult", 
            events["click " + this.ui.clearSearch] = "clearSearchData", events["change " + this.ui.typeLov] = "checkForButtonVisiblity", 
            events["change " + this.ui.tagLov] = "checkForButtonVisiblity", events["change " + this.ui.termLov] = "checkForButtonVisiblity", 
            events["click " + this.ui.refreshBtn] = "onRefreshButton", events["click " + this.ui.advancedInfoBtn] = "advancedInfo", 
            events["click " + this.ui.tablist] = function(e) {
                var tabValue = $(e.currentTarget).attr("role"), redirectionUrl = "#!/search";
                this.isRelationSearch = "relationship-search" === tabValue, this.isRelationSearch && (redirectionUrl = "#!/relationship"), 
                Utils.setUrl({
                    url: redirectionUrl,
                    mergeBrowserUrl: !1,
                    trigger: !0,
                    updateTabState: !0
                });
            }, events["click " + this.ui.typeAttrFilter] = function() {
                this.openAttrFilter("type");
            }, events["click " + this.ui.tagAttrFilter] = function() {
                this.openAttrFilter("tag");
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "value", "typeHeaders", "searchVent", "entityDefCollection", "enumDefCollection", "classificationDefCollection", "businessMetadataDefCollection", "searchTableColumns", "searchTableFilters", "metricCollection", "classificationAndMetricEvent")), 
            this.type = "basic", this.entityCountObj = _.first(this.metricCollection.toJSON()) || {
                entity: {
                    entityActive: {},
                    entityDeleted: {}
                },
                tag: {
                    tagEntities: {}
                }
            }, this.selectedFilter = {
                basic: [],
                dsl: []
            }, this.filterTypeSelected = null;
            var param = Utils.getUrlState.getQueryParams();
            this.query = {
                dsl: {
                    query: this.value ? this.value.query : null,
                    type: this.value ? this.value.type : null,
                    pageOffset: this.value ? this.value.pageOffset : null,
                    pageLimit: this.value ? this.value.pageLimit : null
                },
                basic: {
                    query: this.value ? this.value.query : null,
                    type: this.value ? this.value.type : null,
                    tag: this.value ? this.value.tag : null,
                    term: this.value ? this.value.term : null,
                    attributes: this.value ? this.value.attributes : null,
                    tagFilters: this.value ? this.value.tagFilters : null,
                    pageOffset: this.value ? this.value.pageOffset : null,
                    pageLimit: this.value ? this.value.pageLimit : null,
                    entityFilters: this.value ? this.value.entityFilters : null,
                    includeDE: this.value ? this.value.includeDE : null,
                    excludeST: this.value ? this.value.excludeST : null,
                    excludeSC: this.value ? this.value.excludeSC : null
                }
            }, this.value || (this.value = {}), this.dsl = !1, param && param.searchType && (this.type = param.searchType, 
            this.updateQueryObject(param)), this.value && this.value.type || this.value && this.value.tag && "basic" === this.value.searchType ? this.setInitialEntityVal = !1 : this.setInitialEntityVal = !0, 
            this.tagEntityCheck = !1, this.typeEntityCheck = !1, this.bindEvents(), this.isRelationSearch = !1, 
            this.renderRelationshipSearchView();
        },
        renderSaveSearch: function() {
            var that = this;
            require([ "views/search/save/SaveSearchView" ], function(SaveSearchView) {
                function fetchSaveSearchCollection() {
                    saveSearchCollection.fetch({
                        success: function(collection, data) {
                            saveSearchAdvanceCollection.fullCollection.reset(_.where(data, {
                                searchType: "ADVANCED"
                            })), saveSearchBaiscCollection.fullCollection.reset(_.where(data, {
                                searchType: "BASIC"
                            }));
                        },
                        silent: !0
                    });
                }
                var saveSearchBaiscCollection = new VSearchList(), saveSearchAdvanceCollection = new VSearchList(), saveSearchCollection = new VSearchList();
                saveSearchCollection.url = UrlLinks.saveSearchApiUrl(), saveSearchBaiscCollection.fullCollection.comparator = function(model) {
                    return model.get("name").toLowerCase();
                }, saveSearchAdvanceCollection.fullCollection.comparator = function(model) {
                    return model.get("name").toLowerCase();
                };
                var obj = {
                    value: that.value,
                    searchVent: that.searchVent,
                    typeHeaders: that.typeHeaders,
                    fetchCollection: fetchSaveSearchCollection,
                    classificationDefCollection: that.classificationDefCollection,
                    entityDefCollection: that.entityDefCollection,
                    getValue: function() {
                        var queryObj = that.query[that.type], entityObj = that.searchTableFilters.entityFilters, tagObj = that.searchTableFilters.tagFilters, urlObj = Utils.getUrlState.getQueryParams();
                        return urlObj && (urlObj.includeDE = "true" == urlObj.includeDE, urlObj.excludeSC = "true" == urlObj.excludeSC, 
                        urlObj.excludeST = "true" == urlObj.excludeST), _.extend({}, queryObj, urlObj, {
                            entityFilters: entityObj ? entityObj[queryObj.type] : null,
                            tagFilters: tagObj ? tagObj[queryObj.tag] : null,
                            type: queryObj.type,
                            query: queryObj.query,
                            term: queryObj.term,
                            tag: queryObj.tag
                        });
                    },
                    applyValue: function(model, searchType) {
                        that.manualRender(_.extend(searchType, CommonViewFunction.generateUrlFromSaveSearchObject({
                            value: {
                                searchParameters: model.get("searchParameters"),
                                uiParameters: model.get("uiParameters")
                            },
                            classificationDefCollection: that.classificationDefCollection,
                            entityDefCollection: that.entityDefCollection
                        })));
                    }
                };
                that.RSaveSearchBasic.show(new SaveSearchView(_.extend(obj, {
                    isBasic: !0,
                    collection: saveSearchBaiscCollection.fullCollection
                }))), that.RSaveSearchAdvance.show(new SaveSearchView(_.extend(obj, {
                    isBasic: !1,
                    collection: saveSearchAdvanceCollection.fullCollection
                }))), fetchSaveSearchCollection();
            });
        },
        renderRelationshipSearchView: function() {
            var that = this;
            require([ "views/search/RelationSearchLayoutView" ], function(RelationSearchLayoutView) {
                that.RRelationSearch.show(new RelationSearchLayoutView(that.options));
            });
        },
        bindEvents: function(param) {
            var that = this;
            this.listenTo(this.typeHeaders, "reset", function(value) {
                this.initializeValues();
            }, this), this.listenTo(this.searchVent, "entityList:refresh", function(model, response) {
                this.onRefreshButton();
            }, this), this.classificationAndMetricEvent.on("classification:Update:Search", function(options) {
                that.entityCountObj = _.first(that.metricCollection.toJSON()), that.value = Utils.getUrlState.getQueryParams() || {}, 
                that.value.type || (that.setInitialEntityVal = !0), that.initializeValues();
            });
        },
        initializeValues: function() {
            this.renderTypeTagList(), this.renderTermList(), this.setValues(), this.checkForButtonVisiblity(), 
            this.renderSaveSearch(), this.setInitialEntityVal && (this.setInitialEntityVal = !1);
        },
        disableRefreshButton: function() {
            var that = this;
            this.ui.refreshBtn.attr("disabled", !0), setTimeout(function() {
                that.ui.refreshBtn.attr("disabled", !1);
            }, 1e3);
        },
        makeFilterButtonActive: function(filtertypeParam) {
            var filtertype = [ "entityFilters", "tagFilters" ], that = this;
            filtertypeParam && (_.isArray(filtertypeParam) ? filtertype = filtertypeParam : _.isString(filtertypeParam) && (filtertype = [ filtertypeParam ]));
            var typeCheck = function(filterObj, type) {
                that.value.type ? (filterObj && filterObj.length ? that.ui.typeAttrFilter.addClass("active") : that.ui.typeAttrFilter.removeClass("active"), 
                that.ui.typeAttrFilter.prop("disabled", !1)) : (that.ui.typeAttrFilter.removeClass("active"), 
                that.ui.typeAttrFilter.prop("disabled", !0));
            }, tagCheck = function(filterObj, type) {
                var filterAddOn = Enums.addOnClassification.filter(function(a) {
                    a !== Enums.addOnClassification[0];
                });
                that.value.tag && !_.contains(filterAddOn, that.value.tag) ? (that.ui.tagAttrFilter.prop("disabled", !1), 
                filterObj && filterObj.length ? that.ui.tagAttrFilter.addClass("active") : that.ui.tagAttrFilter.removeClass("active")) : (that.ui.tagAttrFilter.removeClass("active"), 
                that.ui.tagAttrFilter.prop("disabled", !0));
            };
            _.each(filtertype, function(type) {
                var filterObj = that.searchTableFilters[type];
                "entityFilters" == type && typeCheck(filterObj[that.value.type], type), "tagFilters" == type && tagCheck(filterObj[that.value.tag], type);
            });
        },
        checkForButtonVisiblity: function(e, options) {
            var that = this, isBasicSearch = "basic" == this.type;
            if (e && e.currentTarget) {
                var $el = $(e.currentTarget), isTagEl = "tagLOV" == $el.data("id"), isTermEl = "termLOV" == $el.data("id"), isTypeEl = "typeLOV" == $el.data("id"), select2Data = $el.select2("data");
                if ("change" == e.type && select2Data) {
                    var value = _.isEmpty(select2Data) ? select2Data : _.first(select2Data).id, key = "tag", filterType = isBasicSearch ? "tagFilters" : null, value = value && value.length ? value : null;
                    if (isTagEl || (key = isTermEl ? "term" : "type", isBasicSearch && (filterType = isTypeEl ? "entityFilters" : null)), 
                    this.value) {
                        if (this.value[key] !== value || !value && !this.value[key]) {
                            var temp = {};
                            temp[key] = value, _.extend(this.value, temp), _.isUndefined(options) && (this.value.pageOffset = 0), 
                            _.extend(this.query[this.type], temp);
                        } else if (isBasicSearch) {
                            if (filterType) {
                                var filterObj = this.searchTableFilters[filterType];
                                filterObj && this.value[key] && (this.searchTableFilters[filterType][this.value[key]] = this.value[filterType] ? this.value[filterType] : null);
                            }
                            if (this.value.type) if (this.value.attributes) {
                                var attributes = _.sortBy(this.value.attributes.split(",")), tableColumn = this.searchTableColumns[this.value.type];
                                _.isEmpty(this.searchTableColumns) || !tableColumn ? this.searchTableColumns[this.value.type] = attributes : tableColumn.join(",") !== attributes.join(",") && (this.searchTableColumns[this.value.type] = attributes);
                            } else this.searchTableColumns[this.value.type] && (this.searchTableColumns[this.value.type] = void 0);
                        }
                        isBasicSearch && filterType && this.makeFilterButtonActive(filterType);
                    } else isBasicSearch && (this.ui.tagAttrFilter.prop("disabled", !0), this.ui.typeAttrFilter.prop("disabled", !0));
                }
            }
            var value = this.ui.searchInput.val() || _.first($(this.ui.typeLov).select2("data")).id;
            if (!this.dsl && _.isEmpty(value)) {
                var termData = _.first($(this.ui.termLov).select2("data"));
                value = _.first($(this.ui.tagLov).select2("data")).id || (termData ? termData.id : "");
            }
            value && value.length ? (this.ui.searchBtn.removeAttr("disabled"), setTimeout(function() {
                that.ui.searchInput.focus();
            }, 0)) : this.ui.searchBtn.attr("disabled", "true");
        },
        onRender: function() {
            this.initializeValues(), this.updateTabState();
        },
        updateTabState: function() {
            if ((Utils.getUrlState.isRelationTab() || Utils.getUrlState.isRelationshipDetailPage()) && !this.isRelationSearch) {
                var tabActive = Utils.getUrlState.isRelationTab() || Utils.getUrlState.isRelationshipDetailPage() ? "relationship-search" : "basic-search";
                this.$(".nav.nav-tabs").find('[role="' + tabActive + '"]').addClass("active").siblings().removeClass("active"), 
                this.$(".tab-content").find('[role="' + tabActive + '"]').addClass("active").siblings().removeClass("active");
            }
        },
        updateQueryObject: function(param) {
            param && param.searchType && (this.type = param.searchType), _.extend(this.query[this.type], "dsl" == this.type ? {
                query: null,
                type: null,
                pageOffset: null,
                pageLimit: null
            } : {
                query: null,
                type: null,
                tag: null,
                term: null,
                attributes: null,
                tagFilters: null,
                pageOffset: null,
                pageLimit: null,
                entityFilters: null,
                includeDE: null
            }, param);
        },
        onRefreshButton: function() {
            this.disableRefreshButton();
            var that = this, apiCount = 2, updateSearchList = function() {
                if (0 === apiCount) {
                    that.initializeValues();
                    var checkURLValue = Utils.getUrlState.getQueryParams(that.url);
                    that.searchVent && (_.has(checkURLValue, "tag") || _.has(checkURLValue, "type") || _.has(checkURLValue, "query")) && that.searchVent.trigger("search:refresh");
                }
            };
            this.metricCollection.fetch({
                complete: function() {
                    --apiCount, that.entityCountObj = _.first(that.metricCollection.toJSON()), updateSearchList();
                }
            }), this.typeHeaders.fetch({
                silent: !0,
                complete: function() {
                    --apiCount, updateSearchList();
                }
            });
        },
        advancedInfo: function(e) {
            require([ "views/search/AdvancedSearchInfoView", "modules/Modal" ], function(AdvancedSearchInfoView, Modal) {
                var view = new AdvancedSearchInfoView(), modal = new Modal({
                    title: "Advanced Search Queries",
                    content: view,
                    okCloses: !0,
                    showFooter: !0,
                    allowCancel: !1
                }).open();
                view.on("closeModal", function() {
                    modal.trigger("cancel");
                });
            });
        },
        openAttrFilter: function(filterType) {
            var that = this;
            require([ "views/search/SearchQueryView" ], function(SearchQueryView) {
                that.attrModal = new SearchQueryView({
                    value: that.value,
                    tag: "tag" === filterType,
                    type: "type" === filterType,
                    searchVent: that.searchVent,
                    typeHeaders: that.typeHeaders,
                    entityDefCollection: that.entityDefCollection,
                    enumDefCollection: that.enumDefCollection,
                    classificationDefCollection: that.classificationDefCollection,
                    businessMetadataDefCollection: that.businessMetadataDefCollection,
                    searchTableFilters: that.searchTableFilters
                }), that.attrModal.on("ok", function(scope, e) {
                    that.okAttrFilterButton(e);
                });
            });
        },
        okAttrFilterButton: function(e) {
            function getIdFromRuleObject(rule) {
                return _.map(rule.rules, function(obj, key) {
                    return _.has(obj, "condition") ? getIdFromRuleObject(obj) : col.push(obj.id);
                }), col;
            }
            var that = this, isTag = !!this.attrModal.tag, filtertype = isTag ? "tagFilters" : "entityFilters", queryBuilderRef = this.attrModal.RQueryBuilder.currentView.ui.builder, col = [];
            if (queryBuilderRef.data("queryBuilder")) var rule = queryBuilderRef.queryBuilder("getRules");
            if (rule) {
                var ruleUrl = CommonViewFunction.attributeFilter.generateUrl({
                    value: rule,
                    formatedDateToLong: !0
                });
                if (this.searchTableFilters[filtertype][isTag ? this.value.tag : this.value.type] = ruleUrl, 
                this.makeFilterButtonActive(filtertype), !isTag && this.value && this.value.type && this.searchTableColumns && (this.searchTableColumns[this.value.type] || (this.searchTableColumns[this.value.type] = [ "selected", "name", "owner", "description", "tag", "typeName" ]), 
                this.searchTableColumns[this.value.type] = _.sortBy(_.union(this.searchTableColumns[this.value.type], getIdFromRuleObject(rule)))), 
                rule.rules) {
                    if (!isTag && !that.tagEntityCheck) {
                        var state = _.find(rule.rules, {
                            id: "__state"
                        });
                        state ? (that.typeEntityCheck = !("ACTIVE" === state.value && "=" === state.operator || "DELETED" === state.value && "!=" === state.operator), 
                        that.value.includeDE = that.typeEntityCheck) : that.typeEntityCheck && (that.typeEntityCheck = !1, 
                        that.tagEntityCheck || (that.value.includeDE = !1));
                    }
                    if (isTag && !that.typeEntityCheck) {
                        var entityStatus = _.find(rule.rules, {
                            id: "__entityStatus"
                        });
                        entityStatus ? (that.tagEntityCheck = !("ACTIVE" === entityStatus.value && "=" === entityStatus.operator || "DELETED" === entityStatus.value && "!=" === entityStatus.operator), 
                        that.value.includeDE = that.tagEntityCheck) : that.tagEntityCheck && (that.tagEntityCheck = !1, 
                        that.typeEntityCheck || (that.value.includeDE = !1));
                    }
                }
                this.attrModal.modal.close(), $(e.currentTarget).hasClass("search") && this.findSearchResult();
            }
        },
        manualRender: function(paramObj) {
            paramObj && (this.value = paramObj), this.updateQueryObject(paramObj), this.renderTypeTagList(), 
            this.setValues(paramObj);
        },
        getFilterBox: function() {
            var serviceStr = "", serviceArr = [], that = this;
            this.typeHeaders.fullCollection.each(function(model) {
                var serviceType = model.toJSON().serviceType;
                serviceType && serviceArr.push(serviceType);
            }), _.each(_.uniq(serviceArr), function(service) {
                serviceStr += '<li><div class="pretty p-switch p-fill"><input type="checkbox" class="pull-left" data-value="' + service + '" value="" ' + (_.contains(that.filterTypeSelected, service) ? "checked" : "") + '/><div class="state p-primary"><label>' + service.toUpperCase() + "</label></div></div></li>";
            });
            var templt = serviceStr + '<hr class="hr-filter"/><div class="text-right"><div class="divider"></div><button class="btn btn-action btn-sm filterDone">Done</button></div>';
            return templt;
        },
        renderTypeTagList: function(options) {
            var that = this, serviceTypeToBefiltered = options && options.filterList, isTypeOnly = options && options.isTypeOnly;
            this.selectedFilter[this.type].length && (serviceTypeToBefiltered = this.selectedFilter[this.type]), 
            this.ui.typeLov.empty();
            var typeStr = "<option></option>", tagStr = typeStr, foundNewClassification = !1;
            if (this.typeHeaders.fullCollection.each(function(model) {
                var name = Utils.getName(model.toJSON(), "name");
                if ("ENTITY" == model.get("category") && (!serviceTypeToBefiltered || !serviceTypeToBefiltered.length || _.contains(serviceTypeToBefiltered, model.get("serviceType")))) {
                    var entityCount = (that.entityCountObj.entity.entityActive[name] || 0) + (that.entityCountObj.entity.entityDeleted[name] || 0);
                    typeStr += '<option value="' + name + '" data-name="' + name + '">' + name + " " + (entityCount ? "(" + _.numberFormatWithComma(entityCount) + ")" : "") + "</option>";
                }
                if (void 0 == isTypeOnly && "CLASSIFICATION" == model.get("category")) {
                    var tagEntityCount = that.entityCountObj.tag.tagEntities[name];
                    that.value && that.value.tag && name === that.value.tag && (foundNewClassification = !0), 
                    tagStr += '<option value="' + name + '" data-name="' + name + '">' + name + " " + (tagEntityCount ? "(" + _.numberFormatWithComma(tagEntityCount) + ")" : "") + "</option>";
                }
            }), "dsl" !== this.type && _.each(Enums.addOnEntities, function(entity) {
                typeStr += '<option  value="' + entity + '" data-name="' + entity + '">' + entity + "</option>";
            }), !foundNewClassification && that.value && that.value.tag) {
                var classificationValue = decodeURIComponent(that.value.tag);
                tagStr += '<option  value="' + classificationValue + '" data-name="' + classificationValue + '">' + classificationValue + "</option>";
            }
            _.isUndefined(isTypeOnly) && (that.value && _.each(Enums.addOnClassification, function(classificationName) {
                classificationName !== that.value.tag && (tagStr += '<option  value="' + classificationName + '" data-name="' + classificationName + '">' + classificationName + "</option>");
            }), that.ui.tagLov.html(tagStr), this.ui.tagLov.select2({
                placeholder: "Select Classification",
                allowClear: !0,
                tags: !0,
                createTag: function(tag) {
                    if (tag.term.indexOf("*") != -1) return {
                        id: tag.term,
                        text: tag.term,
                        isNew: !0
                    };
                }
            })), that.ui.typeLov.html(typeStr);
            var typeLovSelect2 = this.ui.typeLov.select2({
                placeholder: "Select Type",
                dropdownAdapter: $.fn.select2.amd.require("ServiceTypeFilterDropdownAdapter"),
                allowClear: !0,
                getFilterBox: this.getFilterBox.bind(this),
                onFilterSubmit: function(options) {
                    that.selectedFilter[that.type] = options.filterVal, that.filterTypeSelected = that.selectedFilter[that.type], 
                    that.renderTypeTagList({
                        filterList: options.filterVal,
                        isTypeOnly: !0
                    }), that.checkForButtonVisiblity();
                }
            });
            if ("undefined" === this.value.filterTypeSelected && (typeLovSelect2.on("select2:close", function() {
                typeLovSelect2.trigger("hideFilter");
            }), typeLovSelect2 && isTypeOnly && typeLovSelect2.select2("open").trigger("change", {
                manual: !0
            })), that.setInitialEntityVal) {
                var defaultEntity = Enums.addOnEntities[0];
                that.value.type = defaultEntity, that.ui.typeLov.val(defaultEntity, null);
            }
        },
        renderTermList: function() {
            this.glossaryTermArray = null;
            var that = this, getTypeAheadData = function(data, params) {
                var dataList = data.entities, foundOptions = [];
                return _.each(dataList, function(obj) {
                    obj && (obj.guid && (obj.id = obj.attributes.qualifiedName), foundOptions.push(obj));
                }), foundOptions;
            };
            this.ui.termLov.select2({
                placeholder: "Search Term",
                allowClear: !0,
                ajax: {
                    url: UrlLinks.searchApiUrl("attribute"),
                    dataType: "json",
                    delay: 250,
                    data: function(params) {
                        return {
                            attrValuePrefix: params.term,
                            typeName: "AtlasGlossaryTerm",
                            limit: 10,
                            offset: 0
                        };
                    },
                    processResults: function(data, params) {
                        return that.glossaryTermArray = getTypeAheadData(data, params), {
                            results: getTypeAheadData(data, params)
                        };
                    },
                    cache: !0
                },
                templateResult: function(option) {
                    var name = Utils.getName(option, "qualifiedName");
                    return "-" === name ? option.text : name;
                },
                templateSelection: function(option) {
                    var name = Utils.getName(option, "qualifiedName");
                    return "-" === name ? option.text : name;
                },
                escapeMarkup: function(markup) {
                    return markup;
                },
                minimumInputLength: 1
            });
        },
        setValues: function(paramObj) {
            var that = this;
            paramObj && (this.value = paramObj), this.value.filterTypeSelected && (this.filterTypeSelected = this.value.filterTypeSelected.split(","), 
            this.renderTypeTagList({
                filterList: this.filterTypeSelected,
                isTypeOnly: !0
            }), this.ui.typeLov.val(this.value.type)), this.value && (this.ui.searchInput.val(this.value.query || ""), 
            "true" == this.value.dslChecked || "dsl" === this.value.searchType ? this.ui.searchType.prop("checked") || this.ui.searchType.prop("checked", !0).trigger("change") : this.ui.searchType.prop("checked") && this.ui.searchType.prop("checked", !1).trigger("change"), 
            this.ui.typeLov.val(this.value.type), this.ui.typeLov.data("select2") && (this.ui.typeLov.val() !== this.value.type ? (this.value.type = null, 
            this.ui.typeLov.val("").trigger("change", {
                manual: !0
            })) : this.ui.typeLov.trigger("change", {
                manual: !0
            })), this.dsl || (this.ui.tagLov.val(this.value.tag), this.ui.tagLov.data("select2") && (this.ui.tagLov.val() !== this.value.tag ? (this.value.tag = null, 
            this.ui.tagLov.val("").trigger("change", {
                manual: !0
            })) : this.ui.tagLov.trigger("change", {
                manual: !0
            })), this.value.term && this.ui.termLov.append('<option value="' + _.escape(this.value.term) + '" selected="selected">' + _.escape(this.value.term) + "</option>"), 
            this.ui.termLov.data("select2") && (this.ui.termLov.val() !== this.value.term ? (this.value.term = null, 
            this.ui.termLov.val("").trigger("change", {
                manual: !0
            })) : this.ui.termLov.trigger("change", {
                manual: !0
            }))), setTimeout(function() {
                that.ui.searchInput.focus();
            }, 0));
        },
        findSearchResult: function() {
            this.triggerSearch(this.ui.searchInput.val()), Globals.fromRelationshipSearch = !1;
        },
        getSearchedTermGuid: function() {
            var searchedTerm = this.ui.termLov.select2("val"), searchedTermGuid = null;
            return searchedTerm && this.glossaryTermArray.find(function(obj) {
                searchedTerm === obj.id && (searchedTermGuid = obj.guid);
            }), searchedTermGuid;
        },
        triggerSearch: function(value) {
            var params = {
                searchType: this.type,
                dslChecked: this.ui.searchType.is(":checked"),
                tagFilters: null,
                entityFilters: null,
                filterTypeSelected: this.filterTypeSelected
            }, typeLovValue = this.ui.typeLov.find(":selected").data("name"), tagLovValue = this.ui.tagLov.find(":selected").data("name") || this.ui.tagLov.val(), termLovValue = this.ui.termLov.select2("val");
            if (params.type = typeLovValue || null, !this.dsl) {
                params.tag = tagLovValue || null, params.term = termLovValue || null, params.guid = this.getSearchedTermGuid();
                var entityFilterObj = this.searchTableFilters.entityFilters, tagFilterObj = this.searchTableFilters.tagFilters;
                if (params.includeDE = !1, params.excludeST = !1, params.excludeSC = !1, this.value) {
                    this.value.tag && (params.tagFilters = tagFilterObj[this.value.tag]), this.value.type && (params.entityFilters = entityFilterObj[this.value.type]);
                    var columnList = this.value.type && this.searchTableColumns ? this.searchTableColumns[this.value.type] : null;
                    params.attributes = columnList ? columnList.join(",") : null, params.includeDE = !_.isUndefinedNull(this.value.includeDE) && this.value.includeDE, 
                    params.excludeST = !_.isUndefinedNull(this.value.excludeST) && this.value.excludeST, 
                    params.excludeSC = !_.isUndefinedNull(this.value.excludeSC) && this.value.excludeSC;
                }
            }
            this.value && !_.isUndefinedNull(this.value.pageLimit) && (params.pageLimit = this.value.pageLimit), 
            this.value && !_.isUndefinedNull(this.value.pageOffset) && (_.isUndefinedNull(this.query[this.type]) || this.query[this.type].query == value ? params.pageOffset = this.value.pageOffset : params.pageOffset = 0), 
            params.query = value || null, _.extend(this.query[this.type], params), Utils.setUrl({
                url: "#!/search/searchResult",
                urlParams: _.extend({}, this.query[this.type]),
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
        },
        dslFulltextToggle: function(e) {
            var paramObj = Utils.getUrlState.getQueryParams();
            paramObj && this.type == paramObj.searchType && this.updateQueryObject(paramObj), 
            e.currentTarget.checked ? (this.type = "dsl", this.dsl = !0, this.$(".typeFilterBtn,.tagBox,.termBox,.basicSaveSearch").hide(), 
            this.$(".typeFilter").addClass("col-sm-12"), this.$(".typeFilter").removeClass("col-sm-10"), 
            this.$(".advanceSaveSearch").show(), this.$(".searchText").text("Search By Query"), 
            this.ui.searchInput.attr("placeholder", 'Search By Query eg. where name="sales_fact"')) : (this.$(".typeFilter").addClass("col-sm-10"), 
            this.$(".typeFilter").removeClass("col-sm-12"), this.$(".typeFilterBtn,.tagBox,.termBox,.basicSaveSearch").show(), 
            this.$(".advanceSaveSearch").hide(), this.dsl = !1, this.type = "basic", this.$(".searchText").text("Search By Text"), 
            this.ui.searchInput.attr("placeholder", "Search By Text")), Utils.getUrlState.isSearchTab() && Utils.setUrl({
                url: "#!/search/searchResult",
                urlParams: _.extend(this.query[this.type], {
                    searchType: this.type,
                    dslChecked: this.ui.searchType.is(":checked")
                }),
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
        },
        clearSearchData: function() {
            this.selectedFilter[this.type] = [], this.filterTypeSelected = [], this.renderTypeTagList(), 
            this.updateQueryObject(), this.ui.typeLov.val("").trigger("change"), this.ui.tagLov.val("").trigger("change"), 
            this.ui.searchInput.val("");
            var type = "basicSaveSearch";
            "dsl" == this.type && (type = "advanceSaveSearch"), this.$("." + type + " .saveSearchList").find("li.active").removeClass("active"), 
            this.$("." + type + ' [data-id="saveBtn"]').attr("disabled", !0), this.dsl || (this.searchTableFilters.tagFilters = {}, 
            this.searchTableFilters.entityFilters = {}), this.checkForButtonVisiblity(), Utils.setUrl({
                url: "#!/search/searchResult",
                urlParams: {
                    searchType: this.type,
                    dslChecked: this.ui.searchType.is(":checked")
                },
                mergeBrowserUrl: !1,
                trigger: !0
            });
        }
    });
    return SearchLayoutView;
});