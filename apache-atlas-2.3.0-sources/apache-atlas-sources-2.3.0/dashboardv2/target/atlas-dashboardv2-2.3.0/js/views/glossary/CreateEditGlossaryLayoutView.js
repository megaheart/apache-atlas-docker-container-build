define([ "require", "backbone", "hbs!tmpl/glossary/CreateEditGlossaryLayoutView_tmpl", "utils/Utils", "utils/UrlLinks" ], function(require, Backbone, CreateEditGlossaryLayoutViewTmpl, Utils, UrlLinks) {
    var CreateEditGlossaryLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "CreateEditGlossaryLayoutView",
        template: CreateEditGlossaryLayoutViewTmpl,
        templateHelpers: function() {
            return {
                create: this.create
            };
        },
        regions: {},
        ui: {
            name: "[data-id='name']",
            shortDescription: "[data-id='shortDescription']",
            longDescription: "[data-id='longDescription']",
            glossaryForm: "[data-id='glossaryForm']"
        },
        events: function() {
            var events = {};
            return events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "glossaryCollection", "model")), this.model || (this.create = !0);
        },
        bindEvents: function() {},
        onRender: function() {}
    });
    return CreateEditGlossaryLayoutView;
});