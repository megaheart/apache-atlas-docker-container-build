define([ "require", "backbone", "hbs!tmpl/entity/EntityLabelDefineView_tmpl", "models/VEntity", "utils/Utils", "utils/Messages", "utils/Enums", "utils/UrlLinks", "utils/CommonViewFunction" ], function(require, Backbone, EntityLabelDefineView_tmpl, VEntity, Utils, Messages, Enums, UrlLinks, CommonViewFunction) {
    "use strict";
    return Backbone.Marionette.LayoutView.extend({
        _viewName: "REntityLabelDefineView",
        template: EntityLabelDefineView_tmpl,
        templateHelpers: function() {
            return {
                swapItem: this.swapItem,
                labels: this.labels,
                saveLabels: this.saveLabels,
                readOnlyEntity: this.readOnlyEntity,
                div_1: this.dynamicId_1,
                div_2: this.dynamicId_2
            };
        },
        ui: {
            addLabelOptions: "[data-id='addLabelOptions']",
            addLabels: "[data-id='addLabels']",
            saveLabels: "[data-id='saveLabels']",
            cancel: "[data-id='cancel']",
            labelsHeader: ".labelsPanel .panel-heading"
        },
        events: function() {
            var events = {};
            return events["change " + this.ui.addLabelOptions] = "onChangeLabelChange", events["click " + this.ui.addLabels] = "handleBtnClick", 
            events["click " + this.ui.saveLabels] = "saveUserDefinedLabels", events["click " + this.ui.cancel] = "onCancelClick", 
            events["click " + this.ui.labelsHeader] = "onHeaderClick", events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "entity", "customFilter", "renderAuditTableLayoutView")), 
            this.swapItem = !1, this.saveLabels = !1, this.readOnlyEntity = void 0 === this.customFilter ? Enums.entityStateReadOnly[this.entity.status] : this.customFilter, 
            this.entityModel = new VEntity(this.entity), this.labels = this.entity.labels || [], 
            this.dynamicId_1 = CommonViewFunction.getRandomIdAndAnchor(), this.dynamicId_2 = CommonViewFunction.getRandomIdAndAnchor();
        },
        onRender: function() {
            this.populateLabelOptions();
        },
        bindEvents: function() {},
        onHeaderClick: function() {
            var that = this;
            $(".labelsPanel").on("hidden.bs.collapse", function() {
                that.labels = that.entityModel.get("labels") || [], that.swapItem = !1, that.saveLabels = !1, 
                that.render(), that.labels.length > 0 && ($(".labelsPanel").find(that.ui.labelsHeader.attr("href")).removeClass("in"), 
                that.ui.labelsHeader.addClass("collapsed").attr("aria-expanded", !1));
            });
        },
        populateLabelOptions: function() {
            var str = this.labels.map(function(label) {
                return "<option selected > " + _.escape(label) + " </option>";
            });
            this.ui.addLabelOptions.html(str);
            var getLabelData = function(data, selectedData) {
                if (data.suggestions.length) return _.map(data.suggestions, function(name, index) {
                    var findValue = _.find(selectedData, {
                        id: name
                    });
                    return findValue ? findValue : {
                        id: name,
                        text: name
                    };
                });
                var findValue = _.find(selectedData, {
                    id: data.prefixString
                });
                return findValue ? [ findValue ] : [];
            };
            this.ui.addLabelOptions.select2({
                placeholder: "Select Label",
                allowClear: !1,
                tags: !0,
                multiple: !0,
                ajax: {
                    url: UrlLinks.searchApiUrl("suggestions"),
                    dataType: "json",
                    delay: 250,
                    data: function(params) {
                        return {
                            prefixString: params.term,
                            fieldName: "__labels"
                        };
                    },
                    processResults: function(data, params) {
                        return {
                            results: getLabelData(data, this.$element.select2("data"))
                        };
                    },
                    cache: !0
                },
                createTag: function(data) {
                    var found = _.find(this.$element.select2("data"), {
                        id: data.term
                    });
                    if (!found) return {
                        id: data.term,
                        text: data.term
                    };
                },
                templateResult: this.formatResultSearch
            });
        },
        formatResultSearch: function(state) {
            return state.id ? state.element || "" === state.text.trim() ? void 0 : $("<span>Add<strong> '" + _.escape(state.text) + "'</strong></span>") : state.text;
        },
        onChangeLabelChange: function() {
            this.labels = this.ui.addLabelOptions.val();
        },
        handleBtnClick: function() {
            this.swapItem = !this.swapItem, void 0 === this.customFilter ? this.saveLabels = this.swapItem === !0 : this.saveLabels = !1, 
            this.render();
        },
        onCancelClick: function() {
            this.labels = this.entityModel.get("labels") || [], this.swapItem = !1, this.saveLabels = !1, 
            this.render();
        },
        saveUserDefinedLabels: function() {
            var that = this, entityJson = that.entityModel.toJSON();
            if (entityJson.labels && 0 !== entityJson.labels.length || 0 !== this.labels.length) {
                var payload = this.labels;
                that.entityModel.saveEntityLabels(entityJson.guid, {
                    data: JSON.stringify(payload),
                    type: "POST",
                    success: function() {
                        var msg = void 0 === entityJson.labels ? "addSuccessMessage" : "editSuccessMessage", caption = "One or more label";
                        0 === payload.length ? (msg = "removeSuccessMessage", caption = "One or more existing label", 
                        that.entityModel.unset("labels")) : that.entityModel.set("labels", payload), Utils.notifySuccess({
                            content: caption + Messages.getAbbreviationMsg(!0, msg)
                        }), that.swapItem = !1, that.saveLabels = !1, that.render(), that.renderAuditTableLayoutView && that.renderAuditTableLayoutView();
                    },
                    error: function(e) {
                        that.ui.saveLabels.attr("disabled", !1), Utils.notifySuccess({
                            content: e.message
                        });
                    },
                    complete: function() {
                        that.ui.saveLabels.attr("disabled", !1), that.render();
                    }
                });
            }
        }
    });
});