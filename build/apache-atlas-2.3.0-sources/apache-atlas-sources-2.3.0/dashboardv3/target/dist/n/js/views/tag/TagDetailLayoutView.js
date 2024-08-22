define([ "require", "backbone", "hbs!tmpl/tag/TagDetailLayoutView_tmpl" ], function(require, Backbone, TagDetailLayoutView_tmpl) {
    "use strict";
    var TagDetailLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "TagDetailLayoutView",
        template: TagDetailLayoutView_tmpl,
        regions: {
            RSearchResultLayoutView: "#r_searchResultLayoutView",
            RTagAttributeDetailLayoutView: "#r_TagAttributeDetailLayoutView"
        },
        ui: {},
        events: function() {},
        initialize: function(options) {
            _.extend(this, _.pick(options, "tag", "value", "glossaryCollection", "classificationDefCollection", "entityDefCollection", "typeHeaders", "enumDefCollection", "searchVent")), 
            this.collection = this.classificationDefCollection;
        },
        bindEvents: function() {},
        onRender: function() {
            this.renderSearchResultLayoutView(), this.renderTagAttributeCompositeView();
        },
        renderSearchResultLayoutView: function() {
            var that = this;
            require([ "views/search/SearchResultLayoutView" ], function(SearchResultLayoutView) {
                var value = {
                    tag: that.tag,
                    searchType: "basic"
                };
                that.RSearchResultLayoutView && that.RSearchResultLayoutView.show(new SearchResultLayoutView({
                    value: _.extend({}, that.value, value),
                    entityDefCollection: that.entityDefCollection,
                    typeHeaders: that.typeHeaders,
                    tagCollection: that.collection,
                    enumDefCollection: that.enumDefCollection,
                    classificationDefCollection: that.classificationDefCollection,
                    glossaryCollection: that.glossaryCollection,
                    fromView: "classification",
                    searchVent: that.searchVent
                }));
            });
        },
        renderTagAttributeCompositeView: function() {
            var that = this;
            require([ "views/tag/TagAttributeDetailLayoutView" ], function(TagAttributeDetailLayoutView) {
                that.RTagAttributeDetailLayoutView && that.RTagAttributeDetailLayoutView.show(new TagAttributeDetailLayoutView({
                    tag: that.tag,
                    collection: that.collection,
                    enumDefCollection: that.enumDefCollection
                }));
            });
        }
    });
    return TagDetailLayoutView;
});