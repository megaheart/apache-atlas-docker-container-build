define([ "require", "backbone", "hbs!tmpl/dev_debug/DebugMetricsLayoutView_tmpl", "utils/Utils" ], function(require, Backbone, DebugMetricsLayoutView_tmpl, Utils) {
    "use strict";
    var DebugMetricsLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "DebugMetricsLayoutView",
        template: DebugMetricsLayoutView_tmpl,
        regions: {
            RDebugMetricsLayoutView: "#r_debugMetricsLayoutView"
        },
        ui: {
            tablist: '[data-id="tab-list"] li'
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.tablist] = function(e) {
                var tabValue = $(e.currentTarget).attr("role");
                Utils.setUrl({
                    url: Utils.getUrlState.getQueryUrl().queyParams[0],
                    urlParams: {
                        tabActive: tabValue || "properties"
                    },
                    mergeBrowserUrl: !1,
                    trigger: !1,
                    updateTabState: !0
                });
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "value"));
        },
        onShow: function() {
            this.value && this.value.tabActive && (this.$(".nav.nav-tabs").find('[role="' + this.value.tabActive + '"]').addClass("active").siblings().removeClass("active"), 
            this.$(".tab-content").find('[role="' + this.value.tabActive + '"]').addClass("active").siblings().removeClass("active"), 
            $("html, body").animate({
                scrollTop: this.$(".tab-content").offset().top + 1200
            }, 1e3));
        },
        bindEvents: function() {},
        onRender: function() {
            this.metrice2LayoutView(), this.bindEvents();
        },
        metrice2LayoutView: function(obj) {
            var that = this;
            require([ "views/site/DebugMetricsTableLayoutView" ], function(DebugMetricsTableLayoutView) {
                that.RDebugMetricsLayoutView.show(new DebugMetricsTableLayoutView());
            });
        }
    });
    return DebugMetricsLayoutView;
});