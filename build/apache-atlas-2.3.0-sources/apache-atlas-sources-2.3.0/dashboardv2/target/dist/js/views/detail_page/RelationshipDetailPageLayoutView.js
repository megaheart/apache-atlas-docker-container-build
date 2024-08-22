define([ "require", "backbone", "hbs!tmpl/detail_page/RelationshipDetailPageLayoutView_tmpl", "utils/Utils", "utils/CommonViewFunction", "utils/Globals", "utils/Enums", "utils/Messages", "utils/UrlLinks", "collection/VEntityList" ], function(require, Backbone, RelationshipDetailPageLayoutView, Utils, CommonViewFunction, Globals, Enums, Messages, UrlLinks, VEntityList) {
    "use strict";
    var RelationshipDetailPageLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "RelationshipDetailPageLayoutView",
        template: RelationshipDetailPageLayoutView,
        regions: {
            RRelationshipDetailTableLayoutView: "#r_relationshipDetailTableLayoutView"
        },
        ui: {
            title: '[data-id="title"]',
            entityIcon: '[data-id="entityIcon"]',
            relationshipEnd1: '[data-id="relationshipEnd1"]',
            relationshipEnd2: '[data-id="relationshipEnd2"]',
            otherAttributes: '[data-id="otherAttributes"]'
        },
        templateHelpers: function() {},
        events: function() {
            var events = {};
            return events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "value", "collection", "id", "relationshipDefCollection", "searchVent")), 
            $("body").addClass("detail-page"), this.collection = new VEntityList([], {}), this.collection.url = UrlLinks.relationApiUrl({
                guid: this.id,
                minExtInfo: !0
            }), this.fetchCollection();
        },
        bindEvents: function() {
            var that = this;
            this.listenTo(this.collection, "reset", function() {
                this.relationshipObject = this.collection.first().toJSON();
                var collectionJSON = this.relationshipObject.relationship, name = collectionJSON ? Utils.getName(collectionJSON) : "";
                if (collectionJSON) if (this.readOnly = Enums.entityStateReadOnly[collectionJSON.status], 
                name && collectionJSON.typeName && (name = name + " (" + _.escape(collectionJSON.typeName) + ")"), 
                this.readOnly ? this.$el.addClass("readOnly") : this.$el.removeClass("readOnly"), 
                name) {
                    this.ui.title.show();
                    var titleName = "<span>" + name + "</span>";
                    this.readOnly && (titleName += '<button title="Deleted" class="btn btn-action btn-md deleteBtn"><i class="fa fa-trash"></i> Deleted</button>'), 
                    this.readOnly ? this.ui.entityIcon.addClass("disabled") : this.ui.entityIcon.removeClass("disabled"), 
                    this.ui.title.html(titleName);
                    var img = (_.extend({}, collectionJSON), this.readOnly ? '<img src="/img/entity-icon/disabled/table.png"/>' : '<img src="/img/entity-icon/table.png"/>');
                    this.ui.entityIcon.attr("title", _.escape(collectionJSON.typeName)).html(img);
                } else this.ui.title.hide();
                this.hideLoader();
                var obj = {
                    entity: collectionJSON,
                    guid: this.id,
                    entityName: name,
                    fetchCollection: this.fetchCollection.bind(that),
                    searchVent: this.searchVent,
                    attributeDefs: function() {
                        return that.getEntityDef(collectionJSON);
                    }(),
                    isRelationshipDetailPage: !0
                };
                this.renderRelationshipDetailTableLayoutView(obj), this.ui.relationshipEnd1.empty().html(this.renderRelationAttributesDetails({
                    scope: this,
                    valueObject: collectionJSON.end1,
                    isRelationshipAttribute: !0,
                    guidHyperLink: !0
                })), this.ui.relationshipEnd2.empty().html(this.renderRelationAttributesDetails({
                    scope: this,
                    valueObject: collectionJSON.end2,
                    isRelationshipAttribute: !0,
                    guidHyperLink: !0
                })), this.ui.otherAttributes.empty().html(this.renderRelationAttributesDetails({
                    scope: this,
                    valueObject: _.pick(collectionJSON, "createTime", "createdBy", "blockedPropagatedClassifications", "guid", "label", "propagateTags", "propagatedClassifications", "provenanceType", "status", "updateTime", "updatedBy", "version"),
                    isRelationshipAttribute: !0,
                    guidHyperLink: !1
                }));
            }, this), this.listenTo(this.collection, "error", function(model, response) {
                this.$(".fontLoader-relative").removeClass("show"), response.responseJSON && Utils.notifyError({
                    content: response.responseJSON.errorMessage || response.responseJSON.error
                });
            }, this);
        },
        onRender: function() {
            this.bindEvents(), Utils.showTitleLoader(this.$(".page-title .fontLoader"), this.$(".relationshipDetail")), 
            this.$(".fontLoader-relative").addClass("show");
        },
        manualRender: function(options) {
            if (options) {
                var oldId = this.id;
                _.extend(this, _.pick(options, "value", "id")), this.id !== oldId && (this.collection.url = UrlLinks.relationApiUrl({
                    guid: this.id,
                    minExtInfo: !0
                }), this.fetchCollection());
            }
        },
        onDestroy: function() {
            Utils.getUrlState.isRelationshipDetailPage() || Utils.getUrlState.isDetailPage() || $("body").removeClass("detail-page");
        },
        fetchCollection: function() {
            this.collection.fetch({
                reset: !0
            }), this.searchVent && this.searchVent.trigger("relationshipList:refresh");
        },
        getEntityDef: function(entityObj) {
            if (this.activeEntityDef) {
                var data = this.activeEntityDef.toJSON(), attributeDefs = Utils.getNestedSuperTypeObj({
                    data: data,
                    attrMerge: !0,
                    collection: this.relationshipDefCollection
                });
                return attributeDefs;
            }
            return [];
        },
        hideLoader: function() {
            Utils.hideTitleLoader(this.$(".page-title .fontLoader"), this.$(".relationshipDetail"));
        },
        showLoader: function() {
            Utils.showTitleLoader(this.$(".page-title .fontLoader"), this.$(".relationshipDetail"));
        },
        renderRelationshipDetailTableLayoutView: function(obj) {
            var that = this;
            require([ "views/entity/EntityDetailTableLayoutView" ], function(EntityDetailTableLayoutView) {
                that.RRelationshipDetailTableLayoutView.show(new EntityDetailTableLayoutView(obj));
            });
        },
        renderRelationAttributesDetails: function(options) {
            var table = CommonViewFunction.propertyTable({
                scope: options.scope,
                valueObject: options.valueObject,
                isRelationshipAttribute: options.isRelationshipAttribute,
                guidHyperLink: options.guidHyperLink
            });
            return table;
        }
    });
    return RelationshipDetailPageLayoutView;
});