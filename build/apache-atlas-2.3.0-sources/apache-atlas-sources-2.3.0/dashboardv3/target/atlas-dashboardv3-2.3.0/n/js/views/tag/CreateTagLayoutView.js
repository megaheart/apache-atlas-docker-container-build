define([ "require", "backbone", "hbs!tmpl/tag/CreateTagLayoutView_tmpl", "utils/Utils", "views/tag/TagAttributeItemView", "collection/VTagList", "utils/UrlLinks", "platform" ], function(require, Backbone, CreateTagLayoutViewTmpl, Utils, TagAttributeItemView, VTagList, UrlLinks, platform) {
    var CreateTagLayoutView = Backbone.Marionette.CompositeView.extend({
        _viewName: "CreateTagLayoutView",
        template: CreateTagLayoutViewTmpl,
        templateHelpers: function() {
            return {
                create: this.create,
                description: this.description
            };
        },
        regions: {},
        childView: TagAttributeItemView,
        childViewContainer: "[data-id='addAttributeDiv']",
        childViewOptions: function() {
            return {
                parentView: this
            };
        },
        ui: {
            tagName: "[data-id='tagName']",
            parentTag: "[data-id='parentTagList']",
            description: "[data-id='description']",
            title: "[data-id='title']",
            attributeData: "[data-id='attributeData']",
            addAttributeDiv: "[data-id='addAttributeDiv']",
            createTagForm: '[data-id="createTagForm"]'
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.attributeData] = "onClickAddAttriBtn", events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "tagCollection", "enumDefCollection", "model", "tag", "descriptionData", "selectedTag")), 
            this.model ? this.description = this.model.get("description") : this.create = !0, 
            this.collection = new Backbone.Collection();
        },
        bindEvents: function() {},
        onRender: function() {
            var modalOkBtn, that = this;
            this.$(".fontLoader").show(), this.create ? this.tagCollectionList() : this.ui.title.html("<span>" + _.escape(this.tag) + "</span>"), 
            "placeholder" in HTMLInputElement.prototype || this.ui.createTagForm.find("input,textarea").placeholder(), 
            modalOkBtn = function() {
                var editorContent = $(that.ui.description).trumbowyg("html"), okBtn = $(".modal").find("button.ok");
                okBtn.removeAttr("disabled"), "" === editorContent && okBtn.prop("disabled", !0), 
                that.description === editorContent && okBtn.prop("disabled", !0);
            }, Utils.addCustomTextEditor({
                selector: this.ui.description,
                callback: modalOkBtn,
                small: !1
            }), $(this.ui.description).trumbowyg("html", Utils.sanitizeHtmlContent({
                data: this.description
            })), that.hideLoader();
        },
        tagCollectionList: function() {
            var that = this, str = "";
            this.ui.parentTag.empty(), this.tagCollection.fullCollection.each(function(val) {
                var name = Utils.getName(val.toJSON());
                str += "<option " + (name == that.selectedTag ? "selected" : "") + ">" + name + "</option>";
            }), that.ui.parentTag.html(str), "IE" === platform.name && that.ui.parentTag.select2({
                multiple: !0,
                placeholder: "Search Classification",
                allowClear: !0
            });
        },
        hideLoader: function() {
            this.$(".fontLoader").hide(), this.$(".hide").removeClass("hide");
        },
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
            this.collectionAttribute(), "placeholder" in HTMLInputElement.prototype || this.ui.addAttributeDiv.find("input,textarea").placeholder();
        }
    });
    return CreateTagLayoutView;
});