define([ "require", "backbone", "hbs!tmpl/schema/SchemaTableLayoutView_tmpl", "collection/VSchemaList", "utils/Utils", "utils/CommonViewFunction", "utils/Messages", "utils/Globals", "utils/Enums", "utils/UrlLinks" ], function(require, Backbone, SchemaTableLayoutViewTmpl, VSchemaList, Utils, CommonViewFunction, Messages, Globals, Enums, UrlLinks) {
    "use strict";
    var SchemaTableLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "SchemaTableLayoutView",
        template: SchemaTableLayoutViewTmpl,
        regions: {
            RSchemaTableLayoutView: "#r_schemaTableLayoutView"
        },
        ui: {
            tagClick: '[data-id="tagClick"]',
            addTag: "[data-id='addTag']",
            addAssignTag: "[data-id='addAssignTag']",
            checkDeletedEntity: "[data-id='checkDeletedEntity']"
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.addTag] = "checkedValue", events["click " + this.ui.addAssignTag] = "checkedValue", 
            events["click " + this.ui.tagClick] = function(e) {
                if ("i" == e.target.nodeName.toLocaleLowerCase()) this.onClickTagCross(e); else {
                    var value = e.currentTarget.text;
                    Utils.setUrl({
                        url: "#!/tag/tagAttribute/" + value,
                        mergeBrowserUrl: !1,
                        trigger: !0
                    });
                }
            }, events["click " + this.ui.checkDeletedEntity] = "onCheckDeletedEntity", events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "guid", "classificationDefCollection", "entityDefCollection", "attribute", "fetchCollection", "enumDefCollection", "searchVent")), 
            this.schemaCollection = new VSchemaList([], {}), this.commonTableOptions = {
                collection: this.schemaCollection,
                includeFilter: !1,
                includePagination: !0,
                includePageSize: !0,
                includeGotoPage: !0,
                includeFooterRecords: !0,
                includeOrderAbleColumns: !1,
                includeAtlasTableSorting: !0,
                gridOpts: {
                    className: "table table-hover backgrid table-quickMenu",
                    emptyText: "No records found!"
                },
                filterOpts: {},
                paginatorOpts: {}
            }, this.bindEvents(), this.bradCrumbList = [];
        },
        bindEvents: function() {
            var that = this;
            this.listenTo(this.schemaCollection, "backgrid:selected", function(model, checked) {
                this.arr = [], checked === !0 ? model.set("isEnable", !0) : model.set("isEnable", !1), 
                this.schemaCollection.find(function(item) {
                    var obj = item.toJSON();
                    item.get("isEnable") && "ACTIVE" === item.get("status") && that.arr.push({
                        id: obj.guid,
                        model: obj
                    });
                }), this.arr.length > 0 ? this.$(".multiSelectTag").show() : this.$(".multiSelectTag").hide();
            });
        },
        onRender: function() {
            this.generateTableData();
        },
        generateTableData: function(checkedDelete) {
            var that = this;
            if (this.activeObj = [], this.deleteObj = [], this.schemaTableAttribute = null, 
            this.attribute && this.attribute[0]) {
                var firstColumn = this.attribute[0], defObj = that.entityDefCollection.fullCollection.find({
                    name: firstColumn.typeName
                });
                if (defObj && defObj.get("options") && defObj.get("options").schemaAttributes && firstColumn) try {
                    var mapObj = JSON.parse(defObj.get("options").schemaAttributes);
                    that.schemaTableAttribute = _.pick(firstColumn.attributes, mapObj);
                } catch (e) {}
            }
            _.each(this.attribute, function(obj) {
                Enums.entityStateReadOnly[obj.status] ? Enums.entityStateReadOnly[obj.status] && that.deleteObj.push(obj) : (that.activeObj.push(obj), 
                that.schemaCollection.push(obj));
            }), 0 === this.schemaCollection.length && this.deleteObj.length && (this.ui.checkDeletedEntity.find("input").prop("checked", !0), 
            this.schemaCollection.fullCollection.reset(this.deleteObj)), 0 === this.activeObj.length && 0 === this.deleteObj.length && this.ui.checkDeletedEntity.hide(), 
            this.renderTableLayoutView();
        },
        showLoader: function() {
            this.$(".fontLoader").show(), this.$(".tableOverlay").show();
        },
        hideLoader: function(argument) {
            this.$(".fontLoader").hide(), this.$(".tableOverlay").hide();
        },
        renderTableLayoutView: function() {
            var that = this;
            require([ "utils/TableLayout" ], function(TableLayout) {
                var columnCollection = Backgrid.Columns.extend({}), columns = new columnCollection(that.getSchemaTableColumns());
                that.RSchemaTableLayoutView.show(new TableLayout(_.extend({}, that.commonTableOptions, {
                    columns: columns
                }))), that.$(".multiSelectTag").hide(), Utils.generatePopover({
                    el: that.$('[data-id="showMoreLess"]'),
                    contentClass: "popover-tag-term",
                    viewFixedPopover: !0,
                    popoverOptions: {
                        container: null,
                        content: function() {
                            return $(this).find(".popup-tag-term").children().clone();
                        }
                    }
                });
            });
        },
        getSchemaTableColumns: function() {
            var that = this, col = {
                Check: {
                    name: "selected",
                    label: "",
                    cell: "select-row",
                    headerCell: "select-all"
                }
            };
            if (this.schemaTableAttribute) return _.each(_.keys(this.schemaTableAttribute), function(key) {
                "position" !== key && (col[key] = {
                    label: key.capitalize(),
                    cell: "html",
                    editable: !1,
                    className: "searchTableName",
                    formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                        fromRaw: function(rawValue, model) {
                            var value = _.escape(model.get("attributes")[key]);
                            if ("name" === key && model.get("guid")) {
                                var nameHtml = '<a href="#!/detailPage/' + model.get("guid") + '">' + value + "</a>";
                                return model.get("status") && Enums.entityStateReadOnly[model.get("status")] ? (nameHtml += '<button type="button" title="Deleted" class="btn btn-action btn-md deleteBtn"><i class="fa fa-trash"></i></button>', 
                                '<div class="readOnly readOnlyLink">' + nameHtml + "</div>") : nameHtml;
                            }
                            return value;
                        }
                    })
                });
            }), col.tag = {
                label: "Classifications",
                cell: "Html",
                editable: !1,
                sortable: !1,
                className: "searchTag",
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function(rawValue, model) {
                        var obj = model.toJSON();
                        return obj.status && Enums.entityStateReadOnly[obj.status] ? '<div class="readOnly">' + CommonViewFunction.tagForTable(obj, that.classificationDefCollection) : CommonViewFunction.tagForTable(obj, that.classificationDefCollection);
                    }
                })
            }, this.schemaCollection.constructor.getTableCols(col, this.schemaCollection);
        },
        checkedValue: function(e) {
            e && e.stopPropagation();
            var guid = "", that = this, isTagMultiSelect = $(e.currentTarget).hasClass("multiSelectTag");
            isTagMultiSelect && this.arr && this.arr.length ? that.addTagModalView(guid, this.arr) : (guid = that.$(e.currentTarget).data("guid"), 
            that.addTagModalView(guid));
        },
        addTagModalView: function(guid, multiple) {
            var that = this, tagList = that.schemaCollection.find({
                guid: guid
            });
            require([ "views/tag/AddTagModalView" ], function(AddTagModalView) {
                new AddTagModalView({
                    guid: guid,
                    multiple: multiple,
                    tagList: _.map(tagList ? tagList.get("classifications") : [], function(obj) {
                        return obj.typeName;
                    }),
                    callback: function() {
                        that.searchVent && that.searchVent.trigger("Classification:Count:Update"), that.fetchCollection(), 
                        that.arr = [];
                    },
                    hideLoader: that.hideLoader.bind(that),
                    showLoader: that.showLoader.bind(that),
                    collection: that.classificationDefCollection,
                    enumDefCollection: that.enumDefCollection
                });
            });
        },
        onClickTagCross: function(e) {
            var that = this, tagName = $(e.target).data("name"), guid = $(e.target).data("guid"), assetName = $(e.target).data("assetname");
            CommonViewFunction.deleteTag({
                tagName: tagName,
                guid: guid,
                msg: "<div class='ellipsis-with-margin'>Remove: <b>" + _.escape(tagName) + "</b> assignment from <b>" + _.escape(assetName) + " ?</b></div>",
                titleMessage: Messages.removeTag,
                okText: "Remove",
                showLoader: that.showLoader.bind(that),
                hideLoader: that.hideLoader.bind(that),
                callback: function() {
                    that.searchVent && that.searchVent.trigger("Classification:Count:Update"), that.fetchCollection();
                }
            });
        },
        onCheckDeletedEntity: function(e) {
            e.target.checked ? this.deleteObj.length && this.schemaCollection.fullCollection.reset(this.activeObj.concat(this.deleteObj)) : this.schemaCollection.fullCollection.reset(this.activeObj);
        }
    });
    return SchemaTableLayoutView;
});