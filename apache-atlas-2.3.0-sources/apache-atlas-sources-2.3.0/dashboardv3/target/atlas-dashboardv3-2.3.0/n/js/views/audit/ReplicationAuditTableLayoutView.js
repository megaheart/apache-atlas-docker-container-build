define([ "require", "backbone", "hbs!tmpl/audit/ReplicationAuditTableLayoutView_tmpl", "utils/CommonViewFunction", "utils/Utils", "collection/VSearchList", "collection/VEntityList", "utils/Messages", "utils/UrlLinks" ], function(require, Backbone, ReplicationAuditTableLayoutView_tmpl, CommonViewFunction, Utils, VSearchList, VEntityList, Messages, UrlLinks) {
    "use strict";
    var ReplicationAuditTableLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "ReplicationAuditTableLayoutView",
        template: ReplicationAuditTableLayoutView_tmpl,
        regions: {
            RReplicationAuditTableLayoutView: "#r_replicationAuditTableLayoutView"
        },
        ui: {},
        events: function() {
            var events = {};
            return events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "entity", "entityName", "attributeDefs")), this.searchCollection = new VSearchList(), 
            this.entityModel = new (new VEntityList().model)(), this.limit = 25, this.offset = 0, 
            this.name = Utils.getName(this.entity), this.commonTableOptions = {
                collection: this.searchCollection,
                includePagination: !1,
                includeAtlasPagination: !0,
                includeFooterRecords: !1,
                includeColumnManager: !1,
                includeOrderAbleColumns: !1,
                includeSizeAbleColumns: !1,
                includeTableLoader: !0,
                includeAtlasPageSize: !0,
                includeAtlasTableSorting: !0,
                atlasPaginationOpts: {
                    limit: this.limit,
                    offset: this.offset,
                    fetchCollection: this.fetchCollection.bind(this)
                },
                gridOpts: {
                    emptyText: "No Record found!",
                    className: "table table-hover backgrid table-quickMenu colSort"
                },
                filterOpts: {},
                paginatorOpts: {}
            };
        },
        bindEvents: function() {},
        onRender: function() {
            this.renderTableLayoutView();
        },
        fetchCollection: function(options) {
            var that = this;
            this.searchCollection.getExpimpAudit(this.searchCollection.queryParams, {
                success: function(response) {
                    that.searchCollection.reset(response, options);
                }
            });
        },
        renderTableLayoutView: function() {
            var that = this;
            require([ "utils/TableLayout" ], function(TableLayout) {
                var columnCollection = Backgrid.Columns.extend({
                    sortKey: "displayOrder",
                    comparator: function(item) {
                        return item.get(this.sortKey) || 999;
                    },
                    setPositions: function() {
                        return _.each(this.models, function(model, index) {
                            model.set("displayOrder", index + 1, {
                                silent: !0
                            });
                        }), this;
                    }
                }), columns = new columnCollection(that.getColumn());
                columns.setPositions().sort(), that.RReplicationAuditTableLayoutView.show(new TableLayout(_.extend({}, that.commonTableOptions, {
                    columns: columns
                }))), _.extend(that.searchCollection.queryParams, {
                    limit: that.limit,
                    offset: that.offset,
                    serverName: that.name
                }), that.fetchCollection(_.extend({
                    fromUrl: !0
                }));
            });
        },
        getColumn: function(argument) {
            var that = this, col = {};
            return col.tools = {
                label: "",
                cell: "html",
                editable: !1,
                sortable: !1,
                fixWidth: "20",
                cell: Backgrid.ExpandableCell,
                accordion: !1,
                expand: function(el, model) {
                    el.attr("colspan", "6");
                    var result = JSON.parse(model.get("resultSummary")), view = "<table class='table table-bordered table-striped'>" + CommonViewFunction.propertyTable({
                        scope: that,
                        valueObject: result,
                        attributeDefs: that.attributeDefs
                    }) + "</table>";
                    $(el).append($("<div>").html(view));
                }
            }, col.operation = {
                label: "Operation",
                cell: "string",
                editable: !1,
                sortable: !1,
                className: "searchTableName"
            }, col.sourceServerName = {
                label: "Source Server",
                cell: "string",
                editable: !1,
                sortable: !1,
                className: "searchTableName"
            }, col.targetServerName = {
                label: "Target Server",
                cell: "string",
                editable: !1,
                sortable: !1,
                className: "searchTableName"
            }, col.startTime = {
                label: "Operation StartTime",
                cell: "html",
                editable: !1,
                sortable: !1,
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function(rawValue, model) {
                        return rawValue ? Utils.formatDate({
                            date: rawValue
                        }) : "-";
                    }
                })
            }, col.endTime = {
                label: "Operation EndTime",
                cell: "html",
                editable: !1,
                sortable: !1,
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function(rawValue, model) {
                        return rawValue ? Utils.formatDate({
                            date: rawValue
                        }) : "-";
                    }
                })
            }, this.searchCollection.constructor.getTableCols(col, this.searchCollection);
        }
    });
    return ReplicationAuditTableLayoutView;
});