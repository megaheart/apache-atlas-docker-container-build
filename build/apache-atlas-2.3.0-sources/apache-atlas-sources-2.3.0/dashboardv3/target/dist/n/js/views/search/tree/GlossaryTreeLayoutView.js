define([ "require", "hbs!tmpl/search/tree/GlossaryTreeLayoutView_tmpl", "utils/Utils", "utils/Messages", "utils/Globals", "utils/UrlLinks", "utils/CommonViewFunction", "collection/VSearchList", "collection/VGlossaryList", "jstree" ], function(require, GlossaryTreeLayoutView_tmpl, Utils, Messages, Globals, UrlLinks, CommonViewFunction, VSearchList, VGlossaryList) {
    "use strict";
    var GlossaryTreeLayoutView = Marionette.LayoutView.extend({
        template: GlossaryTreeLayoutView_tmpl,
        regions: {},
        ui: {
            refreshTree: '[data-id="refreshTree"]',
            termSearchTree: '[data-id="termSearchTree"]',
            createGlossary: '[data-id="createGlossary"]',
            showGlossaryType: '[data-id="showGlossaryType"]',
            importGlossary: "[data-id='importGlossary']",
            downloadTemplate: "[data-id='downloadTemplate']",
            glossaryTreeLoader: ".glossary-tree-loader"
        },
        templateHelpers: function() {
            return {
                apiBaseUrl: UrlLinks.apiBaseUrl,
                importTmplUrl: UrlLinks.glossaryImportTempUrl()
            };
        },
        events: function() {
            var events = {}, that = this;
            return events["click " + this.ui.refreshTree] = function(e) {
                that.changeLoaderState(!0), that.ui.refreshTree.attr("disabled", !0).tooltip("hide");
                var type = $(e.currentTarget).data("type");
                e.stopPropagation(), that.refresh({
                    type: type
                });
            }, events["click " + this.ui.createGlossary] = function(e) {
                var that = this;
                e.stopPropagation(), CommonViewFunction.createEditGlossaryCategoryTerm({
                    isGlossaryView: !0,
                    collection: that.glossaryCollection,
                    callback: function(rModel) {
                        that.glossaryCollection.fullCollection.add(rModel);
                    },
                    onModalClose: function() {}
                });
            }, events["click " + this.ui.showGlossaryType] = function(e) {
                e.stopPropagation(), this.isTermView = !this.isTermView, this.glossarySwitchBtnUpdate();
            }, events["click " + this.ui.importGlossary] = function(e) {
                e.stopPropagation();
                var $target = $(e.target);
                0 == $target.parents(".disable-list-option").length && 0 == $target.hasClass("disable-list-option") && that.onClickImportGlossary();
            }, events["click " + this.ui.downloadTemplate] = function(e) {
                e.stopPropagation();
            }, events;
        },
        bindEvents: function() {
            var that = this;
            this.listenTo(this.glossaryCollection.fullCollection, "reset add change", function(skip) {
                this.ui.termSearchTree.jstree(!0) ? (that.isGlossaryTree = !0, this.ui.termSearchTree.jstree(!0).refresh()) : this.renderGlossaryTree(), 
                that.changeLoaderState(), that.ui.refreshTree.attr("disabled", !1);
            }, this), this.options.categoryEvent && this.options.categoryEvent.on("Success:TermRename", function(options) {
                that.refresh();
            }), $("body").on("click", ".termPopoverOptions li, .categoryPopoverOptions li", function(e) {
                that.$(".termPopover,.categoryPopover").popover("hide"), that[$(this).find("a").data("fn")](e);
            });
        },
        glossarySwitchBtnUpdate: function() {
            var tooltipTitle = this.isTermView ? "Show Category" : "Show Term";
            this.ui.showGlossaryType.attr({
                "data-original-title": tooltipTitle,
                title: tooltipTitle
            }), this.ui.showGlossaryType.tooltip("hide"), this.ui.showGlossaryType.find("i").toggleClass("switch-button"), 
            this.isTermView ? (this.ui.importGlossary.removeClass("disable-list-option").find("a").attr("href", "javascript:void(0)"), 
            this.ui.downloadTemplate.removeClass("disable-list-option").find("a").attr("href", UrlLinks.glossaryImportTempUrl())) : (this.ui.importGlossary.addClass("disable-list-option").find("a").removeAttr("href"), 
            this.ui.downloadTemplate.addClass("disable-list-option").find("a").removeAttr("href")), 
            this.ui.termSearchTree.jstree(!0).refresh();
        },
        initialize: function(options) {
            this.options = options, _.extend(this, _.pick(options, "typeHeaders", "searchVent", "entityDefCollection", "enumDefCollection", "classificationDefCollection", "searchTableColumns", "searchTableFilters", "metricCollection", "query", "categoryEvent")), 
            this.glossaryTermId = this.glossaryId = null, this.glossaryCollection = new VGlossaryList([], {
                comparator: function(item) {
                    return item.get("name");
                }
            }), this.getViewType(), this.bindEvents(), this.isGlossaryTree = this.isGlossryTreeview();
        },
        isGlossryTreeview: function() {
            var queryParams = Utils.getUrlState.getQueryParams();
            if (queryParams && ("term" === queryParams.gType || "category" === queryParams.gType)) return !0;
        },
        onRender: function() {
            this.changeLoaderState(!0), this.fetchGlossary();
        },
        changeLoaderState: function(showLoader) {
            showLoader ? (this.ui.termSearchTree.hide(), this.ui.glossaryTreeLoader.show()) : (this.ui.termSearchTree.show(), 
            this.ui.glossaryTreeLoader.hide());
        },
        onBeforeDestroy: function() {
            this.options.categoryEvent.off("Success:TermRename");
        },
        getViewType: function() {
            Utils.getUrlState.isGlossaryTab() ? this.isTermView = !this.options.value.viewType || "term" == this.options.value.viewType : this.isTermView = !0;
        },
        manualRender: function(options) {
            if (_.extend(this.options, options), void 0 === this.options.value && (this.options.value = {}), 
            this.options.value.term || "category" == this.options.value.gType) {
                if (this.options.value.term) {
                    var glossaryName = this.options.value.term.split("@")[1], termName = this.options.value.term.split("@")[0], dataFound = this.glossaryCollection.fullCollection.find(function(obj) {
                        return obj.get("name") === glossaryName;
                    });
                    if (dataFound) {
                        var terms = dataFound.get("terms"), terModel = _.find(terms, function(model) {
                            return model.displayText === termName;
                        });
                        terModel && (this.glossaryTermId && this.glossaryTermId !== terModel.termGuid || null === this.glossaryTermId) && (this.glossaryTermId && this.ui.termSearchTree.jstree(!0).deselect_node(this.glossaryTermId), 
                        this.ui.termSearchTree.jstree(!0).deselect_all(), this.glossaryTermId = terModel.termGuid, 
                        this.fromManualRender = !0, this.ui.termSearchTree.jstree(!0).select_node(terModel.termGuid));
                    }
                }
            } else this.ui.termSearchTree.jstree(!0) && this.ui.termSearchTree.jstree(!0).deselect_all(), 
            this.glossaryTermId = null;
        },
        fetchGlossary: function() {
            this.glossaryCollection.fetch({
                reset: !0
            });
        },
        renderGlossaryTree: function() {
            this.generateSearchTree({
                $el: this.ui.termSearchTree
            }), this.createTermAction();
        },
        onNodeSelect: function(options, showCategory) {
            var nodeType = options.node.original.type;
            if (this.isGlossaryTree && ("GlossaryTerm" === nodeType || "GlossaryCategory" === nodeType)) return void (this.isGlossaryTree = !1);
            var name, selectedNodeId, that = this, glossaryType = options.node.original.gType;
            if ("category" == glossaryType) selectedNodeId = options.node.id, that.glossaryTermId != selectedNodeId ? (that.glossaryTermId = selectedNodeId, 
            that.onViewEdit()) : (that.glossaryTermId = null, that.showDefaultPage()); else if ("term" == glossaryType) {
                options && (name = _.unescape(options.node.original.name), selectedNodeId = options.node.id);
                var termValue = null, params = {
                    searchType: "basic"
                };
                if (this.options.value && this.options.value.isCF && (this.options.value.isCF = null), 
                that.glossaryTermId != selectedNodeId) that.glossaryTermId = selectedNodeId, termValue = options ? name + "@" + options.node.original.parent.name : this.options.value.term, 
                params.term = termValue, params.gtype = "term", params.viewType = "term", params.guid = selectedNodeId; else if (that.glossaryTermId = params.term = null, 
                that.ui.termSearchTree.jstree(!0).deselect_all(!0), !that.options.value.type && !that.options.value.tag && !that.options.value.query) return void that.showDefaultPage();
                that.glossaryId = null;
                var searchParam = _.extend({}, that.options.value, params);
                this.triggerSearch(searchParam), that.searchVent && that.searchVent.trigger("Success:Category");
            } else if (glossaryType = "glossary") if (that.glossaryTermId = null, that.glossaryId != options.node.id) {
                that.glossaryId = options.node.id;
                var params = {
                    gId: that.glossaryId,
                    gType: options.node.original.gType,
                    viewType: this.isTermView ? "term" : "category"
                };
                Utils.setUrl({
                    url: "#!/glossary/" + that.glossaryId,
                    urlParams: params,
                    mergeBrowserUrl: !1,
                    trigger: !1,
                    updateTabState: !0
                });
            } else that.glossaryId = null, that.ui.termSearchTree.jstree(!0).deselect_all(!0), 
            this.showDefaultPage(); else that.glossaryTermId = null, that.glossaryId != options.node.id ? that.glossaryId = options.node.id : (that.glossaryId = null, 
            that.ui.termSearchTree.jstree(!0).deselect_all(!0));
        },
        triggerSearch: function(params, url) {
            var serachUrl = url ? url : "#!/search/searchResult";
            Utils.setUrl({
                url: serachUrl,
                urlParams: params,
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
        },
        showDefaultPage: function() {
            Utils.setUrl({
                url: "!/search",
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
        },
        generateCategoryData: function(options) {
            return _.map(options.data, function(obj) {
                return {
                    text: _.escape(obj.displayText),
                    icon: "fa fa-files-o",
                    guid: obj.categoryGuid,
                    id: obj.categoryGuid,
                    glossaryId: options.node.glossaryId,
                    glossaryName: options.node.glossaryName,
                    model: obj,
                    type: "GlossaryCategory",
                    gType: "category",
                    children: !0
                };
            });
        },
        getCategory: function(options) {
            var that = this;
            this.glossaryCollection.getCategory({
                guid: options.node.guid,
                related: !0,
                ajaxOptions: {
                    success: function(data) {
                        data && data.children ? options.callback(that.generateCategoryData(_.extend({}, {
                            data: data.children
                        }, options))) : options.callback([]);
                    },
                    cust_error: function() {
                        options.callback([]);
                    }
                }
            });
        },
        getGlossaryTree: function(options) {
            var that = this, queryParams = (options && options.collection || this.glossaryCollection.fullCollection, 
            Utils.getUrlState.getQueryParams()), glossaryGuid = queryParams ? queryParams.gId : null, gType = queryParams ? queryParams.gType : "term";
            return this.glossaryCollection.fullCollection.map(function(model, i) {
                var obj = model.toJSON(), parent = {
                    text: _.escape(obj.name),
                    name: _.escape(obj.name),
                    icon: "fa fa-folder-o",
                    guid: obj.guid,
                    id: obj.guid,
                    model: obj,
                    type: obj.typeName ? obj.typeName : "GLOSSARY",
                    gType: "glossary",
                    children: [],
                    state: {
                        opened: !0,
                        selected: model.id === glossaryGuid && "glossary" === gType
                    }
                }, openGlossaryNodesState = function(treeDate) {
                    1 == treeDate.length && _.each(treeDate, function(model) {
                        model.state.opeaned = !0;
                    });
                }, generateNode = function(nodeOptions, model, isTermView, parentNode) {
                    var nodeStructure = {
                        text: _.escape(model.displayText),
                        name: _.escape(model.displayText),
                        type: nodeOptions.type,
                        gType: that.isTermView ? "term" : "category",
                        guid: nodeOptions.guid,
                        id: nodeOptions.guid,
                        parent: parentNode ? parentNode : obj,
                        glossaryName: parentNode ? parentNode.name ? parentNode.name : parentNode.displayText : obj.name,
                        glossaryId: parentNode ? parentNode.guid ? parentNode.guid : parentNode.categoryGuid : obj.guid,
                        model: model,
                        icon: "fa fa-file-o"
                    };
                    return nodeStructure;
                };
                if (!that.isTermView && obj.categories && !that.isTermView) {
                    var isSelected = !1, categoryList = (obj.guid, []), catrgoryRelation = [];
                    _.each(obj.categories, function(category) {
                        that.options.value && (isSelected = !!that.options.value.guid && that.options.value.guid == category.categoryGuid);
                        var typeName = category.typeName || "GlossaryCategory", guid = category.categoryGuid, categoryObj = {
                            id: guid,
                            guid: guid,
                            text: _.escape(category.displayText),
                            type: typeName,
                            gType: "category",
                            glossaryId: obj.guid,
                            glossaryName: obj.name,
                            children: [],
                            model: category,
                            icon: "fa fa-files-o"
                        };
                        category.parentCategoryGuid && catrgoryRelation.push({
                            parent: category.parentCategoryGuid,
                            child: guid
                        }), categoryList.push(categoryObj);
                    }), _.each(categoryList, function(category) {
                        var getRelation = _.find(catrgoryRelation, function(catrgoryObj) {
                            if (catrgoryObj.child == category.guid) return catrgoryObj;
                        });
                        getRelation ? _.map(categoryList, function(catrgoryObj) {
                            catrgoryObj.guid == getRelation.parent && catrgoryObj.children.push(category);
                        }) : parent.children.push(category);
                    });
                }
                if (that.isTermView && obj.terms) {
                    var isSelected = !1;
                    _.each(obj.terms, function(term) {
                        that.options.value && (isSelected = !!that.options.value.term && that.options.value.term.split("@")[0] == term.displayText);
                        var parentNodeDetails = {
                            type: term.typeName || "GlossaryTerm",
                            guid: term.termGuid
                        }, parentNodeProperties = {}, getParentNodeDetails = generateNode(parentNodeDetails, term, that.isTermView), termParentNode = _.extend(parentNodeProperties, getParentNodeDetails);
                        parent.children.push(termParentNode);
                    });
                }
                return openGlossaryNodesState(parent), parent;
            });
        },
        createTermAction: function() {
            Utils.generatePopover({
                el: this.$el,
                contentClass: "termPopoverOptions",
                popoverOptions: {
                    selector: ".termPopover",
                    content: function() {
                        var type = $(this).data("detail"), liString = "";
                        return liString = "glossary" == type ? "<li data-type=" + type + " class='listTerm'><i class='fa fa-plus'></i> <a href='javascript:void(0)' data-fn='createSubNode'>Create Term</a></li><li data-type=" + type + " class='listTerm'><i class='fa fa-list-alt'></i><a href='javascript:void(0)' data-fn='onViewEdit'>View/Edit Glossary</a></li><li data-type=" + type + " class='listTerm'><i class='fa fa-trash-o'></i><a href='javascript:void(0)' data-fn='deleteNode'>Delete Glossary</a></li>" : "<li data-type=" + type + " class='listTerm'><i class='fa fa-list-alt'></i><a href='javascript:void(0)' data-fn='onViewEdit'>View/Edit Term</a></li><li data-type=" + type + " class='listTerm'><i class='fa fa-search'></i><a href='javascript:void(0)' data-fn='searchSelectedTerm'>Search</a></li><li data-type=" + type + " class='listTerm'><i class='fa fa-trash-o'></i><a href='javascript:void(0)' data-fn='deleteNode'>Delete Term</a></li>", 
                        "<ul>" + liString + "</ul>";
                    }
                }
            });
        },
        createCategoryAction: function() {
            Utils.generatePopover({
                el: this.$(".categoryPopover"),
                contentClass: "categoryPopoverOptions",
                popoverOptions: {
                    content: function() {
                        var type = $(this).data("detail"), liString = "";
                        return liString = "glossary" == type ? "<li data-type=" + type + " class='listTerm'><i class='fa fa-plus'></i> <a href='javascript:void(0)' data-fn='createSubNode'>Create Category</a></li>" : "<li data-type=" + type + " class='listTerm'><i class='fa fa-list-alt'></i><a href='javascript:void(0)' data-fn='createSubNode'>Create Sub-Category</a></li>", 
                        "<ul>" + liString + "</ul>";
                    },
                    viewFixedPopover: !0
                }
            });
        },
        createSubNode: function(opt) {
            var that = this, selectednode = that.ui.termSearchTree.jstree("get_selected", !0);
            "GLOSSARY" != selectednode[0].original.type && "GlossaryCategory" != selectednode[0].original.type || this.isTermView ? CommonViewFunction.createEditGlossaryCategoryTerm({
                isTermView: !0,
                callback: function() {
                    that.fetchGlossary(), that.options.categoryEvent.trigger("Success:Term", !0);
                },
                collection: that.glossaryCollection,
                node: selectednode[0].original
            }) : CommonViewFunction.createEditGlossaryCategoryTerm({
                isCategoryView: !0,
                collection: that.glossaryCollection,
                callback: function(updateCollection) {
                    var updatedObj = {
                        categoryGuid: updateCollection.guid,
                        displayText: updateCollection.name,
                        relationGuid: updateCollection.anchor ? updateCollection.anchor.relationGuid : null
                    }, glossary = that.glossaryCollection.fullCollection.findWhere({
                        guid: updateCollection.anchor.glossaryGuid
                    });
                    if (updateCollection.parentCategory && (updatedObj.parentCategoryGuid = updateCollection.parentCategory.categoryGuid), 
                    glossary) {
                        var glossaryAttributes = glossary.attributes || null;
                        glossaryAttributes && (glossaryAttributes.categories ? glossaryAttributes.categories.push(updatedObj) : glossaryAttributes.categories = [ updatedObj ]);
                    }
                    that.ui.termSearchTree.jstree(!0).refresh();
                },
                node: selectednode[0].original
            });
        },
        searchSelectedTerm: function() {
            var params = {
                searchType: "basic",
                dslChecked: !1,
                term: this.options.value.term
            };
            this.triggerSearch(params);
        },
        deleteNode: function(opt) {
            var that = this, messageType = "", selectednode = this.ui.termSearchTree.jstree("get_selected", !0), type = selectednode[0].original.type, guid = selectednode[0].original.guid, gId = selectednode[0].original.parent && selectednode[0].original.parent.guid, options = {
                success: function(rModel, response) {
                    var searchParam = null;
                    gId || (gId = guid), gId === guid && that.glossaryCollection.fullCollection.remove(gId);
                    var glossary = that.glossaryCollection.fullCollection.get(gId);
                    "GlossaryTerm" == type && glossary.set("terms", _.reject(glossary.get("terms"), function(obj) {
                        return obj.termGuid == guid;
                    }), {
                        silent: !0
                    }), Utils.notifySuccess({
                        content: messageType + Messages.getAbbreviationMsg(!1, "deleteSuccessMessage")
                    }), that.ui.termSearchTree.jstree(!0).refresh();
                    var params = {
                        searchType: "basic",
                        term: null
                    };
                    that.glossaryTermId = null, "category" == that.options.value.gType ? that.showDefaultPage() : (searchParam = _.extend({}, that.options.value, params), 
                    that.triggerSearch(searchParam));
                },
                complete: function() {
                    that.notificationModal.hideButtonLoader(), that.notificationModal.remove();
                }
            }, notifyObj = {
                modal: !0,
                ok: function(obj) {
                    that.notificationModal = obj, obj.showButtonLoader(), "Glossary" == type || "GLOSSARY" == type ? new that.glossaryCollection.model().deleteGlossary(guid, options) : "GlossaryCategory" == type ? new that.glossaryCollection.model().deleteCategory(guid, options) : "GlossaryTerm" == type && new that.glossaryCollection.model().deleteTerm(guid, options);
                },
                okCloses: !1,
                cancel: function(argument) {}
            };
            "Glossary" == type || "GLOSSARY" == type ? messageType = "Glossary" : "GlossaryCategory" == type ? messageType = "Category" : "GlossaryTerm" == type && (messageType = "Term"), 
            notifyObj.text = "Are you sure you want to delete the " + messageType, Utils.notifyConfirm(notifyObj);
        },
        onViewEdit: function() {
            var that = this, selectednode = this.ui.termSearchTree.jstree("get_selected", !0), type = selectednode[0].original.type, guid = selectednode[0].original.guid, gId = selectednode[0].original.parent && selectednode[0].original.parent.guid, isGlossaryView = "GlossaryTerm" != type && "GlossaryCategory" != type, model = this.glossaryCollection.fullCollection.get(guid);
            this.glossaryCollection.fullCollection.get(gId);
            if (isGlossaryView) CommonViewFunction.createEditGlossaryCategoryTerm({
                model: model,
                isGlossaryView: !0,
                collection: this.glossaryCollection,
                callback: function(sModel) {
                    var data = sModel.toJSON();
                    model.set(data, {
                        silent: !0
                    }), that.ui.termSearchTree.jstree(!0).refresh();
                }
            }); else {
                var glossaryId = selectednode[0].original.glossaryId, getSelectedParent = null, params = null;
                getSelectedParent = selectednode[0].parents.length > 2 ? selectednode[0].parents[selectednode[0].parents.length - 3] : selectednode[0].id, 
                params = {
                    gId: glossaryId,
                    guid: getSelectedParent,
                    gType: that.isTermView ? "term" : "category",
                    viewType: that.isTermView ? "term" : "category",
                    searchType: "basic"
                }, "GlossaryTerm" === type && (params.term = selectednode[0].original.name + "@" + selectednode[0].original.parent.name);
                var serachUrl = "#!/glossary/" + guid;
                this.triggerSearch(params, serachUrl), !this.isTermView && this.options.categoryEvent && that.options.categoryEvent.trigger("Success:Category", !0);
            }
        },
        generateSearchTree: function(options) {
            var $el = options && options.$el, that = (options && options.data, options && options.type, 
            this), createAction = function(options) {
                that.isTermView ? that.createTermAction() : that.createCategoryAction();
            }, getEntityTreeConfig = function(opt) {
                return {
                    plugins: [ "search", "core", "sort", "conditionalselect", "changed", "wholerow", "node_customize" ],
                    state: {
                        opened: !0
                    },
                    search: {
                        show_only_matches: !0,
                        case_sensitive: !1
                    },
                    node_customize: {
                        default: function(el, node) {
                            var aTerm = $(el).find(">a.jstree-anchor");
                            aTerm.append("<span class='tree-tooltip'>" + _.escape(aTerm.text()) + "</span>");
                            var popoverClass = that.isTermView ? "fa fa-ellipsis-h termPopover " : "fa fa-ellipsis-h categoryPopover";
                            $(el).append('<div class="tools" data-type=' + node.original.gType + '><i class="' + popoverClass + '"rel="popover" data-detail=' + node.original.gType + "></i></div>");
                        }
                    },
                    core: {
                        data: function(node, cb) {
                            "#" === node.id ? cb(that.getGlossaryTree()) : that.getCategory({
                                node: node.original,
                                callback: cb
                            });
                        },
                        multiple: !1
                    }
                };
            };
            $el.jstree(getEntityTreeConfig({
                type: ""
            })).on("load_node.jstree", function(e, data) {}).on("open_node.jstree", function(e, data) {}).on("select_node.jstree", function(e, data) {
                that.fromManualRender !== !0 ? (that.onNodeSelect(data), that.glossaryId === data.node.original.id && (that.glossaryId = null)) : that.fromManualRender = !1, 
                createAction(_.extend({}, options, data));
            }).on("open_node.jstree", function(e, data) {
                createAction(_.extend({}, options, data));
            }).on("search.jstree", function(nodes, str, res) {
                0 === str.nodes.length ? ($el.jstree(!0).hide_all(), $el.parents(".panel").addClass("hide")) : $el.parents(".panel").removeClass("hide");
            }).on("loaded.jstree", function() {
                that.options.value && (that.options.value.term && that.selectDefaultNode(), that.isTermView || (that.selectDefaultNode(), 
                that.options.categoryEvent.trigger("Success:Category", !0))), that.isTermView === !1 && that.glossarySwitchBtnUpdate();
            }).on("hover_node.jstree", function(nodes, str, res) {
                var aTerm = that.$("#" + str.node.a_attr.id), termOffset = aTerm.find(">.jstree-icon").offset();
                that.$(".tree-tooltip").removeClass("show"), setTimeout(function() {
                    aTerm.hasClass("jstree-hovered") && termOffset.top && termOffset.left && aTerm.find(">span.tree-tooltip").css({
                        top: "calc(" + termOffset.top + "px - 45px)",
                        left: "24px"
                    }).addClass("show");
                }, 1200);
            }).on("dehover_node.jstree", function(nodes, str, res) {
                that.$(".tree-tooltip").removeClass("show");
            });
        },
        selectDefaultNode: function() {
            this.ui.termSearchTree.jstree(!0).select_node(this.options.value.guid);
        },
        refresh: function(options) {
            this.glossaryTermId = null, this.fetchGlossary(), this.isGlossaryTree = !0;
        },
        onClickImportGlossary: function() {
            var that = this;
            require([ "views/import/ImportLayoutView" ], function(ImportLayoutView) {
                new ImportLayoutView({
                    callback: function() {
                        that.refresh();
                    },
                    isGlossary: !0
                });
            });
        }
    });
    return GlossaryTreeLayoutView;
});