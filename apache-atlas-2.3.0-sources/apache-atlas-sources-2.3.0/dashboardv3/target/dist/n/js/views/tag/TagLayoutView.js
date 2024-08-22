define([ "require", "backbone", "hbs!tmpl/tag/TagLayoutView_tmpl", "utils/Utils", "utils/Messages", "utils/Globals", "utils/UrlLinks", "models/VTag" ], function(require, Backbone, TagLayoutViewTmpl, Utils, Messages, Globals, UrlLinks, VTag) {
    "use strict";
    var TagLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "TagLayoutView",
        template: TagLayoutViewTmpl,
        regions: {},
        ui: {
            tagsParent: "[data-id='tagsParent']",
            tagsList: "[data-id='tagsList']",
            createTag: "[data-id='createTag']",
            tags: "[data-id='tags']",
            offLineSearchTag: "[data-id='offlineSearchTag']",
            treeLov: "[data-id='treeLov']",
            refreshTag: '[data-id="refreshTag"]',
            tagView: 'input[name="tagView"]',
            expandArrow: '[data-id="expandArrow"]'
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.createTag] = "onClickCreateTag", events["click " + this.ui.tags] = "onTagList", 
            events["keyup " + this.ui.offLineSearchTag] = "offlineSearchTag", events["change " + this.ui.treeLov] = "onTreeSelect", 
            events["click " + this.ui.refreshTag] = "fetchCollections", events["change " + this.ui.tagView] = "tagViewToggle", 
            events["click " + this.ui.expandArrow] = "toggleChild", events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "tag", "collection", "typeHeaders", "value", "enumDefCollection")), 
            this.viewType = "flat", this.query = {
                flat: {
                    tagName: null
                },
                tree: {
                    tagName: null
                }
            }, Utils.getUrlState.isTagTab() && this.value && this.value.viewType && (this.viewType = this.value.viewType), 
            this.query[this.viewType].tagName = this.tag;
        },
        bindEvents: function() {
            var that = this;
            this.listenTo(this.collection.fullCollection, "reset add remove", function() {
                this.tagsGenerator();
            }, this), this.ui.tagsList.on("click", "li.parent-node a", function() {
                that.setUrl(this.getAttribute("href"));
            }), $("body").on("click", ".tagPopoverOptions li", function(e) {
                that.$(".tagPopover").popover("hide"), that[$(this).find("a").data("fn")](e);
            });
        },
        onRender: function() {
            this.bindEvents(), this.tagsGenerator();
        },
        fetchCollections: function() {
            this.collection.fetch({
                reset: !0
            }), this.ui.offLineSearchTag.val("");
        },
        manualRender: function(options) {
            this.tag = options && options.tagName, _.extend(this.value, options), this.query[this.viewType].tagName = this.tag, 
            options && options.viewType && (this.viewType = options.viewType), this.createTag || this.setValues(!0);
        },
        renderTreeList: function() {
            var that = this;
            this.ui.treeLov.empty();
            var treeStr = "<option></option>";
            this.collection.fullCollection.each(function(model) {
                var name = Utils.getName(model.toJSON(), "name");
                treeStr += "<option>" + name + "</option>";
            }), that.ui.treeLov.html(treeStr), that.ui.treeLov.select2({
                placeholder: "Search Classification",
                allowClear: !0
            });
        },
        onTreeSelect: function() {
            var name = this.ui.treeLov.val();
            Utils.setUrl({
                url: name ? "#!/tag/tagAttribute/" + name : "#!/tag",
                urlParams: {
                    viewType: "tree"
                },
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
        },
        setValues: function(manual) {
            var el = this.ui.tagsList;
            "tree" == this.viewType ? (el = this.ui.tagsParent, this.ui.tagView.prop("checked") || this.ui.tagView.prop("checked", !0).trigger("change")) : this.ui.tagView.prop("checked") && this.ui.tagView.prop("checked", !1).trigger("change");
            var $firstEl = el.find("li a") ? el.find("li a").first() : null;
            if (Utils.getUrlState.isTagTab()) if (this.tag) {
                var presentTag = this.collection.fullCollection.findWhere({
                    name: this.tag
                }), url = Utils.getUrlState.getQueryUrl().queyParams[0], tag = this.tag, query = Utils.getUrlState.getQueryParams() || null;
                if (presentTag || (tag = $firstEl.data("name"), url = $firstEl && $firstEl.length ? $firstEl.attr("href") : "#!/tag", 
                $firstEl && $firstEl.length && _.extend(query, {
                    dlttag: !0
                })), Utils.setUrl({
                    url: url,
                    urlParams: query,
                    updateTabState: !0
                }), !presentTag) return !1;
                el.find("li").removeClass("active"), el.find("li.parent-node").each(function() {
                    var target = $(this);
                    if (target.children("div").find("a").text() === tag) return target.addClass("active"), 
                    target.parents("ul").addClass("show").removeClass("hide"), !this.createTag && manual || target.offset() && $("#sidebar-wrapper").animate({
                        scrollTop: target.offset().top - 100
                    }, 500), !1;
                });
            } else this.selectFirst = !1, el.find("li").first().addClass("active"), $firstEl && $firstEl.length && ($firstEl.attr("href"), 
            Utils.setUrl({
                url: $firstEl.attr("href"),
                mergeBrowserUrl: !1,
                updateTabState: !0
            }));
        },
        tagsGenerator: function(searchString) {
            if (this.collection && this.collection.fullCollection.length >= 0) {
                var sortedCollection = this.collection.fullCollection;
                this.tagTreeList = this.getTagTreeList({
                    collection: sortedCollection
                }), searchString ? "flat" == this.viewType ? this.ui.tagsList.empty().html(this.generateTree({
                    data: sortedCollection,
                    searchString: searchString
                })) : this.ui.tagsParent.empty().html(this.generateTree({
                    data: this.tagTreeList,
                    isTree: !0,
                    searchString: searchString
                })) : (this.ui.tagsParent.empty().html(this.generateTree({
                    data: this.tagTreeList,
                    isTree: !0,
                    searchString: searchString
                })), this.ui.tagsList.empty().html(this.generateTree({
                    data: sortedCollection,
                    searchString: searchString
                }))), this.createTagAction(), this.setValues(), this.renderTreeList(), this.createTag && (this.createTag = !1);
            }
        },
        getTagTreeList: function(options) {
            var collection = options.collection, listOfParents = {}, getChildren = function(options) {
                var children = options.children, data = [];
                return children && children.length && _.each(children, function(name) {
                    var child = collection.find({
                        name: name
                    });
                    if (child) {
                        var modelJSON = child.toJSON();
                        data.push({
                            name: name,
                            children: getChildren({
                                children: modelJSON.subTypes
                            })
                        });
                    }
                }), data;
            };
            return collection.each(function(model) {
                var modelJSON = model.toJSON();
                if (0 == modelJSON.superTypes.length) {
                    var name = modelJSON.name;
                    listOfParents[name] = {
                        name: name,
                        children: getChildren({
                            children: modelJSON.subTypes
                        })
                    };
                }
            }), listOfParents;
        },
        generateTree: function(options) {
            var data = options.data, isTree = options.isTree, searchString = options.searchString, that = this, element = "", getElString = function(options) {
                var name = options.name, hasChild = isTree && options.children && options.children.length;
                return '<li class="parent-node" data-id="tags"><div><div class="tools"><i class="fa fa-ellipsis-h tagPopover"></i></div>' + (hasChild ? '<i class="fa toggleArrow fa-angle-right" data-id="expandArrow" data-name="' + name + '"></i>' : "") + '<a href="#!/tag/tagAttribute/' + name + "?viewType=" + (isTree ? "tree" : "flat") + '"  data-name="' + name + '">' + name + "</a></div>" + (isTree && hasChild ? '<ul class="child hide">' + that.generateTree({
                    data: options.children,
                    isTree: isTree
                }) + "</ul>" : "") + "</li>";
            };
            return isTree ? _.each(data, function(obj) {
                element += getElString({
                    name: obj.name,
                    children: obj.children
                });
            }) : data.each(function(obj) {
                var name = obj.get("name");
                if (searchString) {
                    if (name.search(new RegExp(searchString, "i")) == -1) return;
                    element += getElString({
                        name: obj.get("name"),
                        children: null
                    });
                } else element += getElString({
                    name: obj.get("name"),
                    children: null
                });
            }), element;
        },
        toggleChild: function(e) {
            var el = $(e.currentTarget);
            el && el.parent().siblings("ul.child").toggleClass("hide show");
        },
        tagViewToggle: function(e) {
            if (e.currentTarget.checked ? (this.$(".tree-view").show(), this.$(".list-view").hide(), 
            this.viewType = "tree") : (this.viewType = "flat", this.$(".tree-view").hide(), 
            this.$(".list-view").show()), Utils.getUrlState.isTagTab()) {
                var name = this.query[this.viewType].tagName;
                Utils.setUrl({
                    url: name ? "#!/tag/tagAttribute/" + name : "#!/tag",
                    urlParams: {
                        viewType: this.viewType
                    },
                    mergeBrowserUrl: !1,
                    trigger: !0,
                    updateTabState: !0
                });
            }
        },
        onClickCreateTag: function(e) {
            var that = this, nodeName = e.currentTarget.nodeName;
            $(e.currentTarget).attr("disabled", "true"), require([ "views/tag/CreateTagLayoutView", "modules/Modal" ], function(CreateTagLayoutView, Modal) {
                var name = "BUTTON" != nodeName ? that.query[that.viewType].tagName : null, view = new CreateTagLayoutView({
                    tagCollection: that.collection,
                    selectedTag: name,
                    enumDefCollection: enumDefCollection
                }), modal = new Modal({
                    title: "Create a new classification",
                    content: view,
                    cancelText: "Cancel",
                    okCloses: !1,
                    okText: "Create",
                    allowCancel: !0
                }).open();
                modal.$el.find("button.ok").attr("disabled", "true"), view.ui.tagName.on("keyup", function(e) {
                    modal.$el.find("button.ok").removeAttr("disabled");
                }), view.ui.tagName.on("keyup", function(e) {
                    8 != e.keyCode && 32 != e.keyCode && 46 != e.keyCode || "" != e.currentTarget.value.trim() || modal.$el.find("button.ok").attr("disabled", "true");
                }), modal.on("shownModal", function() {
                    view.ui.parentTag.select2({
                        multiple: !0,
                        placeholder: "Search Classification",
                        allowClear: !0
                    });
                }), modal.on("ok", function() {
                    modal.$el.find("button.ok").attr("disabled", "true"), that.onCreateButton(view, modal);
                }), modal.on("closeModal", function() {
                    modal.trigger("cancel"), that.ui.createTag.removeAttr("disabled");
                });
            });
        },
        onCreateButton: function(ref, modal) {
            var that = this, validate = !0;
            if (modal.$el.find(".attributeInput").length > 0 && modal.$el.find(".attributeInput").each(function() {
                "" === $(this).val() && ($(this).css("borderColor", "red"), validate = !1);
            }), modal.$el.find(".attributeInput").keyup(function() {
                $(this).css("borderColor", "#e8e9ee"), modal.$el.find("button.ok").removeAttr("disabled");
            }), !validate) return void Utils.notifyInfo({
                content: "Please fill the attributes or delete the input box"
            });
            this.name = ref.ui.tagName.val(), this.description = ref.ui.description.val();
            var superTypes = [];
            ref.ui.parentTag.val() && ref.ui.parentTag.val() && (superTypes = ref.ui.parentTag.val());
            var attributeObj = ref.collection.toJSON();
            if (1 === ref.collection.length && "" === ref.collection.first().get("name") && (attributeObj = []), 
            attributeObj.length) {
                var superTypesAttributes = [];
                _.each(superTypes, function(name) {
                    var parentTags = that.collection.fullCollection.findWhere({
                        name: name
                    });
                    superTypesAttributes = superTypesAttributes.concat(parentTags.get("attributeDefs"));
                });
                var duplicateAttributeList = [];
                _.each(attributeObj, function(obj) {
                    var duplicateCheck = _.find(superTypesAttributes, function(activeTagObj) {
                        return activeTagObj.name.toLowerCase() === obj.name.toLowerCase();
                    });
                    duplicateCheck && duplicateAttributeList.push(obj.name);
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
                    return notifyObj.text = text, Utils.notifyConfirm(notifyObj), !1;
                }
            }
            this.json = {
                classificationDefs: [ {
                    name: this.name.trim(),
                    description: this.description.trim(),
                    superTypes: superTypes.length ? superTypes : [],
                    attributeDefs: attributeObj
                } ],
                entityDefs: [],
                enumDefs: [],
                structDefs: []
            }, new this.collection.model().set(this.json).save(null, {
                success: function(model, response) {
                    var classificationDefs = model.get("classificationDefs");
                    that.ui.createTag.removeAttr("disabled"), that.createTag = !0, classificationDefs[0] && _.each(classificationDefs[0].superTypes, function(superType) {
                        var superTypeModel = that.collection.fullCollection.find({
                            name: superType
                        }), subTypes = [];
                        superTypeModel && (subTypes = superTypeModel.get("subTypes"), subTypes.push(classificationDefs[0].name), 
                        superTypeModel.set({
                            subTypes: _.uniq(subTypes)
                        }));
                    }), that.collection.fullCollection.add(classificationDefs), that.setUrl("#!/tag/tagAttribute/" + ref.ui.tagName.val(), !0), 
                    Utils.notifySuccess({
                        content: "Classification " + that.name + Messages.getAbbreviationMsg(!1, "addSuccessMessage")
                    }), modal.trigger("cancel"), that.typeHeaders.fetch({
                        reset: !0
                    });
                }
            });
        },
        setUrl: function(url, create) {
            Utils.setUrl({
                url: url,
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
        },
        onTagList: function(e, toggle) {
            var that = this;
            e.stopPropagation(), "A" === e.target.nodeName && (that.$(".tagPopover").popover("hide"), 
            $(e.currentTarget).parents("ul.tag-tree").find("li.active").removeClass("active"), 
            $(e.currentTarget).addClass("active"));
        },
        offlineSearchTag: function(e) {
            $(e.currentTarget).data("type");
            this.tagsGenerator($(e.currentTarget).val());
        },
        createTagAction: function() {
            Utils.generatePopover({
                el: this.$(".tagPopover"),
                contentClass: "tagPopoverOptions",
                popoverOptions: {
                    content: function() {
                        return "<ul><li class='listTerm' ><i class='fa fa-search'></i> <a href='javascript:void(0)' data-fn='onSearchTag'>Search Classification</a></li><li class='listTerm' ><i class='fa fa-plus'></i> <a href='javascript:void(0)' data-fn='onClickCreateTag'>Create Sub-classification</a></li><li class='listTerm' ><i class='fa fa-trash-o'></i> <a href='javascript:void(0)' data-fn='onDeleteTag'>Delete Classification</a></li></ul>";
                    }
                }
            });
        },
        onSearchTag: function() {
            var el = this.ui.tagsList;
            "tree" == this.viewType && (el = this.ui.tagsParent), Utils.setUrl({
                url: "#!/search/searchResult",
                urlParams: {
                    tag: el.find("li.active").find("a[data-name]").data("name"),
                    searchType: "basic",
                    dslChecked: !1
                },
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
        },
        onDeleteTag: function() {
            var that = this, notifyObj = {
                modal: !0,
                ok: function(argument) {
                    that.onNotifyOk();
                },
                cancel: function(argument) {}
            }, text = "Are you sure you want to delete the classification";
            notifyObj.text = text, Utils.notifyConfirm(notifyObj);
        },
        onNotifyOk: function(data) {
            var that = this, deleteTagData = this.collection.fullCollection.findWhere({
                name: this.tag
            });
            deleteTagData.deleteTag({
                typeName: that.tag,
                success: function() {
                    Utils.notifySuccess({
                        content: "Classification " + that.tag + Messages.getAbbreviationMsg(!1, "deleteSuccessMessage")
                    });
                    var searchUrl = Globals.saveApplicationState.tabState.searchUrl, urlObj = Utils.getUrlState.getQueryParams(searchUrl);
                    urlObj && urlObj.tag && urlObj.tag === that.tag && (Globals.saveApplicationState.tabState.searchUrl = "#!/search"), 
                    that.collection.fullCollection.remove(deleteTagData), that.typeHeaders.fetch({
                        reset: !0
                    });
                }
            });
        }
    });
    return TagLayoutView;
});