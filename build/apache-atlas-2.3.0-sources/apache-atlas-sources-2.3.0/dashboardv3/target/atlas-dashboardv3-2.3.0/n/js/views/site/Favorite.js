define([ "require", "backbone", "hbs!tmpl/site/Statistics_tmpl", "hbs!tmpl/site/Statistics_Notification_table_tmpl", "hbs!tmpl/site/entity_tmpl", "modules/Modal", "models/VCommon", "utils/UrlLinks", "collection/VTagList", "utils/CommonViewFunction", "utils/Enums", "moment", "utils/Utils", "moment-timezone" ], function(require, Backbone, StatTmpl, StatsNotiTable, EntityTable, Modal, VCommon, UrlLinks, VTagList, CommonViewFunction, Enums, moment, Utils) {
    "use strict";
    Backbone.Marionette.LayoutView.extend({
        template: StatTmpl,
        regions: {
            RSaveSearchBasic: "[data-id='r_saveSearchBasic']",
            RSaveSearchAdvance: "[data-id='r_saveSearchAdvance']"
        },
        ui: {},
        events: function() {},
        initialize: function(options) {
            _.extend(this, options);
            var that = this, modal = new Modal({
                title: "Statistics",
                content: this,
                okCloses: !0,
                okText: "Close",
                showFooter: !0,
                allowCancel: !1,
                width: "60%",
                headerButtons: [ {
                    title: "Refresh Data",
                    btnClass: "fa fa-refresh",
                    onClick: function() {
                        modal.$el.find(".header-button .fa-refresh").tooltip("hide").prop("disabled", !0).addClass("fa-spin"), 
                        that.fetchMetricData({
                            update: !0
                        });
                    }
                } ]
            }).open();
            modal.on("closeModal", function() {
                modal.trigger("cancel");
            }), this.modal = modal;
        },
        bindEvents: function() {},
        fetchMetricData: function(options) {
            that.RSaveSearchBasic.show(new SaveSearchView(_.extend(obj, {
                isBasic: !0,
                collection: saveSearchBaiscCollection.fullCollection
            }))), that.RSaveSearchAdvance.show(new SaveSearchView(_.extend(obj, {
                isBasic: !1,
                collection: saveSearchAdvanceCollection.fullCollection
            })));
        },
        onRender: function() {
            this.fetchMetricData();
        },
        genrateStatusData: function(stateObject) {
            var stats = {};
            return _.each(stateObject, function(val, key) {
                var keys = key.split(":"), key = keys[0], subKey = keys[1];
                stats[key] ? stats[key][subKey] = val : (stats[key] = {}, stats[key][subKey] = val);
            }), stats;
        },
        renderEntities: function(options) {
            var that = this, data = options.data, entityData = data.entity, activeEntities = entityData.entityActive || {}, deletedEntities = entityData.entityDeleted || {}, stats = {}, activeEntityCount = 0, deletedEntityCount = 0, createEntityData = function(opt) {
                var entityData = opt.entityData, type = opt.type;
                _.each(entityData, function(val, key) {
                    var intVal = _.isUndefined(val) ? 0 : val;
                    "active" == type ? activeEntityCount += intVal : deletedEntityCount += intVal, intVal = _.numberFormatWithComma(intVal), 
                    stats[key] ? stats[key][type] = intVal : (stats[key] = {}, stats[key][type] = intVal);
                });
            };
            createEntityData({
                entityData: activeEntities,
                type: "active"
            }), createEntityData({
                entityData: deletedEntities,
                type: "deleted"
            }), _.isEmpty(stats) || (that.ui.entityCard.html(EntityTable({
                data: _.pick(stats, _.keys(stats).sort())
            })), that.$('[data-id="activeEntity"]').html("&nbsp;(" + _.numberFormatWithComma(activeEntityCount) + ")"), 
            that.$('[data-id="deletedEntity"]').html("&nbsp;(" + _.numberFormatWithComma(deletedEntityCount) + ")"), 
            that.ui.entityHeader.html("&nbsp;(" + _.numberFormatWithComma(data.general.entityCount) + ")"));
        },
        renderStats: function(options) {
            var that = this, data = this.genrateStatusData(options.valueObject), generalData = options.dataObject, createTable = function(obj) {
                var tableBody = "", enums = obj.enums, data = obj.data;
                return _.each(data, function(value, key, list) {
                    tableBody += "<tr><td>" + key + '</td><td class="">' + that.getValue({
                        value: value,
                        type: enums[key]
                    }) + "</td></tr>";
                }), tableBody;
            };
            if (data.Notification) {
                var tableCol = [ {
                    label: "Total <br> (from " + that.getValue({
                        value: data.Server.startTimeStamp,
                        type: Enums.stats.Server.startTimeStamp
                    }) + ")",
                    key: "total"
                }, {
                    label: "Current Hour <br> (from " + that.getValue({
                        value: data.Notification.currentHourStartTime,
                        type: Enums.stats.Notification.currentHourStartTime
                    }) + ")",
                    key: "currentHour"
                }, {
                    label: "Previous Hour",
                    key: "previousHour"
                }, {
                    label: "Current Day <br> (from " + that.getValue({
                        value: data.Notification.currentDayStartTime,
                        type: Enums.stats.Notification.currentDayStartTime
                    }) + ")",
                    key: "currentDay"
                }, {
                    label: "Previous Day",
                    key: "previousDay"
                } ], tableHeader = [ "count", "AvgTime", "EntityCreates", "EntityUpdates", "EntityDeletes", "Failed" ];
                that.ui.notificationCard.html(StatsNotiTable({
                    enums: Enums.stats.Notification,
                    data: data.Notification,
                    tableHeader: tableHeader,
                    tableCol: tableCol,
                    getTmplValue: function(argument, args) {
                        var pickValueFrom = argument.key.concat(args);
                        "total" == argument.key && "EntityCreates" == args ? pickValueFrom = "totalCreates" : "total" == argument.key && "EntityUpdates" == args ? pickValueFrom = "totalUpdates" : "total" == argument.key && "EntityDeletes" == args ? pickValueFrom = "totalDeletes" : "count" == args && (pickValueFrom = argument.key);
                        var returnVal = data.Notification[pickValueFrom];
                        return returnVal ? _.numberFormatWithComma(returnVal) : 0;
                    }
                })), that.ui.notificationSmallCard.html(createTable({
                    enums: Enums.stats.Notification,
                    data: _.pick(data.Notification, "lastMessageProcessedTime", "offsetCurrent", "offsetStart")
                }));
            }
            data.Server && that.ui.serverCard.html(createTable({
                enums: _.extend(Enums.stats.Server, Enums.stats.ConnectionStatus, Enums.stats.generalData),
                data: _.extend(_.pick(data.Server, "startTimeStamp", "activeTimeStamp", "upTime", "statusBackendStore", "statusIndexStore"), _.pick(generalData, "collectionTime"))
            }));
        },
        getValue: function(options) {
            var value = options.value, type = options.type;
            return "time" == type ? Utils.millisecondsToTime(value) : "day" == type ? moment.tz(value, moment.tz.guess()).format("MM/DD/YYYY h:mm A z") : "number" == type ? _.numberFormatWithComma(value) : "millisecond" == type ? _.numberFormatWithComma(value) + " millisecond/s" : "status-html" == type ? '<span class="connection-status ' + value + '"></span>' : value;
        }
    });
    return StatisticsView;
});