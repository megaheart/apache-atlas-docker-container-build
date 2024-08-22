define([ "require", "backbone", "hbs!tmpl/common/TableLayout_tmpl", "utils/Messages", "utils/Utils", "utils/Globals", "utils/CommonViewFunction", "backgrid-filter", "backgrid-paginator", "backgrid-sizeable", "backgrid-orderable", "backgrid-select-all", "backgrid-columnmanager" ], function(require, Backbone, FSTablelayoutTmpl, Messages, Utils, Globals, CommonViewFunction) {
    "use strict";
    var FSTableLayout = Backbone.Marionette.LayoutView.extend({
        _viewName: "FSTableLayout",
        template: FSTablelayoutTmpl,
        templateHelpers: function() {
            return this.options;
        },
        regions: {
            rTableList: 'div[data-id="r_tableList"]',
            rTableSpinner: 'div[data-id="r_tableSpinner"]',
            rPagination: 'div[data-id="r_pagination"]',
            rFooterRecords: 'div[data-id="r_footerRecords"]'
        },
        ui: {
            selectPageSize: 'select[data-id="pageSize"]',
            paginationDiv: '[data-id="paginationDiv"]',
            previousData: "[data-id='previousData']",
            nextData: "[data-id='nextData']",
            pageRecordText: "[data-id='pageRecordText']",
            showPage: "[data-id='showPage']",
            gotoPage: "[data-id='gotoPage']",
            gotoPagebtn: "[data-id='gotoPagebtn']",
            activePage: "[data-id='activePage']"
        },
        gridOpts: {
            className: "table table-bordered table-hover table-condensed backgrid",
            emptyText: "No Records found!"
        },
        filterOpts: {
            placeholder: "plcHldr.searchByResourcePath",
            wait: 150
        },
        paginatorOpts: {
            windowSize: 5,
            slideScale: .5,
            goBackFirstOnSort: !1
        },
        controlOpts: {
            rewind: null,
            back: {
                label: "<i class='fa fa-angle-left'></i>",
                title: "Previous"
            },
            forward: {
                label: "<i class='fa fa-angle-right'></i>",
                title: "Next"
            },
            fastForward: null
        },
        columnOpts: {
            opts: {
                initialColumnsVisible: 4,
                saveState: !1,
                loadStateOnInit: !0
            },
            visibilityControlOpts: {},
            el: null
        },
        includePagination: !0,
        includeAtlasPagination: !1,
        includeAtlasPageSize: !1,
        includeFilter: !1,
        includeHeaderSearch: !1,
        includePageSize: !1,
        includeGotoPage: !1,
        includeFooterRecords: !0,
        includeColumnManager: !1,
        includeSizeAbleColumns: !1,
        includeOrderAbleColumns: !1,
        includeTableLoader: !0,
        includeAtlasTableSorting: !1,
        showDefaultTableSorted: !1,
        updateFullCollectionManually: !1,
        sortOpts: {
            sortColumn: "name",
            sortDirection: "ascending"
        },
        events: function() {
            var events = {}, that = this;
            return events["change " + this.ui.selectPageSize] = "onPageSizeChange", events["change " + this.ui.showPage] = "changePageLimit", 
            events["click " + this.ui.nextData] = "onClicknextData", events["click " + this.ui.previousData] = "onClickpreviousData", 
            events["click " + this.ui.gotoPagebtn] = "gotoPagebtn", events["keyup " + this.ui.gotoPage] = function(e) {
                var code = e.which;
                parseInt(e.currentTarget.value);
                e.currentTarget.value ? that.ui.gotoPagebtn.attr("disabled", !1) : that.ui.gotoPagebtn.attr("disabled", !0), 
                13 == code && e.currentTarget.value && that.gotoPagebtn();
            }, events;
        },
        initialize: function(options) {
            if (this.limit = 25, this.offset = 0, _.extend(this, _.omit(options, "gridOpts", "sortOpts", "atlasPaginationOpts")), 
            _.extend(this, options.atlasPaginationOpts), _.extend(this.gridOpts, options.gridOpts, {
                collection: this.collection,
                columns: this.columns
            }), _.extend(this.sortOpts, options.sortOpts), this.isApiSorting && 0 === this.offset && (this.limit = this.count || this.limit), 
            this.includeAtlasTableSorting) {
                var oldSortingRef = this.collection.setSorting;
                this.collection.setSorting = function() {
                    this.state.pageSize = this.length;
                    var val = oldSortingRef.apply(this, arguments);
                    return val.fullCollection.sort(), this.comparator = function(next, previous, data) {
                        var getValue = function(options) {
                            var next = options.next, previous = options.previous, order = options.order;
                            return next === previous ? null : order === -1 ? next < previous ? -1 : 1 : next < previous ? 1 : -1;
                        }, getKeyVal = function(model, key) {
                            var value = null;
                            return model && key && (value = model[key], value || _.each(model, function(modalValue) {
                                "object" == typeof modalValue && (value || (value = getKeyVal(modalValue, key)));
                            })), Number(value) || value;
                        };
                        if (val.state && !_.isNull(val.state.sortKey)) {
                            var nextValue, previousValue;
                            return next && next.get("attributes") && next.get("attributes")[val.state.sortKey] || previous && previous.get("attributes") && previous.get("attributes")[val.state.sortKey] ? (nextValue = next.get("attributes")[val.state.sortKey], 
                            previousValue = previous.get("attributes")[val.state.sortKey]) : (nextValue = getKeyVal(next.attributes, val.state.sortKey), 
                            previousValue = getKeyVal(previous.attributes, val.state.sortKey)), nextValue = "string" == typeof nextValue ? nextValue.toLowerCase() : nextValue, 
                            previousValue = "string" == typeof previousValue ? previousValue.toLowerCase() : previousValue, 
                            getValue({
                                next: nextValue || "",
                                previous: previousValue || "",
                                order: val.state.order
                            });
                        }
                    }, val;
                };
            }
            this.bindEvents();
        },
        bindEvents: function() {
            this.listenTo(this.collection, "request", function() {
                this.$('div[data-id="r_tableSpinner"]').addClass("show");
            }, this), this.listenTo(this.collection, "sync error", function() {
                this.$('div[data-id="r_tableSpinner"]').removeClass("show");
            }, this), this.listenTo(this.collection, "reset", function(collection, options) {
                this.$('div[data-id="r_tableSpinner"]').removeClass("show"), this.ui.gotoPage.val(""), 
                this.ui.gotoPage.parent().removeClass("has-error"), this.ui.gotoPagebtn.prop("disabled", !0), 
                this.includePagination && this.renderPagination(), this.includeFooterRecords && this.renderFooterRecords(this.collection.state), 
                this.includeAtlasPagination && this.renderAtlasPagination(options);
            }, this), this.listenTo(this.collection, "backgrid:sorted", function(column, direction, collection) {
                this.isApiSorting ? column.set("direction", direction) : (this.collection.fullCollection.trigger("backgrid:sorted", column, direction, collection), 
                this.includeAtlasTableSorting && this.updateFullCollectionManually && this.collection.fullCollection.reset(collection.toJSON(), {
                    silent: !0
                }));
            }, this), this.listenTo(this, "grid:refresh", function() {
                this.grid && this.grid.trigger("backgrid:refresh");
            }), this.listenTo(this, "grid:refresh:update", function() {
                this.grid && (this.grid.trigger("backgrid:refresh"), this.grid.collection && this.grid.collection.trigger("backgrid:colgroup:updated"));
            }), this.listenTo(this.collection, "backgrid:refresh", function() {}, this);
        },
        onRender: function() {
            this.renderTable(), this.includePagination && this.renderPagination(), this.includeAtlasPagination && this.renderAtlasPagination(), 
            this.includeFilter && this.renderFilter(), this.includeFooterRecords && this.renderFooterRecords(this.collection.state), 
            this.includeColumnManager && this.renderColumnManager();
            var pageSizeEl = null;
            if (this.includePageSize ? pageSizeEl = this.ui.selectPageSize : this.includeAtlasPageSize && (pageSizeEl = this.ui.showPage), 
            pageSizeEl) {
                pageSizeEl.select2({
                    data: _.sortBy(_.union([ 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500 ], [ this.collection.state.pageSize ])),
                    tags: !0,
                    dropdownCssClass: "number-input",
                    multiple: !1
                });
                var val = this.collection.state.pageSize;
                this.value && this.value.pageLimit && (val = this.limit), pageSizeEl.val(val).trigger("change", {
                    skipViewChange: !0
                });
            }
        },
        renderTable: function() {
            var that = this;
            this.grid = new Backgrid.Grid(this.gridOpts).on("backgrid:rendered", function() {
                that.trigger("backgrid:manual:rendered", this);
            }), this.showDefaultTableSorted ? (this.grid.render(), (this.collection.fullCollection.length > 1 || this.isApiSorting) && this.grid.sort(this.sortOpts.sortColumn, this.sortOpts.sortDirection), 
            this.rTableList.show(this.grid)) : this.rTableList.show(this.grid);
        },
        onShow: function() {
            this.includeSizeAbleColumns && this.renderSizeAbleColumns(), this.includeOrderAbleColumns && this.renderOrderAbleColumns();
        },
        renderPagination: function() {
            var options = _.extend({
                collection: this.collection,
                controls: this.controlOpts
            }, this.paginatorOpts);
            this.rPagination ? this.rPagination.show(new Backgrid.Extension.Paginator(options)) : this.regions.rPagination && (this.$('div[data-id="r_pagination"]').show(new Backgrid.Extension.Paginator(options)), 
            this.showHideGoToPage());
        },
        renderAtlasPagination: function(options) {
            var isFirstPage = 0 === this.offset, dataLength = this.collection.length, goToPage = this.ui.gotoPage.val();
            if (dataLength < this.limit ? this.ui.nextData.attr("disabled", !0) : this.ui.nextData.attr("disabled", !1), 
            isFirstPage && (!dataLength || dataLength < this.limit) ? this.ui.paginationDiv.hide() : this.ui.paginationDiv.show(), 
            isFirstPage ? (this.ui.previousData.attr("disabled", !0), this.pageFrom = 1, this.pageTo = this.limit) : this.ui.previousData.attr("disabled", !1), 
            options && options.next ? (this.pageTo = this.offset + this.limit, this.pageFrom = this.offset + 1) : !isFirstPage && options && options.previous && (this.pageTo = this.pageTo - this.limit, 
            this.pageFrom = this.pageTo - this.limit + 1), !this.isApiSorting || this.pageTo || this.pageFrom || (this.limit = this.count, 
            this.pageTo = this.offset + this.limit, this.pageFrom = this.offset + 1), this.ui.pageRecordText.html("Showing  <u>" + this.collection.length + " records</u> From " + this.pageFrom + " - " + this.pageTo), 
            this.activePage = Math.round(this.pageTo / this.limit), this.ui.activePage.attr("title", "Page " + this.activePage), 
            this.ui.activePage.text(this.activePage), this.ui.showPage.val(this.limit).trigger("change", {
                skipViewChange: !0
            }), !dataLength && this.offset >= this.limit && (options && options.next || goToPage) && options && !options.fromUrl) {
                var pageNumber = this.activePage;
                return goToPage ? (pageNumber = goToPage, this.offset = (this.activePage - 1) * this.limit) : this.ui.nextData.attr("disabled", !0), 
                this.value && (this.value.pageOffset = this.offset, this.triggerUrl && this.triggerUrl()), 
                void Utils.notifyInfo({
                    html: !0,
                    content: Messages.search.noRecordForPage + "<b>" + Utils.getNumberSuffix({
                        number: pageNumber,
                        sup: !0
                    }) + "</b> page"
                });
            }
        },
        showHidePager: function() {
            this.includePagination && (this.collection.state && this.collection.state.totalRecords > this.collection.state.pageSize ? this.$('div[data-id="r_pagination"]').show() : this.$('div[data-id="r_pagination"]').hide());
        },
        showHideGoToPage: function() {
            this.collection.state.pageSize > this.collection.fullCollection.length ? this.ui.paginationDiv.hide() : this.ui.paginationDiv.show();
        },
        renderFilter: function() {
            this.rFilter.show(new Backgrid.Extension.ServerSideFilter({
                collection: this.collection,
                name: [ "name" ],
                placeholder: "plcHldr.searchByResourcePath",
                wait: 150
            })), setTimeout(function() {
                that.$("table").colResizable({
                    liveDrag: !0
                });
            }, 0);
        },
        renderFooterRecords: function(collectionState) {
            var collState = collectionState, totalRecords = collState.totalRecords || 0, pageStartIndex = totalRecords ? collState.currentPage * collState.pageSize : 0, pageEndIndex = pageStartIndex + this.collection.length;
            return this.$('[data-id="r_footerRecords"]').html("<h5>Showing " + (totalRecords ? pageStartIndex + 1 : 0 === this.collection.length ? 0 : 1) + " - " + pageEndIndex + "</h5>"), 
            this;
        },
        renderColumnManager: function() {
            if (this.columns) {
                var that = this, $el = this.columnOpts.el || this.$("[data-id='control']"), colManager = new Backgrid.Extension.ColumnManager(this.columns, this.columnOpts.opts), colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl(_.extend({
                    columnManager: colManager
                }, this.columnOpts.visibilityControlOpts));
                $el.jquery || ($el = $($el)), this.columnOpts.el ? $el.html(colVisibilityControl.render().el) : $el.append(colVisibilityControl.render().el), 
                colManager.on("state-changed", function(state) {
                    that.collection.trigger("state-changed", state);
                }), colManager.on("state-saved", function() {
                    that.collection.trigger("state-changed");
                });
            }
        },
        renderSizeAbleColumns: function() {
            var sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
                collection: this.collection,
                columns: this.columns,
                grid: this.getGridObj()
            });
            this.$("thead").before(sizeAbleCol.render().el);
            var sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
                sizeAbleColumns: sizeAbleCol,
                saveModelWidth: !0
            });
            this.$("thead").before(sizeHandler.render().el), this.columns.on("resize", function(columnModel, newWidth, oldWidth) {
                console.log("Resize event on column; name, model, new and old width: ", columnModel.get("name"), columnModel, newWidth, oldWidth);
            });
        },
        renderOrderAbleColumns: function() {
            var sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
                collection: this.collection,
                grid: this.getGridObj(),
                columns: this.columns
            });
            this.$("thead").before(sizeAbleCol.render().el);
            var orderHandler = new Backgrid.Extension.OrderableColumns({
                grid: this.getGridObj(),
                sizeAbleColumns: sizeAbleCol
            });
            this.$("thead").before(orderHandler.render().el);
        },
        onClose: function() {},
        getGridObj: function() {
            return this.rTableList.currentView ? this.rTableList.currentView : null;
        },
        onPageSizeChange: function(e, options) {
            if (!options || !options.skipViewChange) {
                var pagesize = $(e.currentTarget).val();
                if (0 == pagesize) return void this.ui.selectPageSize.data("select2").$container.addClass("has-error");
                this.ui.selectPageSize.data("select2").$container.removeClass("has-error"), this.collection.state.pageSize = parseInt(pagesize, 10), 
                this.collection.state.currentPage = this.collection.state.firstPage, this.showHideGoToPage(), 
                "client" == this.collection.mode ? this.collection.fullCollection.reset(this.collection.fullCollection.toJSON()) : this.collection.fetch({
                    sort: !1,
                    reset: !0,
                    cache: !1
                });
            }
        },
        onClicknextData: function() {
            this.offset = this.offset + this.limit, _.extend(this.collection.queryParams, {
                offset: this.offset
            }), this.value && (this.value.pageOffset = this.offset, this.triggerUrl && this.triggerUrl()), 
            this.fetchCollection && this.fetchCollection({
                next: !0
            });
        },
        onClickpreviousData: function() {
            this.offset = this.offset - this.limit, this.offset <= -1 && (this.offset = 0), 
            _.extend(this.collection.queryParams, {
                offset: this.offset
            }), this.value && (this.value.pageOffset = this.offset, this.triggerUrl && this.triggerUrl()), 
            this.fetchCollection && this.fetchCollection({
                previous: !0
            });
        },
        changePageLimit: function(e, obj) {
            if (!obj || obj && !obj.skipViewChange) {
                var limit = parseInt(this.ui.showPage.val());
                if (0 == limit) return void this.ui.showPage.data("select2").$container.addClass("has-error");
                this.ui.showPage.data("select2").$container.removeClass("has-error"), this.limit = limit, 
                this.offset = 0, this.value && (this.value.pageLimit = this.limit, this.value.pageOffset = this.offset, 
                this.triggerUrl && this.triggerUrl()), _.extend(this.collection.queryParams, {
                    limit: this.limit,
                    offset: this.offset
                }), this.fetchCollection();
            }
        },
        gotoPagebtn: function(e) {
            var that = this, goToPage = parseInt(this.ui.gotoPage.val());
            if (!_.isNaN(goToPage) && (0 == goToPage || this.collection.state.totalPages < goToPage)) return Utils.notifyInfo({
                content: Messages.search.noRecordForPage + "page " + goToPage
            }), this.ui.gotoPage.val(""), void that.ui.gotoPagebtn.attr("disabled", !0);
            if (!(_.isNaN(goToPage) || goToPage <= -1)) {
                if ("client" == this.collection.mode) return this.collection.getPage(goToPage - 1, {
                    reset: !0
                });
                this.offset = (goToPage - 1) * this.limit, this.offset <= -1 && (this.offset = 0), 
                _.extend(this.collection.queryParams, {
                    limit: this.limit,
                    offset: this.offset
                }), this.offset == this.pageFrom - 1 ? Utils.notifyInfo({
                    content: Messages.search.onSamePage
                }) : (this.value && (this.value.pageOffset = this.offset, this.triggerUrl && this.triggerUrl()), 
                this.fetchCollection && this.fetchCollection({
                    next: !0
                }));
            }
        }
    });
    return FSTableLayout;
});