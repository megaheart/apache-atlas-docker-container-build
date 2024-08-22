define([ "require", "backbone", "hbs!tmpl/glossary/GlossaryDetailLayoutView_tmpl", "utils/Utils", "utils/Messages", "utils/Globals", "utils/CommonViewFunction", "collection/VGlossaryList" ], function(require, Backbone, GlossaryDetailLayoutViewTmpl, Utils, Messages, Globals, CommonViewFunction, VGlossaryList) {
    "use strict";
    var GlossaryDetailLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "GlossaryDetailLayoutView",
        template: GlossaryDetailLayoutViewTmpl,
        regions: {
            RTermProperties: "#r_termProperties",
            RSearchResultLayoutView: "#r_searchResultLayoutView",
            RTagTableLayoutView: "#r_tagTableLayoutView",
            RRelationLayoutView: "#r_relationLayoutView"
        },
        templateHelpers: function() {
            return {
                isTermView: this.isTermView,
                isCategoryView: this.isCategoryView
            };
        },
        ui: {
            details: "[data-id='details']",
            editButton: "[data-id='editButton']",
            title: "[data-id='title']",
            shortDescription: "[data-id='shortDescription']",
            longDescription: "[data-id='longDescription']",
            categoryList: "[data-id='categoryList']",
            removeCategory: "[data-id='removeCategory']",
            categoryClick: "[data-id='categoryClick']",
            addCategory: "[data-id='addCategory']",
            termList: "[data-id='termList']",
            removeTerm: "[data-id='removeTerm']",
            termClick: "[data-id='termClick']",
            addTerm: "[data-id='addTerm']",
            tagList: "[data-id='tagListTerm']",
            removeTag: '[data-id="removeTagTerm"]',
            tagClick: '[data-id="tagClickTerm"]',
            addTag: '[data-id="addTagTerm"]',
            backButton: '[data-id="backButton"]',
            textType: '[name="textType"]',
            tablist: '[data-id="tab-list"] li'
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.categoryClick] = function(e) {
                if ("i" == e.target.nodeName.toLocaleLowerCase()) this.onClickRemoveAssociationBtn(e); else {
                    var guid = $(e.currentTarget).data("guid"), gId = this.data.anchor && this.data.anchor.glossaryGuid, categoryObj = _.find(this.data.categories, {
                        categoryGuid: guid
                    });
                    this.glossary.selectedItem = {
                        type: "GlossaryCategory",
                        guid: guid,
                        model: categoryObj
                    }, Utils.setUrl({
                        url: "#!/glossary/" + guid,
                        mergeBrowserUrl: !1,
                        urlParams: {
                            gType: "category",
                            viewType: "category",
                            fromView: "glossary",
                            gId: gId
                        },
                        trigger: !0,
                        updateTabState: !0
                    });
                }
            }, events["click " + this.ui.termClick] = function(e) {
                if ("i" == e.target.nodeName.toLocaleLowerCase()) this.onClickRemoveAssociationBtn(e); else {
                    var guid = $(e.currentTarget).data("guid"), gId = this.data.anchor && this.data.anchor.glossaryGuid, termObj = _.find(this.data.terms, {
                        termGuid: guid
                    });
                    this.glossary.selectedItem = {
                        type: "GlossaryTerm",
                        guid: guid,
                        model: termObj
                    }, Utils.setUrl({
                        url: "#!/glossary/" + guid,
                        mergeBrowserUrl: !1,
                        urlParams: {
                            gType: "term",
                            viewType: "term",
                            fromView: "glossary",
                            gId: gId
                        },
                        trigger: !0,
                        updateTabState: !0
                    });
                }
            }, events["click " + this.ui.tagClick] = function(e) {
                "i" == e.target.nodeName.toLocaleLowerCase() ? this.onClickTagCross(e) : Utils.setUrl({
                    url: "#!/tag/tagAttribute/" + e.currentTarget.textContent.split("@")[0],
                    mergeBrowserUrl: !1,
                    trigger: !0
                });
            }, events["click " + this.ui.editButton] = function(e) {
                var that = this, model = this.glossaryCollection.fullCollection.get(this.guid);
                this.isGlossaryView ? CommonViewFunction.createEditGlossaryCategoryTerm({
                    model: model,
                    isGlossaryView: this.isGlossaryView,
                    collection: this.glossaryCollection,
                    callback: function(sModel) {
                        var data = sModel.toJSON();
                        model.set(data, {
                            silent: !0
                        }), that.data = data, that.renderDetails(that.data), that.glossaryCollection.trigger("update:details", {
                            isGlossaryUpdate: !0
                        });
                    }
                }) : CommonViewFunction.createEditGlossaryCategoryTerm({
                    isTermView: this.isTermView,
                    isCategoryView: this.isCategoryView,
                    model: this.data,
                    collection: this.glossaryCollection,
                    callback: function(data) {
                        if (data.name != that.data.name) {
                            var glossary = that.glossaryCollection.fullCollection.get(data.anchor.glossaryGuid);
                            that.isTermView ? _.find(glossary.get("terms"), function(obj) {
                                obj.termGuid == data.guid && (obj.displayText = data.name);
                            }) : data.parentCategory || _.find(glossary.get("categories"), function(obj) {
                                obj.categoryGuid == data.guid && (obj.displayText = data.name);
                            }), that.options.categoryEvent.trigger("Success:TermRename", !0);
                        }
                        that.data = data, that.renderDetails(that.data);
                    }
                });
            }, events["click " + this.ui.backButton] = function() {
                Utils.backButtonClick();
            }, events["click " + this.ui.addTerm] = "onClickAddTermBtn", events["click " + this.ui.addCategory] = "onClickAddTermBtn", 
            events["click " + this.ui.addTag] = "onClickAddTagBtn", events["change " + this.ui.textType] = function(e) {
                this.isTextTypeChecked = !this.isTextTypeChecked, this.renderDetails(this.data);
            }, events["click " + this.ui.tablist] = function(e) {
                var tabValue = $(e.currentTarget).attr("role");
                Utils.setUrl({
                    url: Utils.getUrlState.getQueryUrl().queyParams[0],
                    urlParams: {
                        tabActive: tabValue || "entities"
                    },
                    mergeBrowserUrl: !0,
                    trigger: !1,
                    updateTabState: !0
                });
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "guid", "glossaryCollection", "glossary", "collection", "typeHeaders", "value", "entityDefCollection", "enumDefCollection", "classificationDefCollection", "searchVent", "categoryEvent")), 
            this.value && this.value.gType && ("category" == this.value.gType ? this.isCategoryView = !0 : "term" == this.value.gType ? this.isTermView = !0 : this.isGlossaryView = !0), 
            this.selectedTermAttribute = null;
        },
        onRender: function() {
            this.glossaryCollection.fetch({
                reset: !0,
                silent: !0
            }), this.$(".fontLoader-relative").show(), this.getData(), this.bindEvents(), this.updateTab();
        },
        bindEvents: function() {
            var that = this;
            that.options.categoryEvent && that.options.categoryEvent.on("Success:Term", function(options) {
                that.glossaryCollection.fetch({
                    reset: !0,
                    silent: !0
                });
            });
        },
        updateTab: function() {
            this.value && this.value.tabActive && (this.$(".nav.nav-tabs").find('[role="' + this.value.tabActive + '"]').addClass("active").siblings().removeClass("active"), 
            this.$(".tab-content").find('[role="' + this.value.tabActive + '"]').addClass("active").siblings().removeClass("active"));
        },
        onBeforeDestroy: function() {
            this.options.categoryEvent.off("Success:Term");
        },
        getData: function() {
            if (this.isGlossaryView) this.glossaryCollection.fullCollection.length ? (this.data = this.glossaryCollection.fullCollection.get(this.guid).toJSON(), 
            this.glossaryCollection.trigger("data:updated", $.extend(!0, {}, this.data)), this.renderDetails(this.data)) : this.listenTo(this.glossaryCollection.fullCollection, "reset ", function(skip) {
                var foundGlossary = this.glossaryCollection.fullCollection.get(this.guid);
                this.data = foundGlossary ? foundGlossary.toJSON() : null, this.glossaryCollection.trigger("data:updated", $.extend(!0, {}, this.data)), 
                null == this.data && (this.glossary.selectedItem = {}, Utils.setUrl({
                    url: "#!/glossary",
                    mergeBrowserUrl: !1,
                    urlParams: null,
                    trigger: !0,
                    updateTabState: !0
                })), this.renderDetails(this.data);
            }, this); else {
                Utils.showTitleLoader(this.$(".page-title .fontLoader"), this.ui.details);
                var getApiFunctionKey = "getCategory", that = this;
                this.isTermView && (getApiFunctionKey = "getTerm"), this.glossaryCollection[getApiFunctionKey]({
                    guid: this.guid,
                    ajaxOptions: {
                        success: function(data) {
                            if (!that.isDestroyed) {
                                if (that.data = data, that.isTermView) {
                                    var tags = {
                                        self: [],
                                        propagated: [],
                                        propagatedMap: {},
                                        combineMap: {}
                                    };
                                    if (that.data) {
                                        var tagObject = that.data.classifications;
                                        _.each(tagObject, function(val) {
                                            var typeName = val.typeName;
                                            val.entityGuid === that.guid ? tags.self.push(val) : (tags.propagated.push(val), 
                                            tags.propagatedMap[typeName] ? tags.propagatedMap[typeName].count += tags.propagatedMap[typeName].count : (tags.propagatedMap[typeName] = val, 
                                            tags.propagatedMap[typeName].count = 1)), void 0 === tags.combineMap[typeName] && (tags.combineMap[typeName] = val);
                                        }), tags.self = _.sortBy(tags.self, "typeName"), tags.propagated = _.sortBy(tags.propagated, "typeName");
                                    }
                                    var obj = {
                                        guid: that.guid,
                                        entityDefCollection: that.entityDefCollection,
                                        typeHeaders: that.typeHeaders,
                                        tagCollection: that.collection,
                                        enumDefCollection: that.enumDefCollection,
                                        classificationDefCollection: that.classificationDefCollection,
                                        glossaryCollection: that.glossaryCollection,
                                        searchVent: that.searchVent,
                                        tags: tags,
                                        value: that.value,
                                        getSelectedTermAttribute: function() {
                                            return that.selectedTermAttribute;
                                        },
                                        setSelectedTermAttribute: function(val) {
                                            that.selectedTermAttribute = val;
                                        }
                                    };
                                    that.renderTermPropertiestLayoutView(that.data), that.renderSearchResultLayoutView(obj), 
                                    that.renderTagTableLayoutView(obj), that.renderRelationLayoutView(obj);
                                }
                                that.glossaryCollection.trigger("data:updated", $.extend(!0, {}, data)), that.glossary.selectedItem.model = data, 
                                that.glossary.selectedItem.guid = data.guid, that.renderDetails(data);
                            }
                        },
                        cust_error: function() {}
                    }
                });
            }
        },
        renderDetails: function(data) {
            Utils.hideTitleLoader(this.$(".fontLoader"), this.ui.details);
            var longDescriptionContent = data && data.longDescription ? data.longDescription : "", sanitizeLongDescriptionContent = "";
            if ("" !== longDescriptionContent && (sanitizeLongDescriptionContent = Utils.sanitizeHtmlContent({
                data: longDescriptionContent
            })), data) {
                var longDescriptionValue = longDescriptionContent ? sanitizeLongDescriptionContent : "";
                this.ui.title.text(data.name || data.displayText || data.qualifiedName), this.ui.shortDescription.text(data.shortDescription ? data.shortDescription : ""), 
                this.isTextTypeChecked ? this.ui.longDescription.text(longDescriptionValue) : this.ui.longDescription.html(longDescriptionValue), 
                this.generateCategories(data.categories), this.generateTerm(data.terms), this.generateTag(data.classifications);
            } else this.ui.title.text("No Data found");
        },
        generateCategories: function(data) {
            var categories = "";
            _.each(data, function(val) {
                var name = _.escape(val.displayText);
                categories += '<span data-guid="' + val.categoryGuid + '" class="btn btn-action btn-sm btn-icon btn-blue" data-id="categoryClick"><span>' + name + '</span><i class="fa fa-close" data-id="removeCategory" data-type="category" title="Remove Category"></i></span>';
            }), this.ui.categoryList.find("span.btn").remove(), this.ui.categoryList.prepend(categories);
        },
        generateTerm: function(data) {
            var terms = "";
            _.each(data, function(val) {
                var name = _.escape(val.displayText);
                terms += '<span data-guid="' + val.termGuid + '" class="btn btn-action btn-sm btn-icon btn-blue" data-id="termClick"><span>' + name + '</span><i class="fa fa-close" data-id="removeTerm" data-type="term" title="Remove Term"></i></span>';
            }), this.ui.termList.find("span.btn").remove(), this.ui.termList.prepend(terms);
        },
        generateTag: function(tagObject) {
            var that = this, tagData = "";
            _.each(tagObject, function(val) {
                var parentName = that.getTagParentList(val.typeName);
                tagData += '<span class="btn btn-action btn-sm btn-icon btn-blue" data-id="tagClickTerm"><span title="' + parentName + '">' + _.escape(parentName) + '</span><i class="fa fa-close" data-id="removeTagTerm" data-type="tag" title="Remove Classification"></i></span>';
            }), this.ui.tagList.find("span.btn").remove(), this.ui.tagList.prepend(tagData);
        },
        getCategoryTermCount: function(collection, matchString) {
            var terms = 0;
            return _.each(collection, function(model) {
                model.get(matchString) && (terms += model.get(matchString).length);
            }), terms;
        },
        getTagParentList: function(name) {
            var tagObj = this.classificationDefCollection.fullCollection.find({
                name: name
            }), tagParents = tagObj ? tagObj.get("superTypes") : null, parentName = name;
            return tagParents && tagParents.length && (parentName += tagParents.length > 1 ? "@(" + tagParents.join() + ")" : "@" + tagParents.join()), 
            parentName;
        },
        onClickAddTermBtn: function(e) {
            var that = this, glossary = this.glossaryCollection;
            if (this.value && this.value.gId) {
                var foundModel = this.glossaryCollection.find({
                    guid: this.value.gId
                });
                foundModel && (glossary = new VGlossaryList([ foundModel.toJSON() ], {
                    comparator: function(item) {
                        return item.get("name");
                    }
                }));
            }
            var obj = {
                callback: function() {
                    that.getData();
                },
                glossaryCollection: glossary
            }, emptyListMessage = this.isCategoryView ? "There are no available terms that can be associated with this category" : "There are no available categories that can be associated with this term";
            obj = this.isCategoryView ? _.extend(obj, {
                categoryData: this.data,
                associatedTerms: this.data && this.data.terms && this.data.terms.length > 0 ? this.data.terms : [],
                isCategoryView: this.isCategoryView
            }) : _.extend(obj, {
                termData: this.data,
                isTermView: this.isTermView
            }), this.getCategoryTermCount(glossary.fullCollection.models, this.isCategoryView ? "terms" : "categories") ? this.AssignTermLayoutViewModal(obj) : Utils.notifyInfo({
                content: emptyListMessage
            });
        },
        AssignTermLayoutViewModal: function(termCategoryObj) {
            var that = this;
            require([ "views/glossary/AssignTermLayoutView" ], function(AssignTermLayoutView) {
                var view = new AssignTermLayoutView(termCategoryObj);
                view.modal.on("ok", function() {
                    that.hideLoader();
                });
            });
        },
        onClickAddTagBtn: function(e) {
            var that = this;
            require([ "views/tag/AddTagModalView" ], function(AddTagModalView) {
                var tagList = [];
                _.map(that.data.classifications, function(obj) {
                    obj.entityGuid === that.guid && tagList.push(obj.typeName);
                });
                new AddTagModalView({
                    guid: that.guid,
                    tagList: tagList,
                    callback: function() {
                        that.searchVent && that.searchVent.trigger("Classification:Count:Update"), that.getData();
                    },
                    showLoader: that.showLoader.bind(that),
                    hideLoader: that.hideLoader.bind(that),
                    collection: that.classificationDefCollection,
                    enumDefCollection: that.enumDefCollection
                });
            });
        },
        onClickTagCross: function(e) {
            var that = this, tagName = $(e.currentTarget).text().split("@")[0], termName = this.data.name;
            CommonViewFunction.deleteTag(_.extend({}, {
                msg: "<div class='ellipsis-with-margin'>Remove: <b>" + _.escape(tagName) + "</b> assignment from <b>" + _.escape(termName) + "?</b></div>",
                titleMessage: Messages.removeTag,
                okText: "Remove",
                showLoader: that.showLoader.bind(that),
                hideLoader: that.hideLoader.bind(that),
                tagName: tagName,
                guid: that.guid,
                callback: function() {
                    that.searchVent && that.searchVent.trigger("Classification:Count:Update"), that.getData();
                }
            }));
        },
        onClickRemoveAssociationBtn: function(e) {
            var $el = $(e.currentTarget), guid = $el.data("guid"), name = $el.text(), that = this;
            CommonViewFunction.removeCategoryTermAssociation({
                selectedGuid: guid,
                model: that.data,
                collection: that.glossaryCollection,
                msg: "<div class='ellipsis-with-margin'>Remove: <b>" + _.escape(name) + "</b> assignment from <b>" + _.escape(that.data.name) + "?</b></div>",
                titleMessage: Messages.glossary[that.isTermView ? "removeCategoryfromTerm" : "removeTermfromCategory"],
                isCategoryView: that.isCategoryView,
                isTermView: that.isTermView,
                buttonText: "Remove",
                showLoader: that.hideLoader.bind(that),
                hideLoader: that.hideLoader.bind(that),
                callback: function() {
                    that.getData();
                }
            });
        },
        showLoader: function() {
            Utils.showTitleLoader(this.$(".page-title .fontLoader"), this.ui.details);
        },
        hideLoader: function() {
            Utils.hideTitleLoader(this.$(".page-title .fontLoader"), this.ui.details);
        },
        renderTagTableLayoutView: function(options) {
            var that = this;
            require([ "views/tag/TagDetailTableLayoutView" ], function(TagDetailTableLayoutView) {
                that.RTagTableLayoutView && that.RTagTableLayoutView.show(new TagDetailTableLayoutView(_.extend({}, options, {
                    entityName: _.escape(that.ui.title.text()),
                    fetchCollection: that.getData.bind(that),
                    entity: that.data
                })));
            });
        },
        renderTermPropertiestLayoutView: function(options) {
            var that = this;
            require([ "views/glossary/TermPropertiestLayoutView" ], function(TermPropertiestLayoutView) {
                that.RTermProperties && that.RTermProperties.show(new TermPropertiestLayoutView(options));
            });
        },
        renderSearchResultLayoutView: function(options) {
            var that = this;
            require([ "views/search/SearchResultLayoutView" ], function(SearchResultLayoutView) {
                that.RSearchResultLayoutView && that.RSearchResultLayoutView.show(new SearchResultLayoutView(_.extend({}, options, {
                    value: {
                        searchType: "basic",
                        term: that.data.qualifiedName,
                        includeDE: options.value.includeDE || !1
                    },
                    fromView: "glossary"
                })));
            });
        },
        renderRelationLayoutView: function(options) {
            var that = this;
            require([ "views/glossary/TermRelationAttributeLayoutView" ], function(TermRelationAttributeLayoutView) {
                that.RRelationLayoutView && that.RRelationLayoutView.show(new TermRelationAttributeLayoutView(_.extend({}, options, {
                    entityName: that.ui.title.text(),
                    fetchCollection: that.getData.bind(that),
                    data: that.data
                })));
            });
        }
    });
    return GlossaryDetailLayoutView;
});