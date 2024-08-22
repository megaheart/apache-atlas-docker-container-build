define([ "require", "backbone", "hbs!tmpl/business_metadata/BusinessMetadataDetailLayoutView_tmpl", "utils/Utils" ], function(require, Backbone, BusinessMetadataDetailLayoutViewTmpl, Utils) {
    "use strict";
    var BusinessMetadataDetailLayoutView = Backbone.Marionette.LayoutView.extend({
        template: BusinessMetadataDetailLayoutViewTmpl,
        regions: {},
        ui: {
            title: '[data-id="title"]',
            description: '[data-id="description"]',
            textType: '[name="textType"]'
        },
        events: function() {
            var events = {};
            return events["change " + this.ui.textType] = function(e) {
                this.isTextTypeChecked = !this.isTextTypeChecked, this.renderDetail();
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "model")), $("body").addClass("detail-page"), this.isTextTypeChecked = !1;
        },
        onRender: function() {
            this.renderDetail();
        },
        renderDetail: function() {
            this.ui.title.html("<span>" + this.model.get("name") + "</span>"), this.model.get("description") && (this.isTextTypeChecked ? this.ui.description.text(this.model.get("description")) : this.ui.description.html(this.model.get("description")));
        },
        onDestroy: function() {
            Utils.getUrlState.isBSDetail() || $("body").removeClass("detail-page");
        }
    });
    return BusinessMetadataDetailLayoutView;
});