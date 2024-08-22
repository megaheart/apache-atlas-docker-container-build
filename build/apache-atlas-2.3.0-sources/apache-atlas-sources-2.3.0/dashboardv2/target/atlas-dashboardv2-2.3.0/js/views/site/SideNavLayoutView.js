define([ "require", "hbs!tmpl/site/SideNavLayoutView_tmpl", "utils/Utils", "utils/Globals", "utils/UrlLinks" ], function(require, tmpl, Utils, Globals, UrlLinks) {
    "use strict";
    var SideNavLayoutView = Marionette.LayoutView.extend({
        template: tmpl,
        regions: {
            RTagLayoutView: "#r_tagLayoutView",
            RSearchLayoutView: "#r_searchLayoutView",
            RGlossaryLayoutView: "#r_glossaryLayoutView"
        },
        ui: {
            tabs: ".tabs li a"
        },
        templateHelpers: function() {
            return {
                apiBaseUrl: UrlLinks.apiBaseUrl
            };
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.tabs] = function(e) {
                var urlString = "", elementName = $(e.currentTarget).data(), tabStateUrls = Globals.saveApplicationState.tabState, urlStateObj = Utils.getUrlState, hashUrl = Utils.getUrlState.getQueryUrl().hash;
                urlStateObj.isTagTab() ? hashUrl != tabStateUrls.tagUrl && (Globals.saveApplicationState.tabState.tagUrl = hashUrl) : urlStateObj.isSearchTab() && hashUrl != tabStateUrls.searchUrl && (Globals.saveApplicationState.tabState.searchUrl = hashUrl), 
                "tab-classification" == elementName.name ? urlString = tabStateUrls.tagUrl : "tab-search" == elementName.name ? urlString = tabStateUrls.searchUrl : "tab-glossary" == elementName.name && (urlString = tabStateUrls.glossaryUrl), 
                Utils.setUrl({
                    url: urlString,
                    mergeBrowserUrl: !1,
                    trigger: !0,
                    updateTabState: !0
                });
            }, events;
        },
        initialize: function(options) {
            this.options = options;
        },
        onRender: function() {
            this.renderTagLayoutView(), this.renderSearchLayoutView(), this.renderGlossaryLayoutView(), 
            this.selectTab();
        },
        renderTagLayoutView: function() {
            var that = this;
            require([ "views/tag/TagLayoutView" ], function(TagLayoutView) {
                that.RTagLayoutView.show(new TagLayoutView(_.extend(that.options, {
                    collection: that.options.classificationDefCollection
                })));
            });
        },
        renderSearchLayoutView: function() {
            var that = this;
            require([ "views/search/SearchLayoutView" ], function(SearchLayoutView) {
                that.RSearchLayoutView.show(new SearchLayoutView(that.options));
            });
        },
        renderGlossaryLayoutView: function() {
            var that = this;
            require([ "views/glossary/GlossaryLayoutView" ], function(GlossaryLayoutView) {
                that.RGlossaryLayoutView.show(new GlossaryLayoutView(that.options));
            });
        },
        selectTab: function() {
            var that = this, activeTab = function(options) {
                var view = options.view;
                that.$(".tabs").find('li a[aria-controls="tab-' + view + '"]').parents("li").addClass("active").siblings().removeClass("active"), 
                that.$(".tab-content").find("div#tab-" + view).addClass("active").siblings().removeClass("active");
            };
            if (Utils.getUrlState.isSearchTab() || Utils.getUrlState.isRelationTab() || Utils.getUrlState.isRelationshipDetailPage() || Utils.getUrlState.isInitial() || Utils.getUrlState.isAdministratorTab() || Utils.getUrlState.isDebugMetricsTab()) activeTab({
                view: "search"
            }); else if (Utils.getUrlState.isTagTab()) activeTab({
                view: "classification"
            }); else if (Utils.getUrlState.isGlossaryTab()) activeTab({
                view: "glossary"
            }); else if (Utils.getUrlState.isDetailPage()) {
                var queryParams = Utils.getUrlState.getQueryParams(), view = "search";
                queryParams && queryParams.from && ("classification" == queryParams.from ? view = "classification" : "glossary" == queryParams.from && (view = "glossary")), 
                activeTab({
                    view: view
                });
            }
        }
    });
    return SideNavLayoutView;
});