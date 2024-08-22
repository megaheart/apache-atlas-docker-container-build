define([ "require", "backbone", "hbs!tmpl/search/SearchDetailLayoutView_tmpl" ], function(require, Backbone, SearchDetailLayoutViewTmpl) {
    "use strict";
    var SearchDetailLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "SearchDetailLayoutView",
        template: SearchDetailLayoutViewTmpl,
        regions: {
            RSearchResultLayoutView: "#r_searchResultLayoutView"
        },
        ui: {},
        events: function() {},
        initialize: function(options) {
            _.extend(this, _.pick(options, "value", "initialView", "classificationDefCollection", "entityDefCollection", "typeHeaders", "searchVent", "enumDefCollection", "searchTableColumns"));
        },
        bindEvents: function() {},
        onRender: function() {
            this.renderSearchResultLayoutView();
        },
        renderSearchResultLayoutView: function() {
            var that = this;
            require([ "views/search/SearchResultLayoutView" ], function(SearchResultLayoutView) {
                that.RSearchResultLayoutView && that.RSearchResultLayoutView.show(new SearchResultLayoutView(that.options));
            });
        }
    });
    return SearchDetailLayoutView;
});