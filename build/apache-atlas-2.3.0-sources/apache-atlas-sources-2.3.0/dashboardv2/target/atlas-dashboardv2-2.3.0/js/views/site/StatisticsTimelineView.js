define([ "require", "backbone", "views/site/d3.v3.min", "hbs!tmpl/site/Statistics_Timeline_tmlp", "hbs!tmpl/site/Statistics_Notification_table_tmpl", "hbs!tmpl/site/Statistics_Topic_Offset_table_tmpl", "hbs!tmpl/site/entity_tmpl", "modules/Modal", "models/VCommon", "utils/UrlLinks", "collection/VTagList", "utils/CommonViewFunction", "utils/Enums", "utils/MigrationEnums", "moment", "utils/Utils", "utils/Globals", "views/site/nv.d3", "moment-timezone", "daterangepicker" ], function(require, Backbone, d3, StatTimelineTmpl, StatsNotiTable, TopicOffsetTable, EntityTable, Modal, VCommon, UrlLinks, VTagList, CommonViewFunction, Enums, MigrationEnums, moment, Utils, Globals) {
    "use strict";
    var StatisticsTimelineView = Backbone.Marionette.LayoutView.extend({
        template: StatTimelineTmpl,
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
            migrationProgressBarValue: "[data-id='migrationProgressBarValue']",
            metricsTimeLine: "[data-id='metricsTimeLine']",
            metricsTimeList: "[data-id='metricsTimeList']",
            chartTitle: "[data-id='chartTitle']",
            chartTimeLineList: "[data-id='chartTimeLineList']",
            chartButtons: ".chart-buttons",
            compareGraph: "[data-id='compareGraph']",
            entityChartCollapseHeading: "[data-id='entityChartCollapseHeading']",
            entityChartCollapse: "[data-id='entityChartCollapse']",
            entityTypeSelection: ".entity-type-chart",
            chartButton: ".chart-button"
        },
        events: function() {
            var events = {}, that = this;
            return events["click " + this.ui.statisticsRefresh] = function(e) {
                this.showLoader(), this.fetchMetricData(), this.fetchStatusData(), this.createMetricsChart();
            }, events["change " + this.ui.metricsTimeList] = function(e) {
                var that = this, selectedTime = this.ui.metricsTimeList.val(), options = {
                    isMetricsCollectionTime: !0
                };
                selectedTime.length && (that.metricTime.url = UrlLinks.metricsCollectionTimeApiUrl() + selectedTime, 
                that.showLoader(), "Current" === selectedTime ? that.fetchMetricData() : that.fetchMetricData(options), 
                that.metricsChartDateRange = "7d", that.createMetricsChart(), that.selectDefaultValueTimer());
            }, events["click " + this.ui.chartButton] = function(e) {
                e.stopPropagation(), that.$el.find(".chart-button").removeClass("active"), $(e.currentTarget).addClass("active"), 
                that.metricsChartDateRange = $(e.currentTarget).children().text(), that.createMetricsChart();
            }, events;
        },
        createMetricsChart: function() {
            var that = this, selectedDateRange = that.dateRangesMap[that.metricsChartDateRange], startTime = Date.parse(that.getValue({
                value: selectedDateRange[0],
                type: "day"
            })), endTime = Date.parse(that.getValue({
                value: selectedDateRange[1],
                type: "day"
            }));
            $(that.ui.chartTitle).text(that.entityType + " chart for " + that.dateRangeText[that.metricsChartDateRange]);
            var options = {
                startTime: startTime,
                endTime: endTime,
                typeName: that.entityType
            };
            that.showChartLoader(), that.createChartFromCollection(options);
        },
        initialize: function(options) {
            _.extend(this, options);
            var that = this;
            if (this.DATA_MAX_LENGTH = 25, this.loaderCount = 0, this.chartLoaderCount = 0, 
            this.metricCollectctionTime = new VTagList(), this.metricTime = new VTagList(), 
            this.metricCollectctionTime.url = UrlLinks.metricsAllCollectionTimeApiUrl(), this.entityTypeChartCollection = new VTagList(), 
            this.entityTypeChartCollection.url = UrlLinks.metricsGraphUrl(), this.entityType = "hive_table", 
            this.metricsChartDateRange = "7d", this.freshLoad = !0, this.dateRangesMap = {
                Today: moment(),
                "1d": [ moment().subtract(1, "days"), moment() ],
                "7d": [ moment().subtract(6, "days"), moment() ],
                "14d": [ moment().subtract(13, "days"), moment() ],
                "30d": [ moment().subtract(29, "days"), moment() ],
                "This Month": [ moment().startOf("month"), moment().endOf("month") ],
                "Last Month": [ moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month") ],
                "Last 3 Months": [ moment().subtract(3, "month").startOf("month"), moment().subtract(1, "month").endOf("month") ],
                "Last 6 Months": [ moment().subtract(6, "month").startOf("month"), moment().subtract(1, "month").endOf("month") ],
                "Last 12 Months": [ moment().subtract(12, "month").startOf("month"), moment().subtract(1, "month").endOf("month") ],
                "This Quarter": [ moment().startOf("quarter"), moment().endOf("quarter") ],
                "Last Quarter": [ moment().subtract(1, "quarter").startOf("quarter"), moment().subtract(1, "quarter").endOf("quarter") ],
                "This Year": [ moment().startOf("year"), moment().endOf("year") ],
                "Last Year": [ moment().subtract(1, "year").startOf("year"), moment().subtract(1, "year").endOf("year") ]
            }, this.dateRangeText = {
                "1d": "last 1 day",
                "7d": "last 7 days",
                "14d": "last 14 days",
                "30d": "last 30 days"
            }, this.isMigrationView) this.migrationImportStatus = new VTagList(), this.migrationImportStatus.url = UrlLinks.migrationStatusApiUrl(); else {
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
                            that.freshChart = !0, d3.selectAll("#compareGraph > svg > *").remove(), that.fetchAllMetricsData({
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
            }), this.$el.find("table").on("click", function(e) {
                var clickElement = $(e.target);
                if ($(this).hasClass("entityTable") && clickElement.parents().hasClass("entity-type-chart")) {
                    $(this).find("tr").removeClass("table-row-selected");
                    var parentRow = clickElement.parents("tr");
                    parentRow.addClass("table-row-selected"), that.entityType === parentRow.attr("id") ? that.ui.entityChartCollapse.toggleClass("in") : (that.entityType = parentRow.attr("id"), 
                    that.freshLoad = !0, that.createMetricsChart(), that.ui.entityChartCollapse.hasClass("in") || that.ui.entityChartCollapse.toggleClass("in"));
                }
            });
        },
        onRender: function() {
            this.bindEvents(), this.createChartTimeLineDropdown(), this.fetchAllMetricsData(), 
            this.createTimeLineDropdown();
        },
        fetchStatusData: function() {
            var that = this;
            ++this.loaderCount, that.migrationImportStatus.fetch({
                success: function(data) {
                    var data = _.first(data.toJSON()), migrationStatus = data.MigrationStatus || null, operationStatus = migrationStatus.operationStatus, showProgress = !0, totalProgress = 0, progressMessage = "";
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
        fetchAllMetricsData: function(options) {
            this.fetchMetricCollectionTime(), this.showLoader(), this.isMigrationView && this.fetchStatusData(), 
            this.fetchMetricData(options), this.createMetricsChart(), this.selectDefaultValueTimer();
        },
        selectDefaultValueTimer: function(options) {
            var that = this;
            this.defaultValues = setTimeout(function() {
                that.$el.find("#" + that.entityType).addClass("table-row-selected"), that.resetChartButtonSelection(), 
                that.selectDefaultValueTimerStop();
            }, 1200);
        },
        selectDefaultValueTimerStop: function() {
            clearTimeout(this.defaultValues);
        },
        resetChartButtonSelection: function() {
            var that = this;
            this.$el.find(".chart-button").removeClass("active"), _.each(this.$el.find(".chart-button"), function(chartButton) {
                chartButton.innerText === that.metricsChartDateRange && $(chartButton).addClass("active");
            });
        },
        fetchMetricCollectionTime: function() {
            var that = this;
            ++this.loaderCount, this.showLoader(), this.metricCollectctionTime.fetch({
                success: function(data) {
                    var data = data ? data.toJSON() : null;
                    data.length ? that.createTimeLineDropdown(data) : that.createTimeLineDropdown();
                },
                complete: function() {
                    --that.loaderCount, that.hideLoader();
                }
            });
        },
        fetchMetricData: function(options) {
            var that = this, collectionTofetch = options && options.isMetricsCollectionTime ? that.metricTime : that.metricCollection;
            ++this.loaderCount, collectionTofetch.fetch({
                success: function(data) {
                    var data = _.first(data.toJSON());
                    options && options.isMetricsCollectionTime && (data = data.metrics && data.metrics.data ? data.metrics.data : data), 
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
        createChartFromCollection: function(params) {
            var that = this, chartData = {};
            ++that.chartLoaderCount, console.log("startTime: " + new Date(params.startTime) + ", endTime: " + new Date(params.endTime) + " ,typeName: " + params.typeName), 
            that.entityTypeChartCollection.queryParams = params, that.entityTypeChartCollection.fetch({
                success: function(data) {
                    chartData = _.first(data.toJSON()), that.renderStackAreaGraps(chartData[that.entityType]), 
                    that.freshLoad && (that.freshLoad = !1, that.selectDefaultChartTimer(chartData[that.entityType]));
                },
                complete: function() {
                    --that.chartLoaderCount, that.hideChartLoader();
                }
            });
        },
        selectDefaultChartTimer: function(chartData) {
            var that = this;
            this.chartRenderTimer = setTimeout(function() {
                that.renderStackAreaGraps(chartData), that.selectDefaultChartTimerStop();
            }, 1500);
        },
        selectDefaultChartTimerStop: function() {
            clearTimeout(this.chartRenderTimer);
        },
        createTimeLineDropdown: function(data) {
            var that = this, options = '<option value="Current" data-name="Current" selected>Current</option>';
            that.ui.metricsTimeList.empty(), _.each(data, function(data) {
                var collectionTime = that.getValue({
                    type: "day",
                    value: data.collectionTime
                });
                options += '<option value="' + data.collectionTime + '" data-name="' + data.collectionTime + '">' + collectionTime + "</option>";
            }), that.ui.metricsTimeList.html(options);
        },
        createChartTimeLineDropdown: function() {
            var that = this, options = '<ul class="pull-right">';
            options += '<li class="chart-button"><a href="javascript:void(0);"  title="Last 1 day"  data-day="1d">1d</a></li>', 
            options += '<li class="chart-button active"><a href="javascript:void(0);"  title="Last 7 days"  data-day="7d">7d</a></li>', 
            options += '<li class="chart-button"><a href="javascript:void(0);"  title="Last 14 days"  data-day="14d">14d</a></li>', 
            options += '<li class="chart-button"><a href="javascript:void(0);"  title="Last 30 days"  data-day="30d">30d</a></li>', 
            options += "</ul>", that.ui.chartTimeLineList.empty(), that.ui.chartTimeLineList.html(options);
        },
        createTimeLineDropdownGraph: function() {
            this.defaultRange = "7d", this.dateValue = null;
            var that = this, isTimeRange = !0, obj = {
                opens: "center",
                autoApply: !0,
                autoUpdateInput: !1,
                timePickerSeconds: !0,
                timePicker: !0,
                locale: {
                    format: Globals.dateTimeFormat
                }
            };
            if (isTimeRange) {
                var defaultRangeDate = this.dateRangesMap[this.defaultRange];
                obj.startDate = defaultRangeDate[0], obj.endDate = defaultRangeDate[1], obj.singleDatePicker = !1, 
                obj.ranges = this.dateRangesMap;
            } else obj.singleDatePicker = !0, obj.startDate = moment(), obj.endDate = obj.startDate;
            var inputEl = this.ui.metricsTimeLine;
            inputEl.attr("readonly", !0), inputEl.daterangepicker(obj), inputEl.on("apply.daterangepicker", function(ev, picker) {
                picker.setStartDate(picker.startDate), picker.setEndDate(picker.endDate);
                var valueString = "";
                valueString = picker.chosenLabel ? "Custom Range" === picker.chosenLabel ? picker.startDate.format(Globals.dateTimeFormat) + " - " + picker.endDate.format(Globals.dateTimeFormat) : picker.chosenLabel : picker.startDate.format(Globals.dateTimeFormat), 
                picker.element.val(valueString), that.dateValue = valueString;
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
        hideChartLoader: function() {
            0 === this.chartLoaderCount && (this.$(".statsLoader").removeClass("show"), this.$(".modalOverlay").addClass("hide"));
        },
        showChartLoader: function() {
            this.$(".statsLoader").addClass("show"), this.$(".modalOverlay").removeClass("hide");
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
            })), _.isEmpty(systemRuntimeData) || that.ui.runtimeCard.html(that.createTable({
                data: systemRuntimeData
            })), !_.isEmpty(systemMemoryData)) {
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
        },
        renderStackAreaGraps: function(data) {
            var that = this, data = data;
            nv.addGraph(function() {
                var chart = nv.models.stackedAreaChart().margin({
                    right: 60
                }).x(function(d) {
                    return d[0];
                }).y(function(d) {
                    return d[1];
                }).useInteractiveGuideline(!0).rightAlignYAxis(!1).showControls(!0).clipEdge(!0);
                chart.xAxis.tickFormat(function(d) {
                    return d3.time.format("%x")(new Date(d));
                }), chart.yAxis.tickFormat(d3.format(",.2f"));
                var graphTimer = setTimeout(function() {
                    d3.select(that.ui.compareGraph[0]).datum(data).transition().duration(500).call(chart), 
                    clearTimeout(graphTimer);
                }, 300);
                return d3.select(window).on("mouseout", function() {
                    d3.selectAll(".nvtooltip").style("opacity", "0");
                }), nv.utils.windowResize(chart.update), chart;
            });
        }
    });
    return StatisticsTimelineView;
});