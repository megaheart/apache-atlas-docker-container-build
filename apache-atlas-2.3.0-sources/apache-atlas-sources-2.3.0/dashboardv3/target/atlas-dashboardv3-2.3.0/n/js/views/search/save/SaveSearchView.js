define([ "require", "backbone", "hbs!tmpl/search/save/SaveSearchView_tmpl", "views/search/save/SaveSearchItemView", "collection/VSearchList", "utils/Utils", "utils/UrlLinks", "utils/CommonViewFunction", "utils/Messages" ], function(require, Backbone, SaveSearchViewTmpl, SaveSearchItemView, VSearchList, Utils, UrlLinks, CommonViewFunction, Messages) {
    "use strict";
    return Backbone.Marionette.CompositeView.extend({
        template: SaveSearchViewTmpl,
        childView: SaveSearchItemView,
        childViewContainer: "[data-id='itemViewContent']",
        ui: {
            saveAs: "[data-id='saveAsBtn']",
            save: "[data-id='saveBtn']"
        },
        childViewOptions: function() {
            return {
                collection: this.collection,
                typeHeaders: this.typeHeaders,
                applyValue: this.applyValue,
                isBasic: this.isBasic,
                classificationDefCollection: this.classificationDefCollection,
                entityDefCollection: this.entityDefCollection,
                fetchFavioriteCollection: this.fetchCollection.bind(this),
                searchTypeObj: this.searchTypeObj
            };
        },
        childEvents: function() {
            return {
                "item:clicked": function() {
                    this.ui.save.attr("disabled", !1);
                }
            };
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.saveAs] = "saveAs", events["click " + this.ui.save] = "save", 
            events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "collection", "value", "searchVent", "typeHeaders", "applyValue", "getValue", "isBasic", "fetchCollection", "classificationDefCollection", "entityDefCollection")), 
            this.searchTypeObj = {
                searchType: "dsl",
                dslChecked: "true"
            }, this.isBasic && (this.searchTypeObj.dslChecked = !1, this.searchTypeObj.searchType = "basic");
        },
        onRender: function() {
            this.bindEvents();
        },
        bindEvents: function() {
            var that = this;
            this.listenTo(this.collection, "add reset error remove", function(model, collection) {
                this.$(".fontLoader-relative").hide(), this.collection && this.collection.length ? this.$(".noFavoriteSearch").hide() : this.$(".noFavoriteSearch").show();
            }, this), $("body").on("click", ".saveSearchPopoverList_" + (this.isBasic ? "isBasic" : "isAdvance") + " li", function(e) {
                that.$(".saveSearchPopover").popover("hide");
                var id = $(this).parent("ul").data("id");
                that[$(this).find("a").data("fn")]({
                    model: that.collection.find({
                        guid: id
                    })
                });
            });
        },
        saveAs: function(e) {
            var value = this.getValue();
            value && (value.type || value.tag || value.query || value.term) ? this.callSaveModalLayoutView({
                collection: this.collection,
                getValue: this.getValue,
                isBasic: this.isBasic
            }) : Utils.notifyInfo({
                content: Messages.search.favoriteSearch.notSelectedSearchFilter
            });
        },
        save: function() {
            var that = this, obj = {}, notifyObj = {
                modal: !0,
                html: !0,
                ok: function(argument) {
                    that.callSaveModalLayoutView({
                        saveObj: obj,
                        collection: that.collection,
                        getValue: that.getValue,
                        isBasic: that.isBasic
                    });
                },
                cancel: function(argument) {}
            }, selectedEl = this.$(".saveSearchList li.active").find("div.item");
            obj.name = selectedEl.find("a").text(), obj.guid = selectedEl.data("id"), selectedEl && selectedEl.length ? (notifyObj.text = Messages.search.favoriteSearch.save + " <b>" + _.escape(obj.name) + "</b> ?", 
            Utils.notifyConfirm(notifyObj)) : Utils.notifyInfo({
                content: Messages.search.favoriteSearch.notSelectedFavoriteElement
            });
        },
        callSaveModalLayoutView: function(options) {
            require([ "views/search/save/SaveModalLayoutView" ], function(SaveModalLayoutView) {
                new SaveModalLayoutView(options);
            });
        },
        onSearch: function(options) {
            if (options && options.model) {
                var searchParameters = options.model.toJSON().searchParameters, params = CommonViewFunction.generateUrlFromSaveSearchObject({
                    value: {
                        searchParameters: searchParameters,
                        uiParameters: options.model.get("uiParameters")
                    },
                    classificationDefCollection: this.classificationDefCollection,
                    entityDefCollection: this.entityDefCollection
                });
                Utils.setUrl({
                    url: "#!/search/searchResult",
                    urlParams: _.extend({}, this.searchTypeObj, params),
                    mergeBrowserUrl: !1,
                    trigger: !0,
                    updateTabState: !0
                });
            }
        },
        onRename: function(options) {
            if (options && options.model) {
                var that = this;
                require([ "views/search/save/SaveModalLayoutView" ], function(SaveModalLayoutView) {
                    new SaveModalLayoutView({
                        selectedModel: options.model,
                        collection: that.collection,
                        getValue: that.getValue,
                        isBasic: that.isBasic
                    });
                });
            }
        },
        onDelete: function(options) {
            if (options && options.model) {
                var that = this, notifyObj = {
                    modal: !0,
                    html: !0,
                    text: Messages.conformation.deleteMessage + "<b>" + _.escape(options.model.get("name")) + "</b> ?",
                    ok: function(argument) {
                        that.onDeleteNotifyOk(options);
                    },
                    cancel: function(argument) {}
                };
                Utils.notifyConfirm(notifyObj);
            }
        },
        onDeleteNotifyOk: function(options) {
            var that = this;
            options.model.urlRoot = UrlLinks.saveSearchApiUrl(), options.model.destroy({
                wait: !0,
                success: function(model, data) {
                    that.collection && that.collection.remove(model), Utils.notifySuccess({
                        content: options.model.get("name") + Messages.getAbbreviationMsg(!1, "deleteSuccessMessage")
                    });
                }
            });
        }
    });
});