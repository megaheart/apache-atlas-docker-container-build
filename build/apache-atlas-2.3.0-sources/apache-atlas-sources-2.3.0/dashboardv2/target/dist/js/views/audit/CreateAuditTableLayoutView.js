define([ "require", "backbone", "hbs!tmpl/audit/CreateAuditTableLayoutView_tmpl", "utils/Enums", "utils/CommonViewFunction", "utils/Utils" ], function(require, Backbone, CreateAuditTableLayoutViewTmpl, Enums, CommonViewFunction, Utils) {
    "use strict";
    var CreateAuditTableLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "CreateAuditTableLayoutView",
        template: CreateAuditTableLayoutViewTmpl,
        templateHelpers: function() {
            return {
                technicalPropPanelId: this.technicalPropId,
                relationshipPropPanelId: this.relationshipPropId,
                userdefinedPropPanelId: this.userDefinedPropId
            };
        },
        regions: {},
        ui: {
            auditValue: "[data-id='auditValue']",
            name: "[data-id='name']",
            noData: "[data-id='noData']",
            tableAudit: "[data-id='tableAudit']",
            auditHeaderValue: "[data-id='auditHeaderValue']",
            attributeDetails: "[data-id='attributeDetails']",
            attributeCard: "[data-id='attribute-card']",
            labelsDetailsTable: "[data-id='labelsDetails']",
            labelCard: "[data-id='label-card']",
            customAttributeDetails: "[data-id='customAttributeDetails']",
            customAttrCard: "[data-id='custom-attr-card']",
            relationShipAttributeDetails: "[data-id='relationShipAttributeDetails']",
            relationshipAttrCard: "[data-id='relationship-attr-card']",
            attributeDetailCard: "[data-id='attributeDetail-card']",
            detailsAttribute: "[data-id='detailsAttribute']",
            panelAttrHeading: "[data-id='panel-attr-heading']",
            nameUpdate: "[data-id='name-update']"
        },
        events: function() {
            var events = {};
            return events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "guid", "entityModel", "action", "entity", "entityName", "attributeDefs"));
            var modelID = this.entityModel.cid || parseInt(100 * Math.random());
            this.technicalPropId = this.getRandomID(modelID), this.relationshipPropId = this.getRandomID(modelID, this.technicalPropId), 
            this.userDefinedPropId = this.getRandomID(modelID, this.technicalPropId, this.userDefinedPropId);
        },
        bindEvents: function() {},
        onRender: function() {
            this.auditTableGenerate();
        },
        getRandomID: function(modelID, technicalPropId, relationshipPropId) {
            var randomIdObj = CommonViewFunction.getRandomIdAndAnchor();
            return randomIdObj.id = randomIdObj.id + modelID, randomIdObj.anchor = randomIdObj.anchor + modelID, 
            randomIdObj === technicalPropId || randomIdObj === relationshipPropId ? this.getRandomID(technicalPropId, relationshipPropId) : randomIdObj;
        },
        createTableWithValues: function(tableDetails) {
            var attrTable = CommonViewFunction.propertyTable({
                scope: this,
                getValue: function(val, key) {
                    return key && key.toLowerCase().indexOf("time") > 0 ? Utils.formatDate({
                        date: val
                    }) : val;
                },
                valueObject: tableDetails
            });
            return attrTable;
        },
        updateName: function(name) {
            this.ui.name.html("<span>Name: </span><span>" + name + "</span>");
        },
        noDetailsShow: function() {
            this.ui.noData.removeClass("hide");
        },
        auditTableGenerate: function() {
            var that = this, detailObj = this.entityModel.get("details");
            if (detailObj) if (detailObj.search(":") >= 0) {
                var parseDetailsObject = detailObj.split(":"), type = "", auditData = "";
                if (parseDetailsObject.length > 1 && (type = parseDetailsObject[0], parseDetailsObject.shift(), 
                auditData = parseDetailsObject.join(":")), auditData.search("{") === -1) "Added labels" === type.trim() || "Deleted labels" === type.trim() ? this.updateName(auditData.trim().split(" ").join(",")) : this.updateName(auditData); else try {
                    parseDetailsObject = JSON.parse(auditData);
                    var skipAttribute = parseDetailsObject.typeName ? "guid" : null, name = Utils.getName(parseDetailsObject, null, skipAttribute);
                    "-" == name && (name = _.escape(parseDetailsObject.typeName));
                    var name = name ? name : this.entityName;
                    if (that.updateName(name), parseDetailsObject) {
                        var attributesDetails = $.extend(!0, {}, parseDetailsObject.attributes), customAttr = parseDetailsObject.customAttributes, labelsDetails = parseDetailsObject.labels, relationshipAttributes = parseDetailsObject.relationshipAttributes, bmAttributesDeails = that.entity.businessAttributes ? that.entity.businessAttributes[parseDetailsObject.typeName] : null;
                        if (attributesDetails) {
                            bmAttributesDeails && _.each(Object.keys(attributesDetails), function(key) {
                                bmAttributesDeails[key].typeName.toLowerCase().indexOf("date") > -1 && (attributesDetails[key].length ? attributesDetails[key] = _.map(attributesDetails[key], function(dateValue) {
                                    return Utils.formatDate({
                                        date: dateValue
                                    });
                                }) : attributesDetails[key] = Utils.formatDate({
                                    date: attributesDetails[key]
                                }));
                            }), that.ui.attributeDetails.removeClass("hide"), that.action.indexOf("Classification") === -1 ? that.ui.panelAttrHeading.html("Technical properties ") : that.ui.panelAttrHeading.html("Properties ");
                            var attrTable = that.createTableWithValues(attributesDetails);
                            that.ui.attributeCard.html(attrTable);
                        }
                        if (!_.isEmpty(customAttr)) {
                            that.ui.customAttributeDetails.removeClass("hide");
                            var customAttrTable = that.createTableWithValues(customAttr);
                            that.ui.customAttrCard.html(customAttrTable);
                        }
                        if (!_.isEmpty(labelsDetails)) {
                            this.ui.labelsDetailsTable.removeClass("hide");
                            var labelsTable = "";
                            _.each(labelsDetails, function(value, key, list) {
                                labelsTable += "<label class='label badge-default'>" + value + "</label>";
                            }), that.ui.labelCard.html(labelsTable);
                        }
                        if (!_.isEmpty(relationshipAttributes)) {
                            that.ui.relationShipAttributeDetails.removeClass("hide");
                            var relationshipAttrTable = that.createTableWithValues(relationshipAttributes);
                            that.ui.relationshipAttrCard.html(relationshipAttrTable);
                        }
                        if (!(attributesDetails || customAttr || labelsDetails || relationshipAttributes)) {
                            that.ui.detailsAttribute.removeClass("hide");
                            var attrDetailTable = that.createTableWithValues(parseDetailsObject);
                            that.ui.attributeDetailCard.html(attrDetailTable);
                        }
                    } else that.noDetailsShow();
                } catch (err) {
                    if (_.isArray(parseDetailsObject)) var name = _.escape(parseDetailsObject[0]);
                    that.updateName(name), that.noDetailsShow();
                }
            } else "Deleted entity" != detailObj && "Purged entity" != detailObj || (this.entityName ? this.updateName(this.entityName) : this.ui.name.hide() && this.ui.noData.removeClass("hide"));
        }
    });
    return CreateAuditTableLayoutView;
});