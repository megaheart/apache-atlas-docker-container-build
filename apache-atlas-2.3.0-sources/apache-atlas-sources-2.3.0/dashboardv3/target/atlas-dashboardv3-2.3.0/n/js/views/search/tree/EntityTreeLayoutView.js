define([ "require", "hbs!tmpl/search/tree/EntityTreeLayoutView_tmpl", "utils/Utils", "utils/Globals", "utils/UrlLinks", "utils/CommonViewFunction", "collection/VSearchList", "collection/VGlossaryList", "utils/Enums", "jstree" ], function(require, EntityLayoutViewTmpl, Utils, Globals, UrlLinks, CommonViewFunction, VSearchList, VGlossaryList, Enums) {
    "use strict";
    var EntityTreeLayoutview = Marionette.LayoutView.extend({
        template: EntityLayoutViewTmpl,
        regions: {},
        ui: {
            refreshTree: '[data-id="refreshTree"]',
            groupOrFlatTree: '[data-id="groupOrFlatTreeView"]',
            entitySearchTree: '[data-id="entitySearchTree"]',
            showEmptyServiceType: '[data-id="showEmptyServiceType"]',
            entityTreeLoader: '[data-id="entityTreeLoader"]',
            importBusinessMetadata: "[data-id='importBusinessMetadata']",
            downloadBusinessMetadata: "[data-id='downloadBusinessMetadata']"
        },
        templateHelpers: function() {
            return {
                apiBaseUrl: UrlLinks.apiBaseUrl,
                importTmplUrl: UrlLinks.businessMetadataImportTempUrl()
            };
        },
        events: function() {
            var events = {}, that = this;
            return events["click " + this.ui.refreshTree] = function(e) {
                that.changeLoaderState(!0), this.ui.refreshTree.attr("disabled", !0).tooltip("hide");
                var type = $(e.currentTarget).data("type");
                e.stopPropagation(), that.ui[type + "SearchTree"].jstree(!0).destroy(), that.refresh({
                    type: type
                });
            }, events["click " + this.ui.showEmptyServiceType] = function(e) {
                e.stopPropagation(), this.isEmptyServicetype = !this.isEmptyServicetype, this.entitySwitchBtnUpdate();
            }, events["click " + this.ui.groupOrFlatTree] = function(e) {
                var type = $(e.currentTarget).data("type");
                e.stopPropagation(), this.isGroupView = !this.isGroupView, this.ui.groupOrFlatTree.tooltip("hide"), 
                this.ui.groupOrFlatTree.find("i").toggleClass("fa-sitemap fa-list-ul"), this.ui.groupOrFlatTree.find("span").html(this.isGroupView ? "Show flat tree" : "Show group tree"), 
                that.ui[type + "SearchTree"].jstree(!0).destroy(), that.renderEntityTree();
            }, events["click " + this.ui.importBusinessMetadata] = function(e) {
                e.stopPropagation(), that.onClickImportBusinessMetadata();
            }, events["click " + this.ui.downloadBusinessMetadata] = function(e) {
                e.stopPropagation();
            }, events;
        },
        bindEvents: function() {
            var that = this;
            $("body").on("click", ".entityPopoverOptions li", function(e) {
                that.$(".entityPopover").popover("hide"), that[$(this).find("a").data("fn") + "Entity"](e);
            }), this.searchVent.on("Entity:Count:Update", function(options) {
                that.changeLoaderState(!0);
                var opt = options || {};
                opt && !opt.metricData ? that.metricCollection.fetch({
                    complete: function() {
                        that.entityCountObj = _.first(that.metricCollection.toJSON()), that.fromManualRender = !0, 
                        that.ui.entitySearchTree.jstree(!0).refresh(), that.changeLoaderState(!1);
                    }
                }) : (that.entityCountObj = opt.metricData, that.ui.entitySearchTree.jstree(!0).refresh(), 
                that.changeLoaderState(!1));
            }), this.classificationAndMetricEvent.on("metricCollection:Update", function(options) {
                that.changeLoaderState(!0), that.ui.refreshTree.attr("disabled", !0).tooltip("hide"), 
                that.ui.entitySearchTree.jstree(!0).destroy(), that.refresh({
                    type: "entity",
                    apiCount: 0
                });
            });
        },
        initialize: function(options) {
            this.options = options, _.extend(this, _.pick(options, "typeHeaders", "searchVent", "entityDefCollection", "enumDefCollection", "classificationDefCollection", "searchTableColumns", "searchTableFilters", "metricCollection", "classificationAndMetricEvent")), 
            this.bindEvents(), this.entityCountObj = _.first(this.metricCollection.toJSON()) || {
                entity: {
                    entityActive: {},
                    entityDeleted: {}
                },
                tag: {
                    tagEntities: {}
                }
            }, this.isEmptyServicetype = !0, this.entityTreeData = {}, this.typeId = null, this.isGroupView = !0;
        },
        onRender: function() {
            this.changeLoaderState(!0), this.renderEntityTree(), this.createEntityAction(), 
            this.changeLoaderState(!1);
        },
        changeLoaderState: function(showLoader) {
            showLoader ? (this.ui.entitySearchTree.hide(), this.ui.entityTreeLoader.show()) : (this.ui.entitySearchTree.show(), 
            this.ui.entityTreeLoader.hide());
        },
        createEntityAction: function() {
            Utils.generatePopover({
                el: this.$el,
                contentClass: "entityPopoverOptions",
                popoverOptions: {
                    selector: ".entityPopover",
                    content: function() {
                        var liString = ($(this).data("detail"), "<li><i class='fa fa-search'></i><a href='javascript:void(0)' data-fn='onSelectedSearch'>Search</a></li>");
                        return "<ul>" + liString + "</ul>";
                    }
                }
            });
        },
        renderEntityTree: function() {
            var that = this;
            this.generateSearchTree({
                $el: that.ui.entitySearchTree
            });
        },
        onSearchEntityNode: function(showEmptyType) {
            this.isEmptyServicetype = showEmptyType, this.entitySwitchBtnUpdate();
        },
        entitySwitchBtnUpdate: function() {
            this.ui.showEmptyServiceType.attr("data-original-title", (this.isEmptyServicetype ? "Show" : "Hide") + " empty service types"), 
            this.ui.showEmptyServiceType.tooltip("hide"), this.ui.showEmptyServiceType.find("i").toggleClass("fa-toggle-on fa-toggle-off"), 
            this.ui.entitySearchTree.jstree(!0).refresh();
        },
        manualRender: function(options) {
            var that = this;
            if (_.extend(this.options, options), void 0 === this.options.value && (this.options.value = {}), 
            this.options.value.type) {
                if (that.options.value.attributes && (that.options.value.attributes = null), "_ALL_ENTITY_TYPES" === that.options.value.type && "_ALL_ENTITY_TYPES" !== this.typeId) this.fromManualRender = !0, 
                this.typeId && this.ui.entitySearchTree.jstree(!0).deselect_node(this.typeId), this.typeId = Globals[that.options.value.type].guid, 
                this.ui.entitySearchTree.jstree(!0).select_node(this.typeId); else if ("_ALL_ENTITY_TYPES" !== this.typeId && that.options.value.type !== this.typeId) {
                    var dataFound = this.typeHeaders.fullCollection.find(function(obj) {
                        return obj.get("name") === that.options.value.type;
                    });
                    dataFound && (this.typeId && this.typeId !== dataFound.get("guid") || null === this.typeId) && (this.typeId && this.ui.entitySearchTree.jstree(!0).deselect_node(this.typeId), 
                    this.fromManualRender = !0, this.typeId = dataFound.get("guid"), this.ui.entitySearchTree.jstree(!0).select_node(dataFound.get("guid")));
                }
            } else this.ui.entitySearchTree.jstree(!0).deselect_all(), this.typeId = null;
        },
        onNodeSelect: function(options) {
            var that = this, name = options.node.original.name, selectedNodeId = options.node.id, typeValue = null, params = {
                searchType: "basic",
                dslChecked: !1
            };
            this.options.value && (this.options.value.type && (params.type = this.options.value.type), 
            this.options.value.isCF && (this.options.value.isCF = null), this.options.value.entityFilters && (params.entityFilters = null));
            var getUrl = Utils.getUrlState.isSearchTab();
            if (getUrl || (that.typeId = null), that.typeId != selectedNodeId) that.typeId = selectedNodeId, 
            typeValue = name, params.type = typeValue; else if (that.typeId = params.type = null, 
            that.ui.entitySearchTree.jstree(!0).deselect_all(!0), !(that.options.value.type || that.options.value.tag || that.options.value.term || that.options.value.query || this.options.value.udKeys || this.options.value.ugLabels)) return void that.showDefaultPage();
            var searchParam = _.extend({}, this.options.value, params);
            this.triggerSearch(searchParam);
        },
        showDefaultPage: function() {
            Utils.setUrl({
                url: "!/search",
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
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
        onSelectedSearchEntity: function() {
            var params = {
                searchType: "basic",
                dslChecked: !1,
                type: this.options.value.type
            };
            this.triggerSearch(params);
        },
        getEntityTree: function() {
            var that = this, serviceTypeArr = [], serviceTypeWithEmptyEntity = [], type = "ENTITY", generateTreeData = (this.ui.entitytreeStructure, 
            function(data) {
                that.typeHeaders.fullCollection.each(function(model) {
                    var serviceType = model.toJSON().serviceType, isSelected = !1, categoryType = model.toJSON().category, generateServiceTypeArr = function(entityCountArr, serviceType, children, entityCount) {
                        that.isGroupView ? entityCountArr[serviceType] ? (entityCountArr[serviceType].children.push(children), 
                        entityCountArr[serviceType].totalCounter = +entityCountArr[serviceType].totalCounter + entityCount) : (entityCountArr[serviceType] = [], 
                        entityCountArr[serviceType].name = serviceType, entityCountArr[serviceType].children = [], 
                        entityCountArr[serviceType].children.push(children), entityCountArr[serviceType].totalCounter = entityCount) : entityCountArr.push(children);
                    };
                    if (serviceType || (serviceType = "other_types"), "ENTITY" == categoryType) {
                        var entityCount = that.entityCountObj ? (that.entityCountObj.entity.entityActive[model.get("name")] || 0) + (that.entityCountObj.entity.entityDeleted[model.get("name")] || 0) : 0, modelname = entityCount ? model.get("name") + " (" + _.numberFormatWithComma(entityCount) + ")" : model.get("name");
                        that.options.value && (isSelected = !!that.options.value.type && that.options.value.type == model.get("name"), 
                        that.typeId || (that.typeId = isSelected ? model.get("guid") : null));
                        var children = {
                            text: _.escape(modelname),
                            name: model.get("name"),
                            type: model.get("category"),
                            gType: "Entity",
                            guid: model.get("guid"),
                            id: model.get("guid"),
                            model: model,
                            parent: "#",
                            icon: "fa fa-file-o",
                            state: {
                                disabled: !1,
                                selected: isSelected
                            }
                        };
                        entityCount = _.isNaN(entityCount) ? 0 : entityCount, generateServiceTypeArr(serviceTypeArr, serviceType, children, entityCount), 
                        entityCount && generateServiceTypeArr(serviceTypeWithEmptyEntity, serviceType, children, entityCount);
                    }
                });
                var serviceTypeData = that.isEmptyServicetype ? serviceTypeWithEmptyEntity : serviceTypeArr;
                if (that.isGroupView) {
                    var serviceDataWithRootEntity = pushRootEntityToJstree.call(that, "group", serviceTypeData);
                    return getParentsData.call(that, serviceDataWithRootEntity);
                }
                return pushRootEntityToJstree.call(that, null, serviceTypeData);
            }), pushRootEntityToJstree = function(type, data) {
                var rootEntity = Globals[Enums.addOnEntities[0]], isSelected = !(!this.options.value || !this.options.value.type) && this.options.value.type == rootEntity.name, rootEntityNode = {
                    text: _.escape(rootEntity.name),
                    name: rootEntity.name,
                    type: rootEntity.category,
                    gType: "Entity",
                    guid: rootEntity.guid,
                    id: rootEntity.guid,
                    model: rootEntity,
                    parent: "#",
                    icon: "fa fa-file-o",
                    state: {
                        selected: isSelected
                    }
                };
                return "group" === type ? (void 0 === data.other_types && (data.other_types = {
                    name: "other_types",
                    children: []
                }), data.other_types.children.push(rootEntityNode)) : data.push(rootEntityNode), 
                data;
            }, getParentsData = function(data) {
                for (var parents = Object.keys(data), treeData = [], withoutEmptyServiceType = [], treeCoreData = null, openEntityNodesState = function(treeDate) {
                    1 == treeDate.length && _.each(treeDate, function(model) {
                        model.state = {
                            opened: !0
                        };
                    });
                }, generateNode = function(children) {
                    var nodeStructure = {
                        text: "Service Types",
                        children: children,
                        icon: "fa fa-folder-o",
                        type: "ENTITY",
                        state: {
                            opened: !0
                        },
                        parent: "#"
                    };
                    return nodeStructure;
                }, i = 0; i < parents.length; i++) {
                    var checkEmptyServiceType = !1, getParrent = data[parents[i]], totalCounter = getParrent.totalCounter, textName = getParrent.totalCounter ? parents[i] + " (" + _.numberFormatWithComma(totalCounter) + ")" : parents[i], parent = {
                        icon: "fa fa-folder-o",
                        type: type,
                        gType: "ServiceType",
                        children: getParrent.children,
                        text: _.escape(textName),
                        name: data[parents[i]].name,
                        id: i,
                        state: {
                            opened: !0
                        }
                    };
                    that.isEmptyServicetype && 0 == data[parents[i]].totalCounter && (checkEmptyServiceType = !0), 
                    treeData.push(parent), checkEmptyServiceType || withoutEmptyServiceType.push(parent);
                }
                return that.entityTreeData = {
                    withoutEmptyServiceTypeEntity: generateNode(withoutEmptyServiceType),
                    withEmptyServiceTypeEntity: generateNode(treeData)
                }, treeCoreData = that.isEmptyServicetype ? withoutEmptyServiceType : treeData, 
                openEntityNodesState(treeCoreData), treeCoreData;
            };
            return generateTreeData();
        },
        generateSearchTree: function(options) {
            var $el = options && options.$el, that = (options && options.data, options && options.type, 
            this), getEntityTreeConfig = function(opt) {
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
                            var aType = $(el).find(">a.jstree-anchor");
                            aType.append("<span class='tree-tooltip'>" + aType.text() + "</span>"), 0 === $(el).find(".fa-ellipsis-h").length && $(el).append('<div class="tools"><i class="fa fa-ellipsis-h entityPopover" rel="popover"></i></div>');
                        }
                    },
                    core: {
                        multiple: !1,
                        data: function(node, cb) {
                            "#" === node.id && cb(that.getEntityTree());
                        }
                    }
                };
            };
            $el.jstree(getEntityTreeConfig({
                type: ""
            })).on("open_node.jstree", function(e, data) {
                that.isTreeOpen = !0;
            }).on("select_node.jstree", function(e, data) {
                that.fromManualRender ? that.fromManualRender = !1 : that.onNodeSelect(data);
            }).on("search.jstree", function(nodes, str, res) {
                0 === str.nodes.length ? ($el.jstree(!0).hide_all(), $el.parents(".panel").addClass("hide")) : $el.parents(".panel").removeClass("hide");
            }).on("hover_node.jstree", function(nodes, str, res) {
                var aType = that.$("#" + str.node.a_attr.id), typeOffset = aType.find(">.jstree-icon").offset();
                that.$(".tree-tooltip").removeClass("show"), setTimeout(function() {
                    aType.hasClass("jstree-hovered") && typeOffset.top && typeOffset.left && aType.find(">span.tree-tooltip").css({
                        top: "calc(" + typeOffset.top + "px - 45px)",
                        left: "24px"
                    }).addClass("show");
                }, 1200);
            }).on("dehover_node.jstree", function(nodes, str, res) {
                that.$(".tree-tooltip").removeClass("show");
            });
        },
        refresh: function(options) {
            var that = this, apiCount = options && 0 == options.apiCount ? options.apiCount : 3, renderTree = function() {
                0 === apiCount && (that.renderEntityTree(), that.changeLoaderState(!1), that.ui.refreshTree.attr("disabled", !1));
            };
            0 == apiCount ? (that.entityDefCollection.fullCollection.sort({
                silent: !0
            }), that.entityCountObj = _.first(that.metricCollection.toJSON()), that.typeHeaders.fullCollection.sort({
                silent: !0
            }), renderTree()) : (this.entityDefCollection.fetch({
                complete: function() {
                    that.entityDefCollection.fullCollection.comparator = function(model) {
                        return model.get("name").toLowerCase();
                    }, that.entityDefCollection.fullCollection.sort({
                        silent: !0
                    }), --apiCount, renderTree();
                }
            }), this.metricCollection.fetch({
                complete: function() {
                    --apiCount, that.entityCountObj = _.first(that.metricCollection.toJSON()), renderTree();
                }
            }), this.typeHeaders.fetch({
                complete: function() {
                    that.typeHeaders.fullCollection.comparator = function(model) {
                        return model.get("name").toLowerCase();
                    }, that.typeHeaders.fullCollection.sort({
                        silent: !0
                    }), --apiCount, renderTree();
                }
            }));
        },
        onClickImportBusinessMetadata: function() {
            require([ "views/import/ImportLayoutView" ], function(ImportLayoutView) {
                new ImportLayoutView({});
            });
        }
    });
    return EntityTreeLayoutview;
});