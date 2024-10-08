define([ "require", "backbone", "hbs!tmpl/glossary/TermRelationAttributeLayoutView_tmpl", "hbs!tmpl/glossary/TermRelationAttributeTable_tmpl", "utils/Enums", "utils/Utils", "utils/UrlLinks", "modules/Modal" ], function(require, Backbone, TermRelationAttributeLayoutViewTmpl, TermRelationAttributeTableTmpl, Enums, Utils, UrlLinks, Modal) {
    var TermRelationAttributeTable = Backbone.Marionette.LayoutView.extend({
        _viewName: "TermRelationAttributeTable",
        template: TermRelationAttributeTableTmpl,
        templateHelpers: function() {
            return {
                attributeValue: this.data[this.selectedTermAttribute],
                selectedTermAttribute: this.selectedTermAttribute,
                editMode: this.editMode,
                attributes: Enums.termRelationAttributeList[this.selectedTermAttribute]
            };
        },
        ui: {
            deleteAttribute: '[data-id="deleteAttribute"]',
            attributeUpdate: '[data-id="attributeUpdate"]'
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.deleteAttribute] = "onModalDeleteAttribute", events["change " + this.ui.attributeUpdate] = "onAttributeUpdate", 
            events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "glossaryCollection", "data", "callback", "selectedTermAttribute", "onDeleteAttribute", "editMode"));
            var that = this;
            this.updateObj = $.extend(!0, {}, this.data), this.modal = new Modal({
                title: (this.editMode ? "Edit attributes" : "Attributes") + " of " + this.selectedTermAttribute,
                content: this,
                okText: this.editMode ? "Update" : "Close",
                allowCancel: !!this.editMode,
                okCloses: !0,
                width: "80%"
            }), this.modal.open(), this.modal.on("closeModal", function() {
                that.modal.trigger("cancel");
            }), this.modal.on("ok", function() {
                that.editMode && that.updateAttributes();
            }), this.bindEvents();
        },
        bindEvents: function() {
            this.listenTo(this.glossaryCollection, "data:updated", function(data) {
                this.data = data, this.render();
            }, this);
        },
        onRender: function() {},
        onModalDeleteAttribute: function(e) {
            this.onDeleteAttribute(e);
        },
        onAttributeUpdate: function(e) {
            var $el = $(e.currentTarget), termGuid = $el.data("termguid"), name = $el.data("name");
            _.find(this.updateObj[this.selectedTermAttribute], function(obj) {
                obj.termGuid == termGuid && (obj[name] = $el.val());
            });
        },
        updateAttributes: function() {
            var that = this, model = new this.glossaryCollection.model(), ajaxOptions = {
                success: function(rModel, response) {
                    Utils.notifySuccess({
                        content: "Attributes updated successfully"
                    }), that.callback && that.callback();
                }
            };
            model.createEditTerm(_.extend(ajaxOptions, {
                data: JSON.stringify(this.updateObj)
            }, {
                guid: this.updateObj.guid
            }));
        }
    }), TermRelationAttributeLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "TermRelationAttributeLayoutView",
        template: TermRelationAttributeLayoutViewTmpl,
        templateHelpers: function() {
            return {
                attributeList: Enums.termRelationAttributeList
            };
        },
        regions: {},
        ui: {
            showAttribute: '[data-id="showAttribute"]',
            addTermRelation: '[data-id="addTermRelation"]',
            termAttributeTable: '[data-id="termAttributeTable"]',
            deleteAttribute: '[data-id="deleteAttribute"]'
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.addTermRelation] = "onAddTermRelation", events["click " + this.ui.deleteAttribute] = "onDeleteAttribute", 
            events["click " + this.ui.showAttribute] = "onShowAttribute", events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "glossaryCollection", "data", "fetchCollection"));
        },
        bindEvents: function() {},
        onRender: function() {
            this.renderTermAttributeTable();
        },
        onShowAttribute: function(e) {
            var that = this, attributename = $(e.currentTarget).data("attributename");
            new TermRelationAttributeTable({
                data: that.data,
                editMode: "edit" == $(e.currentTarget).data("mode"),
                selectedTermAttribute: attributename,
                callback: function() {
                    that.fetchCollection && that.fetchCollection();
                },
                onDeleteAttribute: that.onDeleteAttribute.bind(that),
                glossaryCollection: that.glossaryCollection
            });
        },
        onAddTermRelation: function(e) {
            var that = this, attributename = $(e.currentTarget).data("attributename");
            require([ "views/glossary/AssignTermLayoutView" ], function(AssignTermLayoutView) {
                new AssignTermLayoutView({
                    isAttributeRelationView: !0,
                    termData: that.data,
                    selectedTermAttribute: attributename,
                    callback: function() {
                        that.fetchCollection && that.fetchCollection();
                    },
                    glossaryCollection: that.glossaryCollection
                });
            });
        },
        onDeleteAttribute: function(e) {
            e.stopPropagation();
            var that = this, notifyObj = {
                modal: !0,
                text: "Are you sure you want to remove term association",
                okText: "Remove",
                ok: function(argument) {
                    var model = new that.glossaryCollection.model(), selectedGuid = $(e.currentTarget).data("termguid"), attributename = $(e.currentTarget).data("attributename"), ajaxOptions = {
                        success: function(rModel, response) {
                            Utils.notifySuccess({
                                content: "Association removed successfully "
                            }), that.fetchCollection && that.fetchCollection();
                        }
                    }, data = _.clone(that.data);
                    data[attributename] = _.reject(data[attributename], function(obj) {
                        return obj.termGuid == selectedGuid;
                    }), model.removeTermFromAttributes(_.extend(ajaxOptions, {
                        data: JSON.stringify(data)
                    }, {
                        guid: that.data.guid
                    }));
                },
                cancel: function(argument) {}
            };
            Utils.notifyConfirm(notifyObj);
        },
        renderTermAttributeTable: function(e, options) {
            var that = this;
            this.ui.termAttributeTable.html(TermRelationAttributeTableTmpl({
                data: this.data,
                attributes: Enums.termRelationAttributeList,
                relationTypeTable: !0,
                getTerms: function(key) {
                    var terms = _.map(that.data[key], function(obj) {
                        var name = _.escape(obj.qualifiedName) || _.escape(obj.displayText);
                        return '<span data-guid="' + obj.termGuid + '" class="btn btn-action btn-sm btn-icon btn-blue" data-id="termClick"><span title="' + name + '">' + name + '</span><i class="fa fa-close" data-id="deleteAttribute" data-attributename="' + key + '" data-termguid="' + obj.termGuid + '" data-type="term" title="Remove Term"></i></span>';
                    }).join(""), attributeButtons = "";
                    return terms.length && (attributeButtons = '<div class="btn-inline"><button type="button" title="View Attribute" class="btn btn-action btn-sm" data-attributename="' + key + '" data-id="showAttribute"><i class="fa fa-eye fa-fw" aria-hidden="true"></i></button><button type="button" title="Edit Attribute" class="btn btn-action btn-sm" data-attributename="' + key + '" data-mode="edit" data-id="showAttribute"><i class="fa fa-pencil fa-fw" aria-hidden="true"></i></button></div>'), 
                    "<td>" + terms + '<button type="button" data-attributename="' + key + '" class="btn btn-action btn-sm" data-id="addTermRelation"><i class="fa fa-plus"></i></button></td><td>' + attributeButtons + "</td>";
                }
            }));
        }
    });
    return TermRelationAttributeLayoutView;
});