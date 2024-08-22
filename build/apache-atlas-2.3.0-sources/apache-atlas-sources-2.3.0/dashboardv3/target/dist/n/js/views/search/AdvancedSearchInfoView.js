define([ "require", "backbone", "hbs!tmpl/search/AdvancedSearchInfo_tmpl" ], function(require, Backbone, AdvancedSearchInfoTmpl) {
    var AdvancedSearchInfoView = Backbone.Marionette.LayoutView.extend({
        _viewName: "AdvancedSearchInfoView",
        template: AdvancedSearchInfoTmpl,
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
    return AdvancedSearchInfoView;
});