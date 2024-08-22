define([ "require", "backbone", "hbs!tmpl/tag/AddTagAttributeView_tmpl", "views/tag/TagAttributeItemView", "utils/UrlLinks", "collection/VTagList" ], function(require, Backbone, AddTagAttributeView_tmpl, TagAttributeItemView, UrlLinks, VTagList) {
    "use strict";
    return Backbone.Marionette.CompositeView.extend({
        template: AddTagAttributeView_tmpl,
        templateHelpers: function() {
            return {
                create: this.create,
                description: this.description
            };
        },
        childView: TagAttributeItemView,
        childViewContainer: "[data-id='addAttributeDiv']",
        childViewOptions: function() {
            return {
                parentView: this
            };
        },
        ui: {
            close: "[data-id='close']",
            attributeId: "[data-id='attributeId']",
            attributeData: "[data-id='attributeData']",
            addAttributeDiv: "[data-id='addAttributeDiv']"
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.attributeData] = "onClickAddAttriBtn", events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "enumDefCollection")), this.collection = new Backbone.Collection(), 
            this.collectionAttribute();
        },
        onRender: function() {
            var that = this;
            this.ui.addAttributeDiv.find(".closeInput").hide(), "placeholder" in HTMLInputElement.prototype || this.ui.addAttributeDiv.find("input,textarea").placeholder(), 
            that.$(".hide").removeClass("hide"), this.ui.addAttributeDiv.find(".toggleDuplicates").addClass("hide");
        },
        bindEvents: function() {},
        collectionAttribute: function() {
            this.collection.add(new Backbone.Model({
                name: "",
                typeName: "string",
                isOptional: !0,
                cardinality: "SINGLE",
                valuesMinCount: 0,
                valuesMaxCount: 1,
                isUnique: !1,
                isIndexable: !0
            }));
        },
        onClickAddAttriBtn: function() {
            this.ui.addAttributeDiv.find("input").length > 0 && this.ui.addAttributeDiv.find(".closeInput").show(), 
            this.collectionAttribute(), "placeholder" in HTMLInputElement.prototype || this.ui.addAttributeDiv.find("input,textarea").placeholder();
        }
    });
});