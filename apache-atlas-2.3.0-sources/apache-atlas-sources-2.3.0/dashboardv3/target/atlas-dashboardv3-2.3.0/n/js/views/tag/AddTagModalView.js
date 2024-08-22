define([ "require", "hbs!tmpl/tag/AddTagModalView_tmpl", "views/tag/AddTimezoneItemView", "collection/VTagList", "collection/VCommonList", "modules/Modal", "models/VEntity", "utils/Utils", "utils/UrlLinks", "utils/Enums", "utils/Messages", "moment", "utils/Globals", "moment-timezone", "daterangepicker" ], function(require, AddTagModalViewTmpl, AddTimezoneItemView, VTagList, VCommonList, Modal, VEntity, Utils, UrlLinks, Enums, Messages, moment, Globals) {
    "use strict";
    var AddTagModel = Backbone.Marionette.CompositeView.extend({
        template: AddTagModalViewTmpl,
        templateHelpers: function() {
            return {
                tagModel: this.tagModel
            };
        },
        childView: AddTimezoneItemView,
        childViewOptions: function() {
            return {
                parentView: this,
                tagModel: this.tagModel
            };
        },
        childViewContainer: "[data-id='addTimezoneDiv']",
        regions: {},
        ui: {
            addTagOptions: "[data-id='addTagOptions']",
            tagAttribute: "[data-id='tagAttribute']",
            checkTimeZone: "[data-id='checkTimezoneProperty']",
            timeZoneDiv: "[data-id='timeZoneDiv']",
            checkTagModalPropagate: "[data-id='checkModalTagProperty']",
            addTimezoneParms: "[data-id='addTimezoneParms']",
            validityPeriodBody: "[data-id='validityPeriodBody']",
            removePropagationOnEntityDelete: "[data-id='removePropagationOnEntityDelete']",
            removePropagationOnEntityDeleteBox: "[data-id='removePropagationOnEntityDeleteBox']"
        },
        events: function() {
            var events = {}, that = this;
            return events["change " + this.ui.addTagOptions] = "onChangeTagDefination", events["change " + this.ui.checkTagModalPropagate] = function(e) {
                e.target.checked ? (that.ui.removePropagationOnEntityDeleteBox.show(), that.$(".addtag-propagte-box").removeClass("no-border")) : (that.$(".addtag-propagte-box").addClass("no-border"), 
                that.ui.removePropagationOnEntityDeleteBox.hide()), that.tagModel && that.buttonActive({
                    isButtonActive: !0
                });
            }, events["change " + this.ui.removePropagationOnEntityDelete] = function() {
                that.tagModel && that.buttonActive({
                    isButtonActive: !0
                });
            }, events["change " + this.ui.checkTimeZone] = function(e) {
                this.tagModel && this.buttonActive({
                    isButtonActive: !0
                }), e.target.checked ? (this.ui.timeZoneDiv.show(), this.ui.validityPeriodBody.show(), 
                _.isEmpty(this.collection.models) && this.collection.add(new Backbone.Model({
                    startTime: "",
                    endTime: "",
                    timeZone: ""
                }))) : (this.ui.timeZoneDiv.hide(), this.ui.validityPeriodBody.hide());
            }, events["click " + this.ui.addTimezoneParms] = "addTimezoneBtn", events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "modalCollection", "guid", "callback", "multiple", "entityCount", "showLoader", "hideLoader", "tagList", "tagModel", "enumDefCollection")), 
            this.commonCollection = new VTagList(), this.tagModel ? this.collection = new Backbone.Collection(this.tagModel.validityPeriods) : this.collection = new Backbone.Collection(), 
            this.tagCollection = options.collection;
            var that = this, modalObj = {
                title: "Add Classification",
                content: this,
                okText: "Add",
                cancelText: "Cancel",
                mainClass: "modal-lg",
                allowCancel: !0,
                okCloses: !1
            };
            this.tagModel && (modalObj.title = "Edit Classification", modalObj.okText = "Update"), 
            this.modal = new Modal(modalObj), this.modal.open(), this.modal.$el.find("button.ok").attr("disabled", !0), 
            this.on("ok", function() {
                if (this.ui.checkTimeZone.is(":checked") && this.validateValues()) return void (this.hideLoader && this.hideLoader());
                that.modal.$el.find("button.ok").showButtonLoader();
                var tagName = this.tagModel ? this.tagModel.typeName : this.ui.addTagOptions.val(), tagAttributes = {}, tagAttributeNames = this.$(".attrName"), obj = {
                    tagName: tagName,
                    tagAttributes: tagAttributes,
                    guid: [],
                    skipEntity: [],
                    deletedEntity: []
                }, isValidateAttrValue = !0, validationKey = [];
                if (tagAttributeNames.each(function(i, item) {
                    var selection = $(item).data("key"), isRequired = $(item).hasClass("required"), datatypeSelection = $(item).data("type"), $valueElement = $(item);
                    $valueElement.removeClass("errorValidate"), "date" === datatypeSelection ? tagAttributes[selection] = Date.parse($valueElement.val()) || null : isRequired ? $valueElement.val().length ? tagAttributes[selection] = $(item).val() || null : (isValidateAttrValue = !1, 
                    $valueElement.addClass("errorValidate"), validationKey.push($(item).data("key"))) : tagAttributes[selection] = $(item).val() || null;
                }), that.multiple) if (_.each(that.multiple, function(entity, i) {
                    var name = Utils.getName(entity.model);
                    Enums.entityStateReadOnly[entity.model.status] ? obj.deletedEntity.push(name) : _.indexOf(entity.model.classificationNames || _.pluck(entity.model.classifications, "typeName"), tagName) === -1 ? obj.guid.push(entity.model.guid) : obj.skipEntity.push(name);
                }), obj.deletedEntity.length && (Utils.notifyError({
                    html: !0,
                    content: "<b>" + obj.deletedEntity.join(", ") + "</b> " + (1 === obj.deletedEntity.length ? "entity " : "entities ") + Messages.assignDeletedEntity
                }), that.modal.close()), obj.skipEntity.length) {
                    var text = "<b>" + obj.skipEntity.length + " of " + that.multiple.length + "</b> entities selected have already been associated with <b>" + tagName + "</b> tag, Do you want to associate the tag with other entities ?", removeCancelButton = !1;
                    obj.skipEntity.length + obj.deletedEntity.length === that.multiple.length && (text = (obj.skipEntity.length > 1 ? "All selected" : "Selected") + " entities have already been associated with <b>" + tagName + "</b> tag", 
                    removeCancelButton = !0);
                    var notifyObj = {
                        text: text,
                        modal: !0,
                        ok: function(argument) {
                            obj.guid.length ? that.saveTagData(obj) : that.hideLoader();
                        },
                        cancel: function(argument) {
                            that.hideLoader(), obj = {
                                tagName: tagName,
                                tagAttributes: tagAttributes,
                                guid: [],
                                skipEntity: [],
                                deletedEntity: []
                            };
                        }
                    };
                    removeCancelButton && (notifyObj.confirm = {
                        confirm: !0,
                        buttons: [ {
                            text: "Ok",
                            addClass: "btn-atlas btn-md",
                            click: function(notice) {
                                notice.remove(), obj = {
                                    tagName: tagName,
                                    tagAttributes: tagAttributes,
                                    guid: [],
                                    skipEntity: [],
                                    deletedEntity: []
                                };
                            }
                        }, null ]
                    }), Utils.notifyConfirm(notifyObj);
                } else obj.guid.length ? that.saveTagData(obj) : that.hideLoader(); else {
                    if (isValidateAttrValue === !1) {
                        var validationMsg = "" + _.each(validationKey, function(key) {
                            return key + " ";
                        });
                        return that.modal.$el.find("button.ok").hideButtonLoader(), Utils.notifyInfo({
                            content: "Value for " + validationMsg + " cannot be empty"
                        }), void (this.hideLoader && this.hideLoader());
                    }
                    obj.guid.push(that.guid), that.saveTagData(obj);
                }
            }), this.on("closeModal", function() {
                this.modal.trigger("cancel");
            }), this.bindEvents();
        },
        getValue: function($item, datatypeSelection) {
            var that = this;
            return datatypeSelection && datatypeSelection.indexOf("array") >= 0 ? that.getArrayValues($item) : $item.val() || null;
        },
        getArrayValues: function($item) {
            var that = this, arrayValues = $item.val();
            return $item.hasClass("set-array") || 0 == arrayValues.length ? arrayValues || null : _.map(arrayValues, function(value) {
                var splitBy = that.guid + "_", splitedValue = value.split(splitBy);
                return splitedValue.length > 1 ? splitedValue[1] : splitedValue[0];
            });
        },
        validateValues: function(attributeDefs) {
            var isValidate = !0, applyErrorClass = function(scope) {
                "" == this.value || null == this.value || this.value.indexOf("Select Timezone") > -1 ? ($(this).addClass("errorValidate"), 
                isValidate && (isValidate = !1)) : $(this).removeClass("errorValidate");
            };
            if (this.$el.find(".start-time").each(function(element) {
                applyErrorClass.call(this);
            }), this.$el.find(".end-time").each(function(element) {
                applyErrorClass.call(this);
            }), this.$el.find(".time-zone").each(function(element) {
                applyErrorClass.call(this);
            }), !isValidate) return Utils.notifyInfo({
                content: "Please fill the details"
            }), !0;
        },
        onRender: function() {
            var that = this;
            this.propagate, this.hideAttributeBox(), this.tagsCollection(), this.tagModel && (this.fetchTagSubData(that.tagModel.typeName), 
            that.ui.checkTagModalPropagate.prop("checked", this.tagModel.propagate === !0).trigger("change"), 
            that.ui.checkTimeZone.prop("checked", !_.isEmpty(this.tagModel.validityPeriods)), 
            that.ui.removePropagationOnEntityDelete.prop("checked", 1 == this.tagModel.removePropagationsOnEntityDelete), 
            _.isEmpty(this.tagModel.validityPeriods) ? that.ui.timeZoneDiv.hide() : that.ui.timeZoneDiv.show(), 
            that.checkTimezoneProperty(that.ui.checkTimeZone[0])), that.showAttributeBox();
        },
        addTimezoneBtn: function() {
            this.ui.validityPeriodBody.show(), this.collection.add(new Backbone.Model({
                startTime: "",
                endTime: "",
                timeZone: ""
            }));
        },
        bindEvents: function() {
            this.enumArr = [], this.listenTo(this.tagCollection, "reset", function() {
                this.tagsCollection();
            }, this), this.listenTo(this.commonCollection, "reset", function() {
                this.subAttributeData();
            }, this);
        },
        tagsCollection: function() {
            var that = this, str = '<option selected="selected" disabled="disabled">-- Select a Classification from the dropdown list --</option>';
            this.tagCollection.fullCollection.each(function(obj, key) {
                var name = Utils.getName(obj.toJSON(), "name");
                _.indexOf(that.tagList, obj.get("name")) === -1 && (str += "<option " + (that.tagModel && that.tagModel.typeName === name ? "selected" : "") + ">" + name + "</option>");
            }), this.ui.addTagOptions.html(str), this.ui.addTagOptions.select2({
                placeholder: "Select Tag",
                allowClear: !1
            });
        },
        onChangeTagDefination: function() {
            this.ui.addTagOptions.select2("open").select2("close"), this.ui.tagAttribute.empty();
            var saveBtn = this.modal.$el.find("button.ok");
            saveBtn.prop("disabled", !1);
            var tagname = this.ui.addTagOptions.val();
            this.hideAttributeBox(), this.fetchTagSubData(tagname);
        },
        fetchTagSubData: function(tagname) {
            var attributeDefs = Utils.getNestedSuperTypeObj({
                data: this.tagCollection.fullCollection.find({
                    name: tagname
                }).toJSON(),
                collection: this.tagCollection,
                attrMerge: !0
            });
            this.subAttributeData(attributeDefs);
        },
        showAttributeBox: function() {
            var that = this;
            this.$(".attrLoader").hide(), this.$(".form-group.hide").removeClass("hide"), 0 !== this.ui.tagAttribute.children().length && this.ui.tagAttribute.parent().show(), 
            this.ui.tagAttribute.find("input,select").on("keyup change", function(e) {
                32 != e.keyCode && that.buttonActive({
                    isButtonActive: !0
                });
            });
        },
        buttonActive: function(option) {
            if (option) {
                var isButton = option.isButtonActive;
                this.modal.$el.find("button.ok").attr("disabled", isButton !== !0);
            }
        },
        hideAttributeBox: function() {
            this.ui.tagAttribute.children().empty(), this.ui.tagAttribute.parent().hide(), this.$(".attrLoader").show();
        },
        subAttributeData: function(attributeDefs) {
            var that = this;
            attributeDefs && (_.each(attributeDefs, function(obj) {
                var name = Utils.getName(obj, "name"), typeName = Utils.getName(obj, "typeName"), isOptional = obj.isOptional, inputClassName = "form-control attributeInputVal attrName" + (isOptional ? "" : " required"), typeNameValue = that.enumDefCollection.fullCollection.findWhere({
                    name: typeName
                });
                if (typeNameValue) {
                    var str = '<option value=""' + (that.tagModel ? "" : "selected") + ">-- Select " + typeName + " --</option>", enumValue = typeNameValue.get("elementDefs");
                    _.each(enumValue, function(key, value) {
                        str += "<option " + (that.tagModel && key.value === that.tagModel.attributes[name] ? "selected" : "") + ">" + _.escape(key.value) + "</option>";
                    }), that.ui.tagAttribute.append('<div class="form-group"><label class="' + (isOptional ? "" : " required") + '">' + name + "</label> (" + typeName + ')<select class="' + inputClassName + '" data-key="' + name + '">' + str + "</select></div>");
                } else if (0 == typeName.indexOf("array")) {
                    var arraytTypeName = new DOMParser().parseFromString(typeName, "text/html"), addCardinalityClass = inputClassName + " js-states js-example-events form-control" + ("SET" == obj.cardinality ? " set-array" : " list-array");
                    that.ui.tagAttribute.append('<div class="form-group"><label class="' + (isOptional ? "" : " required") + '">' + name + "</label> (" + typeName + ") " + obj.cardinality + '<select class="' + addCardinalityClass + '" data-id="addArryString" multiple="multiple" data-key="' + name + '" data-type="' + arraytTypeName.documentElement.textContent + '"></select></div>');
                } else {
                    var textElement = that.getElement(name, typeName, inputClassName);
                    _.isTypePrimitive(typeName) && that.ui.tagAttribute.append('<div class="form-group"><label class="' + (isOptional ? "" : " required") + '">' + name + "</label> (" + typeName + ")" + textElement + "</div>");
                }
            }), that.$('input[data-type="date"]').each(function() {
                if (!$(this).data("daterangepicker")) {
                    var dateObj = {
                        singleDatePicker: !0,
                        showDropdowns: !0,
                        timePicker: !0,
                        startDate: new Date(),
                        locale: {
                            format: Globals.dateTimeFormat
                        }
                    };
                    if (that.tagModel && this.value.length) {
                        var formatDate = Number(this.value);
                        dateObj.startDate = new Date(formatDate);
                    }
                    $(this).daterangepicker(dateObj);
                }
            }), that.$('select[data-type="boolean"]').each(function() {
                var labelName = $(this).data("key");
                that.tagModel && (this.value = that.tagModel.attributes[labelName]);
            }), that.$('select[data-type="array<string>"]').each(function() {
                var stringData = $(this).data("key");
                if (that.tagModel) {
                    var stringValues = that.tagModel.attributes[stringData] || [], str = stringValues.map(function(label) {
                        return "<option selected> " + _.escape(label) + " </option>";
                    });
                    $(this).html(str);
                }
                $(this).select2({
                    tags: !0,
                    multiple: !0,
                    createTag: function(data) {
                        var found = _.find(this.$element.select2("data"), {
                            id: data.term
                        });
                        if (!found) return {
                            id: data.term,
                            text: data.term
                        };
                    },
                    templateResult: that.formatResultSearch
                });
            }), this.showAttributeBox());
        },
        formatResultSearch: function(state) {
            if ("" != state.text.trim()) return state.id ? $("<span>Add<strong> '" + _.escape(state.text) + "'</strong></span>") : $("<span>Add<strong> '" + _.escape(state.text) + "'</strong></span>");
        },
        getElement: function(labelName, typeName, inputClassName) {
            var value = this.tagModel && this.tagModel.attributes ? this.tagModel.attributes[_.unescape(labelName)] || "" : "", isTypeNumber = "int" === typeName || "byte" === typeName || "short" === typeName || "double" === typeName || "float" === typeName;
            return isTypeNumber && (inputClassName += "int" === typeName || "byte" === typeName || "short" === typeName ? " number-input-negative" : " number-input-exponential"), 
            "boolean" === typeName ? '<select class="' + inputClassName + '" data-key="' + labelName + '" data-type="' + typeName + '"> <option value="">--Select true or false--</option><option value="true">true</option><option value="false">false</option></select>' : '<input type="text" value="' + _.escape(value) + '" class="' + inputClassName + '" data-key="' + labelName + '" data-type="' + typeName + '"/>';
        },
        checkTimezoneProperty: function(e) {
            e.checked ? (this.ui.timeZoneDiv.show(), this.ui.validityPeriodBody.show()) : (this.ui.timeZoneDiv.hide(), 
            this.ui.validityPeriodBody.hide());
        },
        saveTagData: function(options) {
            var that = this;
            this.entityModel = new VEntity();
            var tagName = options.tagName, tagAttributes = options.tagAttributes, validityPeriodVal = that.ui.checkTimeZone.is(":checked") ? that.collection.toJSON() : [], classificationData = {
                typeName: tagName,
                attributes: tagAttributes,
                propagate: that.ui.checkTagModalPropagate.is(":checked") === !0,
                removePropagationsOnEntityDelete: that.ui.removePropagationOnEntityDelete.is(":checked") === !0,
                validityPeriods: validityPeriodVal
            }, json = {
                classification: classificationData,
                entityGuids: options.guid
            };
            this.tagModel && (json = [ classificationData ]), this.showLoader && this.showLoader(), 
            this.entityModel.saveTraitsEntity(this.tagModel ? options.guid : null, {
                data: JSON.stringify(json),
                type: this.tagModel ? "PUT" : "POST",
                defaultErrorMessage: "Tag " + tagName + " could not be added",
                success: function(data) {
                    var addupdatetext = that.tagModel ? "updated successfully to " : "added to ";
                    Utils.notifySuccess({
                        content: "Classification " + tagName + " has been " + addupdatetext + (that.entityCount > 1 ? "entities" : "entity")
                    }), options.modalCollection && options.modalCollection.fetch({
                        reset: !0
                    }), that.callback && that.callback();
                },
                cust_error: function(model, response) {
                    that.modal.$el.find("button.ok").hideButtonLoader(), that.hideLoader && that.hideLoader();
                },
                complete: function() {
                    that.modal.close();
                }
            });
        }
    });
    return AddTagModel;
});