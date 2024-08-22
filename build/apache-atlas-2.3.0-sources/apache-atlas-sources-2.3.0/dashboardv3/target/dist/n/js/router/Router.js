define([ "jquery", "underscore", "backbone", "App", "utils/Globals", "utils/Utils", "utils/UrlLinks", "utils/Enums", "collection/VGlossaryList" ], function($, _, Backbone, App, Globals, Utils, UrlLinks, Enums, VGlossaryList) {
    var AppRouter = Backbone.Router.extend({
        routes: {
            "": "defaultAction",
            "!/search": "renderDefaultSearchLayoutView",
            "!/search/searchResult": function() {
                this.renderDefaultSearchLayoutView({
                    fromSearchResultView: !0
                });
            },
            "!/relationship/relationshipSearchResult": function() {
                this.renderDefaultSearchLayoutView({
                    fromSearchResultView: !0,
                    isRelationshipSearch: !0
                });
            },
            "!/tag": "renderTagLayoutView",
            "!/tag/tagAttribute/(*name)": "renderTagLayoutView",
            "!/glossary": "renderGlossaryLayoutView",
            "!/glossary/:id": "renderGlossaryLayoutView",
            "!/detailPage/:id": "detailPage",
            "!/relationshipDetailPage/:id": "relationshipDetailPage",
            "!/administrator": "administrator",
            "!/administrator/businessMetadata/:id": "businessMetadataDetailPage",
            "!/debugMetrics": "debugMetrics",
            "*actions": "defaultAction"
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "entityDefCollection", "typeHeaders", "enumDefCollection", "classificationDefCollection", "metricCollection", "classificationAndMetricEvent", "businessMetadataDefCollection", "relationshipDefCollection")), 
            this.showRegions(), this.bindCommonEvents(), this.listenTo(this, "route", this.postRouteExecute, this), 
            this.searchVent = new Backbone.Wreqr.EventAggregator(), this.categoryEvent = new Backbone.Wreqr.EventAggregator(), 
            this.glossaryCollection = new VGlossaryList([], {
                comparator: function(item) {
                    return item.get("name");
                }
            }), this.preFetchedCollectionLists = {
                entityDefCollection: this.entityDefCollection,
                typeHeaders: this.typeHeaders,
                enumDefCollection: this.enumDefCollection,
                classificationDefCollection: this.classificationDefCollection,
                glossaryCollection: this.glossaryCollection,
                metricCollection: this.metricCollection,
                classificationAndMetricEvent: this.classificationAndMetricEvent,
                businessMetadataDefCollection: this.businessMetadataDefCollection,
                relationshipDefCollection: this.relationshipDefCollection
            }, this.ventObj = {
                searchVent: this.searchVent,
                categoryEvent: this.categoryEvent
            }, this.sharedObj = {
                searchTableColumns: {},
                glossary: {
                    selectedItem: {}
                },
                searchTableFilters: {
                    tagFilters: {},
                    entityFilters: {},
                    relationshipFilters: {}
                }
            };
        },
        bindCommonEvents: function() {
            var that = this;
            $("body").on("click", "a.show-stat", function() {
                require([ "views/site/StatisticsTimelineView" ], function(Statistics) {
                    new Statistics(_.extend({}, that.preFetchedCollectionLists, that.sharedObj, that.ventObj));
                });
            }), $("body").on("click", "li.aboutAtlas", function() {
                require([ "views/site/AboutAtlas" ], function(AboutAtlas) {
                    new AboutAtlas();
                });
            }), $("body").on("click", "a.show-classification", function() {
                Utils.setUrl({
                    url: "!/tag",
                    mergeBrowserUrl: !1,
                    trigger: !0,
                    updateTabState: !0
                });
            }), $("body").on("click", "a.show-glossary", function() {
                Utils.setUrl({
                    url: "!/glossary",
                    mergeBrowserUrl: !1,
                    trigger: !0,
                    updateTabState: !0
                });
            });
        },
        showRegions: function() {},
        renderViewIfNotExists: function(options) {
            var view = options.view, render = options.render, viewName = options.viewName, manualRender = options.manualRender;
            view.currentView ? manualRender && viewName ? viewName === view.currentView._viewName ? options.manualRender(options) : render && view.show(options.render(options)) : manualRender && options.manualRender(options) : render && view.show(options.render(options));
        },
        execute: function(callback, args) {
            this.preRouteExecute(), callback && callback.apply(this, args), this.postRouteExecute();
        },
        preRouteExecute: function() {
            $("body").removeClass("global-search-active"), $(".tooltip").tooltip("hide");
        },
        postRouteExecute: function(name, args) {},
        getHeaderOptions: function(Header, options) {
            var that = this;
            return {
                view: App.rHeader,
                manualRender: function() {
                    this.view.currentView.manualRender(options);
                },
                render: function() {
                    return new Header(_.extend({}, that.preFetchedCollectionLists, that.sharedObj, that.ventObj, options));
                }
            };
        },
        detailPage: function(id) {
            var that = this;
            id && require([ "views/site/Header", "views/detail_page/DetailPageLayoutView", "views/site/SideNavLayoutView" ], function(Header, DetailPageLayoutView, SideNavLayoutView) {
                var paramObj = Utils.getUrlState.getQueryParams(), options = _.extend({}, that.preFetchedCollectionLists, that.sharedObj, that.ventObj);
                that.renderViewIfNotExists(that.getHeaderOptions(Header)), that.renderViewIfNotExists({
                    view: App.rSideNav,
                    manualRender: function() {
                        this.view.currentView.manualRender(options);
                    },
                    render: function() {
                        return new SideNavLayoutView(options);
                    }
                });
                var dOptions = _.extend({
                    id: id,
                    value: paramObj
                }, options);
                that.renderViewIfNotExists({
                    view: App.rContent,
                    viewName: "DetailPageLayoutView",
                    manualRender: function() {
                        this.view.currentView.manualRender(dOptions);
                    },
                    render: function() {
                        return new DetailPageLayoutView(dOptions);
                    }
                });
            });
        },
        relationshipDetailPage: function(id) {
            var that = this;
            id && require([ "views/site/Header", "views/detail_page/RelationshipDetailPageLayoutView", "views/site/SideNavLayoutView" ], function(Header, RelationshipDetailPageLayoutView, SideNavLayoutView) {
                var paramObj = Utils.getUrlState.getQueryParams(), options = _.extend({}, that.preFetchedCollectionLists, that.sharedObj, that.ventObj);
                that.renderViewIfNotExists(that.getHeaderOptions(Header)), that.renderViewIfNotExists({
                    view: App.rSideNav,
                    manualRender: function() {
                        this.view.currentView.manualRender(options);
                    },
                    render: function() {
                        return new SideNavLayoutView(options);
                    }
                });
                var dOptions = _.extend({
                    id: id,
                    value: paramObj
                }, options);
                that.renderViewIfNotExists({
                    view: App.rContent,
                    viewName: "RelationshipDetailPageLayoutView",
                    manualRender: function() {
                        this.view.currentView.manualRender(dOptions);
                    },
                    render: function() {
                        return new RelationshipDetailPageLayoutView(dOptions);
                    }
                });
            });
        },
        renderTagLayoutView: function(tagName) {
            var that = this;
            require([ "views/site/Header", "views/tag/TagContainerLayoutView", "views/site/SideNavLayoutView" ], function(Header, TagContainerLayoutView, SideNavLayoutView) {
                var paramObj = Utils.getUrlState.getQueryParams();
                if (void 0 === paramObj && !tagName || "viewType=tree" === tagName || "viewType=flat" === tagName) return void that.defaultAction();
                that.renderViewIfNotExists(that.getHeaderOptions(Header));
                var options = _.extend({
                    tag: tagName,
                    value: paramObj
                }, that.preFetchedCollectionLists, that.sharedObj, that.ventObj);
                that.renderViewIfNotExists({
                    view: App.rSideNav,
                    manualRender: function() {
                        this.view.currentView.manualRender(options);
                    },
                    render: function() {
                        return new SideNavLayoutView(options);
                    }
                }), App.rContent.show(new TagContainerLayoutView(options));
            });
        },
        renderGlossaryLayoutView: function(id) {
            var that = this;
            require([ "views/site/Header", "views/glossary/GlossaryContainerLayoutView", "views/search/SearchDefaultLayoutView", "views/site/SideNavLayoutView" ], function(Header, GlossaryContainerLayoutView, SearchDefaultLayoutView, SideNavLayoutView) {
                var paramObj = Utils.getUrlState.getQueryParams();
                if (void 0 === paramObj && !id || "viewType=category" === id || "viewType=term" === id) return void that.defaultAction();
                that.renderViewIfNotExists(that.getHeaderOptions(Header));
                var options = _.extend({
                    guid: id,
                    value: paramObj
                }, that.preFetchedCollectionLists, that.sharedObj, that.ventObj);
                that.renderViewIfNotExists({
                    view: App.rSideNav,
                    manualRender: function() {
                        this.view.currentView.manualRender(options);
                    },
                    render: function() {
                        return new SideNavLayoutView(options);
                    }
                }), "glossary" !== paramObj.gType ? that.renderViewIfNotExists({
                    view: App.rContent,
                    viewName: "GlossaryContainerLayoutView",
                    manualRender: function() {
                        this.view.currentView.manualRender(options);
                    },
                    render: function() {
                        return new GlossaryContainerLayoutView(options);
                    }
                }) : (options.value = "", options.initialView = !0, that.renderViewIfNotExists(that.getHeaderOptions(Header, {
                    fromDefaultSearch: !0
                })), App.rContent.show(new SearchDefaultLayoutView(options)));
            });
        },
        renderDefaultSearchLayoutView: function(opt) {
            var that = this;
            require([ "views/site/Header", "views/search/SearchDefaultLayoutView", "views/site/SideNavLayoutView", "collection/VTagList" ], function(Header, SearchDefaultLayoutView, SideNavLayoutView, VTagList) {
                function renderSearchView() {
                    var isinitialView = !0, tempParam = _.extend({}, paramObj);
                    paramObj && (isinitialView = 0 === (paramObj.type || ("true" == paramObj.dslChecked ? "" : paramObj.tag || paramObj.term || paramObj.relationshipName) || (paramObj.query ? paramObj.query.trim() : "")).length);
                    var options = _.extend({
                        value: paramObj,
                        initialView: isinitialView,
                        fromDefaultSearch: !opt || opt && !opt.fromSearchResultView,
                        fromSearchResultView: opt && opt.fromSearchResultView || !1,
                        fromCustomFilterView: opt && opt.fromCustomFilterView || !1,
                        isTypeTagNotExists: paramObj && (paramObj.type != tempParam.type || tempParam.tag != paramObj.tag)
                    }, that.preFetchedCollectionLists, that.sharedObj, that.ventObj);
                    that.renderViewIfNotExists(that.getHeaderOptions(Header, {
                        fromDefaultSearch: options.fromDefaultSearch
                    })), that.renderViewIfNotExists({
                        view: App.rSideNav,
                        manualRender: function() {
                            this.view.currentView.manualRender(options);
                        },
                        render: function() {
                            return new SideNavLayoutView(options);
                        }
                    }), that.renderViewIfNotExists({
                        view: App.rContent,
                        viewName: "SearchDefaultlLayoutView",
                        manualRender: function() {
                            this.view.currentView.manualRender(options);
                        },
                        render: function() {
                            return new SearchDefaultLayoutView(options);
                        }
                    });
                }
                var paramObj = Utils.getUrlState.getQueryParams();
                if (tag = new VTagList(), paramObj = opt && opt.isRelationshipSearch ? _.pick(paramObj, [ "relationshipName", "searchType", "isCF", "relationshipFilters", "attributes", "uiParameters", "pageLimit", "pageOffset" ]) : paramObj && paramObj.relationshipName ? _.omit(paramObj, [ "relationshipName", "relationshipFilters", "attributes" ]) : _.omit(paramObj, [ "relationshipName" ]), 
                paramObj && void 0 === (paramObj.type || paramObj.tag || paramObj.term || paramObj.query || paramObj.udKeys || paramObj.udLabels || paramObj.relationshipName) && Utils.setUrl({
                    url: "#!/search",
                    mergeBrowserUrl: !1,
                    trigger: !0,
                    updateTabState: !0
                }), "search" !== Utils.getUrlState.getQueryUrl().lastValue && Utils.getUrlState.isAdministratorTab() === !1 && Utils.getUrlState.isRelationTab() === !1 && (paramObj = _.omit(paramObj, [ "tabActive", "ns", "nsa" ]), 
                Utils.setUrl({
                    url: "#!/search/searchResult",
                    urlParams: paramObj,
                    mergeBrowserUrl: !1,
                    trigger: !1,
                    updateTabState: !0
                })), "relationship" !== Utils.getUrlState.getQueryUrl().lastValue && Utils.getUrlState.isRelationTab() === !0 && Utils.setUrl({
                    url: "#!/relationship/relationshipSearchResult",
                    urlParams: paramObj,
                    mergeBrowserUrl: !1,
                    trigger: !1,
                    updateTabState: !0
                }), paramObj) if (paramObj.type || paramObj.entityFilters && (paramObj.entityFilters = null), 
                paramObj.relationshipName || paramObj.relationshipFilters && (paramObj.relationshipFilters = null), 
                paramObj.tag) {
                    var tagValidate = paramObj.tag, isTagPresent = !1;
                    tagValidate.indexOf("*") == -1 ? (classificationDefCollection.fullCollection.each(function(model) {
                        var name = Utils.getName(model.toJSON(), "name");
                        "CLASSIFICATION" == model.get("category") && tagValidate && name === tagValidate && (isTagPresent = !0);
                    }), _.each(Enums.addOnClassification, function(classificationName) {
                        classificationName === tagValidate && (isTagPresent = !0);
                    }), isTagPresent ? renderSearchView() : (tag.url = UrlLinks.classificationDefApiUrl(tagValidate), 
                    tag.fetch({
                        success: function(tagCollection) {
                            isTagPresent = !0;
                        },
                        cust_error: function(model, response) {
                            paramObj.tag = null;
                        },
                        complete: function() {
                            renderSearchView.call();
                        }
                    }))) : renderSearchView();
                } else paramObj.tagFilters && (paramObj.tagFilters = null), renderSearchView(); else renderSearchView();
            });
        },
        administrator: function() {
            var that = this;
            require([ "views/site/Header", "views/site/SideNavLayoutView", "views/administrator/AdministratorLayoutView" ], function(Header, SideNavLayoutView, AdministratorLayoutView) {
                var paramObj = Utils.getUrlState.getQueryParams(), options = _.extend({}, that.preFetchedCollectionLists, that.sharedObj, that.ventObj);
                that.renderViewIfNotExists(that.getHeaderOptions(Header)), that.renderViewIfNotExists({
                    view: App.rSideNav,
                    manualRender: function() {
                        this.view.currentView.manualRender(options);
                    },
                    render: function() {
                        return new SideNavLayoutView(options);
                    }
                }), App.rContent.show(new AdministratorLayoutView(_.extend({
                    value: paramObj,
                    guid: null
                }, options)));
            });
        },
        debugMetrics: function() {
            var that = this;
            require([ "views/site/Header", "views/site/SideNavLayoutView", "views/dev_debug/DebugMetricsLayoutView" ], function(Header, SideNavLayoutView, DebugMetricsLayoutView) {
                var options = (Utils.getUrlState.getQueryParams(), _.extend({}, that.preFetchedCollectionLists, that.sharedObj, that.ventObj));
                that.renderViewIfNotExists(that.getHeaderOptions(Header)), that.renderViewIfNotExists({
                    view: App.rSideNav,
                    manualRender: function() {
                        this.view.currentView.manualRender(options);
                    },
                    render: function() {
                        return new SideNavLayoutView(options);
                    }
                }), App.rContent.show(new DebugMetricsLayoutView(options));
            });
        },
        businessMetadataDetailPage: function(guid) {
            var that = this;
            require([ "views/site/Header", "views/site/SideNavLayoutView", "views/business_metadata/BusinessMetadataContainerLayoutView" ], function(Header, SideNavLayoutView, BusinessMetadataContainerLayoutView) {
                var paramObj = Utils.getUrlState.getQueryParams(), options = _.extend({
                    guid: guid,
                    value: paramObj
                }, that.preFetchedCollectionLists, that.sharedObj, that.ventObj);
                that.renderViewIfNotExists(that.getHeaderOptions(Header)), that.renderViewIfNotExists({
                    view: App.rSideNav,
                    manualRender: function() {
                        this.view.currentView.manualRender(options);
                    },
                    render: function() {
                        return new SideNavLayoutView(options);
                    }
                }), App.rContent.show(new BusinessMetadataContainerLayoutView(options));
            });
        },
        defaultAction: function(actions) {
            Utils.setUrl({
                url: "#!/search",
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            }), console.log("No route:", actions);
        }
    });
    return AppRouter;
});