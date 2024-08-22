define([ "require", "backbone", "utils/Utils", "hbs!tmpl/entity/EntityBusinessMetaDataItemView_tmpl", "moment", "utils/Globals", "daterangepicker" ], function(require, Backbone, Utils, EntityBusinessMetaDataItemViewTmpl, moment, Globals) {
    "use strict";
    return Backbone.Marionette.ItemView.extend({
        _viewName: "EntityBusinessMetaDataItemView",
        template: EntityBusinessMetaDataItemViewTmpl,
        templateHelpers: function() {
            return {
                editMode: this.editMode,
                entity: this.entity,
                getValue: this.getValue.bind(this),
                getBusinessMetadataDroupdown: this.getBusinessMetadataDroupdown.bind(this),
                businessMetadataCollection: this.businessMetadataCollection,
                model: this.model.toJSON()
            };
        },
        tagName: "li",
        className: "business-metadata-tree-child",
        regions: {},
        ui: {
            keyEl: "[data-id='key']",
            valueEl: "[data-type='value']",
            addItem: "[data-id='addItem']",
            deleteItem: "[data-id='deleteItem']",
            editMode: "[data-id='editMode']"
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.deleteItem] = "onDeleteItem", events["change " + this.ui.keyEl] = "onAttrChange", 
            events;
        },
        initialize: function(options) {
            _.extend(this, options);
        },
        onRender: function() {
            this.ui.keyEl.val(""), this.ui.keyEl.select2({
                placeholder: "Select Attribute"
            }), this.editMode && !this.model.has("isNew") && this.getEditBusinessMetadataEl(), 
            this.initializeElement(), this.bindEvent();
        },
        initializeElement: function() {},
        bindEvent: function() {
            var that = this;
            this.editMode && (this.listenTo(this.model.collection, "destroy unset:attr", function() {
                this.model.has("isNew") && this.render();
            }), this.listenTo(this.model.collection, "selected:attr", function(value, model) {
                if (model.cid !== this.model.cid && this.model.has("isNew")) {
                    var $select2el = that.$el.find('.custom-col-1:first-child>select[data-id="key"]');
                    $select2el.find('option[value="' + value + '"]').remove();
                    $select2el.select2("val");
                    $select2el.select2({
                        placeholder: "Select Attribute"
                    }), this.model.keys().length <= 2 && $select2el.val("").trigger("change", !0);
                }
            }), this.listenTo(this.searchVent, "BusinessMetaAttribute:Edit", function() {
                _.each(that.model.attributes, function(obj) {
                    obj.key && ("string" === obj.typeName && (obj.value = Utils.sanitizeHtmlContent({
                        data: obj.value
                    })), Utils.addCustomTextEditor({
                        small: !0,
                        selector: "#" + obj.key,
                        initialHide: !1,
                        callback: function(e) {
                            var key = $(e.target).data("key"), typeName = ($(e.target).data("businessMetadata"), 
                            $(e.target).data("typename")), updateObj = that.model.toJSON();
                            _.isUndefinedNull(updateObj[key]) && (updateObj[key] = {
                                value: null,
                                typeName: typeName
                            }), updateObj[key].value = Utils.sanitizeHtmlContent({
                                selector: "#" + obj.key
                            }), that.model.set(updateObj);
                        }
                    }), $("#" + obj.key).trumbowyg("html", obj.value));
                });
            }), this.$el.off("change", ".custom-col-1[data-id='value']>[data-key]").on("change", ".custom-col-1[data-id='value']>[data-key]", function(e) {
                var key = $(this).data("key"), businessMetadata = $(this).data("businessMetadata"), typeName = $(this).data("typename"), multi = $(this).data("multi"), updateObj = that.model.toJSON();
                if (_.isUndefinedNull(updateObj[key]) && (updateObj[key] = {
                    value: null,
                    typeName: typeName
                }), updateObj[key].value = e.currentTarget.value, multi && typeName.indexOf("date") == -1 && (updateObj[key].value = $(this).select2("val")), 
                that.model.has("__internal_UI_businessMetadataName") || (updateObj.__internal_UI_businessMetadataName = businessMetadata), 
                "date" === typeName || "array<date>" === typeName) if (multi && updateObj[key].value) {
                    var dateValues = updateObj[key].value.split(","), dateStr = [];
                    dateValues.length && (_.each(dateValues, function(selectedDate) {
                        dateStr.push(new Date(selectedDate.trim()).getTime());
                    }), updateObj[key].value = dateStr);
                } else updateObj[key].value = new Date(updateObj[key].value).getTime();
                that.model.set(updateObj);
            }), this.$el.on("keypress", ".select2_only_number .select2-search__field", function() {
                var typename = $(this).parents(".select2_only_number").find("select[data-typename]").data("typename");
                ("float" !== typename && "array<float>" !== typename || 46 != event.which) && (event.which < 48 || event.which > 57) && "-" !== event.key && event.preventDefault();
            }));
        },
        getAttrElement: function(opt) {
            var that = this, returnEL = "N/A", options = $.extend(!0, {}, opt);
            if (options) {
                var key = options.key, typeName = options.val.typeName || "", val = options.val.value, isMultiValued = typeName && 0 === typeName.indexOf("array<"), businessMetadata = options.businessMetadata, allowOnlyNum = !1, isEnum = !1, elType = isMultiValued ? "select" : "input";
                if (isMultiValued || _.isEmpty(val) || (val = _.escape(val)), _.isUndefinedNull(val) || "boolean" !== typeName && "array<boolean>" !== typeName || (val = String(val)), 
                "date" === typeName || "array<date>" === typeName) if (isMultiValued && val && val.length) {
                    var dateStr = [];
                    _.each(val, function(selectedDate) {
                        selectedDate = parseInt(selectedDate), dateStr.push(Utils.formatDate({
                            date: selectedDate,
                            zone: !1,
                            dateFormat: Globals.dateFormat
                        }));
                    }), val = dateStr.join(",");
                } else !isMultiValued && val && (val = parseInt(val), val = Utils.formatDate({
                    date: val,
                    zone: !1,
                    dateFormat: Globals.dateFormat
                }));
                if ("string" === typeName || "array<string>" === typeName) "string" === typeName ? (elType = "textarea", 
                returnEL = "<" + elType + ' type="text" data-key="' + key + '" data-businessMetadata="' + businessMetadata + '" data-typename="' + typeName + '" data-multi="' + isMultiValued + '" data-tags="true"  placeholder="Enter String" class="form-control" ' + (isMultiValued !== !1 || _.isUndefinedNull(val) ? "" : 'value="' + val + '"') + "id =" + businessMetadata.replace(/ /g, "_") + "_" + key.replace(/ /g, "_") + "></" + elType + ">") : returnEL = "<" + elType + ' type="text" data-key="' + key + '" data-businessMetadata="' + businessMetadata + '" data-typename="' + typeName + '" data-multi="' + isMultiValued + '" data-tags="true"  placeholder="Enter String" class="form-control" ' + (isMultiValued !== !1 || _.isUndefinedNull(val) ? "" : 'value="' + val + '"') + "></" + elType + ">"; else if ("boolean" === typeName || "array<boolean>" === typeName) returnEL = '<select data-key="' + key + '" data-businessMetadata="' + businessMetadata + '" data-typename="' + typeName + '" data-multi="' + isMultiValued + '" class="form-control">' + (isMultiValued ? "" : '<option value="">--Select Value--</option>') + '<option value="true" ' + (_.isUndefinedNull(val) || "true" != val ? "" : "selected") + '>true</option><option value="false" ' + (_.isUndefinedNull(val) || "false" != val ? "" : "selected") + ">false</option></select>"; else if ("date" === typeName || "array<date>" === typeName) returnEL = "<" + (isMultiValued ? "textarea" : "input") + ' type="text" data-key="' + key + '" data-businessMetadata="' + businessMetadata + '" data-typename="' + typeName + '"data-multi="' + isMultiValued + '" data-type="date" class="form-control" ' + (isMultiValued !== !1 || _.isUndefinedNull(val) ? "" : 'value="' + val + '"') + ">" + (isMultiValued !== !0 || _.isUndefinedNull(val) ? "" : val) + (isMultiValued ? "</textarea>" : ""), 
                setTimeout(function() {
                    var dateObj = {
                        singleDatePicker: !0,
                        showDropdowns: !0,
                        autoUpdateInput: !isMultiValued,
                        locale: {
                            format: Globals.dateFormat
                        }
                    }, dateEl = that.$el.find('[data-type="date"][data-key="' + key + '"]').daterangepicker(dateObj);
                    isMultiValued && dateEl.on("apply.daterangepicker", function(ev, picker) {
                        var val = picker.element.val();
                        "" !== val && (val += ", "), picker.element.val(val += Utils.formatDate({
                            date: picker.startDate,
                            zone: !1,
                            dateFormat: Globals.dateFormat
                        })), that.$el.find(".custom-col-1[data-id='value']>[data-key]").trigger("change");
                    });
                }, 0); else if ("byte" === typeName || "array<byte>" === typeName || "short" === typeName || "array<short>" === typeName || "int" === typeName || "array<int>" === typeName || "float" === typeName || "array<float>" === typeName || "double" === typeName || "array<double>" === typeName || "long" === typeName || "array<long>" === typeName) allowOnlyNum = !0, 
                returnEL = "<" + elType + ' data-key="' + key + '" data-businessMetadata="' + businessMetadata + '" data-typename="' + typeName + '" type="number" data-multi="' + isMultiValued + '" data-tags="true" placeholder="Enter Number" class="form-control" ' + (_.isUndefinedNull(val) ? "" : 'value="' + val + '"') + "></" + elType + ">"; else if (typeName) {
                    isEnum = !0;
                    var modTypeName = typeName;
                    if (isMultiValued) {
                        var multipleType = typeName.match("array<(.*)>");
                        multipleType && multipleType[1] && (modTypeName = multipleType[1]);
                    }
                    var foundEnumType = this.enumDefCollection.fullCollection.find({
                        name: modTypeName
                    });
                    if (foundEnumType) {
                        var enumOptions = "";
                        _.forEach(foundEnumType.get("elementDefs"), function(obj) {
                            enumOptions += '<option value="' + _.escape(obj.value) + '">' + _.escape(obj.value) + "</option>";
                        }), returnEL = '<select data-key="' + key + '" data-businessMetadata="' + businessMetadata + '" data-typename="' + typeName + '" data-multi="' + isMultiValued + '" data-enum="true">' + enumOptions + "</select>";
                    }
                }
                (isEnum || "select" === elType) && setTimeout(function() {
                    var selectEl = that.$el.find('.custom-col-1[data-id="value"] select[data-key="' + key + '"]'), data = [];
                    data = selectEl.data("multi") ? val && val.length && (_.isArray(val) ? val : val.split(",")) || [] : _.unescape(val), 
                    allowOnlyNum && selectEl.parent().addClass("select2_only_number");
                    var opt = {
                        tags: !!selectEl.data("tags"),
                        multiple: selectEl.data("multi"),
                        createTag: function(params) {
                            var option = params.term;
                            if ($.isNumeric(option) || "array<string>" === typeName && _.isString(option)) return {
                                id: option,
                                text: option
                            };
                        }
                    };
                    selectEl.data("enum") || (opt.data = data), selectEl.select2(opt), selectEl.val(data).trigger("change");
                }, 0);
            }
            return returnEL;
        },
        onAttrChange: function(e, manual) {
            var key = e.currentTarget.value.split(":");
            if (key.length && 3 === key.length) {
                var valEl = $(e.currentTarget).parent().siblings(".custom-col-1"), hasModalData = this.model.get(key[1]);
                if (!hasModalData) {
                    var tempObj = {
                        __internal_UI_businessMetadataName: key[0]
                    };
                    this.model.has("isNew") && (tempObj.isNew = !0), tempObj[key[1]] = null, this.model.clear({
                        silent: !0
                    }).set(tempObj);
                }
                if (valEl.html(this.getAttrElement({
                    businessMetadata: key[0],
                    key: key[1],
                    val: hasModalData ? hasModalData : {
                        typeName: key[2]
                    }
                })), "string" === key[2]) {
                    var that = this, selector = "#" + key[0].replace(/ /g, "_") + "_" + key[1].replace(/ /g, "_");
                    Utils.addCustomTextEditor({
                        small: !0,
                        selector: selector,
                        initialHide: !1,
                        callback: function(e) {
                            var $parent = $(e.target), key = $parent.data("key"), typeName = ($parent.data("businessMetadata"), 
                            $parent.data("typename")), updateObj = that.model.toJSON();
                            _.isUndefinedNull(updateObj[key]) && (updateObj[key] = {
                                value: null,
                                typeName: typeName
                            }), updateObj[key].value = Utils.sanitizeHtmlContent({
                                selector: selector
                            }), that.model.set(updateObj);
                        }
                    }), hasModalData && hasModalData.value && $(selector).trumbowyg("html", hasModalData.value);
                }
                void 0 === manual && this.model.collection.trigger("selected:attr", e.currentTarget.value, this.model);
            }
        },
        getValue: function(value, key, businessMetadataName) {
            var typeName = value.typeName, value = value.value;
            return "date" === typeName ? Utils.formatDate({
                date: value,
                zone: !1,
                dateFormat: Globals.dateFormat
            }) : value;
        },
        getBusinessMetadataDroupdown: function(businessMetadataCollection) {
            var optgroup = "", that = this, model = that.model.omit([ "isNew", "__internal_UI_businessMetadataName" ]), keys = _.keys(model), isSelected = !1, selectdVal = null;
            return 1 === keys.length && (isSelected = !0), _.each(businessMetadataCollection, function(obj, key) {
                var options = "";
                obj.length && (_.each(obj, function(attrObj) {
                    var entityBusinessMetadata = that.model.collection.filter({
                        __internal_UI_businessMetadataName: key
                    }), hasAttr = !1;
                    if (entityBusinessMetadata) {
                        var found = entityBusinessMetadata.find(function(eObj) {
                            return eObj.attributes.hasOwnProperty(attrObj.name);
                        });
                        found && (hasAttr = !0);
                    }
                    if (isSelected && keys[0] === attrObj.name || !hasAttr) {
                        var value = key + ":" + attrObj.name + ":" + attrObj.typeName;
                        isSelected && keys[0] === attrObj.name && (selectdVal = value), options += '<option value="' + value + '">' + attrObj.name + " (" + _.escape(attrObj.typeName) + ")</option>";
                    }
                }), options.length && (optgroup += '<optgroup label="' + key + '">' + options + "</optgroup>"));
            }), setTimeout(function() {
                selectdVal ? that.$el.find('.custom-col-1:first-child>select[data-id="key"]').val(selectdVal).trigger("change", !0) : that.$el.find('.custom-col-1:first-child>select[data-id="key"]').val("").trigger("change", !0);
            }, 0), '<select data-id="key">' + optgroup + "</select>";
        },
        getEditBusinessMetadataEl: function() {
            var that = this, trs = "";
            _.each(this.model.attributes, function(val, key) {
                if ("__internal_UI_businessMetadataName" !== key && "isNew" !== key) {
                    var td = '<td class="custom-col-1" data-key="' + key + '">' + key + " (" + _.escape(val.typeName) + ')</td><td class="custom-col-0">:</td><td class="custom-col-1" data-id="value">' + that.getAttrElement({
                        businessMetadata: that.model.get("__internal_UI_businessMetadataName"),
                        key: key,
                        val: val
                    }) + "</td>";
                    td += '<td class="custom-col-2 btn-group"><button class="btn btn-default btn-sm" data-key="' + key + '" data-id="deleteItem"><i class="fa fa-times"> </i></button></td>', 
                    trs += "<tr class='custom-tr'>" + td + "</tr>";
                }
            }), this.$("[data-id='businessMetadataTreeChild']").html("<table class='custom-table'>" + trs + "</table>");
        },
        onDeleteItem: function(e) {
            var key = $(e.currentTarget).data("key");
            this.model.has(key) ? 2 === this.model.keys().length ? this.model.destroy() : (this.model.unset(key), 
            this.model.has("isNew") || this.$el.find("tr>td:first-child[data-key='" + key + "']").parent().remove(), 
            this.model.collection.trigger("unset:attr")) : this.model.destroy();
        }
    });
});