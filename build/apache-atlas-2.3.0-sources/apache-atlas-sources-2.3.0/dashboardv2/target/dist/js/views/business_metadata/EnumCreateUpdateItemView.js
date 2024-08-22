define([ "require", "backbone", "hbs!tmpl/business_metadata/EnumCreateUpdateItemView_tmpl", "utils/Utils", "utils/UrlLinks" ], function(require, Backbone, EnumCreateUpdateItemViewTmpl, Utils, UrlLinks) {
    "use strict";
    return Backbone.Marionette.ItemView.extend({
        template: EnumCreateUpdateItemViewTmpl,
        regions: {},
        ui: {
            enumTypeSelectorContainer: "[data-id='enumTypeSelectorContainer']",
            enumSelector: "[data-id='enumSelector']",
            enumValueSelectorContainer: "[data-id='enumValueSelectorContainer']",
            valueSelector: "[data-id='valueSelector']",
            enumCancleBtn: "[data-id='enumCancleBtn']",
            enumOkBtn: "[data-id='enumOkBtn']"
        },
        events: function() {
            var events = {};
            return events["change " + this.ui.enumSelector] = function(e) {
                this.model.set({
                    enumValues: e.target.value.trim()
                });
            }, events["change " + this.ui.enumSelector] = function(e) {
                var emumValue = this.ui.enumSelector.select2("data")[0] ? this.ui.enumSelector.select2("data")[0].text : this.ui.enumSelector.val();
                "" == emumValue || null == emumValue ? this.ui.enumValueSelectorContainer.hide() : (this.ui.enumValueSelectorContainer.show(), 
                this.showEnumValues(emumValue));
            }, events["change " + this.ui.valueSelector] = function(e) {}, events["click " + this.ui.enumCancleBtn] = function(e) {
                return this.options.closeModal ? void this.options.closeModal() : (this.ui.enumValueSelectorContainer.hide(), 
                this.ui.enumSelector.val("").trigger("change"), void this.ui.enumCancleBtn.attr("disabled", "true"));
            }, events["click " + this.ui.enumOkBtn] = function(e) {
                this.ui.enumCancleBtn.attr("disabled", "true"), this.onUpdateEnum();
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "businessMetadataDefCollection", "enumDefCollection"));
        },
        onRender: function() {
            this.ui.enumValueSelectorContainer.hide(), this.bindEvents(), this.emumTypeSelectDisplay(), 
            this.options.closeModal || (this.ui.enumCancleBtn.attr("disabled", "true"), this.ui.enumCancleBtn.text("Clear"));
        },
        bindEvents: function() {
            var that = this;
            this.listenTo(this.enumDefCollection, "reset", function() {
                that.emumTypeSelectDisplay();
            });
        },
        showEnumValues: function(enumName) {
            var enumValues = "", selectedValues = [], selectedEnum = this.enumDefCollection.fullCollection.findWhere({
                name: enumName
            }), selectedEnumValues = selectedEnum ? selectedEnum.get("elementDefs") : null;
            _.each(selectedEnumValues, function(enumVal, index) {
                selectedValues.push(enumVal.value), enumValues += "<option>" + _.escape(enumVal.value) + "</option>";
            }), this.ui.enumCancleBtn.removeAttr("disabled"), this.ui.valueSelector.empty(), 
            this.ui.valueSelector.append(enumValues), this.ui.valueSelector.val(selectedValues), 
            this.ui.valueSelector.select2({
                placeholder: "Select Enum value",
                allowClear: !1,
                tags: !0,
                multiple: !0
            });
        },
        emumTypeSelectDisplay: function() {
            var enumTypes = "";
            this.enumDefCollection.fullCollection.each(function(model, index) {
                enumTypes += "<option>" + _.escape(model.get("name")) + "</option>";
            }), this.ui.enumSelector.empty(), this.ui.enumSelector.append(enumTypes), this.ui.enumSelector.val(""), 
            this.ui.enumSelector.select2({
                placeholder: "Select Enum name",
                tags: !0,
                allowClear: !0,
                multiple: !1,
                templateResult: this.formatSearchResult
            });
        },
        formatSearchResult: function(state) {
            return state.id ? state.element ? $("<span>" + _.escape(state.text) + "</span>") : $("<span>Create new enum : <strong> " + _.escape(state.text) + "</strong></span>") : state.text;
        },
        validationEnum: function() {
            var selectedEnumName = this.ui.enumSelector.val(), selectedEnumValues = this.ui.valueSelector.val();
            return "" == selectedEnumName || null == selectedEnumName ? (this.ui.enumOkBtn.hideButtonLoader(), 
            Utils.notifyInfo({
                content: "Please enter the Enumeration Name"
            }), !0) : "" == selectedEnumValues || null == selectedEnumValues ? (this.ui.enumOkBtn.hideButtonLoader(), 
            Utils.notifyInfo({
                content: "Please  enter the Enum values"
            }), !0) : void 0;
        },
        onUpdateEnum: function(view, modal) {
            var that = this, selectedEnumName = this.ui.enumSelector.val(), selectedEnumValues = this.ui.valueSelector.val(), enumName = this.enumDefCollection.fullCollection.findWhere({
                name: selectedEnumName
            }), isPutCall = !1, isPostCallEnum = !1, enumDefs = [];
            if (!this.validationEnum()) {
                if (this.ui.enumOkBtn.showButtonLoader(), this.ui.enumSelector.attr("disabled", "true"), 
                this.ui.valueSelector.attr("disabled", "true"), this.ui.enumCancleBtn.attr("disabled", "true"), 
                enumName) {
                    var enumDef = enumName.get("elementDefs");
                    enumDef.length === selectedEnumValues.length ? _.each(enumDef, function(enumVal, index) {
                        selectedEnumValues.indexOf(enumVal.value) === -1 && (isPutCall = !0);
                    }) : isPutCall = !0;
                } else isPostCallEnum = !0;
                var elementValues = [];
                _.each(selectedEnumValues, function(inputEnumVal, index) {
                    elementValues.push({
                        ordinal: index + 1,
                        value: inputEnumVal
                    });
                }), enumDefs.push({
                    name: selectedEnumName,
                    elementDefs: elementValues
                }), this.json = {
                    enumDefs: enumDefs
                };
                var apiObj = {
                    sort: !1,
                    success: function(model, response) {
                        if (that.ui.enumValueSelectorContainer.hide(), isPostCallEnum) that.enumDefCollection.add(model.enumDefs[0]), 
                        Utils.notifySuccess({
                            content: "Enumeration " + selectedEnumName + " added successfully"
                        }); else {
                            var foundEnum = that.enumDefCollection.fullCollection.find({
                                guid: model.enumDefs[0].guid
                            });
                            foundEnum && foundEnum.set(model.enumDefs[0]), Utils.notifySuccess({
                                content: "Enumeration " + selectedEnumName + " updated successfully"
                            });
                        }
                        that.enumDefCollection.fetch({
                            reset: !0
                        }), that.options.onUpdateEnum && that.options.onUpdateEnum(), that.ui.enumCancleBtn.attr("disabled", "true");
                    },
                    silent: !0,
                    reset: !0,
                    complete: function(model, status) {
                        that.emumTypeSelectDisplay(), that.ui.enumOkBtn.hideButtonLoader(), that.ui.enumSelector.removeAttr("disabled"), 
                        that.ui.valueSelector.removeAttr("disabled"), that.options.closeModal && that.options.closeModal();
                    }
                };
                $.extend(apiObj, {
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(this.json)
                }), isPostCallEnum ? this.businessMetadataDefCollection.constructor.nonCrudOperation.call(this, UrlLinks.typedefsUrl().defs, "POST", apiObj) : isPutCall ? this.businessMetadataDefCollection.constructor.nonCrudOperation.call(this, UrlLinks.typedefsUrl().defs, "PUT", apiObj) : (Utils.notifySuccess({
                    content: "No updated values"
                }), that.ui.enumOkBtn.hideButtonLoader(), that.ui.enumSelector.removeAttr("disabled"), 
                that.ui.valueSelector.removeAttr("disabled"), that.options.closeModal && that.options.closeModal());
            }
        }
    });
});