define([ "require", "backbone", "hbs!tmpl/entity/EntityUserDefineView_tmpl", "models/VEntity", "utils/Utils", "utils/Enums", "utils/Messages", "utils/CommonViewFunction" ], function(require, Backbone, EntityUserDefineView_tmpl, VEntity, Utils, Enums, Messages, CommonViewFunction) {
    "use strict";
    return Backbone.Marionette.LayoutView.extend({
        _viewName: "EntityUserDefineView",
        template: EntityUserDefineView_tmpl,
        templateHelpers: function() {
            return {
                customAttibutes: this.customAttibutes,
                readOnlyEntity: this.readOnlyEntity,
                swapItem: this.swapItem,
                saveAttrItems: this.saveAttrItems,
                divId_1: this.dynamicId_1,
                divId_2: this.dynamicId_2
            };
        },
        ui: {
            addAttr: "[data-id='addAttr']",
            saveAttrItems: "[data-id='saveAttrItems']",
            cancel: "[data-id='cancel']",
            addItem: "[data-id='addItem']",
            userDefineHeader: ".userDefinePanel .panel-heading"
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.addAttr] = "onAddAttrClick", events["click " + this.ui.addItem] = "onAddAttrClick", 
            events["click " + this.ui.saveAttrItems] = "onEditAttrClick", events["click " + this.ui.cancel] = "onCancelClick", 
            events["click " + this.ui.userDefineHeader] = "onHeaderClick", events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "entity", "customFilter", "renderAuditTableLayoutView")), 
            this.userDefineAttr = this.entity && this.entity.customAttributes || [], this.initialCall = !1, 
            this.swapItem = !1, this.saveAttrItems = !1, this.readOnlyEntity = void 0 === this.customFilter ? Enums.entityStateReadOnly[this.entity.status] : this.customFilter, 
            this.entityModel = new VEntity(this.entity), this.dynamicId_1 = CommonViewFunction.getRandomIdAndAnchor(), 
            this.dynamicId_2 = CommonViewFunction.getRandomIdAndAnchor(), this.generateTableFields();
        },
        onRender: function() {},
        renderEntityUserDefinedItems: function() {
            var that = this;
            require([ "views/entity/EntityUserDefineItemView" ], function(EntityUserDefineItemView) {
                that.itemView = new EntityUserDefineItemView({
                    items: that.customAttibutes,
                    updateButtonState: that.updateButtonState.bind(that)
                }), that.REntityUserDefinedItemView.show(that.itemView);
            });
        },
        bindEvents: {},
        addChildRegion: function() {
            this.addRegions({
                REntityUserDefinedItemView: "#r_entityUserDefinedItemView"
            }), this.renderEntityUserDefinedItems();
        },
        onHeaderClick: function() {
            var that = this;
            $(".userDefinePanel").on("hidden.bs.collapse", function() {
                that.swapItem = !1, that.saveAttrItems = !1, that.initialCall = !1, that.render(), 
                that.customAttibutes.length > 0 && ($(".userDefinePanel").find(that.ui.userDefineHeader.attr("href")).removeClass("in"), 
                that.ui.userDefineHeader.addClass("collapsed").attr("aria-expanded", !1));
            });
        },
        onAddAttrClick: function() {
            this.swapItem = !this.swapItem, void 0 === this.customFilter ? this.saveAttrItems = this.swapItem === !0 : this.saveAttrItems = !1, 
            this.initialCall = !0, this.render(), this.swapItem === !0 && this.addChildRegion();
        },
        generateTableFields: function() {
            var that = this;
            this.customAttibutes = [], _.each(Object.keys(that.userDefineAttr), function(key, i) {
                that.customAttibutes.push({
                    key: key,
                    value: that.userDefineAttr[key]
                });
            });
        },
        onEditAttrClick: function() {
            this.initialCall = !(this.customAttibutes.length > 0), this.setAttributeModal(this.itemView);
        },
        updateButtonState: function() {
            return 0 === this.customAttibutes.length && (this.swapItem = !1, this.saveAttrItems = !1, 
            this.render(), void 0);
        },
        onCancelClick: function() {
            this.initialCall = !1, this.swapItem = !1, this.saveAttrItems = !1, this.render();
        },
        structureAttributes: function(list) {
            var obj = {};
            return list.map(function(o) {
                obj[o.key] = o.value;
            }), obj;
        },
        saveAttributes: function(list) {
            var that = this, entityJson = that.entityModel.toJSON(), properties = that.structureAttributes(list);
            entityJson.customAttributes = properties;
            var payload = {
                entity: entityJson
            };
            that.entityModel.createOreditEntity({
                data: JSON.stringify(payload),
                type: "POST",
                success: function() {
                    var msg = that.initialCall ? "addSuccessMessage" : "editSuccessMessage", caption = "One or more user-defined propertie";
                    that.customAttibutes = list, 0 === list.length && (msg = "removeSuccessMessage", 
                    caption = "One or more existing user-defined propertie"), Utils.notifySuccess({
                        content: caption + Messages.getAbbreviationMsg(!0, msg)
                    }), that.swapItem = !1, that.saveAttrItems = !1, that.render(), that.renderAuditTableLayoutView && that.renderAuditTableLayoutView();
                },
                error: function(e) {
                    that.initialCall = !1, Utils.notifySuccess({
                        content: e.message
                    }), that.ui.saveAttrItems.attr("disabled", !1);
                },
                complete: function() {
                    that.ui.saveAttrItems.attr("disabled", !1), that.initialCall = !1;
                }
            });
        },
        setAttributeModal: function(itemView) {
            var self = this;
            this.ui.saveAttrItems.attr("disabled", !0);
            var list = itemView.$el.find("[data-type]"), dataList = [];
            Array.prototype.push.apply(dataList, itemView.items);
            var field = CommonViewFunction.CheckDuplicateAndEmptyInput(list, dataList);
            field.validation && !field.hasDuplicate ? self.saveAttributes(itemView.items) : this.ui.saveAttrItems.attr("disabled", !1);
        }
    });
});