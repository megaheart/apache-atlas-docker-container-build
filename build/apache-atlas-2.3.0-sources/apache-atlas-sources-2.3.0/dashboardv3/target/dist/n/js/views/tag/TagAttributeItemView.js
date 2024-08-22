define([ "require", "backbone", "hbs!tmpl/tag/TagAttributeItemView_tmpl" ], function(require, Backbone, TagAttributeItemViewTmpl) {
    "use strict";
    return Backbone.Marionette.ItemView.extend({
        template: TagAttributeItemViewTmpl,
        regions: {},
        ui: {
            attributeInput: "[data-id='attributeInput']",
            close: "[data-id='close']",
            dataTypeSelector: "[data-id='dataTypeSelector']",
            toggleButton: "[data-id='toggleButton']"
        },
        events: function() {
            var events = {};
            return events["keyup " + this.ui.attributeInput] = function(e) {
                this.model.set({
                    name: e.target.value.trim()
                });
            }, events["change " + this.ui.dataTypeSelector] = function(e) {
                var typeName = e.target.value.trim(), cardinality = "SINGLE", valuesMinCount = 0, valuesMaxCount = 1, $toggleButton = $(e.currentTarget.parentElement.nextElementSibling.firstElementChild);
                0 == typeName.indexOf("array") ? ($toggleButton.removeClass("hide"), cardinality = "SET", 
                valuesMinCount = 1, valuesMaxCount = 2147483647) : $toggleButton.addClass("hide"), 
                this.model.set({
                    typeName: typeName,
                    cardinality: cardinality,
                    valuesMinCount: valuesMinCount,
                    valuesMaxCount: valuesMaxCount
                });
            }, events["click " + this.ui.toggleButton] = function(e) {
                var toggleElement = $(e.target), isList = toggleElement.hasClass("fa-toggle-off"), cardinality = isList ? "LIST" : "SET";
                isList ? (toggleElement.removeClass("fa-toggle-off").addClass("fa-toggle-on"), toggleElement.attr("data-original-title", "Make SET")) : (toggleElement.removeClass("fa-toggle-on").addClass("fa-toggle-off"), 
                toggleElement.attr("data-original-title", "Make LIST")), this.model.set({
                    cardinality: cardinality
                });
            }, events["click " + this.ui.close] = "onCloseButton", events;
        },
        initialize: function(options) {
            this.parentView = options.parentView;
        },
        onRender: function() {
            var that = this;
            this.parentView.enumDefCollection.fullCollection.each(function(model) {
                that.ui.dataTypeSelector.append("<option>" + model.get("name") + "</option>");
            });
        },
        onCloseButton: function() {
            this.parentView.$el.find('[data-id="tagName"]').val();
            this.parentView.collection.models.length > 0 && this.model.destroy(), 1 === this.parentView.$el.find("input").length && $(this.ui.close).hide();
        }
    });
});