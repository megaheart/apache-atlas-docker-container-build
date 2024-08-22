define([ "require", "backbone", "hbs!tmpl/profile/ProfileTableLayoutView_tmpl", "collection/VProfileList", "utils/Utils", "utils/Messages", "utils/Globals", "moment", "utils/UrlLinks", "collection/VCommonList", "collection/VEntityList", "d3", "sparkline" ], function(require, Backbone, ProfileTableLayoutViewTmpl, VProfileList, Utils, Messages, Globals, moment, UrlLinks, VCommonList, VEntityList, d3, sparkline) {
    "use strict";
    var ProfileTableLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "ProfileTableLayoutView",
        template: ProfileTableLayoutViewTmpl,
        regions: {
            RProfileTableLayoutView: "#r_profileTableLayoutView"
        },
        ui: {},
        events: function() {
            var events = {};
            return events["click " + this.ui.addTag] = "checkedValue", events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "profileData", "guid", "entityDetail"));
            this.profileCollection = new VCommonList([], {
                comparator: function(item) {
                    return item.get("position") || 999;
                }
            }), this.bindEvents();
        },
        onRender: function() {
            this.fetchEntity();
        },
        fetchEntity: function(argument) {
            var that = this;
            this.collection = new VEntityList([], {}), this.collection.url = UrlLinks.entitiesApiUrl({
                guid: this.guid,
                minExtInfo: !1
            }), this.collection.fetch({
                success: function(response) {
                    that.entityObject = that.collection.first().toJSON();
                    var collectionJSON = that.entityObject.entity;
                    that.entityDetail = collectionJSON.attributes, Utils.findAndMergeRefEntity({
                        attributeObject: collectionJSON.attributes,
                        referredEntities: that.entityObject.referredEntities
                    }), Utils.findAndMergeRefEntity({
                        attributeObject: collectionJSON.relationshipAttributes,
                        referredEntities: that.entityObject.referredEntities
                    });
                    var columns = collectionJSON.relationshipAttributes.columns || collectionJSON.attributes.columns, db = collectionJSON.relationshipAttributes.db || collectionJSON.attributes.db;
                    if (that.renderTableLayoutView(), that.entityDetail) {
                        that.guid && that.entityDetail.name && that.$(".table_name .graphval").html('<b><a href="#!/detailPage/' + that.guid + '">' + that.entityDetail.name + "</a></b>"), 
                        db && that.$(".db_name .graphval").html('<b><a href="#!/detailPage/' + db.guid + '?profile=true">' + Utils.getName(db) + "</a></b>");
                        var profileData = that.entityDetail.profileData;
                        profileData && profileData.attributes && profileData.attributes.rowCount && that.$(".rowValue .graphval").html("<b>" + d3.format("2s")(profileData.attributes.rowCount).replace("G", "B") + "</b>"), 
                        that.$(".table_created .graphval").html("<b>" + (that.entityDetail.createTime ? moment(that.entityDetail.createTime).format("LL") : "--") + "</b>");
                    }
                    _.each(columns, function(obj) {
                        if (obj.attributes && obj.attributes.profileData) {
                            var profileObj = Utils.getProfileTabType(obj.attributes.profileData.attributes, !0), changeValueObj = {};
                            profileObj && profileObj.type && ("numeric" === profileObj.type && (changeValueObj.averageLength = 0, 
                            changeValueObj.maxLength = 0), "string" === profileObj.type && (changeValueObj.minValue = 0, 
                            changeValueObj.maxValue = 0, changeValueObj.meanValue = 0, changeValueObj.medianValue = 0), 
                            "date" === profileObj.type && (changeValueObj.averageLength = 0, changeValueObj.maxLength = 0, 
                            changeValueObj.minValue = 0, changeValueObj.maxValue = 0, changeValueObj.meanValue = 0, 
                            changeValueObj.medianValue = 0)), that.profileCollection.fullCollection.add(_.extend({}, obj.attributes, obj.attributes.profileData.attributes, changeValueObj, {
                                guid: obj.guid,
                                position: obj.attributes ? obj.attributes.position : null
                            }));
                        }
                    });
                },
                reset: !1
            });
        },
        bindEvents: function() {
            this.listenTo(this.profileCollection, "backgrid:refresh", function(model, checked) {
                this.renderGraphs();
            }, this);
        },
        renderTableLayoutView: function() {
            var that = this;
            require([ "utils/TableLayout" ], function(TableLayout) {
                var cols = new Backgrid.Columns(that.getAuditTableColumns());
                that.RProfileTableLayoutView.show(new TableLayout(_.extend({}, {
                    columns: cols,
                    collection: that.profileCollection,
                    includeFilter: !1,
                    includePagination: !0,
                    includePageSize: !1,
                    includeFooterRecords: !0,
                    gridOpts: {
                        className: "table table-hover backgrid table-quickMenu",
                        emptyText: "No records found!"
                    }
                }))), that.renderGraphs();
            });
        },
        renderGraphs: function() {
            this.$(".sparklines").sparkline("html", {
                enableTagOptions: !0
            }), this.$(".sparklines").bind("sparklineClick", function(ev) {
                var id = $(ev.target).data().guid;
                Utils.setUrl({
                    url: "#!/detailPage/" + id,
                    mergeBrowserUrl: !1,
                    trigger: !0,
                    urlParams: {
                        tabActive: "profile"
                    }
                });
            });
        },
        getAuditTableColumns: function() {
            return this.profileCollection.constructor.getTableCols({
                name: {
                    label: "Name",
                    cell: "Html",
                    editable: !1,
                    sortable: !0,
                    sortType: "toggle",
                    direction: "ascending",
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            return '<div><a href="#!/detailPage/' + model.get("guid") + '?profile=true">' + rawValue + "</a></div>";
                        }
                    })
                },
                type: {
                    label: "Type",
                    cell: "String",
                    editable: !1,
                    sortable: !0,
                    sortType: "toggle"
                },
                nonNullData: {
                    label: "% NonNull",
                    cell: "Html",
                    editable: !1,
                    sortable: !0,
                    sortType: "toggle",
                    width: "180",
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            if (rawValue < 50) var barClass = rawValue > 30 && rawValue <= 50 ? "progress-bar-warning" : "progress-bar-danger"; else var barClass = "progress-bar-success";
                            return '<div class="progress cstm_progress" title="' + rawValue + '%"><div class="progress-bar ' + barClass + ' cstm_success-bar progress-bar-striped" style="width:' + rawValue + '%">' + rawValue + "%</div></div>";
                        }
                    })
                },
                distributionDecile: {
                    label: "Distribution",
                    cell: "Html",
                    editable: !1,
                    sortable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            var sparkarray = [], distibutionObj = Utils.getProfileTabType(model.toJSON());
                            return distibutionObj && _.each(distibutionObj.actualObj, function(obj) {
                                sparkarray.push(obj.count);
                            }), '<span data-guid="' + model.get("guid") + '" class="sparklines" sparkType="bar" sparkBarColor="#38BB9B" values="' + sparkarray.join(",") + '"></span>';
                        }
                    })
                },
                cardinality: {
                    label: "Cardinality",
                    cell: "Number",
                    editable: !1,
                    sortable: !0,
                    sortType: "toggle"
                },
                minValue: {
                    label: "Min",
                    cell: "Number",
                    editable: !1,
                    sortable: !0,
                    sortType: "toggle",
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            var profileObj = Utils.getProfileTabType(model.toJSON(), !0);
                            return profileObj && "numeric" === profileObj.type ? rawValue : "-";
                        }
                    })
                },
                maxValue: {
                    label: "Max",
                    cell: "Number",
                    editable: !1,
                    sortable: !0,
                    sortType: "toggle",
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            var profileObj = Utils.getProfileTabType(model.toJSON(), !0);
                            return profileObj && "numeric" === profileObj.type ? rawValue : "-";
                        }
                    })
                },
                averageLength: {
                    label: "Average Length",
                    cell: "Number",
                    editable: !1,
                    sortable: !0,
                    sortType: "toggle",
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            var profileObj = Utils.getProfileTabType(model.toJSON(), !0);
                            return profileObj && "string" === profileObj.type ? rawValue : "-";
                        }
                    })
                },
                maxLength: {
                    label: "Max Length",
                    cell: "Number",
                    editable: !1,
                    sortable: !0,
                    sortType: "toggle",
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            var profileObj = Utils.getProfileTabType(model.toJSON(), !0);
                            return profileObj && "string" === profileObj.type ? rawValue : "-";
                        }
                    })
                },
                meanValue: {
                    label: "Mean",
                    cell: "Number",
                    editable: !1,
                    sortable: !0,
                    sortType: "toggle",
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            var profileObj = Utils.getProfileTabType(model.toJSON(), !0);
                            return profileObj && "numeric" === profileObj.type ? rawValue : "-";
                        }
                    })
                },
                medianValue: {
                    label: "Median",
                    cell: "Number",
                    editable: !1,
                    sortable: !0,
                    sortType: "toggle",
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            var profileObj = Utils.getProfileTabType(model.toJSON(), !0);
                            return profileObj && "numeric" === profileObj.type ? rawValue : "-";
                        }
                    })
                }
            }, this.profileCollection);
        }
    });
    return ProfileTableLayoutView;
});