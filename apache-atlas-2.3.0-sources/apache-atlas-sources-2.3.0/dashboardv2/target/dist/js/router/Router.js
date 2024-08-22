define([ "jquery", "underscore", "backbone", "App", "utils/Globals", "utils/Utils", "utils/UrlLinks", "utils/Enums", "collection/VGlossaryList" ], function($, _, Backbone, App, Globals, Utils, UrlLinks, Enums, VGlossaryList) {
    var AppRouter = Backbone.Router.extend({
        routes: {
            "": "defaultAction",
            "!/": "tagAttributePageLoad",
            "!/search": "commonAction",
            "!/search/searchResult": "searchResult",
            "!/relationship": "relationshipSearch",
            "!/relationship/relationshipSearchResult": "relationshipSearch",
            "!/tag": "commonAction",
            "!/tag/tagAttribute/(*name)": "tagAttributePageLoad",
            "!/glossary": "commonAction",
            "!/glossary/:id": "glossaryDetailPage",
            "!/detailPage/:id": "detailPage",
            "!/relationshipDetailPage/:id": "relationshipDetailPage",
            "!/administrator": "administrator",
            "!/administrator/businessMetadata/:id": "businessMetadataDetailPage",
            "!/debugMetrics": "debugMetrics",
            "*actions": "defaultAction"
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "entityDefCollection", "typeHeaders", "enumDefCollection", "classificationDefCollection", "metricCollection", "classificationAndMetricEvent", "businessMetadataDefCollection", "relationshipDefCollection", "relationshipEventAgg")), 
            this.showRegions(), this.bindCommonEvents(), this.listenTo(this, "route", this.postRouteExecute, this), 
            this.searchVent = new Backbone.Wreqr.EventAggregator(), this.importVent = new Backbone.Wreqr.EventAggregator(), 
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
                relationshipDefCollection: this.relationshipDefCollection,
                relationshipEventAgg: this.relationshipEventAgg
            }, this.ventObj = {
                searchVent: this.searchVent,
                importVent: this.importVent
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
            $(".tooltip").tooltip("hide");
        },
        postRouteExecute: function(name, args) {},
        getHeaderOptions: function(Header, options) {
            var that = this;
            return {
                view: App.rNHeader,
                manualRender: function() {
                    this.view.currentView.manualRender();
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
                        this.view.currentView.selectTab();
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
                    view: App.rNContent,
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
                        this.view.currentView.selectTab();
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
                    view: App.rNContent,
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
        tagAttributePageLoad: function(tagName) {
            var that = this;
            require([ "views/site/Header", "views/site/SideNavLayoutView", "views/tag/TagDetailLayoutView" ], function(Header, SideNavLayoutView, TagDetailLayoutView) {
                var paramObj = Utils.getUrlState.getQueryParams(), url = Utils.getUrlState.getQueryUrl().queyParams[0], options = _.extend({
                    tag: tagName,
                    value: paramObj
                }, that.preFetchedCollectionLists, that.sharedObj, that.ventObj);
                if (that.renderViewIfNotExists(that.getHeaderOptions(Header)), that.renderViewIfNotExists({
                    view: App.rSideNav,
                    manualRender: function() {
                        paramObj && paramObj.dlttag && Utils.setUrl({
                            url: url,
                            trigger: !1,
                            updateTabState: !0
                        }), this.view.currentView.RTagLayoutView.currentView.manualRender(_.extend({}, paramObj, {
                            tagName: tagName
                        })), this.view.currentView.selectTab();
                    },
                    render: function() {
                        return paramObj && paramObj.dlttag && Utils.setUrl({
                            url: url,
                            trigger: !1,
                            updateTabState: !0
                        }), new SideNavLayoutView(options);
                    }
                }), tagName) {
                    if (paramObj = Utils.getUrlState.getQueryParams(), paramObj && paramObj.dlttag) return !1;
                    App.rNContent.show(new TagDetailLayoutView(options));
                }
            });
        },
        glossaryDetailPage: function(id) {
            var that = this;
            id && require([ "views/site/Header", "views/glossary/GlossaryDetailLayoutView", "views/site/SideNavLayoutView" ], function(Header, GlossaryDetailLayoutView, SideNavLayoutView) {
                var paramObj = Utils.getUrlState.getQueryParams(), options = _.extend({
                    guid: id,
                    value: paramObj
                }, that.preFetchedCollectionLists, that.sharedObj, that.ventObj);
                that.renderViewIfNotExists(that.getHeaderOptions(Header)), that.renderViewIfNotExists({
                    view: App.rSideNav,
                    manualRender: function() {
                        this.view.currentView.RGlossaryLayoutView.currentView.manualRender(options), this.view.currentView.selectTab();
                    },
                    render: function() {
                        return new SideNavLayoutView(options);
                    }
                }), App.rNContent.show(new GlossaryDetailLayoutView(options));
            });
        },
        searchResult: function() {
            var that = this;
            require([ "views/site/Header", "views/site/SideNavLayoutView", "views/search/SearchDetailLayoutView", "collection/VTagList" ], function(Header, SideNavLayoutView, SearchDetailLayoutView, VTagList) {
                function renderSearchView() {
                    var isinitialView = !0, tempParam = $.extend(!0, {}, paramObj);
                    that.renderViewIfNotExists(that.getHeaderOptions(Header)), that.renderViewIfNotExists({
                        view: App.rSideNav,
                        manualRender: function() {
                            this.view.currentView.RSearchLayoutView.currentView.manualRender(tempParam);
                        },
                        render: function() {
                            return new SideNavLayoutView(_.extend({
                                value: tempParam
                            }, options));
                        }
                    }), App.rSideNav.currentView.selectTab(), paramObj && (isinitialView = 0 === (paramObj.type || ("true" == paramObj.dslChecked ? "" : paramObj.tag || paramObj.term) || (paramObj.query ? paramObj.query.trim() : "")).length), 
                    App.rNContent.show(new SearchDetailLayoutView(_.extend({
                        value: paramObj,
                        initialView: isinitialView,
                        isTypeTagNotExists: paramObj.type != tempParam.type || tempParam.tag != paramObj.tag
                    }, options)));
                }
                Utils.updateInternalTabState();
                var paramObj = Utils.getUrlState.getQueryParams(), options = _.extend({}, that.preFetchedCollectionLists, that.sharedObj, that.ventObj), tag = new VTagList();
                if (paramObj.tag) {
                    var tagValidate = paramObj.tag, isTagPresent = !1;
                    tagValidate.indexOf("*") == -1 && (isTagPresent = classificationDefCollection.fullCollection.some(function(model) {
                        var name = Utils.getName(model.toJSON(), "name");
                        return "CLASSIFICATION" == model.get("category") && name === tagValidate;
                    }), isTagPresent || (isTagPresent = Enums.addOnClassification.some(function(classificationName) {
                        return classificationName === tagValidate;
                    })), isTagPresent || (tag.url = UrlLinks.classicationApiUrl(tagValidate), tag.fetch({
                        success: function(tagCollection) {
                            isTagPresent = !0;
                        },
                        cust_error: function(model, response) {
                            paramObj.tag = null;
                        },
                        complete: function() {
                            renderSearchView.call();
                        }
                    }))), (tagValidate.indexOf("*") >= 0 || isTagPresent) && renderSearchView();
                } else renderSearchView();
            });
        },
        administrator: function() {
            var that = this;
            require([ "views/site/Header", "views/site/SideNavLayoutView", "views/administrator/AdministratorLayoutView" ], function(Header, SideNavLayoutView, AdministratorLayoutView) {
                var paramObj = Utils.getUrlState.getQueryParams(), options = _.extend({}, that.preFetchedCollectionLists, that.sharedObj, that.ventObj);
                that.renderViewIfNotExists(that.getHeaderOptions(Header)), that.renderViewIfNotExists({
                    view: App.rSideNav,
                    manualRender: function() {
                        this.view.currentView.selectTab(), Utils.getUrlState.isTagTab() ? this.view.currentView.RTagLayoutView.currentView.manualRender() : Utils.getUrlState.isGlossaryTab() && this.view.currentView.RGlossaryLayoutView.currentView.manualRender(_.extend({
                            isTrigger: !0,
                            value: paramObj
                        }));
                    },
                    render: function() {
                        return new SideNavLayoutView(options);
                    }
                }), App.rNContent.show(new AdministratorLayoutView(_.extend({
                    value: paramObj,
                    guid: null
                }, options)));
            });
        },
        debugMetrics: function() {
            var that = this;
            require([ "views/site/Header", "views/site/SideNavLayoutView", "views/dev_debug/DebugMetricsLayoutView" ], function(Header, SideNavLayoutView, DebugMetricsLayoutView) {
                var paramObj = Utils.getUrlState.getQueryParams(), options = _.extend({}, that.preFetchedCollectionLists, that.sharedObj, that.ventObj);
                that.renderViewIfNotExists(that.getHeaderOptions(Header)), that.renderViewIfNotExists({
                    view: App.rSideNav,
                    manualRender: function() {
                        this.view.currentView.selectTab(), Utils.getUrlState.isTagTab() ? this.view.currentView.RTagLayoutView.currentView.manualRender() : Utils.getUrlState.isGlossaryTab() && this.view.currentView.RGlossaryLayoutView.currentView.manualRender(_.extend({
                            isTrigger: !0,
                            value: paramObj
                        }));
                    },
                    render: function() {
                        return new SideNavLayoutView(options);
                    }
                }), App.rNContent.show(new DebugMetricsLayoutView(options));
            });
        },
        businessMetadataDetailPage: function(guid) {
            var that = this;
            require([ "views/site/Header", "views/site/SideNavLayoutView", "views/business_metadata/BusinessMetadataContainerLayoutView" ], function(Header, SideNavLayoutView, BusinessMetadataContainerLayoutView) {
                var paramObj = Utils.getUrlState.getQueryParams(), options = _.extend({}, that.preFetchedCollectionLists, that.sharedObj, that.ventObj);
                that.renderViewIfNotExists(that.getHeaderOptions(Header)), that.renderViewIfNotExists({
                    view: App.rSideNav,
                    manualRender: function() {
                        this.view.currentView.selectTab(), Utils.getUrlState.isTagTab() ? this.view.currentView.RTagLayoutView.currentView.manualRender() : Utils.getUrlState.isGlossaryTab() && this.view.currentView.RGlossaryLayoutView.currentView.manualRender(_.extend({
                            isTrigger: !0,
                            value: paramObj
                        }));
                    },
                    render: function() {
                        return new SideNavLayoutView(options);
                    }
                }), App.rNContent.show(new BusinessMetadataContainerLayoutView(_.extend({
                    guid: guid,
                    value: paramObj
                }, options)));
            });
        },
        commonAction: function() {
            var that = this;
            require([ "views/site/Header", "views/site/SideNavLayoutView", "views/search/SearchDetailLayoutView" ], function(Header, SideNavLayoutView, SearchDetailLayoutView) {
                Utils.updateInternalTabState();
                var paramObj = Utils.getUrlState.getQueryParams(), options = _.extend({}, that.preFetchedCollectionLists, that.sharedObj, that.ventObj);
                that.renderViewIfNotExists(that.getHeaderOptions(Header)), that.renderViewIfNotExists({
                    view: App.rSideNav,
                    manualRender: function() {
                        this.view.currentView.selectTab(), Utils.getUrlState.isTagTab() ? this.view.currentView.RTagLayoutView.currentView.manualRender() : Utils.getUrlState.isGlossaryTab() && this.view.currentView.RGlossaryLayoutView.currentView.manualRender(_.extend({
                            isTrigger: !0,
                            value: paramObj
                        }));
                    },
                    render: function() {
                        return new SideNavLayoutView(options);
                    }
                }), Utils.getUrlState.isSearchTab() ? App.rNContent.show(new SearchDetailLayoutView(_.extend({
                    value: paramObj,
                    initialView: !0
                }, options))) : App.rNContent.currentView ? App.rNContent.currentView.destroy() : App.rNContent.$el.empty();
            });
        },
        relationshipSearch: function() {
            var that = this;
            require([ "views/site/Header", "views/site/SideNavLayoutView", "views/search/RelationSearchDetailLayoutView" ], function(Header, SideNavLayoutView, RelationSearchDetailLayoutView) {
                var paramObj = Utils.getUrlState.getQueryParams(), options = _.extend({}, that.preFetchedCollectionLists, that.sharedObj, that.ventObj);
                that.renderViewIfNotExists(that.getHeaderOptions(Header)), that.renderViewIfNotExists({
                    view: App.rSideNav,
                    manualRender: function() {},
                    render: function() {
                        return new SideNavLayoutView(_.extend({
                            value: paramObj
                        }, options));
                    }
                }), Utils.getUrlState.isRelationTab() ? App.rNContent.show(new RelationSearchDetailLayoutView(_.extend({
                    value: paramObj,
                    initialView: !paramObj
                }, options))) : App.rNContent.currentView ? App.rNContent.currentView.destroy() : App.rNContent.$el.empty();
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