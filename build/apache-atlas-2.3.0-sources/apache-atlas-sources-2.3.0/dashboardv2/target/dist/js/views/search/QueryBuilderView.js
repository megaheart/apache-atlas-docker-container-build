define([ "require", "backbone", "hbs!tmpl/search/QueryBuilder_tmpl", "hbs!tmpl/search/UserDefine_tmpl", "utils/Utils", "utils/CommonViewFunction", "utils/Enums", "utils/Globals", "moment", "query-builder", "daterangepicker" ], function(require, Backbone, QueryBuilderTmpl, UserDefineTmpl, Utils, CommonViewFunction, Enums, Globals, moment) {
    var QueryBuilderView = Backbone.Marionette.LayoutView.extend({
        _viewName: "QueryBuilderView",
        template: QueryBuilderTmpl,
        regions: {},
        ui: {
            builder: "#builder"
        },
        events: function() {
            var events = {};
            return events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "attrObj", "value", "typeHeaders", "entityDefCollection", "enumDefCollection", "classificationDefCollection", "businessMetadataDefCollection", "tag", "type", "searchTableFilters", "systemAttrArr", "adminAttrFilters", "relationship")), 
            this.attrObj = _.sortBy(this.attrObj, "name"), this.filterType = this.tag ? "tagFilters" : "entityFilters", 
            this.defaultRange = "Last 7 Days", this.relationship && (this.filterType = "relationshipFilters"), 
            this.dateRangesMap = {
                Today: [ moment(), moment() ],
                Yesterday: [ moment().subtract(1, "days"), moment().subtract(1, "days") ],
                "Last 7 Days": [ moment().subtract(6, "days"), moment() ],
                "Last 30 Days": [ moment().subtract(29, "days"), moment() ],
                "This Month": [ moment().startOf("month"), moment().endOf("month") ],
                "Last Month": [ moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month") ],
                "Last 3 Months": [ moment().subtract(3, "month").startOf("month"), moment().subtract(1, "month").endOf("month") ],
                "Last 6 Months": [ moment().subtract(6, "month").startOf("month"), moment().subtract(1, "month").endOf("month") ],
                "Last 12 Months": [ moment().subtract(12, "month").startOf("month"), moment().subtract(1, "month").endOf("month") ],
                "This Quarter": [ moment().startOf("quarter"), moment().endOf("quarter") ],
                "Last Quarter": [ moment().subtract(1, "quarter").startOf("quarter"), moment().subtract(1, "quarter").endOf("quarter") ],
                "This Year": [ moment().startOf("year"), moment().endOf("year") ],
                "Last Year": [ moment().subtract(1, "year").startOf("year"), moment().subtract(1, "year").endOf("year") ]
            };
        },
        bindEvents: function() {},
        getOperator: function(type, skipDefault) {
            var obj = {
                operators: null
            };
            return "string" === type && (obj.operators = [ "=", "!=", "contains", "begins_with", "ends_with" ], 
            this.adminAttrFilters && (obj.operators = obj.operators.concat([ "like", "in" ]))), 
            "date" === type && (obj.operators = [ "=", "!=", ">", "<", ">=", "<=", "TIME_RANGE" ]), 
            "int" !== type && "byte" !== type && "short" !== type && "long" !== type && "float" !== type && "double" !== type || (obj.operators = [ "=", "!=", ">", "<", ">=", "<=" ]), 
            "enum" !== type && "boolean" !== type || (obj.operators = [ "=", "!=" ]), _.isEmpty(skipDefault) && obj.operators && (obj.operators = obj.operators.concat([ "is_null", "not_null" ])), 
            obj;
        },
        isPrimitive: function(type) {
            return "int" === type || "byte" === type || "short" === type || "long" === type || "float" === type || "double" === type || "string" === type || "boolean" === type || "date" === type;
        },
        getUserDefineInput: function() {
            return UserDefineTmpl();
        },
        getObjDef: function(attrObj, rules, isGroup, groupType, isSystemAttr) {
            var that = this;
            if ("__classificationsText" !== attrObj.name && "__historicalGuids" !== attrObj.name) {
                var getLableWithType = function(label, name) {
                    return "__classificationNames" === name || "__customAttributes" === name || "__labels" === name || "__propagatedClassificationNames" === name ? label : label + " (" + attrObj.typeName + ")";
                }, label = Enums.systemAttributes[attrObj.name] ? Enums.systemAttributes[attrObj.name] : _.escape(attrObj.name), obj = {
                    id: attrObj.name,
                    label: getLableWithType(label, attrObj.name),
                    plainLabel: label,
                    type: _.escape(attrObj.typeName),
                    validation: {
                        callback: function(value, rule) {
                            return rule.operator.nb_inputs === !1 || !_.isEmpty(value) || !value instanceof Error || (value instanceof Error ? value.message : rule.filter.plainLabel + " is required");
                        }
                    }
                };
                if (isGroup && (obj.optgroup = groupType), isSystemAttr && "__isIncomplete" === attrObj.name || isSystemAttr && "IsIncomplete" === attrObj.name) return obj.type = "boolean", 
                obj.label = (Enums.systemAttributes[attrObj.name] ? Enums.systemAttributes[attrObj.name] : _.escape(attrObj.name.capitalize())) + " (boolean)", 
                obj.input = "select", obj.values = [ {
                    1: "true"
                }, {
                    0: "false"
                } ], _.extend(obj, this.getOperator("boolean")), obj;
                if (isSystemAttr && "Status" === attrObj.name || isSystemAttr && "__state" === attrObj.name || isSystemAttr && "__entityStatus" === attrObj.name) return obj.label = (Enums.systemAttributes[attrObj.name] ? Enums.systemAttributes[attrObj.name] : _.escape(attrObj.name.capitalize())) + " (enum)", 
                obj.input = "select", obj.values = [ "ACTIVE", "DELETED" ], _.extend(obj, this.getOperator("boolean", !0)), 
                obj;
                if (isSystemAttr && "__classificationNames" === attrObj.name || "__propagatedClassificationNames" === attrObj.name) return obj.plugin = "select2", 
                obj.input = "select", obj.plugin_config = {
                    placeholder: "Select classfication",
                    tags: !0,
                    multiple: !1,
                    data: this.classificationDefCollection.fullCollection.models.map(function(o) {
                        return {
                            id: o.get("name"),
                            text: o.get("name")
                        };
                    })
                }, obj.valueSetter = function(rule) {
                    if (rule && !_.isEmpty(rule.value)) {
                        var selectEl = rule.$el.find(".rule-value-container select"), valFound = that.classificationDefCollection.fullCollection.find(function(o) {
                            return o.get("name") === rule.value;
                        });
                        if (valFound) selectEl.val(rule.value).trigger("change"); else {
                            var newOption = new Option(rule.value, rule.value, !1, !1);
                            selectEl.append(newOption).val(rule.value);
                        }
                    }
                }, _.extend(obj, this.getOperator("string")), obj;
                if (isSystemAttr && "__customAttributes" === attrObj.name) return obj.input = function(rule) {
                    return rule && rule.operator && rule.operator.nb_inputs ? that.getUserDefineInput() : null;
                }, obj.valueGetter = function(rule) {
                    if (rule && rule.operator && "contains" === rule.operator.type) {
                        var $el = rule.$el.find(".rule-value-container"), key = $el.find("[data-type='key']").val(), val = $el.find("[data-type='value']").val();
                        return _.isEmpty(key) || _.isEmpty(val) ? new Error("Key & Value is Required") : key + "=" + val;
                    }
                    return [];
                }, obj.valueSetter = function(rule) {
                    if (rule && !rule.$el.hasClass("user-define") && rule.$el.addClass("user-define"), 
                    rule && rule.value && rule.value.length && !(rule.value instanceof Error)) {
                        var $el = rule.$el.find(".rule-value-container"), value = rule.value.split("=");
                        value && ($el.find("[data-type='key']").val(value[0]), $el.find("[data-type='value']").val(value[1]));
                    }
                }, obj.operators = [ "contains", "is_null", "not_null" ], obj;
                if (isSystemAttr && "__typeName" === attrObj.name) {
                    var entityType = [];
                    return that.typeHeaders.fullCollection.each(function(model) {
                        (1 == that.type && "ENTITY" == model.get("category") || 1 == that.tag && "CLASSIFICATION" == model.get("category")) && entityType.push({
                            id: model.get("name"),
                            text: model.get("name")
                        });
                    }), obj.plugin = "select2", obj.input = "select", obj.plugin_config = {
                        placeholder: "Select type",
                        tags: !0,
                        multiple: !1,
                        data: entityType
                    }, obj.valueSetter = function(rule) {
                        if (rule && !_.isEmpty(rule.value)) {
                            var selectEl = rule.$el.find(".rule-value-container select"), valFound = that.typeHeaders.fullCollection.find(function(o) {
                                return o.get("name") === rule.value;
                            });
                            if (valFound) selectEl.val(rule.value).trigger("change"); else {
                                var newOption = new Option(rule.value, rule.value, !1, !1);
                                selectEl.append(newOption).val(rule.value);
                            }
                        }
                    }, _.extend(obj, this.getOperator("string")), obj;
                }
                if ("date" === obj.type) return obj.plugin = "daterangepicker", obj.plugin_config = this.getDateConfig(rules, obj.id), 
                _.extend(obj, this.getOperator(obj.type)), obj;
                if (this.isPrimitive(obj.type)) return "boolean" === obj.type && (obj.input = "select", 
                obj.values = [ "true", "false" ]), _.extend(obj, this.getOperator(obj.type, !1)), 
                _.has(Enums.regex.RANGE_CHECK, obj.type) && (obj.validation = {
                    min: Enums.regex.RANGE_CHECK[obj.type].min,
                    max: Enums.regex.RANGE_CHECK[obj.type].max
                }, "double" === obj.type || "float" === obj.type ? obj.type = "double" : "int" !== obj.type && "byte" !== obj.type && "short" !== obj.type && "long" !== obj.type || (obj.type = "integer")), 
                obj;
                var enumObj = this.enumDefCollection.fullCollection.find({
                    name: obj.type
                });
                if (enumObj) {
                    obj.type = "string", obj.input = "select";
                    var value = [];
                    return _.each(enumObj.get("elementDefs"), function(o) {
                        value.push(o.value);
                    }), obj.values = value, _.extend(obj, this.getOperator("enum")), obj;
                }
            }
        },
        getDateConfig: function(ruleObj, id, operator) {
            var valueObj = ruleObj ? _.find(ruleObj.rules, {
                id: id
            }) || {} : {}, isTimeRange = valueObj.operator && "TIME_RANGE" === valueObj.operator && "TIME_RANGE" === operator || "TIME_RANGE" === operator, obj = {
                opens: "center",
                autoApply: !0,
                autoUpdateInput: !1,
                timePickerSeconds: !0,
                timePicker: !0,
                locale: {
                    format: Globals.dateTimeFormat
                }
            };
            if (isTimeRange) {
                var defaultRangeDate = this.dateRangesMap[this.defaultRange];
                obj.startDate = defaultRangeDate[0], obj.endDate = defaultRangeDate[1], obj.singleDatePicker = !1, 
                obj.ranges = this.dateRangesMap;
            } else obj.singleDatePicker = !0, obj.startDate = moment(), obj.endDate = obj.startDate;
            if (!_.isEmpty(valueObj) && operator === valueObj.operator) if (isTimeRange) {
                if (valueObj.value.indexOf("-") > -1) {
                    var dates = valueObj.value.split("-");
                    obj.startDate = dates[0].trim(), obj.endDate = dates[1].trim();
                } else {
                    var dates = this.dateRangesMap[valueObj.value];
                    obj.startDate = dates[0], obj.endDate = dates[1];
                }
                obj.singleDatePicker = !1;
            } else obj.startDate = moment(Date.parse(valueObj.value)), obj.endDate = obj.startDate, 
            obj.singleDatePicker = !0;
            return obj;
        },
        setDateValue: function(rule, rules_widgets) {
            if ("date" === rule.filter.type && rule.operator.nb_inputs) {
                var inputEl = rule.$el.find(".rule-value-container").find("input"), datepickerEl = rule.$el.find(".rule-value-container").find("input").data("daterangepicker");
                if (inputEl.attr("readonly", !0), datepickerEl) {
                    datepickerEl.remove();
                    var configObj = this.getDateConfig(rules_widgets, rule.filter.id, rule.operator.type);
                    inputEl.daterangepicker(configObj), "TIME_RANGE" === rule.operator.type ? rule.value = this.defaultRange : rule.value = configObj.startDate.format(Globals.dateTimeFormat), 
                    inputEl.on("apply.daterangepicker", function(ev, picker) {
                        picker.setStartDate(picker.startDate), picker.setEndDate(picker.endDate);
                        var valueString = "";
                        valueString = picker.chosenLabel ? "Custom Range" === picker.chosenLabel ? picker.startDate.format(Globals.dateTimeFormat) + " - " + picker.endDate.format(Globals.dateTimeFormat) : picker.chosenLabel : picker.startDate.format(Globals.dateTimeFormat), 
                        picker.element.val(valueString), rule.value = valueString;
                    });
                }
            }
        },
        onRender: function() {
            var that = this, filters = [], isGroupView = !0, placeHolder = "--Select Attribute--", rules_widgets = null;
            if (this.adminAttrFilters) {
                var entityDef = this.entityDefCollection.fullCollection.find({
                    name: "__AtlasAuditEntry"
                }), auditEntryAttributeDefs = null;
                entityDef && (auditEntryAttributeDefs = $.extend(!0, {}, entityDef.get("attributeDefs")) || null), 
                auditEntryAttributeDefs && _.each(auditEntryAttributeDefs, function(attributes) {
                    var returnObj = that.getObjDef(attributes, rules_widgets);
                    returnObj && filters.push(returnObj);
                }), rules_widgets = CommonViewFunction.attributeFilter.extractUrl({
                    value: this.searchTableFilters ? this.searchTableFilters.adminAttrFilters : null,
                    formatDate: !0
                });
            } else {
                this.value && (rules_widgets = CommonViewFunction.attributeFilter.extractUrl({
                    value: this.searchTableFilters[this.filterType][(this.tag ? this.value.tag : this.value.type) || this.value.relationshipName],
                    formatDate: !0
                })), _.each(this.attrObj, function(obj) {
                    var type = that.tag ? that.value.tag : that.value.type;
                    that.value.relationshipName && (type = that.value.relationshipName);
                    var returnObj = that.getObjDef(obj, rules_widgets, isGroupView, type + " Attribute");
                    returnObj && filters.push(returnObj);
                });
                var sortMap = {
                    __guid: 1,
                    __typeName: 2,
                    __timestamp: 3,
                    __modificationTimestamp: 4,
                    __createdBy: 5,
                    __modifiedBy: 6,
                    __isIncomplete: 7,
                    __classificationNames: 9,
                    __propagatedClassificationNames: 10,
                    __labels: 11,
                    __customAttributes: 12
                };
                if (that.type ? sortMap.__state = 8 : sortMap.__entityStatus = 8, this.systemAttrArr = _.sortBy(this.systemAttrArr, function(obj) {
                    return sortMap[obj.name];
                }), _.each(this.systemAttrArr, function(obj) {
                    var returnObj = that.getObjDef(obj, rules_widgets, isGroupView, "System Attribute", !0);
                    returnObj && filters.push(returnObj);
                }), this.type) {
                    var pushBusinessMetadataFilter = function(sortedAttributes, businessMetadataKey) {
                        _.each(sortedAttributes, function(attrDetails) {
                            var returnObj = that.getObjDef(attrDetails, rules_widgets, isGroupView, "Business Attributes: " + businessMetadataKey);
                            returnObj && (returnObj.id = businessMetadataKey + "." + returnObj.id, returnObj.label = returnObj.label, 
                            returnObj.data = {
                                entityType: "businessMetadata"
                            }, filters.push(returnObj));
                        });
                    };
                    if ("_ALL_ENTITY_TYPES" == this.value.type) this.businessMetadataDefCollection.each(function(model) {
                        var sortedAttributes = model.get("attributeDefs");
                        sortedAttributes = _.sortBy(sortedAttributes, function(obj) {
                            return obj.name;
                        }), pushBusinessMetadataFilter(sortedAttributes, model.get("name"));
                    }); else {
                        var entityDef = this.entityDefCollection.fullCollection.find({
                            name: this.value.type
                        }), businessMetadataAttributeDefs = null;
                        entityDef && (businessMetadataAttributeDefs = entityDef.get("businessAttributeDefs")), 
                        businessMetadataAttributeDefs && _.each(businessMetadataAttributeDefs, function(attributes, key) {
                            var sortedAttributes = _.sortBy(attributes, function(obj) {
                                return obj.name;
                            });
                            pushBusinessMetadataFilter(sortedAttributes, key);
                        });
                    }
                }
            }
            if (filters = _.uniq(filters, "id"), filters && !_.isEmpty(filters)) {
                this.ui.builder.off().on("afterUpdateRuleOperator.queryBuilder", function(e, rule) {
                    that.setDateValue(rule, rules_widgets);
                }).queryBuilder({
                    plugins: [ "bt-tooltip-errors" ],
                    filters: filters,
                    select_placeholder: placeHolder,
                    allow_empty: !0,
                    conditions: [ "AND", "OR" ],
                    allow_groups: !0,
                    allow_empty: !0,
                    templates: {
                        rule: '<div id="{{= it.rule_id }}" class="rule-container">                                       <div class="values-box"><div class="rule-filter-container"></div>                                       <div class="rule-operator-container"></div>                                       <div class="rule-value-container"></div></div>                                       <div class="action-box"><div class="rule-header">                                         <div class="btn-group rule-actions">                                           <button type="button" class="btn btn-xs btn-danger" data-delete="rule">                                             <i class="{{= it.icons.remove_rule }}"></i>                                           </button>                                         </div>                                       </div> </div>                                      {{? it.settings.display_errors }}                                         <div class="error-container"><i class="{{= it.icons.error }}"></i>&nbsp;<span></span></div>                                       {{?}}                                 </div>'
                    },
                    operators: [ {
                        type: "=",
                        nb_inputs: 1,
                        multiple: !1,
                        apply_to: [ "number", "string", "boolean", "enum" ]
                    }, {
                        type: "!=",
                        nb_inputs: 1,
                        multiple: !1,
                        apply_to: [ "number", "string", "boolean", "enum" ]
                    }, {
                        type: ">",
                        nb_inputs: 1,
                        multiple: !1,
                        apply_to: [ "number", "string", "boolean" ]
                    }, {
                        type: "<",
                        nb_inputs: 1,
                        multiple: !1,
                        apply_to: [ "number", "string", "boolean" ]
                    }, {
                        type: ">=",
                        nb_inputs: 1,
                        multiple: !1,
                        apply_to: [ "number", "string", "boolean" ]
                    }, {
                        type: "<=",
                        nb_inputs: 1,
                        multiple: !1,
                        apply_to: [ "number", "string", "boolean" ]
                    }, {
                        type: "contains",
                        nb_inputs: 1,
                        multiple: !1,
                        apply_to: [ "string" ]
                    }, {
                        type: "like",
                        nb_inputs: 1,
                        multiple: !1,
                        apply_to: [ "string" ]
                    }, {
                        type: "in",
                        nb_inputs: 1,
                        multiple: !1,
                        apply_to: [ "string" ]
                    }, {
                        type: "begins_with",
                        nb_inputs: 1,
                        multiple: !1,
                        apply_to: [ "string" ]
                    }, {
                        type: "ends_with",
                        nb_inputs: 1,
                        multiple: !1,
                        apply_to: [ "string" ]
                    }, {
                        type: "is_null",
                        nb_inputs: !1,
                        multiple: !1,
                        apply_to: [ "number", "string", "boolean", "enum" ]
                    }, {
                        type: "not_null",
                        nb_inputs: !1,
                        multiple: !1,
                        apply_to: [ "number", "string", "boolean", "enum" ]
                    }, {
                        type: "TIME_RANGE",
                        nb_inputs: 1,
                        multiple: !1,
                        apply_to: [ "date" ]
                    } ],
                    lang: {
                        add_rule: "Add filter",
                        add_group: "Add filter group",
                        operators: {
                            not_null: "is not null",
                            TIME_RANGE: "Time Range"
                        }
                    },
                    icons: {
                        add_rule: "fa fa-plus",
                        remove_rule: "fa fa-times",
                        error: "fa fa-exclamation-triangle"
                    },
                    rules: rules_widgets
                }).on("afterCreateRuleInput.queryBuilder", function(e, rule) {
                    rule.error = null, rule.operator.nb_inputs && "__customAttributes" === rule.filter.id ? rule.$el.addClass("user-define") : rule.$el.hasClass("user-define") && rule.$el.removeClass("user-define"), 
                    "date" === rule.filter.type && rule.$el.find(".rule-value-container >input").attr("readonly", !0), 
                    that.setDateValue(rule, rules_widgets);
                }).on("validationError.queryBuilder", function(e, rule, error, value) {
                    var errorMsg = error[0];
                    that.queryBuilderLang && that.queryBuilderLang.errors && that.queryBuilderLang.errors[errorMsg] && (errorMsg = that.queryBuilderLang.errors[errorMsg]), 
                    rule.$el.find(".error-container span").html(errorMsg);
                });
                var queryBuilderEl = that.ui.builder.data("queryBuilder");
                queryBuilderEl && queryBuilderEl.lang && (this.queryBuilderLang = queryBuilderEl.lang), 
                this.$(".rules-group-header .btn-group.pull-right.group-actions").toggleClass("pull-left");
            } else this.ui.builder.html("<h4>No Attributes are available !</h4>");
        }
    });
    return QueryBuilderView;
});