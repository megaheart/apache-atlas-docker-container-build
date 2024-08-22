define([ "require", "backbone", "hbs!tmpl/profile/ProfileColumnLayoutView_tmpl", "views/graph/ProfileBarChart", "collection/VProfileList", "utils/Utils", "utils/Messages", "utils/Globals", "moment", "models/VEntity", "d3" ], function(require, Backbone, ProfileColumnLayoutViewTmpl, ProfileBarChart, VProfileList, Utils, Messages, Globals, moment, VEntity, d3) {
    "use strict";
    var ProfileColumnLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "ProfileColumnLayoutView",
        template: ProfileColumnLayoutViewTmpl,
        regions: {},
        templateHelpers: function() {
            return {
                profileData: this.profileData.attributes ? this.profileData.attributes : this.profileData,
                entityDetail: this.entityDetail,
                typeObject: this.typeObject
            };
        },
        ui: {
            backToYear: '[data-id="backToYear"]'
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.backToYear] = "backToYear", events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "profileData", "guid", "entityDetail")), this.typeObject = Utils.getProfileTabType(this.profileData.attributes), 
            this.entityModel = new VEntity(), this.formatValue = d3.format(".0s");
        },
        fetchEntity: function(argument) {
            var that = this;
            this.entityModel.getEntity(this.entityDetail.table.guid, {
                success: function(data) {
                    var entity = data.entity, profileData = entity && entity.attributes && entity.attributes.profileData ? entity.attributes.profileData.attributes : null;
                    profileData && profileData.rowCount && (that.$(".rowValue").show(), that.$(".rowValue .graphval").html("<b>" + that.formatValue(profileData.rowCount).replace("G", "B") + "</b>")), 
                    entity.attributes && (entity.guid && that.$(".table_name .graphval").html('<b><a href="#!/detailPage/' + entity.guid + '?profile=true">' + Utils.getName(entity) + "</a></b>"), 
                    that.$(".table_created .graphval").html("<b>" + moment(entity.attributes.createTime).format("LL") + "</b>"));
                }
            });
        },
        bindEvents: function() {},
        onRender: function() {
            this.fetchEntity(), this.typeObject && "date" === this.typeObject.type && this.$("svg").addClass("dateType");
        },
        onShow: function() {
            this.renderGraph();
        },
        renderGraph: function(argument) {
            if (this.typeObject) {
                this.profileData.attributes;
                this.data = {
                    key: this.typeObject.label,
                    values: this.typeObject.actualObj || []
                }, this.updateGraph(this.data);
            }
        },
        backToYear: function() {
            this.ui.backToYear.hide(), this.$(".profileGraphDetail").show(), this.monthsData = null, 
            this.updateGraph(this.data);
        },
        createMonthData: function(data) {
            var monthsKey = {
                1: "Jan",
                2: "Feb",
                3: "Mar",
                4: "Apr",
                5: "May",
                6: "Jun",
                7: "Jul",
                8: "Aug",
                9: "Sep",
                10: "Oct",
                11: "Nov",
                12: "Dec"
            }, i = 1;
            for (this.monthsData = {
                key: this.typeObject.label,
                values: []
            }; i <= 12; ) this.monthsData.values.push({
                value: monthsKey[i],
                count: data[i] || 0
            }), i++;
            this.ui.backToYear.show(), this.$(".profileGraphDetail").hide(), this.updateGraph(this.monthsData);
        },
        updateGraph: function(data) {
            var that = this;
            this.$("svg").empty(), ProfileBarChart.render({
                el: this.$("svg")[0],
                data: data,
                xAxisLabel: this.typeObject.xAxisLabel,
                yAxisLabel: this.typeObject.yAxisLabel,
                formatValue: this.formatValue,
                rotateXticks: "date" !== this.typeObject.type,
                onBarClick: function(e) {
                    "date" === that.typeObject.type && (that.monthsData || that.createMonthData(e.monthlyCounts));
                }
            });
        }
    });
    return ProfileColumnLayoutView;
});