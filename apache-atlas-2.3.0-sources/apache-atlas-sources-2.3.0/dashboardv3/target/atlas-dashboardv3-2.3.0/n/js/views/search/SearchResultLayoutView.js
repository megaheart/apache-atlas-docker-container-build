define([ "require", "backbone", "table-dragger", "hbs!tmpl/search/SearchResultLayoutView_tmpl", "modules/Modal", "models/VEntity", "utils/Utils", "utils/Globals", "collection/VSearchList", "models/VCommon", "utils/CommonViewFunction", "utils/Messages", "utils/Enums", "utils/UrlLinks", "moment", "platform" ], function(require, Backbone, tableDragger, SearchResultLayoutViewTmpl, Modal, VEntity, Utils, Globals, VSearchList, VCommon, CommonViewFunction, Messages, Enums, UrlLinks, moment, platform) {
    "use strict";
    var SearchResultLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "SearchResultLayoutView",
        template: SearchResultLayoutViewTmpl,
        regions: {
            REntityTableLayoutView: "#r_searchResultTableLayoutView",
            RSearchQuery: "#r_searchQuery"
        },
        ui: {
            tagClick: '[data-id="tagClick"]',
            termClick: '[data-id="termClick"]',
            addTag: '[data-id="addTag"]',
            addTerm: '[data-id="addTerm"]',
            paginationDiv: '[data-id="paginationDiv"]',
            previousData: "[data-id='previousData']",
            nextData: "[data-id='nextData']",
            pageRecordText: "[data-id='pageRecordText']",
            addAssignTag: "[data-id='addAssignTag']",
            addAssignTerm: "[data-id='addAssignTerm']",
            createEntity: "[data-id='createEntity']",
            checkDeletedEntity: "[data-id='checkDeletedEntity']",
            checkSubClassification: "[data-id='checkSubClassification']",
            checkSubType: "[data-id='checkSubType']",
            colManager: "[data-id='colManager']",
            containerCheckBox: "[data-id='containerCheckBox']",
            columnEmptyInfo: "[data-id='columnEmptyInfo']",
            showPage: "[data-id='showPage']",
            gotoPage: "[data-id='gotoPage']",
            gotoPagebtn: "[data-id='gotoPagebtn']",
            activePage: "[data-id='activePage']",
            saveFilter: "[data-id='saveFilter']",
            excludeSubtypes: ".exclude-subtypes",
            excludeSubClassifications: ".exclude-subclassifications"
        },
        templateHelpers: function() {
            return {
                entityCreate: Globals.entityCreate,
                searchType: this.searchType,
                fromView: this.fromView,
                isGlossaryView: "glossary" == this.fromView,
                isSearchTab: Utils.getUrlState.isSearchTab()
            };
        },
        events: function() {
            var events = {}, that = this;
            return events["click " + this.ui.tagClick] = function(e) {
                var scope = $(e.currentTarget);
                "i" == e.target.nodeName.toLocaleLowerCase() ? this.onClickTagCross(e) : (this.triggerUrl({
                    url: "#!/tag/tagAttribute/" + scope.text().split("@")[0],
                    urlParams: null,
                    mergeBrowserUrl: !1,
                    trigger: !0,
                    updateTabState: !0
                }), console.log(Globals));
            }, events["click " + this.ui.termClick] = function(e) {
                var scope = $(e.currentTarget);
                "i" == e.target.nodeName.toLocaleLowerCase() ? this.onClickTermCross(e) : this.triggerUrl({
                    url: "#!/glossary/" + scope.find("i").data("termguid"),
                    urlParams: {
                        gType: "term",
                        viewType: "term",
                        fromView: "entity"
                    },
                    mergeBrowserUrl: !1,
                    trigger: !0,
                    updateTabState: null
                });
            }, events["keyup " + this.ui.gotoPage] = function(e) {
                var code = e.which;
                parseInt(e.currentTarget.value);
                e.currentTarget.value ? that.ui.gotoPagebtn.attr("disabled", !1) : that.ui.gotoPagebtn.attr("disabled", !0), 
                13 == code && e.currentTarget.value && that.gotoPagebtn();
            }, events["change " + this.ui.showPage] = "changePageLimit", events["click " + this.ui.gotoPagebtn] = "gotoPagebtn", 
            events["click " + this.ui.addTag] = "onClickAddTag", events["click " + this.ui.addTerm] = "onClickAddTermBtn", 
            events["click " + this.ui.addAssignTag] = "onClickAddTag", events["click " + this.ui.addAssignTerm] = "onClickAddTermBtn", 
            events["click " + this.ui.nextData] = "onClicknextData", events["click " + this.ui.previousData] = "onClickpreviousData", 
            events["click " + this.ui.createEntity] = "onClickCreateEntity", events["click " + this.ui.checkDeletedEntity] = "onCheckExcludeIncludeResult", 
            events["click " + this.ui.checkSubClassification] = "onCheckExcludeIncludeResult", 
            events["click " + this.ui.checkSubType] = "onCheckExcludeIncludeResult", events["click " + this.ui.saveFilter] = function() {
                this.searchVent && this.searchVent.trigger("Save:Filter");
            }, events;
        },
        initialize: function(options) {
            if (_.extend(this, _.pick(options, "value", "guid", "initialView", "isTypeTagNotExists", "classificationDefCollection", "entityDefCollection", "typeHeaders", "searchVent", "categoryEvent", "enumDefCollection", "tagCollection", "searchTableColumns", "isTableDropDisable", "fromView", "glossaryCollection", "termName", "businessMetadataDefCollection", "profileDBView")), 
            this.entityModel = new VEntity(), this.searchCollection = new VSearchList(), this.limit = 25, 
            this.asyncFetchCounter = 0, this.offset = 0, this.bindEvents(), this.multiSelectEntity = [], 
            this.activeEntityCountSelected = 0, this.searchType = "Basic Search", this.columnOrder = null, 
            this.defaultColumns = [ "selected", "name", "description", "typeName", "owner", "tag", "term" ], 
            this.value) {
                if (this.value.searchType && "dsl" == this.value.searchType && (this.searchType = "Advanced Search"), 
                this.value.pageLimit) {
                    var pageLimit = parseInt(this.value.pageLimit, 10);
                    _.isNaN(pageLimit) || 0 == pageLimit || pageLimit <= -1 ? (this.value.pageLimit = this.limit, 
                    this.triggerUrl()) : this.limit = pageLimit;
                }
                if (this.value.pageOffset) {
                    var pageOffset = parseInt(this.value.pageOffset, 10);
                    _.isNaN(pageOffset) || pageLimit <= -1 ? (this.value.pageOffset = this.offset, this.triggerUrl()) : this.offset = pageOffset;
                }
            }
            "IE" === platform.name && (this.isTableDropDisable = !0);
        },
        bindEvents: function() {
            var that = this;
            this.onClickLoadMore(), this.listenTo(this.searchCollection, "backgrid:selected", function(model, checked) {
                this.multiSelectEntity = [], that.activeEntityCountSelected = 0, checked === !0 ? model.set("isEnable", !0) : model.set("isEnable", !1), 
                this.searchCollection.find(function(item) {
                    if (item.get("isEnable")) {
                        var obj = item.toJSON();
                        "ACTIVE" === item.get("status") && that.activeEntityCountSelected++, that.multiSelectEntity.push({
                            id: obj.guid,
                            model: obj
                        });
                    }
                }), this.updateMultiSelect();
            }), this.listenTo(this.searchCollection, "error", function(model, response) {
                if (this.hideLoader({
                    type: "error"
                }), 0 === response.readyState) return void Utils.notifyError({
                    content: "Request aborted"
                });
                var responseJSON = response && response.responseJSON ? response.responseJSON : null, errorText = responseJSON && (responseJSON.errorMessage || responseJSON.message || responseJSON.error || responseJSON.msgDesc) || "Something went wrong";
                errorText && (Utils.notifyError({
                    content: errorText
                }), this.$(".searchTable > .well").html("<center>" + errorText + "</center>"));
            }, this), this.listenTo(this.searchCollection, "state-changed", function(state) {
                if (Utils.getUrlState.isSearchTab()) {
                    this.updateColumnList(state);
                    var excludeDefaultColumn = [];
                    this.value && this.value.type && (excludeDefaultColumn = _.difference(this.searchTableColumns[this.value.type], this.defaultColumns), 
                    null === this.searchTableColumns[this.value.type] ? this.ui.columnEmptyInfo.show() : this.ui.columnEmptyInfo.hide()), 
                    this.columnOrder = this.getColumnOrder(this.REntityTableLayoutView.$el.find(".colSort th.renderable")), 
                    this.triggerUrl();
                    var attributes = this.searchCollection.filterObj.attributes;
                    excludeDefaultColumn && attributes && (excludeDefaultColumn.length > attributes.length || _.difference(excludeDefaultColumn, attributes).length) && this.fetchCollection(this.value);
                }
            }, this), this.listenTo(this.searchVent, "search:refresh", function(model, response) {
                this.fetchCollection();
            }, this), this.listenTo(this.searchCollection, "backgrid:sorted", function(model, response) {
                this.checkTableFetch();
            }, this), this.listenTo(this.categoryEvent, "Sucess:TermSearchResultPage", function() {
                this.glossaryCollection.fetch({
                    reset: !0
                });
            });
        },
        onRender: function() {
            if (Utils.getUrlState.isSearchTab() && this.$(".action-box").hide(), this.checkEntityImage = {}, 
            this.commonTableOptions = {
                collection: this.searchCollection,
                includePagination: !1,
                includeFooterRecords: !1,
                includeColumnManager: !(!Utils.getUrlState.isSearchTab() || !this.value || "basic" !== this.value.searchType || this.profileDBView),
                includeOrderAbleColumns: !1,
                includeSizeAbleColumns: !1,
                includeTableLoader: !1,
                includeAtlasTableSorting: !0,
                showDefaultTableSorted: !0,
                updateFullCollectionManually: !0,
                columnOpts: {
                    opts: {
                        initialColumnsVisible: null,
                        saveState: !1
                    },
                    visibilityControlOpts: {
                        buttonTemplate: _.template("<button class='btn btn-action btn-sm pull-right'>Columns&nbsp<i class='fa fa-caret-down'></i></button>")
                    },
                    el: this.ui.colManager
                },
                gridOpts: {
                    emptyText: "No Records found!",
                    className: "table table-hover backgrid table-quickMenu colSort"
                },
                sortOpts: {
                    sortColumn: "name",
                    sortDirection: "ascending"
                },
                filterOpts: {},
                paginatorOpts: {}
            }, this.initialView) Globals.entityTypeConfList && this.$(".entityLink").show(), 
            this.isTypeTagNotExists && Utils.notifyError({
                content: Messages.search.notExists
            }); else {
                var value = {};
                this.value ? (value = this.value, value && value.includeDE && this.ui.checkDeletedEntity.prop("checked", !0), 
                value && value.excludeSC && this.ui.checkSubClassification.prop("checked", !0), 
                value && value.excludeST && this.ui.checkSubType.prop("checked", !0)) : value = {
                    query: null,
                    searchType: "basic"
                }, this.updateColumnList(), this.value && this.searchTableColumns && null === this.searchTableColumns[this.value.type] ? this.ui.columnEmptyInfo.show() : this.ui.columnEmptyInfo.hide(), 
                this.fetchCollection(value, _.extend({
                    fromUrl: !0
                }, this.value && this.value.pageOffset ? {
                    next: !0
                } : null)), this.ui.showPage.select2({
                    data: _.sortBy(_.union([ 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500 ], [ this.limit ])),
                    tags: !0,
                    dropdownCssClass: "number-input",
                    multiple: !1
                }), this.value && this.value.pageLimit && this.ui.showPage.val(this.limit).trigger("change", {
                    skipViewChange: !0
                });
            }
        },
        getColumnOrderWithPosition: function() {
            var that = this;
            return _.map(that.columnOrder, function(value, key) {
                return key + "::" + value;
            }).join(",");
        },
        triggerUrl: function(options) {
            Utils.setUrl(_.extend({
                url: Utils.getUrlState.getQueryUrl().queyParams[0],
                urlParams: this.columnOrder ? _.extend(this.value, {
                    uiParameters: this.getColumnOrderWithPosition()
                }) : this.value,
                mergeBrowserUrl: !1,
                trigger: !1,
                updateTabState: !0
            }, options));
        },
        updateMultiSelect: function() {
            var addTermTagButton = this.$(".multiSelectTag,.multiSelectTerm");
            this.activeEntityCountSelected > 0 ? addTermTagButton.show() : addTermTagButton.hide();
        },
        updateColumnList: function(updatedList) {
            if (updatedList) {
                var listOfColumns = [];
                _.map(updatedList, function(obj) {
                    obj.name;
                    obj.renderable && listOfColumns.push(obj.name);
                }), listOfColumns = _.sortBy(listOfColumns), this.value.attributes = listOfColumns.length ? listOfColumns.join(",") : null, 
                this.value && (this.value.type || this.value.tag) && this.searchTableColumns && (this.searchTableColumns[this.value.type || this.value.tag] = listOfColumns.length ? listOfColumns : null);
            } else this.value && (this.value.type || this.value.tag) && this.searchTableColumns && this.value.attributes && (this.searchTableColumns[this.value.type || this.value.tag] = this.value.attributes.split(","));
        },
        fetchCollection: function(value, options) {
            var that = this, isPostMethod = this.value && "basic" === this.value.searchType, isSearchTab = Utils.getUrlState.isSearchTab(), tagFilters = null, entityFilters = null;
            if (that.activeEntityCountSelected = 0, that.updateMultiSelect(), isSearchTab && (tagFilters = CommonViewFunction.attributeFilter.generateAPIObj(this.value.tagFilters), 
            entityFilters = CommonViewFunction.attributeFilter.generateAPIObj(this.value.entityFilters)), 
            isPostMethod && isSearchTab) var excludeDefaultColumn = (this.value.type || this.value.tag) && this.searchTableColumns ? _.difference(this.searchTableColumns[this.value.type || this.value.tag], this.defaultColumns) : null, filterObj = {
                entityFilters: entityFilters,
                tagFilters: tagFilters,
                attributes: excludeDefaultColumn ? excludeDefaultColumn : null
            };
            this.showLoader(), Globals.searchApiCallRef && 1 === Globals.searchApiCallRef.readyState && Globals.searchApiCallRef.abort();
            var apiObj = {
                skipDefaultError: !0,
                sort: !1,
                success: function(dataOrCollection, response) {
                    if (!that.isDestroyed) {
                        Globals.searchApiCallRef = void 0;
                        var isFirstPage = 0 === that.offset, dataLength = 0, goToPage = that.ui.gotoPage.val();
                        if (that.ui.gotoPage.val(""), that.ui.gotoPage.parent().removeClass("has-error"), 
                        that.ui.gotoPagebtn.prop("disabled", !0), that.ui.pageRecordText instanceof jQuery) {
                            if (dataLength = isPostMethod && dataOrCollection && dataOrCollection.entities ? dataOrCollection.entities.length : dataOrCollection.length, 
                            !dataLength && that.offset >= that.limit && (options && options.next || goToPage) && options && !options.fromUrl) {
                                that.hideLoader();
                                var pageNumber = that.activePage + 1;
                                return goToPage ? (pageNumber = goToPage, that.offset = (that.activePage - 1) * that.limit) : (that.finalPage = that.activePage, 
                                that.ui.nextData.attr("disabled", !0), that.offset = that.offset - that.limit), 
                                that.value && (that.value.pageOffset = that.offset, that.triggerUrl()), void Utils.notifyInfo({
                                    html: !0,
                                    content: Messages.search.noRecordForPage + "<b>" + Utils.getNumberSuffix({
                                        number: pageNumber,
                                        sup: !0
                                    }) + "</b> page"
                                });
                            }
                            if (isPostMethod && (Utils.findAndMergeRefEntity({
                                attributeObject: dataOrCollection.entities,
                                referredEntities: dataOrCollection.referredEntities
                            }), that.searchCollection.reset(dataOrCollection.entities, {
                                silent: !0
                            }), that.searchCollection.fullCollection.reset(dataOrCollection.entities, {
                                silent: !0
                            })), dataLength < that.limit ? that.ui.nextData.attr("disabled", !0) : that.ui.nextData.attr("disabled", !1), 
                            isFirstPage && (!dataLength || dataLength < that.limit) ? that.ui.paginationDiv.hide() : that.ui.paginationDiv.show(), 
                            isFirstPage ? (that.ui.previousData.attr("disabled", !0), that.pageFrom = 1, that.pageTo = that.limit) : that.ui.previousData.attr("disabled", !1), 
                            options && options.next ? (that.pageTo = that.offset + that.limit, that.pageFrom = that.offset + 1) : !isFirstPage && options && options.previous && (that.pageTo = that.pageTo - that.limit, 
                            that.pageFrom = that.pageTo - that.limit + 1), that.ui.pageRecordText.html("Showing  <u>" + that.searchCollection.models.length + " records</u> From " + that.pageFrom + " - " + that.pageTo), 
                            that.activePage = Math.round(that.pageTo / that.limit), that.ui.activePage.attr("title", "Page " + that.activePage), 
                            that.ui.activePage.text(that.activePage), that.renderTableLayoutView(), that.multiSelectEntity = [], 
                            dataLength > 0 && that.$(".searchTable").removeClass("noData"), Utils.getUrlState.isSearchTab() && value && !that.profileDBView) {
                                var isCapsuleView = !0, searchString = '<span class="filterQuery">' + CommonViewFunction.generateQueryOfFilter(that.value, isCapsuleView) + "</span>";
                                Globals.entityCreate && Globals.entityTypeConfList && Utils.getUrlState.isSearchTab(), 
                                that.$(".searchResult").html(searchString);
                            }
                        }
                    }
                },
                silent: !0,
                reset: !0
            };
            if (this.value) var checkBoxValue = {
                excludeDeletedEntities: !this.value.includeDE,
                includeSubClassifications: !this.value.excludeSC,
                includeSubTypes: !this.value.excludeST,
                includeClassificationAttributes: !0
            };
            if (value) {
                if (value.searchType && (this.searchCollection.url = UrlLinks.searchApiUrl(value.searchType)), 
                _.extend(this.searchCollection.queryParams, {
                    limit: this.limit,
                    offset: this.offset,
                    query: _.trim(value.query),
                    typeName: value.type || null,
                    classification: value.tag || null,
                    termName: value.term || null
                }), this.profileDBView && value.typeName && value.guid) {
                    var profileParam = {};
                    profileParam.guid = value.guid, profileParam.relation = "hive_db" === value.typeName ? "__hive_table.db" : "__hbase_table.namespace", 
                    profileParam.sortBy = "name", profileParam.sortOrder = "ASCENDING", _.extend(this.searchCollection.queryParams, profileParam);
                }
                isPostMethod ? (this.searchCollection.filterObj = _.extend({}, filterObj), apiObj.data = _.extend(checkBoxValue, filterObj, _.pick(this.searchCollection.queryParams, "query", "excludeDeletedEntities", "limit", "offset", "typeName", "classification", "termName")), 
                Globals.searchApiCallRef = this.searchCollection.getBasicRearchResult(apiObj)) : (apiObj.data = null, 
                this.searchCollection.filterObj = null, this.profileDBView && _.extend(this.searchCollection.queryParams, checkBoxValue), 
                Globals.searchApiCallRef = this.searchCollection.fetch(apiObj));
            } else _.extend(this.searchCollection.queryParams, {
                limit: this.limit,
                offset: this.offset
            }), isPostMethod ? (apiObj.data = _.extend(checkBoxValue, filterObj, _.pick(this.searchCollection.queryParams, "query", "excludeDeletedEntities", "limit", "offset", "typeName", "classification", "termName")), 
            Globals.searchApiCallRef = this.searchCollection.getBasicRearchResult(apiObj)) : (apiObj.data = null, 
            this.profileDBView && _.extend(this.searchCollection.queryParams, checkBoxValue), 
            Globals.searchApiCallRef = this.searchCollection.fetch(apiObj));
        },
        tableRender: function(options) {
            var that = this, savedColumnOrder = options.order, TableLayout = options.table, columnCollection = Backgrid.Columns.extend({
                sortKey: "displayOrder",
                className: "my-awesome-css-animated-grid",
                comparator: function(item) {
                    return item.get(this.sortKey) || 999;
                },
                setPositions: function() {
                    return _.each(this.models, function(model, index) {
                        model.set("displayOrder", (null == savedColumnOrder ? index : parseInt(savedColumnOrder[model.get("label")])) + 1, {
                            silent: !0
                        });
                    }), this;
                }
            }), columns = new columnCollection(that.searchCollection.dynamicTable ? that.getDaynamicColumns(that.searchCollection.toJSON()) : that.getFixedDslColumn());
            if (columns.setPositions().sort(), "Advanced Search" == this.searchType && columns.length && that.searchCollection.length) {
                var tableColumnNames = Object.keys(that.searchCollection.toJSON()[0]);
                that.commonTableOptions.sortOpts = {
                    sortColumn: tableColumnNames[0],
                    sortDirection: "ascending"
                };
            }
            var table = new TableLayout(_.extend({}, that.commonTableOptions, {
                columns: columns
            }));
            if (0 === table.collection.length && that.$(".searchTable").addClass("noData"), 
            that.REntityTableLayoutView) {
                if (that.value || (that.value = that.options.value), that.REntityTableLayoutView.show(table), 
                "dsl" !== that.value.searchType ? that.ui.containerCheckBox.show() : that.ui.containerCheckBox.hide(), 
                that.$(".ellipsis-with-margin .inputAssignTag").hide(), table.trigger("grid:refresh"), 
                that.isTableDropDisable !== !0) {
                    var tableDropFunction = function(from, to, el) {
                        tableDragger(document.querySelector(".colSort")).destroy(), that.columnOrder = that.getColumnOrder(el.querySelectorAll("th.renderable")), 
                        that.triggerUrl(), that.tableRender({
                            order: that.columnOrder,
                            table: TableLayout
                        }), that.checkTableFetch();
                    };
                    that.REntityTableLayoutView.$el.find(".colSort thead tr th:not(.select-all-header-cell)").addClass("dragHandler"), 
                    tableDragger(document.querySelector(".colSort"), {
                        dragHandler: ".dragHandler"
                    }).on("drop", tableDropFunction);
                }
                Utils.getUrlState.isGlossaryTab() ? (this.ui.excludeSubtypes.hide(), this.ui.excludeSubClassifications.hide()) : this.ui.excludeSubtypes.hide();
            }
        },
        renderTableLayoutView: function(col) {
            var that = this;
            require([ "utils/TableLayout" ], function(TableLayout) {
                if (that.value.uiParameters) var savedColumnOrder = _.object(that.value.uiParameters.split(",").map(function(a) {
                    return a.split("::");
                }));
                that.tableRender({
                    order: savedColumnOrder,
                    table: TableLayout
                }), that.checkTableFetch();
            });
        },
        getColumnOrder: function(arr) {
            for (var obj = {}, i = 0; i < arr.length; ++i) {
                var innerText = arr[i].innerText.trim();
                obj["" == innerText ? "Select" : innerText] = i;
            }
            return obj;
        },
        checkTableFetch: function() {
            this.asyncFetchCounter <= 0 && (this.hideLoader(), Utils.generatePopover({
                el: this.$('[data-id="showMoreLess"]'),
                contentClass: "popover-tag-term",
                viewFixedPopover: !0,
                popoverOptions: {
                    container: null,
                    content: function() {
                        return $(this).find(".popup-tag-term").children().clone();
                    }
                }
            }));
        },
        getFixedDslColumn: function() {
            var that = this, columnToShow = null, col = {};
            if (this.value = Utils.getUrlState.getQueryParams() || this.value, this.value && "basic" === this.value.searchType && this.searchTableColumns && void 0 !== this.searchTableColumns[this.value.type || this.value.tag] && (columnToShow = null == this.searchTableColumns[this.value.type || this.value.tag] ? [] : this.searchTableColumns[this.value.type || this.value.tag]), 
            col.Check = {
                name: "selected",
                label: "Select",
                cell: "select-row",
                resizeable: !1,
                orderable: !1,
                alwaysVisible: !0,
                renderable: !columnToShow || _.contains(columnToShow, "selected"),
                headerCell: "select-all"
            }, col.name = {
                label: this.value && this.profileDBView ? "Table Name" : "Name",
                cell: "html",
                editable: !1,
                resizeable: !0,
                orderable: !1,
                renderable: !0,
                className: "searchTableName",
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function(rawValue, model) {
                        var obj = model.toJSON(), nameHtml = "", name = Utils.getName(obj);
                        if (obj.attributes && void 0 !== obj.attributes.serviceType) void 0 === Globals.serviceTypeMap[obj.typeName] && (Globals.serviceTypeMap[obj.typeName] = obj.attributes ? obj.attributes.serviceType : null); else if (void 0 === Globals.serviceTypeMap[obj.typeName] && that.entityDefCollection) {
                            var defObj = that.entityDefCollection.fullCollection.find({
                                name: obj.typeName
                            });
                            defObj && (Globals.serviceTypeMap[obj.typeName] = defObj.get("serviceType"));
                        }
                        obj.serviceType = Globals.serviceTypeMap[obj.typeName], nameHtml = obj.guid ? "-1" == obj.guid ? '<span title="' + name + '">' + name + "</span>" : '<a title="' + name + '" href="#!/detailPage/' + obj.guid + (that.fromView ? "?from=" + that.fromView : "") + '">' + name + "</a>" : '<span title="' + name + '">' + name + "</span>", 
                        obj.status && Enums.entityStateReadOnly[obj.status] && (nameHtml += '<button type="button" title="Deleted" class="btn btn-action btn-md deleteBtn"><i class="fa fa-trash"></i></button>', 
                        nameHtml = '<div class="readOnly readOnlyLink">' + nameHtml + "</div>");
                        var getImageData = function(options) {
                            var imagePath = options.imagePath, returnImgUrl = null;
                            that.checkEntityImage[model.get("guid")] = !1, $.ajax({
                                url: imagePath,
                                method: "get",
                                cache: !0
                            }).always(function(data, status, xhr) {
                                404 == data.status ? returnImgUrl = getImageData({
                                    imagePath: Utils.getEntityIconPath({
                                        entityData: obj,
                                        errorUrl: imagePath
                                    })
                                }) : data && (that.checkEntityImage[model.get("guid")] = imagePath, returnImgUrl = imagePath, 
                                that.$("img[data-imgGuid='" + obj.guid + "']").removeClass("searchTableLogoLoader").attr("src", imagePath));
                            });
                        }, img = "";
                        return img = "<div><img data-imgGuid='" + obj.guid + "' class='searchTableLogoLoader'></div>", 
                        void 0 == that.checkEntityImage[model.get("guid")] ? getImageData({
                            imagePath: Utils.getEntityIconPath({
                                entityData: obj
                            })
                        }) : 0 != that.checkEntityImage[model.get("guid")] && (img = "<div><img data-imgGuid='" + obj.guid + "' src='" + that.checkEntityImage[model.get("guid")] + "'></div>"), 
                        img + nameHtml;
                    }
                })
            }, col.owner = {
                label: "Owner",
                cell: "String",
                editable: !1,
                resizeable: !0,
                orderable: !0,
                renderable: !0,
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function(rawValue, model) {
                        var obj = model.toJSON();
                        if (obj && obj.attributes && obj.attributes.owner) return obj.attributes.owner;
                    }
                })
            }, this.value && this.profileDBView && (col.createTime = {
                label: "Date Created",
                cell: "Html",
                editable: !1,
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function(rawValue, model) {
                        var obj = model.toJSON();
                        return obj && obj.attributes && obj.attributes.createTime ? Utils.formatDate({
                            date: obj.attributes.createTime
                        }) : "-";
                    }
                })
            }), this.value && !this.profileDBView && (col.description = {
                label: "Description",
                cell: "String",
                editable: !1,
                resizeable: !0,
                orderable: !0,
                renderable: !0,
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function(rawValue, model) {
                        var obj = model.toJSON();
                        if (obj && obj.attributes && obj.attributes.description) return obj.attributes.description;
                    }
                })
            }, col.typeName = {
                label: "Type",
                cell: "Html",
                editable: !1,
                resizeable: !0,
                orderable: !0,
                renderable: !columnToShow || _.contains(columnToShow, "typeName"),
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function(rawValue, model) {
                        var obj = model.toJSON();
                        if (obj && obj.typeName) return '<a title="Search ' + obj.typeName + '" href="#!/search/searchResult?type=' + obj.typeName + '&searchType=basic">' + obj.typeName + "</a>";
                    }
                })
            }, this.getTagCol({
                col: col,
                columnToShow: columnToShow
            }), _.contains([ "glossary" ], this.fromView) || this.getTermCol({
                col: col,
                columnToShow: columnToShow
            }), this.value && "basic" === this.value.searchType)) {
                var def = this.entityDefCollection.fullCollection.find({
                    name: this.value.type
                }), systemAttr = [], businessMetadataAttr = [], businessAttributes = {};
                if ("_ALL_ENTITY_TYPES" == this.value.type ? this.businessMetadataDefCollection.each(function(model) {
                    var sortedAttributes = model.get("attributeDefs") || null, name = model.get("name");
                    sortedAttributes && (sortedAttributes = _.sortBy(sortedAttributes, function(obj) {
                        return obj.name;
                    }), businessAttributes[name] = $.extend(!0, {}, sortedAttributes));
                }) : businessAttributes = def ? $.extend(!0, {}, def.get("businessAttributeDefs")) || null : null, 
                def || Globals[this.value.type] || (this.value.tag ? Globals[this.value.tag] ? Globals[this.value.tag] : Globals[Enums.addOnClassification[0]] : void 0)) {
                    var attrObj = def ? Utils.getNestedSuperTypeObj({
                        data: def.toJSON(),
                        collection: this.entityDefCollection,
                        attrMerge: !0
                    }) : [];
                    this.value.type && (Globals[this.value.type] || Globals[Enums.addOnEntities[0]]) && (systemAttr = (Globals[this.value.type] || Globals[Enums.addOnEntities[0]]).attributeDefs), 
                    this.value.tag && (Globals[this.value.tag] || Globals[Enums.addOnClassification[0]]) && (systemAttr = (Globals[this.value.tag] || Globals[Enums.addOnClassification[0]]).attributeDefs), 
                    attrObj = attrObj.concat(systemAttr), businessAttributes && _.each(businessAttributes, function(businessMetadata, businessMetadataName) {
                        _.each(businessMetadata, function(attr, index) {
                            var attribute = attr;
                            attribute.isBusinessAttributes = !0, attribute.name = businessMetadataName + "." + attribute.name, 
                            businessMetadataAttr.push(attribute);
                        });
                    }), attrObj = attrObj.concat(businessMetadataAttr), _.each(attrObj, function(obj, key) {
                        var key = obj.name, isRenderable = _.contains(columnToShow, key), isSortable = obj.typeName.search(/(array|map)/i) == -1;
                        return "name" == key || "description" == key || "owner" == key ? void (columnToShow && (col[key].renderable = isRenderable)) : void ("__historicalGuids" != key && "__classificationsText" != key && "__classificationNames" != key && "__propagatedClassificationNames" != key && (col[obj.name] = {
                            label: Enums.systemAttributes[obj.name] ? Enums.systemAttributes[obj.name] : _.escape(obj.isBusinessAttributes ? obj.name : obj.name.capitalize()),
                            cell: "Html",
                            headerCell: Backgrid.HeaderHTMLDecodeCell,
                            editable: !1,
                            resizeable: !0,
                            orderable: !0,
                            sortable: isSortable,
                            renderable: isRenderable,
                            headerClassName: obj.isBusinessAttributes ? "no-capitalize" : "",
                            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                                fromRaw: function(rawValue, model) {
                                    var modelObj = model.toJSON();
                                    if (modelObj && modelObj.attributes && !_.isUndefined(modelObj.attributes[key])) {
                                        var tempObj = {
                                            scope: that,
                                            attributeDefs: [ obj ],
                                            valueObject: {},
                                            isTable: !1
                                        };
                                        if ("__labels" == key) {
                                            var values = modelObj.attributes[key] ? modelObj.attributes[key].split("|") : null, valueOfArray = [];
                                            if (values) return "" === values[values.length - 1] && values.pop(), "" === values[0] && values.shift(), 
                                            _.each(values, function(names) {
                                                valueOfArray.push('<span class="json-string"><a class="btn btn-action btn-sm btn-blue btn-icon" ><span>' + _.escape(names) + "</span></a></span>");
                                            }), valueOfArray.join(" ");
                                        }
                                        if ("__customAttributes" == key) {
                                            var customAttributes = modelObj.attributes[key] ? JSON.parse(modelObj.attributes[key]) : null, valueOfArray = [];
                                            if (customAttributes) return _.each(Object.keys(customAttributes), function(value, index) {
                                                valueOfArray.push('<span class="json-string"><a class="btn btn-action btn-sm btn-blue btn-icon" ><span><span>' + _.escape(value) + "</span> : <span>" + _.escape(Object.values(customAttributes)[index]) + "</span></span></a></span>");
                                            }), valueOfArray.join(" ");
                                        }
                                        tempObj.valueObject[key] = modelObj.attributes[key];
                                        var tablecolumn = CommonViewFunction.propertyTable(tempObj);
                                        if (_.isArray(modelObj.attributes[key])) {
                                            var column = $("<div>" + tablecolumn + "</div>");
                                            return tempObj.valueObject[key].length > 2 && column.addClass("toggleList semi-collapsed").append("<span><a data-id='load-more-columns'>Show More</a></span>"), 
                                            column;
                                        }
                                        return tablecolumn;
                                    }
                                }
                            })
                        }));
                    });
                }
            }
            return this.searchCollection.constructor.getTableCols(col, this.searchCollection);
        },
        onClickLoadMore: function() {
            this.$el.on("click", "[data-id='load-more-columns']", function(event) {
                event.stopPropagation(), event.stopImmediatePropagation();
                var $this = $(this), $toggleList = $(this).parents(".toggleList");
                $toggleList.length && ($toggleList.hasClass("semi-collapsed") ? ($toggleList.removeClass("semi-collapsed"), 
                $this.text("Show Less")) : ($toggleList.addClass("semi-collapsed"), $this.text("Show More")));
            });
        },
        getDaynamicColumns: function(valueObj) {
            var that = this, col = {};
            if (valueObj && valueObj.length) {
                var firstObj = _.first(valueObj);
                _.each(_.keys(firstObj), function(key) {
                    col[key] = {
                        label: key.capitalize(),
                        cell: "Html",
                        editable: !1,
                        resizeable: !0,
                        orderable: !0,
                        formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                            fromRaw: function(rawValue, model) {
                                var modelObj = model.toJSON();
                                if ("name" == key) {
                                    var nameHtml = "", name = _.escape(modelObj[key]);
                                    return nameHtml = modelObj.guid ? '<a title="' + name + '" href="#!/detailPage/' + modelObj.guid + (that.fromView ? "?from=" + that.fromView : "") + '">' + name + "</a>" : '<span title="' + name + '">' + name + "</span>", 
                                    modelObj.status && Enums.entityStateReadOnly[modelObj.status] ? (nameHtml += '<button type="button" title="Deleted" class="btn btn-action btn-md deleteBtn"><i class="fa fa-trash"></i></button>', 
                                    '<div class="readOnly readOnlyLink">' + nameHtml + "</div>") : nameHtml;
                                }
                                if (modelObj && !_.isUndefined(modelObj[key])) {
                                    var tempObj = {
                                        scope: that,
                                        valueObject: {},
                                        isTable: !1
                                    };
                                    return tempObj.valueObject[key] = modelObj[key], CommonViewFunction.propertyTable(tempObj);
                                }
                            }
                        })
                    };
                });
            }
            return this.searchCollection.constructor.getTableCols(col, this.searchCollection);
        },
        getTagCol: function(options) {
            var that = this, columnToShow = options.columnToShow, col = options.col;
            col && (col.tag = {
                label: "Classifications",
                cell: "Html",
                editable: !1,
                sortable: !1,
                resizeable: !0,
                orderable: !0,
                renderable: !columnToShow || _.contains(columnToShow, "tag"),
                className: "searchTag",
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function(rawValue, model) {
                        var obj = model.toJSON();
                        if ("-1" != obj.guid) return obj.status && Enums.entityStateReadOnly[obj.status] ? '<div class="readOnly">' + CommonViewFunction.tagForTable(obj, that.classificationDefCollection) : CommonViewFunction.tagForTable(obj, that.classificationDefCollection);
                    }
                })
            });
        },
        getTermCol: function(options) {
            var columnToShow = options.columnToShow, col = options.col;
            col && (col.term = {
                label: "Term",
                cell: "Html",
                editable: !1,
                sortable: !1,
                resizeable: !0,
                orderable: !0,
                renderable: !columnToShow || _.contains(columnToShow, "term"),
                className: "searchTag",
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function(rawValue, model) {
                        var obj = model.toJSON();
                        if ("-1" != obj.guid) return obj.typeName && !_.startsWith(obj.typeName, "AtlasGlossary") ? obj.status && Enums.entityStateReadOnly[obj.status] ? '<div class="readOnly">' + CommonViewFunction.termForTable(obj) : CommonViewFunction.termForTable(obj) : void 0;
                    }
                })
            });
        },
        addTagModalView: function(guid, multiple, entityCount) {
            var that = this;
            require([ "views/tag/AddTagModalView" ], function(AddTagModalView) {
                new AddTagModalView({
                    guid: guid,
                    multiple: multiple,
                    entityCount: entityCount,
                    callback: function() {
                        that.searchVent && that.searchVent.trigger("Classification:Count:Update"), that.multiSelectEntity = [], 
                        that.fetchCollection();
                    },
                    tagList: that.getTagList(guid, multiple),
                    showLoader: that.showLoader.bind(that),
                    hideLoader: that.hideLoader.bind(that),
                    collection: that.classificationDefCollection,
                    enumDefCollection: that.enumDefCollection
                });
            });
        },
        getTagList: function(guid, multiple) {
            if (multiple && 0 !== multiple.length) return [];
            var model = this.searchCollection.find(function(item) {
                var obj = item.toJSON();
                if (obj.guid === guid) return !0;
            });
            if (!model) return [];
            var obj = model.toJSON();
            return _.compact(_.map(obj.classifications, function(val) {
                if (val.entityGuid == guid) return val.typeName;
            }));
        },
        showLoader: function() {
            this.$(".fontLoader:not(.for-ignore)").addClass("show"), this.$(".tableOverlay").addClass("show");
        },
        hideLoader: function(options) {
            this.$(".fontLoader:not(.for-ignore)").removeClass("show"), this.$(".ellipsis-with-margin").show(), 
            options && "error" === options.type ? $(".pagination-box").hide() : this.$(".pagination-box").show(), 
            this.$(".tableOverlay").removeClass("show");
        },
        onClickAddTag: function(e) {
            var guid = "", that = this, isTagMultiSelect = $(e.currentTarget).hasClass("multiSelectTag");
            isTagMultiSelect && this.multiSelectEntity && this.multiSelectEntity.length ? that.addTagModalView(guid, this.multiSelectEntity, this.activeEntityCountSelected) : (guid = that.$(e.currentTarget).data("guid"), 
            that.addTagModalView(guid));
        },
        assignTermModalView: function(glossaryCollection, obj) {
            var that = this, terms = 0;
            _.each(glossaryCollection.fullCollection.models, function(model) {
                model.get("terms") && (terms += model.get("terms").length);
            }), terms ? require([ "views/glossary/AssignTermLayoutView" ], function(AssignTermLayoutView) {
                new AssignTermLayoutView({
                    guid: obj.guid,
                    multiple: obj.multiple,
                    associatedTerms: obj.associatedTerms,
                    callback: function() {
                        that.multiSelectEntity = [], that.fetchCollection();
                    },
                    glossaryCollection: glossaryCollection
                });
            }) : Utils.notifyInfo({
                content: "There are no available terms"
            });
        },
        onClickAddTermBtn: function(e) {
            var that = this, entityGuid = $(e.currentTarget).data("guid"), obj = {
                guid: entityGuid,
                multiple: void 0,
                associatedTerms: void 0
            }, isTermMultiSelect = $(e.currentTarget).hasClass("multiSelectTerm");
            this.glossaryCollection.fetch({
                success: function(glossaryCollection) {
                    that.assignTermModalView(glossaryCollection, obj);
                },
                reset: !0
            }), isTermMultiSelect && this.multiSelectEntity && this.multiSelectEntity.length ? obj.multiple = this.multiSelectEntity : entityGuid && (obj.associatedTerms = this.searchCollection.find({
                guid: entityGuid
            }).get("meanings"));
        },
        onClickTagCross: function(e) {
            var that = this, tagName = $(e.target).data("name"), guid = $(e.target).data("guid"), entityGuid = $(e.target).data("entityguid"), assetName = $(e.target).data("assetname");
            CommonViewFunction.deleteTag({
                tagName: tagName,
                guid: guid,
                associatedGuid: guid != entityGuid ? entityGuid : null,
                msg: "<div class='ellipsis-with-margin'>Remove: <b>" + _.escape(tagName) + "</b> assignment from <b>" + _.escape(assetName) + " ?</b></div>",
                titleMessage: Messages.removeTag,
                okText: "Remove",
                showLoader: that.showLoader.bind(that),
                hideLoader: that.hideLoader.bind(that),
                callback: function() {
                    that.searchVent && that.searchVent.trigger("Classification:Count:Update"), that.fetchCollection();
                }
            });
        },
        onClickTermCross: function(e) {
            var $el = $(e.target), termGuid = $el.data("termguid"), guid = $el.data("guid"), termName = $(e.currentTarget).text(), assetname = $el.data("assetname"), meanings = this.searchCollection.find({
                guid: guid
            }).get("meanings"), that = this, termObj = _.find(meanings, {
                termGuid: termGuid
            });
            CommonViewFunction.removeCategoryTermAssociation({
                termGuid: termGuid,
                model: {
                    guid: guid,
                    relationshipGuid: termObj.relationGuid
                },
                collection: that.glossaryCollection,
                msg: "<div class='ellipsis-with-margin'>Remove: <b>" + _.escape(termName) + "</b> assignment from <b>" + _.escape(assetname) + "?</b></div>",
                titleMessage: Messages.glossary.removeTermfromEntity,
                isEntityView: !0,
                buttonText: "Remove",
                callback: function() {
                    that.fetchCollection();
                }
            });
        },
        onClicknextData: function() {
            this.offset = this.offset + this.limit, _.extend(this.searchCollection.queryParams, {
                offset: this.offset
            }), this.value && (this.value.pageOffset = this.offset, this.triggerUrl()), this.fetchCollection(null, {
                next: !0
            });
        },
        onClickpreviousData: function() {
            this.offset = this.offset - this.limit, this.offset <= -1 && (this.offset = 0), 
            _.extend(this.searchCollection.queryParams, {
                offset: this.offset
            }), this.value && (this.value.pageOffset = this.offset, this.triggerUrl()), this.fetchCollection(null, {
                previous: !0
            });
        },
        onClickCreateEntity: function(e) {
            var that = this;
            $(e.currentTarget).blur(), require([ "views/entity/CreateEntityLayoutView" ], function(CreateEntityLayoutView) {
                new CreateEntityLayoutView({
                    entityDefCollection: that.entityDefCollection,
                    typeHeaders: that.typeHeaders,
                    searchVent: that.searchVent,
                    callback: function() {
                        that.fetchCollection();
                    }
                });
            });
        },
        onCheckExcludeIncludeResult: function(e) {
            var flag = !1, val = $(e.currentTarget).attr("data-value");
            e.target.checked && (flag = !0), this.value && (this.value[val] = flag, this.triggerUrl()), 
            _.extend(this.searchCollection.queryParams, {
                limit: this.limit,
                offset: this.offset
            }), this.fetchCollection();
        },
        changePageLimit: function(e, obj) {
            if (!obj || obj && !obj.skipViewChange) {
                var limit = parseInt(this.ui.showPage.val());
                if (0 == limit) return void this.ui.showPage.data("select2").$container.addClass("has-error");
                this.ui.showPage.data("select2").$container.removeClass("has-error"), this.limit = limit, 
                this.offset = 0, this.value && (this.value.pageLimit = this.limit, this.value.pageOffset = this.offset, 
                this.triggerUrl()), _.extend(this.searchCollection.queryParams, {
                    limit: this.limit,
                    offset: this.offset
                }), this.fetchCollection();
            }
        },
        gotoPagebtn: function(e) {
            var goToPage = parseInt(this.ui.gotoPage.val());
            if (!(_.isNaN(goToPage) || goToPage <= -1)) {
                if (this.finalPage && this.finalPage < goToPage) return void Utils.notifyInfo({
                    html: !0,
                    content: Messages.search.noRecordForPage + "<b>" + Utils.getNumberSuffix({
                        number: goToPage,
                        sup: !0
                    }) + "</b> page"
                });
                this.offset = (goToPage - 1) * this.limit, this.offset <= -1 && (this.offset = 0), 
                _.extend(this.searchCollection.queryParams, {
                    limit: this.limit,
                    offset: this.offset
                }), this.offset == this.pageFrom - 1 ? Utils.notifyInfo({
                    content: Messages.search.onSamePage
                }) : (this.value && (this.value.pageOffset = this.offset, this.triggerUrl()), this.fetchCollection(null, {
                    next: !0
                }));
            }
        }
    });
    return SearchResultLayoutView;
});