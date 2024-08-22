define([ "require", "backbone", "hbs!tmpl/migration/MigrationView_tmpl" ], function(require, Backbone, MigrationViewTmpl) {
    "use strict";
    var ProfileLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "MigrationView",
        template: MigrationViewTmpl,
        regions: {
            RStatisticsView: "#r_statisticsView"
        },
        ui: {},
        events: function() {},
        initialize: function(options) {
            this.apiBaseUrl = this.getBaseUrl(window.location.pathname);
        },
        bindEvents: function() {},
        getBaseUrl: function(url) {
            var path = url.replace(/\/[\w-]+.(jsp|html)|\/+$/gi, ""), splitPath = path.split("/");
            return splitPath && "n" === splitPath[splitPath.length - 1] ? (splitPath.pop(), 
            splitPath.join("/")) : path;
        },
        onRender: function() {
            var that = this;
            require([ "views/site/Statistics", "collection/VTagList", "utils/UrlLinks" ], function(Statistics, VTagList, UrlLinks) {
                that.metricCollection = new VTagList(), that.metricCollection.url = UrlLinks.metricsApiUrl(), 
                that.metricCollection.modelAttrName = "data", that.RStatisticsView.show(new Statistics({
                    metricCollection: that.metricCollection,
                    isMigrationView: !0
                }));
            });
        }
    });
    return ProfileLayoutView;
});