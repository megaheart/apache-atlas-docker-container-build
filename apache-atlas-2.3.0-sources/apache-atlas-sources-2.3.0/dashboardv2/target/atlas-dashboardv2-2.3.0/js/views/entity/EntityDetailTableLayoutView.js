define([ "require", "backbone", "hbs!tmpl/entity/EntityDetailTableLayoutView_tmpl", "utils/CommonViewFunction", "models/VEntity", "utils/Utils" ], function(require, Backbone, EntityDetailTableLayoutView_tmpl, CommonViewFunction, VEntity, Utils) {
    "use strict";
    var EntityDetailTableLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "EntityDetailTableLayoutView",
        template: EntityDetailTableLayoutView_tmpl,
        templateHelpers: function() {
            return {
                editEntity: this.editEntity,
                isRelationshipDetailPage: this.isRelationshipDetailPage
            };
        },
        regions: {},
        ui: {
            detailValue: "[data-id='detailValue']",
            noValueToggle: "[data-id='noValueToggle']",
            editButton: '[data-id="editButton"]'
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.noValueToggle] = function() {
                this.showAllProperties = !this.showAllProperties, this.ui.noValueToggle.attr("data-original-title", (this.showAllProperties ? "Hide" : "Show") + " empty values"), 
                Utils.togglePropertyRelationshipTableEmptyValues({
                    inputType: this.ui.noValueToggle,
                    tableEl: this.ui.detailValue
                });
            }, events["click " + this.ui.editButton] = "onClickEditEntity", events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "entity", "typeHeaders", "attributeDefs", "attributes", "editEntity", "guid", "entityDefCollection", "searchVent", "fetchCollection", "isRelationshipDetailPage")), 
            this.entityModel = new VEntity({}), this.showAllProperties = !1;
        },
        bindEvents: function() {},
        onRender: function() {
            this.entityTableGenerate();
        },
        entityTableGenerate: function() {
            var that = this, highlightString = $(".atlas-header .global-search-container input.global-search").val(), table = CommonViewFunction.propertyTable({
                scope: this,
                valueObject: _.extend({
                    isIncomplete: this.entity.isIncomplete || !1
                }, this.entity.attributes),
                attributeDefs: this.attributeDefs,
                highlightString: highlightString
            });
            this.ui.detailValue.append(table), Utils.togglePropertyRelationshipTableEmptyValues({
                inputType: this.ui.noValueToggle,
                tableEl: this.ui.detailValue
            }), setTimeout(function() {
                that.$el.find(".searched-term-highlight").addClass("bold");
            }, 5e3);
        },
        onClickEditEntity: function(e) {
            var that = this;
            $(e.currentTarget).blur(), require([ "views/entity/CreateEntityLayoutView" ], function(CreateEntityLayoutView) {
                new CreateEntityLayoutView({
                    guid: that.guid,
                    searchVent: that.searchVent,
                    entityDefCollection: that.entityDefCollection,
                    typeHeaders: that.typeHeaders,
                    callback: function() {
                        that.fetchCollection();
                    }
                });
            });
        }
    });
    return EntityDetailTableLayoutView;
});