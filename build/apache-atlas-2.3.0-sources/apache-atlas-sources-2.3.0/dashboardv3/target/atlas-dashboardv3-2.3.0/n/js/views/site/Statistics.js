define([ "require", "backbone", "hbs!tmpl/site/Statistics_tmpl", "hbs!tmpl/site/Statistics_Notification_table_tmpl", "hbs!tmpl/site/Statistics_Topic_Offset_table_tmpl", "hbs!tmpl/site/entity_tmpl", "modules/Modal", "models/VCommon", "utils/UrlLinks", "collection/VTagList", "utils/CommonViewFunction", "utils/Enums", "utils/MigrationEnums", "moment", "utils/Utils", "utils/Globals", "moment-timezone" ], function(require, Backbone, StatTmpl, StatsNotiTable, TopicOffsetTable, EntityTable, Modal, VCommon, UrlLinks, VTagList, CommonViewFunction, Enums, MigrationEnums, moment, Utils, Globals) {
    "use strict";
    var StatisticsView = Backbone.Marionette.LayoutView.extend({
        template: StatTmpl,
        regions: {},
        ui: {
            entity: "[data-id='entity']",
            classification: "[data-id='classification']",
            serverCard: "[data-id='server-card']",
            connectionCard: "[data-id='connection-card']",
            notificationCard: "[data-id='notification-card']",
            statsNotificationTable: "[data-id='stats-notification-table']",
            entityCard: "[data-id='entity-card']",
            classificationCard: "[data-id='classification-card']",
            offsetCard: "[data-id='offset-card']",
            osCard: "[data-id='os-card']",
            runtimeCard: "[data-id='runtime-card']",
            memoryCard: "[data-id='memory-card']",
            memoryPoolUsage: "[data-id='memory-pool-usage-card']",
            statisticsRefresh: "[data-id='statisticsRefresh']",
            notificationDetails: "[data-id='notificationDetails']",
            migrationProgressBar: "[data-id='migrationProgressBar']",
            migrationProgressBarValue: "[data-id='migrationProgressBarValue']"
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.statisticsRefresh] = function(e) {
                this.showLoader(), this.fetchMetricData(), this.fetchStatusData();
            }, events;
        },
        initialize: function(options) {
            _.extend(this, options);
            var that = this;
            if (this.DATA_MAX_LENGTH = 25, this.loaderCount = 0, this.isMigrationView) this.migrationImportStatus = new VTagList(), 
            this.migrationImportStatus.url = UrlLinks.migrationStatusApiUrl(); else {
                var modal = new Modal({
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
                });
                modal.on("closeModal", function() {
                    modal.trigger("cancel");
                }), this.modal = modal, modal.open();
            }
        },
        bindEvents: function() {
            var that = this;
            this.modal && this.$el.on("click", ".linkClicked", function() {
                that.modal.close();
            });
        },
        fetchStatusData: function() {
            var that = this;
            ++this.loaderCount, that.migrationImportStatus.fetch({
                success: function(data) {
                    var data = _.first(data.toJSON()), migrationStatus = data.MigrationStatus || null, operationStatus = migrationStatus ? migrationStatus.operationStatus : null, showProgress = !0, totalProgress = 0, progressMessage = "";
                    if (migrationStatus) {
                        if ("DONE" === MigrationEnums.migrationStatus[operationStatus]) showProgress = !1; else if ("IN_PROGRESS" === MigrationEnums.migrationStatus[operationStatus] || "STARTED" === MigrationEnums.migrationStatus[operationStatus]) {
                            migrationStatus.currentIndex || 0, migrationStatus.totalCount || 0;
                            totalProgress = Math.ceil(migrationStatus.currentIndex / migrationStatus.totalCount * 100), 
                            progressMessage = totalProgress + "%", that.ui.migrationProgressBar.removeClass("progress-bar-danger"), 
                            that.ui.migrationProgressBar.addClass("progress-bar-success");
                        } else "FAIL" === MigrationEnums.migrationStatus[operationStatus] && (totalProgress = "100", 
                        progressMessage = "Failed", that.ui.migrationProgressBar.addClass("progress-bar-danger"), 
                        that.ui.migrationProgressBar.removeClass("progress-bar-success"));
                        showProgress ? (that.$el.find(".statistics-header>.progress").removeClass("hide"), 
                        that.$el.find(".statistics-header>.successStatus").addClass("hide"), that.ui.migrationProgressBar.css({
                            width: totalProgress + "%"
                        }), that.ui.migrationProgressBarValue.text(progressMessage)) : (that.$el.find(".statistics-header>.progress").addClass("hide"), 
                        that.$el.find(".statistics-header>.successStatus").removeClass("hide"));
                    }
                },
                complete: function() {
                    --that.loaderCount, that.hideLoader();
                }
            });
        },
        fetchMetricData: function(options) {
            var that = this;
            ++this.loaderCount, this.metricCollection.fetch({
                success: function(data) {
                    var data = _.first(data.toJSON());
                    that.renderStats({
                        valueObject: data.general.stats,
                        dataObject: data.general
                    }), that.renderEntities({
                        data: data
                    }), that.renderSystemDeatils({
                        data: data
                    }), that.renderClassifications({
                        data: data
                    }), options && options.update && (that.modal && that.modal.$el.find(".header-button .fa-refresh").prop("disabled", !1).removeClass("fa-spin"), 
                    Utils.notifySuccess({
                        content: "Metric data is refreshed"
                    }));
                },
                complete: function() {
                    --that.loaderCount, that.hideLoader();
                }
            });
        },
        hideLoader: function() {
            if (0 === this.loaderCount) {
                var className = ".statsContainer";
                this.isMigrationView && (className += ",.statistics-header"), this.$(className).removeClass("hide"), 
                this.$(".statsLoader").removeClass("show");
            }
        },
        showLoader: function() {
            var className = ".statsContainer";
            this.isMigrationView && (className += ",.statistics-header"), this.$(className).addClass("hide"), 
            this.$(".statsLoader").addClass("show");
        },
        onRender: function() {
            this.bindEvents(), this.isMigrationView && (this.showLoader(), this.fetchStatusData()), 
            this.fetchMetricData();
        },
        closePanel: function(options) {
            var el = options.el;
            el.find(">.panel-heading").attr("aria-expanded", "false"), el.find(">.panel-collapse.collapse").removeClass("in");
        },
        genrateStatusData: function(stateObject) {
            var stats = {};
            return _.each(stateObject, function(val, key) {
                var keys = key.split(":"), key = keys[0], subKey = keys[1];
                stats[key] ? stats[key][subKey] = val : (stats[key] = {}, stats[key][subKey] = val);
            }), stats;
        },
        createTable: function(obj) {
            var that = this, tableBody = "", type = obj.type, data = obj.data;
            return _.each(data, function(value, key, list) {
                var newValue = that.getValue({
                    value: value
                });
                "classification" === type && (newValue = "<a title=\"Search for entities associated with '" + key + '\'" class="linkClicked" href="#!/search/searchResult?searchType=basic&tag=' + key + '">' + newValue + "<a>"), 
                tableBody += "<tr><td>" + key + '</td><td class="">' + newValue + "</td></tr>";
            }), tableBody;
        },
        renderClassifications: function(options) {
            var that = this, data = options.data, classificationData = data.tag || {}, tagEntitiesData = classificationData ? classificationData.tagEntities || {} : {}, tagsCount = 0, newTagEntitiesData = {}, tagEntitiesKeys = _.keys(tagEntitiesData);
            _.each(_.sortBy(tagEntitiesKeys, function(o) {
                return o.toLocaleLowerCase();
            }), function(key) {
                var val = tagEntitiesData[key];
                newTagEntitiesData[key] = val, tagsCount += val;
            }), tagEntitiesData = newTagEntitiesData, _.isEmpty(tagEntitiesData) || (this.ui.classificationCard.html(that.createTable({
                data: tagEntitiesData,
                type: "classification"
            })), this.ui.classification.find(".count").html("&nbsp;(" + _.numberFormatWithComma(tagsCount) + ")"), 
            tagEntitiesKeys.length > this.DATA_MAX_LENGTH && this.closePanel({
                el: this.ui.classification
            }));
        },
        renderEntities: function(options) {
            var data = options.data, entityData = data.entity, activeEntities = entityData.entityActive || {}, deletedEntities = entityData.entityDeleted || {}, shellEntities = entityData.entityShell || {}, stats = {}, activeEntityCount = 0, deletedEntityCount = 0, shellEntityCount = 0, createEntityData = function(opt) {
                var entityData = opt.entityData, type = opt.type;
                _.each(entityData, function(val, key) {
                    var intVal = _.isUndefined(val) ? 0 : val;
                    "active" == type && (activeEntityCount += intVal), "deleted" == type && (deletedEntityCount += intVal), 
                    "shell" == type && (shellEntityCount += intVal), intVal = _.numberFormatWithComma(intVal), 
                    stats[key] ? stats[key][type] = intVal : (stats[key] = {}, stats[key][type] = intVal);
                });
            };
            if (createEntityData({
                entityData: activeEntities,
                type: "active"
            }), createEntityData({
                entityData: deletedEntities,
                type: "deleted"
            }), createEntityData({
                entityData: shellEntities,
                type: "shell"
            }), !_.isEmpty(stats)) {
                var statsKeys = _.keys(stats);
                this.ui.entityCard.html(EntityTable({
                    data: _.pick(stats, _.sortBy(statsKeys, function(o) {
                        return o.toLocaleLowerCase();
                    }))
                })), this.$('[data-id="activeEntity"]').html("&nbsp;(" + _.numberFormatWithComma(activeEntityCount) + ")"), 
                this.$('[data-id="deletedEntity"]').html("&nbsp;(" + _.numberFormatWithComma(deletedEntityCount) + ")"), 
                this.$('[data-id="shellEntity"]').html("&nbsp;(" + _.numberFormatWithComma(shellEntityCount) + ")"), 
                this.ui.entity.find(".count").html("&nbsp;(" + _.numberFormatWithComma(data.general.entityCount) + ")"), 
                statsKeys.length > this.DATA_MAX_LENGTH && this.closePanel({
                    el: this.ui.entity
                });
            }
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
            if (!that.isMigrationView && data.Notification) {
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
                }));
                var offsetTableColumn = function(obj) {
                    var returnObj = [];
                    return _.each(obj, function(value, key) {
                        returnObj.push({
                            label: key,
                            dataValue: value
                        });
                    }), returnObj;
                };
                that.ui.offsetCard.html(TopicOffsetTable({
                    data: data.Notification.topicDetails,
                    tableHeader: [ "offsetStart", "offsetCurrent", "processedMessageCount", "failedMessageCount", "lastMessageProcessedTime" ],
                    tableCol: offsetTableColumn(data.Notification.topicDetails),
                    getTmplValue: function(argument, args) {
                        var returnVal = data.Notification.topicDetails[argument.label][args];
                        return returnVal ? that.getValue({
                            value: returnVal,
                            type: Enums.stats.Notification[args]
                        }) : 0;
                    }
                })), that.ui.notificationDetails.removeClass("hide");
            }
            data.Server && that.ui.serverCard.html(createTable({
                enums: _.extend(Enums.stats.Server, Enums.stats.ConnectionStatus, Enums.stats.generalData),
                data: _.extend(_.pick(data.Server, "startTimeStamp", "activeTimeStamp", "upTime", "statusBackendStore", "statusIndexStore"), _.pick(generalData, "collectionTime"))
            }));
        },
        renderSystemDeatils: function(options) {
            var that = this, data = options.data, systemData = data.system, systemOS = systemData.os || {}, systemRuntimeData = systemData.runtime || {}, systemMemoryData = systemData.memory || {};
            if (_.isEmpty(systemOS) || that.ui.osCard.html(that.createTable({
                data: systemOS
            })), _.isEmpty(systemRuntimeData) || (_.each(systemRuntimeData, function(val, key) {
            }), that.ui.runtimeCard.html(that.createTable({
                data: systemRuntimeData
            }))), !_.isEmpty(systemMemoryData)) {
                var memoryTable = CommonViewFunction.propertyTable({
                    scope: this,
                    formatStringVal: !0,
                    valueObject: systemMemoryData,
                    numberFormat: _.numberFormatWithBytes
                });
                that.ui.memoryCard.html(memoryTable);
            }
        },
        getValue: function(options) {
            var value = options.value, type = options.type;
            return "time" == type ? Utils.millisecondsToTime(value) : "day" == type ? Utils.formatDate({
                date: value
            }) : "number" == type ? _.numberFormatWithComma(value) : "millisecond" == type ? _.numberFormatWithComma(value) + " millisecond/s" : "status-html" == type ? '<span class="connection-status ' + value + '"></span>' : value;
        }
    });
    return StatisticsView;
});