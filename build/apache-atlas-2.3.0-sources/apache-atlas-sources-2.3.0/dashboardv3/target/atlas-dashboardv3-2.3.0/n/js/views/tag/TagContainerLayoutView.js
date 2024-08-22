define([ "require", "backbone", "hbs!tmpl/tag/TagContainerLayoutView_tmpl", "utils/Utils", "utils/Messages", "utils/Globals", "utils/UrlLinks", "models/VTag" ], function(require, Backbone, TagContainerLayoutViewTmpl, Utils, Messages, Globals, UrlLinks, VTag) {
    "use strict";
    var TagContainerLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "TagContainerLayoutView",
        template: TagContainerLayoutViewTmpl,
        regions: {
            RTagLayoutView: "#r_tagLayoutView",
            RTagDetailLayoutView: "#r_tagDetailLayoutView"
        },
        ui: {},
        events: function() {},
        initialize: function(options) {
            _.extend(this.options, options);
        },
        bindEvents: function() {},
        onRender: function() {
            this.renderTagDetailLayoutView(this.options);
        },
        renderTagLayoutView: function(options) {
            var that = this;
            require([ "views/tag/TagLayoutView" ], function(TagLayoutView) {
                that.RTagLayoutView.show(new TagLayoutView(_.extend(options, {
                    collection: that.options.classificationDefCollection
                })));
            });
        },
        renderTagDetailLayoutView: function(options) {
            var that = this;
            require([ "views/tag/TagDetailLayoutView" ], function(TagDetailLayoutView) {
                that.RTagDetailLayoutView && that.RTagDetailLayoutView.show(new TagDetailLayoutView(options));
            });
        }
    });
    return TagContainerLayoutView;
});