define([ "require", "backbone", "hbs!tmpl/business_metadata/BusinessMetadataContainerLayoutView_tmpl" ], function(require, Backbone, BusinessMetadataContainerLayoutViewTmpl) {
    "use strict";
    var BusinessMetadataContainerLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "BusinessMetadataContainerLayoutView",
        template: BusinessMetadataContainerLayoutViewTmpl,
        regions: {
            RBusinessMetadataDetailContainer: "#r_businessMetadataDetailContainer",
            RBusinessMetadataAttrContainer: "#r_businessMetadataAttrContainer"
        },
        ui: {},
        events: function() {},
        initialize: function(options) {
            _.extend(this, options);
        },
        bindEvents: function() {},
        onRender: function() {
            this.updateView();
        },
        updateView: function() {
            this.model = this.businessMetadataDefCollection.fullCollection.findWhere({
                guid: this.guid
            }), this.renderBusinessMetadataDetailLayoutView(), this.renderBusinessMetadataAttrLayoutView();
        },
        renderBusinessMetadataDetailLayoutView: function() {
            var that = this;
            require([ "views/business_metadata/BusinessMetadataDetailLayoutView" ], function(BusinessMetadataDetailLayoutView) {
                that.isDestroyed || that.RBusinessMetadataDetailContainer.show(new BusinessMetadataDetailLayoutView({
                    businessMetadataDefCollection: that.businessMetadataDefCollection,
                    guid: that.guid,
                    model: that.model,
                    enumDefCollection: that.enumDefCollection,
                    typeHeaders: that.typeHeaders
                }));
            });
        },
        renderBusinessMetadataAttrLayoutView: function() {
            var that = this;
            require([ "views/business_metadata/BusinessMetadataAttrTableLayoutView" ], function(BusinessMetadataAttrTableLayoutView) {
                that.isDestroyed || that.RBusinessMetadataAttrContainer.show(new BusinessMetadataAttrTableLayoutView({
                    businessMetadataDefCollection: that.businessMetadataDefCollection,
                    model: that.model,
                    guid: that.guid,
                    typeHeaders: that.typeHeaders,
                    enumDefCollection: that.enumDefCollection,
                    entityDefCollection: that.entityDefCollection
                }));
            });
        }
    });
    return BusinessMetadataContainerLayoutView;
});