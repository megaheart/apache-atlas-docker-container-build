define([ "require", "backbone", "hbs!tmpl/tag/AddTimezoneView_tmpl", "moment", "utils/Utils", "utils/Globals", "moment-timezone", "daterangepicker" ], function(require, Backbone, AddTimezoneViewTmpl, moment, Utils, Globals) {
    "use strict";
    return Backbone.Marionette.ItemView.extend({
        template: AddTimezoneViewTmpl,
        regions: {},
        ui: {
            close: "[data-id='close']",
            startTime: '[data-id="startTime"]',
            endTime: '[data-id="endTime"]',
            timeZone: '[data-id="timeZone"]'
        },
        events: function() {
            var events = {}, that = this;
            return events["change " + this.ui.startTime] = function(e) {
                this.model.set({
                    startTime: that.getDateFormat(this.ui.startTime.val())
                }), this.buttonActive({
                    isButtonActive: !0
                });
            }, events["change " + this.ui.endTime] = function(e) {
                this.model.set({
                    endTime: that.getDateFormat(this.ui.endTime.val())
                }), this.buttonActive({
                    isButtonActive: !0
                });
            }, events["change " + this.ui.timeZone] = function(e) {
                this.model.set({
                    timeZone: this.ui.timeZone.val()
                }), this.buttonActive({
                    isButtonActive: !0
                });
            }, events["click " + this.ui.close] = "onCloseButton", events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "parentView", "model", "tagModel"));
        },
        onRender: function() {
            var that = this, tzstr = '<option selected="selected" disabled="disabled">-- Select Timezone --</option>', dateConfig = {
                singleDatePicker: !0,
                showDropdowns: !0,
                timePicker: !0,
                timePicker24Hour: !(Globals.dateTimeFormat.indexOf("hh") > -1),
                timePickerSeconds: !0,
                startDate: new Date(),
                autoApply: !0,
                autoUpdateInput: !1,
                locale: {
                    format: Globals.dateTimeFormat,
                    cancelLabel: "Clear"
                }
            }, startDateObj = _.extend({}, dateConfig), endDateObj = _.extend({}, dateConfig);
            this.ui.timeZone.html(tzstr), this.ui.timeZone.select2({
                data: Globals.userLogedIn.response.timezones
            }), _.isEmpty(this.model.get("startTime")) && _.isEmpty(this.model.get("endTime")) && _.isEmpty(this.model.get("timeZone")) ? (this.model.set("startTime", that.getDateFormat(that.ui.startTime.val())), 
            this.model.set("endTime", that.getDateFormat(that.ui.endTime.val()))) : (_.isEmpty(this.model.get("startTime")) ? startDateObj.autoUpdateInput = !1 : (startDateObj.autoUpdateInput = !0, 
            startDateObj.startDate = Utils.formatDate({
                date: Date.parse(this.model.get("startTime")),
                zone: !1
            })), _.isEmpty(this.model.get("endTime")) ? (endDateObj.autoUpdateInput = !1, endDateObj.minDate = Utils.formatDate({
                date: Date.parse(this.model.get("startTime")),
                zone: !1
            })) : (endDateObj.autoUpdateInput = !0, endDateObj.minDate = Utils.formatDate({
                date: Date.parse(this.model.get("startTime")),
                zone: !1
            }), endDateObj.startDate = Utils.formatDate({
                date: Date.parse(this.model.get("endTime")),
                zone: !1
            })), _.isEmpty(this.model.get("timeZone")) || this.ui.timeZone.val(this.model.get("timeZone")).trigger("change", {
                manual: !0
            })), this.ui.startTime.daterangepicker(startDateObj).on("apply.daterangepicker", function(ev, picker) {
                that.ui.startTime.val(Utils.formatDate({
                    date: picker.startDate,
                    zone: !1
                })), _.extend(endDateObj, {
                    minDate: that.ui.startTime.val()
                }), that.endDateInitialize(endDateObj), that.model.set("startTime", that.getDateFormat(that.ui.startTime.val())), 
                that.buttonActive({
                    isButtonActive: !0
                });
            }).on("cancel.daterangepicker", function(ev, picker) {
                that.ui.startTime.val(""), delete endDateObj.minDate, that.endDateInitialize(endDateObj), 
                that.model.set("startTime", that.getDateFormat(that.ui.startTime.val()));
            }), this.endDateInitialize(endDateObj), this.buttonActive({
                isButtonActive: !0
            });
        },
        getDateFormat: function(option) {
            return option && option.length ? (Globals.dateTimeFormat.indexOf("HH") > -1 && (option = option.slice(0, -3)), 
            moment(Date.parse(option)).format("YYYY/MM/DD HH:mm:ss")) : "";
        },
        buttonActive: function(option) {
            var that = this;
            if (option && option.isButtonActive && that.tagModel) {
                var isButton = option.isButtonActive;
                this.parentView.modal.$el.find("button.ok").attr("disabled", isButton !== !0);
            }
        },
        onCloseButton: function() {
            this.tagModel && this.buttonActive({
                isButtonActive: !0
            }), this.parentView.collection.models.length > 0 && this.model.destroy(), this.parentView.collection.models.length <= 0 && (this.parentView.ui.timeZoneDiv.hide(), 
            this.parentView.ui.checkTimeZone.prop("checked", !1));
        },
        endDateInitialize: function(option) {
            var that = this;
            this.ui.endTime.daterangepicker(option).on("apply.daterangepicker", function(ev, picker) {
                that.ui.endTime.val(Utils.formatDate({
                    date: picker.startDate,
                    zone: !1
                })), that.model.set("endTime", that.getDateFormat(that.ui.endTime.val())), that.buttonActive({
                    isButtonActive: !0
                });
            }).on("cancel.daterangepicker", function(ev, picker) {
                that.ui.endTime.val(""), that.model.set("endTime", that.getDateFormat(that.ui.endTime.val()));
            });
        }
    });
});