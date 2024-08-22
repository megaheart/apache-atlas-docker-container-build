define([ "require", "hbs!tmpl/site/Header", "utils/CommonViewFunction", "utils/Globals", "utils/Utils", "utils/UrlLinks" ], function(require, tmpl, CommonViewFunction, Globals, Utils, UrlLinks) {
    "use strict";
    var Header = Marionette.LayoutView.extend({
        template: tmpl,
        regions: {
            RGlobalSearchLayoutView: "#r_globalSearchLayoutView",
            RFilterBrowserLayoutView: "#r_filterBrowserLayoutView"
        },
        templateHelpers: function() {
            return {
                apiDocUrl: UrlLinks.apiDocUrl(),
                isDebugMetricsEnabled: Globals.isDebugMetricsEnabled
            };
        },
        ui: {
            backButton: "[data-id='backButton']",
            menuHamburger: "[data-id='menuHamburger']",
            administrator: "[data-id='administrator']",
            showDebug: "[data-id='showDebug']",
            signOut: "[data-id='signOut']",
            uiSwitch: "[data-id='uiSwitch']"
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.menuHamburger] = function() {
                this.setSearchBoxWidth({
                    updateWidth: function(atlasHeaderWidth) {
                        return $("body").hasClass("full-screen") ? atlasHeaderWidth - 350 : atlasHeaderWidth + 350;
                    }
                }), $("body").toggleClass("full-screen");
            }, events["click " + this.ui.signOut] = function() {
                Utils.localStorage.setValue("last_ui_load", "v2");
                var path = Utils.getBaseUrl(window.location.pathname);
                window.location = path + "/logout.html";
            }, events["click " + this.ui.administrator] = function() {
                Utils.setUrl({
                    url: "#!/administrator",
                    mergeBrowserUrl: !1,
                    trigger: !0,
                    updateTabState: !0
                });
            }, events["click " + this.ui.showDebug] = function() {
                Utils.setUrl({
                    url: "#!/debugMetrics",
                    mergeBrowserUrl: !1,
                    trigger: !0,
                    updateTabState: !0
                });
            }, events["click " + this.ui.uiSwitch] = function() {
                var path = Utils.getBaseUrl(window.location.pathname) + "/index.html";
                window.location.hash.length > 2 && (path += window.location.hash), window.location.href = path;
            }, events;
        },
        initialize: function(options) {
            this.bindEvent(), this.options = options;
        },
        setSearchBoxWidth: function(options) {
            var atlasHeaderWidth = this.$el.find(".atlas-header").width(), minusWidth = Utils.getUrlState.isDetailPage() ? 413 : 263;
            options && options.updateWidth && (atlasHeaderWidth = options.updateWidth(atlasHeaderWidth)), 
            atlasHeaderWidth > minusWidth && this.$el.find(".global-search-container").width(atlasHeaderWidth - minusWidth);
        },
        bindEvent: function() {
            var that = this;
            $(window).resize(function() {
                that.setSearchBoxWidth();
            }), $("body").on("click", ".userPopoverOptions li", function(e) {
                that.$(".user-dropdown").popover("hide");
            });
        },
        onRender: function() {
            var that = this;
            Globals.userLogedIn.status && that.$(".userName").html(Globals.userLogedIn.response.userName), 
            this.options.fromDefaultSearch !== !0 && this.renderGlobalSearch();
        },
        onShow: function() {
            this.setSearchBoxWidth();
        },
        manualRender: function(options) {
            this.setSearchBoxWidth(), (void 0 === options || options && void 0 === options.fromDefaultSearch) && (options = _.extend({}, options, {
                fromDefaultSearch: !1
            })), _.extend(this.options, options), this.options.fromDefaultSearch === !0 ? this.$(".global-search-container>div,.global-filter-browser").hide() : (void 0 === this.RGlobalSearchLayoutView.currentView && this.renderGlobalSearch(), 
            this.$(".global-search-container>div").show());
        },
        renderGlobalSearch: function() {
            var that = this;
            require([ "views/search/GlobalSearchLayoutView" ], function(GlobalSearchLayoutView) {
                that.RGlobalSearchLayoutView.show(new GlobalSearchLayoutView(that.options));
            });
        },
        renderFliterBrowser: function() {
            var that = this;
            require([ "views/search/SearchFilterBrowseLayoutView" ], function(SearchFilterBrowseLayoutView) {
                that.RFilterBrowserLayoutView.show(new SearchFilterBrowseLayoutView(_.extend({
                    toggleLayoutClass: that.toggleLayoutClass
                }, that.options)));
            });
        }
    });
    return Header;
});