define([ "require", "backbone", "hbs!tmpl/glossary/AssignTermLayoutView_tmpl", "utils/Utils", "utils/Enums", "utils/Messages", "utils/UrlLinks", "modules/Modal", "jquery-steps" ], function(require, Backbone, AssignTermLayoutViewTmpl, Utils, Enums, Messages, UrlLinks, Modal) {
    var AssignTermLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "AssignTermLayoutView",
        template: AssignTermLayoutViewTmpl,
        templateHelpers: function() {
            return {
                isAttributeRelationView: this.isAttributeRelationView,
                selectedTermAttributeList: Enums.termRelationAttributeList[this.selectedTermAttribute]
            };
        },
        regions: {
            RGlossaryTree: "#r_glossaryTree"
        },
        ui: {
            wizard: '[data-id="wizard"]'
        },
        events: function() {
            var events = {};
            return events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "glossaryCollection", "guid", "callback", "hideLoader", "isCategoryView", "categoryData", "isTermView", "termData", "isAttributeRelationView", "selectedTermAttribute", "associatedTerms", "multiple"));
            var that = this;
            this.options = options, this.isCategoryView || this.isTermView || this.isAttributeRelationView || (this.isEntityView = !0), 
            this.glossary = {
                selectedItem: {}
            };
            var title = "";
            title = this.isCategoryView || this.isEntityView ? "Assign term to " + (this.isCategoryView ? "Category" : "entity") : this.isAttributeRelationView ? "Assign term to " + this.selectedTermAttribute : "Assign Category to term", 
            this.modal = new Modal({
                title: title,
                content: this,
                cancelText: "Cancel",
                okText: "Assign",
                allowCancel: !0,
                showFooter: !this.isAttributeRelationView,
                mainClass: "wizard-modal",
                okCloses: !1
            }), this.modal.open(), this.modal.$el.find("button.ok").attr("disabled", !0), this.modal.on("closeModal", function() {
                that.modal.trigger("cancel"), that.assignTermError && that.hideLoader && that.hideLoader(), 
                options.onModalClose && options.onModalClose();
            }), this.modal.on("ok", function() {
                that.assignTerm();
            }), this.bindEvents();
        },
        bindEvents: function() {
            this.listenTo(this.glossaryCollection, "node_selected", function(skip) {
                this.modal.$el.find("button.ok").attr("disabled", !1);
            }, this);
        },
        onRender: function() {
            this.renderGlossaryTree();
            var that = this;
            this.isAttributeRelationView && this.ui.wizard.steps({
                headerTag: "h3",
                bodyTag: "section",
                transitionEffect: "slideLeft",
                autoFocus: !0,
                enableCancelButton: !0,
                transitionEffect: $.fn.steps.transitionEffect.none,
                transitionEffectSpeed: 200,
                labels: {
                    cancel: "Cancel",
                    finish: "Assign",
                    next: "Next",
                    previous: "Previous",
                    loading: "Loading ..."
                },
                onStepChanging: function(event, currentIndex, newIndex) {
                    var isMatch = "GlossaryTerm" == that.glossary.selectedItem.type;
                    return isMatch || Utils.notifyWarn({
                        content: "Please select Term for association"
                    }), isMatch;
                },
                onFinished: function(event, currentIndex) {
                    var $assignBtn = $(this).find('a[href="#finish"]');
                    $assignBtn.attr("disabled") || ($assignBtn.attr("disabled", !0).showButtonLoader(), 
                    $assignBtn.parent().attr("aria-disabled", "true").addClass("disabled"), that.assignTerm());
                },
                onCanceled: function(event) {
                    that.modal.trigger("cancel");
                }
            });
        },
        assignTerm: function() {
            this.assignTermError = !1;
            var that = this, data = [], termAttributeFormData = [], selectedItem = this.glossary.selectedItem, selectedGuid = selectedItem.guid, termName = selectedItem.text, ajaxOptions = {
                success: function(rModel, response) {
                    Utils.notifySuccess({
                        content: (that.isCategoryView || that.isEntityView || that.isAttributeRelationView ? "Term" : "Category") + " is associated successfully "
                    }), that.callback && that.callback();
                },
                cust_error: function() {
                    var $assignBtn = that.$el.find('a[href="#finish"]');
                    $assignBtn.removeAttr("disabled").hideButtonLoader(), $assignBtn.parent().attr("aria-disabled", "false").removeClass("disabled"), 
                    that.assignTermError = !0;
                },
                complete: function() {
                    that.modal.trigger("closeModal");
                }
            }, model = new this.glossaryCollection.model();
            if (this.isCategoryView) data = $.extend(!0, {}, this.categoryData), data.terms ? data.terms.push({
                termGuid: selectedGuid
            }) : data.terms = [ {
                termGuid: selectedGuid
            } ], model.assignTermToCategory(_.extend(ajaxOptions, {
                data: JSON.stringify(data),
                guid: data.guid
            })); else if (this.isTermView) data = $.extend(!0, {}, this.termData), data.categories ? data.categories.push({
                categoryGuid: selectedGuid
            }) : data.categories = [ {
                categoryGuid: selectedGuid
            } ], model.assignCategoryToTerm(_.extend(ajaxOptions, {
                data: JSON.stringify(data),
                guid: data.guid
            })); else if (this.isAttributeRelationView) termAttributeFormData = this.$('[data-id="termAttributeForm"]').serializeArray().reduce(function(obj, item) {
                return obj[item.name] = item.value, obj;
            }, {}), data = $.extend(!0, {}, this.termData), data[this.selectedTermAttribute] ? data[this.selectedTermAttribute].push(_.extend({
                termGuid: selectedGuid
            }, termAttributeFormData)) : data[this.selectedTermAttribute] = [ _.extend({
                termGuid: selectedGuid
            }, termAttributeFormData) ], model.assignTermToAttributes(_.extend(ajaxOptions, {
                data: JSON.stringify(data),
                guid: data.guid
            })); else {
                var deletedEntity = [], skipEntity = [];
                if (this.multiple ? (_.each(that.multiple, function(entity, i) {
                    var name = Utils.getName(entity.model);
                    Enums.entityStateReadOnly[entity.model.status] ? deletedEntity.push(name) : _.indexOf(entity.model.meaningNames || _.pluck(entity.model.meanings, "displayText"), termName) === -1 ? data.push({
                        guid: entity.model.guid
                    }) : skipEntity.push(name);
                }), deletedEntity.length && (Utils.notifyError({
                    html: !0,
                    content: "<b>" + deletedEntity.join(", ") + "</b> " + (1 === deletedEntity.length ? "entity " : "entities ") + Messages.assignTermDeletedEntity
                }), that.modal.close())) : data.push({
                    guid: that.guid
                }), skipEntity.length) {
                    var text = "<b>" + skipEntity.length + " of " + that.multiple.length + "</b> entities selected have already been associated with <b>" + termName + "</b> term, Do you want to associate the term with other entities ?", removeCancelButton = !1;
                    skipEntity.length + deletedEntity.length === that.multiple.length && (text = (skipEntity.length > 1 ? "All selected" : "Selected") + " entities have already been associated with <b>" + termName + "</b> term", 
                    removeCancelButton = !0);
                    var notifyObj = {
                        text: text,
                        modal: !0,
                        ok: function(argument) {
                            data.length && model.assignTermToEntity(selectedGuid, _.extend(ajaxOptions, {
                                data: JSON.stringify(data)
                            }));
                        },
                        cancel: function(argument) {}
                    };
                    removeCancelButton && (notifyObj.confirm = {
                        confirm: !0,
                        buttons: [ {
                            text: "Ok",
                            addClass: "btn-atlas btn-md",
                            click: function(notice) {
                                notice.remove();
                            }
                        }, null ]
                    }), Utils.notifyConfirm(notifyObj);
                } else data.length && model.assignTermToEntity(selectedGuid, _.extend(ajaxOptions, {
                    data: JSON.stringify(data)
                }));
            }
        },
        renderGlossaryTree: function() {
            var that = this;
            require([ "views/glossary/GlossaryLayoutView" ], function(GlossaryLayoutView) {
                that.RGlossaryTree.show(new GlossaryLayoutView(_.extend({
                    isAssignTermView: that.isCategoryView,
                    isAssignCategoryView: that.isTermView,
                    isAssignEntityView: that.isEntityView,
                    isAssignAttributeRelationView: that.isAttributeRelationView,
                    glossary: that.glossary,
                    associatedTerms: that.associatedTerms
                }, that.options)));
            });
        }
    });
    return AssignTermLayoutView;
});