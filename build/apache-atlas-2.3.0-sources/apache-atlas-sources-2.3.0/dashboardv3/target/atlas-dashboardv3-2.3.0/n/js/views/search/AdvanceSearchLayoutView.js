define([ "require", "backbone", "hbs!tmpl/search/SearchLayoutView_tmpl", "utils/Utils", "utils/UrlLinks", "utils/Globals", "utils/Enums", "collection/VSearchList", "utils/CommonViewFunction", "jstree" ], function(require, Backbone, SearchLayoutViewTmpl, Utils, UrlLinks, Globals, Enums, VSearchList, CommonViewFunction) {
    "use strict";
    var AdvanceSearchLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "AdvanceSearchLayoutView",
        template: SearchLayoutViewTmpl,
        regions: {},
        ui: {
            searchInput: '[data-id="searchInput"]',
            searchBtn: '[data-id="searchBtn"]',
            clearSearch: '[data-id="clearSearch"]',
            typeLov: '[data-id="typeLOV"]',
            refreshBtn: '[data-id="refreshBtn"]',
            advancedInfoBtn: '[data-id="advancedInfo"]'
        },
        events: function() {
            var events = {}, that = this;
            return events["keyup " + this.ui.searchInput] = function(e) {
                var code = e.which;
                this.query[this.type].query = Globals.advanceSearchData.searchByQuery = e.currentTarget.value, 
                13 == code && (that.findSearchResult(), this.getAdvanceSearchValues()), this.checkForButtonVisiblity();
            }, events["click " + this.ui.searchBtn] = "findSearchResult", events["click " + this.ui.clearSearch] = "clearSearchData", 
            events["change " + this.ui.typeLov] = "checkForButtonVisiblity", events["click " + this.ui.refreshBtn] = "onRefreshButton", 
            events["click " + this.ui.advancedInfoBtn] = "advancedInfo", $(".global-search-container").find("span[data-id='detailSearch']").on("click", function(e) {
                0 === that.$el.height() && (that.renderTypeTagList({
                    filterList: Globals.advanceSearchData.filterTypeSelected,
                    isTypeOnly: !0
                }), that.setAdvanceSearchValues());
            }), events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "value", "typeHeaders", "searchVent", "entityDefCollection", "enumDefCollection", "classificationDefCollection", "searchTableColumns", "searchTableFilters", "metricCollection", "onSubmit")), 
            this.type = "dsl", this.entityCountObj = _.first(this.metricCollection.toJSON()) || {
                entity: {
                    entityActive: {},
                    entityDeleted: {}
                },
                tag: {
                    tagEntities: {}
                }
            }, this.filterTypeSelected = [];
            var param = Utils.getUrlState.getQueryParams();
            this.query = {
                dsl: {
                    query: null,
                    type: null,
                    pageOffset: null,
                    pageLimit: null
                }
            }, this.value || (this.value = {}), param && param.searchType && (this.type = param.searchType, 
            this.updateQueryObject(param)), this.bindEvents();
        },
        bindEvents: function(param) {
            this.listenTo(this.typeHeaders, "reset", function(value) {
                this.initializeValues();
            }, this);
        },
        onRender: function() {
            this.initializeValues(), this.dslFulltextToggle(), this.getAdvanceSearchValues();
        },
        initializeValues: function() {
            this.renderTypeTagList(), this.setValues(), this.checkForButtonVisiblity();
        },
        getAdvanceSearchValues: function() {
            var params = Utils.getUrlState.getQueryParams();
            params && "dsl" === params.searchType && (Globals.advanceSearchData.searchByType = params.type, 
            Globals.advanceSearchData.searchByQuery = params.query, params.filterTypeSelected && (Globals.advanceSearchData.filterTypeSelected = params.filterTypeSelected.split(",")));
        },
        setAdvanceSearchValues: function() {
            this.ui.typeLov.val(Globals.advanceSearchData.searchByType).trigger("change"), this.ui.searchInput.val(Globals.advanceSearchData.searchByQuery);
        },
        checkForButtonVisiblity: function(e, options) {
            var that = this;
            if (e && e.currentTarget) {
                var $el = $(e.currentTarget), select2Data = ("typeLOV" == $el.data("id"), $el.select2("data"));
                if ("change" == e.type && select2Data) {
                    var value = _.isEmpty(select2Data) ? select2Data : _.first(select2Data).id, key = "type";
                    if (Globals.advanceSearchData.searchByType = value, value = value && value.length ? value : null, 
                    this.value && (this.value[key] !== value || !value && !this.value[key])) {
                        var temp = {};
                        temp[key] = value, _.extend(this.value, temp), _.isUndefined(options) && (this.value.pageOffset = 0), 
                        _.extend(this.query[this.type], temp);
                    }
                }
            }
            var value = this.ui.searchInput.val() || _.first($(this.ui.typeLov).select2("data")).id;
            value && value.length ? (this.ui.searchBtn.removeAttr("disabled"), setTimeout(function() {
                !that.isDestroyed && that.ui.searchInput.focus();
            }, 0)) : this.ui.searchBtn.attr("disabled", "true");
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
        fetchCollection: function(value) {
            this.typeHeaders.fetch({
                reset: !0
            });
        },
        onRefreshButton: function() {
            this.fetchCollection(), this.getAdvanceSearchValues();
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
        manualRender: function(paramObj) {
            this.updateQueryObject(paramObj), this.setValues(paramObj);
        },
        getFilterBox: function() {
            var serviceStr = "", serviceArr = [], that = this;
            this.typeHeaders.fullCollection.each(function(model) {
                var serviceType = model.toJSON().serviceType;
                serviceType && serviceArr.push(serviceType);
            }), this.filterTypeSelected = Globals.advanceSearchData.filterTypeSelected, _.each(_.uniq(serviceArr), function(service) {
                serviceStr += '<li><div class="pretty p-switch p-fill"><input type="checkbox" class="pull-left" data-value="' + service + '" value="" ' + (_.contains(that.filterTypeSelected, service) ? "checked" : "") + '/><div class="state p-primary"><label>' + service.toUpperCase() + "</label></div></div></li>";
            });
            var templt = serviceStr + '<hr class="hr-filter"/><div class="text-right"><div class="divider"></div><button class="btn btn-action btn-sm filterDone">Done</button></div>';
            return templt;
        },
        setValues: function(paramObj) {
            var that = this;
            this.setAdvanceSearchValues(), setTimeout(function() {
                !that.isDestroyed && that.ui.searchInput.focus();
            }, 0);
        },
        renderTypeTagList: function(options) {
            var that = this, serviceTypeToBefiltered = options && options.filterList;
            options && options.isTypeOnly;
            this.ui.typeLov.empty();
            var typeStr = "<option></option>";
            this.typeHeaders.fullCollection.each(function(model) {
                var name = Utils.getName(model.toJSON(), "name");
                if ("ENTITY" == model.get("category") && (!serviceTypeToBefiltered || !serviceTypeToBefiltered.length || _.contains(serviceTypeToBefiltered, model.get("serviceType")))) {
                    var entityCount = that.entityCountObj.entity.entityActive[name] + (that.entityCountObj.entity.entityDeleted[name] ? that.entityCountObj.entity.entityDeleted[name] : 0);
                    typeStr += '<option value="' + name + '" data-name="' + name + '">' + name + " " + (entityCount ? "(" + _.numberFormatWithComma(entityCount) + ")" : "") + "</option>";
                }
            }), that.ui.typeLov.html(typeStr);
            var typeLovSelect2 = this.ui.typeLov.select2({
                placeholder: "Select Type",
                dropdownAdapter: $.fn.select2.amd.require("ServiceTypeFilterDropdownAdapter"),
                allowClear: !0,
                dropdownCssClass: "searchLayoutView",
                getFilterBox: this.getFilterBox.bind(this),
                onFilterSubmit: function(options) {
                    that.filterTypeSelected = options.filterVal, Globals.advanceSearchData.filterTypeSelected = that.filterTypeSelected, 
                    that.renderTypeTagList({
                        filterList: options.filterVal,
                        isTypeOnly: !0
                    }), that.checkForButtonVisiblity();
                }
            });
            "undefined" === Globals.advanceSearchData.filterTypeSelected && (typeLovSelect2.on("select2:close", function() {
                typeLovSelect2.trigger("hideFilter");
            }), typeLovSelect2 && serviceTypeToBefiltered && typeLovSelect2.select2("open").trigger("change", {
                manual: !0
            }));
        },
        findSearchResult: function() {
            this.triggerSearch(this.ui.searchInput.val()), this.getAdvanceSearchValues();
        },
        triggerSearch: function(value) {
            var params = {
                searchType: this.type,
                filterTypeSelected: this.filterTypeSelected
            }, typeLovValue = this.ui.typeLov.find(":selected").data("name");
            params.type = typeLovValue || null, Globals.advanceSearchData.searchByType = typeLovValue, 
            Globals.advanceSearchData.searchByQuery = value, _.isUndefinedNull(this.value.pageLimit) || (params.pageLimit = this.value.pageLimit), 
            _.isUndefinedNull(this.value.pageOffset) || (_.isUndefinedNull(this.query[this.type]) || this.query[this.type].query == value ? params.pageOffset = this.value.pageOffset : params.pageOffset = 0), 
            params.query = value || null, _.extend(this.query[this.type], params), this.onSubmit && this.onSubmit(this.query[this.type]), 
            Utils.setUrl({
                url: "#!/search/searchResult",
                urlParams: _.extend({}, this.query[this.type]),
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
        },
        dslFulltextToggle: function() {
            var paramObj = Utils.getUrlState.getQueryParams();
            paramObj && this.type == paramObj.searchType && this.updateQueryObject(paramObj), 
            this.type = "dsl", this.dsl = !0, this.$(".typeFilterBtn,.tagBox,.termBox,.basicSaveSearch").hide(), 
            this.$(".advanceSaveSearch,.searchByText").show(), this.$(".searchText").text("Search By Query"), 
            this.ui.searchInput.attr("placeholder", 'Search By Query eg. where name="sales_fact"');
        },
        clearSearchData: function() {
            this.filterTypeSelected = [], Globals.advanceSearchData = {}, this.renderTypeTagList(), 
            this.updateQueryObject(), this.ui.typeLov.val("").trigger("change"), this.ui.searchInput.val(""), 
            this.checkForButtonVisiblity();
        }
    });
    return AdvanceSearchLayoutView;
});