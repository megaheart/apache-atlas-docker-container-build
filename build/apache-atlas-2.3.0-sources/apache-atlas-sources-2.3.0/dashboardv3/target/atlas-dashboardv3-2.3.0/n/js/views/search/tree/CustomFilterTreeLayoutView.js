define([ "require", "hbs!tmpl/search/tree/CustomFilterTreeLayoutView_tmpl", "utils/Utils", "utils/Messages", "utils/Globals", "utils/UrlLinks", "utils/CommonViewFunction", "collection/VSearchList", "collection/VGlossaryList", "jstree" ], function(require, CustomFilterTreeLayoutViewTmpl, Utils, Messages, Globals, UrlLinks, CommonViewFunction, VSearchList, VGlossaryList) {
    "use strict";
    var CustomFilterTreeLayoutView = Marionette.LayoutView.extend({
        _viewName: "CustomFilterTreeLayoutView",
        template: CustomFilterTreeLayoutViewTmpl,
        regions: {
            RSaveSearchBasic: '[data-id="r_saveSearchBasic"]'
        },
        ui: {
            refreshTree: '[data-id="refreshTree"]',
            groupOrFlatTree: '[data-id="groupOrFlatTreeView"]',
            customFilterSearchTree: '[data-id="customFilterSearchTree"]',
            showCustomFilter: '[data-id="showCustomFilter"]',
            customFilterTreeLoader: '[data-id="customFilterTreeLoader"]'
        },
        templateHelpers: function() {
            return {
                apiBaseUrl: UrlLinks.apiBaseUrl
            };
        },
        events: function() {
            var events = {}, that = this;
            return events["click " + this.ui.refreshTree] = function(e) {
                that.changeLoaderState(!0), that.ui.refreshTree.attr("disabled", !0).tooltip("hide");
                $(e.currentTarget).data("type");
                e.stopPropagation(), that.refreshCustomFilterTree();
            }, events["click " + this.ui.showCustomFilter] = function(e) {
                that.isBasic = !that.isBasic, this.customFilterSwitchBtnUpdate();
            }, events["click " + this.ui.groupOrFlatTree] = function(e) {
                that.changeLoaderState(!0);
                var type = $(e.currentTarget).data("type");
                e.stopPropagation(), this.isGroupView = !this.isGroupView, this.ui.groupOrFlatTree.attr("data-original-title", this.isGroupView ? "Show all" : "Show type"), 
                this.ui.groupOrFlatTree.tooltip("hide"), this.ui.groupOrFlatTree.find("i").toggleClass("group-tree-deactivate"), 
                this.ui.groupOrFlatTree.find("span").html(this.isGroupView ? "Show flat tree" : "Show group tree"), 
                that.ui[type + "SearchTree"].jstree(!0).destroy(), that.fetchCustomFilter();
            }, events;
        },
        bindEvents: function() {
            var that = this;
            this.listenTo(this.saveSearchBaiscCollection.fullCollection, "reset add change remove", function() {
                this.ui.customFilterSearchTree.jstree(!0) ? this.ui.customFilterSearchTree.jstree(!0).refresh() : this.renderCustomFilterTree();
            }, this), this.listenTo(this.saveSearchAdvanceCollection.fullCollection, "reset add change remove", function() {
                this.ui.customFilterSearchTree.jstree(!0) ? this.ui.customFilterSearchTree.jstree(!0).refresh() : this.renderCustomFilterTree();
            }, this), this.listenTo(this.saveSearchRelationshipCollection.fullCollection, "reset add change remove", function() {
                this.ui.customFilterSearchTree.jstree(!0) ? this.ui.customFilterSearchTree.jstree(!0).refresh() : this.renderCustomFilterTree();
            }, this), this.searchVent.on("Save:Filter", function(data) {
                that.saveAs();
            }), this.searchVent.on("SaveRelationship:Filter", function(data) {
                that.relationshipSaveAs();
            }), $("body").on("click", ".customFilterPopoverOptions li", function(e) {
                that.$(".customFilterPopoverOptions").popover("hide"), that[$(this).find("a").data("fn") + "CustomFilter"](e);
            });
        },
        initialize: function(options) {
            function getModelName(model) {
                if (model.get("name")) return model.get("name").toLowerCase();
            }
            this.options = options, _.extend(this, _.pick(options, "typeHeaders", "searchVent", "entityDefCollection", "relationshipDefCollection", "enumDefCollection", "classificationDefCollection", "searchTableColumns", "searchTableFilters", "metricCollection")), 
            this.saveSearchBaiscCollection = new VSearchList(), this.saveSearchCollection = new VSearchList(), 
            this.saveSearchAdvanceCollection = new VSearchList(), this.saveSearchRelationshipCollection = new VSearchList(), 
            this.saveSearchCollection.url = UrlLinks.saveSearchApiUrl(), this.saveSearchBaiscCollection.fullCollection.comparator = function(model) {
                return getModelName(model);
            }, this.saveSearchAdvanceCollection.fullCollection.comparator = function(model) {
                return getModelName(model);
            }, this.saveSearchRelationshipCollection.fullCollection.comparator = function(model) {
                return getModelName(model);
            }, this.bindEvents(), this.customFilterData = null, this.isBasic = !0, this.customFilterId = null, 
            this.isGroupView = !0;
        },
        onRender: function() {
            this.changeLoaderState(!0), this.fetchCustomFilter();
        },
        changeLoaderState: function(showLoader) {
            showLoader ? (this.ui.customFilterSearchTree.hide(), this.ui.customFilterTreeLoader.show()) : (this.ui.customFilterSearchTree.show(), 
            this.ui.customFilterTreeLoader.hide());
        },
        manualRender: function(options) {
            _.extend(this.options, options), void 0 === this.options.value && (this.options.value = {}), 
            this.options.value.isCF || (this.ui.customFilterSearchTree.jstree(!0).deselect_all(), 
            this.customFilterId = null);
        },
        renderCustomFilterTree: function() {
            this.generateCustomFilterTree({
                $el: this.ui.customFilterSearchTree
            }), this.createCustomFilterAction();
        },
        fetchCustomFilter: function() {
            var that = this;
            this.saveSearchCollection.fetch({
                success: function(collection, data) {
                    that.saveSearchBaiscCollection.fullCollection.reset(_.where(data, {
                        searchType: "BASIC"
                    })), that.saveSearchAdvanceCollection.fullCollection.reset(_.where(data, {
                        searchType: "ADVANCED"
                    })), that.saveSearchRelationshipCollection.fullCollection.reset(_.where(data, {
                        searchType: "BASIC_RELATIONSHIP"
                    })), that.changeLoaderState(!1), that.ui.refreshTree.attr("disabled", !1);
                },
                silent: !0
            });
        },
        generateCustomFilterTree: function(options) {
            var $el = options && options.$el, that = this, getEntityTreeConfig = function(opt) {
                return {
                    plugins: [ "search", "core", "sort", "conditionalselect", "changed", "wholerow", "node_customize" ],
                    conditionalselect: function(node) {
                        var type = node.original.type;
                        return "customFilterFolder" != type || !node.children.length;
                    },
                    state: {
                        opened: !0
                    },
                    search: {
                        show_only_matches: !0,
                        case_sensitive: !1
                    },
                    node_customize: {
                        default: function(el) {
                            var aFilter = $(el).find(">a.jstree-anchor");
                            aFilter.append("<span class='tree-tooltip'>" + _.escape(aFilter.text()) + "</span>"), 
                            0 === $(el).find(".fa-ellipsis-h").length && $(el).append('<div class="tools"><i class="fa fa-ellipsis-h customFilterPopover" rel="popover"></i></div>');
                        }
                    },
                    core: {
                        multiple: !1,
                        data: function(node, cb) {
                            "#" === node.id && cb(that.getCustomFilterTree());
                        }
                    }
                };
            };
            $el.jstree(getEntityTreeConfig({
                type: ""
            })).on("open_node.jstree", function(e, data) {
                that.isTreeOpen = !0;
            }).on("select_node.jstree", function(e, data) {
                that.onNodeSelect(data);
            }).on("search.jstree", function(nodes, str, res) {
                0 === str.nodes.length ? ($el.jstree(!0).hide_all(), $el.parents(".panel").addClass("hide")) : $el.parents(".panel").removeClass("hide");
            }).on("hover_node.jstree", function(nodes, str, res) {
                var aFilter = that.$("#" + str.node.a_attr.id), filterOffset = aFilter.find(">.jstree-icon").offset();
                that.$(".tree-tooltip").removeClass("show"), setTimeout(function() {
                    aFilter.hasClass("jstree-hovered") && filterOffset.top && filterOffset.left && aFilter.find(">span.tree-tooltip").css({
                        top: "calc(" + filterOffset.top + "px - 45px)",
                        left: "24px"
                    }).addClass("show");
                }, 1200);
            }).on("dehover_node.jstree", function(nodes, str, res) {
                that.$(".tree-tooltip").removeClass("show");
            });
        },
        createCustomFilterAction: function() {
            Utils.generatePopover({
                el: this.$el,
                contentClass: "customFilterPopoverOptions",
                popoverOptions: {
                    selector: ".customFilterPopover",
                    content: function() {
                        var type = $(this).data("detail"), liString = "";
                        return liString = "<li data-type=" + type + " class='listTerm'><i class='fa fa-pencil'></i><a href='javascript:void(0)' data-fn='rename'>Rename</a></li><li data-type=" + type + " class='listTerm'><i class='fa fa-trash-o'></i><a href='javascript:void(0)' data-fn='delete'>Delete</a></li>", 
                        "<ul>" + liString + "</ul>";
                    }
                }
            });
        },
        customFilterSwitchBtnUpdate: function() {
            var that = this;
            that.ui.showCustomFilter.attr("data-original-title", that.isBasic ? "Show Advanced search" : "Show Basic search"), 
            that.ui.showCustomFilter.tooltip("hide"), that.ui.showCustomFilter.find("i").toggleClass("switch-button"), 
            that.ui.customFilterSearchTree.jstree(!0).refresh();
        },
        getCustomFilterTree: function(options) {
            var that = this, customFilterBasicList = [], customFilterAdvanceList = [], customFilterRelationshipList = [], allCustomFilter = [], customFilterBasicTreeData = that.saveSearchBaiscCollection.fullCollection.models, customFilterAdvanceTreeData = that.saveSearchAdvanceCollection.fullCollection.models, customFilterRelationshipTreeData = that.saveSearchRelationshipCollection.fullCollection.models, generateNode = function(nodeOptions) {
                var icon, searchType = nodeOptions.get("searchType");
                icon = "BASIC" === searchType ? "fa fa-circle-thin basic-tree" : "BASIC_RELATIONSHIP" === searchType ? "fa fa-circle-thin relationship-tree" : "fa fa-circle-thin advance-tree";
                var nodeStructure = {
                    text: _.escape(nodeOptions.get("name")),
                    name: _.escape(nodeOptions.get("name")),
                    type: "customFilter",
                    id: nodeOptions.get("guid"),
                    icon: icon,
                    gType: "CustomFilter",
                    model: nodeOptions
                };
                return nodeStructure;
            };
            that.customFilterId = null, _.each(customFilterBasicTreeData, function(filterNode) {
                customFilterBasicList.push(generateNode(filterNode)), allCustomFilter.push(generateNode(filterNode));
            }), _.each(customFilterAdvanceTreeData, function(filterNode) {
                customFilterAdvanceList.push(generateNode(filterNode)), allCustomFilter.push(generateNode(filterNode));
            }), _.each(customFilterRelationshipTreeData, function(filterNode) {
                customFilterRelationshipList.push(generateNode(filterNode)), allCustomFilter.push(generateNode(filterNode));
            });
            var treeView = [ {
                icon: "fa fa-folder-o",
                gType: "customFilter",
                type: "customFilterFolder",
                children: customFilterBasicList,
                text: "Basic Search",
                name: "Basic Search",
                state: {
                    opened: !0
                }
            }, {
                icon: "fa fa-folder-o",
                gType: "customFilter",
                type: "customFilterFolder",
                children: customFilterAdvanceList,
                text: "Advanced Search",
                name: "Advanced Search",
                state: {
                    opened: !0
                }
            }, {
                icon: "fa fa-folder-o",
                gType: "customFilter",
                type: "customFilterFolder",
                children: customFilterRelationshipList,
                text: "Relationship Search",
                name: "Relationship Search",
                state: {
                    opened: !0
                }
            } ], customFilterList = that.isGroupView ? treeView : allCustomFilter;
            return customFilterList;
        },
        onNodeSelect: function(nodeData) {
            var that = this, options = nodeData.node.original, selectedNodeId = options.id;
            if (that.customFilterId != selectedNodeId) {
                if (that.customFilterId = selectedNodeId, options && options.model) {
                    var searchParameters = options.model.get("searchParameters"), searchType = options.model.get("searchType"), params = CommonViewFunction.generateUrlFromSaveSearchObject({
                        value: {
                            searchParameters: searchParameters
                        },
                        classificationDefCollection: that.classificationDefCollection,
                        entityDefCollection: that.entityDefCollection,
                        relationshipDefCollection: that.relationshipDefCollection
                    });
                    "ADVANCED" === searchType ? that.isBasic = !1 : "BASIC_RELATIONSHIP" === searchType ? that.isRelationship = !0 : that.isBasic = !0, 
                    "ADVANCED" === searchType && (Globals.advanceSearchData.searchByQuery = searchParameters.query, 
                    Globals.advanceSearchData.searchByType = searchParameters.typeName), _.extend({}, this.options.value, params), 
                    "BASIC" === searchType || "ADVANCED" === searchType ? (Globals.fromRelationshipSearch = !1, 
                    Utils.setUrl({
                        url: "#!/search/searchResult",
                        urlParams: _.extend({}, {
                            searchType: that.isBasic ? "basic" : "dsl",
                            isCF: !0
                        }, params),
                        mergeBrowserUrl: !1,
                        trigger: !0,
                        updateTabState: !0
                    })) : (Globals.fromRelationshipSearch = !0, Utils.setUrl({
                        url: "#!/relationship/relationshipSearchResult",
                        urlParams: _.extend({}, params, {
                            searchType: "basic",
                            isCF: !0
                        }),
                        mergeBrowserUrl: !1,
                        trigger: !0,
                        updateTabState: !0
                    }));
                }
            } else that.customFilterId = null, that.ui.customFilterSearchTree.jstree(!0).deselect_all(!0), 
            that.showDefaultPage();
        },
        showDefaultPage: function() {
            Utils.setUrl({
                url: "#!/search",
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
        },
        getValue: function() {
            return this.options.value;
        },
        callSaveModalLayoutView: function(options) {
            require([ "views/search/save/SaveModalLayoutView" ], function(SaveModalLayoutView) {
                new SaveModalLayoutView(options);
            });
        },
        renameCustomFilter: function(opt) {
            var that = this, selectednode = that.ui.customFilterSearchTree.jstree("get_selected", !0), options = selectednode[0].original;
            if (options && options.model.attributes) {
                var that = this;
                require([ "views/search/save/SaveModalLayoutView" ], function(SaveModalLayoutView) {
                    new SaveModalLayoutView("BASIC" === options.model.attributes.searchType || "ADVANCED" === options.model.attributes.searchType ? {
                        rename: !0,
                        selectedModel: options.model.clone(),
                        collection: that.isBasic ? that.saveSearchBaiscCollection.fullCollection : that.saveSearchAdvanceCollection.fullCollection,
                        getValue: that.getValue,
                        isBasic: that.isBasic
                    } : {
                        rename: !0,
                        selectedModel: options.model.clone(),
                        collection: that.saveSearchRelationshipCollection.fullCollection,
                        getValue: that.getValue,
                        isRelationship: that.isRelationship
                    });
                });
            }
        },
        deleteCustomFilter: function(opt) {
            var that = this, selectednode = that.ui.customFilterSearchTree.jstree("get_selected", !0), options = selectednode[0].original;
            if (options && options.model) {
                var that = this, notifyObj = {
                    modal: !0,
                    html: !0,
                    text: Messages.conformation.deleteMessage + "<b>" + _.escape(options.model.get("name")) + "</b> ?",
                    ok: function(obj) {
                        that.notificationModal = obj, obj.showButtonLoader(), that.onDeleteNotifyOk(options);
                    },
                    okCloses: !1,
                    cancel: function(argument) {}
                };
                Utils.notifyConfirm(notifyObj);
            }
        },
        onDeleteNotifyOk: function(options) {
            var that = this;
            options.model.urlRoot = UrlLinks.saveSearchApiUrl(), options.model ? (options.model.id = options.model.get("guid"), 
            options.model.idAttribute = "guid", options.model.destroy({
                wait: !0,
                success: function(model, data) {
                    that.showDefaultPage(), Utils.notifySuccess({
                        content: options.model.attributes.name + Messages.getAbbreviationMsg(!1, "deleteSuccessMessage")
                    });
                },
                complete: function() {
                    that.notificationModal.hideButtonLoader(), that.notificationModal.remove();
                }
            })) : Utils.notifyError({
                content: Messages.defaultErrorMessage
            });
        },
        saveAs: function(e) {
            var value = this.getValue();
            if (value && (value.type || value.tag || value.query || value.term)) {
                "basic" == value.searchType ? this.isBasic = !0 : this.isBasic = !1;
                var urlObj = Utils.getUrlState.getQueryParams();
                urlObj && (urlObj.includeDE = "true" == urlObj.includeDE, urlObj.excludeSC = "true" == urlObj.excludeSC, 
                urlObj.excludeST = "true" == urlObj.excludeST), this.customFilterSwitchBtnUpdate(), 
                this.callSaveModalLayoutView({
                    collection: this.isBasic ? this.saveSearchBaiscCollection.fullCollection : this.saveSearchAdvanceCollection.fullCollection,
                    getValue: function() {
                        return _.extend({}, value, urlObj);
                    },
                    isBasic: this.isBasic
                });
            } else Utils.notifyInfo({
                content: Messages.search.favoriteSearch.notSelectedSearchFilter
            });
        },
        relationshipSaveAs: function(e) {
            var value = this.getValue();
            if (value && value.relationshipName) {
                this.isRelationship = !0;
                var urlObj = Utils.getUrlState.getQueryParams();
                this.callSaveModalLayoutView({
                    collection: this.saveSearchRelationshipCollection.fullCollection,
                    getValue: function() {
                        return _.extend({}, value, urlObj);
                    },
                    isRelationship: this.isRelationship
                });
            } else Utils.notifyInfo({
                content: Messages.search.favoriteSearch.notSelectedSearchFilter
            });
        },
        refreshCustomFilterTree: function() {
            this.fetchCustomFilter();
        }
    });
    return CustomFilterTreeLayoutView;
});