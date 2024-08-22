define([ "require", "backbone", "hbs!tmpl/glossary/GlossaryLayoutView_tmpl", "utils/Utils", "utils/Messages", "utils/Globals", "utils/UrlLinks", "utils/CommonViewFunction", "jstree" ], function(require, Backbone, GlossaryLayoutViewTmpl, Utils, Messages, Globals, UrlLinks, CommonViewFunction) {
    "use strict";
    var GlossaryLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "GlossaryLayoutView",
        template: GlossaryLayoutViewTmpl,
        regions: {},
        templateHelpers: function() {
            return {
                isAssignView: this.isAssignView,
                importTmplUrl: UrlLinks.glossaryImportTempUrl(),
                isAssignAttributeRelationView: this.isAssignAttributeRelationView
            };
        },
        ui: {
            createGlossary: "[data-id='createGlossary']",
            refreshGlossary: "[data-id='refreshGlossary']",
            searchTerm: "[data-id='searchTerm']",
            searchCategory: "[data-id='searchCategory']",
            glossaryView: 'input[name="glossaryView"]',
            termTree: "[data-id='termTree']",
            categoryTree: "[data-id='categoryTree']",
            importGlossary: "[data-id='importGlossary']",
            glossaryTreeLoader: "[data-id='glossaryTreeLoader']",
            glossaryTreeView: "[data-id='glossaryTreeView']"
        },
        events: function() {
            var events = {};
            return events["change " + this.ui.glossaryView] = "glossaryViewToggle", events["click " + this.ui.createGlossary] = function(e) {
                var that = this;
                e && $(e.currentTarget).attr("disabled", "true"), CommonViewFunction.createEditGlossaryCategoryTerm({
                    isGlossaryView: !0,
                    collection: this.glossaryCollection,
                    callback: function() {
                        that.ui.createGlossary.removeAttr("disabled"), that.getGlossary();
                    },
                    onModalClose: function() {
                        that.ui.createGlossary.removeAttr("disabled"), that.ui.termTree.jstree(!0).refresh(), 
                        that.ui.categoryTree.jstree(!0).refresh();
                    }
                });
            }, events["click " + this.ui.refreshGlossary] = function() {
                this.ui.refreshGlossary.attr("disabled", !0), this.getGlossary();
            }, events["click " + this.ui.importGlossary] = "onClickImportGlossary", events["keyup " + this.ui.searchTerm] = function() {
                this.ui.termTree.jstree("search", _.escape(this.ui.searchTerm.val()));
            }, events["keyup " + this.ui.searchCategory] = function() {
                this.ui.categoryTree.jstree("search", this.ui.searchCategory.val());
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "associatedTerms", "guid", "value", "glossaryCollection", "glossary", "isAssignTermView", "isAssignCategoryView", "isAssignEntityView", "isAssignAttributeRelationView", "importVent")), 
            this.viewType = "term", this.isAssignView = this.isAssignTermView || this.isAssignCategoryView || this.isAssignEntityView || this.isAssignAttributeRelationView, 
            this.bindEvents(), this.query = {
                term: {},
                category: {}
            }, Utils.getUrlState.isGlossaryTab() && this.value && this.value.viewType && (this.viewType = this.value.viewType, 
            this.query[this.viewType] = _.extend({}, this.value, {
                guid: this.guid
            }));
        },
        bindEvents: function() {
            var that = this;
            this.listenTo(this.glossaryCollection.fullCollection, "reset add change", function(skip) {
                this.generateTree(), this.setValues(), this.changeLoaderState(!1), this.ui.refreshGlossary.attr("disabled", !1);
            }, this), this.listenTo(this.glossaryCollection, "update:details", function(options) {
                var isGlossaryUpdate = options.isGlossaryUpdate;
                if (isGlossaryUpdate) this.ui.termTree.jstree(!0).refresh && this.ui.termTree.jstree(!0).refresh(), 
                this.ui.categoryTree.jstree(!0).refresh && this.ui.categoryTree.jstree(!0).refresh(); else {
                    var $tree = this.ui["term" == this.viewType ? "termTree" : "categoryTree"];
                    $tree.jstree(!0).refresh && ($tree.jstree(!0).refresh(), this.setValues({
                        trigger: !1
                    }));
                }
                this.changeLoaderState(!1);
            }, this), this.isAssignView || $("body").on("click", ".termPopoverOptions li, .categoryPopoverOptions li", function(e) {
                that.$(".termPopover,.categoryPopover").popover("hide"), that[$(this).find("a").data("fn")](e);
            }), this.importVent && this.importVent.on("Import:Glossary:Update", function(options) {
                that.getGlossary();
            });
        },
        onRender: function() {
            this.changeLoaderState(!0), this.isAssignCategoryView && (this.$(".category-view").show(), 
            this.$(".term-view").hide()), this.isAssignView && this.glossaryCollection.fullCollection.length ? (this.generateTree(), 
            this.disableNodesList = this.getDisableNodes()) : this.getGlossary();
        },
        changeLoaderState: function(showLoader) {
            showLoader ? (this.ui.glossaryTreeLoader.show(), this.ui.glossaryTreeView.hide()) : (this.ui.glossaryTreeLoader.hide(), 
            this.ui.glossaryTreeView.show());
        },
        setValues: function(options) {
            "category" == this.viewType ? this.ui.glossaryView.prop("checked") || this.ui.glossaryView.prop("checked", !0).trigger("change", options) : this.ui.glossaryView.prop("checked") && this.ui.glossaryView.prop("checked", !1).trigger("change", options);
        },
        glossaryViewToggle: function(e, options) {
            var that = this;
            e.currentTarget.checked ? (this.$(".category-view").show(), this.$(".term-view").hide(), 
            this.viewType = "category", this.$(".dropdown-toggle").attr("disabled", "disabled")) : (this.$(".term-view").show(), 
            this.$(".category-view").hide(), this.viewType = "term", this.$(".dropdown-toggle").removeAttr("disabled"));
            var setDefaultSelector = function() {
                if (that.value) {
                    var model = null;
                    model = that.value.gId ? that.glossaryCollection.fullCollection.get(that.value.gId) : that.glossaryCollection.fullCollection.first(), 
                    model = model.toJSON ? model.toJSON() : model, that.glossary.selectedItem = {
                        type: "Glossary",
                        guid: model.guid,
                        id: model.guid,
                        model: model,
                        text: model.name,
                        gType: "glossary"
                    };
                }
            };
            if (Utils.getUrlState.isGlossaryTab()) {
                var obj = this.query[this.viewType], $tree = this.ui["term" == this.viewType ? "termTree" : "categoryTree"];
                if (obj.gId = that.value ? that.value.gId : null, obj.guid) {
                    var node = $tree.jstree(!0).get_node(obj.guid);
                    node && (this.glossary.selectedItem = node.original, $tree.jstree("activate_node", obj.guid));
                } else that.glossaryCollection.fullCollection.length && (setDefaultSelector(), $tree.jstree("activate_node", that.glossary.selectedItem.guid));
                this.query[this.viewType] = _.extend(obj, _.pick(this.glossary.selectedItem, "model", "guid", "gType", "type"), {
                    viewType: this.viewType,
                    isNodeNotFoundAtLoad: this.query[this.viewType].isNodeNotFoundAtLoad
                });
                var url = _.isEmpty(this.glossary.selectedItem) ? "#!/glossary" : "#!/glossary/" + this.glossary.selectedItem.guid;
                Utils.setUrl({
                    url: url,
                    urlParams: _.extend({}, _.omit(obj, "guid", "model", "type", "isNodeNotFoundAtLoad")),
                    mergeBrowserUrl: !1,
                    trigger: !(options && !_.isUndefined(options.trigger)) || options.trigger,
                    updateTabState: !0
                });
            }
        },
        getGlossary: function() {
            this.changeLoaderState(!0), this.glossaryCollection.fetch({
                reset: !0
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
        generateData: function(opt) {
            var that = this, associatedTerms = (that.guid, that.associatedTerms), type = opt.type;
            opt.type == this.viewType && (this.query[opt.type].isNodeNotFoundAtLoad = !0);
            var getSelectedState = function(options) {
                var objGuid = options.objGuid, node = options.node, index = options.index;
                if (that.isAssignView) return {
                    opened: !0
                };
                if (that.guid) {
                    if (that.guid == objGuid) return that.query[that.viewType].isNodeNotFoundAtLoad = !1, 
                    that.glossary.selectedItem = node, that.query[that.viewType].model = node.model, 
                    that.query[that.viewType].type = node.type, {
                        opened: !0,
                        selected: !0
                    };
                } else {
                    that.query[that.viewType].isNodeNotFoundAtLoad = !1;
                    var selectedItem = {
                        type: "Glossary",
                        gType: "glossary",
                        model: that.glossaryCollection.fullCollection.first().toJSON()
                    };
                    if (selectedItem.text = selectedItem.model.name, selectedItem.guid = selectedItem.model.guid, 
                    0 == index && selectedItem.guid == objGuid) return that.glossary.selectedItem = selectedItem, 
                    that.query[that.viewType].model = selectedItem.model, that.query[that.viewType].type = selectedItem.type, 
                    {
                        opened: !0,
                        selected: !0
                    };
                }
            };
            return this.glossaryCollection.fullCollection.map(function(model, i) {
                var obj = model.toJSON(), parent = {
                    text: _.escape(obj.name),
                    icon: "fa fa-folder-o",
                    guid: obj.guid,
                    id: obj.guid,
                    model: obj,
                    type: obj.typeName ? obj.typeName : "Glossary",
                    gType: "glossary",
                    children: []
                };
                if (parent.state = getSelectedState({
                    index: i,
                    node: parent,
                    objGuid: obj.guid
                }), "category" == type && obj.categories) {
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
                        categoryObj.state = getSelectedState({
                            index: i,
                            node: categoryObj,
                            objGuid: guid
                        }), category.parentCategoryGuid && catrgoryRelation.push({
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
                return "term" == type && obj.terms && _.each(obj.terms, function(term) {
                    if (associatedTerms) {
                        var associatedTermFound = _.find(associatedTerms, function(obj, index) {
                            if ((obj.termGuid ? obj.termGuid : obj.guid) == term.termGuid) return obj;
                        });
                        if (associatedTermFound) return;
                    }
                    var typeName = term.typeName || "GlossaryTerm", guid = term.termGuid, termObj = {
                        text: _.escape(term.displayText),
                        type: typeName,
                        gType: "term",
                        guid: guid,
                        id: guid,
                        parent: obj,
                        glossaryName: obj.name,
                        glossaryId: obj.guid,
                        model: term,
                        icon: "fa fa-file-o"
                    };
                    termObj.state = getSelectedState({
                        index: i,
                        node: termObj,
                        objGuid: guid
                    }), parent.children.push(termObj);
                }), parent;
            });
        },
        manualRender: function(options) {
            if (_.extend(this, _.omit(options, "isTrigger")), this.value && this.value.viewType && (this.viewType = this.value.viewType), 
            this.guid && this.value && (this.value.fromView && this.value.fromView || this.value.updateView)) {
                var $tree = this.ui["term" == this.viewType ? "termTree" : "categoryTree"], node = $tree.jstree(!0).get_node(this.guid);
                node && ($tree.jstree("activate_node", this.guid, {
                    skipTrigger: !0
                }), delete this.value.fromView, delete this.value.updateView, this.glossary.selectedItem = node.original, 
                this.query[this.viewType] = _.extend({}, _.pick(this.glossary.selectedItem, "model", "guid", "gType", "type"), {
                    viewType: this.viewType
                }), Utils.setUrl({
                    url: "#!/glossary/" + this.guid,
                    urlParams: this.value,
                    mergeBrowserUrl: !1,
                    trigger: !1,
                    updateTabState: !0
                }), this.glossaryCollection.trigger("update:details", {
                    isGlossaryUpdate: "glossary" == this.value.gType
                }));
            } else this.setValues();
            options.isTrigger && this.triggerUrl();
        },
        getDisableNodes: function() {
            var disableNodesSelection = [];
            if (this.options && this.options.isAssignAttributeRelationView) {
                var disableTerms = this.options.termData && this.options.selectedTermAttribute ? this.options.termData[this.options.selectedTermAttribute] : null;
                disableNodesSelection = _.map(disableTerms, function(obj) {
                    return obj.termGuid;
                }), disableNodesSelection.push(this.options.termData.guid);
            }
            return disableNodesSelection;
        },
        generateTree: function() {
            var $termTree = this.ui.termTree, $categoryTree = this.ui.categoryTree, that = this, getTreeConfig = (that.guid, 
            function(options) {
                return {
                    plugins: [ "search", "themes", "core", "wholerow", "sort", "conditionalselect" ],
                    conditionalselect: function(node) {
                        var obj = node && node.original && node.original.type;
                        if (obj) {
                            if (that.isAssignView) {
                                var isDisableNode = !1;
                                return that.disableNodesList && (isDisableNode = that.disableNodesList.indexOf(node.original.guid) > -1), 
                                "Glossary" != obj && !isDisableNode;
                            }
                            return "NoAction" != obj;
                        }
                    },
                    search: {
                        show_only_matches: !0
                    },
                    core: {
                        data: function(node, cb) {
                            "#" === node.id ? cb(that.generateData(options)) : that.getCategory({
                                node: node.original,
                                callback: cb
                            });
                        },
                        themes: {
                            name: that.isAssignView ? "default" : "default-dark",
                            dots: !0
                        }
                    }
                };
            }), treeLoaded = function(options) {
                if (1 == that.query[options.type].isNodeNotFoundAtLoad) {
                    var id = that.glossary.selectedItem.guid;
                    id && options.$el.jstree("activate_node", id);
                }
                that.changeLoaderState(!1);
            }, createAction = function(options) {
                var $el = options.el, type = options.type, popoverClassName = "term" == type ? "termPopover" : "categoryPopover";
                if (!that.isAssignView) {
                    var wholerowEl = $el.find("li[role='treeitem'] > .jstree-wholerow:not(:has(>div.tools))");
                    wholerowEl.append('<div class="tools"><i class="fa fa-ellipsis-h ' + popoverClassName + '"></i></div>'), 
                    "term" == type ? that.createTermAction() : "category" == type && that.createCategoryAction();
                }
            }, initializeTree = function(options) {
                var $el = options.el, type = options.type;
                $el.jstree(getTreeConfig({
                    type: type
                })).on("load_node.jstree", function(e, data) {
                    createAction(_.extend({}, options, data));
                }).on("open_node.jstree", function(e, data) {
                    createAction(_.extend({}, options, data));
                }).on("select_node.jstree", function(e, data) {
                    if (that.isAssignView) that.glossary.selectedItem = data.node.original, that.glossaryCollection.trigger("node_selected"); else {
                        var popoverClassName = "term" == type ? ".termPopover" : ".categoryPopover", currentClickedPopoverEl = "";
                        if (data.event && (currentClickedPopoverEl = $(data.event.currentTarget).parent().hasClass("jstree-leaf") ? $(data.event.currentTarget).parent().find(popoverClassName) : $(data.event.currentTarget).parent().find(">div " + popoverClassName), 
                        $(popoverClassName).not(currentClickedPopoverEl).popover("hide")), 1 == that.query[type].isNodeNotFoundAtLoad) that.query[type].isNodeNotFoundAtLoad = !1; else if (type == that.viewType) {
                            if (data && data.event && data.event.skipTrigger) return;
                            that.glossary.selectedItem.guid !== data.node.original.guid && (that.glossary.selectedItem = data.node.original, 
                            that.triggerUrl());
                        }
                    }
                }).on("search.jstree", function(e, data) {
                    createAction(_.extend({}, options, data));
                }).on("clear_search.jstree", function(e, data) {
                    createAction(_.extend({}, options, data));
                }).bind("loaded.jstree", function(e, data) {
                    treeLoaded({
                        $el: $el,
                        type: type
                    });
                });
            }, initializeTermTree = function() {
                $termTree.data("jstree") ? ($(".termPopover").popover("destroy"), $termTree.jstree(!0).refresh()) : initializeTree({
                    el: $termTree,
                    type: "term"
                });
            }, initializeCategoryTree = function() {
                $categoryTree.data("jstree") ? ($(".categoryPopover").popover("destroy"), $categoryTree.jstree(!0).refresh()) : initializeTree({
                    el: $categoryTree,
                    type: "category"
                });
            };
            this.isAssignView ? this.isAssignTermView || this.isAssignEntityView || this.isAssignAttributeRelationView ? initializeTermTree() : this.isAssignCategoryView && initializeCategoryTree() : (initializeTermTree(), 
            initializeCategoryTree()), Utils.getUrlState.isGlossaryTab() && this.triggerUrl(), 
            this.glossaryCollection.trigger("render:done");
        },
        createTermAction: function() {
            var that = this;
            Utils.generatePopover({
                el: this.$(".termPopover"),
                contentClass: "termPopoverOptions",
                popoverOptions: {
                    content: function() {
                        var node = that.query[that.viewType], liString = "";
                        return liString = "Glossary" == node.type ? "<li data-type=" + node.type + " class='listTerm'><i class='fa fa-plus'></i> <a href='javascript:void(0)' data-fn='createSubNode'>Create Term</a></li><li data-type=" + node.type + " class='listTerm'><i class='fa fa-trash-o'></i><a href='javascript:void(0)' data-fn='deleteNode'>Delete Glossary</a></li>" : "<li data-type=" + node.type + " class='listTerm'><i class='fa fa-trash-o'></i><a href='javascript:void(0)' data-fn='deleteNode'>Delete Term</a></li>", 
                        "<ul>" + liString + "</ul>";
                    }
                }
            });
        },
        createCategoryAction: function() {
            var that = this;
            Utils.generatePopover({
                el: this.$(".categoryPopover"),
                contentClass: "categoryPopoverOptions",
                popoverOptions: {
                    content: function() {
                        var node = that.query[that.viewType], liString = "";
                        return liString = "Glossary" == node.type ? "<li data-type=" + node.type + " class='listTerm'><i class='fa fa-plus'></i> <a href='javascript:void(0)' data-fn='createSubNode'>Create Category</a></li><li data-type=" + node.type + " class='listTerm'><i class='fa fa-trash-o'></i><a href='javascript:void(0)' data-fn='deleteNode'>Delete Glossary</a></li>" : "<li data-type=" + node.type + " class='listTerm'><i class='fa fa-plus'></i> <a href='javascript:void(0)' data-fn='createSubNode'>Create Sub-Category</a></li><li data-type=" + node.type + " class='listTerm'><i class='fa fa-trash-o'></i><a href='javascript:void(0)' data-fn='deleteNode'>Delete Category</a></li>", 
                        "<ul>" + liString + "</ul>";
                    }
                }
            });
        },
        createSubNode: function(opt) {
            var that = this, type = this.glossary.selectedItem.type;
            "Glossary" != type && "GlossaryCategory" != type || "category" != this.viewType ? CommonViewFunction.createEditGlossaryCategoryTerm({
                isTermView: !0,
                callback: function() {
                    that.getGlossary();
                },
                collection: that.glossaryCollection,
                node: this.glossary.selectedItem
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
                    that.ui.categoryTree.jstree(!0).refresh();
                },
                node: this.glossary.selectedItem
            });
        },
        deleteNode: function(opt) {
            var that = this, messageType = "", type = this.glossary.selectedItem.type, guid = this.glossary.selectedItem.guid, gId = this.glossary.selectedItem.glossaryId, options = {
                success: function(rModel, response) {
                    gId || (gId = guid), gId === guid && that.glossaryCollection.fullCollection.remove(gId);
                    var glossary = that.glossaryCollection.fullCollection.get(gId);
                    that.value && ("term" == that.value.gType ? glossary.set("terms", _.reject(glossary.get("terms"), function(obj) {
                        return obj.termGuid == guid;
                    }), {
                        silent: !0
                    }) : "category" == that.value.gType ? glossary.set("categories", _.reject(glossary.get("categories"), function(obj) {
                        return obj.categoryGuid == guid || obj.parentCategoryGuid == guid;
                    }), {
                        silent: !0
                    }) : (glossary = that.glossaryCollection.fullCollection.first(), gId = glossary ? glossary.get("guid") : null)), 
                    Utils.notifySuccess({
                        content: messageType + Messages.getAbbreviationMsg(!1, "deleteSuccessMessage")
                    });
                    var url = gId ? "#!/glossary/" + gId : "#!/glossary";
                    null == gId && (that.glossary.selectedItem = {}, that.value = null, that.query = {
                        term: {},
                        category: {}
                    }, that.ui.categoryTree.jstree(!0).refresh(), that.ui.termTree.jstree(!0).refresh()), 
                    Utils.setUrl({
                        url: url,
                        mergeBrowserUrl: !1,
                        trigger: !0,
                        urlParams: gId ? _.extend({}, that.value, {
                            gType: "glossary",
                            updateView: !0,
                            gId: null
                        }) : null,
                        updateTabState: !0
                    });
                },
                complete: function() {
                    0 === that.glossaryCollection.fullCollection.length && (that.guid = null), that.notificationModal.hideButtonLoader(), 
                    that.notificationModal.remove();
                }
            }, notifyObj = {
                modal: !0,
                ok: function(obj) {
                    that.notificationModal = obj, obj.showButtonLoader(), "Glossary" == type ? new that.glossaryCollection.model().deleteGlossary(guid, options) : "GlossaryCategory" == type ? new that.glossaryCollection.model().deleteCategory(guid, options) : "GlossaryTerm" == type && new that.glossaryCollection.model().deleteTerm(guid, options);
                },
                okCloses: !1,
                cancel: function(argument) {}
            };
            "Glossary" == type ? messageType = "Glossary" : "GlossaryCategory" == type ? messageType = "Category" : "GlossaryTerm" == type && (messageType = "Term"), 
            notifyObj.text = "Are you sure you want to delete the " + messageType, Utils.notifyConfirm(notifyObj);
        },
        triggerUrl: function(options) {
            if (!this.isAssignView) {
                var selectedItem = this.glossary.selectedItem;
                if (this.glossaryCollection.length && (_.isEmpty(selectedItem) || this.query[this.viewType].isNodeNotFoundAtLoad)) {
                    var model = selectedItem.model;
                    model && !_.isUndefined(model.parentCategory || model.parentCategoryGuid) && (selectedItem = {
                        model: this.glossaryCollection.first().toJSON()
                    }, selectedItem.guid = selectedItem.model.guid, selectedItem.type = "Glossary", 
                    selectedItem.gType = "glossary", selectedItem.text = model.name, this.glossary.selectedItem = selectedItem, 
                    this.query[this.viewType].model = selectedItem.model, this.query[this.viewType].gType = "glossary", 
                    this.query[this.viewType].type = "Glossary", delete this.query[this.viewType].gId);
                }
                if (!_.isEmpty(selectedItem) && (Utils.getUrlState.isGlossaryTab() || Utils.getUrlState.isDetailPage())) {
                    var obj = {};
                    selectedItem.glossaryId ? obj.gId = selectedItem.glossaryId : "Glossary" == selectedItem.type && (obj.gId = selectedItem.guid), 
                    this.query[this.viewType] = _.extend(obj, _.omit(this.value, "gId"), _.pick(this.glossary.selectedItem, "model", "type", "gType", "guid"), {
                        viewType: this.viewType,
                        isNodeNotFoundAtLoad: this.query[this.viewType].isNodeNotFoundAtLoad
                    }), "GlossaryTerm" === selectedItem.type ? obj.term = selectedItem.text + "@" + selectedItem.glossaryName : delete obj.term, 
                    Utils.setUrl({
                        url: "#!/glossary/" + obj.guid,
                        mergeBrowserUrl: !1,
                        trigger: !0,
                        urlParams: _.omit(obj, "model", "type", "isNodeNotFoundAtLoad"),
                        updateTabState: !0
                    });
                }
            }
        },
        onClickImportGlossary: function() {
            var that = this;
            require([ "views/import/ImportLayoutView" ], function(ImportLayoutView) {
                new ImportLayoutView({
                    callback: function() {
                        that.getGlossary();
                    },
                    isGlossary: !0
                });
            });
        }
    });
    return GlossaryLayoutView;
});