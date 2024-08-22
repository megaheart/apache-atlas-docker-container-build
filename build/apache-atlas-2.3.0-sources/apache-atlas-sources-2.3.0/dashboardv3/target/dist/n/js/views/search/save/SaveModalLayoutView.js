define([ "require", "backbone", "hbs!tmpl/search/save/SaveModalLayoutView_tmpl", "utils/Utils", "modules/Modal", "utils/UrlLinks", "platform", "models/VSearch", "collection/VSearchList", "utils/CommonViewFunction", "utils/Messages" ], function(require, Backbone, SaveModalLayoutViewTmpl, Utils, Modal, UrlLinks, platform, VSearch, VSearchList, CommonViewFunction, Messages) {
    var SaveModalLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "SaveModalLayoutView",
        template: SaveModalLayoutViewTmpl,
        regions: {},
        ui: {
            saveAsName: "[data-id='saveAsName']"
        },
        templateHelpers: function() {
            return {
                selectedModel: this.selectedModel ? this.selectedModel.toJSON() : null,
                rename: this.rename
            };
        },
        events: function() {
            var events = {};
            return events;
        },
        initialize: function(options) {
            function getModelName(model) {
                if (model.get("name")) return model.get("name").toLowerCase();
            }
            var that = this;
            _.extend(this, _.pick(options, "rename", "selectedModel", "collection", "getValue", "isBasic", "saveObj", "isRelationship")), 
            this.model = new VSearch(), this.saveSearchCollection = new VSearchList(), this.saveSearchCollection.url = UrlLinks.saveSearchApiUrl(), 
            this.saveSearchCollection.fullCollection.comparator = function(model) {
                return getModelName(model);
            };
            var title = this.isBasic ? " Basic" : " Advanced";
            this.isRelationship && (title = " Relationship"), this.saveObj ? this.onCreateButton() : (this.modal = modal = new Modal({
                titleHtml: !0,
                title: "<span>" + (this.selectedModel && this.rename ? "Rename" : "Save") + title + " Custom Filter</span>",
                content: this,
                cancelText: "Cancel",
                okCloses: !1,
                okText: this.selectedModel ? "Update" : "Save",
                allowCancel: !0
            }), this.modal.open(), modal.$el.find("button.ok").attr("disabled", "true"), modal.on("ok", function() {
                modal.$el.find("button.ok").attr("disabled", "true"), that.onCreateButton();
            }), modal.on("closeModal", function() {
                modal.trigger("cancel");
            }));
        },
        hideLoader: function() {
            this.$el.find("form").removeClass("hide"), this.$el.find(".fontLoader").removeClass("show");
        },
        onRender: function() {
            if (1 == this.rename) this.hideLoader(); else {
                var that = this;
                this.saveSearchCollection.fetch({
                    success: function(collection, data) {
                        that.isRelationship ? that.saveSearchCollection.fullCollection.reset(_.where(data, {
                            searchType: "BASIC_RELATIONSHIP"
                        })) : that.saveSearchCollection.fullCollection.reset(_.where(data, {
                            searchType: that.isBasic ? "BASIC" : "ADVANCED"
                        }));
                        var options = "";
                        that.saveSearchCollection.fullCollection.each(function(model) {
                            options += '<option value="' + model.get("name") + '">' + model.get("name") + "</option>";
                        }), that.ui.saveAsName.append(options), that.ui.saveAsName.val(""), that.ui.saveAsName.select2({
                            placeholder: "Enter filter name ",
                            allowClear: !1,
                            tags: !0,
                            multiple: !1,
                            templateResult: function(state) {
                                return state.id ? state.element ? $("<span><span class='option-title-light'>Update:</span> <strong>" + _.escape(state.text) + "</strong></span>") : $("<span><span class='option-title-light'>New:</span> <strong>" + _.escape(state.text) + "</strong></span>") : state.text;
                            }
                        }).on("change", function() {
                            var val = that.ui.saveAsName.val();
                            val.length ? (that.selectedModel = that.saveSearchCollection.fullCollection.find({
                                name: val
                            }), that.selectedModel ? that.modal.$el.find("button.ok").text("Save As") : that.modal.$el.find("button.ok").text("Save"), 
                            that.modal.$el.find("button.ok").removeAttr("disabled")) : (that.modal.$el.find("button.ok").attr("disabled", "true"), 
                            that.selectedModel = null);
                        });
                    },
                    silent: !0
                }), this.hideLoader();
            }
        },
        onCreateButton: function() {
            var that = this, obj = {
                name: this.ui.saveAsName.val() || null,
                value: this.getValue()
            };
            this.saveObj && _.extend(obj, this.saveObj);
            var saveObj = CommonViewFunction.generateObjectForSaveSearchApi(obj);
            if (this.selectedModel) {
                var selectedModel = this.selectedModel.toJSON();
                this.rename !== !0 && _.extend(selectedModel.searchParameters, saveObj.searchParameters), 
                selectedModel.name = obj.name, saveObj = selectedModel;
            } else this.isBasic ? saveObj.searchType = "BASIC" : this.isRelationship ? saveObj.searchType = "BASIC_RELATIONSHIP" : saveObj.searchType = "ADVANCED";
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
                    that.callback && that.callback();
                }
            }), this.modal && this.modal.trigger("cancel");
        }
    });
    return SaveModalLayoutView;
});