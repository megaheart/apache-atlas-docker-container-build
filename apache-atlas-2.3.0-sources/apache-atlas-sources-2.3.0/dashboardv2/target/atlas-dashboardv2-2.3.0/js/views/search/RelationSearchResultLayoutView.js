define([ "require", "backbone", "table-dragger", "hbs!tmpl/search/RelationSearchResultLayoutView_tmpl", "modules/Modal", "models/VEntity", "utils/Utils", "utils/Globals", "collection/VRelationshipSearchResultList", "models/VCommon", "utils/CommonViewFunction", "utils/Messages", "utils/Enums", "utils/UrlLinks", "platform" ], function(require, Backbone, tableDragger, RelationSearchResultLayoutViewTmpl, Modal, VEntity, Utils, Globals, VRelationshipSearchResultList, VCommon, CommonViewFunction, Messages, Enums, UrlLinks, platform) {
    "use strict";
    var RelationSearchResultLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "RelationSearchResultLayoutView",
        template: RelationSearchResultLayoutViewTmpl,
        regions: {
            REntityTableLayoutView: "#r_relationSearchResultTableLayoutView"
        },
        ui: {
            paginationDiv: '[data-id="paginationDiv"]',
            previousData: "[data-id='previousData']",
            nextData: "[data-id='nextData']",
            pageRecordText: "[data-id='pageRecordText']",
            colManager: "[data-id='colManager']",
            columnEmptyInfo: "[data-id='columnEmptyInfo']",
            showPage: "[data-id='showPage']",
            gotoPage: "[data-id='gotoPage']",
            gotoPagebtn: "[data-id='gotoPagebtn']",
            activePage: "[data-id='activePage']"
        },
        templateHelpers: function() {
            return {
                searchType: this.searchType,
                fromView: this.fromView
            };
        },
        events: function() {
            var events = {}, that = this;
            return events["keyup " + this.ui.gotoPage] = function(e) {
                var code = e.which;
                parseInt(e.currentTarget.value);
                e.currentTarget.value ? that.ui.gotoPagebtn.attr("disabled", !1) : that.ui.gotoPagebtn.attr("disabled", !0), 
                13 == code && e.currentTarget.value && that.gotoPagebtn();
            }, events["change " + this.ui.showPage] = "changePageLimit", events["click " + this.ui.gotoPagebtn] = "gotoPagebtn", 
            events["click " + this.ui.nextData] = "onClicknextData", events["click " + this.ui.previousData] = "onClickpreviousData", 
            events;
        },
        initialize: function(options) {
            if (_.extend(this, _.pick(options, "value", "guid", "initialView", "searchVent", "searchTableColumns", "isTableDropDisable", "fromView", "profileDBView", "relationshipDefCollection")), 
            this.searchCollection = new VRelationshipSearchResultList(), this.limit = 25, this.asyncFetchCounter = 0, 
            this.offset = 0, this.bindEvents(), this.searchType = "Basic Search", this.columnOrder = null, 
            this.defaultColumns = [ "name", "typeName", "end1", "end2", "label" ], this.value) {
                if (this.value.pageLimit) {
                    var pageLimit = parseInt(this.value.pageLimit, 10);
                    _.isNaN(pageLimit) || 0 == pageLimit || pageLimit <= -1 ? (this.value.pageLimit = this.limit, 
                    this.triggerUrl()) : this.limit = pageLimit;
                }
                if (this.value.pageOffset) {
                    var pageOffset = parseInt(this.value.pageOffset, 10);
                    _.isNaN(pageOffset) || pageLimit <= -1 ? (this.value.pageOffset = this.offset, this.triggerUrl()) : this.offset = pageOffset;
                }
            }
        },
        bindEvents: function() {
            this.onClickLoadMore(), this.listenTo(this.searchCollection, "error", function(model, response) {
                this.hideLoader({
                    type: "error"
                });
                var responseJSON = response && response.responseJSON ? response.responseJSON : null, errorText = responseJSON && (responseJSON.errorMessage || responseJSON.message || responseJSON.error) || "Invalid Expression";
                errorText && (Utils.notifyError({
                    content: errorText
                }), this.$(".searchTable > .well").html("<center>" + _.escape(errorText) + "</center>"));
            }, this), this.listenTo(this.searchCollection, "state-changed", function(state) {
                if (Utils.getUrlState.isRelationTab()) {
                    this.updateColumnList(state);
                    var excludeDefaultColumn = [];
                    this.value && this.value.relationshipName && (excludeDefaultColumn = _.difference(this.searchTableColumns[this.value.relationshipName], this.defaultColumns), 
                    null === this.searchTableColumns[this.value.relationshipName] ? this.ui.columnEmptyInfo.show() : this.ui.columnEmptyInfo.hide()), 
                    this.columnOrder = this.getColumnOrder(this.REntityTableLayoutView.$el.find(".colSort th.renderable")), 
                    this.triggerUrl();
                    var attributes = this.searchCollection.filterObj.attributes;
                    excludeDefaultColumn && attributes && (excludeDefaultColumn.length > attributes.length || _.difference(excludeDefaultColumn, attributes).length) && this.fetchCollection(this.value);
                }
            }, this), this.listenTo(this.searchVent, "relationSearch:refresh", function(model, response) {
                this.updateColumnList(), this.fetchCollection();
            }, this), this.listenTo(this.searchCollection, "backgrid:sorted", function(model, response) {
                this.checkTableFetch();
            }, this);
        },
        onRender: function() {
            if (this.commonTableOptions = {
                collection: this.searchCollection,
                includePagination: !1,
                includeFooterRecords: !1,
                includeColumnManager: !(!Utils.getUrlState.isRelationTab() || !this.value || "basic" !== this.value.searchType || this.profileDBView),
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
            }, this.initialView) this.$(".relationLink").show(); else {
                var value = {
                    query: null,
                    searchType: "basic"
                };
                this.value && (value = this.value), this.updateColumnList(), this.value && this.searchTableColumns && null === this.searchTableColumns[this.value.relationshipName] ? this.ui.columnEmptyInfo.show() : this.ui.columnEmptyInfo.hide(), 
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
        updateColumnList: function(updatedList) {
            if (updatedList) {
                var listOfColumns = [];
                _.map(updatedList, function(obj) {
                    obj.name;
                    obj.renderable && listOfColumns.push(obj.name);
                }), listOfColumns = _.sortBy(listOfColumns), this.value.attributes = listOfColumns.length ? listOfColumns.join(",") : null, 
                this.value && this.value.relationshipName && this.searchTableColumns && (this.searchTableColumns[this.value.relationshipName] = listOfColumns.length ? listOfColumns : null);
            } else this.value && this.value.relationshipName && this.searchTableColumns && this.value.attributes && (this.searchTableColumns[this.value.relationshipName] = this.value.attributes.split(","));
        },
        fetchCollection: function(value, options) {
            var that = this, isPostMethod = this.value && "basic" === this.value.searchType, isRelationSearch = Utils.getUrlState.isRelationTab(), relationshipFilters = null;
            if (isRelationSearch && (relationshipFilters = CommonViewFunction.attributeFilter.generateAPIObj(this.value.relationshipFilters)), 
            isPostMethod && isRelationSearch) var excludeDefaultColumn = this.value.relationshipName && this.searchTableColumns ? _.difference(this.searchTableColumns[this.value.relationshipName], this.defaultColumns) : null, filterObj = {
                attributes: excludeDefaultColumn ? excludeDefaultColumn : null,
                relationshipFilters: relationshipFilters
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
                            if (dataLength = isPostMethod && dataOrCollection && dataOrCollection.relations ? dataOrCollection.relations.length : dataOrCollection.length, 
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
                            if (isPostMethod && (that.searchCollection.reset(dataOrCollection.relations, {
                                silent: !0
                            }), that.searchCollection.fullCollection.reset(dataOrCollection.relations, {
                                silent: !0
                            })), dataLength < that.limit ? that.ui.nextData.attr("disabled", !0) : that.ui.nextData.attr("disabled", !1), 
                            isFirstPage && (!dataLength || dataLength < that.limit) ? that.ui.paginationDiv.hide() : that.ui.paginationDiv.show(), 
                            isFirstPage ? (that.ui.previousData.attr("disabled", !0), that.pageFrom = 1, that.pageTo = that.limit) : that.ui.previousData.attr("disabled", !1), 
                            options && options.next ? (that.pageTo = that.offset + that.limit, that.pageFrom = that.offset + 1) : !isFirstPage && options && options.previous && (that.pageTo = that.pageTo - that.limit, 
                            that.pageFrom = that.pageTo - that.limit + 1), that.ui.pageRecordText.html("Showing  <u>" + that.searchCollection.models.length + " records</u> From " + that.pageFrom + " - " + that.pageTo), 
                            that.activePage = Math.round(that.pageTo / that.limit), that.ui.activePage.attr("title", "Page " + that.activePage), 
                            that.ui.activePage.text(that.activePage), that.renderTableLayoutView(), dataLength > 0 && that.$(".searchTable").removeClass("noData"), 
                            isRelationSearch && value && !that.profileDBView) {
                                var searchString = 'Results for: <span class="filterQuery">' + CommonViewFunction.generateQueryOfFilter(that.value) + "</span>";
                                that.$(".searchResult").html(searchString);
                            }
                        }
                    }
                },
                silent: !0,
                reset: !0
            };
            value ? (value.searchType && (this.searchCollection.url = UrlLinks.relationshipSearchApiUrl(value.searchType)), 
            _.extend(this.searchCollection.queryParams, {
                limit: this.limit,
                offset: this.offset,
                query: _.trim(value.query),
                relationshipName: value.relationshipName || null
            }), isPostMethod ? (this.searchCollection.filterObj = _.extend({}, filterObj), apiObj.data = _.extend(filterObj, _.pick(this.searchCollection.queryParams, "query", "limit", "offset", "relationshipName")), 
            Globals.searchApiCallRef = this.searchCollection.getBasicRearchResult(apiObj)) : (apiObj.data = null, 
            this.searchCollection.filterObj = null, Globals.searchApiCallRef = this.searchCollection.fetch(apiObj))) : (_.extend(this.searchCollection.queryParams, {
                limit: this.limit,
                offset: this.offset
            }), isPostMethod ? (apiObj.data = _.extend(filterObj, _.pick(this.searchCollection.queryParams, "query", "limit", "offset", "relationshipName")), 
            Globals.searchApiCallRef = this.searchCollection.getBasicRearchResult(apiObj)) : (apiObj.data = null, 
            Globals.searchApiCallRef = this.searchCollection.fetch(apiObj)));
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
            columns.setPositions().sort();
            var table = new TableLayout(_.extend({}, that.commonTableOptions, {
                columns: columns
            }));
            if (0 === table.collection.length && that.$(".searchTable").addClass("noData"), 
            that.REntityTableLayoutView && (that.value || (that.value = that.options.value), 
            that.REntityTableLayoutView.show(table), that.$(".ellipsis-with-margin .inputAssignTag").hide(), 
            table.trigger("grid:refresh"), that.isTableDropDisable !== !0)) {
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
            if (this.value = "glossary" === this.fromView ? this.value : Utils.getUrlState.getQueryParams() || this.value, 
            this.value && "basic" === this.value.searchType && this.searchTableColumns && void 0 !== this.searchTableColumns[this.value.relationshipName] && (columnToShow = null == this.searchTableColumns[this.value.relationshipName] ? [] : this.searchTableColumns[this.value.relationshipName]), 
            col.name = {
                label: "Guid",
                cell: "html",
                editable: !1,
                resizeable: !0,
                orderable: !1,
                renderable: !0,
                className: "searchTableName",
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function(rawValue, model) {
                        var obj = model.toJSON(), nameHtml = "", name = Utils.getName(obj), img = "";
                        return nameHtml = obj.guid ? "-1" == obj.guid ? '<span title="' + name + '">' + name + "</span>" : '<a title="' + name + '" href="#!/relationshipDetailPage/' + obj.guid + (that.fromView ? "?from=" + that.fromView : "") + '">' + name + "</a>" : '<span title="' + name + '">' + name + "</span>", 
                        img = "<div><img data-imgGuid='" + obj.guid + "' src='/img/entity-icon/table.png'></div>", 
                        obj.status && Enums.entityStateReadOnly[obj.status] && (nameHtml += '<button type="button" title="Deleted" class="btn btn-action btn-md deleteBtn"><i class="fa fa-trash"></i></button>', 
                        nameHtml = '<div class="readOnly readOnlyLink">' + nameHtml + "</div>", img = "<div><img data-imgGuid='" + obj.guid + "' src='/img/entity-icon/disabled/table.png'></div>"), 
                        img + nameHtml;
                    }
                })
            }, this.value && (col.typeName = {
                label: "Type",
                cell: "Html",
                editable: !1,
                resizeable: !0,
                orderable: !0,
                renderable: !columnToShow || _.contains(columnToShow, "typeName"),
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function(rawValue, model) {
                        var obj = model.toJSON();
                        if (obj && obj.typeName) return "<span>" + obj.typeName + "</span>";
                    }
                })
            }, col.end1 = {
                label: "End1",
                cell: "Html",
                editable: !1,
                resizeable: !0,
                orderable: !0,
                renderable: !columnToShow || _.contains(columnToShow, "end1"),
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function(rawValue, model) {
                        var obj = model.toJSON();
                        if (obj && obj.end1) {
                            var key, uniqueAttributesValue;
                            for (key in obj.end1.uniqueAttributes) uniqueAttributesValue = obj.end1.uniqueAttributes[key];
                            return uniqueAttributesValue = uniqueAttributesValue ? uniqueAttributesValue : obj.end1.guid, 
                            '<a title="' + uniqueAttributesValue + '" href="#!/detailPage/' + obj.end1.guid + '?from=relationshipSearch">' + uniqueAttributesValue + "</a>";
                        }
                    }
                })
            }, col.end2 = {
                label: "End2",
                cell: "Html",
                editable: !1,
                resizeable: !0,
                orderable: !0,
                renderable: !columnToShow || _.contains(columnToShow, "end2"),
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function(rawValue, model) {
                        var obj = model.toJSON();
                        if (obj && obj.end2) {
                            var key, uniqueAttributesValue;
                            for (key in obj.end2.uniqueAttributes) uniqueAttributesValue = obj.end2.uniqueAttributes[key];
                            return uniqueAttributesValue = uniqueAttributesValue ? uniqueAttributesValue : obj.end2.guid, 
                            '<a title="' + uniqueAttributesValue + '" href="#!/detailPage/' + obj.end2.guid + '?from=relationshipSearch">' + uniqueAttributesValue + "</a>";
                        }
                    }
                })
            }, col.label = {
                label: "Label",
                cell: "Html",
                editable: !1,
                resizeable: !0,
                orderable: !0,
                renderable: !columnToShow || _.contains(columnToShow, "end2"),
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function(rawValue, model) {
                        var obj = model.toJSON();
                        if (obj) return "<span>" + obj.label + "</span>";
                    }
                })
            }, this.value && "basic" === this.value.searchType)) {
                var def = this.relationshipDefCollection.fullCollection.find({
                    name: this.value.relationshipName
                });
                if (def) {
                    var attrObj = def ? Utils.getNestedSuperTypeObj({
                        data: def.toJSON(),
                        collection: this.relationshipDefCollection,
                        attrMerge: !0
                    }) : [];
                    _.each(attrObj, function(obj, key) {
                        var key = obj.name, isRenderable = _.contains(columnToShow, key), isSortable = obj.typeName.search(/(array|map)/i) == -1;
                        col[obj.name] = {
                            label: obj.name.capitalize(),
                            cell: "Html",
                            headerCell: Backgrid.HeaderHTMLDecodeCell,
                            editable: !1,
                            resizeable: !0,
                            orderable: !0,
                            sortable: isSortable,
                            renderable: isRenderable,
                            headerClassName: "",
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
                        };
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
        showLoader: function() {
            this.$(".fontLoader:not(.for-ignore)").addClass("show"), this.$(".tableOverlay").addClass("show");
        },
        hideLoader: function(options) {
            this.$(".fontLoader:not(.for-ignore)").removeClass("show"), options && "error" === options.type ? this.$(".ellipsis-with-margin,.pagination-box").hide() : this.$(".ellipsis-with-margin,.pagination-box").show(), 
            this.$(".tableOverlay").removeClass("show");
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
    return RelationSearchResultLayoutView;
});