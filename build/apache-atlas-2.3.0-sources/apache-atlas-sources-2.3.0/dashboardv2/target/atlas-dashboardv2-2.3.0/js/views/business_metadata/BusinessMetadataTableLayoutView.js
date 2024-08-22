define([ "require", "backbone", "hbs!tmpl/business_metadata/BusinessMetadataTableLayoutView_tmpl", "utils/Utils", "utils/Messages" ], function(require, Backbone, BusinessMetadataTableLayoutView_tmpl, Utils, Messages) {
    "use strict";
    var BusinessMetadataTableLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "BusinessMetadataTableLayoutView",
        template: BusinessMetadataTableLayoutView_tmpl,
        regions: {
            RBusinessMetadataTableLayoutView: "#r_businessMetadataTableLayoutView",
            RModal: "#r_modal"
        },
        ui: {
            businessMetadataAttrPage: "[data-id='businessMetadataAttrPage']",
            businessMetadataAttrPageTitle: "[data-id='businessMetadataAttrPageTitle']",
            businessMetadataDetailPage: "[data-id='businessMetadataDetailPage']",
            createBusinessMetadata: "[data-id='createBusinessMetadata']",
            attributeEdit: "[data-id='attributeEdit']",
            addAttribute: '[data-id="addAttribute"]',
            businessMetadataAttrPageOk: '[data-id="businessMetadataAttrPageOk"]',
            colManager: "[data-id='colManager']",
            deleteBusinessMetadata: '[data-id="deleteBusinessMetadata"]'
        },
        events: function() {
            var events = {}, that = this;
            return events["click " + this.ui.createBusinessMetadata] = "onClickCreateBusinessMetadata", 
            events["click " + this.ui.addAttribute] = "onEditAttr", events["click " + this.ui.attributeEdit] = "onEditAttr", 
            events["click " + this.ui.deleteBusinessMetadata] = function(e) {
                that.guid = e.target.dataset.guid, that.deleteBusinessMetadataElement();
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "guid", "entity", "entityName", "attributeDefs", "typeHeaders", "businessMetadataDefCollection", "entityDefCollection", "businessMetadataAttr", "selectedBusinessMetadata")), 
            this.limit = 10, this.newAttr = !1, this.commonTableOptions = {
                collection: this.businessMetadataDefCollection,
                includeFilter: !1,
                includePagination: !0,
                includeFooterRecords: !0,
                includePageSize: !0,
                includeGotoPage: !0,
                includeAtlasTableSorting: !0,
                includeTableLoader: !0,
                includeColumnManager: !0,
                gridOpts: {
                    className: "table table-hover backgrid table-quickMenu",
                    emptyText: "No records found!"
                },
                columnOpts: {
                    opts: {
                        initialColumnsVisible: null,
                        saveState: !1
                    },
                    visibilityControlOpts: {
                        buttonTemplate: _.template("<button class='btn btn-action btn-sm pull-right'>Columns&nbsp<i class='fa fa-caret-down'></i></button>")
                    },
                    el: this.ui.colManager
                },
                filterOpts: {},
                paginatorOpts: {}
            }, this.guid = null, this.showDetails = !0;
        },
        onRender: function() {
            this.toggleBusinessMetadataDetailsAttrView(), $.extend(this.businessMetadataDefCollection.queryParams, {
                count: this.limit
            }), this.businessMetadataDefCollection.fullCollection.sort({
                silent: !0
            }), this.renderTableLayoutView(), this.$(".tableOverlay").hide(), this.$(".auditTable").show(), 
            this.businessMetadataDefCollection.comparator = function(model) {
                return -model.get("timestamp");
            };
        },
        toggleBusinessMetadataDetailsAttrView: function() {
            var that = this;
            that.showDetails ? (that.ui.businessMetadataAttrPage.hide(), that.ui.businessMetadataDetailPage.show()) : (that.ui.businessMetadataAttrPage.show(), 
            that.ui.businessMetadataDetailPage.hide());
        },
        bindEvents: function() {},
        loaderStatus: function(isActive) {
            var that = this;
            isActive ? (that.$(".businessMetadata-attr-tableOverlay").show(), that.$(".business-metadata-attr-fontLoader").show()) : (that.$(".businessMetadata-attr-tableOverlay").hide(), 
            that.$(".business-metadata-attr-fontLoader").hide());
        },
        onEditAttr: function(e) {
            var that = this, isAttrEdit = !(!e.currentTarget.dataset || "attributeEdit" !== e.currentTarget.dataset.id), guid = e.currentTarget.dataset && e.currentTarget.dataset.guid ? e.currentTarget.dataset.guid : null, selectedBusinessMetadata = that.businessMetadataDefCollection.fullCollection.findWhere({
                guid: guid
            }), attrributes = selectedBusinessMetadata ? selectedBusinessMetadata.get("attributeDefs") : null, attrName = e.currentTarget.dataset.name ? e.currentTarget.dataset.name : null, attrDetails = {
                name: attrName
            };
            selectedBusinessMetadata && (that.ui.businessMetadataAttrPageOk.text("Save"), that.newAttr = !(!e.currentTarget || "createAttr" !== e.currentTarget.dataset.action), 
            that.guid = guid, _.each(attrributes, function(attrObj) {
                attrObj.name === attrName && (attrDetails = $.extend(!0, {}, attrObj), attrObj.typeName.includes("array") && (attrDetails.typeName = attrObj.typeName.replace("array<", "").replace(">", ""), 
                attrDetails.multiValued = !0));
            }), that.showDetails = !1, that.toggleBusinessMetadataDetailsAttrView(), that.ui.businessMetadataAttrPageOk.attr("data-action", e.currentTarget.dataset.id), 
            require([ "views/business_metadata/CreateBusinessMetadataLayoutView" ], function(CreateBusinessMetadataLayoutView) {
                that.view = new CreateBusinessMetadataLayoutView({
                    onEditCallback: function() {
                        that.businessMetadataDefCollection.fullCollection.sort({
                            silent: !0
                        }), that.renderTableLayoutView();
                    },
                    onUpdateBusinessMetadata: function(fetch) {
                        that.showDetails = !0, that.toggleBusinessMetadataDetailsAttrView(), fetch && (enumDefCollection.fetch({
                            reset: !0
                        }), that.entityDefCollection.fetch({
                            silent: !0
                        }));
                    },
                    parent: that.$el,
                    businessMetadataDefCollection: that.businessMetadataDefCollection,
                    enumDefCollection: enumDefCollection,
                    isAttrEdit: isAttrEdit,
                    typeHeaders: typeHeaders,
                    attrDetails: attrDetails,
                    selectedBusinessMetadata: selectedBusinessMetadata,
                    guid: that.guid,
                    isNewAttr: that.newAttr
                }), isAttrEdit ? that.ui.businessMetadataAttrPageTitle.text("Update Attribute of: " + selectedBusinessMetadata.get("name")) : that.ui.businessMetadataAttrPageTitle.text("Add Business Metadata Attribute for: " + selectedBusinessMetadata.get("name")), 
                that.RModal.show(that.view);
            }));
        },
        onClickCreateBusinessMetadata: function(e) {
            var that = this, isNewBusinessMetadata = !0;
            that.showDetails = !1, that.ui.businessMetadataAttrPageOk.text("Create"), that.ui.businessMetadataAttrPageOk.attr("data-action", "createBusinessMetadata"), 
            that.ui.businessMetadataAttrPageTitle.text("Create Business Metadata"), that.toggleBusinessMetadataDetailsAttrView(), 
            require([ "views/business_metadata/CreateBusinessMetadataLayoutView" ], function(CreateBusinessMetadataLayoutView) {
                that.view = new CreateBusinessMetadataLayoutView({
                    onUpdateBusinessMetadata: function(fetch) {
                        that.showDetails = !0, that.toggleBusinessMetadataDetailsAttrView(), fetch && (enumDefCollection.fetch({
                            reset: !0
                        }), that.entityDefCollection.fetch({
                            silent: !0
                        }));
                    },
                    businessMetadataDefCollection: that.businessMetadataDefCollection,
                    enumDefCollection: enumDefCollection,
                    typeHeaders: typeHeaders,
                    isNewBusinessMetadata: isNewBusinessMetadata
                }), that.RModal.show(that.view), Utils.addCustomTextEditor({
                    small: !1
                });
            });
        },
        renderTableLayoutView: function() {
            var that = this;
            require([ "utils/TableLayout" ], function(TableLayout) {
                var cols = new Backgrid.Columns(that.getBusinessMetadataTableColumns());
                that.RBusinessMetadataTableLayoutView.show(new TableLayout(_.extend({}, that.commonTableOptions, {
                    columns: cols
                }))), that.businessMetadataDefCollection.models.length < that.limit || that.RBusinessMetadataTableLayoutView.$el.find("table tr").last().hide();
            });
        },
        getBusinessMetadataTableColumns: function() {
            return this.businessMetadataDefCollection.constructor.getTableCols({
                attributeDefs: {
                    label: "",
                    cell: "html",
                    editable: !1,
                    sortable: !1,
                    cell: Backgrid.ExpandableCell,
                    fixWidth: "20",
                    accordion: !1,
                    alwaysVisible: !0,
                    expand: function(el, model) {
                        el.attr("colspan", "8");
                        var attrTableHeading = ($("table"), $("tbody"), "<thead><td style='display:table-cell'><b>Attribute</b></td><td style='display:table-cell'><b>Type</b></td><td style='display:table-cell'><b>Search Weight</b></td><td style='display:table-cell'><b>Enable Multivalues</b></td><td style='display:table-cell'><b>Max Length</b></td><td style='display:table-cell'><b>Applicable Type(s)</b></td><td style='display:table-cell'><b>Action</b></td></thead>"), attrRow = "";
                        if (model.attributes && model.attributes.attributeDefs.length) {
                            _.each(model.attributes.attributeDefs, function(attrObj) {
                                var applicableEntityTypes = "", typeName = attrObj.typeName, multiSelect = "", maxString = "NA";
                                if (attrObj.options && attrObj.options.applicableEntityTypes) {
                                    var entityTypes = JSON.parse(attrObj.options.applicableEntityTypes);
                                    _.each(entityTypes, function(values) {
                                        applicableEntityTypes += '<label class="btn btn-action btn-sm btn-blue no-pointer">' + values + "</label>";
                                    });
                                }
                                typeName.includes("array") && (typeName = _.escape(typeName), multiSelect = "checked"), 
                                typeName.includes("string") && attrObj.options && attrObj.options.maxStrLength && (maxString = attrObj.options.maxStrLength), 
                                attrRow += "<tr> <td style='display:table-cell'>" + _.escape(attrObj.name) + "</td><td style='display:table-cell'>" + typeName + "</td><td style='display:table-cell'>" + _.escape(attrObj.searchWeight) + "</td><td style='display:table-cell'><input type='checkbox' class='form-check-input multi-value-select' " + multiSelect + " disabled='disabled'> </td><td style='display:table-cell'>" + maxString + "</td><td style='display:table-cell'>" + applicableEntityTypes + "</td><td style='display:table-cell'> <div class='btn btn-action btn-sm' style='margin-left:0px;' data-id='attributeEdit' data-guid='" + model.get("guid") + "' data-name ='" + _.escape(attrObj.name) + "' data-action='attributeEdit' >Edit</div> </td></tr> ";
                            });
                            var adminText = '<div class="row"><div class="col-sm-12 attr-details"><table style="padding: 50px;">' + attrTableHeading + attrRow + "</table></div></div>";
                            $(el).append($("<div>").html(adminText));
                        } else {
                            var adminText = '<div class="row"><div class="col-sm-12 attr-details"><h5 class="text-center"> No attributes to show.</h5></div></div>';
                            $(el).append($("<div>").html(adminText));
                        }
                    }
                },
                name: {
                    label: "Name",
                    cell: "html",
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return '<a title= "' + model.get("name") + '" href ="#!/administrator/businessMetadata/' + model.get("guid") + '?from=bm">' + model.get("name") + "</a>";
                        }
                    })
                },
                description: {
                    label: "Description",
                    cell: "html",
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            var description = model.get("description");
                            return description.length > 50 && (description = description.substr(0, 50) + "..."), 
                            description;
                        }
                    })
                },
                createdBy: {
                    label: "Created by",
                    cell: "html",
                    renderable: !1,
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return model.get("updatedBy");
                        }
                    })
                },
                createTime: {
                    label: "Created on",
                    cell: "html",
                    renderable: !1,
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return Utils.formatDate({
                                date: model.get("createTime")
                            });
                        }
                    })
                },
                updatedBy: {
                    label: "Updated by",
                    cell: "html",
                    renderable: !1,
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return model.get("updatedBy");
                        }
                    })
                },
                updateTime: {
                    label: "Updated on",
                    cell: "html",
                    renderable: !1,
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return Utils.formatDate({
                                date: model.get("updateTime")
                            });
                        }
                    })
                },
                tools: {
                    label: "Action",
                    cell: "html",
                    sortable: !1,
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return "<button type='button' data-id='addAttribute' data-guid='" + model.get("guid") + "' class='btn btn-action btn-sm' style='margin-bottom: 10px;' data-action='createAttr' data-original-title='Add Business Metadata attribute'><i class='fa fa-plus'></i> Attributes</button>";
                        }
                    })
                }
            }, this.businessMetadataDefCollection);
        },
        deleteBusinessMetadataElement: function(businessMetadataName) {
            var that = this, notifyObj = {
                modal: !0,
                ok: function(argument) {
                    that.onNotifyDeleteOk();
                },
                cancel: function(argument) {}
            }, text = "Are you sure you want to delete the business metadata";
            notifyObj.text = text, Utils.notifyConfirm(notifyObj);
        },
        onNotifyDeleteOk: function(data) {
            var that = this, deleteBusinessMetadataData = that.businessMetadataDefCollection.fullCollection.findWhere({
                guid: that.guid
            });
            if (that.$(".tableOverlay").show(), deleteBusinessMetadataData) {
                var businessMetadataName = deleteBusinessMetadataData.get("name");
                deleteBusinessMetadataData.deleteBusinessMetadata({
                    typeName: businessMetadataName,
                    success: function() {
                        Utils.notifySuccess({
                            content: "Business Metadata " + businessMetadataName + Messages.getAbbreviationMsg(!1, "deleteSuccessMessage")
                        }), that.businessMetadataDefCollection.fullCollection.remove(deleteBusinessMetadataData), 
                        that.businessMetadataDefCollection.fullCollection.sort({
                            silent: !0
                        }), that.renderTableLayoutView(), that.showDetails = !0, that.toggleBusinessMetadataDetailsAttrView(), 
                        that.loaderStatus(!1);
                    },
                    complete: function() {
                        that.$(".tableOverlay").hide(), that.$(".position-relative .fontLoader").removeClass("show");
                    }
                });
            } else Utils.notifyError({
                content: Messages.defaultErrorMessage
            });
        }
    });
    return BusinessMetadataTableLayoutView;
});