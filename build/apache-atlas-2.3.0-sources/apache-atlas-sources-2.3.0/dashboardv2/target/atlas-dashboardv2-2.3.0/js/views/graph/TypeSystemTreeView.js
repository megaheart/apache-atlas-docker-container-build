define([ "require", "backbone", "hbs!tmpl/graph/TypeSystemTreeView_tmpl", "collection/VLineageList", "models/VEntity", "LineageHelper", "d3", "dagreD3", "d3-tip", "utils/CommonViewFunction", "utils/Utils", "platform", "jquery-ui" ], function(require, Backbone, TypeSystemTreeViewTmpl, VLineageList, VEntity, LineageHelper, d3, dagreD3, d3Tip, CommonViewFunction, Utils, platform) {
    "use strict";
    var TypeSystemTreeView = Backbone.Marionette.LayoutView.extend({
        _viewName: "TypeSystemTreeViewTmpl",
        template: TypeSystemTreeViewTmpl,
        templateHelpers: function() {
            return {
                modalID: this.viewId,
                width: "100%",
                height: "300px"
            };
        },
        regions: {
            RTypeSystemTreeViewPage: "#r_typeSystemTreeViewPage"
        },
        ui: {
            typeSystemTreeViewPage: "[data-id='typeSystemTreeViewPage']",
            boxClose: '[data-id="box-close"]',
            nodeDetailTable: '[data-id="nodeDetailTable"]',
            attributeTable: '[data-id="attribute-table"]',
            typeSearch: '[data-id="typeSearch"]',
            filterServiceType: '[data-id="filterServiceType"]',
            onZoomIn: '[data-id="zoom-in"]',
            onZoomOut: '[data-id="zoom-out"]',
            filterBox: ".filter-box",
            searchBox: ".search-box",
            settingBox: ".setting-box",
            filterToggler: '[data-id="filter-toggler"]',
            settingToggler: '[data-id="setting-toggler"]',
            searchToggler: '[data-id="search-toggler"]',
            labelFullName: '[data-id="labelFullName"]',
            reset: '[data-id="reset"]',
            fullscreenToggler: '[data-id="fullScreen-toggler"]',
            noValueToggle: "[data-id='noValueToggle']",
            showOnlyHoverPath: '[data-id="showOnlyHoverPath"]',
            showTooltip: '[data-id="showTooltip"]',
            saveSvg: '[data-id="saveSvg"]'
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.boxClose] = "toggleBoxPanel", events["click " + this.ui.onZoomIn] = "onClickZoomIn", 
            events["click " + this.ui.onZoomOut] = "onClickZoomOut", events["click " + this.ui.filterToggler] = "onClickFilterToggler", 
            events["click " + this.ui.settingToggler] = "onClickSettingToggler", events["click " + this.ui.searchToggler] = "onClickSearchToggler", 
            events["click " + this.ui.saveSvg] = "onClickSaveSvg", events["click " + this.ui.fullscreenToggler] = "onClickFullscreenToggler", 
            events["click " + this.ui.reset] = "onClickReset", events["change " + this.ui.labelFullName] = "onClickLabelFullName", 
            events["click " + this.ui.noValueToggle] = function() {
                this.showAllProperties = !this.showAllProperties, this.ui.noValueToggle.attr("data-original-title", (this.showAllProperties ? "Hide" : "Show") + " empty values"), 
                Utils.togglePropertyRelationshipTableEmptyValues({
                    inputType: this.ui.noValueToggle,
                    tableEl: this.ui.nodeDetailTable
                });
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "entityDefCollection")), this.labelFullText = !1;
        },
        onShow: function() {
            this.$(".fontLoader").show(), this.initializeGraph(), this.fetchGraphData();
        },
        onRender: function() {
            var that = this;
            this.$el.on("click", "code li[data-def]", function() {
                if (that.selectedDetailNode) {
                    var dataObj = $(this).data(), defObj = that.selectedDetailNode[dataObj.def], newData = null;
                    newData = "businessAttributes" === dataObj.def ? defObj[dataObj.attribute] : _.filter(defObj, {
                        name: dataObj.attribute
                    }), that.ui.attributeTable.find("pre").html('<code style="max-height: 100%">' + Utils.JSONPrettyPrint(newData, function(val) {
                        return val;
                    }) + "</code>"), that.$el.find('[data-id="typeAttrDetailHeader"]').text(dataObj.def), 
                    that.ui.nodeDetailTable.hide("slide", {
                        direction: "right"
                    }, 400), that.ui.attributeTable.show("slide", {
                        direction: "left"
                    }, 400), that.$el.find(".typeDetailHeader").hide(), that.$el.find(".typeAttrDetailHeader").show();
                }
            }), this.$el.on("click", "span[data-id='box-back']", function() {
                that.ui.nodeDetailTable.show("slide", {
                    direction: "right"
                }, 400), that.ui.attributeTable.hide("slide", {
                    direction: "left"
                }, 400), that.$el.find(".typeDetailHeader").show(), that.$el.find(".typeAttrDetailHeader").hide();
            });
        },
        fetchGraphData: function(options) {
            var that = this, entityTypeDef = that.entityDefCollection.fullCollection.toJSON();
            this.$(".fontLoader").show(), this.$("svg").empty(), that.isDestroyed || entityTypeDef.length && that.generateData($.extend(!0, {}, {
                data: entityTypeDef
            }, options)).then(function(graphObj) {
                that.createGraph(options);
            });
        },
        generateData: function(options) {
            return new Promise(function(resolve, reject) {
                try {
                    var that = this, styleObj = {
                        fill: "none",
                        stroke: "#ffb203",
                        width: 3
                    }, makeNodeData = function(relationObj) {
                        if (relationObj) {
                            if (relationObj.updatedValues) return relationObj;
                            var obj = _.extend(relationObj, {
                                shape: "img",
                                updatedValues: !0,
                                label: relationObj.name.trunc(18),
                                toolTipLabel: relationObj.name,
                                id: relationObj.guid,
                                isLineage: !0,
                                isIncomplete: !1
                            });
                            return obj;
                        }
                    }, getStyleObjStr = function(styleObj) {
                        return "fill:" + styleObj.fill + ";stroke:" + styleObj.stroke + ";stroke-width:" + styleObj.width;
                    }, setNode = function(guid, obj) {
                        var node = that.LineageHelperRef.getNode(guid);
                        if (node) return node;
                        var nodeData = makeNodeData(obj);
                        return that.LineageHelperRef.setNode(guid, nodeData), nodeData;
                    }, setEdge = function(fromNodeGuid, toNodeGuid) {
                        that.LineageHelperRef.setEdge(fromNodeGuid, toNodeGuid, {
                            arrowhead: "arrowPoint",
                            style: getStyleObjStr(styleObj),
                            styleObj: styleObj
                        });
                    };
                    if (options.data) if (options.filter) {
                        var pendingSuperList = {}, outOfFilterData = {}, doneList = {}, linkParents = function(obj) {
                            obj && obj.superTypes.length && _.each(obj.superTypes, function(superType) {
                                var fromEntityId = obj.guid, tempObj = doneList[superType] || outOfFilterData[superType];
                                tempObj ? (doneList[superType] || setNode(tempObj.guid, tempObj), setEdge(tempObj.guid, fromEntityId), 
                                linkParents(tempObj)) : pendingSuperList[superType] ? pendingSuperList[superType].push(fromEntityId) : pendingSuperList[superType] = [ fromEntityId ];
                            });
                        };
                        _.each(options.data, function(obj) {
                            var fromEntityId = obj.guid;
                            pendingSuperList[obj.name] && (doneList[obj.name] = obj, setNode(fromEntityId, obj), 
                            _.map(pendingSuperList[obj.name], function(guid) {
                                setEdge(fromEntityId, guid);
                            }), delete pendingSuperList[obj.name], linkParents(obj)), obj.serviceType === options.filter ? (doneList[obj.name] = obj, 
                            setNode(fromEntityId, obj), linkParents(obj)) : doneList[obj.name] || outOfFilterData[obj.name] || (outOfFilterData[obj.name] = obj);
                        }), pendingSuperList = null, doneList = null, outOfFilterData = null;
                    } else {
                        var pendingList = {}, doneList = {};
                        _.each(options.data, function(obj) {
                            var fromEntityId = obj.guid;
                            doneList[obj.name] = obj, setNode(fromEntityId, obj), pendingList[obj.name] && (_.map(pendingList[obj.name], function(guid) {
                                setEdge(guid, fromEntityId);
                            }), delete pendingList[obj.name]), obj.subTypes.length && _.each(obj.subTypes, function(subTypes) {
                                doneList[subTypes] ? setEdge(fromEntityId, doneList[subTypes].guid) : pendingList[subTypes] ? pendingList[subTypes].push(fromEntityId) : pendingList[subTypes] = [ fromEntityId ];
                            });
                        }), pendingList = null, doneList = null;
                    }
                    resolve(this.g);
                } catch (e) {
                    reject(e);
                }
            }.bind(this));
        },
        toggleBoxPanel: function(options) {
            var el = options && options.el;
            options && options.nodeDetailToggler, options.currentTarget;
            this.$el.find(".show-box-panel").removeClass("show-box-panel"), el && el.addClass && el.addClass("show-box-panel"), 
            this.$("circle.node-detail-highlight").removeClass("node-detail-highlight");
        },
        onClickNodeToggler: function(options) {
            this.toggleBoxPanel({
                el: this.$(".lineage-node-detail"),
                nodeDetailToggler: !0
            });
        },
        onClickZoomIn: function() {
            this.LineageHelperRef.zoomIn();
        },
        onClickZoomOut: function() {
            this.LineageHelperRef.zoomOut();
        },
        onClickFilterToggler: function() {
            this.toggleBoxPanel({
                el: this.ui.filterBox
            });
        },
        onClickSettingToggler: function() {
            this.toggleBoxPanel({
                el: this.ui.settingBox
            });
        },
        onClickSearchToggler: function() {
            this.toggleBoxPanel({
                el: this.ui.searchBox
            });
        },
        onClickLabelFullName: function() {
            this.labelFullText = !this.labelFullText, this.LineageHelperRef.displayFullName({
                bLabelFullText: this.labelFullText
            });
        },
        onClickReset: function() {
            this.fetchGraphData({
                refresh: !0
            }), this.ui.typeSearch.data({
                refresh: !0
            }).val("").trigger("change"), this.ui.filterServiceType.data({
                refresh: !0
            }).val("").trigger("change"), this.ui.labelFullName.prop("checked", !1), this.labelFullText = !1;
        },
        onClickSaveSvg: function(e, a) {
            this.LineageHelperRef.exportLineage({
                downloadFileName: "TypeSystemView"
            });
        },
        onClickFullscreenToggler: function(e) {
            var icon = $(e.currentTarget).find("i"), panel = $(e.target).parents(".tab-pane").first();
            icon.toggleClass("fa-expand fa-compress"), icon.hasClass("fa-expand") ? icon.parent("button").attr("data-original-title", "Full Screen") : icon.parent("button").attr("data-original-title", "Default View"), 
            panel.toggleClass("fullscreen-mode");
            var node = this.$("svg.main").parent()[0].getBoundingClientRect();
            this.LineageHelperRef.updateOptions({
                width: node.width,
                height: node.height
            }), this.calculateLineageDetailPanelHeight();
        },
        updateDetails: function(data) {
            this.$("[data-id='typeName']").text(Utils.getName(data)), this.selectedDetailNode = {}, 
            this.selectedDetailNode.atttributes = data.attributeDefs, this.selectedDetailNode.businessAttributes = data.businessAttributeDefs, 
            this.selectedDetailNode.relationshipAttributes = data.relationshipAttributeDefs, 
            data.atttributes = (data.attributeDefs || []).map(function(obj) {
                return obj.name;
            }), data.businessAttributes = _.keys(data.businessAttributeDefs), data.relationshipAttributes = (data.relationshipAttributeDefs || []).map(function(obj) {
                return obj.name;
            }), this.ui.nodeDetailTable.html(CommonViewFunction.propertyTable({
                scope: this,
                guidHyperLink: !1,
                getValue: function(val, key) {
                    return key && key.toLowerCase().indexOf("time") > 0 ? Utils.formatDate({
                        date: val
                    }) : val;
                },
                getArrayOfStringElement: function(val, key) {
                    var def = null, classname = "json-string";
                    return "atttributes" !== key && "businessAttributes" !== key && "relationshipAttributes" !== key || (def = key, 
                    classname += " cursor"), "<li class='" + classname + "' " + (def ? 'data-def="' + def + '" data-attribute="' + val + '"' : "") + ">" + val + "</li>";
                },
                getArrayOfStringFormat: function(valueArray) {
                    return valueArray.join("");
                },
                getEmptyString: function(key) {
                    return "subTypes" === key || "superTypes" === key || "atttributes" === key || "relationshipAttributes" === key ? "[]" : "N/A";
                },
                valueObject: _.omit(data, [ "id", "attributeDefs", "relationshipAttributeDefs", "businessAttributeDefs", "isLineage", "isIncomplete", "label", "shape", "toolTipLabel", "updatedValues" ]),
                sortBy: !0
            }));
        },
        createGraph: function(opt) {
            this.LineageHelperRef.createGraph();
        },
        filterData: function(value) {
            this.LineageHelperRef.refresh(), this.fetchGraphData({
                filter: value
            });
        },
        initializeGraph: function() {
            var that = this, node = this.$("svg.main").parent()[0].getBoundingClientRect();
            this.$("svg").attr("viewBox", "0 0 " + node.width + " " + node.height), this.LineageHelperRef = new LineageHelper.default({
                el: this.$("svg.main")[0],
                legends: !1,
                setDataManually: !0,
                width: node.width,
                height: node.height,
                zoom: !0,
                fitToScreen: !0,
                dagreOptions: {
                    rankdir: "tb"
                },
                toolTipTitle: "Type",
                isShowHoverPath: function() {
                    return that.ui.showOnlyHoverPath.prop("checked");
                },
                isShowTooltip: function() {
                    return that.ui.showTooltip.prop("checked");
                },
                onNodeClick: function(d) {
                    that.onClickNodeToggler(), that.updateDetails(that.LineageHelperRef.getNode(d.clickedData, !0)), 
                    that.calculateLineageDetailPanelHeight();
                },
                beforeRender: function() {
                    that.$(".fontLoader").show();
                },
                afterRender: function() {
                    that.graphOptions = that.LineageHelperRef.getGraphOptions(), that.renderTypeFilterSearch(), 
                    that.$(".fontLoader").hide();
                }
            });
        },
        renderTypeFilterSearch: function(data) {
            var that = this, searchStr = "<option></option>", filterStr = "<option></option>", tempFilteMap = {}, nodes = that.LineageHelperRef.getNodes();
            _.isEmpty(nodes) || _.each(nodes, function(obj) {
                searchStr += '<option value="' + obj.guid + '">' + obj.name + "</option>", obj.serviceType && !tempFilteMap[obj.serviceType] && (tempFilteMap[obj.serviceType] = obj.serviceType, 
                filterStr += '<option value="' + obj.serviceType + '">' + obj.serviceType + "</option>");
            }), this.ui.typeSearch.html(searchStr), this.ui.filterServiceType.data("select2") || this.ui.filterServiceType.html(filterStr), 
            this.initilizeTypeFilterSearch();
        },
        initilizeTypeFilterSearch: function() {
            var that = this;
            this.ui.typeSearch.select2({
                closeOnSelect: !0,
                placeholder: "Select Type"
            }).on("change.select2", function(e) {
                if (e.stopPropagation(), e.stopImmediatePropagation(), that.ui.typeSearch.data("refresh")) that.ui.typeSearch.data("refresh", !1); else {
                    var selectedNode = $('[data-id="typeSearch"]').val();
                    that.LineageHelperRef.searchNode({
                        guid: selectedNode
                    });
                }
            }), this.ui.filterServiceType.data("select2") || this.ui.filterServiceType.select2({
                closeOnSelect: !0,
                placeholder: "Select ServiceType"
            }).on("change.select2", function(e) {
                if (e.stopPropagation(), e.stopImmediatePropagation(), that.ui.filterServiceType.data("refresh")) that.ui.filterServiceType.data("refresh", !1); else {
                    var selectedNode = $('[data-id="filterServiceType"]').val();
                    that.filterData(selectedNode);
                }
            });
        },
        calculateLineageDetailPanelHeight: function() {
            this.ui.typeSystemTreeViewPage.find("tbody").removeAttr("style");
            var $panel = this.ui.typeSystemTreeViewPage.find(".fix-box"), $parentHeight = this.ui.typeSystemTreeViewPage.height() - 48, $tBody = $panel.find("tbody"), panelHeight = $tBody.height() + 37;
            $parentHeight < panelHeight && (panelHeight = $parentHeight), $panel.css("height", panelHeight + "px"), 
            $tBody.css("height", "100%");
        }
    });
    return TypeSystemTreeView;
});