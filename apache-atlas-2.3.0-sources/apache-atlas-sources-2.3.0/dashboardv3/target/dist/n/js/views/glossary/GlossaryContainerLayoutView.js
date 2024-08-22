define([ "require", "backbone", "hbs!tmpl/glossary/GlossaryContainerLayoutView_tmpl" ], function(require, Backbone, GlossaryContainerLayoutViewTmpl) {
    "use strict";
    var GlossaryContainerLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "GlossaryContainerLayoutView",
        template: GlossaryContainerLayoutViewTmpl,
        regions: {
            RGlossaryLayoutView: "#r_glossaryLayoutView",
            RGlossaryDetailLayoutView: "#r_glossaryDetailLayoutView"
        },
        ui: {},
        events: function() {},
        bindEvents: function() {
            var that = this;
            this.options.categoryEvent && this.options.categoryEvent.on("Success:Category", function(options) {
                console.log("categoryEvent:"), that.renderGlossaryDetailLayoutView(that.options);
            });
        },
        initialize: function(options) {
            _.extend(this.options, options), this.bindEvents();
        },
        onRender: function() {
            this.renderGlossaryDetailLayoutView(this.options);
        },
        manualRender: function(options) {
            _.extend(this.options, options), this.renderGlossaryDetailLayoutView(this.options);
        },
        onBeforeDestroy: function() {
            this.options.categoryEvent.off("Success:Category");
        },
        loadGlossaryLayoutView: function(isSuccessCategory) {
            "category" != this.options.value.gType && this.renderGlossaryDetailLayoutView(this.options);
        },
        renderGlossaryDetailLayoutView: function(options) {
            var that = this;
            require([ "views/glossary/GlossaryDetailLayoutView" ], function(GlossaryDetailLayoutView) {
                that.isDestroyed || that.RGlossaryDetailLayoutView.show(new GlossaryDetailLayoutView(options));
            });
        }
    });
    return GlossaryContainerLayoutView;
});