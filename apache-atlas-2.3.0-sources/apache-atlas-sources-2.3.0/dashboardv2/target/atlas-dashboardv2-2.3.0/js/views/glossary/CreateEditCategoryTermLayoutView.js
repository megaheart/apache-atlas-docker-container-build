define([ "require", "backbone", "hbs!tmpl/glossary/CreateEditCategoryTermLayoutView_tmpl", "utils/Utils", "utils/UrlLinks" ], function(require, Backbone, CreateEditCategoryTermLayoutViewTmpl, Utils, UrlLinks) {
    var CreateEditCategoryTermLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "CreateEditCategoryTermLayoutView",
        template: CreateEditCategoryTermLayoutViewTmpl,
        templateHelpers: function() {
            return {
                create: this.create,
                modelJSON: this.modelJSON
            };
        },
        regions: {},
        ui: {
            qualifiedName: "[data-id='qualifiedName']",
            name: "[data-id='name']",
            shortDescription: "[data-id='shortDescription']",
            longDescription: "[data-id='longDescription']",
            categoryTermForm: "[data-id='categoryTermForm']"
        },
        events: function() {
            var events = {};
            return events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "glossaryCollection", "modelJSON")), this.modelJSON || (this.create = !0);
        },
        bindEvents: function() {},
        onRender: function() {}
    });
    return CreateEditCategoryTermLayoutView;
});