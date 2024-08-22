define([ "require", "backbone", "hbs!tmpl/administrator/AdministratorLayoutView_tmpl", "collection/VEntityList", "models/VSearch", "utils/Utils", "utils/Enums", "utils/UrlLinks", "utils/CommonViewFunction" ], function(require, Backbone, AdministratorLayoutView_tmpl, VEntityList, VSearch, Utils, Enums, UrlLinks, CommonViewFunction) {
    "use strict";
    var AdministratorLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "AdministratorLayoutView",
        template: AdministratorLayoutView_tmpl,
        regions: {
            RBusinessMetadataTableLayoutView: "#r_businessMetadataTableLayoutView",
            REnumTableLayoutView: "#r_enumTableLayoutView",
            RAdminTableLayoutView: "#r_adminTableLayoutView",
            RTypeSystemTreeLayoutView: "#r_typeSystemTreeLayoutView"
        },
        ui: {
            tablist: '[data-id="tab-list"] li'
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.tablist] = function(e) {
                var tabValue = $(e.currentTarget).attr("role");
                Utils.setUrl({
                    url: Utils.getUrlState.getQueryUrl().queyParams[0],
                    urlParams: {
                        tabActive: tabValue || "properties"
                    },
                    mergeBrowserUrl: !1,
                    trigger: !1,
                    updateTabState: !0
                });
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "value", "entityDefCollection", "businessMetadataDefCollection", "enumDefCollection", "searchTableFilters"));
        },
        onShow: function() {
            this.value && this.value.tabActive && (this.$(".nav.nav-tabs").find('[role="' + this.value.tabActive + '"]').addClass("active").siblings().removeClass("active"), 
            this.$(".tab-content").find('[role="' + this.value.tabActive + '"]').addClass("active").siblings().removeClass("active"), 
            $("html, body").animate({
                scrollTop: this.$(".tab-content").offset().top + 1200
            }, 1e3));
        },
        bindEvents: function() {
            this.renderEnumLayoutView(), this.renderAdminLayoutView(), this.renderTypeSystemTreeLayoutView();
        },
        onRender: function() {
            this.renderBusinessMetadataLayoutView(), this.bindEvents();
        },
        renderBusinessMetadataLayoutView: function(obj) {
            var that = this;
            require([ "views/business_metadata/BusinessMetadataTableLayoutView" ], function(BusinessMetadataTableLayoutView) {
                that.RBusinessMetadataTableLayoutView.show(new BusinessMetadataTableLayoutView({
                    businessMetadataDefCollection: that.businessMetadataDefCollection,
                    entityDefCollection: that.entityDefCollection
                }));
            });
        },
        renderEnumLayoutView: function(obj) {
            var that = this;
            require([ "views/business_metadata/EnumCreateUpdateItemView" ], function(EnumCreateUpdateItemView) {
                var view = new EnumCreateUpdateItemView({
                    enumDefCollection: that.enumDefCollection,
                    businessMetadataDefCollection: that.businessMetadataDefCollection
                });
                that.REnumTableLayoutView.show(view);
            });
        },
        renderAdminLayoutView: function(obj) {
            var that = this;
            require([ "views/audit/AdminAuditTableLayoutView" ], function(AdminAuditTableLayoutView) {
                var view = new AdminAuditTableLayoutView({
                    searchTableFilters: that.searchTableFilters,
                    entityDefCollection: that.entityDefCollection,
                    enumDefCollection: that.enumDefCollection
                });
                that.RAdminTableLayoutView.show(view);
            });
        },
        renderTypeSystemTreeLayoutView: function(obj) {
            var that = this;
            require([ "views/graph/TypeSystemTreeView" ], function(TypeSystemTreeView) {
                var view = new TypeSystemTreeView({
                    entityDefCollection: that.entityDefCollection
                });
                that.RTypeSystemTreeLayoutView.show(view);
            });
        }
    });
    return AdministratorLayoutView;
});