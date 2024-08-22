define([ "require", "utils/Utils", "modules/Modal", "utils/Messages", "utils/Enums", "moment", "utils/Globals", "moment-timezone" ], function(require, Utils, Modal, Messages, Enums, moment, Globals, momentTimezone) {
    "use strict";
    var CommonViewFunction = {};
    return CommonViewFunction.deleteTag = function(options) {
        require([ "models/VTag" ], function(VTag) {
            if (options && options.guid && options.tagName) {
                var tagModel = new VTag(), noticeRef = null, notifyObj = {
                    modal: !0,
                    okCloses: !1,
                    okShowLoader: !0,
                    text: options.msg,
                    title: options.titleMessage,
                    okText: options.okText,
                    ok: function(notice) {
                        noticeRef = notice, options.showLoader && options.showLoader(), tagModel.deleteAssociation(options.guid, options.tagName, options.associatedGuid, {
                            defaultErrorMessage: options.tagName + Messages.deleteErrorMessage,
                            success: function(data) {
                                noticeRef && noticeRef.remove(), Utils.notifySuccess({
                                    content: "Classification " + options.tagName + Messages.getAbbreviationMsg(!1, "removeSuccessMessage")
                                }), options.callback && options.callback(), options.collection && options.collection.fetch({
                                    reset: !0
                                });
                            },
                            cust_error: function(model, response) {
                                noticeRef && noticeRef.hideButtonLoader(), options.hideLoader && options.hideLoader();
                            }
                        });
                    },
                    cancel: function(argument) {
                        options.hideLoader && options.hideLoader();
                    }
                };
                Utils.notifyConfirm(notifyObj);
            }
        });
    }, CommonViewFunction.propertyTable = function(options) {
        var scope = options.scope, sortBy = options.sortBy, valueObject = options.valueObject, extractJSON = options.extractJSON, getArrayOfStringElement = options.getArrayOfStringElement, getArrayOfStringFormat = options.getArrayOfStringFormat, isTable = !!_.isUndefined(options.isTable) || options.isTable, attributeDefs = options.attributeDefs, formatIntVal = options.formatIntVal, showListCount = options.showListCount || !0, highlightString = options.highlightString, formatStringVal = options.formatStringVal, isRelationshipAttr = options.isRelationshipAttribute, numberFormat = options.numberFormat || _.numberFormatWithComma, table = "", getHighlightedString = function(resultStr) {
            if (!highlightString || !highlightString.length) return resultStr;
            try {
                return resultStr.replace(new RegExp(highlightString, "gi"), function(foundStr) {
                    return "<span class='searched-term-highlight'>" + foundStr + "</span>";
                });
            } catch (error) {
                return resultStr;
            }
        }, getEmptyString = function(key) {
            return options.getEmptyString ? options.getEmptyString(key) : "N/A";
        }, getValue = function(val, key) {
            if (options && options.getValue && (val = options.getValue(val, key)), _.isUndefined(val) || _.isNull(val)) return getEmptyString(key);
            if (!_.isNumber(val) && _.isNaN(parseInt(val)) || !formatIntVal) {
                var newVal = val;
                return formatStringVal && (newVal = parseInt(val), newVal = _.isNaN(newVal) ? val : numberFormat(newVal)), 
                getHighlightedString(_.escape(newVal));
            }
            return numberFormat(val);
        }, fetchInputOutputValue = function(id, defEntity) {
            scope.entityModel.getEntityHeader(id, {
                success: function(serverData) {
                    var value = "", deleteButton = "", data = serverData;
                    value = Utils.getName(data);
                    var id = "";
                    data.guid && (Enums.entityStateReadOnly[data.status || data.entityStatus] && (deleteButton += '<button title="Deleted" class="btn btn-action btn-md deleteBtn"><i class="fa fa-trash"></i></button>'), 
                    id = data.guid), value.length > 0 ? scope.$('td div[data-id="' + id + '"]').html('<a href="#!/detailPage/' + id + '">' + getValue(value) + "</a>") : scope.$('td div[data-id="' + id + '"]').html('<a href="#!/detailPage/' + id + '">' + _.escape(id) + "</a>"), 
                    deleteButton.length && (scope.$('td div[data-id="' + id + '"]').addClass("block readOnlyLink"), 
                    scope.$('td div[data-id="' + id + '"]').append(deleteButton));
                },
                cust_error: function(error, xhr) {
                    403 == xhr.status ? scope.$('td div[data-id="' + id + '"]').html('<div><span class="text-danger"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Not Authorized</span></div>') : defEntity && defEntity.options && "true" === defEntity.options.isSoftReference ? scope.$('td div[data-id="' + id + '"]').html("<div> " + id + "</div>") : scope.$('td div[data-id="' + id + '"]').html('<div><span class="text-danger"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> ' + Messages.defaultErrorMessage + "</span></div>");
                },
                complete: function() {}
            });
        }, extractObject = function(opt) {
            var valueOfArray = [], keyValue = opt.keyValue, key = opt.key, defEntity = opt.defEntity;
            !_.isArray(keyValue) && _.isObject(keyValue) && (keyValue = [ keyValue ]);
            for (var subLink = "", i = 0; i < keyValue.length; i++) {
                var inputOutputField = keyValue[i], id = inputOutputField.guid || (_.isObject(inputOutputField.id) ? inputOutputField.id.id : inputOutputField.id), tempLink = "", status = inputOutputField.status || inputOutputField.entityStatus || (_.isObject(inputOutputField.id) ? inputOutputField.id.state : inputOutputField.state), readOnly = Enums.entityStateReadOnly[status];
                if (!inputOutputField.attributes && inputOutputField.values && (inputOutputField.attributes = inputOutputField.values), 
                _.isString(inputOutputField) || _.isBoolean(inputOutputField) || _.isNumber(inputOutputField)) {
                    var tempVarfor$check = inputOutputField.toString();
                    if (tempVarfor$check.indexOf("$") == -1) {
                        var tmpVal = getValue(inputOutputField, key);
                        getArrayOfStringElement ? valueOfArray.push(getArrayOfStringElement(tmpVal, key)) : valueOfArray.push('<span class="json-string">' + tmpVal + "</span>");
                    }
                } else if (_.isObject(inputOutputField) && (!id || isRelationshipAttr)) {
                    var attributesList = inputOutputField;
                    if (scope.typeHeaders && inputOutputField.typeName) {
                        var typeNameCategory = scope.typeHeaders.fullCollection.findWhere({
                            name: inputOutputField.typeName
                        });
                        attributesList.attributes && typeNameCategory && "STRUCT" === typeNameCategory.get("category") && (attributesList = attributesList.attributes);
                    }
                    if (extractJSON && extractJSON.extractKey) {
                        var newAttributesList = {};
                        _.each(attributesList, function(objValue, objKey) {
                            var value = _.isObject(objValue) ? objValue : _.escape(objValue), tempVarfor$check = objKey.toString();
                            tempVarfor$check.indexOf("$") == -1 && (_.isObject(extractJSON.extractKey) ? _.each(extractJSON.extractKey, function(extractKey) {
                                objKey === extractKey && (newAttributesList[_.escape(objKey)] = value);
                            }) : _.isString(extractJSON.extractKey) && extractJSON.extractKey === objKey && (newAttributesList[_.escape(objKey)] = value));
                        }), valueOfArray.push(Utils.JSONPrettyPrint(newAttributesList, getValue));
                    } else valueOfArray.push(Utils.JSONPrettyPrint(attributesList, getValue));
                }
                if (id && inputOutputField && !isRelationshipAttr) {
                    var name = Utils.getName(inputOutputField);
                    if ("-" !== name && name !== id || inputOutputField.attributes) tempLink += "AtlasGlossaryTerm" == inputOutputField.typeName ? '<a href="#!/glossary/' + id + "?guid=" + id + '&gType=term&viewType=term&fromView=entity">' + name + "</a>" : '<a href="#!/detailPage/' + id + '">' + name + "</a>"; else {
                        var fetch = !0, fetchId = _.isObject(id) ? id.id : id;
                        fetchInputOutputValue(fetchId, defEntity), tempLink += '<div data-id="' + fetchId + '"><div class="value-loader"></div></div>';
                    }
                }
                readOnly ? fetch ? (fetch = !1, subLink += tempLink) : (tempLink += '<button title="Deleted" class="btn btn-action btn-md deleteBtn"><i class="fa fa-trash"></i></button>', 
                subLink += '<div class="block readOnlyLink">' + tempLink + "</div>") : tempLink.search("href") != -1 ? subLink += "<div>" + tempLink + "</div>" : tempLink.length && (subLink += tempLink);
            }
            return valueOfArray.length && (subLink = getArrayOfStringFormat ? getArrayOfStringFormat(valueOfArray, key) : valueOfArray.join(", ")), 
            "" === subLink ? getEmptyString(key) : subLink;
        }, valueObjectKeysList = _.keys(_.omit(valueObject, [ "paramsCount" ]));
        return (_.isUndefined(sortBy) || 1 == sortBy) && (valueObjectKeysList = _.sortBy(valueObjectKeysList)), 
        valueObjectKeysList.map(function(key) {
            if ("profileData" != key) {
                var keyValue = valueObject[key], listCount = "";
                if ("isIncomplete" != key || 0 != keyValue) {
                    showListCount && _.isArray(keyValue) && keyValue.length > 0 && (listCount = valueObject && void 0 != valueObject.paramsCount ? 0 != numberFormat(valueObject.paramsCount) ? " (" + numberFormat(valueObject.paramsCount) + ")" : "" : " (" + numberFormat(keyValue.length) + ")");
                    var defEntity = _.find(attributeDefs, {
                        name: key
                    });
                    if (defEntity && defEntity.typeName) {
                        var defEntityType = defEntity.typeName.toLocaleLowerCase();
                        "date" === defEntityType ? keyValue = keyValue > 0 ? Utils.formatDate({
                            date: keyValue
                        }) : null : _.isObject(keyValue) && (keyValue = extractObject({
                            keyValue: keyValue,
                            key: key,
                            defEntity: defEntity
                        }));
                    } else _.isObject(keyValue) && (keyValue = extractObject({
                        keyValue: keyValue,
                        key: key
                    }));
                    var val = "";
                    if (val = _.isObject(valueObject[key]) ? keyValue : "guid" === key || "__guid" === key ? options.guidHyperLink === !1 ? getValue(keyValue, key) : isRelationshipAttr ? '<a title="' + key + '" href="#!/detailPage/' + _.escape(keyValue) + '?from=relationshipSearch">' + getValue(keyValue, key) + "</a>" : '<a title="' + key + '" href="#!/detailPage/' + _.escape(keyValue) + '">' + getValue(keyValue, key) + "</a>" : !isRelationshipAttr || "createTime" !== key && "updateTime" !== key ? getValue(keyValue, key) : Utils.formatDate({
                        date: keyValue
                    }), isTable) {
                        var value = val, appendClass = "N/A" == value ? "hide-row" : "", htmlTag = '<div class="scroll-y">' + value + "</div>";
                        if (_.isObject(valueObject[key]) && !_.isEmpty(valueObject[key])) {
                            var matchedLinkString = val.match(/href|value-loader\w*/g), matchedJson = val.match(/json-value|json-string\w*/g), isMatchJSONStringIsSingle = (val.match(/json-key\w*/g), 
                            matchedLinkString && matchedLinkString.length <= 5, matchedJson && 1 == matchedJson.length), expandCollapseButton = "";
                            if (matchedJson || matchedLinkString) {
                                var className = "code-block fixed-height";
                                isMatchJSONStringIsSingle || (className += " shrink", expandCollapseButton = '<button class="expand-collapse-button"><i class="fa"></i></button>'), 
                                htmlTag = '<pre class="' + className + '">' + expandCollapseButton + "<code>" + val + "</code></pre>";
                            }
                        }
                        table += '<tr class="' + appendClass + '"><td>' + (_.escape(key) + listCount) + "</td><td>" + htmlTag + "</td></tr>";
                    } else table += "<span>" + val + "</span>";
                }
            }
        }), table && table.length > 0 ? table : '<tr class="empty"><td colspan="22"><span>No Record found!</span></td></tr>';
    }, CommonViewFunction.tagForTable = function(obj, classificationDefCollection) {
        var traits = obj.classifications, tagHtml = "", addTag = "", popTag = "", count = 0, entityName = Utils.getName(obj);
        return traits && traits.map(function(tag) {
            var className = "btn btn-action btn-sm btn-blue btn-icon", deleteIcon = "";
            obj.guid === tag.entityGuid ? deleteIcon = '<i class="fa fa-times" data-id="delete"  data-assetname="' + entityName + '" data-name="' + tag.typeName + '" data-type="tag" data-guid="' + obj.guid + '" ></i>' : obj.guid !== tag.entityGuid && "DELETED" === tag.entityStatus ? deleteIcon = '<i class="fa fa-times" data-id="delete"  data-assetname="' + entityName + '" data-name="' + tag.typeName + '" data-type="tag" data-entityguid="' + tag.entityGuid + '" data-guid="' + obj.guid + '" ></i>' : className += " propagte-classification";
            var tagObj = classificationDefCollection.fullCollection.find({
                name: tag.typeName
            }), tagParents = tagObj ? tagObj.get("superTypes") : null, parentName = tag.typeName;
            tagParents && tagParents.length && (parentName += tagParents.length > 1 ? "@(" + tagParents.join() + ")" : "@" + tagParents.join());
            var tagString = '<a class="' + className + '" data-id="tagClick"><span title="' + parentName + '">' + parentName + "</span>" + deleteIcon + "</a>";
            count >= 1 ? popTag += tagString : tagHtml += tagString, ++count;
        }), Enums.entityStateReadOnly[obj.status || obj.entityStatus] || (addTag += obj.guid ? '<a href="javascript:void(0)" data-id="addTag" class="btn btn-action btn-sm assignTag" data-guid="' + obj.guid + '" ><i class="fa fa-plus"></i></a>' : '<a href="javascript:void(0)" data-id="addTag" class="btn btn-action btn-sm assignTag"><i style="right:0" class="fa fa-plus"></i></a>'), 
        count > 1 && (addTag += '<div data-id="showMoreLess" class="btn btn-action btn-sm assignTag"><i class="fa fa-ellipsis-h" aria-hidden="true"></i><div class="popup-tag-term">' + popTag + "</div></div>"), 
        '<div class="tagList btn-inline btn-fixed-width">' + tagHtml + addTag + "</div>";
    }, CommonViewFunction.termForTable = function(obj) {
        var terms = obj.meanings, termHtml = "", addTerm = "", popTerm = "", count = 0, entityName = Utils.getName(obj);
        return terms && terms.map(function(term) {
            var displayText = _.escape(term.displayText), gloassaryName = _.escape(term.qualifiedName) || displayText, className = "btn btn-action btn-sm btn-blue btn-icon", deleteIcon = '<i class="fa fa-times" data-id="delete"  data-assetname="' + entityName + '" data-name="' + displayText + '" data-type="term" data-guid="' + obj.guid + '" data-termGuid="' + term.termGuid + '" ></i>', termString = '<a class="' + className + '" data-id="termClick"><span title="' + gloassaryName + '">' + gloassaryName + "</span>" + deleteIcon + "</a>";
            count >= 1 ? popTerm += termString : termHtml += termString, ++count;
        }), Enums.entityStateReadOnly[obj.status || obj.entityStatus] || (addTerm += obj.guid ? '<a href="javascript:void(0)" data-id="addTerm" class="btn btn-action btn-sm assignTag" data-guid="' + obj.guid + '" ><i class="fa fa-plus"></i></a>' : '<a href="javascript:void(0)" data-id="addTerm" class="btn btn-action btn-sm assignTag"><i style="right:0" class="fa fa-plus"></i></a>'), 
        count > 1 && (addTerm += '<div data-id="showMoreLess" class="btn btn-action btn-sm assignTerm"><i class="fa fa-ellipsis-h" aria-hidden="true"></i><div class="popup-tag-term">' + popTerm + "</div></div>"), 
        '<div class="tagList btn-inline btn-fixed-width">' + termHtml + addTerm + "</div>";
    }, CommonViewFunction.generateQueryOfFilter = function(value) {
        function objToString(filterObj) {
            var generatedQuery = _.map(filterObj.rules, function(obj, key) {
                var obj = $.extend(!0, {}, obj);
                return _.has(obj, "condition") ? '&nbsp<span class="operator">' + obj.condition + "</span>&nbsp(" + objToString(obj) + ")" : ("date" === obj.type && (Enums.queryBuilderDateRangeUIValueToAPI[obj.value] ? obj.value = Enums.queryBuilderDateRangeUIValueToAPI[obj.value] : obj.value = obj.value + " (" + moment.tz(moment.tz.guess()).zoneAbbr() + ")"), 
                '<span class="key">' + (Enums.systemAttributes[obj.id] ? Enums.systemAttributes[obj.id] : _.escape(obj.id)) + '</span>&nbsp<span class="operator">' + _.escape(obj.operator) + '</span>&nbsp<span class="value">' + (Enums[obj.id] ? Enums[obj.id][obj.value] : _.escape(obj.value)) + "</span>");
            });
            return generatedQuery;
        }
        value = Utils.getUrlState.getQueryParams();
        var entityFilters = CommonViewFunction.attributeFilter.extractUrl({
            value: value.entityFilters,
            formatDate: !0
        }), tagFilters = CommonViewFunction.attributeFilter.extractUrl({
            value: value.tagFilters,
            formatDate: !0
        }), relationshipFilters = CommonViewFunction.attributeFilter.extractUrl({
            value: value.relationshipFilters,
            formatDate: !0
        }), queryArray = [];
        if (value.type) {
            var typeKeyValue = '<span class="key">Type:</span>&nbsp<span class="value">' + _.escape(value.type) + "</span>";
            if (entityFilters) {
                var conditionForEntity = 1 == entityFilters.rules.length ? "" : "AND";
                typeKeyValue += '&nbsp<span class="operator">' + conditionForEntity + '</span>&nbsp(<span class="operator">' + entityFilters.condition + "</span>&nbsp(" + objToString(entityFilters) + "))";
            }
            queryArray.push(typeKeyValue);
        }
        if (value.tag) {
            var tagKeyValue = '<span class="key">Classification:</span>&nbsp<span class="value">' + _.escape(value.tag) + "</span>";
            if (tagFilters) {
                var conditionFortag = 1 == tagFilters.rules.length ? "" : "AND";
                tagKeyValue += '&nbsp<span class="operator">' + conditionFortag + '</span>&nbsp(<span class="operator">' + tagFilters.condition + "</span>&nbsp(" + objToString(tagFilters) + "))";
            }
            queryArray.push(tagKeyValue);
        }
        if (value.relationshipName) {
            var relationshipKeyValue = '<span class="key">Relationship:</span>&nbsp<span class="value">' + _.escape(value.relationshipName) + "</span>";
            if (relationshipFilters) {
                var conditionForRealtionship = relationshipFilters.rules && 1 == relationshipFilters.rules.length ? "" : "AND";
                relationshipKeyValue += '&nbsp<span class="operator">' + conditionForRealtionship + '</span>&nbsp(<span class="operator">' + relationshipFilters.condition + "</span>&nbsp(" + objToString(relationshipFilters) + "))";
            }
            queryArray.push(relationshipKeyValue);
        }
        if (value.term) {
            var tagKeyValue = '<span class="key">Term:</span>&nbsp<span class="value">' + _.escape(value.term) + "</span>";
            queryArray.push(tagKeyValue);
        }
        return value.query && queryArray.push('<span class="key">Query:</span>&nbsp<span class="value">' + _.trim(_.escape(value.query)) + "</span>&nbsp"), 
        1 == queryArray.length ? queryArray.join() : "<span>(</span>&nbsp" + queryArray.join("<span>&nbsp)</span>&nbsp<span>AND</span>&nbsp<span>(</span>&nbsp") + "&nbsp<span>)</span>";
    }, CommonViewFunction.generateObjectForSaveSearchApi = function(options) {
        var obj = {
            name: options.name,
            guid: options.guid
        }, value = options.value;
        if (value) return _.each(Enums.extractFromUrlForSearch, function(svalue, skey) {
            _.isObject(svalue) ? _.each(svalue, function(v, k) {
                var val = value[k];
                _.isUndefinedNull(val) || ("attributes" == k ? val = val.split(",") : _.contains([ "tagFilters", "entityFilters", "relationshipFilters" ], k) ? val = CommonViewFunction.attributeFilter.generateAPIObj(val) : _.contains([ "includeDE", "excludeST", "excludeSC" ], k) && (val = !val)), 
                _.contains([ "includeDE", "excludeST", "excludeSC" ], k) && (val = !!_.isUndefinedNull(val) || val), 
                obj[skey] || (obj[skey] = {}), obj[skey][v] = val;
            }) : obj[skey] = value[skey];
        }), obj;
    }, CommonViewFunction.generateUrlFromSaveSearchObject = function(options) {
        var value = options.value, classificationDefCollection = options.classificationDefCollection, entityDefCollection = options.entityDefCollection, relationshipDefCollection = options.relationshipDefCollection, obj = {};
        if (value) return _.each(Enums.extractFromUrlForSearch, function(svalue, skey) {
            _.isObject(svalue) ? _.each(svalue, function(v, k) {
                var val = value[skey][v];
                if (!_.isUndefinedNull(val)) if ("attributes" == k) val = val.join(","); else if ("tagFilters" == k) {
                    if (classificationDefCollection) {
                        var classificationDef = classificationDefCollection.fullCollection.findWhere({
                            name: value[skey].classification
                        }), attributeDefs = [];
                        classificationDef && (attributeDefs = Utils.getNestedSuperTypeObj({
                            collection: classificationDefCollection,
                            attrMerge: !0,
                            data: classificationDef.toJSON()
                        })), Globals[value[skey].typeName] && (attributeDefs = Globals[value[skey].typeName].attributeDefs), 
                        Globals._ALL_CLASSIFICATION_TYPES && Globals._ALL_CLASSIFICATION_TYPES.attributeDefs && (attributeDefs = attributeDefs.concat(Globals._ALL_CLASSIFICATION_TYPES.attributeDefs));
                    }
                    val = CommonViewFunction.attributeFilter.generateUrl({
                        value: val,
                        attributeDefs: attributeDefs
                    });
                } else if ("entityFilters" == k) {
                    if (entityDefCollection) {
                        var entityDef = entityDefCollection.fullCollection.findWhere({
                            name: value[skey].typeName
                        }), attributeDefs = [];
                        entityDef && (attributeDefs = Utils.getNestedSuperTypeObj({
                            collection: entityDefCollection,
                            attrMerge: !0,
                            data: entityDef.toJSON()
                        })), Globals[value[skey].typeName] && (attributeDefs = Globals[value[skey].typeName].attributeDefs), 
                        Globals._ALL_ENTITY_TYPES && Globals._ALL_ENTITY_TYPES.attributeDefs && (attributeDefs = attributeDefs.concat(Globals._ALL_ENTITY_TYPES.attributeDefs));
                    }
                    val = CommonViewFunction.attributeFilter.generateUrl({
                        value: val,
                        attributeDefs: attributeDefs
                    });
                } else if ("relationshipFilters" == k) {
                    if (relationshipDefCollection) {
                        var relationshipDef = relationshipDefCollection.fullCollection.findWhere({
                            name: value[skey].relationshipName
                        }), attributeDefs = [];
                        relationshipDef && (attributeDefs = Utils.getNestedSuperTypeObj({
                            collection: relationshipDefCollection,
                            attrMerge: !0,
                            data: relationshipDef.toJSON()
                        })), Globals[value[skey].relationshipName] && (attributeDefs = Globals[value[skey].relationshipName].attributeDefs);
                    }
                    val = CommonViewFunction.attributeFilter.generateUrl({
                        value: val,
                        attributeDefs: attributeDefs
                    });
                } else _.contains([ "includeDE", "excludeST", "excludeSC" ], k) && (val = !val);
                obj[k] = val;
            }) : obj[skey] = value[skey];
        }), obj;
    }, CommonViewFunction.attributeFilter = {
        generateUrl: function(options) {
            function conditionalURl(options, spliter) {
                return options ? _.map(options.rules || options.criterion, function(obj, key) {
                    if (_.has(obj, "condition")) return obj.condition + "(" + conditionalURl(obj, spliter + 1) + ")";
                    if (attributeDefs) {
                        var attributeDef = _.findWhere(attributeDefs, {
                            name: obj.attributeName
                        });
                        attributeDef && (obj.attributeValue = obj.attributeValue, obj.attributeType = attributeDef.typeName);
                    }
                    var type = obj.type || obj.attributeType, value = _.isString(obj.value) && _.contains([ "is_null", "not_null" ], obj.operator) && "date" === type || _.isObject(obj.value) ? "" : _.trim(obj.value || obj.attributeValue), url = [ obj.id || obj.attributeName, mapApiOperatorToUI(obj.operator), value ];
                    return "TIME_RANGE" === obj.operator ? value.indexOf("-") > -1 ? url[2] = value.split("-").map(function(udKey) {
                        return Date.parse(udKey.trim()).toString();
                    }).join(",") : url[2] = Enums.queryBuilderDateRangeUIValueToAPI[_.trim(value)] || value : value && value.length && "date" === type && formatedDateToLong && (url[2] = Date.parse(value)), 
                    type && url.push(type), url.join("::");
                }).join("|" + spliter + "|") : null;
            }
            function mapApiOperatorToUI(oper) {
                return Enums.queryBuilderApiOperatorToUI[oper] || oper;
            }
            var attrQuery = [], attrObj = options.value, formatedDateToLong = options.formatedDateToLong, attributeDefs = options.attributeDefs, spliter = 1;
            return attrQuery = conditionalURl(attrObj, spliter), attrQuery.length ? attrObj.condition + "(" + attrQuery + ")" : null;
        },
        extractUrl: function(options) {
            var attrObj = {}, urlObj = options.value, formatDate = options.formatDate, spliter = 1, apiObj = options.apiObj, mapUiOperatorToAPI = function(oper) {
                return Enums.queryBuilderUIOperatorToAPI[oper] || oper;
            }, createObject = function(urlObj) {
                var finalObj = {};
                return finalObj.condition = /^AND\(/.test(urlObj) ? "AND" : "OR", urlObj = "AND" === finalObj.condition ? urlObj.substr(4).slice(0, -1) : urlObj.substr(3).slice(0, -1), 
                finalObj[apiObj ? "criterion" : "rules"] = _.map(urlObj.split("|" + spliter + "|"), function(obj, key) {
                    var isStringNested = obj.split("|" + (spliter + 1) + "|").length > 1, isCondition = /^AND\(/.test(obj) || /^OR\(/.test(obj);
                    if (isStringNested && isCondition) return ++spliter, createObject(obj);
                    if (isCondition) return createObject(obj);
                    var temp = obj.split("::") || obj.split("|" + spliter + "|"), rule = {};
                    return apiObj ? (rule = {
                        attributeName: temp[0],
                        operator: mapUiOperatorToAPI(temp[1]),
                        attributeValue: _.trim(temp[2])
                    }, rule.attributeValue = "date" === rule.type && formatDate && rule.attributeValue.length ? Utils.formatDate({
                        date: parseInt(rule.attributeValue),
                        zone: !1
                    }) : rule.attributeValue) : (rule = {
                        id: temp[0],
                        operator: temp[1],
                        value: _.trim(temp[2])
                    }, temp[3] && (rule.type = temp[3]), "TIME_RANGE" === rule.operator ? temp[2].indexOf(",") > -1 ? rule.value = temp[2].split(",").map(function(udKey) {
                        return Utils.formatDate({
                            date: parseInt(udKey.trim()),
                            zone: !1
                        });
                    }).join(" - ") : rule.value = Enums.queryBuilderDateRangeAPIValueToUI[_.trim(rule.value)] || rule.value : "date" === rule.type && formatDate && rule.value.length && (rule.value = Utils.formatDate({
                        date: parseInt(rule.value),
                        zone: !1
                    }))), rule;
                }), finalObj;
            };
            return urlObj && urlObj.length ? attrObj = createObject(urlObj) : null;
        },
        generateAPIObj: function(url) {
            return url && url.length ? this.extractUrl({
                value: url,
                apiObj: !0
            }) : null;
        }
    }, CommonViewFunction.createEditGlossaryCategoryTerm = function(options) {
        if (options) {
            var model = options.model, isTermView = options.isTermView, isGlossaryView = options.isGlossaryView, collection = options.collection;
            if (model) {
                var longDescriptionContent = isGlossaryView ? model.get("longDescription") : model.longDescription, sanitizeLongDescriptionContent = "";
                longDescriptionContent && (sanitizeLongDescriptionContent = Utils.sanitizeHtmlContent({
                    data: longDescriptionContent
                }), isGlossaryView ? model.set("longDescription", sanitizeLongDescriptionContent) : model.longDescription = sanitizeLongDescriptionContent);
            }
        }
        require([ "views/glossary/CreateEditCategoryTermLayoutView", "views/glossary/CreateEditGlossaryLayoutView", "modules/Modal", "trumbowyg" ], function(CreateEditCategoryTermLayoutView, CreateEditGlossaryLayoutView, Modal) {
            var view = null, title = null;
            isGlossaryView ? (view = new CreateEditGlossaryLayoutView({
                glossaryCollection: collection,
                model: model
            }), title = "Glossary") : (view = new CreateEditCategoryTermLayoutView({
                glossaryCollection: collection,
                modelJSON: model
            }), title = isTermView ? "Term" : "Category");
            var modal = new Modal({
                title: (model ? "Update " : "Create ") + title,
                content: view,
                cancelText: "Cancel",
                okCloses: !1,
                okText: model ? "Update" : "Create",
                allowCancel: !0,
                width: "640px"
            }).open();
            modal.$el.find("button.ok").attr("disabled", "true");
            var longDescriptionEditor = modal.$el.find("textarea[data-id=longDescription]"), okBtn = modal.$el.find("button.ok"), modalOkBtn = function() {
                okBtn.removeAttr("disabled");
            };
            Utils.addCustomTextEditor({
                selector: longDescriptionEditor,
                callback: modalOkBtn,
                initialHide: !1
            }), modal.on("ok", function() {
                modal.$el.find("button.ok").showButtonLoader(), longDescriptionEditor.trumbowyg("html", Utils.sanitizeHtmlContent({
                    selector: longDescriptionEditor
                })), CommonViewFunction.createEditGlossaryCategoryTermSubmit(_.extend({
                    ref: view,
                    modal: modal
                }, options));
            }), modal.on("closeModal", function() {
                modal.trigger("cancel"), options.onModalClose && options.onModalClose(), longDescriptionEditor.trumbowyg("closeModal");
            });
        });
    }, CommonViewFunction.createEditGlossaryCategoryTermSubmit = function(options) {
        if (options) var ref = options.ref, modal = options.modal, model = options.model, node = options.node, isTermView = options.isTermView, isCategoryView = options.isCategoryView, collection = options.collection, isGlossaryView = options.isGlossaryView, data = ref.ui[isGlossaryView ? "glossaryForm" : "categoryTermForm"].serializeArray().reduce(function(obj, item) {
            return obj[item.name] = item.value.trim(), obj;
        }, {}), newModel = new options.collection.model(), messageType = "Glossary ";
        isTermView ? messageType = "Term " : isCategoryView && (messageType = "Category ");
        var ajaxOptions = {
            silent: !0,
            success: function(rModel, response) {
                var msgType = model ? "editSuccessMessage" : "addSuccessMessage";
                Utils.notifySuccess({
                    content: messageType + ref.ui.name.val() + Messages.getAbbreviationMsg(!1, msgType)
                }), options.callback && options.callback(rModel), modal.trigger("closeModal");
            },
            cust_error: function() {
                modal.$el.find("button.ok").hideButtonLoader();
            }
        };
        if (model) isGlossaryView ? model.clone().set(data, {
            silent: !0
        }).save(null, ajaxOptions) : newModel[isTermView ? "createEditTerm" : "createEditCategory"](_.extend(ajaxOptions, {
            guid: model.guid,
            data: JSON.stringify(_.extend({}, model, data))
        })); else if (isGlossaryView) new collection.model().set(data).save(null, ajaxOptions); else {
            if (node) {
                data.anchor = {
                    glossaryGuid: node.glossaryId || node.guid,
                    displayText: node.glossaryName || node.text
                }, "GlossaryCategory" == node.type && (data.parentCategory = {
                    categoryGuid: node.guid
                });
            }
            newModel[isTermView ? "createEditTerm" : "createEditCategory"](_.extend(ajaxOptions, {
                data: JSON.stringify(data)
            }));
        }
    }, CommonViewFunction.removeCategoryTermAssociation = function(options) {
        if (options) {
            var selectedGuid = options.selectedGuid, termGuid = options.termGuid, isCategoryView = options.isCategoryView, isTermView = options.isTermView, isEntityView = options.isEntityView, model = (options.collection, 
            options.model), newModel = new options.collection.model(), noticeRef = null, ajaxOptions = {
                success: function(rModel, response) {
                    noticeRef && noticeRef.remove(), Utils.notifySuccess({
                        content: (isCategoryView || isEntityView ? "Term" : "Category") + " association is removed successfully"
                    }), options.callback && options.callback();
                },
                cust_error: function() {
                    noticeRef && noticeRef.hideButtonLoader(), options.hideLoader && options.hideLoader();
                }
            }, notifyObj = {
                modal: !0,
                okCloses: !1,
                okShowLoader: !0,
                text: options.msg,
                title: options.titleMessage,
                okText: options.buttonText,
                ok: function(notice) {
                    if (noticeRef = notice, options.showLoader && options.showLoader(), isEntityView && model) {
                        var data = [ model ];
                        newModel.removeTermFromEntity(termGuid, _.extend(ajaxOptions, {
                            data: JSON.stringify(data)
                        }));
                    } else {
                        var data = _.extend({}, model);
                        isTermView ? data.categories = _.reject(data.categories, function(term) {
                            return term.categoryGuid == selectedGuid;
                        }) : data.terms = _.reject(data.terms, function(term) {
                            return term.termGuid == selectedGuid;
                        }), newModel[isTermView ? "createEditTerm" : "createEditCategory"](_.extend(ajaxOptions, {
                            guid: model.guid,
                            data: JSON.stringify(_.extend({}, model, data))
                        }));
                    }
                },
                cancel: function() {}
            };
            Utils.notifyConfirm(notifyObj);
        }
    }, CommonViewFunction.addRestCsrfCustomHeader = function(xhr, settings) {
        if (null != settings.url) {
            var method = settings.type, csrfToken = CommonViewFunction.restCsrfValue;
            null == CommonViewFunction.restCsrfCustomHeader || CommonViewFunction.restCsrfMethodsToIgnore[method] || xhr.setRequestHeader(CommonViewFunction.restCsrfCustomHeader, csrfToken);
        }
    }, CommonViewFunction.restCsrfCustomHeader = null, CommonViewFunction.restCsrfMethodsToIgnore = null, 
    CommonViewFunction.userDataFetch = function(options) {
        function getTrimmedStringArrayValue(string) {
            var str = string, array = [];
            if (str) for (var splitStr = str.split(","), i = 0; i < splitStr.length; i++) array.push(splitStr[i].trim());
            return array;
        }
        var csrfEnabled = !1, header = null, methods = [];
        options.url && $.ajax({
            url: options.url,
            success: function(response) {
                if (response) {
                    if (response["atlas.rest-csrf.enabled"]) {
                        var str = "" + response["atlas.rest-csrf.enabled"];
                        csrfEnabled = "true" == str.toLowerCase();
                    }
                    if (response["atlas.rest-csrf.custom-header"] && (header = response["atlas.rest-csrf.custom-header"].trim()), 
                    response["atlas.rest-csrf.methods-to-ignore"] && (methods = getTrimmedStringArrayValue(response["atlas.rest-csrf.methods-to-ignore"])), 
                    csrfEnabled) {
                        CommonViewFunction.restCsrfCustomHeader = header, CommonViewFunction.restCsrfMethodsToIgnore = {}, 
                        CommonViewFunction.restCsrfValue = response._csrfToken || '""', methods.map(function(method) {
                            CommonViewFunction.restCsrfMethodsToIgnore[method] = !0;
                        });
                        var statusCodeErrorFn = function(error) {
                            Utils.defaultErrorHandler(null, error);
                        };
                        Backbone.$.ajaxSetup({
                            statusCode: {
                                401: statusCodeErrorFn,
                                419: statusCodeErrorFn,
                                403: statusCodeErrorFn
                            },
                            beforeSend: CommonViewFunction.addRestCsrfCustomHeader
                        });
                    }
                }
            },
            complete: function(response) {
                options.callback && options.callback(response.responseJSON);
            }
        });
    }, CommonViewFunction.CheckDuplicateAndEmptyInput = function(elements, datalist) {
        for (var keyMap = new Map(), validation = !0, hasDup = [], i = 0; i < elements.length; i++) {
            var input = elements[i], pEl = input.nextElementSibling, classes = "form-control", val = input.value.trim();
            if (pEl.innerText = "", "" === val) validation = !1, pEl.innerText = "Required!"; else if (val.includes(":")) {
                validation = !1;
                var errorText = $(".errorMsg[data-id='charSupportMsg']").text();
                errorText && 0 === errorText.length && (pEl.innerText = "These special character '(:)' are not supported.");
            } else if ("INPUT" === input.tagName) {
                var duplicates = datalist.filter(function(c) {
                    return c.key === val;
                });
                keyMap.has(val) || duplicates.length > 1 ? (classes = "form-control errorClass", 
                hasDup.push("duplicate"), pEl.innerText = "Duplicate key") : keyMap.set(val, val);
            }
            validation === !1 && (classes = "form-control errorClass"), input.setAttribute("class", classes);
        }
        return {
            validation: validation,
            hasDuplicate: 0 !== hasDup.length
        };
    }, CommonViewFunction.getRandomIdAndAnchor = function() {
        var randomId = "collapse_" + parseInt(100 * Math.random()) + "_" + new Date().getUTCMilliseconds();
        return {
            id: randomId,
            anchor: "#" + randomId
        };
    }, CommonViewFunction.udKeysStringParser = function(udKeys) {
        var o = {};
        return _.each(udKeys.split(","), function(udKey) {
            var ud = udKey.split(":");
            o[ud[0]] = ud[1];
        }), o;
    }, CommonViewFunction.udKeysObjectToStringParser = function(udKeys) {
        var list = _.map(udKeys, function(udKey) {
            var t = udKey.key + ":" + udKey.value;
            return t;
        });
        return list.join(",");
    }, CommonViewFunction.fetchRootEntityAttributes = function(options) {
        $.ajax({
            url: options.url,
            methods: "GET",
            dataType: "json",
            cache: !0,
            success: function(response) {
                response && _.each(options.entity, function(rootEntity) {
                    Globals[rootEntity] = $.extend(!0, {}, response, {
                        name: rootEntity,
                        guid: rootEntity
                    });
                });
            },
            complete: function(response) {
                options.callback && options.callback(response);
            }
        });
    }, CommonViewFunction.fetchRootClassificationAttributes = function(options) {
        $.ajax({
            url: options.url,
            methods: "GET",
            dataType: "json",
            cache: !0,
            success: function(response) {
                response && _.each(options.classification, function(rootClassification) {
                    Globals[rootClassification] = $.extend(!0, {}, response, {
                        name: rootClassification,
                        guid: rootClassification
                    });
                });
            },
            complete: function(response) {
                options.callback && options.callback(response);
            }
        });
    }, CommonViewFunction;
});