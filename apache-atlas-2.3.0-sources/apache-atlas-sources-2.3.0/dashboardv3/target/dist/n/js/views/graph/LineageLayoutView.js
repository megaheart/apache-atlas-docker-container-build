define([ "require", "backbone", "hbs!tmpl/graph/LineageLayoutView_tmpl", "collection/VLineageList", "models/VEntity", "utils/Utils", "LineageHelper", "d3", "dagreD3", "d3-tip", "utils/Enums", "utils/UrlLinks", "utils/Globals", "utils/CommonViewFunction", "platform", "jquery-ui" ], function(require, Backbone, LineageLayoutViewtmpl, VLineageList, VEntity, Utils, LineageHelper, d3, dagreD3, d3Tip, Enums, UrlLinks, Globals, CommonViewFunction, platform) {
    "use strict";
    var LineageLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "LineageLayoutView",
        template: LineageLayoutViewtmpl,
        className: "resizeGraph",
        regions: {},
        ui: {
            graph: ".graph",
            checkHideProcess: "[data-id='checkHideProcess']",
            checkDeletedEntity: "[data-id='checkDeletedEntity']",
            selectDepth: 'select[data-id="selectDepth"]',
            selectNodeCount: 'select[data-id="selectNodeCount"]',
            filterToggler: '[data-id="filter-toggler"]',
            settingToggler: '[data-id="setting-toggler"]',
            searchToggler: '[data-id="search-toggler"]',
            boxClose: '[data-id="box-close"]',
            lineageFullscreenToggler: '[data-id="fullScreen-toggler"]',
            filterBox: ".filter-box",
            searchBox: ".search-box",
            settingBox: ".setting-box",
            lineageTypeSearch: '[data-id="typeSearch"]',
            searchNode: '[data-id="searchNode"]',
            nodeDetailTable: '[data-id="nodeDetailTable"]',
            showOnlyHoverPath: '[data-id="showOnlyHoverPath"]',
            showTooltip: '[data-id="showTooltip"]',
            saveSvg: '[data-id="saveSvg"]',
            resetLineage: '[data-id="resetLineage"]',
            onZoomIn: '[data-id="zoom-in"]',
            labelFullName: '[data-id="labelFullName"]',
            onZoomOut: '[data-id="zoom-out"]'
        },
        templateHelpers: function() {
            return {
                width: "100%",
                height: "100%",
                compactLineageEnabled: Globals.isLineageOnDemandEnabled
            };
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.checkHideProcess] = "onCheckUnwantedEntity", events["click " + this.ui.checkDeletedEntity] = "onCheckUnwantedEntity", 
            events["change " + this.ui.selectDepth] = "onSelectDepthChange", events["change " + this.ui.selectNodeCount] = "onSelectNodeCount", 
            events["click " + this.ui.filterToggler] = "onClickFilterToggler", events["click " + this.ui.boxClose] = "toggleBoxPanel", 
            events["click " + this.ui.settingToggler] = "onClickSettingToggler", events["click " + this.ui.lineageFullscreenToggler] = "onClickLineageFullscreenToggler", 
            events["click " + this.ui.searchToggler] = "onClickSearchToggler", events["click " + this.ui.saveSvg] = "onClickSaveSvg", 
            events["click " + this.ui.resetLineage] = "onClickResetLineage", events["click " + this.ui.onZoomIn] = "onClickZoomIn", 
            events["click " + this.ui.onZoomOut] = "onClickZoomOut", events["change " + this.ui.labelFullName] = "onClickLabelFullName", 
            events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "processCheck", "guid", "entity", "entityName", "entityDefCollection", "actionCallBack", "fetchCollection", "attributeDefs")), 
            this.collection = new VLineageList(), this.typeMap = {}, this.apiGuid = {}, this.edgeCall, 
            this.filterObj = {
                isProcessHideCheck: !1,
                isDeletedEntityHideCheck: !1,
                depthCount: Globals.lineageDepth
            }, this.searchNodeObj = {
                selectedNode: ""
            }, this.labelFullText = !1;
        },
        onRender: function() {
            var nodeCountArray = _.uniq([ 3, 6, Globals.lineageNodeCount ]);
            this.initialQueryObj = {}, this.ui.searchToggler.prop("disabled", !0), this.$graphButtonsEl = this.$(".graph-button-group button, select[data-id='selectDepth']"), 
            Globals.isLineageOnDemandEnabled && (this.ui.resetLineage.attr("title", "Reset Lineage"), 
            this.initialQueryObj[this.guid] = {
                direction: "BOTH",
                inputRelationsLimit: Globals.lineageNodeCount,
                outputRelationsLimit: Globals.lineageNodeCount,
                depth: Globals.lineageDepth
            }), this.fetchGraphData({
                queryParam: this.initialQueryObj
            }), this.layoutRendered && this.layoutRendered(), this.processCheck && this.hideCheckForProcess(), 
            "DELETED" === this.entity.status && this.hideCheckForDeletedEntity(), this.ui.selectDepth.select2({
                data: _.sortBy([ 3, 6, 9, 12, 15, 18, 21 ]),
                tags: !0,
                dropdownCssClass: "number-input",
                multiple: !1
            }), this.ui.selectNodeCount.select2({
                data: _.sortBy(nodeCountArray),
                tags: !0,
                dropdownCssClass: "number-input",
                multiple: !1
            }), this.ui.selectNodeCount.val(Globals.lineageNodeCount).trigger("change");
        },
        onShow: function() {
            this.$(".fontLoader").show();
        },
        onClickLineageFullscreenToggler: function(e) {
            var icon = $(e.currentTarget).find("i"), panel = $(e.target).parents(".tab-pane").first();
            icon.toggleClass("fa-expand fa-compress"), icon.hasClass("fa-expand") ? (Globals.isFullScreenView = !1, 
            icon.parent("button").attr("data-original-title", "Full Screen")) : icon.parent("button").attr("data-original-title", "Default View"), 
            panel.toggleClass("fullscreen-mode");
            var node = this.$("svg").parent()[0].getBoundingClientRect();
            this.LineageHelperRef.updateOptions({
                width: node.width,
                height: node.height
            }), this.calculateLineageDetailPanelHeight();
        },
        onCheckUnwantedEntity: function(e) {
            this.searchNodeObj.selectedNode = "", "checkHideProcess" === $(e.target).data("id") ? this.filterObj.isProcessHideCheck = e.target.checked : this.filterObj.isDeletedEntityHideCheck = e.target.checked, 
            this.renderLineageTypeSearch(this.data), this.LineageHelperRef.refresh({
                compactLineageEnabled: Globals.isLineageOnDemandEnabled,
                filterObj: this.filterObj
            });
        },
        toggleBoxPanel: function(options) {
            var el = options && options.el;
            options && options.nodeDetailToggler, options.currentTarget;
            options.nodeDetailToggler && this.ui.lineageTypeSearch.select2("close"), this.$el.find(".show-box-panel").removeClass("show-box-panel"), 
            el && el.addClass && el.addClass("show-box-panel"), this.$("circle.node-detail-highlight").removeClass("node-detail-highlight");
        },
        toggleLoader: function(element) {
            element.hasClass("fa-camera") ? element.removeClass("fa-camera").addClass("fa-spin-custom fa-refresh") : element.removeClass("fa-spin-custom fa-refresh").addClass("fa-camera");
        },
        toggleDisableState: function(options) {
            var el = options.el, disabled = options.disabled;
            el && el.prop && (disabled ? el.prop("disabled", disabled) : el.prop("disabled", !el.prop("disabled")));
        },
        onClickNodeToggler: function(options) {
            this.toggleBoxPanel({
                el: this.$(".lineage-node-detail"),
                nodeDetailToggler: !0
            });
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
        onSelectDepthChange: function(e, options) {
            Globals.lineageDepth = parseInt(e.currentTarget.value), Globals.isLineageOnDemandEnabled || this.fetchGraphData({
                queryParam: {
                    depth: Globals.lineageDepth
                },
                legends: !1
            }), Globals.isLineageOnDemandEnabled && (this.initialQueryObj[this.guid].depth = Globals.lineageDepth, 
            this.fetchGraphData({
                queryParam: this.initialQueryObj,
                legends: !1
            }));
        },
        onSelectNodeCount: function(e, options) {
            Globals.lineageNodeCount = parseInt(e.target.value), 0 === Globals.lineageNodeCount && (Utils.notifyWarn({
                content: "Value cannot be less than 1"
            }), this.ui.selectNodeCount.val(3).trigger("change"));
        },
        onClickResetLineage: function() {
            Globals.isLineageOnDemandEnabled && this.fetchGraphData({
                queryParam: this.initialQueryObj,
                legends: !1
            }), Globals.isLineageOnDemandEnabled || this.LineageHelperRef.refresh(), this.searchNodeObj.selectedNode = "", 
            this.ui.lineageTypeSearch.data({
                refresh: !0
            }).val("").trigger("change"), this.ui.labelFullName.prop("checked", !1), this.labelFullText = !1;
        },
        onClickSaveSvg: function(e, a) {
            var that = this;
            return that.lineageRelationshipLength >= 1e3 ? void Utils.notifyInfo({
                content: "There was an error in downloading lineage: Lineage exceeds display parameters!"
            }) : void this.LineageHelperRef.exportLineage();
        },
        onClickZoomIn: function() {
            this.LineageHelperRef.zoomIn();
        },
        onClickZoomOut: function() {
            this.LineageHelperRef.zoomOut();
        },
        onClickLabelFullName: function() {
            this.labelFullText = !this.labelFullText, this.LineageHelperRef.displayFullName({
                bLabelFullText: this.labelFullText
            });
        },
        fetchGraphData: function(options) {
            var that = this, queryParam = options && options.queryParam || {};
            this.$(".fontLoader").show(), this.$("svg>g").hide(), this.toggleDisableState({
                el: that.$graphButtonsEl,
                disabled: !0
            });
            var classificationNamesArray = [];
            this.entity.classifications && this.entity.classifications.forEach(function(item) {
                classificationNamesArray.push(item.typeName);
            }), this.currentEntityData = {
                classificationNames: classificationNamesArray,
                displayText: that.entity.attributes.name,
                labels: [],
                meaningNames: [],
                meanings: []
            }, _.extend(this.currentEntityData, _.pick(this.entity, "attributes", "guid", "isIncomplete", "status", "typeName"));
            var dataObj = {
                compactLineageEnabled: Globals.isLineageOnDemandEnabled,
                success: function(data) {
                    if (!that.isDestroyed) {
                        data.legends = !options || options.legends, that.lineageOnDemandPayload = data.lineageOnDemandPayload ? data.lineageOnDemandPayload : {};
                        var relationsReverse = data.relations ? data.relations.reverse() : null, lineageMaxRelationCount = 9e3;
                        relationsReverse.length > lineageMaxRelationCount && (data.relations = relationsReverse.splice(relationsReverse.length - lineageMaxRelationCount, relationsReverse.length - 1), 
                        Utils.notifyInfo({
                            content: "Lineage exceeds display parameters and hence only upto 9000 relationships from this lineage can be displayed"
                        })), that.lineageRelationshipLength = data.relations.length, _.isEmpty(data.relations) && (!_.isEmpty(data.guidEntityMap) && data.guidEntityMap[data.baseEntityGuid] || (data.guidEntityMap[data.baseEntityGuid] = that.currentEntityData)), 
                        that.data = data;
                        var updatedData = that.updateLineageData(data);
                        _.extend(data.guidEntityMap, updatedData.plusBtnsObj), data.relations = data.relations.concat(updatedData.plusBtnRelationsArray), 
                        that.createGraph(data), that.renderLineageTypeSearch(data);
                    }
                },
                cust_error: function(model, response) {
                    that.noLineage();
                },
                complete: function() {
                    that.$(".fontLoader").hide(), that.$("svg>g").show();
                }
            };
            Globals.isLineageOnDemandEnabled ? dataObj.data = queryParam : dataObj.queryParam = queryParam, 
            this.collection.getLineage(this.guid, dataObj);
        },
        updateLineageData: function(data) {
            var that = this, plusBtnsObj = {}, plusBtnRelationsArray = [];
            if (this.relationsOnDemand = data.relationsOnDemand ? data.relationsOnDemand : null, 
            this.lineageOnDemandPayload = data.lineageOnDemandPayload ? data.lineageOnDemandPayload : null, 
            this.relationsOnDemand) return _.each(this.relationsOnDemand, function(values, nodeId) {
                if (values.hasMoreInputs) {
                    var btnType = "Input", moreInputBtnObj = that.createExpandButtonObj({
                        nodeId: nodeId,
                        btnType: btnType
                    });
                    plusBtnsObj[moreInputBtnObj.guid] = moreInputBtnObj, plusBtnRelationsArray.push({
                        fromEntityId: moreInputBtnObj.guid,
                        toEntityId: nodeId,
                        relationshipId: "dummy"
                    });
                }
                if (values.hasMoreOutputs) {
                    var btnType = "Output", moreOutputBtnObj = that.createExpandButtonObj({
                        nodeId: nodeId,
                        btnType: btnType
                    });
                    plusBtnsObj[moreOutputBtnObj.guid] = moreOutputBtnObj, plusBtnRelationsArray.push({
                        fromEntityId: nodeId,
                        toEntityId: moreOutputBtnObj.guid,
                        relationshipId: "dummy"
                    });
                }
            }), {
                plusBtnsObj: plusBtnsObj,
                plusBtnRelationsArray: plusBtnRelationsArray
            };
        },
        generateAddButtonId: function(btnType) {
            return btnType + Math.random().toString(16).slice(2);
        },
        createExpandButtonObj: function(options) {
            var defaultObj = {
                attributes: {
                    owner: "",
                    createTime: 0,
                    qualifiedName: "PlusBtn",
                    name: "PlusBtn",
                    description: ""
                },
                isExpandBtn: !0,
                classificationNames: [],
                displayText: "Expand",
                isIncomplete: !1,
                labels: [],
                meaningNames: [],
                meanings: [],
                status: "ACTIVE",
                typeName: "Table"
            }, btnObj = Object.assign({}, defaultObj), btnType = "Input" === options.btnType ? "more-inputs" : "more-outputs", btnId = this.generateAddButtonId(btnType);
            return btnObj.guid = btnId, btnObj.parentNodeGuid = options.nodeId, btnObj.btnType = options.btnType, 
            btnObj;
        },
        createGraph: function(data) {
            var that = this;
            $(".resizeGraph").css("height", this.$(".svg").height() + "px"), this.LineageHelperRef = new LineageHelper.default({
                entityDefCollection: this.entityDefCollection.fullCollection.toJSON(),
                data: data,
                el: this.$(".svg")[0],
                legendsEl: this.$(".legends")[0],
                legends: data.legends,
                getFilterObj: function() {
                    return {
                        isProcessHideCheck: that.filterObj.isProcessHideCheck,
                        isDeletedEntityHideCheck: that.filterObj.isDeletedEntityHideCheck
                    };
                },
                isShowHoverPath: function() {
                    return that.ui.showOnlyHoverPath.prop("checked");
                },
                isShowTooltip: function() {
                    return that.ui.showTooltip.prop("checked");
                },
                onPathClick: function(d) {
                    if (d.pathRelationObj) {
                        var relationshipId = d.pathRelationObj.relationshipId;
                        require([ "views/graph/PropagationPropertyModal" ], function(PropagationPropertyModal) {
                            new PropagationPropertyModal({
                                edgeInfo: d.pathRelationObj,
                                relationshipId: relationshipId,
                                lineageData: data,
                                apiGuid: that.apiGuid,
                                detailPageFetchCollection: that.fetchCollection
                            });
                        });
                    }
                },
                onNodeClick: function(d) {
                    return d.clickedData.indexOf("more") >= 0 ? void that.onExpandNodeClick({
                        guid: d.clickedData
                    }) : (that.onClickNodeToggler(), that.updateRelationshipDetails({
                        guid: d.clickedData
                    }), void that.calculateLineageDetailPanelHeight());
                },
                onLabelClick: function(d) {
                    var guid = d.clickedData;
                    Globals.isFullScreenView = !0, that.ui.lineageTypeSearch.select2("close"), guid.indexOf("more") >= 0 || (that.guid == guid ? Utils.notifyInfo({
                        html: !0,
                        content: "You are already on <b>" + that.entityName + "</b> detail page."
                    }) : Utils.setUrl({
                        url: "#!/detailPage/" + guid + "?tabActive=lineage",
                        mergeBrowserUrl: !1,
                        trigger: !0
                    }));
                },
                beforeRender: function() {
                    that.$(".fontLoader").show(), that.toggleDisableState({
                        el: that.$graphButtonsEl,
                        disabled: !0
                    });
                },
                afterRender: function() {
                    that.$(".fontLoader").hide(), data.relations.length && that.toggleDisableState({
                        el: that.$graphButtonsEl,
                        disabled: !1
                    });
                }
            });
        },
        onExpandNodeClick: function(options) {
            var parentNodeData = this.LineageHelperRef.getNode(options.guid);
            this.updateQueryObject(parentNodeData.parentNodeGuid, parentNodeData.btnType);
        },
        updateQueryObject: function(parentId, btnType) {
            var inputLimit = null, outputLimit = null, that = this;
            if (_.has(that.lineageOnDemandPayload, parentId)) _.find(that.lineageOnDemandPayload, function(value, key) {
                key === parentId && ("Input" === btnType && (value.inputRelationsLimit = value.inputRelationsLimit + Globals.lineageNodeCount, 
                value.outputRelationsLimit = value.outputRelationsLimit), "Output" === btnType && (value.inputRelationsLimit = value.inputRelationsLimit, 
                value.outputRelationsLimit = value.outputRelationsLimit + Globals.lineageNodeCount));
            }); else {
                var relationCount = that.validateInputOutputLimit(parentId, btnType);
                "Input" === btnType && (inputLimit = relationCount.inputRelationCount + Globals.lineageNodeCount, 
                outputLimit = relationCount.outputRelationCount), "Output" === btnType && (inputLimit = relationCount.inputRelationCount, 
                outputLimit = relationCount.outputRelationCount + Globals.lineageNodeCount), this.lineageOnDemandPayload[parentId] = {
                    direction: "BOTH",
                    inputRelationsLimit: inputLimit,
                    outputRelationsLimit: outputLimit,
                    depth: Globals.lineageDepth
                };
            }
            this.fetchGraphData({
                queryParam: this.lineageOnDemandPayload,
                legends: !1
            });
        },
        validateInputOutputLimit: function(parentId, btnType) {
            var inputRelationCount, outputRelationCount;
            for (var guid in this.relationsOnDemand) parentId !== guid || "Input" !== btnType && "Output" !== btnType || (inputRelationCount = this.relationsOnDemand[guid].inputRelationsCount ? this.relationsOnDemand[guid].inputRelationsCount : Globals.lineageNodeCount, 
            outputRelationCount = this.relationsOnDemand[guid].outputRelationsCount ? this.relationsOnDemand[guid].outputRelationsCount : Globals.lineageNodeCount);
            return {
                inputRelationCount: inputRelationCount,
                outputRelationCount: outputRelationCount
            };
        },
        noLineage: function() {
            this.$(".fontLoader").hide(), this.$(".depth-container").hide(), this.$("svg").html('<text x="50%" y="50%" alignment-baseline="middle" text-anchor="middle">No lineage data found</text>'), 
            this.actionCallBack && this.actionCallBack();
        },
        hideCheckForProcess: function() {
            this.$(".hideProcessContainer").hide();
        },
        hideCheckForDeletedEntity: function() {
            this.$(".hideDeletedContainer").hide();
        },
        renderLineageTypeSearch: function(data) {
            var that = this;
            return new Promise(function(resolve, reject) {
                try {
                    var typeStr = "<option></option>";
                    _.isEmpty(data) || _.each(data.guidEntityMap, function(obj, index) {
                        that.LineageHelperRef.getNode(obj.guid);
                        that.filterObj.isProcessHideCheck && obj && obj.isProcess || that.filterObj.isDeletedEntityHideCheck && obj && obj.isDeleted || Globals.isLineageOnDemandEnabled && obj && _.contains([ "Input", "Output" ], obj.btnType) || (typeStr += '<option value="' + obj.guid + '">' + obj.displayText + "</option>");
                    }), that.ui.lineageTypeSearch.html(typeStr), that.initilizelineageTypeSearch(), 
                    resolve();
                } catch (e) {
                    console.log(e), reject(e);
                }
            });
        },
        initilizelineageTypeSearch: function() {
            var that = this;
            this.ui.lineageTypeSearch.select2({
                closeOnSelect: !0,
                placeholder: "Select Node"
            }).on("change.select2", function(e) {
                if (e.stopPropagation(), e.stopImmediatePropagation(), that.ui.lineageTypeSearch.data("refresh")) that.ui.lineageTypeSearch.data("refresh", !1); else {
                    var selectedNode = $('[data-id="typeSearch"]').val();
                    that.searchNodeObj.selectedNode = selectedNode, that.LineageHelperRef.searchNode({
                        guid: selectedNode
                    });
                }
            }), this.searchNodeObj.selectedNode && (this.ui.lineageTypeSearch.val(this.searchNodeObj.selectedNode), 
            this.ui.lineageTypeSearch.trigger("change.select2"));
        },
        updateRelationshipDetails: function(options) {
            var that = this, guid = options.guid, initialData = that.LineageHelperRef.getNode(guid);
            if (void 0 !== initialData) {
                var typeName = initialData.typeName || guid, attributeDefs = initialData && initialData.entityDef ? initialData.entityDef.attributeDefs : null;
                this.$("[data-id='typeName']").text(typeName), this.entityModel = new VEntity({});
                var config = {
                    guid: "guid",
                    typeName: "typeName",
                    name: "name",
                    qualifiedName: "qualifiedName",
                    owner: "owner",
                    createTime: "createTime",
                    status: "status",
                    classificationNames: "classifications",
                    meanings: "term"
                }, data = {};
                _.each(config, function(valKey, key) {
                    var val = initialData[key];
                    _.isUndefined(val) && initialData.attributes && initialData.attributes[key] && (val = initialData.attributes[key]), 
                    val && (data[valKey] = val);
                }), this.ui.nodeDetailTable.html(CommonViewFunction.propertyTable({
                    scope: this,
                    valueObject: data,
                    attributeDefs: attributeDefs,
                    sortBy: !1
                }));
            }
        },
        calculateLineageDetailPanelHeight: function() {
            var $parentContainer = $("#tab-lineage .resizeGraph"), $panel = $parentContainer.find(".fix-box"), $parentHeight = $parentContainer.find(".fix-box, tbody").removeAttr("style").height() - 48, $tBody = $panel.find("tbody"), panelHeight = $tBody.height() + 100;
            $parentHeight < panelHeight && (panelHeight = $parentHeight), $panel.css("height", panelHeight + "px"), 
            $tBody.css("height", "100%");
        }
    });
    return LineageLayoutView;
});