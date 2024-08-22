define([ "require", "backbone", "modules/Modal", "utils/Utils", "hbs!tmpl/search/SearchQuery_tmpl", "utils/Globals", "utils/Enums" ], function(require, Backbone, Modal, Utils, SearchQuery_Tmpl, Globals, Enums) {
    var SearchQueryView = Backbone.Marionette.LayoutView.extend({
        _viewName: "SearchQueryView",
        template: SearchQuery_Tmpl,
        regions: {
            RQueryBuilder: "#r_queryBuilder"
        },
        ui: {},
        events: function() {
            var events = {};
            return events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "value", "entityDefCollection", "typeHeaders", "searchVent", "enumDefCollection", "classificationDefCollection", "businessMetadataDefCollection", "tag", "searchTableFilters", "relationshipDefCollection", "relationship")), 
            this.bindEvents();
            var that = this;
            this.modal = new Modal({
                title: "Attribute Filter",
                content: this,
                allowCancel: !0,
                mainClass: "modal-lg",
                okCloses: !1,
                buttons: [ {
                    text: "Cancel",
                    btnClass: "cancel btn-action",
                    title: "Cancel"
                }, {
                    text: "Apply",
                    btnClass: "ok btn-atlas",
                    title: "Apply the filters and close popup (won't perform search)"
                }, {
                    text: "Search",
                    btnClass: "ok search btn-atlas",
                    title: "Apply the filters and do search"
                } ]
            }).open(), this.modal.on("closeModal", function() {
                that.modal.trigger("cancel");
            });
        },
        onRender: function() {
            var obj = {
                value: this.value,
                searchVent: this.searchVent,
                entityDefCollection: this.entityDefCollection,
                enumDefCollection: this.enumDefCollection,
                classificationDefCollection: this.classificationDefCollection,
                businessMetadataDefCollection: this.businessMetadataDefCollection,
                searchTableFilters: this.searchTableFilters,
                typeHeaders: this.typeHeaders
            };
            this.tag ? (obj.tag = !0, obj.attrObj = this.classificationDefCollection.fullCollection.find({
                name: this.value.tag
            }), obj.attrObj && (obj.attrObj = Utils.getNestedSuperTypeObj({
                data: obj.attrObj.toJSON(),
                collection: this.classificationDefCollection,
                attrMerge: !0
            })), (Globals[this.value.tag] || Globals[Enums.addOnClassification[0]]) && (obj.systemAttrArr = (Globals[this.value.tag] || Globals[Enums.addOnClassification[0]]).attributeDefs)) : this.relationship ? (obj.relationship = !0, 
            obj.attrObj = this.relationshipDefCollection.fullCollection.find({
                name: this.value.relationshipName
            }), obj.attrObj && (obj.attrObj = Utils.getNestedSuperTypeObj({
                data: obj.attrObj.toJSON(),
                collection: this.relationshipDefCollection,
                attrMerge: !0
            }))) : (obj.type = !0, obj.attrObj = this.entityDefCollection.fullCollection.find({
                name: this.value.type
            }), obj.attrObj && (obj.attrObj = Utils.getNestedSuperTypeObj({
                data: obj.attrObj.toJSON(),
                collection: this.entityDefCollection,
                attrMerge: !0
            })), (Globals[this.value.type] || Globals[Enums.addOnEntities[0]]) && (obj.systemAttrArr = (Globals[this.value.type] || Globals[Enums.addOnEntities[0]]).attributeDefs)), 
            this.renderQueryBuilder(obj);
        },
        bindEvents: function() {},
        renderQueryBuilder: function(obj) {
            var that = this;
            require([ "views/search/QueryBuilderView" ], function(QueryBuilderView) {
                that.RQueryBuilder.show(new QueryBuilderView(obj));
            });
        }
    });
    return SearchQueryView;
});