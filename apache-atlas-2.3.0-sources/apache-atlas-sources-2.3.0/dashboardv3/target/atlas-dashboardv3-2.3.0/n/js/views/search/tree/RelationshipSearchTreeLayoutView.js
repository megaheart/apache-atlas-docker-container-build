define([ "require", "hbs!tmpl/search/tree/RelationshipLayoutView_tmpl", "utils/Utils", "utils/Globals", "utils/UrlLinks", "utils/CommonViewFunction", "utils/Enums", "jstree" ], function(require, RelationshipLayoutViewTmpl, Utils, Globals, UrlLinks, CommonViewFunction, Enums) {
    "use strict";
    var RelationshipSearchTreeLayoutView = Marionette.LayoutView.extend({
        template: RelationshipLayoutViewTmpl,
        regions: {},
        ui: {
            refreshTree: '[data-id="refreshTree"]',
            relationshipSearchTree: '[data-id="relationshipSearchTree"]',
            relationshipTreeLoader: '[data-id="relationshipTreeLoader"]'
        },
        templateHelpers: function() {
            return {};
        },
        events: function() {
            var events = {}, that = this;
            return events["click " + this.ui.refreshTree] = function(e) {
                that.changeLoaderState(!0), that.ui.refreshTree.attr("disabled", !0).tooltip("hide"), 
                e.stopPropagation(), that.refresh();
            }, events;
        },
        bindEvents: function() {
            var that = this;
            this.listenTo(this.relationshipDefCollection, "reset", function() {
                that.relationshipTreeRefresh(), that.changeLoaderState(!1), that.ui.refreshTree.attr("disabled", !1);
            });
        },
        initialize: function(options) {
            this.options = options, _.extend(this, _.pick(options, "typeHeaders", "searchVent", "entityDefCollection", "enumDefCollection", "relationshipDefCollection", "searchTableColumns", "searchTableFilters", "metricCollection")), 
            this.relationshipId = null, this.bindEvents();
        },
        onRender: function() {
            this.changeLoaderState(!0), this.renderRelationshipTree(), this.changeLoaderState(!1);
        },
        changeLoaderState: function(showLoader) {
            showLoader ? (this.ui.relationshipSearchTree.hide(), this.ui.relationshipTreeLoader.show()) : (this.ui.relationshipSearchTree.show(), 
            this.ui.relationshipTreeLoader.hide());
        },
        fetchCollection: function(e) {
            this.relationshipDefCollection.fetch({
                reset: !0
            });
        },
        relationshipTreeRefresh: function() {
            this.ui.relationshipSearchTree.jstree(!0) ? this.ui.relationshipSearchTree.jstree(!0).refresh() : this.renderRelationshipTree();
        },
        renderRelationshipTree: function() {
            var that = this;
            this.generateSearchTree({
                $el: that.ui.relationshipSearchTree
            });
        },
        manualRender: function(options) {
            var that = this;
            if (_.extend(this.options, options), void 0 === this.options.value && (this.options.value = {}), 
            this.options.value.relationshipName) {
                if (that.options.value.relationshipName) this.fromManualRender = !0, this.relationshipId && this.ui.relationshipSearchTree.jstree(!0).deselect_node(this.relationshipId), 
                this.ui.relationshipSearchTree.jstree(!0).select_node(this.relationshipId); else if (that.options.value.relationshipName !== this.relationshipId) {
                    var dataFound = this.relationshipDefCollection.fullCollection.find(function(obj) {
                        return obj.get("name") === that.options.value.relationshipName;
                    });
                    dataFound && (this.relationshipId && this.relationshipId !== dataFound.get("guid") || null === this.relationshipId) && (this.relationshipId && this.ui.relationshipSearchTree.jstree(!0).deselect_node(this.relationshipId), 
                    this.fromManualRender = !0, this.relationshipId = dataFound.get("guid"), this.ui.relationshipSearchTree.jstree(!0).select_node(dataFound.get("guid")));
                }
            } else this.ui.relationshipSearchTree.jstree(!0).deselect_all(), this.relationshipId = null;
        },
        refresh: function() {
            this.relationshipId = null, this.fetchCollection({
                reset: !0
            });
        },
        onNodeSelect: function(options) {
            var that = this, name = options.node.original.name, selectedNodeId = options.node.id, getUrl = Utils.getUrlState.isRelationTab(), params = {
                searchType: "basic",
                dslChecked: !1
            }, values = this.options.value;
            if (Globals.fromRelationshipSearch = !0, getUrl || (that.relationshipId = null), 
            that.relationshipId != selectedNodeId) that.relationshipId = selectedNodeId, params.relationshipName = name; else if (that.relationshipId = params.relationshipName = null, 
            that.ui.relationshipSearchTree.jstree(!0).deselect_all(!0), !that.options.value.relationshipName) return void that.showDefaultPage();
            values && (values.type || values.tag) && (values.attributes = null, values.uiParameters = null);
            var searchParam = _.extend({}, values, params);
            this.triggerSearch(searchParam);
        },
        triggerSearch: function(params, url) {
            var searchUrl = url ? url : "#!/relationship/relationshipSearchResult";
            Utils.setUrl({
                url: searchUrl,
                urlParams: params,
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
        },
        getRelationshipTree: function(options) {
            var that = this, collection = options && options.collection || this.relationshipDefCollection.fullCollection, listofNodes = [], relationshipName = that.options && that.options.value ? that.options.value.relationshipName : "", generateNode = function(nodeOptions, options) {
                var nodeStructure = {
                    text: _.escape(nodeOptions.name),
                    name: _.escape(nodeOptions.name),
                    id: nodeOptions.model.get("guid"),
                    icon: "fa fa-link",
                    gType: "Relationship",
                    state: {
                        disabled: !1,
                        selected: nodeOptions.name === relationshipName,
                        opened: !0
                    }
                };
                return nodeStructure;
            };
            return collection.each(function(model) {
                var nodeDetails = {
                    name: _.escape(model.get("name")),
                    model: model
                }, getParentNodeDetails = generateNode(nodeDetails, model);
                listofNodes.push(getParentNodeDetails);
            }), listofNodes;
        },
        generateSearchTree: function(options) {
            var $el = options && options.$el, that = (options && options.type, this), getEntityTreeConfig = function(opt) {
                return {
                    plugins: [ "search", "core", "sort", "conditionalselect", "changed", "wholerow", "node_customize" ],
                    conditionalselect: function(node) {
                        var type = node.original.type;
                        return "RELATIONSHIP" !== type || !node.children.length;
                    },
                    state: {
                        opened: !0
                    },
                    search: {
                        show_only_matches: !0,
                        case_sensitive: !1
                    },
                    node_customize: {
                        default: function(el, node) {
                            "#" === node.parent ? $(el).append('<div class="tools"><i class="fa"></i></div>') : $(el).append('<div class="tools"><i class="fa fa-ellipsis-h businessMetadataPopover" rel="popover"></i></div>');
                        }
                    },
                    core: {
                        multiple: !1,
                        data: function(node, cb) {
                            "#" === node.id && cb(that.getRelationshipTree());
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
        }
    });
    return RelationshipSearchTreeLayoutView;
});