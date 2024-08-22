define([ "require", "backbone", "hbs!tmpl/business_metadata/BusinessMetadataAttrTableLayoutView_tmpl", "collection/VEntityList" ], function(require, Backbone, BusinessMetadataAttrTableLayoutView_tmpl, VEntityList) {
    "use strict";
    var BusinessMetadataAttrTableLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "BusinessMetadataAttrTableLayoutView",
        template: BusinessMetadataAttrTableLayoutView_tmpl,
        regions: {
            RBusinessMetadataAttrTableLayoutView: "#r_businessMetadataAttrTableLayoutView",
            RModal: "#r_modal"
        },
        ui: {
            attributeEdit: "[data-id='attributeEdit']",
            addAttribute: '[data-id="addAttribute"]',
            businessMetadataAttrPage: "[data-id='businessMetadataAttrPage']",
            businessMetadataAttrPageTitle: "[data-id='businessMetadataAttrPageTitle']",
            businessMetadataDetailPage: "[data-id='businessMetadataDetailPage']"
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.attributeEdit] = "onEditAttr", events["click " + this.ui.addAttribute] = "onEditAttr", 
            events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "guid", "model", "typeHeaders", "businessMetadataDefCollection", "entityDefCollection")), 
            this.businessMetadataAttr = new VEntityList(this.model.get("attributeDefs") || []), 
            this.commonTableOptions = {
                collection: this.businessMetadataAttr,
                includeFilter: !1,
                includePagination: !1,
                includePageSize: !1,
                includeAtlasTableSorting: !0,
                includeFooterRecords: !1,
                gridOpts: {
                    className: "table table-hover backgrid table-quickMenu",
                    emptyText: "No records found!"
                },
                filterOpts: {},
                paginatorOpts: {}
            }, this.showDetails = !0;
        },
        onRender: function() {
            this.renderTableLayoutView(), this.toggleBusinessMetadataDetailsAttrView();
        },
        bindEvents: function() {},
        toggleBusinessMetadataDetailsAttrView: function() {
            var that = this;
            that.showDetails ? (that.ui.businessMetadataAttrPage.hide(), that.ui.businessMetadataDetailPage.show()) : (that.ui.businessMetadataAttrPage.show(), 
            that.ui.businessMetadataDetailPage.hide());
        },
        onEditAttr: function(e) {
            var that = this, isAttrEdit = !1, selectedBusinessMetadata = that.model, attrributes = selectedBusinessMetadata ? selectedBusinessMetadata.get("attributeDefs") : null, attrName = e.target.dataset.name ? e.target.dataset.name : null, attrDetails = {
                name: attrName
            };
            "attributeEdit" == e.target.dataset.action && (isAttrEdit = !0), selectedBusinessMetadata && (that.newAttr = !isAttrEdit, 
            _.each(attrributes, function(attrObj) {
                attrObj.name === attrName && (attrDetails = $.extend(!0, {}, attrObj), attrObj.typeName.includes("array") && (attrDetails.typeName = attrObj.typeName.replace("array<", "").replace(">", ""), 
                attrDetails.multiValued = !0));
            }), this.showDetails = !1, that.toggleBusinessMetadataDetailsAttrView(), require([ "views/business_metadata/CreateBusinessMetadataLayoutView" ], function(CreateBusinessMetadataLayoutView) {
                that.view = new CreateBusinessMetadataLayoutView({
                    onEditCallback: function() {
                        enumDefCollection.fetch({
                            reset: !0
                        }), that.businessMetadataAttr.reset(that.model.get("attributeDefs"));
                    },
                    onUpdateBusinessMetadata: function(fetch) {
                        that.showDetails = !0, that.toggleBusinessMetadataDetailsAttrView(), fetch && that.entityDefCollection.fetch({
                            silent: !0
                        });
                    },
                    parent: that.$el,
                    businessMetadataDefCollection: that.businessMetadataDefCollection,
                    enumDefCollection: enumDefCollection,
                    isAttrEdit: isAttrEdit,
                    attrDetails: attrDetails,
                    typeHeaders: typeHeaders,
                    selectedBusinessMetadata: that.model,
                    guid: that.guid,
                    isNewAttr: that.newAttr
                }), isAttrEdit ? that.ui.businessMetadataAttrPageTitle.text("Update Attribute of: " + selectedBusinessMetadata.get("name")) : that.ui.businessMetadataAttrPageTitle.text("Add Business Metadata Attribute for: " + selectedBusinessMetadata.get("name")), 
                that.RModal.show(that.view);
            }));
        },
        renderTableLayoutView: function() {
            var that = this;
            require([ "utils/TableLayout" ], function(TableLayout) {
                var cols = new Backgrid.Columns(that.getBusinessMetadataTableColumns());
                that.RBusinessMetadataAttrTableLayoutView.show(new TableLayout(_.extend({}, that.commonTableOptions, {
                    columns: cols
                })));
            });
        },
        getBusinessMetadataTableColumns: function() {
            return this.businessMetadataAttr.constructor.getTableCols({
                name: {
                    label: "Attribute Name",
                    cell: "html",
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return _.escape(model.get("name"));
                        }
                    })
                },
                typeName: {
                    label: "Type Name",
                    cell: "html",
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return _.escape(model.get("typeName"));
                        }
                    })
                },
                searchWeight: {
                    label: "Search Weight",
                    cell: "String",
                    editable: !1
                },
                enableMultipleValue: {
                    label: "Enable Multivalues",
                    cell: "html",
                    editable: !1,
                    sortable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            var enableMultipleValue = "";
                            return model.get("typeName").indexOf("array<") > -1 && (enableMultipleValue = "checked"), 
                            '<input type="checkbox" class="form-check-input multi-value-select" data-id="multiValueSelectStatus" ' + enableMultipleValue + ' disabled="disabled">';
                        }
                    })
                },
                maxStrLength: {
                    label: "Max Length",
                    cell: "html",
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            var maxString = "NA";
                            return model.get("typeName").indexOf("string") > -1 && (maxString = model.get("options").maxStrLength || maxString), 
                            maxString;
                        }
                    })
                },
                applicableEntityTypes: {
                    label: "Entity Type(s)",
                    cell: "html",
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            var options = model.get("options");
                            if (options && options.applicableEntityTypes) {
                                var applicableEntityTypes = "", attrEntityTypes = JSON.parse(options.applicableEntityTypes);
                                return _.each(attrEntityTypes, function(values) {
                                    applicableEntityTypes += '<label class="btn btn-action btn-xs btn-blue no-pointer">' + values + "</label>";
                                }), applicableEntityTypes;
                            }
                        }
                    })
                },
                tool: {
                    label: "Action",
                    cell: "html",
                    editable: !1,
                    sortable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return '<div class="btn btn-action btn-sm" data-id="attributeEdit" data-action="attributeEdit" data-name="' + model.get("name") + '">Edit</div>';
                        }
                    })
                }
            }, this.businessMetadataAttr);
        }
    });
    return BusinessMetadataAttrTableLayoutView;
});