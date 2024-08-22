define([ "require", "backbone", "hbs!tmpl/glossary/TermPropertiestLayoutView_tmpl", "utils/Utils", "utils/Enums" ], function(require, Backbone, TermPropertiestLayoutView_tmpl, Utils, Enums) {
    "use strict";
    var TermPropertiestLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "TermPropertiestLayoutView",
        template: TermPropertiestLayoutView_tmpl,
        regions: {},
        ui: {
            propertiesCard: "[data-id='properties-card']"
        },
        events: function() {},
        initialize: function(options) {
            _.extend(this, options);
        },
        onRender: function() {
            this.renderStats();
        },
        bindEvents: function() {},
        genrateStatusData: function(stateObject) {
            var stats = {};
            return _.each(stateObject, function(val, key) {
                var keys = key.split(":"), key = keys[0], subKey = keys[1];
                stats[key] ? stats[key][subKey] = val : (stats[key] = {}, stats[key][subKey] = val);
            }), stats;
        },
        getValue: function(options) {
            var value = options.value, type = options.type;
            return "time" == type ? Utils.millisecondsToTime(value) : "day" == type ? Utils.formatDate({
                date: value
            }) : "number" == type ? _.numberFormatWithComma(value) : "millisecond" == type ? _.numberFormatWithComma(value) + " millisecond/s" : "status-html" == type ? '<span class="connection-status ' + value + '"></span>' : value;
        },
        renderStats: function() {
            var that = this, createTable = (this.dataObject, function(obj) {
                var tableBody = "", enums = obj.enums;
                return _.each(obj.data, function(value, key, list) {
                    tableBody += "<tr><td>" + key + '</td><td class="">' + that.getValue({
                        value: value,
                        type: enums[key]
                    }) + "</td></tr>";
                }), tableBody;
            });
            that.options.additionalAttributes && that.ui.propertiesCard.html(createTable({
                enums: _.extend(Enums.stats.Server, Enums.stats.ConnectionStatus, Enums.stats.generalData),
                data: that.options.additionalAttributes
            }));
        }
    });
    return TermPropertiestLayoutView;
});