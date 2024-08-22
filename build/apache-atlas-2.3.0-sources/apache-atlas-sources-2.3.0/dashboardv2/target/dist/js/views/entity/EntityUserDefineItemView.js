define([ "require", "backbone", "hbs!tmpl/entity/EntityUserDefineItemView_tmpl" ], function(require, Backbone, EntityUserDefineItemView_tmpl) {
    "use strict";
    return Backbone.Marionette.ItemView.extend({
        _viewName: "EntityUserDefineItemView",
        template: EntityUserDefineItemView_tmpl,
        templateHelpers: function() {
            return {
                items: this.items,
                allValueRemovedUpdate: this.allValueRemovedUpdate
            };
        },
        regions: {},
        ui: {
            itemKey: "[data-type='key']",
            itemValue: "[data-type='value']",
            addItem: "[data-id='addItem']",
            deleteItem: "[data-id='deleteItem']",
            charSupportMsg: "[data-id='charSupportMsg']"
        },
        events: function() {
            var events = {};
            return events["input " + this.ui.itemKey] = "onItemKeyChange", events["input " + this.ui.itemValue] = "onItemValueChange", 
            events["click " + this.ui.addItem] = "onAddItemClick", events["click " + this.ui.deleteItem] = "onDeleteItemClick", 
            events;
        },
        initialize: function(options) {
            0 === options.items.length ? this.items = [ {
                key: "",
                value: ""
            } ] : this.items = $.extend(!0, [], options.items), this.updateParentButtonState = options.updateButtonState;
        },
        onRender: function() {},
        onAddItemClick: function(e) {
            this.allValueRemovedUpdate = !1;
            var el = e.currentTarget;
            this.items.splice(parseInt(el.dataset.index) + 1, 0, {
                key: "",
                value: ""
            }), this.render();
        },
        onDeleteItemClick: function(e) {
            var el = e.currentTarget;
            if (this.items.splice(el.dataset.index, 1), this.allValueRemovedUpdate = !1, 0 === this.items.length) {
                var updated = this.updateParentButtonState();
                updated === !1 && (this.allValueRemovedUpdate = !0, this.render());
            } else this.render();
        },
        onItemKeyChange: function(e) {
            var el = e.currentTarget;
            this.handleCharSupport(el), el.value.trim().includes(":") || (this.items[el.dataset.index].key = _.escape(el.value.trim()));
        },
        onItemValueChange: function(e) {
            var el = e.currentTarget;
            this.handleCharSupport(el), el.value.trim().includes(":") || (this.items[el.dataset.index].value = el.value.trim());
        },
        handleCharSupport: function(el) {
            el.value.trim().includes(":") ? (el.setAttribute("class", "form-control errorClass"), 
            this.ui.charSupportMsg.html("These special character '(:)' are not supported.")) : (el.setAttribute("class", "form-control"), 
            this.ui.charSupportMsg.html(""));
        }
    });
});