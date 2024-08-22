define([ "require", "backbone", "hbs!tmpl/detail_page/PendingTaskTableLayoutView_tmpl", "collection/VEntityList", "utils/Utils", "utils/Enums", "utils/UrlLinks", "utils/CommonViewFunction" ], function(require, Backbone, PendingTaskTableLayoutView_tmpl, VEntityList, Utils, Enums, UrlLinks, CommonViewFunction) {
    "use strict";
    var PendingTaskTableLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "PendingTaskTableLayoutView",
        template: PendingTaskTableLayoutView_tmpl,
        regions: {
            RPendingTaskTableLayoutView: "#r_pendingTaskTableLayoutView"
        },
        ui: {
            refreshPendingTask: "[data-id='refreshPendingTask']"
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.refreshPendingTask] = function(e) {
                this.fetchPendingTaskCollection();
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "guid", "entity", "entityName", "attributeDefs")), 
            this.pendingTaskCollection = new VEntityList(), this.limit = 25, this.offset = 0, 
            this.pendingTaskCollection.url = UrlLinks.pendingTaskApiUrl(), this.entityModel = new this.pendingTaskCollection.model(), 
            this.pervOld = [], this.commonTableOptions = {
                collection: this.pendingTaskCollection,
                includeFilter: !1,
                includePagination: !1,
                includeAtlasPagination: !0,
                includeAtlasPageSize: !0,
                includeTableLoader: !0,
                includeAtlasTableSorting: !1,
                showDefaultTableSorted: !1,
                columnSorting: !1,
                includeFooterRecords: !1,
                gridOpts: {
                    className: "table table-hover backgrid table-quickMenu",
                    emptyText: "No records found!"
                },
                isApiSorting: !1,
                atlasPaginationOpts: this.getPaginationOptions(),
                filterOpts: {},
                paginatorOpts: {}
            }, this.currPage = 1, this.fromSort = !1;
        },
        onRender: function() {
            this.fetchPendingTaskCollection();
        },
        fetchPendingTaskCollection: function() {
            this.commonTableOptions.atlasPaginationOpts = this.getPaginationOptions(), this.fetchCollection(), 
            this.pendingTaskCollection.comparator = function(model) {
                return -model.get("createdBy");
            };
        },
        bindEvents: function() {},
        getPaginationOptions: function() {
            return {
                count: this.getPageCount(),
                offset: this.pendingTaskCollection.queryParams.offset || this.offset,
                fetchCollection: this.fetchCollection.bind(this)
            };
        },
        getPageCount: function() {
            return this.pendingTaskCollection.queryParams.limit || this.pendingTaskCollection.queryParams.count || this.limit;
        },
        fetchCollection: function(options) {
            var that = this;
            this.pendingTaskCollection.fetch({
                success: function(dataOrCollection, response) {
                    that.pendingTaskCollection.state.pageSize = that.getPageCount(), that.pendingTaskCollection.fullCollection.reset(response);
                },
                complete: function() {
                    that.$(".fontLoader").hide(), that.$(".tableOverlay").hide(), that.$(".auditTable").show(), 
                    that.renderTableLayoutView();
                },
                silent: !0
            });
        },
        renderTableLayoutView: function() {
            var that = this;
            require([ "utils/TableLayout" ], function(TableLayout) {
                var cols = new Backgrid.Columns(that.getAuditTableColumns());
                that.RPendingTaskTableLayoutView.show(new TableLayout(_.extend({}, that.commonTableOptions, {
                    columns: cols
                })));
            });
        },
        getAuditTableColumns: function() {
            return this.pendingTaskCollection.constructor.getTableCols({
                tool: {
                    label: "",
                    cell: "html",
                    editable: !1,
                    sortable: !1,
                    fixWidth: "20",
                    cell: Backgrid.ExpandableCell,
                    accordion: !1,
                    expand: function(el, model) {
                        el.attr("colspan", "8");
                        var parameters = (model.get("attemptCount"), _.omit(_.extend(model.get("parameters"), {
                            attemptCount: model.get("attemptCount"),
                            createdBy: model.get("createdBy")
                        }), "entityGuid")), memoryTable = CommonViewFunction.propertyTable({
                            scope: this,
                            formatStringVal: !1,
                            valueObject: parameters
                        }), tableData = ' <div class="col-sm-12"> <div class="card-container panel  panel-default custom-panel"><div class="panel-heading">Parameters</div> <div class="panel-body"><table class="table stat-table task-details"><tbody data-id="memory-card">' + memoryTable + "</tbody></table> </div> </div> </div>";
                        $(el).append($("<div>").html(tableData));
                    }
                },
                type: {
                    label: "Type",
                    cell: "html",
                    sortable: !1,
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return Enums.auditAction[model.get("type")] || rawValue;
                        }
                    })
                },
                guid: {
                    label: "Guid",
                    cell: "html",
                    sortable: !1,
                    editable: !1
                },
                status: {
                    label: "Status",
                    cell: "html",
                    sortable: !1,
                    editable: !1
                },
                createdTime: {
                    label: "Created Time",
                    cell: "html",
                    editable: !1,
                    sortable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return Utils.formatDate({
                                date: rawValue
                            });
                        }
                    })
                },
                updatedTime: {
                    label: "Updated Time",
                    cell: "html",
                    editable: !1,
                    sortable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return Utils.formatDate({
                                date: rawValue
                            });
                        }
                    })
                }
            }, this.pendingTaskCollection);
        }
    });
    return PendingTaskTableLayoutView;
});