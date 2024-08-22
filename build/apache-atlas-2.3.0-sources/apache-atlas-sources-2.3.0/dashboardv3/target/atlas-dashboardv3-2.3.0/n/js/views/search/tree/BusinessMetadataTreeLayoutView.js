define([ "require", "hbs!tmpl/search/tree/BusinessMetadataTreeLayoutView_tmpl", "utils/Utils", "utils/Messages", "utils/Globals", "utils/UrlLinks", "utils/CommonViewFunction", "collection/VSearchList", "collection/VGlossaryList", "utils/Enums", "jstree" ], function(require, BusinessMetadataTreeLayoutViewTmpl, Utils, Messages, Globals, UrlLinks, CommonViewFunction, VSearchList, VGlossaryList, Enums) {
    "use strict";
    var BusinessMetadataTreeLayoutView = Marionette.LayoutView.extend({
        template: BusinessMetadataTreeLayoutViewTmpl,
        regions: {},
        ui: {
            refreshTree: '[data-id="refreshTree"]',
            businessMetadataSearchTree: '[data-id="businessMetadataSearchTree"]',
            createBusinessMetadata: '[data-id="createBusinessMetadata"]',
            businessMetadataTreeLoader: '[data-id="businessMetadataTreeLoader"]'
        },
        templateHelpers: function() {
            return {
                apiBaseUrl: UrlLinks.apiBaseUrl
            };
        },
        events: function() {
            var events = {}, that = this;
            return events["click " + this.ui.refreshTree] = function(e) {
                that.changeLoaderState(!0), that.ui.refreshTree.attr("disabled", !0).tooltip("hide"), 
                e.stopPropagation(), that.refresh();
            }, events["click " + this.ui.createBusinessMetadata] = function(e) {
                e.stopPropagation(), that.triggerUrl("#!/administrator?tabActive=bm");
            }, events;
        },
        initialize: function(options) {
            this.options = options, _.extend(this, _.pick(options, "typeHeaders", "guid", "searchVent", "entityDefCollection", "enumDefCollection", "businessMetadataDefCollection", "searchTableColumns", "searchTableFilters", "metricCollection")), 
            this.bindEvents();
        },
        onRender: function() {
            this.changeLoaderState(!0), this.renderBusinessMetadataTree(), this.changeLoaderState(!1);
        },
        bindEvents: function() {
            var that = this;
            this.listenTo(this.businessMetadataDefCollection.fullCollection, "reset add remove", function() {
                this.ui.businessMetadataSearchTree.jstree(!0) ? that.ui.businessMetadataSearchTree.jstree(!0).refresh() : this.renderBusinessMetadataTree();
            }, this), $("body").on("click", ".businessMetadataPopoverOptions li", function(e) {
                that.$(".businessMetadataPopover").popover("hide"), that[$(this).find("a").data("fn") + "BusinessMetadata"](e);
            });
        },
        changeLoaderState: function(showLoader) {
            showLoader ? (this.ui.businessMetadataSearchTree.hide(), this.ui.businessMetadataTreeLoader.show()) : (this.ui.businessMetadataSearchTree.show(), 
            this.ui.businessMetadataTreeLoader.hide());
        },
        createBusinessMetadataAction: function() {
            Utils.generatePopover({
                el: this.$el,
                contentClass: "businessMetadataPopoverOptions",
                popoverOptions: {
                    selector: ".businessMetadataPopover",
                    content: function() {
                        var liString = ($(this).data("detail"), "<li><i class='fa fa-list-alt'></i><a href='javascript:void(0)' data-fn='onViewEdit'>View/Edit</a></li><li><i class='fa fa-search'></i><a href='javascript:void(0)' data-fn='onSelectedSearch'>Search</a></li>");
                        return "<ul>" + liString + "</ul>";
                    }
                }
            });
        },
        renderBusinessMetadataTree: function() {
            this.generateSearchTree({
                $el: this.ui.businessMetadataSearchTree
            });
        },
        manualRender: function(options) {
            _.extend(this, options), Utils.getUrlState.isBMDetailPage() && this.guid ? this.ui.businessMetadataSearchTree.jstree(!0).select_node(this.guid) : (this.ui.businessMetadataSearchTree.jstree(!0).deselect_all(), 
            this.guid = null);
        },
        onNodeSelect: function(nodeData) {
            var options = nodeData.node.original, url = "#!/administrator/businessMetadata", trigger = !0, queryParams = Utils.getUrlState.getQueryParams();
            void 0 === options.parent && (url += "/" + options.id), queryParams && "bm" === queryParams.from && Utils.getUrlState.getQueryUrl().queyParams[0] === url && (trigger = !1), 
            trigger && this.triggerUrl(url);
        },
        onViewEditBusinessMetadata: function() {
            var selectedNode = this.ui.businessMetadataSearchTree.jstree("get_selected", !0);
            if (selectedNode && selectedNode[0]) {
                selectedNode = selectedNode[0];
                var url = "#!/administrator?tabActive=bm";
                selectedNode.parent && selectedNode.original && selectedNode.original.name && (url += "&ns=" + selectedNode.parent + "&nsa=" + selectedNode.original.name, 
                this.triggerUrl(url));
            }
        },
        triggerUrl: function(url) {
            Utils.setUrl({
                url: url,
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
        },
        refresh: function(options) {
            var that = this;
            this.businessMetadataDefCollection.fetch({
                silent: !0,
                complete: function() {
                    that.businessMetadataDefCollection.fullCollection.comparator = function(model) {
                        return model.get("name").toLowerCase();
                    }, that.businessMetadataDefCollection.fullCollection.sort({
                        silent: !0
                    }), that.ui.businessMetadataSearchTree.jstree(!0).refresh(), that.changeLoaderState(!1), 
                    that.ui.refreshTree.attr("disabled", !1);
                }
            });
        },
        getBusinessMetadataTree: function(options) {
            var that = this, businessMetadataList = [], namsSpaceTreeData = that.businessMetadataDefCollection.fullCollection.models, generateNode = function(nodeOptions, attrNode) {
                var nodeStructure = (attrNode ? null : nodeOptions.get("attributeDefs"), {
                    text: attrNode ? _.escape(nodeOptions.name) : _.escape(nodeOptions.get("name")),
                    name: attrNode ? _.escape(nodeOptions.name) : _.escape(nodeOptions.get("name")),
                    type: "businessMetadata",
                    id: attrNode ? _.escape(nodeOptions.name) : nodeOptions.get("guid"),
                    icon: attrNode ? "fa fa-file-o" : "fa fa-folder-o",
                    children: [],
                    state: {
                        selected: nodeOptions.get("guid") === that.guid
                    },
                    gType: "BusinessMetadata",
                    model: nodeOptions
                });
                return nodeStructure;
            };
            _.each(namsSpaceTreeData, function(filterNode) {
                businessMetadataList.push(generateNode(filterNode));
            });
            return businessMetadataList;
        },
        generateSearchTree: function(options) {
            var $el = options && options.$el, that = (options && options.type, this), getEntityTreeConfig = function(opt) {
                return {
                    plugins: [ "search", "core", "sort", "conditionalselect", "changed", "wholerow", "node_customize" ],
                    conditionalselect: function(node) {
                        var type = node.original.type;
                        return "businessMetadataFolder" != type || !node.children.length;
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
                            var aTag = $(el).find(">a.jstree-anchor");
                            aTag.append("<span class='tree-tooltip'>" + aTag.text() + "</span>"), "#" === node.parent ? $(el).append('<div class="tools"><i class="fa"></i></div>') : $(el).append('<div class="tools"><i class="fa fa-ellipsis-h businessMetadataPopover" rel="popover"></i></div>');
                        }
                    },
                    core: {
                        multiple: !1,
                        data: function(node, cb) {
                            "#" === node.id && cb(that.getBusinessMetadataTree());
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
                    aFilter.hasClass("jstree-hovered") && ($(":hover").last().hasClass("jstree-hovered") || $(":hover").last().parent().hasClass("jstree-hovered")) && filterOffset.top && filterOffset.left && aFilter.find(">span.tree-tooltip").css({
                        top: "calc(" + filterOffset.top + "px - 45px)",
                        left: "24px"
                    }).addClass("show");
                }, 1200);
            }).on("dehover_node.jstree", function(nodes, str, res) {
                that.$(".tree-tooltip").removeClass("show");
            });
        }
    });
    return BusinessMetadataTreeLayoutView;
});