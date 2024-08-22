define([ "require", "backbone", "hbs!tmpl/detail_page/DetailPageLayoutView_tmpl", "utils/Utils", "utils/CommonViewFunction", "utils/Globals", "utils/Enums", "utils/Messages", "utils/UrlLinks", "collection/VEntityList" ], function(require, Backbone, DetailPageLayoutViewTmpl, Utils, CommonViewFunction, Globals, Enums, Messages, UrlLinks, VEntityList) {
    "use strict";
    var DetailPageLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "DetailPageLayoutView",
        template: DetailPageLayoutViewTmpl,
        regions: {
            REntityDetailTableLayoutView: "#r_entityDetailTableLayoutView",
            RSchemaTableLayoutView: "#r_schemaTableLayoutView",
            RTagTableLayoutView: "#r_tagTableLayoutView",
            RLineageLayoutView: "#r_lineageLayoutView",
            RAuditTableLayoutView: "#r_auditTableLayoutView",
            RPendingTaskTableLayoutView: "#r_pendingTaskTableLayoutView",
            RReplicationAuditTableLayoutView: "#r_replicationAuditTableLayoutView",
            RProfileLayoutView: "#r_profileLayoutView",
            RRelationshipLayoutView: "#r_relationshipLayoutView",
            REntityUserDefineView: "#r_entityUserDefineView",
            REntityLabelDefineView: "#r_entityLabelDefineView",
            REntityBusinessMetadataView: "#r_entityBusinessMetadataView"
        },
        ui: {
            tagClick: '[data-id="tagClick"]',
            pTagCountClick: '[data-id="pTagCountClick"]',
            termClick: '[data-id="termClick"]',
            propagatedTagDiv: '[data-id="propagatedTagDiv"]',
            title: '[data-id="title"]',
            description: '[data-id="description"]',
            editBox: '[data-id="editBox"]',
            deleteTag: '[data-id="deleteTag"]',
            deleteTerm: '[data-id="deleteTerm"]',
            addTag: '[data-id="addTag"]',
            addTerm: '[data-id="addTerm"]',
            tagList: '[data-id="tagList"]',
            termList: '[data-id="termList"]',
            propagatedTagList: '[data-id="propagatedTagList"]',
            tablist: '[data-id="tab-list"] li',
            entityIcon: '[data-id="entityIcon"]',
            tagParent: '[data-id="tagParent"]',
            termGlossary: '[data-id="termGlossary"]'
        },
        templateHelpers: function() {
            return {
                entityUpdate: Globals.entityUpdate,
                isTasksEnabled: Globals.isTasksEnabled
            };
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.tagClick] = function(e) {
                "i" == e.target.nodeName.toLocaleLowerCase() || $(e.target).hasClass("parent-list-btn") || $(e.target).hasClass("fa") || Utils.setUrl({
                    url: "#!/tag/tagAttribute/" + e.target.textContent.split("@")[0],
                    mergeBrowserUrl: !1,
                    trigger: !0
                });
            }, events["click " + this.ui.pTagCountClick] = function(e) {
                var tag = $(e.currentTarget).parent().children().first().text();
                Utils.setUrl({
                    url: "#!/detailPage/" + this.id + "?tabActive=classification&filter=" + tag,
                    mergeBrowserUrl: !1,
                    trigger: !0
                });
            }, events["click " + this.ui.termClick] = function(e) {
                if ("i" != e.target.nodeName.toLocaleLowerCase() && !$(e.target).hasClass("parent-list-btn") && !$(e.target).hasClass("fa")) {
                    var guid = $(e.currentTarget).find(".fa-close").data("guid"), gType = "term";
                    Utils.setUrl({
                        url: "#!/glossary/" + guid,
                        mergeBrowserUrl: !1,
                        urlParams: {
                            gType: gType,
                            viewType: "term",
                            fromView: "entity"
                        },
                        trigger: !0
                    });
                }
            }, events["click " + this.ui.addTerm] = "onClickAddTermBtn", events["click " + this.ui.deleteTag] = "onClickTagCross", 
            events["click " + this.ui.deleteTerm] = "onClickTermCross", events["click " + this.ui.addTag] = "onClickAddTagBtn", 
            events["click " + this.ui.tablist] = function(e) {
                var tabValue = $(e.currentTarget).attr("role");
                Utils.setUrl({
                    url: Utils.getUrlState.getQueryUrl().queyParams[0],
                    urlParams: {
                        tabActive: tabValue || "properties"
                    },
                    mergeBrowserUrl: !1,
                    trigger: !1,
                    updateTabState: !0
                });
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "value", "collection", "id", "entityDefCollection", "typeHeaders", "enumDefCollection", "classificationDefCollection", "glossaryCollection", "businessMetadataDefCollection", "searchVent")), 
            $("body").addClass("detail-page"), this.collection = new VEntityList([], {}), this.collection.url = UrlLinks.entitiesApiUrl({
                guid: this.id,
                minExtInfo: !0
            }), this.fetchCollection();
        },
        bindEvents: function() {
            var that = this;
            this.listenTo(this.collection, "reset", function() {
                this.entityObject = this.collection.first().toJSON();
                var collectionJSON = this.entityObject.entity;
                if (this.activeEntityDef = this.entityDefCollection.fullCollection.find({
                    name: collectionJSON.typeName
                }), !this.activeEntityDef) return Utils.backButtonClick(), Utils.notifyError({
                    content: "Unknown Entity-Type"
                }), !0;
                collectionJSON && _.startsWith(collectionJSON.typeName, "AtlasGlossary") && this.$(".termBox").hide(), 
                Utils.findAndMergeRefEntity({
                    attributeObject: collectionJSON.attributes,
                    referredEntities: this.entityObject.referredEntities
                }), Utils.findAndMergeRefEntity({
                    attributeObject: collectionJSON.relationshipAttributes,
                    referredEntities: this.entityObject.referredEntities
                }), Utils.findAndMergeRelationShipEntity({
                    attributeObject: collectionJSON.attributes,
                    relationshipAttributes: collectionJSON.relationshipAttributes
                });
                var isProcess = !1, typeName = Utils.getName(collectionJSON, "typeName"), superTypes = Utils.getNestedSuperTypes({
                    data: this.activeEntityDef.toJSON(),
                    collection: this.entityDefCollection
                }), isLineageRender = _.find(superTypes, function(type) {
                    if ("DataSet" === type || "Process" === type) return "Process" === type && (isProcess = !0), 
                    !0;
                });
                if (isLineageRender || (isLineageRender = "DataSet" === typeName || "Process" === typeName || null), 
                collectionJSON && collectionJSON.guid) {
                    collectionJSON.guid;
                    this.readOnly = Enums.entityStateReadOnly[collectionJSON.status];
                } else {
                    this.id;
                }
                if (this.readOnly ? this.$el.addClass("readOnly") : this.$el.removeClass("readOnly"), 
                collectionJSON) {
                    if (this.name = Utils.getName(collectionJSON), collectionJSON.attributes) {
                        if (collectionJSON.typeName && (collectionJSON.attributes.typeName = _.escape(collectionJSON.typeName)), 
                        this.name && collectionJSON.typeName && (this.name = this.name + " (" + _.escape(collectionJSON.typeName) + ")"), 
                        !this.name && collectionJSON.typeName && (this.name = _.escape(collectionJSON.typeName)), 
                        this.description = collectionJSON.attributes.description, this.name) {
                            this.ui.title.show();
                            var titleName = "<span>" + this.name + "</span>";
                            this.readOnly && (titleName += '<button title="Deleted" class="btn btn-action btn-md deleteBtn"><i class="fa fa-trash"></i> Deleted</button>'), 
                            this.ui.title.html(titleName), void 0 === collectionJSON.attributes.serviceType ? void 0 === Globals.serviceTypeMap[collectionJSON.typeName] && this.activeEntityDef && (Globals.serviceTypeMap[collectionJSON.typeName] = this.activeEntityDef.get("serviceType")) : void 0 === Globals.serviceTypeMap[collectionJSON.typeName] && (Globals.serviceTypeMap[collectionJSON.typeName] = collectionJSON.attributes.serviceType);
                            var entityData = _.extend({
                                serviceType: Globals.serviceTypeMap[collectionJSON.typeName],
                                isProcess: isProcess
                            }, collectionJSON);
                            this.readOnly ? this.ui.entityIcon.addClass("disabled") : this.ui.entityIcon.removeClass("disabled"), 
                            this.ui.entityIcon.attr("title", _.escape(collectionJSON.typeName)).html('<img src="' + Utils.getEntityIconPath({
                                entityData: entityData
                            }) + '"/>').find("img").on("error", function() {
                                this.src = Utils.getEntityIconPath({
                                    entityData: entityData,
                                    errorUrl: this.src
                                });
                            });
                        } else this.ui.title.hide();
                        this.description ? (this.ui.description.show(), this.ui.description.html("<span>" + _.escape(this.description) + "</span>")) : this.ui.description.hide();
                    }
                    var tags = {
                        self: [],
                        propagated: [],
                        propagatedMap: {},
                        combineMap: {}
                    };
                    if (collectionJSON.classifications) {
                        var tagObject = collectionJSON.classifications;
                        _.each(tagObject, function(val) {
                            var typeName = val.typeName;
                            val.entityGuid === that.id ? tags.self.push(val) : (tags.propagated.push(val), tags.propagatedMap[typeName] ? tags.propagatedMap[typeName].count++ : (tags.propagatedMap[typeName] = val, 
                            tags.propagatedMap[typeName].count = 1)), void 0 === tags.combineMap[typeName] && (tags.combineMap[typeName] = val);
                        }), tags.self = _.sortBy(tags.self, "typeName"), tags.propagated = _.sortBy(tags.propagated, "typeName"), 
                        this.generateTag(tags);
                    } else this.generateTag([]);
                    if (collectionJSON.relationshipAttributes && collectionJSON.relationshipAttributes.meanings && this.generateTerm(collectionJSON.relationshipAttributes.meanings), 
                    Globals.entityTypeConfList && _.isEmptyArray(Globals.entityTypeConfList) ? this.editEntity = !0 : _.contains(Globals.entityTypeConfList, collectionJSON.typeName) && (this.editEntity = !0), 
                    collectionJSON.attributes && collectionJSON.attributes.columns) {
                        var valueSorted = _.sortBy(collectionJSON.attributes.columns, function(val) {
                            return val.attributes && val.attributes.position;
                        });
                        collectionJSON.attributes.columns = valueSorted;
                    }
                }
                this.hideLoader();
                var obj = {
                    entity: collectionJSON,
                    guid: this.id,
                    entityName: this.name,
                    typeHeaders: this.typeHeaders,
                    tags: tags,
                    entityDefCollection: this.entityDefCollection,
                    fetchCollection: this.fetchCollection.bind(that),
                    enumDefCollection: this.enumDefCollection,
                    classificationDefCollection: this.classificationDefCollection,
                    glossaryCollection: this.glossaryCollection,
                    businessMetadataCollection: this.activeEntityDef.get("businessAttributeDefs"),
                    searchVent: this.searchVent,
                    attributeDefs: function() {
                        return that.getEntityDef(collectionJSON);
                    }(),
                    editEntity: this.editEntity || !1
                };
                if (obj.renderAuditTableLayoutView = function() {
                    that.renderAuditTableLayoutView(obj);
                }, this.renderEntityDetailTableLayoutView(obj), this.renderEntityUserDefineView(obj), 
                this.renderEntityLabelDefineView(obj), obj.businessMetadataCollection && this.renderEntityBusinessMetadataView(obj), 
                this.renderRelationshipLayoutView(obj), this.renderAuditTableLayoutView(obj), this.renderTagTableLayoutView(obj), 
                Globals.isTasksEnabled && this.renderPendingTaskTableLayoutView(), !collectionJSON || _.isUndefined(collectionJSON.attributes.profileData) && "hive_db" !== collectionJSON.typeName && "hbase_namespace" !== collectionJSON.typeName ? (this.$(".profileTab").hide(), 
                this.redirectToDefaultTab("profile")) : ("hive_db" !== collectionJSON.typeName && "hbase_namespace" !== collectionJSON.typeName || this.$(".profileTab a").text("Tables"), 
                this.$(".profileTab").show(), this.renderProfileLayoutView(_.extend({}, obj, {
                    entityDetail: collectionJSON.attributes,
                    profileData: collectionJSON.attributes.profileData,
                    typeName: collectionJSON.typeName,
                    value: that.value
                }))), this.activeEntityDef) {
                    collectionJSON && "AtlasServer" === collectionJSON.typeName ? (this.$(".replicationTab").show(), 
                    this.renderReplicationAuditTableLayoutView(obj)) : (this.$(".replicationTab").hide(), 
                    this.redirectToDefaultTab("raudits"));
                    var schemaOptions = this.activeEntityDef.get("options"), schemaElementsAttribute = schemaOptions && schemaOptions.schemaElementsAttribute;
                    _.isEmpty(schemaElementsAttribute) ? (this.$(".schemaTable").hide(), this.redirectToDefaultTab("schema")) : (this.$(".schemaTable").show(), 
                    this.renderSchemaLayoutView(_.extend({}, obj, {
                        attribute: collectionJSON.relationshipAttributes[schemaElementsAttribute] || collectionJSON.attributes[schemaElementsAttribute]
                    }))), isLineageRender ? (this.$(".lineageGraph").show(), this.renderLineageLayoutView(_.extend(obj, {
                        processCheck: isProcess,
                        fetchCollection: this.fetchCollection.bind(this)
                    }))) : (this.$(".lineageGraph").hide(), this.redirectToDefaultTab("lineage"));
                }
            }, this), this.listenTo(this.collection, "error", function(model, response) {
                this.$(".fontLoader-relative").removeClass("show"), response.responseJSON && Utils.notifyError({
                    content: response.responseJSON.errorMessage || response.responseJSON.error
                });
            }, this);
        },
        onRender: function() {
            this.bindEvents(), Utils.showTitleLoader(this.$(".page-title .fontLoader"), this.$(".entityDetail")), 
            this.$(".fontLoader-relative").addClass("show");
        },
        redirectToDefaultTab: function(tabName) {
            var regionRef = null;
            switch (tabName) {
              case "schema":
                regionRef = this.RSchemaTableLayoutView;
                break;

              case "lineage":
                regionRef = this.RLineageLayoutView;
                break;

              case "raudits":
                regionRef = this.RReplicationAuditTableLayoutView;
                break;

              case "profile":
                regionRef = this.RProfileLayoutView;
            }
            regionRef && (regionRef.destroy(), regionRef.$el.empty()), (this.value && this.value.tabActive == tabName || this.$(".tab-content .tab-pane.active").attr("role") === tabName) && Utils.setUrl({
                url: Utils.getUrlState.getQueryUrl().queyParams[0],
                urlParams: {
                    tabActive: "properties"
                },
                mergeBrowserUrl: !1,
                trigger: !0,
                updateTabState: !0
            });
        },
        manualRender: function(options) {
            if (options) {
                var oldId = this.id;
                _.extend(this, _.pick(options, "value", "id")), this.id !== oldId && (this.collection.url = UrlLinks.entitiesApiUrl({
                    guid: this.id,
                    minExtInfo: !0
                }), this.fetchCollection()), this.updateTab();
            }
        },
        updateTab: function() {
            this.value && this.value.tabActive && (this.$(".nav.nav-tabs").find('[role="' + this.value.tabActive + '"]').addClass("active").siblings().removeClass("active"), 
            this.$(".tab-content").find('[role="' + this.value.tabActive + '"]').addClass("active").siblings().removeClass("active"), 
            $("html, body").animate({
                scrollTop: this.$(".tab-content").offset().top + 1200
            }, 1e3));
        },
        onShow: function() {
            this.updateTab();
        },
        onDestroy: function() {
            Utils.getUrlState.isDetailPage() || Utils.getUrlState.isRelationshipDetailPage() || $("body").removeClass("detail-page");
        },
        fetchCollection: function() {
            this.collection.fetch({
                reset: !0
            }), this.searchVent && this.searchVent.trigger("entityList:refresh");
        },
        getEntityDef: function(entityObj) {
            if (this.activeEntityDef) {
                var data = this.activeEntityDef.toJSON(), attributeDefs = Utils.getNestedSuperTypeObj({
                    data: data,
                    attrMerge: !0,
                    collection: this.entityDefCollection
                });
                return attributeDefs;
            }
            return [];
        },
        onClickTagCross: function(e) {
            var that = this, tagName = $(e.currentTarget).parent().text().split("@")[0], entityGuid = $(e.currentTarget).data("entityguid");
            CommonViewFunction.deleteTag(_.extend({}, {
                guid: that.id,
                associatedGuid: that.id != entityGuid ? entityGuid : null,
                msg: "<div class='ellipsis-with-margin'>Remove: <b>" + _.escape(tagName) + "</b> assignment from <b>" + this.name + "?</b></div>",
                titleMessage: Messages.removeTag,
                okText: "Remove",
                showLoader: that.showLoader.bind(that),
                hideLoader: that.hideLoader.bind(that),
                tagName: tagName,
                callback: function() {
                    that.fetchCollection();
                }
            }));
        },
        onClickTermCross: function(e) {
            var $el = $(e.currentTarget), termGuid = $el.data("guid"), termName = $el.text(), that = this, termObj = _.find(this.collection.first().get("entity").relationshipAttributes.meanings, {
                guid: termGuid
            });
            CommonViewFunction.removeCategoryTermAssociation({
                termGuid: termGuid,
                model: {
                    guid: that.id,
                    relationshipGuid: termObj.relationshipGuid
                },
                collection: that.glossaryCollection,
                msg: "<div class='ellipsis-with-margin'>Remove: <b>" + _.escape(termName) + "</b> assignment from <b>" + this.name + "?</b></div>",
                titleMessage: Messages.glossary.removeTermfromEntity,
                isEntityView: !0,
                buttonText: "Remove",
                showLoader: that.showLoader.bind(that),
                hideLoader: that.hideLoader.bind(that),
                callback: function() {
                    that.fetchCollection();
                }
            });
        },
        generateTag: function(tagObject) {
            var that = this, tagData = "", propagatedTagListData = "";
            _.each(tagObject.self, function(val) {
                var parentName = that.getTagParentList(val.typeName);
                tagData += '<span class="btn btn-action btn-sm btn-icon btn-blue" data-id="tagClick"><span title="' + parentName + '">' + _.escape(parentName) + '</span><i class="fa fa-close" data-id="deleteTag" data-type="tag" title="Remove Classification"></i></span>';
            }), _.each(tagObject.propagatedMap, function(val, key) {
                var parentName = that.getTagParentList(val.typeName);
                propagatedTagListData += '<span class="btn btn-action btn-sm btn-icon btn-blue"><span data-id="tagClick" title="' + parentName + '">' + parentName + "</span>" + (val.count > 1 ? '<span class="active" data-id="pTagCountClick">(' + val.count + ")</span>" : "") + "</span>";
            }), "" !== propagatedTagListData ? this.ui.propagatedTagDiv.show() : this.ui.propagatedTagDiv.hide(), 
            this.ui.tagList.find("span.btn").remove(), this.ui.propagatedTagList.find("span.btn").remove(), 
            this.ui.tagList.prepend(tagData), this.ui.propagatedTagList.html(propagatedTagListData);
        },
        generateTerm: function(data) {
            var termData = "";
            _.each(data, function(val) {
                var glossaryName = val.qualifiedName ? val.qualifiedName : val.displayText;
                termData += '<span class="btn btn-action btn-sm btn-icon btn-blue" data-id="termClick" title= "' + glossaryName + '"><span>' + _.escape(glossaryName) + '</span><i class="' + ("ACTIVE" == val.relationshipStatus ? "fa fa-close" : "") + '" data-id="deleteTerm" data-guid="' + val.guid + '" data-type="term" title="Remove Term"></i></span>';
            }), this.ui.termList.find("span.btn").remove(), this.ui.termList.prepend(termData);
        },
        getTagParentList: function(name) {
            var tagObj = this.classificationDefCollection.fullCollection.find({
                name: name
            }), tagParents = tagObj ? tagObj.get("superTypes") : null, parentName = name;
            return tagParents && tagParents.length && (parentName += tagParents.length > 1 ? "@(" + tagParents.join() + ")" : "@" + tagParents.join()), 
            parentName;
        },
        hideLoader: function() {
            Utils.hideTitleLoader(this.$(".page-title .fontLoader"), this.$(".entityDetail"));
        },
        showLoader: function() {
            Utils.showTitleLoader(this.$(".page-title .fontLoader"), this.$(".entityDetail"));
        },
        onClickAddTagBtn: function(e) {
            var that = this;
            require([ "views/tag/AddTagModalView" ], function(AddTagModalView) {
                var tagList = [];
                _.map(that.entityObject.entity.classifications, function(obj) {
                    obj.entityGuid === that.id && tagList.push(obj.typeName);
                });
                var view = new AddTagModalView({
                    guid: that.id,
                    tagList: tagList,
                    callback: function() {
                        that.fetchCollection();
                    },
                    showLoader: that.showLoader.bind(that),
                    hideLoader: that.hideLoader.bind(that),
                    collection: that.classificationDefCollection,
                    enumDefCollection: that.enumDefCollection
                });
                view.modal.on("ok", function() {
                    Utils.showTitleLoader(that.$(".page-title .fontLoader"), that.$(".entityDetail"));
                });
            });
        },
        assignTermModalView: function(glossaryCollection, obj) {
            var that = this, terms = 0;
            _.each(glossaryCollection.fullCollection.models, function(model) {
                model.get("terms") && (terms += model.get("terms").length);
            }), terms ? require([ "views/glossary/AssignTermLayoutView" ], function(AssignTermLayoutView) {
                var view = new AssignTermLayoutView({
                    guid: obj.guid,
                    callback: function() {
                        that.fetchCollection();
                    },
                    associatedTerms: obj.associatedTerms,
                    showLoader: that.showLoader.bind(that),
                    hideLoader: that.hideLoader.bind(that),
                    glossaryCollection: glossaryCollection
                });
                view.modal.on("ok", function() {
                    Utils.showTitleLoader(that.$(".page-title .fontLoader"), that.$(".entityDetail"));
                });
            }) : Utils.notifyInfo({
                content: "There are no available terms that can be associated with this entity"
            });
        },
        onClickAddTermBtn: function(e) {
            var entityObj = this.collection.first().get("entity"), obj = {
                guid: this.id,
                associatedTerms: []
            };
            this.assignTermModalView(this.glossaryCollection, obj), entityObj && entityObj.relationshipAttributes && entityObj.relationshipAttributes.meanings && (obj.associatedTerms = entityObj.relationshipAttributes.meanings);
        },
        renderEntityDetailTableLayoutView: function(obj) {
            var that = this;
            require([ "views/entity/EntityDetailTableLayoutView" ], function(EntityDetailTableLayoutView) {
                that.REntityDetailTableLayoutView.show(new EntityDetailTableLayoutView(obj));
            });
        },
        renderEntityUserDefineView: function(obj) {
            var that = this;
            require([ "views/entity/EntityUserDefineView" ], function(EntityUserDefineView) {
                that.REntityUserDefineView.show(new EntityUserDefineView(obj));
            });
        },
        renderEntityLabelDefineView: function(obj) {
            var that = this;
            require([ "views/entity/EntityLabelDefineView" ], function(EntityLabelDefineView) {
                that.REntityLabelDefineView.show(new EntityLabelDefineView(obj));
            });
        },
        renderEntityBusinessMetadataView: function(obj) {
            var that = this;
            require([ "views/entity/EntityBusinessMetaDataView" ], function(EntityBusinessMetaDataView) {
                that.REntityBusinessMetadataView.show(new EntityBusinessMetaDataView(obj));
            });
        },
        renderTagTableLayoutView: function(obj) {
            var that = this;
            require([ "views/tag/TagDetailTableLayoutView" ], function(TagDetailTableLayoutView) {
                that.RTagTableLayoutView.show(new TagDetailTableLayoutView(obj));
            });
        },
        renderPendingTaskTableLayoutView: function() {
            var that = this;
            require([ "views/detail_page/PendingTaskTableLayoutView" ], function(PendingTaskTableLayoutView) {
                that.RPendingTaskTableLayoutView.show(new PendingTaskTableLayoutView());
            });
        },
        renderLineageLayoutView: function(obj) {
            var that = this;
            require([ "views/graph/LineageLayoutView" ], function(LineageLayoutView) {
                that.RLineageLayoutView.show(new LineageLayoutView(obj));
            });
        },
        renderRelationshipLayoutView: function(obj) {
            var that = this;
            require([ "views/graph/RelationshipLayoutView" ], function(RelationshipLayoutView) {
                that.RRelationshipLayoutView.show(new RelationshipLayoutView(obj));
            });
        },
        renderSchemaLayoutView: function(obj) {
            var that = this;
            require([ "views/schema/SchemaLayoutView" ], function(SchemaLayoutView) {
                that.RSchemaTableLayoutView.show(new SchemaLayoutView(obj));
            });
        },
        renderAuditTableLayoutView: function(obj) {
            var that = this;
            require([ "views/audit/AuditTableLayoutView" ], function(AuditTableLayoutView) {
                that.RAuditTableLayoutView.show(new AuditTableLayoutView(obj));
            });
        },
        renderReplicationAuditTableLayoutView: function(obj) {
            var that = this;
            require([ "views/audit/ReplicationAuditTableLayoutView" ], function(ReplicationAuditTableLayoutView) {
                that.RReplicationAuditTableLayoutView.show(new ReplicationAuditTableLayoutView(obj));
            });
        },
        renderProfileLayoutView: function(obj) {
            var that = this;
            require([ "views/profile/ProfileLayoutView" ], function(ProfileLayoutView) {
                that.RProfileLayoutView.show(new ProfileLayoutView(obj));
            });
        }
    });
    return DetailPageLayoutView;
});