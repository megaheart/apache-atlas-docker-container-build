define([ "require", "backbone", "hbs!tmpl/site/AboutAtlas_tmpl", "modules/Modal", "models/VCommon", "utils/UrlLinks" ], function(require, Backbone, AboutAtlasTmpl, Modal, VCommon, UrlLinks) {
    "use strict";
    var AboutAtlasView = Backbone.Marionette.LayoutView.extend({
        template: AboutAtlasTmpl,
        regions: {},
        ui: {
            atlasVersion: "[data-id='atlasVersion']"
        },
        events: function() {},
        initialize: function(options) {
            _.extend(this, options);
            var modal = new Modal({
                title: "Apache Atlas",
                content: this,
                okCloses: !0,
                showFooter: !0,
                allowCancel: !1
            }).open();
            modal.on("closeModal", function() {
                modal.trigger("cancel");
            });
        },
        bindEvents: function() {},
        onRender: function() {
            var that = this, url = UrlLinks.versionApiUrl(), VCommonModel = new VCommon();
            VCommonModel.aboutUs(url, {
                success: function(data) {
                    var str = "<b>Version : </b>" + _.escape(data.Version);
                    that.ui.atlasVersion.html(str);
                },
                complete: function() {}
            });
        }
    });
    return AboutAtlasView;
});