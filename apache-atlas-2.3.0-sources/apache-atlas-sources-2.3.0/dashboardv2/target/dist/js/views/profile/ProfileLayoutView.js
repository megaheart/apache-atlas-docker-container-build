define([ "require", "backbone", "hbs!tmpl/profile/ProfileLayoutView_tmpl", "collection/VProfileList", "utils/Utils", "utils/Messages", "utils/Globals" ], function(require, Backbone, ProfileLayoutViewTmpl, VProfileList, Utils, Messages, Globals) {
    "use strict";
    var ProfileLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "ProfileLayoutView",
        template: ProfileLayoutViewTmpl,
        regions: {
            RProfileTableOrColumnLayoutView: "#r_profileTableOrColumnLayoutView"
        },
        ui: {},
        templateHelpers: function() {
            return {
                profileData: this.profileData ? this.profileData.attributes : this.profileData,
                typeName: this.typeName
            };
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.addTag] = "checkedValue", events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "profileData", "guid", "value", "typeName", "entityDetail", "typeHeaders", "entityDefCollection", "enumDefCollection", "classificationDefCollection", "glossaryCollection")), 
            "hive_db" !== this.typeName && "hbase_namespace" !== this.typeName || (this.profileData = {
                attributes: !0
            });
        },
        bindEvents: function() {},
        onRender: function() {
            this.profileData && ("hive_table" === this.typeName ? this.renderProfileTableLayoutView() : "hive_db" === this.typeName || "hbase_namespace" === this.typeName ? this.renderSearchResultLayoutView() : this.renderProfileColumnLayoutView());
        },
        renderSearchResultLayoutView: function() {
            var that = this;
            require([ "views/search/SearchResultLayoutView" ], function(SearchResultLayoutView) {
                var value = _.extend({}, that.value, {
                    guid: that.guid,
                    searchType: "relationship",
                    typeName: that.typeName
                });
                that.RProfileTableOrColumnLayoutView.show(new SearchResultLayoutView({
                    value: value,
                    profileDBView: !0,
                    typeHeaders: that.typeHeaders,
                    entityDefCollection: that.entityDefCollection,
                    enumDefCollection: that.enumDefCollection,
                    isTableDropDisable: !0,
                    glossaryCollection: that.glossaryCollection,
                    classificationDefCollection: that.classificationDefCollection
                }));
            });
        },
        renderProfileTableLayoutView: function(tagGuid) {
            var that = this;
            require([ "views/profile/ProfileTableLayoutView" ], function(ProfileTableLayoutView) {
                that.RProfileTableOrColumnLayoutView.show(new ProfileTableLayoutView(that.options));
            });
        },
        renderProfileColumnLayoutView: function(tagGuid) {
            var that = this;
            require([ "views/profile/ProfileColumnLayoutView" ], function(ProfileColumnLayoutView) {
                that.RProfileTableOrColumnLayoutView.show(new ProfileColumnLayoutView(that.options));
            });
        }
    });
    return ProfileLayoutView;
});