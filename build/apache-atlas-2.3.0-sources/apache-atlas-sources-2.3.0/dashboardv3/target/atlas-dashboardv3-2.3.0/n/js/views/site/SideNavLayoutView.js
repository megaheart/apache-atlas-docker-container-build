define([ "require", "hbs!tmpl/site/SideNavLayoutView_tmpl", "utils/Utils" ], function(require, tmpl, Utils) {
    "use strict";
    var SideNavLayoutView = Marionette.LayoutView.extend({
        template: tmpl,
        regions: {
            RSidebarContent: "#r_SidebarContent"
        },
        ui: {},
        templateHelpers: function() {},
        events: function() {},
        initialize: function(options) {
            this.options = options;
        },
        onRender: function() {
            this.renderSideLayoutView();
        },
        renderSideLayoutView: function(options) {
            var that = this;
            options && (that.options = options), require([ "views/search/SearchFilterBrowseLayoutView" ], function(SearchFilterBrowseLayoutView) {
                that.RSidebarContent.show(new SearchFilterBrowseLayoutView(that.options));
            });
        },
        manualRender: function(options) {
            this.RSidebarContent.currentView && this.RSidebarContent.currentView.manualRender(options);
        }
    });
    return SideNavLayoutView;
});