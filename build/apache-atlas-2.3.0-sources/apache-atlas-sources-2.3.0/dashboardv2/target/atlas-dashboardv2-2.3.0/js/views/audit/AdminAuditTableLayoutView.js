define([ "require", "backbone", "hbs!tmpl/audit/AdminAuditTableLayoutView_tmpl", "collection/VEntityList", "utils/Utils", "utils/UrlLinks", "utils/CommonViewFunction", "utils/Enums", "moment" ], function(require, Backbone, AdminAuditTableLayoutView_tmpl, VEntityList, Utils, UrlLinks, CommonViewFunction, Enums, moment) {
    "use strict";
    var AdminAuditTableLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "AdminAuditTableLayoutView",
        template: AdminAuditTableLayoutView_tmpl,
        regions: {
            RAuditTableLayoutView: "#r_adminAuditTableLayoutView",
            RQueryBuilderAdmin: "#r_attributeQueryBuilderAdmin"
        },
        ui: {
            adminPurgedEntityClick: "[data-id='adminPurgedEntity']",
            adminAuditEntityDetails: "[data-id='adminAuditEntityDetails']",
            attrFilter: "[data-id='adminAttrFilter']",
            adminRegion: "[data-id='adminRegion']",
            attrApply: "[data-id='attrApply']",
            showDefault: "[data-id='showDefault']",
            attrClose: "[data-id='attrClose']"
        },
        events: function() {
            var events = {}, that = this;
            return events["click " + this.ui.adminPurgedEntityClick] = "onClickAdminPurgedEntity", 
            events["click " + this.ui.adminAuditEntityDetails] = "showAdminAuditEntity", events["click " + this.ui.attrFilter] = function(e) {
                this.ui.attrFilter.find(".fa-angle-right").toggleClass("fa-angle-down"), this.$(".attributeResultContainer").addClass("overlay"), 
                this.$(".attribute-filter-container, .attr-filter-overlay").toggleClass("hide"), 
                this.onClickAttrFilter();
            }, events["click " + this.ui.attrClose] = function(e) {
                that.closeAttributeModel();
            }, events["click " + this.ui.attrApply] = function(e) {
                that.okAttrFilterButton(e);
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "searchTableFilters", "entityDefCollection", "enumDefCollection")), 
            this.entityCollection = new VEntityList(), this.limit = 25, this.offset = 0, this.entityCollection.url = UrlLinks.adminApiUrl(), 
            this.entityCollection.modelAttrName = "events", this.commonTableOptions = {
                collection: this.entityCollection,
                includePagination: !1,
                includeAtlasPagination: !0,
                includeFooterRecords: !1,
                includeColumnManager: !0,
                includeOrderAbleColumns: !1,
                includeSizeAbleColumns: !1,
                includeTableLoader: !0,
                includeAtlasPageSize: !0,
                includeAtlasTableSorting: !0,
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
                atlasPaginationOpts: {
                    limit: this.limit,
                    offset: this.offset,
                    fetchCollection: this.getAdminCollection.bind(this)
                },
                gridOpts: {
                    emptyText: "No Record found!",
                    className: "table table-hover backgrid table-quickMenu colSort"
                },
                filterOpts: {},
                paginatorOpts: {}
            }, this.isFilters = null, this.adminAuditEntityData = {};
        },
        onRender: function() {
            this.ui.adminRegion.hide(), this.getAdminCollection(), this.entityCollection.comparator = function(model) {
                return -model.get("timestamp");
            }, this.renderTableLayoutView();
        },
        onShow: function() {
            this.$(".fontLoader").show(), this.$(".tableOverlay").show();
        },
        bindEvents: function() {},
        closeAttributeModel: function() {
            var that = this;
            that.$(".attributeResultContainer").removeClass("overlay"), that.ui.attrFilter.find(".fa-angle-right").toggleClass("fa-angle-down"), 
            that.$(".attribute-filter-container, .attr-filter-overlay").toggleClass("hide");
        },
        onClickAttrFilter: function() {
            var that = this;
            this.ui.adminRegion.show(), require([ "views/search/QueryBuilderView" ], function(QueryBuilderView) {
                that.RQueryBuilderAdmin.show(new QueryBuilderView({
                    adminAttrFilters: !0,
                    searchTableFilters: that.searchTableFilters,
                    entityDefCollection: that.entityDefCollection,
                    enumDefCollection: that.enumDefCollection
                }));
            });
        },
        okAttrFilterButton: function(options) {
            var that = this, isFilterValidate = !0, queryBuilderRef = that.RQueryBuilderAdmin.currentView.ui.builder;
            if (queryBuilderRef.data("queryBuilder")) {
                var queryBuilder = queryBuilderRef.queryBuilder("getRules");
                queryBuilder ? (that.ruleUrl = that.searchTableFilters.adminAttrFilters = CommonViewFunction.attributeFilter.generateUrl({
                    value: queryBuilder,
                    formatedDateToLong: !0
                }), that.isFilters = queryBuilder.rules.length ? queryBuilder.rules : null) : isFilterValidate = !1;
            }
            isFilterValidate && (that.closeAttributeModel(), that.defaultPagination(), that.getAdminCollection());
        },
        getAdminCollection: function(option) {
            var that = this, auditFilters = CommonViewFunction.attributeFilter.generateAPIObj(that.ruleUrl);
            $.extend(that.entityCollection.queryParams, {
                auditFilters: that.isFilters ? auditFilters : null,
                limit: that.entityCollection.queryParams.limit || that.limit,
                offset: that.entityCollection.queryParams.offset || that.offset,
                sortBy: "startTime",
                sortOrder: "DESCENDING"
            });
            var apiObj = {
                sort: !1,
                data: _.pick(that.entityCollection.queryParams, "auditFilters", "limit", "offset", "sortBy", "sortOrder"),
                success: function(dataOrCollection, response) {
                    that.entityCollection.state.pageSize = that.entityCollection.queryParams.limit || 25, 
                    that.entityCollection.fullCollection.reset(dataOrCollection, option);
                },
                complete: function() {
                    that.$(".fontLoader").hide(), that.$(".tableOverlay").hide(), that.$(".auditTable").show();
                },
                reset: !0
            };
            this.entityCollection.getAdminData(apiObj);
        },
        renderTableLayoutView: function() {
            var that = this;
            this.ui.showDefault.hide(), require([ "utils/TableLayout" ], function(TableLayout) {
                var cols = new Backgrid.Columns(that.getAuditTableColumns());
                that.RAuditTableLayoutView.show(new TableLayout(_.extend({}, that.commonTableOptions, {
                    columns: cols
                })));
            });
        },
        createTableWithValues: function(tableDetails, isAdminAudit) {
            var attrTable = CommonViewFunction.propertyTable({
                scope: this,
                getValue: function(val, key) {
                    return key && key.toLowerCase().indexOf("time") > 0 ? Utils.formatDate({
                        date: val
                    }) : val;
                },
                valueObject: tableDetails,
                guidHyperLink: !isAdminAudit
            });
            return attrTable;
        },
        getAuditTableColumns: function() {
            var that = this;
            return this.entityCollection.constructor.getTableCols({
                result: {
                    label: "",
                    cell: "html",
                    editable: !1,
                    sortable: !1,
                    cell: Backgrid.ExpandableCell,
                    fixWidth: "20",
                    accordion: !1,
                    alwaysVisible: !0,
                    renderable: !0,
                    isExpandVisible: function(el, model) {
                        return !Enums.serverAudits[model.get("operation")];
                    },
                    expand: function(el, model) {
                        var operation = model.get("operation"), results = model.get("result") || null, adminText = "No records found", adminTypDetails = null, auditData = {
                            operation: operation,
                            model: model,
                            results: results,
                            adminText: adminText,
                            adminTypDetails: adminTypDetails
                        };
                        if (el.attr("colspan", "8"), results) {
                            adminText = "PURGE" == operation ? that.displayPurgeAndImportAudits(auditData) : "EXPORT" == operation || "IMPORT" == operation ? that.displayExportAudits(auditData) : that.displayCreateUpdateAudits(auditData);
                        }
                        $(el).append($("<div>").html(adminText));
                    }
                },
                userName: {
                    label: "Users",
                    cell: "html",
                    renderable: !0,
                    editable: !1
                },
                operation: {
                    label: "Operation",
                    cell: "String",
                    renderable: !0,
                    editable: !1
                },
                clientId: {
                    label: "Client ID",
                    cell: "String",
                    renderable: !0,
                    editable: !1
                },
                resultCount: {
                    label: "Result Count",
                    cell: "String",
                    renderable: !0,
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return Enums.serverAudits[model.get("operation")] ? "N/A" : rawValue;
                        }
                    })
                },
                startTime: {
                    label: "Start Time",
                    cell: "html",
                    renderable: !0,
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return Utils.formatDate({
                                date: rawValue
                            });
                        }
                    })
                },
                endTime: {
                    label: "End Time",
                    cell: "html",
                    renderable: !0,
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return Utils.formatDate({
                                date: rawValue
                            });
                        }
                    })
                },
                duration: {
                    label: "Duration",
                    cell: "html",
                    renderable: !1,
                    editable: !1,
                    sortable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            var startTime = model.get("startTime") ? parseInt(model.get("startTime")) : null, endTime = model.get("endTime") ? parseInt(model.get("endTime")) : null;
                            if (_.isNumber(startTime) && _.isNumber(endTime)) {
                                var duration = moment.duration(moment(endTime).diff(moment(startTime)));
                                return Utils.millisecondsToTime(duration);
                            }
                            return "N/A";
                        }
                    })
                }
            }, this.entityCollection);
        },
        defaultPagination: function() {
            $.extend(this.entityCollection.queryParams, {
                limit: this.limit,
                offset: this.offset
            }), this.renderTableLayoutView();
        },
        showAdminAuditEntity: function(e) {
            var typeDefObj = this.adminAuditEntityData[e.target.dataset.auditentityid], typeDetails = this.createTableWithValues(typeDefObj, !0), view = '<table class="table admin-audit-details bold-key" ><tbody >' + typeDetails + "</tbody></table>", modalData = {
                title: Enums.category[typeDefObj.category] + " Type Details: " + typeDefObj.name,
                htmlContent: view,
                mainClass: "modal-full-screen",
                okCloses: !0,
                showFooter: !1,
                width: "40%"
            };
            this.showModal(modalData);
        },
        displayPurgeAndImportAudits: function(obj) {
            var adminValues = '<ul class="col-sm-6">', guids = null, adminTypDetails = Enums.category[obj.operation];
            return guids = "PURGE" == obj.operation ? obj.results ? obj.results.replace("[", "").replace("]", "").split(",") : guids : obj.model.get("params") ? obj.model.get("params").split(",") : guids, 
            _.each(guids, function(adminGuid, index) {
                index % 5 == 0 && 0 != index && (adminValues += '</ul><ul class="col-sm-6">'), adminValues += '<li class="blue-link" data-id="adminPurgedEntity" data-operation=' + obj.operation + ">" + adminGuid.trim() + "</li>";
            }), adminValues += "</ul>", '<div class="row"><div class="attr-details"><h4 style="word-break: break-word;">' + adminTypDetails + "</h4>" + adminValues + "</div></div>";
        },
        displayExportAudits: function(obj) {
            var adminValues = "", adminTypDetails = "IMPORT" === obj.operation ? Enums.category[obj.operation] : Enums.category[obj.operation] + " And Options", resultData = obj.results ? JSON.parse(obj.results) : null, paramsData = obj.model && obj.model.get("params") && obj.model.get("params").length ? {
                params: [ obj.model.get("params") ]
            } : null;
            return resultData && (adminValues += this.showImportExportTable(resultData, obj.operation)), 
            paramsData && (adminValues += this.showImportExportTable(_.extend(paramsData, {
                paramsCount: obj.model.get("paramsCount")
            }))), adminValues = adminValues ? adminValues : obj.adminText, '<div class="row"><div class="attr-details"><h4 style="word-break: break-word;">' + adminTypDetails + "</h4>" + adminValues + "</div></div>";
        },
        showImportExportTable: function(obj, operations) {
            var that = this, view = '<ul class="col-sm-5 import-export"><table class="table admin-audit-details bold-key" ><tbody >';
            if (operations && "IMPORT" === operations) {
                var importKeys = Object.keys(obj);
                _.each(importKeys, function(key, index) {
                    var newObj = {};
                    newObj[key] = obj[key], index % 5 === 0 && 0 != index && (view += '</tbody></table></ul><ul class="col-sm-5 import-export"><table class="table admin-audit-details bold-key" ><tbody >'), 
                    view += that.createTableWithValues(newObj, !0);
                });
            } else view += this.createTableWithValues(obj, !0);
            return view += "</tbody></table></ul>";
        },
        displayCreateUpdateAudits: function(obj) {
            var that = this, resultData = JSON.parse(obj.results), typeName = obj.model ? obj.model.get("params").split(",") : null, typeContainer = "";
            _.each(typeName, function(name) {
                var typeData = resultData[name], adminValues = 1 == typeName.length ? '<ul class="col-sm-4">' : "<ul>", adminTypDetails = Enums.category[name] + " " + Enums.auditAction[obj.operation];
                typeContainer += '<div class="attr-type-container"><h4 style="word-break: break-word;">' + adminTypDetails + "</h4>", 
                _.each(typeData, function(typeDefObj, index) {
                    index % 5 == 0 && 0 != index && 1 == typeName.length && (adminValues += '</ul><ul class="col-sm-4">');
                    var panelId = typeDefObj.name.split(" ").join("") + obj.model.get("startTime");
                    that.adminAuditEntityData[panelId] = typeDefObj, adminValues += '<li class="blue-link" data-id="adminAuditEntityDetails" data-auditEntityId=' + panelId + ">" + typeDefObj.name + "</li>";
                }), adminValues += "</ul>", typeContainer += adminValues + "</div>";
            });
            var typeClass = 1 == typeName.length ? null : "admin-audit-details";
            return '<div class="row"><div class="attr-details ' + typeClass + '">' + typeContainer + "</div></div>";
        },
        onClickAdminPurgedEntity: function(e) {
            var that = this;
            require([ "views/audit/AuditTableLayoutView" ], function(AuditTableLayoutView) {
                var obj = {
                    guid: $(e.target).text(),
                    titleText: "PURGE" == e.target.dataset.operation ? "Purged Entity Details: " : "Import Details: "
                }, modalData = {
                    title: obj.titleText + obj.guid,
                    content: new AuditTableLayoutView(obj),
                    mainClass: "modal-full-screen",
                    okCloses: !0,
                    showFooter: !1
                };
                that.showModal(modalData);
            });
        },
        showModal: function(modalObj, title) {
            require([ "modules/Modal" ], function(Modal) {
                var modal = new Modal(modalObj).open();
                modal.on("closeModal", function() {
                    $(".modal").css({
                        "padding-right": "0px !important"
                    }), modal.trigger("cancel");
                }), modal.$el.on("click", "td a", function() {
                    modal.trigger("cancel");
                });
            });
        }
    });
    return AdminAuditTableLayoutView;
});