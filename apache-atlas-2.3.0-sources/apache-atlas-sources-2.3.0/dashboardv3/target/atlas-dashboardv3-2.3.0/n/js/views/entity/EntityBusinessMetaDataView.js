define([ "require", "backbone", "hbs!tmpl/entity/EntityBusinessMetaDataView_tmpl", "views/entity/EntityBusinessMetaDataItemView", "models/VEntity", "utils/Utils", "utils/Messages", "utils/Enums", "utils/CommonViewFunction", "moment", "utils/Globals" ], function(require, Backbone, EntityBusinessMetaDataView_tmpl, EntityBusinessMetaDataItemView, VEntity, Utils, Messages, Enums, CommonViewFunction, moment, Globals) {
    "use strict";
    return Backbone.Marionette.CompositeView.extend({
        _viewName: "EntityBusinessMetaDataView",
        template: EntityBusinessMetaDataView_tmpl,
        childView: EntityBusinessMetaDataItemView,
        childViewContainer: "[data-id='itemView']",
        childViewOptions: function() {
            return {
                editMode: this.editMode,
                entity: this.entity,
                businessMetadataCollection: this.businessMetadataCollection,
                enumDefCollection: this.enumDefCollection,
                searchVent: this.searchVent
            };
        },
        templateHelpers: function() {
            return {
                readOnlyEntity: this.readOnlyEntity
            };
        },
        ui: {
            addItem: "[data-id='addItem']",
            addBusinessMetadata: "[data-id='addBusinessMetadata']",
            saveBusinessMetadata: "[data-id='saveBusinessMetadata']",
            businessMetadataTree: "[data-id='businessMetadataTree']",
            cancel: "[data-id='cancel']",
            businessMetadataHeader: ".businessMetaDataPanel .panel-heading.main-parent"
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.addItem] = "createNameElement", events["click " + this.ui.addBusinessMetadata] = "onAddBusinessMetadata", 
            events["click " + this.ui.saveBusinessMetadata] = "onSaveBusinessMetadata", events["click " + this.ui.cancel] = "onCancel", 
            events["click " + this.ui.businessMetadataHeader] = "onHeaderClick", events;
        },
        initialize: function(options) {
            var that = this;
            _.extend(this, _.pick(options, "entity", "businessMetadataCollection", "enumDefCollection", "guid", "fetchCollection", "searchVent")), 
            this.editMode = !1, this.readOnlyEntity = Enums.entityStateReadOnly[this.entity.status], 
            this.$("editBox").hide(), this.actualCollection = new Backbone.Collection(_.map(this.entity.businessAttributes, function(val, key) {
                var foundBusinessMetadata = that.businessMetadataCollection[key], businessMetadata = key;
                return foundBusinessMetadata && _.each(val, function(aVal, aKey) {
                    var foundAttr = _.find(foundBusinessMetadata, function(o) {
                        return o.name === aKey;
                    });
                    foundAttr && (val[aKey] = {
                        value: aVal,
                        typeName: foundAttr.typeName
                    }), foundAttr && "string" === foundAttr.typeName && (val[aKey].key = businessMetadata.replace(/ /g, "_") + "_" + aKey.replace(/ /g, "_"));
                }), _.extend({}, val, {
                    __internal_UI_businessMetadataName: key
                });
            })), this.collection = new Backbone.Collection(), this.entityModel = new VEntity();
        },
        onHeaderClick: function() {
            var that = this;
            $(".businessMetaDataPanel").on("hidden.bs.collapse", function(e) {
                that.ui.cancel.hide(), that.ui.saveBusinessMetadata.hide(), that.ui.addBusinessMetadata.show(), 
                that.editMode = !1, that.ui.businessMetadataTree.show(), that.$(".editBox").hide(), 
                that.updateToActualData(), that.collection && 0 === that.collection.length ? that.ui.addBusinessMetadata.text("Add") : that.ui.addBusinessMetadata.text("Edit");
            });
        },
        updateToActualData: function(options) {
            var silent = options && options.silent || !1;
            this.collection.reset($.extend(!0, [], this.actualCollection.toJSON()), {
                silent: silent
            });
        },
        onAddBusinessMetadata: function() {
            this.ui.addBusinessMetadata.hide(), this.ui.saveBusinessMetadata.show(), this.ui.cancel.show(), 
            this.editMode = !0, this.ui.businessMetadataTree.hide(), this.$(".editBox").show(), 
            this.updateToActualData({
                silent: !0
            }), 0 === this.collection.length ? this.createNameElement() : (this.collection.trigger("reset"), 
            this.searchVent.trigger("BusinessMetaAttribute:Edit")), this.panelOpenClose();
        },
        onCancel: function() {
            this.ui.cancel.hide(), this.ui.saveBusinessMetadata.hide(), this.ui.addBusinessMetadata.show(), 
            this.editMode = !1, this.ui.businessMetadataTree.show(), this.$(".editBox").hide(), 
            this.updateToActualData(), this.panelOpenClose();
        },
        panelOpenClose: function() {
            var collection = this.editMode ? this.collection : this.actualCollection, headingEl = this.$el.find(".panel-heading.main-parent");
            collection && 0 === collection.length ? this.ui.addBusinessMetadata.text("Add") : (this.ui.addBusinessMetadata.text("Edit"), 
            headingEl.hasClass("collapsed") && headingEl.click());
        },
        validate: function() {
            var validation = !0;
            return this.$el.find('.custom-col-1[data-id="value"] [data-key]').each(function(el) {
                var val = $(this).val(), elIsSelect2 = $(this).hasClass("select2-hidden-accessible");
                val && (val = Utils.sanitizeHtmlContent({
                    data: val
                })), _.isString(val) && (val = val.trim()), _.isEmpty(val) ? (validation && (validation = !1), 
                elIsSelect2 ? $(this).siblings(".select2").find(".select2-selection").attr("style", "border-color : red !important") : ($(this).css("borderColor", "red"), 
                $(this).parent().hasClass("small-texteditor") && $(this).parent().css("borderColor", "red"))) : elIsSelect2 ? $(this).siblings(".select2").find(".select2-selection").attr("style", "") : $(this).css("borderColor", "");
            }), validation;
        },
        onSaveBusinessMetadata: function() {
            var that = this;
            if (this.validate()) {
                var nData = this.generateData();
                return 0 === this.actualCollection.length && _.isEmpty(nData) ? void this.onCancel() : void this.entityModel.saveBusinessMetadataEntity(this.guid, {
                    data: JSON.stringify(nData),
                    type: "POST",
                    success: function(data) {
                        Utils.notifySuccess({
                            content: "One or more Business Metadata attribute" + Messages.getAbbreviationMsg(!0, "editSuccessMessage")
                        }), that.entity.businessAttributes = data, that.ui.businessMetadataTree.html(""), 
                        that.editMode = !1, that.fetchCollection(), that.onCancel();
                    },
                    complete: function(model, response) {}
                });
            }
        },
        generateData: function() {
            var finalObj = {};
            return this.collection.forEach(function(model) {
                if (!model.has("addAttrButton")) {
                    var businessMetadataName = model.get("__internal_UI_businessMetadataName"), modelObj = model.toJSON();
                    _.each(modelObj, function(o, k) {
                        return "isNew" === k || "__internal_UI_businessMetadataName" === k ? void delete modelObj[k] : void (_.isObject(o) && void 0 !== o.value && (modelObj[k] = o.value));
                    }), void 0 !== businessMetadataName && (finalObj[businessMetadataName] ? finalObj[businessMetadataName] = _.extend(finalObj[businessMetadataName], modelObj) : finalObj[businessMetadataName] = modelObj);
                }
            }), _.isEmpty(finalObj) && this.actualCollection.forEach(function(model) {
                var businessMetadataName = model.get("__internal_UI_businessMetadataName");
                businessMetadataName && (finalObj[businessMetadataName] = {});
            }), finalObj;
        },
        createNameElement: function(options) {
            var modelObj = {
                isNew: !0
            };
            this.collection.unshift(modelObj);
        },
        renderBusinessMetadata: function() {
            var that = this, li = "";
            this.actualCollection.forEach(function(obj) {
                var attrLi = "";
                _.each(obj.attributes, function(val, key) {
                    if ("__internal_UI_businessMetadataName" !== key) {
                        var newVal = val;
                        _.isObject(val) && !_.isUndefinedNull(val.value) && (newVal = val.value, newVal.length > 0 && val.typeName.indexOf("date") > -1 && (newVal = _.map(newVal, function(dates) {
                            return Utils.formatDate({
                                date: dates,
                                zone: !1,
                                dateFormat: Globals.dateFormat
                            });
                        })), "date" === val.typeName && (newVal = Utils.formatDate({
                            date: newVal,
                            zone: !1,
                            dateFormat: Globals.dateFormat
                        }))), attrLi += "<tr><td class='business-metadata-detail-attr-key'>" + _.escape(key) + " (" + _.escape(val.typeName) + ")</td><td>" + ("string" === val.typeName ? Utils.sanitizeHtmlContent({
                            data: newVal
                        }) : _.escape(newVal)) + "</td></tr>";
                    }
                }), li += that.associateAttributePanel(obj, attrLi);
            });
            var html = li;
            "" === html && this.readOnlyEntity === !1 && (html = '<div class="col-md-12"> No business metadata have been created yet. To add a business metadata, click <a href="javascript:void(0)" data-id="addBusinessMetadata">here</a></div>'), 
            this.ui.businessMetadataTree.html(html);
        },
        associateAttributePanel: function(obj, tableBody) {
            return '<div class="panel panel-default custom-panel expand_collapse_panel-icon no-border business-metadata-detail-attr"><div class="panel-heading" data-toggle="collapse" href="#' + _.escape(obj.get("__internal_UI_businessMetadataName")) + '" aria-expanded="true" style="width: 90%;"><h4 class="panel-title"> <a>' + _.escape(obj.get("__internal_UI_businessMetadataName")) + '</a></h4><div class="btn-group pull-left"> <button type="button" title="Collapse"><i class="ec-icon fa"></i></button></div></div><div id="' + _.escape(obj.get("__internal_UI_businessMetadataName")) + '" class="panel-collapse collapse in"><div class="panel-body"><table class="table bold-key">' + tableBody + "</table></div></div></div>";
        },
        onRender: function() {
            this.actualCollection && this.actualCollection.length && (this.$el.find(".panel-heading.main-parent").removeClass("collapsed").attr("aria-expanded", "true"), 
            this.$el.find("#businessMetadataCollapse").addClass("in").removeAttr("style"), this.ui.addBusinessMetadata.text("Edit")), 
            this.renderBusinessMetadata();
        }
    });
});