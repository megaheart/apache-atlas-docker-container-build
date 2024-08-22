define([ "require", "backbone", "hbs!tmpl/search/save/SaveSearchItemView_tmpl", "utils/UrlLinks", "utils/Utils", "utils/CommonViewFunction", "utils/Messages" ], function(require, Backbone, SaveSearchItemViewTmpl, UrlLinks, Utils, CommonViewFunction, Messages) {
    "use strict";
    return Backbone.Marionette.ItemView.extend({
        template: SaveSearchItemViewTmpl,
        tagName: "li",
        className: "parent-node",
        ui: {
            stateChange: ".item",
            tools: ".tools"
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.stateChange] = "stateChange", events["click " + this.ui.tools] = function(e) {
                e.stopPropagation();
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "collection", "typeHeaders", "applyValue", "fetchFavioriteCollection", "isBasic", "classificationDefCollection", "entityDefCollection", "searchTypeObj")), 
            this.model.id = this.model.get("guid"), this.model.idAttribute = "guid";
        },
        onRender: function() {
            this.showToolTip();
        },
        stateChange: function() {
            this.applyValue(this.model, this.searchTypeObj), this.trigger("item:clicked"), this.ui.stateChange.parent("li").addClass("active").siblings().removeClass("active");
        },
        modelEvents: {
            change: "render"
        },
        showToolTip: function(e) {
            var that = this;
            Utils.generatePopover({
                el: this.$(".saveSearchPopover"),
                viewFixedPopover: !0,
                popoverOptions: {
                    content: function() {
                        return "<ul class='saveSearchPopoverList_" + (that.isBasic ? "isBasic" : "isAdvance") + "' data-id=" + that.model.id + "><li class='listTerm' ><i class='fa fa-search'></i> <a href='javascript:void(0)' data-fn='onSearch'>Search </a></li><li class='listTerm' ><i class='fa fa-pencil'></i> <a href='javascript:void(0)' data-fn='onRename'>Rename</a></li><li class='listTerm' ><i class='fa fa-trash-o'></i> <a href='javascript:void(0)' data-fn='onDelete'>Delete</a></li></ul>";
                    }
                }
            });
        }
    });
});