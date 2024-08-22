define([ "require", "hbs!tmpl/search/SearchFilterBrowseLayoutView_tmpl", "utils/Utils", "utils/Globals", "utils/UrlLinks", "utils/CommonViewFunction", "collection/VSearchList", "modules/Modal", "jstree" ], function(require, SearchFilterBrowseLayoutViewTmpl, Utils, Globals, UrlLinks, CommonViewFunction, VSearchList, Modal) {
    "use strict";
    var SearchFilterBrowseLayoutViewNew = Marionette.LayoutView.extend({
        template: SearchFilterBrowseLayoutViewTmpl,
        regions: {
            RGlossaryTreeRender: '[data-id="r_glossaryTreeRender"]',
            RClassificationTreeRender: '[data-id="r_classificationTreeRender"]',
            REntityTreeRender: '[data-id="r_entityTreeRender"]',
            RCustomFilterTreeRender: '[data-id="r_customFilterTreeRender"]',
            RBusinessMetadataTreeRender: '[data-id="r_businessMetadataTreeRender"]',
            RRelationshipTreeRender: '[data-id="r_relationshipTreeRender"]'
        },
        ui: {
            searchNode: '[data-id="searchNode"]',
            sliderBar: '[data-id="sliderBar"]',
            menuItems: ".menu-items"
        },
        templateHelpers: function() {
            return {
                apiBaseUrl: UrlLinks.apiBaseUrl
            };
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.sliderBar] = function(e) {
                e.stopPropagation(), $("#sidebar-wrapper,#page-wrapper").addClass("animate-me"), 
                $(".container-fluid.view-container").toggleClass("slide-in"), $("#page-wrapper>div").css({
                    width: "auto"
                }), $("#sidebar-wrapper,.search-browse-box,#page-wrapper").removeAttr("style"), 
                setTimeout(function() {
                    $("#sidebar-wrapper,#page-wrapper").removeClass("animate-me");
                }, 301);
            }, events["keyup " + this.ui.searchNode] = function(e) {
                var searchString = _.escape(e.target.value);
                "" === searchString.trim() && this.$(".panel").removeClass("hide"), this.entitySearchTree = this.$('[data-id="entitySearchTree"]'), 
                this.classificationSearchTree = this.$('[data-id="classificationSearchTree"]'), 
                this.termSearchTree = this.$('[data-id="termSearchTree"]'), this.customFilterSearchTree = this.$('[data-id="customFilterSearchTree"]'), 
                this.businessMetadataSearchTree = this.$('[data-id="businessMetadataSearchTree"]'), 
                this.RelationshipSearchTree = this.$('[data-id="relationshipSearchTree"]'), this.entitySearchTree.jstree(!0).show_all(), 
                this.entitySearchTree.jstree("search", searchString), this.classificationSearchTree.jstree(!0).show_all(), 
                this.classificationSearchTree.jstree("search", searchString), this.termSearchTree.jstree(!0).show_all(), 
                this.termSearchTree.jstree("search", searchString), this.customFilterSearchTree.jstree(!0).show_all(), 
                this.customFilterSearchTree.jstree("search", searchString), this.businessMetadataSearchTree.jstree(!0).show_all(), 
                this.businessMetadataSearchTree.jstree("search", searchString), this.$(".panel-heading.dash-button-icon").removeClass("collapsed").attr("aria-expanded", !0), 
                this.$(".panel-collapse.collapse").addClass("in").attr("aria-expanded", !0).css({
                    height: "auto"
                });
            }, events["click " + this.ui.menuItems] = function(e) {
                e.stopPropagation();
            }, events;
        },
        bindEvents: function() {},
        initialize: function(options) {
            this.options = options, _.extend(this, _.pick(options, "typeHeaders", "searchVent", "entityDefCollection", "enumDefCollection", "classificationDefCollection", "relationshipDefCollection", "searchTableColumns", "searchTableFilters", "metricCollection", "glossaryCollection")), 
            this.bindEvents();
        },
        onRender: function() {
            var opt = Utils.getUrlState.getQueryParams();
            this.renderEntityTree(opt), this.renderClassificationTree(opt), this.renderGlossaryTree(opt), 
            this.renderCustomFilterTree(), this.renderBusinessMetadataTree(), this.renderRelationshipTree(), 
            this.showHideGlobalFilter(), this.showDefaultPage();
        },
        showDefaultPage: function() {
            Utils.getUrlState.isSearchTab() && this.options.value && (this.options.value.type || this.options.value.tag || this.options.value.term || this.options.value.gType || Utils.setUrl({
                url: "!/search",
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            }));
        },
        onShow: function() {
            this.$(".search-browse-box").resizable({
                handles: {
                    e: ".slider-bar"
                },
                minWidth: 30,
                minHeight: window.screen.height,
                resize: function(event, ui) {
                    var width = ui.size.width, calcWidth = "calc(100% - " + width + "px)";
                    $("#sidebar-wrapper").width(width), $("#page-wrapper").css({
                        width: calcWidth,
                        marginLeft: width + "px"
                    });
                    var selectedEl = $("#page-wrapper>div");
                    width > 700 ? ($("#page-wrapper").css({
                        overflowX: "auto"
                    }), selectedEl.css({
                        width: window.screen.width - 360
                    })) : ($("#page-wrapper").css({
                        overflow: "none"
                    }), selectedEl.css({
                        width: "100%"
                    }));
                },
                start: function() {
                    $(".searchLayoutView").removeClass("open"), this.expanding = $(".container-fluid.view-container").hasClass("slide-in"), 
                    $(".container-fluid.view-container").removeClass("slide-in"), this.expanding && $("#sidebar-wrapper,#page-wrapper").addClass("animate-me");
                },
                stop: function(event, ui) {
                    !this.expanding && ui.size.width <= 30 && ($("#sidebar-wrapper,#page-wrapper").addClass("animate-me"), 
                    $("#sidebar-wrapper,#page-wrapper,.search-browse-box").removeAttr("style"), $(".container-fluid.view-container").addClass("slide-in")), 
                    setTimeout(function() {
                        $("#sidebar-wrapper,#page-wrapper").removeClass("animate-me");
                    }, 301);
                }
            });
        },
        showHideGlobalFilter: function() {
            this.options.fromDefaultSearch ? this.$(".mainContainer").removeClass("global-filter-browser") : this.$(".mainContainer").addClass("global-filter-browser");
        },
        manualRender: function(options) {
            options && (_.extend(this.options, options), this.showHideGlobalFilter(), this.options.value || this.ui.searchNode.val("").trigger("keyup"), 
            this.RBusinessMetadataTreeRender.currentView && this.RBusinessMetadataTreeRender.currentView.manualRender(this.options), 
            this.RCustomFilterTreeRender.currentView && this.RCustomFilterTreeRender.currentView.manualRender(this.options), 
            this.RGlossaryTreeRender.currentView && this.RGlossaryTreeRender.currentView.manualRender(this.options), 
            this.RClassificationTreeRender.currentView && this.RClassificationTreeRender.currentView.manualRender(this.options), 
            this.REntityTreeRender.currentView && this.REntityTreeRender.currentView.manualRender(this.options), 
            this.RRelationshipTreeRender.currentView && this.RRelationshipTreeRender.currentView.manualRender(this.options));
        },
        renderEntityTree: function(opt) {
            var that = this;
            require([ "views/search/tree/EntityTreeLayoutView" ], function(ClassificationTreeLayoutView) {
                that.REntityTreeRender.show(new ClassificationTreeLayoutView(_.extend({
                    query: that.query
                }, that.options, {
                    value: opt
                })));
            });
        },
        renderClassificationTree: function(opt) {
            var that = this;
            require([ "views/search/tree/ClassificationTreeLayoutView" ], function(ClassificationTreeLayoutView) {
                that.RClassificationTreeRender.show(new ClassificationTreeLayoutView(_.extend({
                    query: that.query
                }, that.options, {
                    value: opt
                })));
            });
        },
        renderGlossaryTree: function(opt) {
            var that = this;
            require([ "views/search/tree/GlossaryTreeLayoutView" ], function(GlossaryTreeLayoutView) {
                that.RGlossaryTreeRender.show(new GlossaryTreeLayoutView(_.extend({
                    query: that.query
                }, that.options, {
                    value: opt
                })));
            });
        },
        renderCustomFilterTree: function() {
            var that = this;
            require([ "views/search/tree/CustomFilterTreeLayoutView" ], function(CustomFilterTreeLayoutView) {
                that.RCustomFilterTreeRender.show(new CustomFilterTreeLayoutView(_.extend({
                    query: that.query
                }, that.options)));
            });
        },
        renderBusinessMetadataTree: function() {
            var that = this;
            require([ "views/search/tree/BusinessMetadataTreeLayoutView" ], function(BusinessMetadataTreeLayoutView) {
                that.RBusinessMetadataTreeRender.show(new BusinessMetadataTreeLayoutView(_.extend({
                    query: that.query
                }, that.options)));
            });
        },
        renderRelationshipTree: function() {
            var that = this;
            require([ "views/search/tree/RelationshipSearchTreeLayoutView" ], function(RelationshipSearchTreeLayoutView) {
                that.RRelationshipTreeRender.show(new RelationshipSearchTreeLayoutView(_.extend({
                    query: that.query
                }, that.options)));
            });
        }
    });
    return SearchFilterBrowseLayoutViewNew;
});