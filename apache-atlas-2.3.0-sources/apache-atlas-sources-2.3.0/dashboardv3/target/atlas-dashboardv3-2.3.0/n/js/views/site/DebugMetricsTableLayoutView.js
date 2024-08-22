define([ "require", "backbone", "hbs!tmpl/site/DebugMetricsTableLayoutView_tmpl", "utils/UrlLinks", "collection/VEntityList", "utils/CommonViewFunction", "utils/Utils" ], function(require, Backbone, DebugMetricsTableLayoutViewTmpl, UrlLinks, VEntityList, CommonViewFunction, Utils) {
    "use strict";
    var DebugMetricsTableLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "DebugMetricsTableLayoutView",
        template: DebugMetricsTableLayoutViewTmpl,
        regions: {
            RDebugMetricsTableLayoutView: "#r_debugMetricsTableLayoutView"
        },
        ui: {
            refreshMetricsBtn: '[data-id="refreshMetricsBtn"]',
            metricsInfoBtn: '[data-id="metricsInfo"]'
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.refreshMetricsBtn] = function(e) {
                this.currPage = 1, this.limit = 26, this.debugMetricsCollection.state.pageSize = 25, 
                this.debugMetricsCollection.state.currentPage = 0, this.fetchMetricData();
            }, events["click " + this.ui.metricsInfoBtn] = "metricsInfo", events;
        },
        initialize: function(options) {
            _.extend(this, options);
            this.DATA_MAX_LENGTH = 25, this.debugMetricsCollection = new VEntityList(), this.debugMetricsCollection.url = UrlLinks.debugMetricsApiUrl(), 
            this.debugMetricsCollection.modelAttrName = "data", this.commonTableOptions = {
                collection: this.debugMetricsCollection,
                includeFilter: !1,
                includePagination: !0,
                includeFooterRecords: !0,
                includePageSize: !0,
                includeGotoPage: !0,
                includeAtlasTableSorting: !0,
                includeTableLoader: !0,
                includeColumnManager: !1,
                gridOpts: {
                    className: "table table-hover backgrid table-quickMenu",
                    emptyText: "No records found!"
                },
                filterOpts: {},
                paginatorOpts: {}
            }, this.currPage = 1, this.limit = 26;
        },
        bindEvents: function() {
        },
        onRender: function() {
            this.bindEvents(), this.$(".debug-metrics-table").show(), this.fetchMetricData();
        },
        metricsInfo: function(e) {
            require([ "views/site/MetricsUIInfoView", "modules/Modal" ], function(MetricsUIInfoView, Modal) {
                var view = new MetricsUIInfoView(), modal = new Modal({
                    title: "Debug Metrics",
                    content: view,
                    okCloses: !0,
                    showFooter: !1,
                    allowCancel: !1
                }).open();
                view.on("closeModal", function() {
                    modal.trigger("cancel");
                });
            });
        },
        fetchMetricData: function(options) {
            var that = this;
            this.debugMetricsCollection.fetch({
                success: function(data) {
                    var data = _.first(data.toJSON()), metricsDataKeys = data ? Object.keys(data) : null;
                    that.debugMetricsCollection.fullCollection.reset(), _.each(metricsDataKeys.sort(), function(keyName) {
                        that.debugMetricsCollection.fullCollection.add(data[keyName]);
                    });
                },
                complete: function(data) {
                    that.renderTableLayoutView();
                }
            });
        },
        renderTableLayoutView: function() {
            var that = this;
            require([ "utils/TableLayout" ], function(TableLayout) {
                var cols = new Backgrid.Columns(that.getAuditTableColumns());
                that.RDebugMetricsTableLayoutView.show(new TableLayout(_.extend({}, that.commonTableOptions, {
                    columns: cols
                }))), that.debugMetricsCollection.models.length < that.limit || that.RDebugMetricsTableLayoutView.$el.find("table tr").last().hide();
            });
        },
        millisecondsToSeconds: function(rawValue) {
            return parseFloat(rawValue % 6e4 / 1e3).toFixed(3);
        },
        getAuditTableColumns: function() {
            var that = this;
            return this.debugMetricsCollection.constructor.getTableCols({
                name: {
                    label: "Name",
                    cell: "html",
                    sortable: !0,
                    editable: !1
                },
                numops: {
                    label: "Count",
                    cell: "html",
                    toolTip: "Number of times the API has been hit since Atlas started",
                    sortable: !0,
                    editable: !1
                },
                minTime: {
                    label: "Min Time (secs)",
                    cell: "html",
                    toolTip: "Minimum API execution time since Atlas started",
                    sortable: !0,
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return that.millisecondsToSeconds(rawValue);
                        }
                    })
                },
                maxTime: {
                    label: "Max Time (secs)",
                    cell: "html",
                    toolTip: "Maximum API execution time since Atlas started",
                    sortable: !0,
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return that.millisecondsToSeconds(rawValue);
                        }
                    })
                },
                avgTime: {
                    label: "Average Time (secs)",
                    cell: "html",
                    toolTip: "Average time taken to execute by an API within an interval of time",
                    sortable: !0,
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return that.millisecondsToSeconds(rawValue);
                        }
                    })
                }
            }, this.debugMetricsCollection);
        }
    });
    return DebugMetricsTableLayoutView;
});