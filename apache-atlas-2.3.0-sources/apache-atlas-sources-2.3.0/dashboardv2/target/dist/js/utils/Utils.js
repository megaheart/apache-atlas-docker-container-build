define([ "require", "utils/Globals", "pnotify", "utils/Messages", "utils/Enums", "moment", "store", "modules/Modal", "DOMPurify", "moment-timezone", "pnotify.buttons", "pnotify.confirm", "trumbowyg" ], function(require, Globals, pnotify, Messages, Enums, moment, store, Modal, DOMPurify) {
    "use strict";
    var Utils = {}, prevNetworkErrorTime = 0;
    Utils.generatePopover = function(options) {
        if (options.el) {
            var defaultObj = {
                placement: "auto bottom",
                html: !0,
                animation: !1,
                container: "body",
                sanitize: !1
            };
            return (options.viewFixedPopover || options.contentClass) && (defaultObj.template = '<div class="popover ' + (options.viewFixedPopover ? "fixed-popover" : "") + ' fade bottom"><div class="arrow"></div><h3 class="popover-title"></h3><div class="' + (options.contentClass ? options.contentClass : "") + ' popover-content"></div></div>'), 
            options.el.popover(_.extend(defaultObj, options.popoverOptions));
        }
    }, Utils.getNumberSuffix = function(options) {
        if (options && options.number) {
            var n = options.number, s = [ "th", "st", "nd", "rd" ], v = n % 100, suffix = s[(v - 20) % 10] || s[v] || s[0];
            return n + (options.sup ? "<sup>" + suffix + "</sup>" : suffix);
        }
    }, Utils.generateUUID = function() {
        var d = new Date().getTime();
        window.performance && "function" == typeof window.performance.now && (d += performance.now());
        var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = (d + 16 * Math.random()) % 16 | 0;
            return d = Math.floor(d / 16), ("x" == c ? r : 3 & r | 8).toString(16);
        });
        return uuid;
    }, Utils.getBaseUrl = function(url) {
        return url.replace(/\/[\w-]+.(jsp|html)|\/+$/gi, "");
    }, Utils.getEntityIconPath = function(options) {
        function getImgPath(imageName) {
            return iconBasePath + (Enums.entityStateReadOnly[status] ? "disabled/" + imageName : imageName);
        }
        function getDefaultImgPath() {
            return entityData.isProcess ? Enums.entityStateReadOnly[status] ? iconBasePath + "disabled/process.png" : iconBasePath + "process.png" : Enums.entityStateReadOnly[status] ? iconBasePath + "disabled/table.png" : iconBasePath + "table.png";
        }
        var serviceType, status, typeName, entityData = options && options.entityData, iconBasePath = Utils.getBaseUrl(window.location.pathname) + Globals.entityImgPath;
        if (entityData && (typeName = entityData.typeName, serviceType = entityData && entityData.serviceType, 
        status = entityData && entityData.status), entityData) {
            if (options.errorUrl) {
                var isErrorInTypeName = !(!options.errorUrl || !options.errorUrl.match("entity-icon/" + typeName + ".png|disabled/" + typeName + ".png"));
                if (serviceType && isErrorInTypeName) {
                    var imageName = serviceType + ".png";
                    return getImgPath(imageName);
                }
                return getDefaultImgPath();
            }
            if (entityData.typeName) {
                var imageName = entityData.typeName + ".png";
                return getImgPath(imageName);
            }
            return getDefaultImgPath();
        }
    }, pnotify.prototype.options.styling = "fontawesome";
    var notify = function(options) {
        return new pnotify(_.extend({
            icon: !0,
            hide: !0,
            delay: 3e3,
            remove: !0,
            buttons: {
                classes: {
                    closer: "fa fa-times",
                    pin_up: "fa fa-pause",
                    pin_down: "fa fa-play"
                }
            }
        }, options));
    };
    return Utils.notifyInfo = function(options) {
        notify({
            type: "info",
            text: (options.html ? options.content : _.escape(options.content)) || "Info message."
        });
    }, Utils.notifyWarn = function(options) {
        notify({
            type: "notice",
            text: (options.html ? options.content : _.escape(options.content)) || "Info message."
        });
    }, Utils.notifyError = function(options) {
        notify({
            type: "error",
            text: (options.html ? options.content : _.escape(options.content)) || "Error occurred."
        });
    }, Utils.notifySuccess = function(options) {
        notify({
            type: "success",
            text: (options.html ? options.content : _.escape(options.content)) || "Error occurred."
        });
    }, Utils.notifyConfirm = function(options) {
        var modal = {};
        if (options && options.modal) {
            var myStack = {
                dir1: "down",
                dir2: "right",
                push: "top",
                modal: !0
            };
            modal.addclass = "stack-modal " + (options.modalClass ? modalClass : "width-500"), 
            modal.stack = myStack;
        }
        notify(_.extend({
            title: "Confirmation",
            hide: !1,
            confirm: {
                confirm: !0,
                buttons: [ {
                    text: options.cancelText || "Cancel",
                    addClass: "btn-action btn-md cancel",
                    click: function(notice) {
                        options.cancel(notice), notice.remove();
                    }
                }, {
                    text: options.okText || "Ok",
                    addClass: "btn-atlas btn-md ok",
                    click: function(notice) {
                        options.ok && options.ok($.extend({}, notice, {
                            hideButtonLoader: function() {
                                notice.container.find("button.ok").hideButtonLoader();
                            },
                            showButtonLoader: function() {
                                notice.container.find("button.ok").showButtonLoader();
                            }
                        })), options.okShowLoader && notice.container.find("button.ok").showButtonLoader(), 
                        options.okCloses !== !1 && notice.remove();
                    }
                } ]
            },
            buttons: {
                closer: !1,
                sticker: !1
            },
            history: {
                history: !1
            }
        }, modal, options)).get().on("pnotify.confirm", function() {
            options.ok && options.ok();
        }).on("pnotify.cancel", function() {
            options.cancel && options.cancel();
        });
    }, Utils.defaultErrorHandler = function(model, error, options) {
        var skipDefaultError = null, defaultErrorMessage = null;
        options && (skipDefaultError = options.skipDefaultError, defaultErrorMessage = options.defaultErrorMessage);
        var redirectToLoginPage = function() {
            Utils.localStorage.setValue("last_ui_load", "v1"), window.location = "login.jsp";
        };
        if (error && error.status) if (401 == error.status) redirectToLoginPage(); else if (419 == error.status) redirectToLoginPage(); else if (403 == error.status) Utils.serverErrorHandler(error, "You are not authorized"); else if ("0" == error.status && "abort" != error.statusText) {
            var diffTime = new Date().getTime() - prevNetworkErrorTime;
            diffTime > 3e3 && (prevNetworkErrorTime = new Date().getTime(), Utils.notifyError({
                content: "Network Connection Failure : It seems you are not connected to the internet. Please check your internet connection and try again"
            }));
        } else skipDefaultError !== !0 && Utils.serverErrorHandler(error, defaultErrorMessage); else skipDefaultError !== !0 && Utils.serverErrorHandler(error, defaultErrorMessage);
    }, Utils.serverErrorHandler = function(response, defaultErrorMessage) {
        var responseJSON = response ? response.responseJSON : response, message = defaultErrorMessage ? defaultErrorMessage : Messages.defaultErrorMessage;
        response && responseJSON && (message = responseJSON.errorMessage || responseJSON.message || responseJSON.error || message);
        var existingError = $(".ui-pnotify-container.alert-danger .ui-pnotify-text").text();
        existingError !== message && Utils.notifyError({
            content: message
        });
    }, Utils.cookie = {
        setValue: function(cname, cvalue) {
            document.cookie = cname + "=" + cvalue + "; ";
        },
        getValue: function(findString) {
            for (var ca = document.cookie.split(";"), i = 0; i < ca.length; i++) {
                for (var c = ca[i]; " " == c.charAt(0); ) c = c.substring(1);
                if (0 == c.indexOf(name)) return c.substring(name.length, c.length);
            }
            return "";
        }
    }, Utils.localStorage = function() {
        this.setValue = function() {
            localStorage.setItem(arguments[0], arguments[1]);
        }, this.getValue = function(key, value) {
            var keyValue = localStorage.getItem(key);
            return keyValue && "undefined" != keyValue || void 0 == value ? "" === keyValue || "undefined" === keyValue || "null" === keyValue ? null : keyValue : this.setLocalStorage(key, value);
        }, this.removeValue = function() {
            localStorage.removeItem(arguments[0]);
        }, "undefined" == typeof Storage && (_.extend(this, Utils.cookie), console.log("Sorry! No Web Storage support"));
    }, Utils.localStorage = new Utils.localStorage(), Utils.setUrl = function(options) {
        if (options) {
            if (options.mergeBrowserUrl) {
                var param = Utils.getUrlState.getQueryParams();
                param && (options.urlParams = $.extend(param, options.urlParams));
            }
            if (options.urlParams) {
                var urlParams = "?";
                _.each(options.urlParams, function(value, key, obj) {
                    value && (value = encodeURIComponent(String(value)), urlParams += key + "=" + value + "&");
                }), urlParams = urlParams.slice(0, -1), options.url += urlParams;
            }
            if (options.updateTabState) {
                var urlUpdate = {
                    stateChanged: !0
                };
                Utils.getUrlState.isTagTab(options.url) ? urlUpdate.tagUrl = options.url : Utils.getUrlState.isSearchTab(options.url) ? urlUpdate.searchUrl = options.url : Utils.getUrlState.isGlossaryTab(options.url) ? urlUpdate.glossaryUrl = options.url : Utils.getUrlState.isAdministratorTab(options.url) ? urlUpdate.administratorUrl = options.url : Utils.getUrlState.isDebugMetricsTab(options.url) ? urlUpdate.debugMetricsUrl = options.url : Utils.getUrlState.isRelationTab(options.url) && (urlUpdate.relationUrl = options.url), 
                $.extend(Globals.saveApplicationState.tabState, urlUpdate);
            }
            Backbone.history.navigate(options.url, {
                trigger: void 0 == options.trigger || options.trigger
            });
        }
    }, Utils.getUrlState = {
        getQueryUrl: function(url) {
            var hashValue = window.location.hash;
            return url && (hashValue = url), {
                firstValue: hashValue.split("/")[1],
                hash: hashValue,
                queyParams: hashValue.split("?"),
                lastValue: hashValue.split("/")[hashValue.split("/").length - 1]
            };
        },
        checkTabUrl: function(options) {
            var url = options && options.url, matchString = options && options.matchString, quey = this.getQueryUrl(url);
            return quey.firstValue == matchString || quey.queyParams[0] == "#!/" + matchString;
        },
        isInitial: function() {
            return void 0 == this.getQueryUrl().firstValue;
        },
        isTagTab: function(url) {
            return this.checkTabUrl({
                url: url,
                matchString: "tag"
            });
        },
        isBSDetail: function(url) {
            var quey = this.getQueryUrl(url);
            return quey.queyParams[0].indexOf("administrator/businessMetadata") > -1;
        },
        isSearchTab: function(url) {
            return this.checkTabUrl({
                url: url,
                matchString: "search"
            });
        },
        isRelationTab: function(url) {
            return this.checkTabUrl({
                url: url,
                matchString: "relationship"
            });
        },
        isAdministratorTab: function(url) {
            return this.checkTabUrl({
                url: url,
                matchString: "administrator"
            });
        },
        isDebugMetricsTab: function(url) {
            return this.checkTabUrl({
                url: url,
                matchString: "debugMetrics"
            });
        },
        isGlossaryTab: function(url) {
            return this.checkTabUrl({
                url: url,
                matchString: "glossary"
            });
        },
        isDetailPage: function(url) {
            return this.checkTabUrl({
                url: url,
                matchString: "detailPage"
            });
        },
        isRelationshipDetailPage: function(url) {
            return this.checkTabUrl({
                url: url,
                matchString: "relationshipDetailPage"
            });
        },
        getLastValue: function() {
            return this.getQueryUrl().lastValue;
        },
        getFirstValue: function() {
            return this.getQueryUrl().firstValue;
        },
        getQueryParams: function(url) {
            var qs = this.getQueryUrl(url).queyParams[1];
            if ("string" == typeof qs) {
                qs = qs.split("+").join(" ");
                for (var tokens, params = {}, re = /[?&]?([^=]+)=([^&]*)/g; tokens = re.exec(qs); ) params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
                return params;
            }
        },
        getKeyValue: function(key) {
            var paramsObj = this.getQueryParams();
            if (!key.length) return paramsObj[key];
            var values = [];
            _.each(key, function(objKey) {
                var obj = {};
                return obj[objKey] = paramsObj[objKey], values.push(obj), values;
            });
        }
    }, Utils.getName = function() {
        return Utils.extractKeyValueFromEntity.apply(this, arguments).name;
    }, Utils.getNameWithProperties = function() {
        return Utils.extractKeyValueFromEntity.apply(this, arguments);
    }, Utils.extractKeyValueFromEntity = function() {
        var collectionJSON = arguments[0], priorityAttribute = arguments[1], skipAttribute = arguments[2], returnObj = {
            name: "-",
            found: !0,
            key: null
        };
        if (collectionJSON) {
            if (collectionJSON.attributes && collectionJSON.attributes[priorityAttribute]) return returnObj.name = _.escape(collectionJSON.attributes[priorityAttribute]), 
            returnObj.key = priorityAttribute, returnObj;
            if (collectionJSON[priorityAttribute]) return returnObj.name = _.escape(collectionJSON[priorityAttribute]), 
            returnObj.key = priorityAttribute, returnObj;
            if (collectionJSON.attributes) {
                if (collectionJSON.attributes.name) return returnObj.name = _.escape(collectionJSON.attributes.name), 
                returnObj.key = "name", returnObj;
                if (collectionJSON.attributes.displayName) return returnObj.name = _.escape(collectionJSON.attributes.displayName), 
                returnObj.key = "displayName", returnObj;
                if (collectionJSON.attributes.qualifiedName) return returnObj.name = _.escape(collectionJSON.attributes.qualifiedName), 
                returnObj.key = "qualifiedName", returnObj;
                if (collectionJSON.attributes.displayText) return returnObj.name = _.escape(collectionJSON.attributes.displayText), 
                returnObj.key = "displayText", returnObj;
                if (collectionJSON.attributes.guid) return returnObj.name = _.escape(collectionJSON.attributes.guid), 
                returnObj.key = "guid", returnObj;
                if (collectionJSON.attributes.id) return _.isObject(collectionJSON.attributes.id) ? collectionJSON.id.id && (returnObj.name = _.escape(collectionJSON.attributes.id.id)) : returnObj.name = _.escape(collectionJSON.attributes.id), 
                returnObj.key = "id", returnObj;
            }
            if (collectionJSON.name) return returnObj.name = _.escape(collectionJSON.name), 
            returnObj.key = "name", returnObj;
            if (collectionJSON.displayName) return returnObj.name = _.escape(collectionJSON.displayName), 
            returnObj.key = "displayName", returnObj;
            if (collectionJSON.qualifiedName) return returnObj.name = _.escape(collectionJSON.qualifiedName), 
            returnObj.key = "qualifiedName", returnObj;
            if (collectionJSON.displayText) return returnObj.name = _.escape(collectionJSON.displayText), 
            returnObj.key = "displayText", returnObj;
            if (collectionJSON.guid) return returnObj.name = _.escape(collectionJSON.guid), 
            returnObj.key = "guid", returnObj;
            if (collectionJSON.id) return _.isObject(collectionJSON.id) ? collectionJSON.id.id && (returnObj.name = _.escape(collectionJSON.id.id)) : returnObj.name = _.escape(collectionJSON.id), 
            returnObj.key = "id", returnObj;
        }
        return returnObj.found = !1, skipAttribute && returnObj.key == skipAttribute ? {
            name: "-",
            found: !0,
            key: null
        } : returnObj;
    }, Utils.backButtonClick = function() {
        var queryParams = Utils.getUrlState.getQueryParams(), urlPath = "searchUrl";
        queryParams && queryParams.from && ("classification" == queryParams.from ? urlPath = "tagUrl" : "glossary" == queryParams.from ? urlPath = "glossaryUrl" : "bm" == queryParams.from && (urlPath = "administratorUrl")), 
        Globals.fromRelationshipSearch && (urlPath = "relationUrl"), Utils.setUrl({
            url: Globals.saveApplicationState.tabState[urlPath],
            mergeBrowserUrl: !1,
            trigger: !0,
            updateTabState: !0
        });
    }, Utils.showTitleLoader = function(loaderEl, titleBoxEl) {
        loaderEl.css ? loaderEl.css({
            display: "block",
            position: "relative",
            height: "85px",
            marginTop: "85px",
            marginLeft: "50%",
            left: "0%"
        }) : null, titleBoxEl.hide ? titleBoxEl.hide() : null;
    }, Utils.hideTitleLoader = function(loaderEl, titleBoxEl) {
        loaderEl.hide ? loaderEl.hide() : null, titleBoxEl.fadeIn ? titleBoxEl.fadeIn() : null;
    }, Utils.findAndMergeRefEntity = function(options) {
        var attributeObject = options.attributeObject, referredEntities = options.referredEntities, mergeObject = function(obj) {
            obj && (obj.attributes ? Utils.findAndMergeRefEntity({
                attributeObject: obj.attributes,
                referredEntities: referredEntities
            }) : referredEntities[obj.guid] && _.extend(obj, referredEntities[obj.guid]));
        };
        attributeObject && referredEntities && _.each(attributeObject, function(obj, key) {
            _.isObject(obj) && (_.isArray(obj) ? _.each(obj, function(value) {
                mergeObject(value);
            }) : mergeObject(obj));
        });
    }, Utils.findAndMergeRelationShipEntity = function(options) {
        var attributeObject = options.attributeObject, relationshipAttributes = options.relationshipAttributes;
        _.each(attributeObject, function(val, key) {
            if (relationshipAttributes && relationshipAttributes[key]) {
                var relationShipVal = relationshipAttributes[key];
                _.isObject(val) && (_.isArray(val) ? _.each(val, function(attr) {
                    if (attr && void 0 === attr.attributes) {
                        var entityFound = _.find(relationShipVal, {
                            guid: attr.guid
                        });
                        entityFound && (attr.attributes = _.omit(entityFound, "typeName", "guid", "entityStatus"), 
                        attr.status = entityFound.entityStatus);
                    }
                }) : relationShipVal && void 0 === val.attributes && (val.attributes = _.omit(relationShipVal, "typeName", "guid", "entityStatus"), 
                val.status = relationShipVal.entityStatus));
            }
        });
    }, Utils.getNestedSuperTypes = function(options) {
        var data = options.data, collection = options.collection, superTypes = [], getData = function(data, collection) {
            data && (superTypes = superTypes.concat(data.superTypes), data.superTypes && data.superTypes.length && _.each(data.superTypes, function(superTypeName) {
                if (collection.fullCollection) var collectionData = collection.fullCollection.findWhere({
                    name: superTypeName
                }).toJSON(); else var collectionData = collection.findWhere({
                    name: superTypeName
                }).toJSON();
                getData(collectionData, collection);
            }));
        };
        return getData(data, collection), _.uniq(superTypes);
    }, Utils.getNestedSuperTypeObj = function(options) {
        var mainData = options.data, collection = options.collection, attrMerge = options.attrMerge, seperateRelatioshipAttr = options.seperateRelatioshipAttr || !1, mergeRelationAttributes = options.mergeRelationAttributes || !seperateRelatioshipAttr;
        if (mergeRelationAttributes && seperateRelatioshipAttr) throw "Both mergeRelationAttributes & seperateRelatioshipAttr cannot be true!";
        var attributeDefs = {};
        attrMerge && !seperateRelatioshipAttr ? attributeDefs = [] : options.attrMerge && seperateRelatioshipAttr && (attributeDefs = {
            attributeDefs: [],
            relationshipAttributeDefs: []
        });
        var getRelationshipAttributeDef = function(data) {
            return _.filter(data.relationshipAttributeDefs, function(obj, key) {
                return obj;
            });
        }, getData = function(data, collection) {
            options.attrMerge ? seperateRelatioshipAttr ? (attributeDefs.attributeDefs = attributeDefs.attributeDefs.concat(data.attributeDefs), 
            attributeDefs.relationshipAttributeDefs = attributeDefs.relationshipAttributeDefs.concat(getRelationshipAttributeDef(data))) : (attributeDefs = attributeDefs.concat(data.attributeDefs), 
            mergeRelationAttributes && (attributeDefs = attributeDefs.concat(getRelationshipAttributeDef(data)))) : attributeDefs[data.name] ? attributeDefs[data.name] = _.toArrayifObject(attributeDefs[data.name]).concat(data.attributeDefs) : seperateRelatioshipAttr ? attributeDefs[data.name] = {
                attributeDefs: data.attributeDefs,
                relationshipAttributeDefs: data.relationshipAttributeDefs
            } : (attributeDefs[data.name] = data.attributeDefs, mergeRelationAttributes && (attributeDefs[data.name] = _.toArrayifObject(attributeDefs[data.name]).concat(getRelationshipAttributeDef(data)))), 
            data.superTypes && data.superTypes.length && _.each(data.superTypes, function(superTypeName) {
                if (collection.fullCollection) var collectionData = collection.fullCollection.findWhere({
                    name: superTypeName
                }); else var collectionData = collection.findWhere({
                    name: superTypeName
                });
                return collectionData = collectionData && collectionData.toJSON ? collectionData.toJSON() : collectionData, 
                collectionData ? getData(collectionData, collection) : void 0;
            });
        };
        return getData(mainData, collection), attrMerge && (attributeDefs = seperateRelatioshipAttr ? {
            attributeDefs: _.uniq(_.sortBy(attributeDefs.attributeDefs, "name"), !0, function(obj) {
                return obj.name;
            }),
            relationshipAttributeDefs: _.uniq(_.sortBy(attributeDefs.relationshipAttributeDefs, "name"), !0, function(obj) {
                return obj.name + obj.relationshipTypeName;
            })
        } : _.uniq(_.sortBy(attributeDefs, "name"), !0, function(obj) {
            return obj.relationshipTypeName ? obj.name + obj.relationshipTypeName : obj.name;
        })), attributeDefs;
    }, Utils.getProfileTabType = function(profileData, skipData) {
        var parseData = profileData.distributionData;
        _.isString(parseData) && (parseData = JSON.parse(parseData));
        var createData = function(type) {
            var orderValue = [], sort = !1;
            if ("date" === type) {
                var dateObj = {};
                return _.keys(parseData).map(function(key) {
                    var splitValue = key.split(":");
                    dateObj[splitValue[0]] || (dateObj[splitValue[0]] = {
                        value: splitValue[0],
                        monthlyCounts: {},
                        totalCount: 0
                    }), dateObj[splitValue[0]] && "count" == splitValue[1] && (dateObj[splitValue[0]].count = parseData[key]), 
                    dateObj[splitValue[0]] && "count" !== splitValue[1] && (dateObj[splitValue[0]].monthlyCounts[splitValue[1]] = parseData[key], 
                    dateObj[splitValue[0]].count || (dateObj[splitValue[0]].totalCount += parseData[key]));
                }), _.toArray(dateObj).map(function(obj) {
                    return !obj.count && obj.totalCount && (obj.count = obj.totalCount), obj;
                });
            }
            var data = [];
            return profileData.distributionKeyOrder ? orderValue = profileData.distributionKeyOrder : (sort = !0, 
            orderValue = _.keys(parseData)), _.each(orderValue, function(key) {
                parseData[key] && data.push({
                    value: key,
                    count: parseData[key]
                });
            }), sort && (data = _.sortBy(data, function(o) {
                return o.value.toLowerCase();
            })), data;
        };
        if (profileData && profileData.distributionType) {
            if ("count-frequency" === profileData.distributionType) return {
                type: "string",
                label: Enums.profileTabType[profileData.distributionType],
                actualObj: skipData ? null : createData("string"),
                xAxisLabel: "FREQUENCY",
                yAxisLabel: "COUNT"
            };
            if ("decile-frequency" === profileData.distributionType) return {
                label: Enums.profileTabType[profileData.distributionType],
                type: "numeric",
                xAxisLabel: "DECILE RANGE",
                actualObj: skipData ? null : createData("numeric"),
                yAxisLabel: "FREQUENCY"
            };
            if ("annual" === profileData.distributionType) return {
                label: Enums.profileTabType[profileData.distributionType],
                type: "date",
                xAxisLabel: "",
                actualObj: skipData ? null : createData("date"),
                yAxisLabel: "COUNT"
            };
        }
    }, Utils.isUrl = function(url) {
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return regexp.test(url);
    }, Utils.JSONPrettyPrint = function(obj, getValue) {
        var replacer = function(match, pIndent, pKey, pVal, pEnd) {
            var key = "<span class=json-key>", val = "<span class=json-value>", str = "<span class=json-string>", r = pIndent || "";
            return pKey && (r = r + key + pKey.replace(/[": ]/g, "") + "</span>: "), pVal && (r = r + ('"' == pVal[0] ? str : val) + getValue(pVal) + "</span>"), 
            r + (pEnd || "");
        }, jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/gm;
        return obj && _.isObject(obj) ? JSON.stringify(obj, null, 3).replace(/&/g, "&amp;").replace(/\\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(jsonLine, replacer) : {};
    }, $.fn.toggleAttribute = function(attributeName, firstString, secondString) {
        this.attr(attributeName) == firstString ? this.attr(attributeName, secondString) : this.attr(attributeName, firstString);
    }, Utils.millisecondsToTime = function(duration) {
        var milliseconds = parseInt(duration % 1e3 / 100), seconds = parseInt(duration / 1e3 % 60), minutes = parseInt(duration / 6e4 % 60), hours = parseInt(duration / 36e5 % 24);
        return hours = hours < 10 ? "0" + hours : hours, minutes = minutes < 10 ? "0" + minutes : minutes, 
        seconds = seconds < 10 ? "0" + seconds : seconds, hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    }, Utils.togglePropertyRelationshipTableEmptyValues = function(object) {
        var inputSelector = object.inputType, tableEl = object.tableEl;
        1 == inputSelector.prop("checked") ? tableEl.removeClass("hide-empty-value") : tableEl.addClass("hide-empty-value");
    }, $.fn.showButtonLoader = function() {
        $(this).attr("disabled", "true").addClass("button-loader"), $(this).siblings("button.cancel").prop("disabled", !0);
    }, $.fn.hideButtonLoader = function() {
        $(this).removeClass("button-loader").removeAttr("disabled"), $(this).siblings("button.cancel").prop("disabled", !1);
    }, Utils.formatDate = function(options) {
        var dateValue = null, dateFormat = Globals.dateTimeFormat, isValidDate = !1;
        return options && options.date && (dateValue = options.date, "-" !== dateValue && (dateValue = parseInt(dateValue), 
        _.isNaN(dateValue) && (dateValue = options.date), dateValue = moment(dateValue), 
        dateValue._isValid && (isValidDate = !0, dateValue = dateValue.format(dateFormat)))), 
        "-" !== dateValue && (isValidDate === !1 && options && options.defaultDate !== !1 && (dateValue = moment().format(dateFormat)), 
        Globals.isTimezoneFormatEnabled && (!options || options && options.zone !== !1) && (dateValue += " (" + moment.tz(moment.tz.guess()).zoneAbbr() + ")")), 
        dateValue;
    }, $.fn.idleTimeout = function(userRuntimeConfig) {
        var activityDetector, startKeepSessionAlive, stopKeepSessionAlive, keepSession, keepAlivePing, idleTimer, remainingTimer, checkIdleTimeout, checkIdleTimeoutLoop, startIdleTimer, stopIdleTimer, openWarningDialog, dialogTimer, checkDialogTimeout, startDialogTimer, stopDialogTimer, isDialogOpen, destroyWarningDialog, countdownDisplay, logoutUser, defaultConfig = {
            redirectUrl: Utils.getBaseUrl(window.location.pathname) + "/index.html?action=timeout",
            idleTimeLimit: Globals.idealTimeoutSeconds,
            idleCheckHeartbeat: 2,
            customCallback: !1,
            activityEvents: "click keypress scroll wheel mousewheel mousemove",
            enableDialog: !0,
            dialogDisplayLimit: 10,
            dialogTitle: "Your session is about to expire!",
            dialogText: "Your session is about to expire.",
            dialogTimeRemaining: "You will be logged out in ",
            dialogStayLoggedInButton: "Stay Logged In",
            dialogLogOutNowButton: "Logout",
            errorAlertMessage: 'Please disable "Private Mode", or upgrade to a modern browser. Or perhaps a dependent file missing. Please see: https://github.com/marcuswestin/store.js',
            sessionKeepAliveTimer: 600,
            sessionKeepAliveUrl: window.location.href
        }, currentConfig = $.extend(defaultConfig, userRuntimeConfig);
        document.title;
        return this.logout = function() {
            store.set("idleTimerLoggedOut", !0);
        }, startKeepSessionAlive = function() {
            keepSession = function() {
                $.get(currentConfig.sessionKeepAliveUrl), startKeepSessionAlive();
            }, keepAlivePing = setTimeout(keepSession, 1e3 * currentConfig.sessionKeepAliveTimer);
        }, stopKeepSessionAlive = function() {
            clearTimeout(keepAlivePing);
        }, activityDetector = function() {
            $("body").on(currentConfig.activityEvents, function() {
                (!currentConfig.enableDialog || currentConfig.enableDialog && isDialogOpen() !== !0) && (startIdleTimer(), 
                $("#activity").effect("shake"));
            });
        }, checkIdleTimeout = function() {
            var timeIdleTimeout = store.get("idleTimerLastActivity") + 1e3 * currentConfig.idleTimeLimit;
            $.now() > timeIdleTimeout ? currentConfig.enableDialog ? currentConfig.enableDialog && isDialogOpen() !== !0 && (openWarningDialog(), 
            startDialogTimer()) : logoutUser() : store.get("idleTimerLoggedOut") === !0 ? logoutUser() : currentConfig.enableDialog && isDialogOpen() === !0 && (destroyWarningDialog(), 
            stopDialogTimer());
        }, startIdleTimer = function() {
            stopIdleTimer(), store.set("idleTimerLastActivity", $.now()), checkIdleTimeoutLoop();
        }, checkIdleTimeoutLoop = function() {
            checkIdleTimeout(), idleTimer = setTimeout(checkIdleTimeoutLoop, 1e3 * currentConfig.idleCheckHeartbeat);
        }, stopIdleTimer = function() {
            clearTimeout(idleTimer);
        }, openWarningDialog = function() {
            var dialogContent = "<div id='idletimer_warning_dialog'><p>" + currentConfig.dialogText + "</p><p style='display:inline'>" + currentConfig.dialogTimeRemaining + ": <div style='display:inline' id='countdownDisplay'></div> secs.</p></div>", modalObj = {
                title: currentConfig.dialogTitle,
                htmlContent: dialogContent,
                okText: "Stay Signed-in",
                cancelText: "Logout",
                mainClass: "modal-lg",
                allowCancel: !0,
                okCloses: !1,
                escape: !1,
                cancellable: !0,
                width: "500px",
                mainClass: "ideal-timeout"
            }, modal = new Modal(modalObj);
            modal.open(), modal.on("ok", function() {
                userRuntimeConfig && userRuntimeConfig.onModalKeepAlive && userRuntimeConfig.onModalKeepAlive(), 
                destroyWarningDialog(), modal.close(), stopDialogTimer(), startIdleTimer(), CommonViewFunction.userDataFetch({
                    url: UrlLinks.sessionApiUrl()
                });
            }), modal.on("closeModal", function() {
                logoutUser();
            }), countdownDisplay(), currentConfig.sessionKeepAliveTimer && stopKeepSessionAlive();
        }, checkDialogTimeout = function() {
            var timeDialogTimeout = store.get("idleTimerLastActivity") + 1e3 * currentConfig.idleTimeLimit + 1e3 * currentConfig.dialogDisplayLimit;
            ($.now() > timeDialogTimeout || store.get("idleTimerLoggedOut") === !0) && logoutUser();
        }, startDialogTimer = function() {
            dialogTimer = setInterval(checkDialogTimeout, 1e3 * currentConfig.idleCheckHeartbeat);
        }, stopDialogTimer = function() {
            clearInterval(dialogTimer), clearInterval(remainingTimer);
        }, isDialogOpen = function() {
            var dialogOpen = $("#idletimer_warning_dialog").is(":visible");
            return dialogOpen === !0;
        }, destroyWarningDialog = function() {
            currentConfig.sessionKeepAliveTimer && startKeepSessionAlive();
        }, countdownDisplay = function() {
            var mins, secs, dialogDisplaySeconds = currentConfig.dialogDisplayLimit;
            remainingTimer = setInterval(function() {
                mins = Math.floor(dialogDisplaySeconds / 60), mins < 10 && (mins = "0" + mins), 
                secs = dialogDisplaySeconds - 60 * mins, secs < 10 && (secs = "0" + secs), $("#countdownDisplay").html(mins + ":" + secs), 
                dialogDisplaySeconds -= 1;
            }, 1e3);
        }, logoutUser = function() {
            store.set("idleTimerLoggedOut", !0), currentConfig.sessionKeepAliveTimer && stopKeepSessionAlive(), 
            currentConfig.customCallback && currentConfig.customCallback(), currentConfig.redirectUrl && (window.location.href = currentConfig.redirectUrl);
        }, this.each(function() {
            store.enabled ? (store.set("idleTimerLastActivity", $.now()), store.set("idleTimerLoggedOut", !1), 
            activityDetector(), currentConfig.sessionKeepAliveTimer && startKeepSessionAlive(), 
            startIdleTimer()) : alert(currentConfig.errorAlertMessage);
        });
    }, Utils.addCustomTextEditor = function(options) {
        var $btnPane, $parent, selector = options.selector ? options.selector : ".customTextEditor", defaultBtns = [ [ "formatting" ], [ "strong", "em", "underline", "del" ], [ "link" ], [ "unorderedList", "orderedList" ], [ "viewHTML" ] ], smallTextEditorBtn = [ [ "strong", "em", "underline", "del" ], [ "link" ], [ "unorderedList", "orderedList" ] ], customBtnDefs = {
            formatting: {
                dropdown: [ "p", "h1", "h2", "h3", "h4" ],
                ico: "p"
            }
        };
        $(selector).trumbowyg({
            btns: options.small ? smallTextEditorBtn : defaultBtns,
            autogrow: !0,
            removeformatPasted: !0,
            urlProtocol: !0,
            defaultLinkTarget: "_blank",
            btnsDef: options.small ? {} : customBtnDefs
        }).on("tbwinit", function() {
            $btnPane = $(this).parent().find(".trumbowyg-button-pane"), $parent = $(this).parent(), 
            options.small && $parent.addClass("small-texteditor"), options.initialHide || ($btnPane.addClass("trumbowyg-button-pane-hidden"), 
            $parent.css("border", "1px solid #e8e9ee"));
        }).on("tbwblur", function(e) {
            $btnPane.addClass("trumbowyg-button-pane-hidden"), $parent.css("border", "1px solid #e8e9ee");
        }).on("tbwfocus", function(e) {
            $btnPane.removeClass("trumbowyg-button-pane-hidden"), $parent.css("border", "1px solid #8fa5b1");
        }).on("tbwchange", function(e) {
            options.callback ? options.callback(e) : null;
        }).on("tbwmodalopen", function(e) {
            $('input[name="title"], input[name="target"]').parent().css("display", "none");
        });
    }, Utils.sanitizeHtmlContent = function(options) {
        var editorContent, cleanedContent;
        return editorContent = options.selector ? $(options.selector).trumbowyg("html") : options.data, 
        options && editorContent && (cleanedContent = DOMPurify.sanitize(editorContent, {
            FORBID_TAGS: [ "img", "script", "iframe", "embed", "svg", "meta" ],
            ALLOWED_ATTR: [ "target", "href" ]
        })), cleanedContent;
    }, Utils.updateInternalTabState = function() {
        var tabActive = "", paramObj = Utils.getUrlState.getQueryParams();
        Utils.getUrlState.isSearchTab() && (tabActive = "basic-search"), Utils.getUrlState.isDetailPage() && paramObj && "relationshipSearch" === paramObj.from && (tabActive = "relationship-search"), 
        $(".nav.nav-tabs").find('[role="' + tabActive + '"]').addClass("active").siblings().removeClass("active"), 
        $(".tab-content").find('[role="' + tabActive + '"]').addClass("active").siblings().removeClass("active");
    }, Utils;
});