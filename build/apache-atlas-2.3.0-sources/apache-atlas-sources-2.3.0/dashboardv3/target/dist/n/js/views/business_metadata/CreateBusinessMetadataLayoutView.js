define([ "require", "backbone", "hbs!tmpl/business_metadata/CreateBusinessMetadataLayoutView_tmpl", "utils/Utils", "utils/Messages", "views/business_metadata/BusinessMetadataAttributeItemView", "models/VEntity" ], function(require, Backbone, CreateBusinessMetadataLayoutViewTmpl, Utils, Messages, BusinessMetadataAttributeItemView, VEntity) {
    var CreateBusinessMetadataLayoutView = Backbone.Marionette.CompositeView.extend({
        _viewName: "CreateBusinessMetadataLayoutView",
        template: CreateBusinessMetadataLayoutViewTmpl,
        templateHelpers: function() {
            return {
                create: this.create,
                description: this.description,
                fromTable: this.fromTable,
                isEditAttr: this.isEditAttr
            };
        },
        regions: {},
        childView: BusinessMetadataAttributeItemView,
        childViewContainer: "[data-id='addAttributeDiv']",
        childViewOptions: function() {
            return {
                typeHeaders: this.typeHeaders,
                businessMetadataDefCollection: this.businessMetadataDefCollection,
                enumDefCollection: this.enumDefCollection,
                isAttrEdit: this.isAttrEdit,
                viewId: this.cid,
                collection: this.collection
            };
        },
        ui: {
            name: "[data-id='name']",
            description: "[data-id='description']",
            title: "[data-id='title']",
            attributeData: "[data-id='attributeData']",
            addAttributeDiv: "[data-id='addAttributeDiv']",
            createForm: '[data-id="createForm"]',
            businessMetadataAttrPageCancle: '[data-id="businessMetadataAttrPageCancle"]',
            businessMetadataAttrPageOk: '[data-id="businessMetadataAttrPageOk"]'
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.attributeData] = "onClickAddAttriBtn", events["click " + this.ui.businessMetadataAttrPageOk] = function(e) {
                var that = this;
                that.$el;
                "attributeEdit" == e.target.dataset.action || "addAttribute" == e.target.dataset.action ? that.onUpdateAttr() : that.onCreateBusinessMetadata();
            }, events["click " + this.ui.businessMetadataAttrPageCancle] = function(e) {
                this.options.onUpdateBusinessMetadata();
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "businessMetadataDefCollection", "selectedBusinessMetadata", "enumDefCollection", "model", "isNewBusinessMetadata", "isAttrEdit", "typeHeaders", "attrDetails")), 
            this.fromTable = !!this.isNewBusinessMetadata, this.isEditAttr = !this.isAttrEdit, 
            this.businessMetadataModel = new VEntity(), this.model ? this.description = this.model.get("description") : this.create = !0, 
            this.isNewBusinessMetadata ? this.collection = new Backbone.Collection() : this.collection = this.isAttrEdit ? new Backbone.Collection([ this.attrDetails ]) : new Backbone.Collection([ {
                name: "",
                typeName: "string",
                isOptional: !0,
                cardinality: "SINGLE",
                valuesMinCount: 0,
                valuesMaxCount: 1,
                isUnique: !1,
                isIndexable: !0
            } ]);
        },
        bindEvents: function() {},
        onRender: function() {
            var that = this;
            this.$(".fontLoader").show(), "placeholder" in HTMLInputElement.prototype || this.ui.createForm.find("input,textarea").placeholder(), 
            1 == this.isNewBusinessMetadata ? (that.ui.businessMetadataAttrPageOk.text("Create"), 
            that.ui.businessMetadataAttrPageOk.attr("data-action", "newBusinessMetadata")) : (that.ui.businessMetadataAttrPageOk.text("Save"), 
            that.ui.businessMetadataAttrPageOk.attr("data-action", "attributeEdit")), this.hideLoader();
        },
        hideLoader: function() {
            this.$(".fontLoader").hide(), this.$(".hide").removeClass("hide");
        },
        collectionAttribute: function() {
            this.collection.add(new Backbone.Model({
                name: "",
                typeName: "string",
                isOptional: !0,
                cardinality: "SINGLE",
                valuesMinCount: 0,
                valuesMaxCount: 1,
                isUnique: !1,
                isIndexable: !0
            }));
        },
        onClickAddAttriBtn: function() {
            this.collectionAttribute(), "placeholder" in HTMLInputElement.prototype || this.ui.addAttributeDiv.find("input,textarea").placeholder();
        },
        loaderStatus: function(isActive) {
            isActive ? (parent.$(".business-metadata-attr-tableOverlay").show(), parent.$(".business-metadata-attr-fontLoader").show()) : (parent.$(".business-metadata-attr-tableOverlay").hide(), 
            parent.$(".business-metadata-attr-fontLoader").hide());
        },
        validateValues: function(attributeDefs) {
            var isValidate = !0, isAttrDuplicate = !0, validationFileds = this.$el.find(".require"), attrNames = [];
            return attributeDefs && !this.isAttrEdit && (attrNames = _.map(attributeDefs, function(model) {
                return model.name.toLowerCase();
            })), validationFileds.each(function(elements) {
                $(this).removeClass("errorValidate"), "" != validationFileds[elements].value.trim() && null != validationFileds[elements].value || "none" != validationFileds[elements].style.display && ($(validationFileds[elements]).addClass("errorValidate"), 
                $(this).addClass("errorValidate"), isValidate && (isValidate = !1));
            }), isValidate && this.$el.find(".attributeInput").each(function(element) {
                var attrValue = this.value.toLowerCase();
                attrNames.indexOf(attrValue) > -1 ? (Utils.notifyInfo({
                    content: "Attribute name already exist"
                }), $(this).addClass("errorValidate"), isAttrDuplicate && (isAttrDuplicate = !1)) : attrValue.length && attrNames.push(attrValue);
            }), isValidate ? !isAttrDuplicate || void 0 : (Utils.notifyInfo({
                content: "Please fill the details"
            }), !0);
        },
        onCreateBusinessMetadata: function() {
            var that = this;
            if (!this.validateValues()) {
                this.loaderStatus(!0);
                var name = this.ui.name.val(), description = Utils.sanitizeHtmlContent({
                    data: this.ui.description.val()
                }), attributeObj = this.collection.toJSON();
                1 === this.collection.length && "" === this.collection.first().get("name") && (attributeObj = []), 
                this.json = {
                    enumDefs: [],
                    structDefs: [],
                    classificationDefs: [],
                    entityDefs: [],
                    businessMetadataDefs: [ {
                        category: "BUSINESS_METADATA",
                        createdBy: "admin",
                        updatedBy: "admin",
                        version: 1,
                        typeVersion: "1.1",
                        name: name.trim(),
                        description: description ? description.trim() : "",
                        attributeDefs: attributeObj
                    } ]
                };
                var apiObj = {
                    sort: !1,
                    data: this.json,
                    success: function(model, response) {
                        var nameSpaveDef = model.businessMetadataDefs;
                        nameSpaveDef && (that.businessMetadataDefCollection.fullCollection.add(nameSpaveDef), 
                        Utils.notifySuccess({
                            content: "Business Metadata " + name + Messages.getAbbreviationMsg(!1, "addSuccessMessage")
                        })), that.options.onUpdateBusinessMetadata(!0);
                    },
                    silent: !0,
                    reset: !0,
                    complete: function(model, status) {
                        that.loaderStatus(!1);
                    }
                };
                apiObj.type = "POST", that.businessMetadataModel.saveBusinessMetadata(apiObj);
            }
        },
        onUpdateAttr: function() {
            var that = this, selectedBusinessMetadataClone = $.extend(!0, {}, that.selectedBusinessMetadata.toJSON()), attributeDefs = selectedBusinessMetadataClone.attributeDefs;
            if (!this.validateValues(attributeDefs)) if (this.collection.length > 0) {
                this.loaderStatus(!0), void 0 === selectedBusinessMetadataClone.attributeDefs && (selectedBusinessMetadataClone.attributeDefs = []), 
                selectedBusinessMetadataClone.attributeDefs = selectedBusinessMetadataClone.attributeDefs.concat(this.collection.toJSON()), 
                this.json = {
                    enumDefs: [],
                    structDefs: [],
                    classificationDefs: [],
                    entityDefs: [],
                    businessMetadataDefs: [ selectedBusinessMetadataClone ]
                };
                var apiObj = {
                    sort: !1,
                    data: this.json,
                    success: function(model, response) {
                        Utils.notifySuccess({
                            content: "One or more Business Metadata attribute" + Messages.getAbbreviationMsg(!0, "editSuccessMessage")
                        }), model.businessMetadataDefs && model.businessMetadataDefs.length && that.selectedBusinessMetadata.set(model.businessMetadataDefs[0]), 
                        that.options.onEditCallback(), that.options.onUpdateBusinessMetadata(!0);
                    },
                    silent: !0,
                    reset: !0,
                    complete: function(model, status) {
                        that.loaderStatus(!1);
                    }
                };
                apiObj.type = "PUT", that.businessMetadataModel.saveBusinessMetadata(apiObj);
            } else Utils.notifySuccess({
                content: "No attribute updated"
            }), this.loaderStatus(!1), that.options.onUpdateBusinessMetadata();
        }
    });
    return CreateBusinessMetadataLayoutView;
});