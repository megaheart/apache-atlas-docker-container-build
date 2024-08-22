define([ "require", "backbone", "hbs!tmpl/site/MetricsUIInfoView_tmpl" ], function(require, Backbone, MetricsUIInfoViewTmpl) {
    var MetricsUIInfoViewView = Backbone.Marionette.LayoutView.extend({
        _viewName: "MetricsUIInfoViewView",
        template: MetricsUIInfoViewTmpl,
        regions: {},
        ui: {},
        events: function() {
            var events = {};
            return events;
        },
        initialize: function(options) {},
        bindEvents: function() {},
        onRender: function() {}
    });
    return MetricsUIInfoViewView;
});