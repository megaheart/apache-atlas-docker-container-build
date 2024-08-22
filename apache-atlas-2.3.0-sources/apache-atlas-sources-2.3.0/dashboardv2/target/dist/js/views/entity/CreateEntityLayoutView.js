define([ "require", "backbone", "hbs!tmpl/entity/CreateEntityLayoutView_tmpl", "utils/Utils", "collection/VTagList", "collection/VEntityList", "models/VEntity", "modules/Modal", "utils/Messages", "moment", "utils/UrlLinks", "collection/VSearchList", "utils/Enums", "utils/Globals", "daterangepicker" ], function(require, Backbone, CreateEntityLayoutViewTmpl, Utils, VTagList, VEntityList, VEntity, Modal, Messages, moment, UrlLinks, VSearchList, Enums, Globals) {
    var CreateEntityLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "CreateEntityLayoutView",
        template: CreateEntityLayoutViewTmpl,
        templateHelpers: function() {
            return {
                guid: this.guid
            };
        },
        regions: {},
        ui: {
            entityName: "[data-id='entityName']",
            entityList: "[data-id='entityList']",
            entityInputData: "[data-id='entityInputData']",
            toggleRequired: 'input[name="toggleRequired"]',
            assetName: "[data-id='assetName']",
            entityInput: "[data-id='entityInput']",
            entitySelectionBox: "[data-id='entitySelectionBox']"
        },
        events: function() {
            var events = {};
            return events["change " + this.ui.entityList] = "onEntityChange", events["change " + this.ui.toggleRequired] = function(e) {
                this.requiredAllToggle(e.currentTarget.checked);
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "guid", "callback", "showLoader", "entityDefCollection", "typeHeaders", "searchVent"));
            var entityTitle, okLabel, that = this;
            this.selectStoreCollection = new Backbone.Collection(), this.collection = new VEntityList(), 
            this.entityModel = new VEntity(), this.guid && (this.collection.modelAttrName = "createEntity"), 
            this.asyncReferEntityCounter = 0, this.required = !0, this.guid ? (entityTitle = "Edit entity", 
            okLabel = "Update") : (entityTitle = "Create entity", okLabel = "Create"), this.modal = new Modal({
                title: entityTitle,
                content: this,
                cancelText: "Cancel",
                okText: okLabel,
                allowCancel: !0,
                okCloses: !1,
                width: "50%"
            }).open(), this.modal.$el.find("button.ok").attr("disabled", !0), this.modal.on("ok", function(e) {
                that.modal.$el.find("button.ok").showButtonLoader(), that.okButton();
            }), this.modal.on("closeModal", function() {
                that.modal.trigger("cancel");
            });
        },
        bindEvents: function() {
            this.listenTo(this.collection, "reset", function() {
                this.entityCollectionList();
            }, this), this.listenTo(this.collection, "error", function() {
                this.hideLoader();
            }, this);
        },
        onRender: function() {
            this.bindEvents(), this.guid || this.bindRequiredField(), this.showLoader(), this.fetchCollections(), 
            this.$(".toggleRequiredSwitch").hide();
        },
        bindRequiredField: function() {
            var that = this;
            this.ui.entityInputData.on("keyup change", "textarea", function(e) {
                var value = this.value;
                if (!value.length && $(this).hasClass("false")) $(this).removeClass("errorClass"), 
                that.modal.$el.find("button.ok").prop("disabled", !1); else try {
                    value && value.length && (JSON.parse(value), $(this).removeClass("errorClass"), 
                    that.modal.$el.find("button.ok").prop("disabled", !1));
                } catch (err) {
                    $(this).addClass("errorClass"), that.modal.$el.find("button.ok").prop("disabled", !0);
                }
            }), this.ui.entityInputData.on("keyup change", "input.true,select.true", function(e) {
                "" !== this.value.trim() ? ($(this).data("select2") ? $(this).data("select2").$container.find(".select2-selection").removeClass("errorClass") : $(this).removeClass("errorClass"), 
                0 === that.ui.entityInputData.find(".errorClass").length && that.modal.$el.find("button.ok").prop("disabled", !1)) : (that.modal.$el.find("button.ok").prop("disabled", !0), 
                $(this).data("select2") ? $(this).data("select2").$container.find(".select2-selection").addClass("errorClass") : $(this).addClass("errorClass"));
            });
        },
        bindNonRequiredField: function() {
            var that = this;
            this.ui.entityInputData.off("keyup change", "input.false,select.false").on("keyup change", "input.false,select.false", function(e) {
                that.modal.$el.find("button.ok").prop("disabled") && 0 === that.ui.entityInputData.find(".errorClass").length && that.modal.$el.find("button.ok").prop("disabled", !1);
            });
        },
        decrementCounter: function(counter) {
            this[counter] > 0 && --this[counter];
        },
        fetchCollections: function() {
            this.guid ? (this.collection.url = UrlLinks.entitiesApiUrl({
                guid: this.guid
            }), this.collection.fetch({
                reset: !0
            })) : this.entityCollectionList();
        },
        entityCollectionList: function() {
            this.ui.entityList.empty();
            var that = this, name = "";
            if (this.guid) {
                this.collection.each(function(val) {
                    name += Utils.getName(val.get("entity")), that.entityData = val;
                }), this.ui.assetName.html(name);
                var referredEntities = this.entityData.get("referredEntities"), attributes = this.entityData.get("entity").attributes;
                _.map(_.keys(attributes), function(key) {
                    if (_.isObject(attributes[key])) {
                        var attrObj = attributes[key];
                        _.isObject(attrObj) && !_.isArray(attrObj) && (attrObj = [ attrObj ]), _.each(attrObj, function(obj) {
                            obj.guid && !referredEntities[obj.guid] && (++that.asyncReferEntityCounter, that.collection.url = UrlLinks.entitiesApiUrl({
                                guid: obj.guid
                            }), that.collection.fetch({
                                success: function(data, response) {
                                    referredEntities[obj.guid] = response.entity;
                                },
                                complete: function() {
                                    that.decrementCounter("asyncReferEntityCounter"), 0 === that.asyncReferEntityCounter && that.onEntityChange(null, that.entityData);
                                },
                                silent: !0
                            }));
                        });
                    }
                }), 0 === this.asyncReferEntityCounter && this.onEntityChange(null, this.entityData);
            } else {
                var str = '<option disabled="disabled" selected>--Select entity-type--</option>';
                this.entityDefCollection.fullCollection.each(function(val) {
                    var name = Utils.getName(val.toJSON());
                    Globals.entityTypeConfList && 0 !== name.indexOf("__") && (_.isEmptyArray(Globals.entityTypeConfList) ? str += "<option>" + name + "</option>" : _.contains(Globals.entityTypeConfList, val.get("name")) && (str += "<option>" + name + "</option>"));
                }), this.ui.entityList.html(str), this.ui.entityList.select2({}), this.hideLoader();
            }
        },
        capitalize: function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        requiredAllToggle: function(checked) {
            checked ? (this.ui.entityInputData.addClass("all").removeClass("required"), this.ui.entityInputData.find("div.true").show(), 
            this.ui.entityInputData.find("fieldset div.true").show(), this.ui.entityInputData.find("fieldset").show(), 
            this.required = !1) : (this.ui.entityInputData.addClass("required").removeClass("all"), 
            this.ui.entityInputData.find("fieldset").each(function() {
                $(this).find("div").hasClass("false") || $(this).hide();
            }), this.ui.entityInputData.find("div.true").hide(), this.ui.entityInputData.find("fieldset div.true").hide(), 
            this.required = !0);
        },
        onEntityChange: function(e, value) {
            var that = this, typeName = value && value.get("entity") ? value.get("entity").typeName : null;
            this.guid || this.showLoader(), this.ui.entityInputData.empty(), typeName ? this.collection.url = UrlLinks.entitiesDefApiUrl(typeName) : e && (this.collection.url = UrlLinks.entitiesDefApiUrl(e.target.value), 
            this.collection.modelAttrName = "attributeDefs"), this.collection.fetch({
                success: function(model, data) {
                    that.supuertypeFlag = 0, that.subAttributeData(data);
                },
                complete: function() {
                    that.modal.$el.find("button.ok").prop("disabled", !0);
                },
                silent: !0
            });
        },
        renderAttribute: function(object) {
            var that = this, visitedAttr = {}, attributeObj = object.attributeDefs, isAllAttributeOptinal = !0, isAllRelationshipAttributeOptinal = !0, attributeDefList = attributeObj.attributeDefs, relationshipAttributeDefsList = attributeObj.relationshipAttributeDefs, attributeHtml = "", relationShipAttributeHtml = "", fieldElemetHtml = "", commonInput = function(object) {
                var containerHtml = (object.value, "");
                return containerHtml += that.getContainer(object);
            };
            return (attributeDefList.length || relationshipAttributeDefsList.length) && (_.each(attributeDefList, function(value) {
                value.isOptional === !1 && (isAllAttributeOptinal = !1), attributeHtml += commonInput({
                    value: value,
                    duplicateValue: !1,
                    isAttribute: !0
                });
            }), _.each(relationshipAttributeDefsList, function(value) {
                if (value.isOptional === !1 && (isAllRelationshipAttributeOptinal = !1), null === visitedAttr[value.name]) {
                    var duplicateRelationship = _.where(relationshipAttributeDefsList, {
                        name: value.name
                    }), str = '<option value="">--Select a Relationship Type--</option>';
                    _.each(duplicateRelationship, function(val, index, list) {
                        str += "<option>" + _.escape(val.relationshipTypeName) + "</option>";
                    });
                    value.isOptional;
                    visitedAttr[value.name] = '<div class="form-group"><select class="form-control row-margin-bottom entityInputBox ' + (value.isOptional === !0 ? "false" : "true") + '" data-for-key= "' + value.name + '"> ' + str + "</select></div>";
                } else relationShipAttributeHtml += commonInput({
                    value: value,
                    duplicateValue: !0,
                    isRelation: !0
                }), visitedAttr[value.name] = null;
            }), attributeHtml.length && (fieldElemetHtml += that.getFieldElementContainer({
                htmlField: attributeHtml,
                attributeType: !0,
                alloptional: isAllAttributeOptinal
            })), relationShipAttributeHtml.length && (fieldElemetHtml += that.getFieldElementContainer({
                htmlField: relationShipAttributeHtml,
                relationshipType: !0,
                alloptional: isAllRelationshipAttributeOptinal
            })), fieldElemetHtml.length ? (that.ui.entityInputData.append(fieldElemetHtml), 
            _.each(_.keys(visitedAttr), function(key) {
                if (null !== visitedAttr[key]) {
                    var elFound = that.ui.entityInputData.find('[data-key="' + key + '"]');
                    elFound.prop("disabled", !0), elFound.parent().prepend(visitedAttr[key]);
                }
            })) : (fieldElemetHtml = "<h4 class='text-center'>Defination not found</h4>", that.ui.entityInputData.append(fieldElemetHtml))), 
            that.ui.entityInputData.find("select[data-for-key]").select2({}).on("change", function() {
                var forKey = $(this).data("forKey"), forKeyEl = null;
                forKey && forKey.length && (forKeyEl = that.ui.entityInputData.find('[data-key="' + forKey + '"]'), 
                forKeyEl && ("" == this.value ? (forKeyEl.val(null).trigger("change"), forKeyEl.prop("disabled", !0)) : forKeyEl.prop("disabled", !1)));
            }), !1;
        },
        subAttributeData: function(data) {
            var that = this, attributeDefs = Utils.getNestedSuperTypeObj({
                seperateRelatioshipAttr: !0,
                attrMerge: !0,
                data: data,
                collection: this.entityDefCollection
            });
            attributeDefs && attributeDefs.relationshipAttributeDefs.length && (attributeDefs.attributeDefs = _.filter(attributeDefs.attributeDefs, function(obj) {
                if (void 0 === _.find(attributeDefs.relationshipAttributeDefs, {
                    name: obj.name
                })) return !0;
            })), attributeDefs.attributeDefs.length || attributeDefs.relationshipAttributeDefs.length ? this.$(".toggleRequiredSwitch").show() : this.$(".toggleRequiredSwitch").hide(), 
            this.renderAttribute({
                attributeDefs: attributeDefs
            }), this.required && (this.ui.entityInputData.find("fieldset div.true").hide(), 
            this.ui.entityInputData.find("div.true").hide()), "placeholder" in HTMLInputElement.prototype || this.ui.entityInputData.find("input,select,textarea").placeholder(), 
            that.initilizeElements();
        },
        initilizeElements: function() {
            var that = this, $createTime = this.modal.$el.find('input[name="createTime"]'), dateObj = {
                singleDatePicker: !0,
                showDropdowns: !0,
                startDate: new Date(),
                locale: {
                    format: Globals.dateFormat
                }
            };
            this.$('input[data-type="date"]').each(function() {
                $(this).data("daterangepicker") || (that.guid && this.value.length && (dateObj.startDate = new Date(Number(this.value))), 
                "modifiedTime" === $(this).attr("name") && (dateObj.minDate = $createTime.val()), 
                $(this).daterangepicker(dateObj));
            }), modifiedDateObj = _.extend({}, dateObj), $createTime.on("apply.daterangepicker", function(ev, picker) {
                that.modal.$el.find('input[name="modifiedTime"]').daterangepicker(_.extend(modifiedDateObj, {
                    minDate: $createTime.val()
                }));
            }), this.initializeValidation(), this.ui.entityInputData.find("fieldset").length > 0 && 0 === this.ui.entityInputData.find("select.true,input.true").length && (this.requiredAllToggle(0 === this.ui.entityInputData.find("select.true,input.true").length), 
            this.guid || this.bindNonRequiredField()), this.$('select[data-type="boolean"]').each(function(value, key) {
                var dataKey = $(key).data("key");
                if (that.entityData) {
                    var setValue = that.entityData.get("entity").attributes[dataKey];
                    this.value = setValue;
                }
            }), this.addJsonSearchData();
        },
        initializeValidation: function() {
            var regex = /^[0-9]*((?=[^.]|$))?$/, removeText = function(e, value) {
                if (!regex.test(value)) {
                    var txtfld = e.currentTarget, newtxt = txtfld.value.slice(0, txtfld.value.length - 1);
                    txtfld.value = newtxt;
                }
            };
            this.$('input[data-type="int"],input[data-type="long"]').on("keydown", function(e) {
                if (!regex.test(e.currentTarget.value)) return !1;
            }), this.$('input[data-type="int"],input[data-type="long"]').on("paste", function(e) {
                return !1;
            }), this.$('input[data-type="long"],input[data-type="int"]').on("keyup click", function(e) {
                removeText(e, e.currentTarget.value);
            }), this.$('input[data-type="date"]').on("hide.daterangepicker keydown", function(event) {
                if (event.type) if ("hide" == event.type) this.blur(); else if ("keydown" == event.type) return !1;
            });
        },
        getContainer: function(object) {
            var value = object.value, entityLabel = this.capitalize(_.escape(value.name));
            return '<div class=" row ' + value.isOptional + '"><span class="col-sm-3"><label><span class="' + (value.isOptional ? "true" : "false required") + '">' + entityLabel + '</span><span class="center-block ellipsis-with-margin text-gray" title="Data Type : ' + value.typeName + '">(' + _.escape(value.typeName) + ')</span></label></span><span class="col-sm-9">' + this.getElement(object) + "</input></span></div>";
        },
        getFieldElementContainer: function(object) {
            var htmlField = object.htmlField, relationshipType = (!!object.attributeType && object.attributeType, 
            !!object.relationshipType && object.relationshipType), alloptional = object.alloptional, typeOfDefination = relationshipType ? "Relationships" : "Attributes";
            return '<div class="attribute-dash-box ' + (alloptional ? "alloptional" : "") + ' "><span class="attribute-type-label">' + typeOfDefination + "</span>" + htmlField + "</div>";
        },
        getSelect: function(object) {
            var value = object.value, name = _.escape(value.name), entityValue = _.escape(object.entityValue), isAttribute = object.isAttribute, isRelation = object.isRelation;
            if ("boolean" === value.typeName) return '<select class="form-control row-margin-bottom ' + (value.isOptional === !0 ? "false" : "true") + '" data-type="' + value.typeName + '" data-attribute="' + isAttribute + '" data-relation="' + isRelation + '" data-key="' + name + '" data-id="entityInput"><option value="">--Select true or false--</option><option value="true">true</option><option value="false">false</option></select>';
            var splitTypeName = value.typeName.split("<");
            return splitTypeName = splitTypeName.length > 1 ? splitTypeName[1].split(">")[0] : value.typeName, 
            '<select class="form-control row-margin-bottom entityInputBox ' + (value.isOptional === !0 ? "false" : "true") + '" data-type="' + value.typeName + '" data-attribute="' + isAttribute + '" data-relation="' + isRelation + '" data-key="' + name + '" data-id="entitySelectData" data-queryData="' + splitTypeName + '">' + (this.guid ? entityValue : "") + "</select>";
        },
        getTextArea: function(object) {
            var value = object.value, name = _.escape(value.name), setValue = _.escape(object.entityValue), isAttribute = object.isAttribute, isRelation = object.isRelation, structType = object.structType;
            try {
                if (structType && entityValue && entityValue.length) {
                    var parseValue = JSON.parse(entityValue);
                    _.isObject(parseValue) && !_.isArray(parseValue) && parseValue.attributes && (setValue = JSON.stringify(parseValue.attributes));
                }
            } catch (err) {}
            return '<textarea class="form-control entityInputBox ' + (value.isOptional === !0 ? "false" : "true") + '" data-type="' + value.typeName + '" data-key="' + name + '" data-attribute="' + isAttribute + '" data-relation="' + isRelation + '" placeholder="' + name + '" data-id="entityInput">' + setValue + "</textarea>";
        },
        getInput: function(object) {
            var value = object.value, name = _.escape(value.name), entityValue = _.escape(object.entityValue), isAttribute = object.isAttribute, isRelation = object.isRelation;
            return '<input class="form-control entityInputBox ' + (value.isOptional === !0 ? "false" : "true") + '" data-type="' + value.typeName + '" value="' + entityValue + '" data-key="' + name + '" data-attribute="' + isAttribute + '" data-relation="' + isRelation + '" placeholder="' + name + '" name="' + name + '" data-id="entityInput">';
        },
        getElement: function(object) {
            var value = object.value, isAttribute = object.isAttribute, isRelation = object.isRelation, typeName = value.typeName, entityValue = "";
            if (this.guid) {
                var dataValue = this.entityData.get("entity").attributes[value.name];
                _.isObject(dataValue) ? entityValue = JSON.stringify(dataValue) : (dataValue && (entityValue = dataValue), 
                "date" === value.typeName && (entityValue = dataValue ? moment(dataValue) : Utils.formatDate({
                    zone: !1,
                    dateFormat: Globals.dateFormat
                })));
            }
            if (typeName && this.entityDefCollection.fullCollection.find({
                name: typeName
            }) || "boolean" === typeName || typeName.indexOf("array") > -1) return this.getSelect({
                value: value,
                entityValue: entityValue,
                isAttribute: isAttribute,
                isRelation: isRelation
            });
            if (typeName.indexOf("map") > -1) return this.getTextArea({
                value: value,
                entityValue: entityValue,
                isAttribute: isAttribute,
                isRelation: isRelation,
                structType: !1
            });
            var typeNameCategory = this.typeHeaders.fullCollection.findWhere({
                name: typeName
            });
            return typeNameCategory && "STRUCT" === typeNameCategory.get("category") ? this.getTextArea({
                value: value,
                entityValue: entityValue,
                isAttribute: isAttribute,
                isRelation: isRelation,
                structType: !0
            }) : this.getInput({
                value: value,
                entityValue: entityValue,
                isAttribute: isAttribute,
                isRelation: isRelation
            });
        },
        okButton: function() {
            var that = this;
            this.showLoader({
                editVisiblityOfEntitySelectionBox: !0
            }), this.parentEntity = this.ui.entityList.val();
            var entityAttribute = {}, referredEntities = {}, relationshipAttribute = {}, extractValue = function(value, typeName) {
                if (!value) return value;
                if (_.isArray(value)) {
                    var parseData = [];
                    _.map(value, function(val) {
                        parseData.push({
                            guid: val,
                            typeName: typeName
                        });
                    });
                } else var parseData = {
                    guid: value,
                    typeName: typeName
                };
                return parseData;
            };
            try {
                this.ui.entityInputData.find("input,select,textarea").each(function() {
                    var value = $(this).val(), el = this;
                    if ($(this).val() && $(this).val().trim && (value = $(this).val().trim()), "TEXTAREA" === this.nodeName) try {
                        value && value.length && (JSON.parse(value), $(this).removeClass("errorClass"));
                    } catch (err) {
                        throw new Error(err.message);
                    }
                    if ($(this).hasClass("true") && ("" == value || void 0 == value)) throw $(this).data("select2") ? $(this).data("select2").$container.find(".select2-selection").addClass("errorClass") : $(this).addClass("errorClass"), 
                    that.hideLoader(), that.modal.$el.find("button.ok").hideButtonLoader(), new Error("Please fill the required fields");
                    var dataTypeEnitity = $(this).data("type"), datakeyEntity = $(this).data("key"), typeName = $(this).data("querydata"), attribute = "undefined" != $(this).data("attribute"), relation = "undefined" != $(this).data("relation"), typeNameCategory = that.typeHeaders.fullCollection.findWhere({
                        name: dataTypeEnitity
                    }), val = null;
                    if (dataTypeEnitity && datakeyEntity) {
                        if (that.entityDefCollection.fullCollection.find({
                            name: dataTypeEnitity
                        })) val = extractValue(value, typeName); else if ("date" === dataTypeEnitity || "time" === dataTypeEnitity) val = Date.parse(value); else if (dataTypeEnitity.indexOf("map") > -1 || typeNameCategory && "STRUCT" === typeNameCategory.get("category")) try {
                            value && value.length && (parseData = JSON.parse(value), val = parseData);
                        } catch (err) {
                            throw $(this).addClass("errorClass"), new Error(datakeyEntity + " : " + err.message);
                        } else val = dataTypeEnitity.indexOf("array") > -1 && dataTypeEnitity.indexOf("string") === -1 ? extractValue(value, typeName) : _.isString(value) ? value.length ? value : null : value;
                        attribute ? entityAttribute[datakeyEntity] = val : relation && (relationshipAttribute[datakeyEntity] = val);
                    } else {
                        var dataRelEntity = $(this).data("forKey");
                        dataRelEntity && relationshipAttribute[dataRelEntity] && (_.isArray(relationshipAttribute[dataRelEntity]) ? _.each(relationshipAttribute[dataRelEntity], function(obj) {
                            obj && (obj.relationshipType = $(el).val());
                        }) : relationshipAttribute[dataRelEntity].relationshipType = $(this).val());
                    }
                });
                var entityJson = {
                    entity: {
                        typeName: this.guid ? this.entityData.get("entity").typeName : this.parentEntity,
                        attributes: entityAttribute,
                        relationshipAttributes: relationshipAttribute,
                        guid: this.guid ? this.guid : -1
                    },
                    referredEntities: referredEntities
                };
                this.entityModel.createOreditEntity({
                    data: JSON.stringify(entityJson),
                    type: "POST",
                    success: function(model, response) {
                        that.modal.$el.find("button.ok").hideButtonLoader(), that.modal.close();
                        var msgType = model.mutatedEntities && model.mutatedEntities.UPDATE ? "editSuccessMessage" : "addSuccessMessage";
                        if (Utils.notifySuccess({
                            content: "Entity " + Messages.getAbbreviationMsg(!1, msgType)
                        }), that.guid && that.callback) that.callback(); else if (model.mutatedEntities) {
                            var mutatedEntities = model.mutatedEntities.CREATE || model.mutatedEntities.UPDATE;
                            mutatedEntities && _.isArray(mutatedEntities) && mutatedEntities[0] && mutatedEntities[0].guid && Utils.setUrl({
                                url: "#!/detailPage/" + mutatedEntities[0].guid,
                                mergeBrowserUrl: !1,
                                trigger: !0
                            }), that.searchVent && that.searchVent.trigger("entityList:refresh");
                        }
                    },
                    complete: function() {
                        that.hideLoader({
                            editVisiblityOfEntitySelectionBox: !0
                        }), that.modal.$el.find("button.ok").hideButtonLoader();
                    }
                });
            } catch (e) {
                Utils.notifyError({
                    content: e.message
                }), that.hideLoader({
                    editVisiblityOfEntitySelectionBox: !0
                });
            }
        },
        showLoader: function(options) {
            var editVisiblityOfEntitySelectionBox = options && options.editVisiblityOfEntitySelectionBox;
            this.$(".entityLoader").addClass("show"), this.$(".entityInputData").hide(), (this.guid || editVisiblityOfEntitySelectionBox) && this.ui.entitySelectionBox.hide();
        },
        hideLoader: function(options) {
            var editVisiblityOfEntitySelectionBox = options && options.editVisiblityOfEntitySelectionBox;
            this.$(".entityLoader").removeClass("show"), this.$(".entityInputData").show(), 
            (this.guid || editVisiblityOfEntitySelectionBox) && this.ui.entitySelectionBox.show(), 
            this.ui.entityList.select2("open"), this.ui.entityList.select2("close");
        },
        addJsonSearchData: function() {
            var that = this;
            this.$('select[data-id="entitySelectData"]').each(function(value, key) {
                var $this = $(this), keyData = $(this).data("key"), typeData = $(this).data("type"), queryData = $(this).data("querydata"), placeholderName = ($(this).data("skip"), 
                "Select a " + typeData + " from the dropdown list");
                if ($this.attr("multiple", $this.data("type").indexOf("array") !== -1), that.guid) {
                    var dataValue = that.entityData.get("entity").attributes[keyData], relationshipType = (that.entityData.get("entity").attributes, 
                    that.entityData.get("entity").relationshipAttributes ? that.entityData.get("entity").relationshipAttributes[keyData] : null), referredEntities = that.entityData.get("referredEntities"), selectedValue = [], select2Options = [];
                    if (dataValue && (_.isObject(dataValue) && !_.isArray(dataValue) && (dataValue = [ dataValue ]), 
                    _.each(dataValue, function(obj) {
                        if (_.isObject(obj) && obj.guid && referredEntities[obj.guid]) {
                            var refEntiyFound = referredEntities[obj.guid];
                            refEntiyFound.id = refEntiyFound.guid, Enums.entityStateReadOnly[refEntiyFound.status] || (select2Options.push(refEntiyFound), 
                            selectedValue.push(refEntiyFound.guid));
                        }
                    }), _.isUndefined(relationshipType) || relationshipType && relationshipType.relationshipAttributes && relationshipType.relationshipAttributes.typeName && that.$("select[data-for-key=" + keyData + "]").val(relationshipType.relationshipAttributes.typeName).trigger("change")), 
                    0 === selectedValue.length && dataValue && dataValue.length && "string" === $this.data("querydata")) {
                        var str = "";
                        _.each(dataValue, function(obj) {
                            _.isString(obj) && (selectedValue.push(obj), str += "<option>" + _.escape(obj) + "</option>");
                        }), $this.html(str);
                    }
                } else $this.val([]);
                var select2Option = {
                    placeholder: placeholderName,
                    allowClear: !0,
                    tags: "string" == $this.data("querydata")
                }, getTypeAheadData = function(data, params) {
                    var dataList = data.entities, foundOptions = [];
                    return _.each(dataList, function(obj) {
                        obj && (obj.guid && (obj.id = obj.guid), foundOptions.push(obj));
                    }), foundOptions;
                };
                "string" !== $this.data("querydata") && _.extend(select2Option, {
                    ajax: {
                        url: UrlLinks.searchApiUrl("attribute"),
                        dataType: "json",
                        delay: 250,
                        data: function(params) {
                            return {
                                attrValuePrefix: params.term,
                                typeName: queryData,
                                limit: 10,
                                offset: 0
                            };
                        },
                        processResults: function(data, params) {
                            return {
                                results: getTypeAheadData(data, params)
                            };
                        },
                        cache: !0
                    },
                    templateResult: function(option) {
                        var name = Utils.getName(option, "qualifiedName");
                        return "-" === name ? option.text : name;
                    },
                    templateSelection: function(option) {
                        var name = Utils.getName(option, "qualifiedName");
                        return "-" === name ? option.text : name;
                    },
                    escapeMarkup: function(markup) {
                        return markup;
                    },
                    data: select2Options,
                    minimumInputLength: 1
                }), $this.select2(select2Option), selectedValue && $this.val(selectedValue).trigger("change");
            }), this.guid && (this.bindRequiredField(), this.bindNonRequiredField()), this.hideLoader();
        }
    });
    return CreateEntityLayoutView;
});