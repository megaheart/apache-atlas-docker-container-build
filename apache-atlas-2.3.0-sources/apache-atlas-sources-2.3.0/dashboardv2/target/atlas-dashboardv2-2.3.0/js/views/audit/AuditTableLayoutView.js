define([ "require", "backbone", "hbs!tmpl/audit/AuditTableLayoutView_tmpl", "collection/VEntityList", "utils/Utils", "utils/Enums", "utils/UrlLinks" ], function(require, Backbone, AuditTableLayoutView_tmpl, VEntityList, Utils, Enums, UrlLinks) {
    "use strict";
    var AuditTableLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "AuditTableLayoutView",
        template: AuditTableLayoutView_tmpl,
        regions: {
            RAuditTableLayoutView: "#r_auditTableLayoutView"
        },
        ui: {},
        events: function() {
            var events = {};
            return events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "guid", "entity", "entityName", "attributeDefs")), 
            this.entityCollection = new VEntityList(), this.limit = 25, this.offset = 0, this.entityCollection.url = UrlLinks.entityCollectionaudit(this.guid), 
            this.entityCollection.modelAttrName = "events", this.entityModel = new this.entityCollection.model(), 
            this.pervOld = [], this.commonTableOptions = {
                collection: this.entityCollection,
                includeFilter: !1,
                includePagination: !1,
                includeAtlasPagination: !0,
                includeAtlasPageSize: !0,
                includeTableLoader: !0,
                includeAtlasTableSorting: !1,
                showDefaultTableSorted: !0,
                columnSorting: !1,
                includeFooterRecords: !1,
                gridOpts: {
                    className: "table table-hover backgrid table-quickMenu",
                    emptyText: "No records found!"
                },
                sortOpts: {
                    sortColumn: "timestamp",
                    sortDirection: "descending"
                },
                isApiSorting: !0,
                atlasPaginationOpts: this.getPaginationOptions(),
                filterOpts: {},
                paginatorOpts: {}
            }, this.currPage = 1, this.fromSort = !1;
        },
        onRender: function() {
            $.extend(this.entityCollection.queryParams, {
                offset: this.offset,
                count: this.limit,
                sortKey: null,
                order: "sortOrder",
                sortBy: "timestamp",
                sortOrder: "desc"
            }), this.fetchAuditCollection(), this.renderTableLayoutView();
        },
        fetchAuditCollection: function() {
            this.commonTableOptions.atlasPaginationOpts = this.getPaginationOptions(), this.fetchCollection();
        },
        bindEvents: function() {},
        getPaginationOptions: function() {
            return {
                count: this.getPageCount(),
                offset: this.entityCollection.queryParams.offset || this.offset,
                fetchCollection: this.fetchCollection.bind(this)
            };
        },
        getPageCount: function() {
            return this.entityCollection.queryParams.limit || this.entityCollection.queryParams.count || this.limit;
        },
        fetchCollection: function(options) {
            var that = this;
            this.$(".fontLoader").show(), this.$(".tableOverlay").show(), this.entityCollection.queryParams.count = this.getPageCount(), 
            this.entityCollection.queryParams = _.omit(this.entityCollection.queryParams, "limit"), 
            this.entityCollection.fetch({
                success: function(dataOrCollection, response) {
                    that.entityCollection.state.pageSize = that.getPageCount(), that.entityCollection.reset(response, $.extend(options));
                },
                complete: function() {
                    that.$(".fontLoader").hide(), that.$(".tableOverlay").hide(), that.$(".auditTable").show(), 
                    that.fromSort && (that.fromSort = !that.fromSort);
                },
                silent: !0
            });
        },
        renderTableLayoutView: function() {
            var that = this;
            require([ "utils/TableLayout" ], function(TableLayout) {
                var cols = new Backgrid.Columns(that.getAuditTableColumns());
                that.RAuditTableLayoutView.show(new TableLayout(_.extend({}, that.commonTableOptions, {
                    columns: cols
                })));
            });
        },
        backgridHeaderClickHandel: function() {
            var that = this;
            return Backgrid.HeaderCell.extend({
                onClick: function(e) {
                    e.preventDefault();
                    var column = this.column, direction = "ascending", columnName = column.get("name").toLocaleLowerCase();
                    "ascending" === column.get("direction") && (direction = "descending"), column.set("direction", direction);
                    var options = {
                        sortBy: columnName,
                        sortOrder: "ascending" === direction ? "asc" : "desc",
                        offset: that.entityCollection.queryParams.offset || that.offset,
                        count: that.getPageCount()
                    };
                    that.commonTableOptions.sortOpts = {
                        sortColumn: columnName,
                        sortDirection: "ascending" === direction ? "ascending" : "descending"
                    }, $.extend(that.entityCollection.queryParams, options), that.fromSort = !0, that.fetchAuditCollection();
                }
            });
        },
        getAuditTableColumns: function() {
            var that = this;
            return this.entityCollection.constructor.getTableCols({
                tool: {
                    label: "",
                    cell: "html",
                    editable: !1,
                    sortable: !1,
                    fixWidth: "20",
                    cell: Backgrid.ExpandableCell,
                    accordion: !1,
                    expand: function(el, model) {
                        el.attr("colspan", "4"), require([ "views/audit/CreateAuditTableLayoutView" ], function(CreateAuditTableLayoutView) {
                            that.action = model.get("action");
                            var eventModel = that.entityCollection.fullCollection.findWhere({
                                eventKey: model.get("eventKey")
                            }).toJSON(), collectionModel = new that.entityCollection.model(eventModel), view = new CreateAuditTableLayoutView({
                                guid: that.guid,
                                entityModel: collectionModel,
                                action: that.action,
                                entity: that.entity,
                                entityName: that.entityName,
                                attributeDefs: that.attributeDefs
                            });
                            view.render(), $(el).append($("<div>").html(view.$el));
                        });
                    }
                },
                user: {
                    label: "Users",
                    cell: "html",
                    editable: !1,
                    headerCell: that.backgridHeaderClickHandel()
                },
                timestamp: {
                    label: "Timestamp",
                    cell: "html",
                    editable: !1,
                    headerCell: that.backgridHeaderClickHandel(),
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return Utils.formatDate({
                                date: rawValue
                            });
                        }
                    })
                },
                action: {
                    label: "Actions",
                    cell: "html",
                    editable: !1,
                    headerCell: that.backgridHeaderClickHandel(),
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return Enums.auditAction[rawValue] ? Enums.auditAction[rawValue] : rawValue;
                        }
                    })
                }
            }, this.entityCollection);
        }
    });
    return AuditTableLayoutView;
});