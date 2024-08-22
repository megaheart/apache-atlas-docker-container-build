define([ "require", "backbone", "hbs!tmpl/search/RelationSearchDetailLayoutView_tmpl" ], function(require, Backbone, RelationSearchDetailLayoutViewTmpl) {
    "use strict";
    var RelationSearchDetailLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "RelationSearchDetailLayoutView",
        template: RelationSearchDetailLayoutViewTmpl,
        regions: {
            RRelationSearchResultLayoutView: "#r_relationSearchResultLayoutView"
        },
        ui: {},
        events: function() {},
        initialize: function(options) {
            _.extend(this, options);
        },
        bindEvents: function() {},
        onRender: function() {
            this.renderRelationSearchResultLayoutView();
        },
        renderRelationSearchResultLayoutView: function() {
            var that = this;
            require([ "views/search/RelationSearchResultLayoutView" ], function(RelationSearchResultLayoutView) {
                that.RRelationSearchResultLayoutView && that.RRelationSearchResultLayoutView.show(new RelationSearchResultLayoutView(that.options));
            });
        }
    });
    return RelationSearchDetailLayoutView;
});