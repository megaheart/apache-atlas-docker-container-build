define([ "require", "hbs!tmpl/search/tree/ClassificationTreeLayoutView_tmpl", "utils/Utils", "utils/Messages", "utils/Globals", "utils/UrlLinks", "utils/CommonViewFunction", "collection/VSearchList", "collection/VGlossaryList", "utils/Enums", "collection/VTagList", "jstree" ], function(require, ClassificationTreeLayoutViewTmpl, Utils, Messages, Globals, UrlLinks, CommonViewFunction, VSearchList, VGlossaryList, Enums, VTagList) {
    "use strict";
    var ClassificationTreeLayoutView = Marionette.LayoutView.extend({
        template: ClassificationTreeLayoutViewTmpl,
        regions: {},
        ui: {
            refreshTree: '[data-id="refreshTree"]',
            groupOrFlatTree: '[data-id="groupOrFlatTreeView"]',
            classificationSearchTree: '[data-id="classificationSearchTree"]',
            showEmptyClassifications: '[data-id="showEmptyClassifications"]',
            createTag: '[data-id="createTag"]',
            wildCardClick: '[data-id="wildCardClick"]',
            wildCardSearch: '[data-id="wildCardSearch"]',
            wildCardValue: '[data-id="wildCardValue"]',
            wildCardContainer: '[data-id="wildCardContainer"]',
            clearWildCard: '[data-id="clearWildCard"]',
            classificationTreeLoader: '[data-id="classificationTreeLoader"]'
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
                var type = $(e.currentTarget).data("type");
                e.stopPropagation(), that.refresh({
                    type: type
                });
            }, events["click " + this.ui.createTag] = function(e) {
                e.stopPropagation(), that.onClickCreateTag();
            }, events["click " + this.ui.showEmptyClassifications] = function(e) {
                e.stopPropagation(), this.isEmptyClassification = !this.isEmptyClassification, this.classificationSwitchBtnUpdate();
            }, events["click " + this.ui.groupOrFlatTree] = function(e) {
                var type = $(e.currentTarget).data("type");
                e.stopPropagation(), this.isGroupView = !this.isGroupView, this.ui.groupOrFlatTree.tooltip("hide"), 
                this.ui.groupOrFlatTree.find("i").toggleClass("fa-sitemap fa-list-ul"), this.ui.groupOrFlatTree.find("span").html(this.isGroupView ? "Show flat tree" : "Show group tree"), 
                that.ui[type + "SearchTree"].jstree(!0).destroy(), that.renderClassificationTree();
            }, events["click " + this.ui.wildCardClick] = function(e) {
                e.stopPropagation();
            }, events["click " + this.ui.wildCardSearch] = function(e) {
                e.stopPropagation();
                var tagValue = this.ui.wildCardValue.val();
                tagValue.indexOf("*") != -1 && that.findSearchResult(tagValue);
            }, events["click " + this.ui.wildCardValue] = function(e) {
                e.stopPropagation();
            }, events["click " + this.ui.clearWildCard] = function(e) {
                e.stopPropagation(), that.ui.wildCardValue.val(""), that.ui.clearWildCard.addClass("hide-icon");
            }, events["click " + this.ui.wildCardContainer] = function(e) {
                e.stopPropagation();
            }, events["keydown " + this.ui.wildCardValue] = function(e) {
                e.stopPropagation();
                var code = e.which;
                if (this.ui.wildCardValue.val().length > 0 ? this.ui.clearWildCard.removeClass("hide-icon") : this.ui.clearWildCard.addClass("hide-icon"), 
                13 == code) {
                    e.preventDefault();
                    var tagValue = this.ui.wildCardValue.val();
                    tagValue.indexOf("*") != -1 && that.findSearchResult(tagValue);
                }
            }, events["keyup " + this.ui.wildCardValue] = function(e) {
                e.stopPropagation(), e.preventDefault();
            }, events;
        },
        initialize: function(options) {
            this.options = options, _.extend(this, _.pick(options, "typeHeaders", "searchVent", "entityDefCollection", "enumDefCollection", "classificationDefCollection", "searchTableColumns", "searchTableFilters", "metricCollection")), 
            this.bindEvents(), this.entityCountObj = _.first(this.metricCollection.toJSON()), 
            this.isEmptyClassification = !1, this.entityTreeData = {}, this.tagId = null, this.isGroupView = !0;
        },
        onRender: function() {
            this.changeLoaderState(!0), this.checkTagOnRefresh(), this.createClassificationAction(), 
            this.ui.clearWildCard.addClass("hide-icon"), this.changeLoaderState(!1);
        },
        checkTagOnRefresh: function() {
            var that = this, tagName = this.options && this.options.value ? this.options.value.tag : null, presentTag = this.classificationDefCollection.fullCollection.findWhere({
                name: tagName
            }), tag = new VTagList();
            !presentTag && tagName ? (tag.url = UrlLinks.classificationDefApiUrl(tagName), tag.fetch({
                success: function(dataOrCollection, tagDetails) {
                    that.classificationDefCollection.fullCollection.add(tagDetails);
                },
                cust_error: function(model, response) {
                    that.renderClassificationTree();
                }
            })) : this.renderClassificationTree();
        },
        changeLoaderState: function(showLoader) {
            showLoader ? (this.ui.classificationSearchTree.hide(), this.ui.classificationTreeLoader.show()) : (this.ui.classificationSearchTree.show(), 
            this.ui.classificationTreeLoader.hide());
        },
        bindEvents: function() {
            var that = this;
            this.listenTo(this.classificationDefCollection.fullCollection, "reset", function(model) {
                that.classificationTreeUpdate = !0, that.classificationTreeRefresh();
            }, this), this.listenTo(this.classificationDefCollection.fullCollection, "remove add", function(model) {
                that.classificationTreeUpdate = !1, that.classificationTreeRefresh();
            }, this), $("body").on("click", ".classificationPopoverOptions li", function(e) {
                that.$(".classificationPopover").popover("hide"), that[$(this).find("a").data("fn") + "Classification"](e);
            }), this.searchVent.on("Classification:Count:Update", function(options) {
                that.changeLoaderState(!0);
                var opt = options || {};
                opt && !opt.metricData ? that.metricCollection.fetch({
                    complete: function() {
                        that.entityCountObj = _.first(that.metricCollection.toJSON()), that.classificationTreeUpdate = !0, 
                        that.ui.classificationSearchTree.jstree(!0).refresh(), that.changeLoaderState(!1);
                    }
                }) : (that.entityCountObj = opt.metricData, that.ui.classificationSearchTree.jstree(!0).refresh(), 
                that.changeLoaderState(!1));
            });
        },
        classificationTreeRefresh: function() {
            this.ui.classificationSearchTree.jstree(!0) ? this.ui.classificationSearchTree.jstree(!0).refresh() : this.renderClassificationTree();
        },
        findSearchResult: function(tagValue) {
            if (!tagValue) return void Utils.notifyInfo({
                content: "Search should not be empty!"
            });
            var params = {
                searchType: "basic",
                dslChecked: !1
            };
            this.options.value && (params.tag = tagValue);
            var searchParam = _.extend({}, this.options.value, params);
            this.triggerSearch(searchParam);
        },
        onSearchClassificationNode: function(showEmptyTag) {
            this.isEmptyClassification = showEmptyTag, this.classificationSwitchBtnUpdate();
        },
        classificationSwitchBtnUpdate: function() {
            this.ui.showEmptyClassifications.attr("data-original-title", (this.isEmptyClassification ? "Show" : "Hide") + " unused classification"), 
            this.ui.showEmptyClassifications.tooltip("hide"), this.ui.showEmptyClassifications.find("i").toggleClass("fa-toggle-on fa-toggle-off"), 
            this.ui.showEmptyClassifications.find("span").html((this.isEmptyClassification ? "Show" : "Hide") + " unused classification"), 
            this.ui.classificationSearchTree.jstree(!0).refresh();
        },
        createClassificationAction: function() {
            Utils.generatePopover({
                el: this.$el,
                contentClass: "classificationPopoverOptions",
                popoverOptions: {
                    selector: ".classificationPopover",
                    content: function() {
                        var name = this.dataset.name || null, searchString = "<li><i class='fa fa-search'></i><a href='javascript:void(0)' data-fn='onSelectedSearch'>Search</a></li>";
                        if (name && Enums.addOnClassification.includes(name)) return "<ul>" + searchString + "</ul>";
                        var liString = " <li><i class='fa fa-plus'></i><a href='javascript:void(0)' data-fn='onClickCreateTag'>Create Sub-classification</a></li><li><i class='fa fa-list-alt'></i><a href='javascript:void(0)' data-fn='onViewEdit'>View/Edit</a></li><li><i class='fa fa-trash-o'></i><a href='javascript:void(0)' data-fn='onDelete'>Delete</a></li>";
                        return "<ul>" + liString + searchString + "</ul>";
                    }
                }
            });
        },
        renderClassificationTree: function() {
            this.generateSearchTree({
                $el: this.ui.classificationSearchTree
            });
        },
        manualRender: function(options) {
            var that = this;
            if (_.extend(this.options, options), void 0 === this.options.value && (this.options.value = {}), 
            this.options.value.tag) {
                if (that.options.value.attributes && (that.options.value.attributes = null), "_ALL_CLASSIFICATION_TYPES" === that.options.value.tag && "_ALL_CLASSIFICATION_TYPES" !== this.tagId || "_NOT_CLASSIFIED" === that.options.value.tag && "_NOT_CLASSIFIED" !== this.tagId || "_CLASSIFIED" === that.options.value.tag && "_CLASSIFIED" !== this.tagId) this.fromManualRender = !0, 
                this.tagId && this.ui.classificationSearchTree.jstree(!0).deselect_node(this.tagId), 
                this.tagId = Globals[that.options.value.tag].guid, this.ui.classificationSearchTree.jstree(!0).select_node(this.tagId); else if ("_ALL_CLASSIFICATION_TYPES" !== this.tagId && that.options.value.tag !== this.tagId || "_NOT_CLASSIFIED" !== this.tagId && that.options.value.tag !== this.tagId || "_CLASSIFIED" !== this.tagId && that.options.value.tag !== this.tagId) {
                    that.options.value.tag.indexOf("*") != -1 && (that.ui.classificationSearchTree.jstree(!0).deselect_all(), 
                    that.ui.wildCardValue.val(that.options.value.tag));
                    var dataFound = this.classificationDefCollection.fullCollection.find(function(obj) {
                        return obj.get("name") === that.options.value.tag;
                    });
                    dataFound && (this.tagId && this.tagId !== dataFound.get("guid") || null === this.tagId) && (this.tagId && this.ui.classificationSearchTree.jstree(!0).deselect_node(this.tagId), 
                    this.fromManualRender = !0, this.tagId = dataFound.get("guid"), this.ui.classificationSearchTree.jstree(!0).select_node(dataFound.get("guid")));
                }
            } else this.ui.classificationSearchTree.jstree(!0).deselect_all(), this.tagId = null;
        },
        onNodeSelect: function(options) {
            if (Globals.fromRelationshipSearch = !1, this.classificationTreeUpdate) return void (this.classificationTreeUpdate = !1);
            var name, selectedNodeId, that = this;
            that.ui.wildCardValue.val(""), options ? (name = options.node.original.name, selectedNodeId = options.node.id) : name = this.options.value.type || this.options.value.tag;
            var tagValue = null, params = {
                searchType: "basic",
                dslChecked: !1
            };
            if (this.options.value && (this.options.value.tag && (params.tag = this.options.value.tag), 
            this.options.value.isCF && (this.options.value.isCF = null), this.options.value.tagFilters && (params.tagFilters = null)), 
            that.tagId != selectedNodeId) that.tagId = selectedNodeId, tagValue = name, params.tag = tagValue; else if (that.options.value.tag = that.tagId = params.tag = null, 
            that.ui.classificationSearchTree.jstree(!0).deselect_all(!0), !(that.options.value.type || that.options.value.tag || that.options.value.term || that.options.value.query)) {
                var defaultUrl = "#!/search";
                return void that.onClassificationUpdate(defaultUrl);
            }
            var searchParam = _.extend({}, this.options.value, params);
            this.triggerSearch(searchParam);
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
        onClassificationUpdate: function(url) {
            Utils.setUrl({
                url: url,
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
        },
        refresh: function(options) {
            var that = this, apiCount = 2, renderTree = function() {
                0 === apiCount && (that.classificationDefCollection.fullCollection.comparator = function(model) {
                    return model.get("name").toLowerCase();
                }, that.classificationDefCollection.fullCollection.sort({
                    silent: !0
                }), that.classificationTreeUpdate = !0, that.ui.classificationSearchTree.jstree(!0).refresh(), 
                that.changeLoaderState(!1), that.ui.refreshTree.attr("disabled", !1));
            };
            this.classificationDefCollection.fetch({
                silent: !0,
                complete: function() {
                    --apiCount, renderTree();
                }
            }), this.metricCollection.fetch({
                complete: function() {
                    --apiCount, that.entityCountObj = _.first(that.metricCollection.toJSON()), renderTree();
                }
            });
        },
        getClassificationTree: function(options) {
            var that = this, collection = options && options.collection || this.classificationDefCollection.fullCollection, listOfParents = [], listWithEmptyParents = [], listWithEmptyParentsFlatView = [], flatViewList = [], isSelectedChild = !1, generateNode = function(nodeOptions, options, isChild) {
                var nodeStructure = {
                    text: _.escape(nodeOptions.name),
                    name: _.escape(nodeOptions.name),
                    children: that.isGroupView ? getChildren({
                        children: isChild ? nodeOptions.model.subTypes : nodeOptions.model.get("subTypes"),
                        parent: isChild ? options.parentName : nodeOptions.name
                    }) : null,
                    type: isChild ? nodeOptions.children.get("category") : nodeOptions.model.get("category"),
                    id: isChild ? nodeOptions.children.get("guid") : nodeOptions.model.get("guid"),
                    icon: "fa fa-tag",
                    gType: "Classification"
                };
                return nodeStructure;
            }, getChildren = function(options) {
                var children = options.children, data = [], dataWithoutEmptyTag = [];
                children && children.length && _.each(children, function(name) {
                    var child = collection.find({
                        name: name
                    }), tagEntityCount = that.entityCountObj ? that.entityCountObj.tag.tagEntities[name] : null, tagname = tagEntityCount ? name + " (" + _.numberFormatWithComma(tagEntityCount) + ")" : name;
                    if (that.options.value && (isSelectedChild = !!that.options.value.tag && that.options.value.tag == name, 
                    that.tagId || (that.tagId = isSelectedChild ? child.get("guid") : null)), child) {
                        var modelJSON = child.toJSON(), nodeDetails = {
                            name: _.escape(name),
                            model: modelJSON,
                            children: child,
                            isSelectedChild: isSelectedChild
                        }, nodeProperties = {
                            parent: options.parentName,
                            text: _.escape(tagname),
                            guid: child.get("guid"),
                            model: child,
                            state: {
                                selected: isSelectedChild,
                                opened: !0
                            }
                        }, isChild = !0, getNodeDetails = generateNode(nodeDetails, options, isChild), classificationNode = _.extend(getNodeDetails, nodeProperties);
                        if (data.push(classificationNode), that.isEmptyClassification) {
                            var isTagEntityCount = _.isNaN(tagEntityCount) ? 0 : tagEntityCount;
                            isTagEntityCount && dataWithoutEmptyTag.push(classificationNode);
                        }
                    }
                });
                var tagData = that.isEmptyClassification ? dataWithoutEmptyTag : data;
                return tagData;
            };
            collection.each(function(model) {
                var modelJSON = model.toJSON(), name = modelJSON.name, tagEntityCount = that.entityCountObj ? that.entityCountObj.tag.tagEntities[name] : null, tagname = tagEntityCount ? name + " (" + _.numberFormatWithComma(tagEntityCount) + ")" : name, isSelected = !1;
                that.options.value && (isSelected = !!that.options.value.tag && that.options.value.tag == name, 
                that.tagId || (that.tagId = isSelected ? model.get("guid") : null));
                var getParentNodeDetails, classificationParentNode, getParentFlatView, classificationParentFlatView, parentNodeDetails = {
                    name: _.escape(name),
                    model: model,
                    isSelectedChild: isSelectedChild
                }, parentNodeProperties = {
                    text: _.escape(tagname),
                    state: {
                        disabled: 0 == tagEntityCount,
                        selected: isSelected,
                        opened: !0
                    }
                }, isChild = !1;
                if (0 == modelJSON.superTypes.length && (getParentNodeDetails = generateNode(parentNodeDetails, model, isChild), 
                classificationParentNode = _.extend(getParentNodeDetails, parentNodeProperties), 
                listOfParents.push(classificationParentNode)), getParentFlatView = generateNode(parentNodeDetails, model), 
                classificationParentFlatView = _.extend(getParentFlatView, parentNodeProperties), 
                flatViewList.push(classificationParentFlatView), that.isEmptyClassification) {
                    var isTagEntityCount = _.isNaN(tagEntityCount) ? 0 : tagEntityCount;
                    isTagEntityCount && (0 == modelJSON.superTypes.length && listWithEmptyParents.push(classificationParentNode), 
                    listWithEmptyParentsFlatView.push(classificationParentFlatView));
                }
            });
            var classificationTreeData = that.isEmptyClassification ? listWithEmptyParents : listOfParents, flatViewClassificaton = that.isEmptyClassification ? listWithEmptyParentsFlatView : flatViewList, classificationData = that.isGroupView ? that.pushRootClassificationToJstree.call(that, classificationTreeData) : that.pushRootClassificationToJstree.call(that, flatViewClassificaton);
            return classificationData;
        },
        pushRootClassificationToJstree: function(data) {
            var that = this;
            return _.each(Enums.addOnClassification, function(addOnClassification) {
                var rootClassification = Globals[addOnClassification], isSelected = !(!that.options.value || !that.options.value.tag) && that.options.value.tag == rootClassification.name, rootClassificationNode = {
                    text: _.escape(rootClassification.name),
                    name: rootClassification.name,
                    type: rootClassification.category,
                    gType: "Classification",
                    guid: rootClassification.guid,
                    id: rootClassification.guid,
                    model: rootClassification,
                    children: [],
                    icon: "fa fa-tag",
                    state: {
                        selected: isSelected
                    }
                };
                data.push(rootClassificationNode);
            }), data;
        },
        generateSearchTree: function(options) {
            var $el = options && options.$el, that = (options && options.type, this), getEntityTreeConfig = function(opt) {
                return {
                    plugins: [ "search", "core", "sort", "conditionalselect", "changed", "wholerow", "node_customize" ],
                    conditionalselect: function(node) {
                        var type = node.original.type;
                        return "ENTITY" != type && "GLOSSARY" != type || !node.children.length && "GLOSSARY" != type;
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
                            var aTag = $(el).find(">a.jstree-anchor"), nameText = aTag.text();
                            aTag.append("<span class='tree-tooltip'>" + nameText + "</span>"), $(el).append('<div class="tools"><i class="fa fa-ellipsis-h classificationPopover" rel="popover" data-name=' + nameText + "></i></div>");
                        }
                    },
                    core: {
                        multiple: !1,
                        data: function(node, cb) {
                            "#" === node.id && cb(that.getClassificationTree());
                        }
                    }
                };
            };
            $el.jstree(getEntityTreeConfig({
                type: ""
            })).on("open_node.jstree", function(e, data) {
                that.isTreeOpen = !0;
            }).on("select_node.jstree", function(e, data) {
                that.fromManualRender !== !0 ? that.onNodeSelect(data) : that.fromManualRender = !1;
            }).on("search.jstree", function(nodes, str, res) {
                0 === str.nodes.length ? ($el.jstree(!0).hide_all(), $el.parents(".panel").addClass("hide")) : $el.parents(".panel").removeClass("hide");
            }).on("hover_node.jstree", function(nodes, str, res) {
                var aTag = that.$("#" + str.node.a_attr.id), tagOffset = aTag.find(">.jstree-icon").offset();
                that.$(".tree-tooltip").removeClass("show"), setTimeout(function() {
                    aTag.hasClass("jstree-hovered") && tagOffset.top && tagOffset.left && aTag.find(">span.tree-tooltip").css({
                        top: "calc(" + tagOffset.top + "px - 45px)",
                        left: "24px"
                    }).addClass("show");
                }, 1200);
            }).on("dehover_node.jstree", function(nodes, str, res) {
                that.$(".tree-tooltip").removeClass("show");
            });
        },
        onClickCreateTag: function(tagName) {
            var that = this;
            require([ "views/tag/CreateTagLayoutView", "modules/Modal" ], function(CreateTagLayoutView, Modal) {
                var view = new CreateTagLayoutView({
                    tagCollection: that.options.classificationDefCollection,
                    enumDefCollection: enumDefCollection,
                    selectedTag: tagName
                }), modal = new Modal({
                    title: "Create a new classification",
                    content: view,
                    cancelText: "Cancel",
                    okCloses: !1,
                    okText: "Create",
                    allowCancel: !0
                }).open();
                modal.$el.find("button.ok").attr("disabled", "true"), view.ui.tagName.on("keyup input", function(e) {
                    $(view.ui.description).trumbowyg("html", _.escape($(this).val()).replace(/\s+/g, " "));
                }), view.ui.description.on("input keydown", function(e) {
                    $(this).val($(this).val().replace(/\s+/g, " "));
                }), modal.on("shownModal", function() {
                    view.ui.parentTag.select2({
                        multiple: !0,
                        placeholder: "Search Classification",
                        allowClear: !0
                    });
                }), modal.on("ok", function() {
                    modal.$el.find("button.ok").showButtonLoader(), that.onCreateTagButton(view, modal);
                }), modal.on("closeModal", function() {
                    modal.trigger("cancel");
                });
            });
        },
        onCreateTagButton: function(ref, modal) {
            var that = this, validate = !0;
            if (modal.$el.find(".attributeInput").length > 0 && modal.$el.find(".attributeInput").each(function() {
                "" === $(this).val() && ($(this).css("borderColor", "red"), validate = !1);
            }), modal.$el.find(".attributeInput").keyup(function() {
                $(this).css("borderColor", "#e8e9ee"), modal.$el.find("button.ok").removeAttr("disabled");
            }), !validate) return Utils.notifyInfo({
                content: "Please fill the attributes or delete the input box"
            }), void modal.$el.find("button.ok").hideButtonLoader();
            var name = ref.ui.tagName.val(), description = Utils.sanitizeHtmlContent({
                data: ref.ui.description.val()
            }), superTypes = [], parentTagVal = ref.ui.parentTag.val();
            parentTagVal && parentTagVal.length && (superTypes = parentTagVal);
            var attributeObj = ref.collection.toJSON();
            if (1 === ref.collection.length && "" === ref.collection.first().get("name") && (attributeObj = []), 
            attributeObj.length) {
                var superTypesAttributes = [];
                _.each(superTypes, function(name) {
                    var parentTags = that.options.classificationDefCollection.fullCollection.findWhere({
                        name: name
                    });
                    superTypesAttributes = superTypesAttributes.concat(parentTags.get("attributeDefs"));
                });
                var duplicateAttributeList = [];
                _.each(attributeObj, function(obj) {
                    var duplicateCheck = _.find(superTypesAttributes, function(activeTagObj) {
                        return activeTagObj.name.toLowerCase() === obj.name.toLowerCase();
                    });
                    duplicateCheck && duplicateAttributeList.push(_.escape(obj.name));
                });
                var notifyObj = {
                    modal: !0,
                    confirm: {
                        confirm: !0,
                        buttons: [ {
                            text: "Ok",
                            addClass: "btn-atlas btn-md",
                            click: function(notice) {
                                notice.remove();
                            }
                        }, null ]
                    }
                };
                if (duplicateAttributeList.length) {
                    if (duplicateAttributeList.length < 2) var text = "Attribute <b>" + duplicateAttributeList.join(",") + "</b> is duplicate !"; else if (attributeObj.length > duplicateAttributeList.length) var text = "Attributes: <b>" + duplicateAttributeList.join(",") + "</b> are duplicate !"; else var text = "All attributes are duplicate !";
                    return notifyObj.text = text, Utils.notifyConfirm(notifyObj), modal.$el.find("button.ok").hideButtonLoader(), 
                    !1;
                }
            }
            this.json = {
                classificationDefs: [ {
                    name: name.trim(),
                    description: description.trim(),
                    superTypes: superTypes.length ? superTypes : [],
                    attributeDefs: attributeObj
                } ],
                entityDefs: [],
                enumDefs: [],
                structDefs: []
            }, new this.options.classificationDefCollection.model().set(this.json).save(null, {
                success: function(model, response) {
                    var classificationDefs = model.get("classificationDefs");
                    that.createTag = !0, classificationDefs[0] && _.each(classificationDefs[0].superTypes, function(superType) {
                        var superTypeModel = that.options.classificationDefCollection.fullCollection.find({
                            name: superType
                        }), subTypes = [];
                        superTypeModel && (subTypes = superTypeModel.get("subTypes"), subTypes.push(classificationDefs[0].name), 
                        superTypeModel.set({
                            subTypes: _.uniq(subTypes)
                        }));
                    }), that.options.classificationDefCollection.fullCollection.add(classificationDefs), 
                    Utils.notifySuccess({
                        content: "Classification " + name + Messages.getAbbreviationMsg(!1, "addSuccessMessage")
                    }), modal.trigger("cancel"), modal.$el.find("button.ok").showButtonLoader(), that.typeHeaders.fetch({
                        reset: !0
                    });
                },
                complete: function() {
                    modal.$el.find("button.ok").hideButtonLoader();
                }
            });
        },
        onClickCreateTagClassification: function(e) {
            var selectedNode = this.ui.classificationSearchTree.jstree("get_selected", !0);
            selectedNode && selectedNode[0] && this.onClickCreateTag(selectedNode[0].original.name);
        },
        onViewEditClassification: function() {
            var selectedNode = this.ui.classificationSearchTree.jstree("get_selected", !0);
            if (selectedNode && selectedNode[0]) {
                var url = "#!/tag/tagAttribute/" + selectedNode[0].original.name + "?tag=" + selectedNode[0].original.name;
                this.onClassificationUpdate(url);
            }
        },
        onDeleteClassification: function() {
            var that = this, notifyObj = {
                modal: !0,
                ok: function(obj) {
                    that.notificationModal = obj, obj.showButtonLoader(), that.onNotifyOk();
                },
                okCloses: !1,
                cancel: function(argument) {}
            }, text = "Are you sure you want to delete the classification";
            notifyObj.text = text, Utils.notifyConfirm(notifyObj);
        },
        onSelectedSearchClassification: function() {
            var params = {
                searchType: "basic",
                dslChecked: !1,
                tag: this.options.value.tag
            };
            this.triggerSearch(params);
        },
        onNotifyOk: function(data) {
            var that = this;
            if (this.tagId) {
                var deleteTagData = this.classificationDefCollection.fullCollection.findWhere({
                    guid: this.tagId
                });
                if (deleteTagData) {
                    var tagName = deleteTagData.get("name"), superTypeOfDeleteTag = deleteTagData.get("superTypes"), superTypeObj = superTypeOfDeleteTag ? this.classificationDefCollection.fullCollection.findWhere({
                        name: superTypeOfDeleteTag[0]
                    }) : null;
                    deleteTagData.deleteTag({
                        typeName: tagName,
                        success: function() {
                            if (Utils.notifySuccess({
                                content: "Classification " + tagName + Messages.getAbbreviationMsg(!1, "deleteSuccessMessage")
                            }), superTypeObj) {
                                var parentSubTypeUpdate = _.reject(superTypeObj.get("subTypes"), function(subtype) {
                                    return subtype === tagName;
                                });
                                superTypeObj.set("subTypes", parentSubTypeUpdate);
                            }
                            var searchUrl = Globals.saveApplicationState.tabState.searchUrl, urlObj = Utils.getUrlState.getQueryParams(searchUrl) ? Utils.getUrlState.getQueryParams(searchUrl) : Utils.getUrlState.getQueryParams();
                            that.classificationDefCollection.fullCollection.remove(deleteTagData), that.ui.classificationSearchTree.jstree(!0).refresh(), 
                            delete urlObj.tag;
                            var url = urlObj.type || urlObj.term || urlObj.query ? "#!/search/searchResult" : "#!/search";
                            that.triggerSearch(urlObj, url);
                        },
                        complete: function() {
                            that.notificationModal.hideButtonLoader(), that.notificationModal.remove();
                        }
                    });
                } else Utils.notifyError({
                    content: Messages.defaultErrorMessage
                });
            }
        }
    });
    return ClassificationTreeLayoutView;
});