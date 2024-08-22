define([ "require", "backbone", "hbs!tmpl/tag/TagAttributeDetailLayoutView_tmpl", "utils/Utils", "views/tag/AddTagAttributeView", "collection/VTagList", "models/VTag", "utils/Messages", "utils/UrlLinks", "utils/Globals" ], function(require, Backbone, TagAttributeDetailLayoutViewTmpl, Utils, AddTagAttributeView, VTagList, VTag, Messages, UrlLinks, Globals) {
    "use strict";
    var TagAttributeDetailLayoutView = Backbone.Marionette.LayoutView.extend({
        template: TagAttributeDetailLayoutViewTmpl,
        regions: {},
        ui: {
            title: '[data-id="title"]',
            editButton: '[data-id="editButton"]',
            editBox: '[data-id="editBox"]',
            saveButton: "[data-id='saveButton']",
            showAttribute: "[data-id='showAttribute']",
            addAttribute: '[data-id="addAttribute"]',
            description: '[data-id="description"]',
            publishButton: '[data-id="publishButton"]',
            superType: "[data-id='superType']",
            subType: "[data-id='subType']",
            entityType: "[data-id='entityType']",
            backButton: '[data-id="backButton"]',
            textType: '[name="textType"]'
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.addAttribute] = "onClickAddTagAttributeBtn", events["click " + this.ui.editButton] = "onEditButton", 
            events["click " + this.ui.backButton] = function() {
                Utils.backButtonClick();
            }, events["change " + this.ui.textType] = function(e) {
                this.isTextTypeChecked = !this.isTextTypeChecked, this.isTextTypeChecked ? this.ui.description.text(this.model.get("description")) : this.ui.description.html(this.model.get("description"));
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "tag", "collection", "enumDefCollection")), this.isTextTypeChecked = !1;
        },
        bindEvents: function() {
            this.listenTo(this.collection, "reset", function() {
                this.model || (this.model = this.collection.fullCollection.findWhere({
                    name: this.tag
                }), this.model ? this.renderTagDetail() : (this.$(".fontLoader").hide(), Utils.notifyError({
                    content: "Tag Not Found"
                })));
            }, this), this.listenTo(this.tagCollection, "error", function(error, response) {
                response.responseJSON && response.responseJSON.error ? Utils.notifyError({
                    content: response.responseJSON.error
                }) : Utils.notifyError({
                    content: "Something went wrong"
                }), this.$(".fontLoader").hide();
            }, this);
        },
        onRender: function() {
            Utils.showTitleLoader(this.$(".page-title .fontLoader"), this.$(".tagDetail")), 
            this.collection.models.length && !this.model && (Globals[this.tag] && this.collection.fullCollection.push(Globals[this.tag]), 
            this.model = this.collection.fullCollection.findWhere({
                name: this.tag
            }), this.renderTagDetail()), this.bindEvents(), this.ui.saveButton.attr("disabled", "true"), 
            this.ui.publishButton.prop("disabled", !0);
        },
        renderTagDetail: function() {
            var that = this, attributeData = "", attributeDefs = this.model.get("attributeDefs"), genrateType = function(options) {
                var data = options.data;
                _.each(data, function(value, key) {
                    var str = "", el = that.ui[key];
                    _.each(value, function(name) {
                        el.parents("." + key).show(), str += ' <a class="btn btn-action btn-sm" href="' + ("entityType" === key ? "javascript:void(0)" : "#!/tag/tagAttribute/" + name) + '">' + name + "</a>";
                    }), el.html(str);
                });
            };
            this.ui.title.html("<span>" + Utils.getName(this.model.toJSON()) + "</span>"), this.model.get("description") && (this.isTextTypeChecked ? this.ui.description.text(this.model.get("description")) : this.ui.description.html(this.model.get("description"))), 
            attributeDefs && (_.isArray(attributeDefs) || (attributeDefs = [ attributeDefs ]), 
            _.each(attributeDefs, function(value, key) {
                attributeData += '<button class="btn btn-action btn-disabled btn-sm">' + Utils.getName(value) + "</button>";
            }), this.ui.showAttribute.html(attributeData)), genrateType({
                data: {
                    superType: this.model.get("superTypes"),
                    subType: this.model.get("subTypes"),
                    entityType: this.model.get("entityTypes")
                }
            }), Utils.hideTitleLoader(this.$(".fontLoader"), this.$(".tagDetail"));
        },
        onSaveButton: function(saveObject, message) {
            var that = this, validate = !0;
            return this.modal.$el.find(".attributeInput").each(function() {
                "" === $(this).val().trim() && ($(this).css("borderColor", "red"), validate = !1);
            }), this.modal.$el.find(".attributeInput").keyup(function() {
                $(this).css("borderColor", "#e8e9ee");
            }), validate ? (Utils.showTitleLoader(this.$(".page-title .fontLoader"), this.$(".tagDetail")), 
            this.model.saveTagAttribute({
                data: JSON.stringify({
                    classificationDefs: [ saveObject ],
                    entityDefs: [],
                    enumDefs: [],
                    structDefs: []
                }),
                success: function(model, response) {
                    model.classificationDefs && that.model.set(model.classificationDefs[0]), that.renderTagDetail(), 
                    Utils.notifySuccess({
                        content: message
                    });
                },
                cust_error: function() {
                    Utils.hideTitleLoader(that.$(".fontLoader"), that.$(".tagDetail"));
                }
            }), void that.modal.close()) : void Utils.notifyInfo({
                content: "Please fill the attributes or delete the input box"
            });
        },
        onClickAddTagAttributeBtn: function(e) {
            var that = this;
            require([ "views/tag/AddTagAttributeView", "modules/Modal" ], function(AddTagAttributeView, Modal) {
                var view = new AddTagAttributeView({
                    enumDefCollection: that.enumDefCollection
                });
                that.modal = new Modal({
                    title: "Add Attribute",
                    content: view,
                    cancelText: "Cancel",
                    okText: "Add",
                    allowCancel: !0,
                    okCloses: !1
                }).open(), that.modal.$el.find("button.ok").attr("disabled", "true"), view.ui.addAttributeDiv.on("keyup", ".attributeInput", function(e) {
                    "" == e.target.value.trim() ? that.modal.$el.find("button.ok").attr("disabled", "disabled") : that.modal.$el.find("button.ok").removeAttr("disabled");
                }), that.modal.on("ok", function() {
                    var newAttributeList = view.collection.toJSON(), activeTagAttribute = _.extend([], that.model.get("attributeDefs")), superTypes = that.model.get("superTypes");
                    _.each(superTypes, function(name) {
                        var parentTags = that.collection.fullCollection.findWhere({
                            name: name
                        });
                        activeTagAttribute = activeTagAttribute.concat(parentTags.get("attributeDefs"));
                    });
                    var duplicateAttributeList = [], saveObj = $.extend(!0, {}, that.model.toJSON());
                    _.each(newAttributeList, function(obj) {
                        var duplicateCheck = _.find(activeTagAttribute, function(activeTagObj) {
                            return activeTagObj.name.toLowerCase() === obj.name.toLowerCase();
                        });
                        duplicateCheck ? duplicateAttributeList.push(_.escape(obj.name)) : saveObj.attributeDefs.push(obj);
                    });
                    var notifyObj = {
                        modal: !0,
                        confirm: {
                            confirm: !0,
                            buttons: [ {
                                text: "Ok",
                                addClass: "btn-atlas btn-md",
                                click: function(notice) {
                                    notice.remove();
                                }
                            }, null ]
                        }
                    };
                    if (saveObj && !duplicateAttributeList.length) that.onSaveButton(saveObj, Messages.tag.addAttributeSuccessMessage); else {
                        if (duplicateAttributeList.length < 2) var text = "Attribute <b>" + duplicateAttributeList.join(",") + "</b> is duplicate !"; else if (newAttributeList.length > duplicateAttributeList.length) {
                            var text = "Attributes: <b>" + duplicateAttributeList.join(",") + "</b> are duplicate ! Do you want to continue with other attributes ?";
                            notifyObj = {
                                ok: function(argument) {
                                    that.onSaveButton(saveObj, Messages.tag.addAttributeSuccessMessage);
                                },
                                cancel: function(argument) {}
                            };
                        } else var text = "All attributes are duplicate !";
                        notifyObj.text = text, Utils.notifyConfirm(notifyObj);
                    }
                }), that.modal.on("closeModal", function() {
                    that.modal.trigger("cancel");
                });
            });
        },
        textAreaChangeEvent: function(view) {
            this.model.get("description") === view.ui.description.val() || 0 == view.ui.description.val().length || 0 === view.ui.description.val().trim().length ? this.modal.$el.find("button.ok").prop("disabled", !0) : this.modal.$el.find("button.ok").prop("disabled", !1);
        },
        onPublishClick: function(view) {
            var saveObj = _.extend(this.model.toJSON(), {
                description: view.ui.description.val().trim()
            });
            this.onSaveButton(saveObj, Messages.tag.updateTagDescriptionMessage), this.ui.description.show();
        },
        onEditButton: function(e) {
            var that = this;
            $(e.currentTarget).blur(), require([ "views/tag/CreateTagLayoutView", "modules/Modal" ], function(CreateTagLayoutView, Modal) {
                var view = new CreateTagLayoutView({
                    tagCollection: that.collection,
                    model: that.model,
                    tag: that.tag,
                    enumDefCollection: enumDefCollection
                });
                that.modal = new Modal({
                    title: "Edit Classification",
                    content: view,
                    cancelText: "Cancel",
                    okText: "Save",
                    allowCancel: !0
                }).open(), view.ui.description.on("keyup input", function(e) {
                    $(this).val($(this).val().replace(/\s+/g, " ")), that.textAreaChangeEvent(view), 
                    e.stopPropagation();
                }), that.modal.$el.find("button.ok").prop("disabled", !0), that.modal.on("ok", function() {
                    that.onPublishClick(view);
                }), that.modal.on("closeModal", function() {
                    that.modal.trigger("cancel");
                });
            });
        }
    });
    return TagAttributeDetailLayoutView;
});