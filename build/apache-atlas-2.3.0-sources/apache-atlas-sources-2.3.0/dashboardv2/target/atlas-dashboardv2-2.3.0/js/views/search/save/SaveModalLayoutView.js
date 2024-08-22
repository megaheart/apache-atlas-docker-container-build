define([ "require", "backbone", "hbs!tmpl/search/save/SaveModalLayoutView_tmpl", "utils/Utils", "modules/Modal", "utils/UrlLinks", "platform", "models/VSearch", "utils/CommonViewFunction", "utils/Messages" ], function(require, Backbone, SaveModalLayoutViewTmpl, Utils, Modal, UrlLinks, platform, VSearch, CommonViewFunction, Messages) {
    var SaveModalLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "SaveModalLayoutView",
        template: SaveModalLayoutViewTmpl,
        regions: {},
        ui: {
            saveAsName: "[data-id='saveAsName']"
        },
        templateHelpers: function() {
            return {
                selectedModel: this.selectedModel ? this.selectedModel.toJSON() : null
            };
        },
        events: function() {
            var events = {};
            return events;
        },
        initialize: function(options) {
            var that = this;
            if (_.extend(this, _.pick(options, "selectedModel", "collection", "getValue", "isBasic", "saveObj", "isRelationship")), 
            this.model = new VSearch(), this.saveObj) this.onCreateButton(); else {
                var modal = new Modal({
                    title: (this.selectedModel ? "Update" : "Create") + " your favorite search " + (this.selectedModel ? "name" : ""),
                    content: this,
                    cancelText: "Cancel",
                    okCloses: !1,
                    okText: this.selectedModel ? "Update" : "Create",
                    allowCancel: !0
                }).open();
                modal.$el.find("button.ok").attr("disabled", "true"), modal.on("ok", function() {
                    modal.$el.find("button.ok").attr("disabled", "true"), that.onCreateButton(modal);
                }), modal.on("closeModal", function() {
                    modal.trigger("cancel");
                });
            }
        },
        onCreateButton: function(modal) {
            var that = this, obj = {
                name: this.ui.saveAsName.val ? this.ui.saveAsName.val() : null
            };
            if (this.selectedModel) {
                var saveObj = this.selectedModel.toJSON();
                saveObj.name = obj.name;
            } else {
                obj.value = this.getValue(), this.saveObj && _.extend(obj, this.saveObj);
                var saveObj = CommonViewFunction.generateObjectForSaveSearchApi(obj);
                this.isBasic ? saveObj.searchType = "BASIC" : this.isRelationship ? saveObj.searchType = "BASIC_RELATIONSHIP" : saveObj.searchType = "ADVANCED";
            }
            this.model.urlRoot = UrlLinks.saveSearchApiUrl(), this.model.save(saveObj, {
                type: saveObj.guid ? "PUT" : "POST",
                success: function(model, data) {
                    if (that.collection) if (saveObj.guid) {
                        var collectionRef = that.collection.find({
                            guid: data.guid
                        });
                        collectionRef && collectionRef.set(data), Utils.notifySuccess({
                            content: obj.name + Messages.getAbbreviationMsg(!1, "editSuccessMessage")
                        });
                    } else that.collection.add(data), Utils.notifySuccess({
                        content: obj.name + Messages.getAbbreviationMsg(!1, "addSuccessMessage")
                    });
                }
            }), modal && modal.trigger("cancel");
        }
    });
    return SaveModalLayoutView;
});