define([ "require", "backbone", "hbs!tmpl/tag/TagDetailTableLayoutView_tmpl", "utils/CommonViewFunction", "utils/Utils", "collection/VTagList", "utils/Messages", "utils/Enums" ], function(require, Backbone, TagDetailTableLayoutView_tmpl, CommonViewFunction, Utils, VTagList, Messages, Enums) {
    "use strict";
    var TagDetailTableLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "TagDetailTableLayoutView",
        template: TagDetailTableLayoutView_tmpl,
        regions: {
            RTagTableLayoutView: "#r_tagTableLayoutView"
        },
        ui: {
            detailValue: "[data-id='detailValue']",
            tagList: "[data-id='tagList']",
            addTag: "[data-id='addTag']",
            deleteTag: "[data-id='delete']",
            editTag: "[data-id='edit']",
            checkPropagtedTag: "[data-id='checkPropagtedTag']",
            propagatedFromClick: "[data-id='propagatedFromClick']"
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.addTag] = function(e) {
                this.addModalView(e);
            }, events["click " + this.ui.deleteTag] = function(e) {
                this.onClickTagCross(e);
            }, events["click " + this.ui.editTag] = function(e) {
                this.editTagDataModal(e);
            }, events["click " + this.ui.propagatedFromClick] = function(e) {
                Utils.setUrl({
                    url: "#!/detailPage/" + $(e.currentTarget).data("guid"),
                    mergeBrowserUrl: !1,
                    trigger: !0
                });
            }, events["click " + this.ui.checkPropagtedTag] = "onCheckPropagtedTag", events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "entity", "guid", "tags", "entityName", "fetchCollection", "enumDefCollection", "classificationDefCollection", "searchVent")), 
            this.collectionObject = this.entity, this.tagCollection = new VTagList(), this.allTags = _.sortBy(_.toArray(this.collectionObject.classifications), "typeName");
            var paramObj = Utils.getUrlState.getQueryParams();
            this.value = {
                tabActive: "classification",
                showPC: "true",
                filter: "all"
            }, paramObj && (paramObj.showPC && (this.value.showPC = paramObj.showPC), paramObj.filter && (this.value.filter = paramObj.filter)), 
            this.commonTableOptions = {
                collection: this.tagCollection,
                includeFilter: !1,
                includePagination: !0,
                includeFooterRecords: !0,
                includePageSize: !0,
                includeGotoPage: !0,
                includeAtlasTableSorting: !0,
                gridOpts: {
                    className: "table table-hover backgrid table-quickMenu",
                    emptyText: "No records found!"
                },
                filterOpts: {},
                paginatorOpts: {}
            };
        },
        bindEvents: function() {},
        onRender: function() {
            this.ui.checkPropagtedTag.prop("checked", "true" === this.value.showPC), this.renderFilter(), 
            void 0 === this.tagNotFound && "all" === this.value.filter && this.updateCollection(this.value.filter), 
            this.renderTableLayoutView();
        },
        updateCollection: function(value) {
            var newList = null;
            newList = "true" === this.value.showPC ? "all" === value ? this.allTags : _.filter(this.allTags, function(obj) {
                if (obj.typeName === value) return !0;
            }) : "all" === value ? this.tags.self : _.filter(this.tags.self, function(obj) {
                if (obj.typeName === value) return !0;
            }), this.tagCollection.fullCollection.reset(newList), value && (this.value.filter = value, 
            this.triggetUrl());
        },
        triggetUrl: function() {
            var paramObj = Utils.getUrlState.getQueryParams();
            paramObj && "classification" === paramObj.tabActive && "term" !== paramObj.viewType && Utils.setUrl({
                url: "#!/detailPage/" + this.guid,
                mergeBrowserUrl: !1,
                urlParams: this.value,
                trigger: !1
            });
        },
        renderFilter: function() {
            var tagName = "<option value='all' selected>All</option>", that = this;
            "false" === this.value.showPC ? _.each(this.tags.self, function(val) {
                var typeName = val.typeName;
                tagName += '<option value="' + typeName + '">' + typeName + "</option>";
            }) : _.each(this.tags.combineMap, function(val, key) {
                tagName += '<option value="' + key + '">' + key + "</option>";
            }), this.ui.tagList.html(tagName), this.value.filter && this.ui.tagList.val() !== this.value.filter && (this.ui.tagList.find("option[value='" + this.value.filter + "']").length > 0 ? (this.ui.tagList.val(this.value.filter), 
            this.updateCollection(this.value.filter)) : (this.tagNotFound = !0, this.updateCollection("all"))), 
            this.ui.tagList.select2({
                placeholder: "Search for tag"
            }).on("change", function() {
                var value = that.ui.tagList.val();
                that.updateCollection(value);
            });
        },
        renderTableLayoutView: function() {
            var that = this;
            require([ "utils/TableLayout" ], function(TableLayout) {
                var cols = new Backgrid.Columns(that.getSchemaTableColumns());
                that.RTagTableLayoutView && that.RTagTableLayoutView.show(new TableLayout(_.extend({}, that.commonTableOptions, {
                    columns: cols
                })));
            });
        },
        getSchemaTableColumns: function(options) {
            var that = this;
            return this.tagCollection.constructor.getTableCols({
                typeName: {
                    label: "Classification",
                    cell: "html",
                    editable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            if (that.guid !== model.get("entityGuid")) {
                                var purgeEntityBtn = Enums.isEntityPurged[model.get("entityStatus")] ? ' title="Entity not available" disabled' : ' data-id="propagatedFromClick"', propagtedFrom = ' <span class="btn btn-action btn-sm btn-icon btn-blue" data-guid=' + model.get("entityGuid") + purgeEntityBtn + "><span> Propagated From </span></span>";
                                return '<a title="" href="#!/tag/tagAttribute/' + model.get("typeName") + '">' + model.get("typeName") + "</a>" + propagtedFrom;
                            }
                            return '<a title="' + model.get("typeName") + '" href="#!/tag/tagAttribute/' + model.get("typeName") + '">' + model.get("typeName") + "</a>";
                        }
                    })
                },
                attributes: {
                    label: "Attributes",
                    cell: "html",
                    editable: !1,
                    sortable: !1,
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            var values = model.get("attributes"), data = that.classificationDefCollection.fullCollection.findWhere({
                                name: model.get("typeName")
                            }), attributeDefs = data ? Utils.getNestedSuperTypeObj({
                                data: data.toJSON(),
                                collection: that.classificationDefCollection,
                                attrMerge: !0
                            }) : null, tagValue = "NA";
                            if (!_.isEmpty(attributeDefs)) {
                                var stringValue = "";
                                _.each(_.sortBy(_.map(attributeDefs, function(obj) {
                                    return obj.sortKey = obj.name && _.isString(obj.name) ? obj.name.toLowerCase() : "-", 
                                    obj;
                                }), "sortKey"), function(sortedObj) {
                                    var val = _.isNull(values[sortedObj.name]) ? "-" : values[sortedObj.name], key = sortedObj.name;
                                    _.isObject(val) && (val = JSON.stringify(val)), "date" === sortedObj.typeName && (val = Utils.formatDate({
                                        date: val
                                    })), stringValue += "<tr><td class='html-cell string-cell renderable'>" + _.escape(key) + "</td><td class='html-cell string-cell renderable' data-type='" + sortedObj.typeName + "'>" + _.escape(val) + "</td>";
                                }), tagValue = "<div class='mainAttrTable'><table class='attriTable'><tr><th class='html-cell string-cell renderable'>Name</th><th class='html-cell string-cell renderable'>Value</th>" + stringValue + "</table></div>";
                            }
                            return tagValue;
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
                            var deleteData = '<button title="Delete" class="btn btn-action btn-sm" data-id="delete" data-entityguid="' + model.get("entityGuid") + '" data-name="' + model.get("typeName") + '"><i class="fa fa-trash"></i></button>', editData = '<button title="Edit" class="btn btn-action btn-sm" data-id="edit" data-name="' + model.get("typeName") + '"><i class="fa fa-pencil"></i></button>';
                            return that.guid === model.get("entityGuid") ? '<div class="btn-inline">' + deleteData + editData + "</div>" : that.guid !== model.get("entityGuid") && "DELETED" === model.get("entityStatus") ? '<div class="btn-inline">' + deleteData + "</div>" : void 0;
                        }
                    })
                }
            }, this.tagCollection);
        },
        addModalView: function(e) {
            var that = this;
            require([ "views/tag/AddTagModalView" ], function(AddTagModalView) {
                new AddTagModalView({
                    guid: that.guid,
                    modalCollection: that.collection,
                    collection: that.classificationDefCollection,
                    enumDefCollection: that.enumDefCollection
                });
            });
        },
        onClickTagCross: function(e) {
            var that = this, tagName = $(e.currentTarget).data("name"), entityGuid = $(e.currentTarget).data("entityguid");
            CommonViewFunction.deleteTag({
                tagName: tagName,
                guid: that.guid,
                associatedGuid: that.guid != entityGuid ? entityGuid : null,
                msg: "<div class='ellipsis-with-margin'>Remove: <b>" + _.escape(tagName) + "</b> assignment from <b>" + this.entityName + "?</b></div>",
                titleMessage: Messages.removeTag,
                okText: "Remove",
                showLoader: function() {
                    that.$(".fontLoader").show(), that.$(".tableOverlay").show();
                },
                hideLoader: function() {
                    that.$(".fontLoader").hide(), that.$(".tableOverlay").hide();
                },
                callback: function() {
                    this.hideLoader(), that.searchVent && that.searchVent.trigger("Classification:Count:Update"), 
                    that.fetchCollection && that.fetchCollection();
                }
            });
        },
        editTagDataModal: function(e) {
            var that = this, tagName = $(e.currentTarget).data("name"), tagModel = _.find(that.collectionObject.classifications, function(tag) {
                return tagName === tag.typeName && that.guid === tag.entityGuid;
            });
            require([ "views/tag/AddTagModalView" ], function(AddTagModalView) {
                new AddTagModalView({
                    tagModel: tagModel,
                    callback: function() {
                        that.fetchCollection();
                    },
                    guid: that.guid,
                    collection: that.classificationDefCollection,
                    enumDefCollection: that.enumDefCollection
                });
            });
        },
        onCheckPropagtedTag: function(e) {
            var that = this;
            e.stopPropagation(), e.target.checked ? that.tagCollection.fullCollection.reset(this.allTags) : that.tagCollection.fullCollection.reset(this.tags.self), 
            this.value.showPC = "" + e.target.checked, this.value.filter = "all", this.triggetUrl(), 
            this.renderFilter(e.target.checked);
        }
    });
    return TagDetailTableLayoutView;
});