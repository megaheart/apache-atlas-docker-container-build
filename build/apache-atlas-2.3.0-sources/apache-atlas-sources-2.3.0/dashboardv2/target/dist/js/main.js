require.config({
    hbs: {
        disableI18n: !0,
        helperPathCallback: function(name) {
            return "modules/Helpers";
        },
        templateExtension: "html",
        compileOptions: {}
    },
    urlArgs: "bust=" + getBustValue(),
    deps: [ "marionette" ],
    waitSeconds: 0,
    shim: {
        backbone: {
            deps: [ "underscore", "jquery" ],
            exports: "Backbone"
        },
        "jquery-ui": {
            deps: [ "jquery" ]
        },
        asBreadcrumbs: {
            deps: [ "jquery" ],
            exports: "asBreadcrumbs"
        },
        bootstrap: {
            deps: [ "jquery" ],
            exports: "jquery"
        },
        underscore: {
            exports: "_"
        },
        marionette: {
            deps: [ "backbone" ]
        },
        backgrid: {
            deps: [ "backbone" ],
            exports: "Backgrid"
        },
        "backgrid-paginator": {
            deps: [ "backbone", "backgrid" ]
        },
        "backgrid-filter": {
            deps: [ "backbone", "backgrid" ]
        },
        "backgrid-orderable": {
            deps: [ "backbone", "backgrid" ]
        },
        "backgrid-sizeable": {
            deps: [ "backbone", "backgrid" ]
        },
        "backgrid-select-all": {
            deps: [ "backbone", "backgrid" ]
        },
        "backgrid-columnmanager": {
            deps: [ "backbone", "backgrid" ]
        },
        hbs: {
            deps: [ "underscore", "handlebars" ]
        },
        d3: {
            exports: [ "d3" ]
        },
        "d3-tip": {
            deps: [ "d3" ],
            exports: [ "d3-tip" ]
        },
        LineageHelper: {
            deps: [ "d3" ]
        },
        dagreD3: {
            deps: [ "d3" ],
            exports: [ "dagreD3" ]
        },
        sparkline: {
            deps: [ "jquery" ],
            exports: [ "sparkline" ]
        },
        pnotify: {
            exports: [ "pnotify" ]
        },
        "jquery-placeholder": {
            deps: [ "jquery" ]
        },
        "query-builder": {
            deps: [ "jquery" ]
        },
        daterangepicker: {
            deps: [ "jquery", "moment" ]
        },
        "moment-timezone": {
            deps: [ "moment" ]
        },
        moment: {
            exports: [ "moment" ]
        },
        jstree: {
            deps: [ "jquery" ]
        },
        "jquery-steps": {
            deps: [ "jquery" ]
        },
        DOMPurify: {
            exports: "DOMPurify"
        },
        trumbowyg: {
            deps: [ "jquery" ],
            exports: "trumbowyg"
        }
    },
    paths: {
        jquery: "libs/jquery/js/jquery.min",
        underscore: "libs/underscore/underscore-min",
        bootstrap: "libs/bootstrap/js/bootstrap.min",
        backbone: "libs/backbone/backbone-min",
        "backbone.babysitter": "libs/backbone.babysitter/lib/backbone.babysitter.min",
        marionette: "libs/backbone-marionette/backbone.marionette.min",
        "backbone.paginator": "libs/backbone-paginator/backbone.paginator.min",
        "backbone.wreqr": "libs/backbone-wreqr/backbone.wreqr.min",
        backgrid: "libs/backgrid/js/backgrid",
        "backgrid-filter": "libs/backgrid-filter/js/backgrid-filter.min",
        "backgrid-orderable": "libs/backgrid-orderable-columns/js/backgrid-orderable-columns",
        "backgrid-paginator": "libs/backgrid-paginator/js/backgrid-paginator.min",
        "backgrid-sizeable": "libs/backgrid-sizeable-columns/js/backgrid-sizeable-columns",
        "backgrid-columnmanager": "external_lib/backgrid-columnmanager/js/Backgrid.ColumnManager",
        asBreadcrumbs: "libs/jquery-asBreadcrumbs/js/jquery-asBreadcrumbs.min",
        d3: "libs/d3/d3.min",
        "d3-tip": "libs/d3/index",
        LineageHelper: "external_lib/atlas-lineage/dist/index",
        dagreD3: "libs/dagre-d3/dagre-d3.min",
        sparkline: "libs/sparkline/jquery.sparkline.min",
        tmpl: "templates",
        "requirejs.text": "libs/requirejs-text/text",
        handlebars: "external_lib/require-handlebars-plugin/js/handlebars",
        hbs: "external_lib/require-handlebars-plugin/js/hbs",
        i18nprecompile: "external_lib/require-handlebars-plugin/js/i18nprecompile",
        select2: "libs/select2/select2.full.min",
        "backgrid-select-all": "libs/backgrid-select-all/backgrid-select-all.min",
        moment: "libs/moment/js/moment.min",
        "moment-timezone": "libs/moment-timezone/moment-timezone-with-data.min",
        "jquery-ui": "external_lib/jquery-ui/jquery-ui.min",
        pnotify: "external_lib/pnotify/pnotify.custom.min",
        "pnotify.buttons": "external_lib/pnotify/pnotify.custom.min",
        "pnotify.confirm": "external_lib/pnotify/pnotify.custom.min",
        "jquery-placeholder": "libs/jquery-placeholder/js/jquery.placeholder",
        platform: "libs/platform/platform",
        "query-builder": "libs/jQueryQueryBuilder/js/query-builder.standalone.min",
        daterangepicker: "libs/bootstrap-daterangepicker/js/daterangepicker",
        "table-dragger": "libs/table-dragger/table-dragger",
        jstree: "libs/jstree/jstree.min",
        "jquery-steps": "libs/jquery-steps/jquery.steps.min",
        dropzone: "libs/dropzone/js/dropzone-amd-module",
        "lossless-json": "libs/lossless-json/lossless-json",
        store: "external_lib/idealTimeout/store.min",
        DOMPurify: "external_lib/dompurify/purify.min",
        trumbowyg: "external_lib/trumbowyg/trumbowyg"
    },
    enforceDefine: !1
}), require([ "App", "router/Router", "utils/Helper", "utils/CommonViewFunction", "utils/Globals", "utils/UrlLinks", "collection/VEntityList", "collection/VTagList", "collection/VRelationshipSearchList", "utils/Enums", "utils/Utils", "utils/Overrides", "bootstrap", "d3", "select2" ], function(App, Router, Helper, CommonViewFunction, Globals, UrlLinks, VEntityList, VTagList, VRelationshipSearchList, Enums, Utils) {
    var that = this;
    this.asyncFetchCounter = 5 + (Enums.addOnEntities.length + 1), this.entityDefCollection = new VEntityList(), 
    this.entityDefCollection.url = UrlLinks.entitiesDefApiUrl(), this.typeHeaders = new VTagList(), 
    this.typeHeaders.url = UrlLinks.typesApiUrl(), this.enumDefCollection = new VTagList(), 
    this.enumDefCollection.url = UrlLinks.enumDefApiUrl(), this.enumDefCollection.modelAttrName = "enumDefs", 
    this.classificationDefCollection = new VTagList(), this.metricCollection = new VTagList(), 
    this.metricCollection.url = UrlLinks.metricsApiUrl(), this.metricCollection.modelAttrName = "data", 
    this.classificationAndMetricEvent = new Backbone.Wreqr.EventAggregator(), this.businessMetadataDefCollection = new VEntityList(), 
    this.businessMetadataDefCollection.url = UrlLinks.businessMetadataDefApiUrl(), this.businessMetadataDefCollection.modelAttrName = "businessMetadataDefs", 
    this.relationshipDefCollection = new VRelationshipSearchList(), this.relationshipDefCollection.url = UrlLinks.relationshipDefApiUrl(), 
    this.relationshipDefCollection.modelAttrName = "relationshipDefs", this.relationshipEventAgg = new Backbone.Wreqr.EventAggregator(), 
    App.appRouter = new Router({
        entityDefCollection: this.entityDefCollection,
        typeHeaders: this.typeHeaders,
        enumDefCollection: this.enumDefCollection,
        classificationDefCollection: this.classificationDefCollection,
        metricCollection: this.metricCollection,
        classificationAndMetricEvent: this.classificationAndMetricEvent,
        businessMetadataDefCollection: this.businessMetadataDefCollection,
        relationshipDefCollection: this.relationshipDefCollection,
        relationshipEventAgg: this.relationshipEventAgg
    });
    var startApp = function() {
        0 === that.asyncFetchCounter && App.start();
    };
    CommonViewFunction.userDataFetch({
        url: UrlLinks.sessionApiUrl(),
        callback: function(response) {
            if (response) {
                if (response.userName && (Globals.userLogedIn.status = !0, Globals.userLogedIn.response = response), 
                void 0 !== response["atlas.entity.create.allowed"] && (Globals.entityCreate = response["atlas.entity.create.allowed"]), 
                void 0 !== response["atlas.entity.update.allowed"] && (Globals.entityUpdate = response["atlas.entity.update.allowed"]), 
                void 0 !== response["atlas.ui.editable.entity.types"]) {
                    var entityTypeList = response["atlas.ui.editable.entity.types"].trim().split(",");
                    entityTypeList.length && ("*" === entityTypeList[0] ? Globals.entityTypeConfList = [] : entityTypeList.length > 0 && (Globals.entityTypeConfList = entityTypeList));
                }
                if (void 0 !== response["atlas.ui.default.version"] && (Globals.DEFAULT_UI = response["atlas.ui.default.version"]), 
                void 0 !== response["atlas.ui.date.format"]) {
                    Globals.dateTimeFormat = response["atlas.ui.date.format"];
                    var dateFormatSeperated = Globals.dateTimeFormat.split(" ");
                    dateFormatSeperated[0] && (Globals.dateFormat = dateFormatSeperated[0]);
                }
                void 0 !== response["atlas.ui.date.timezone.format.enabled"] && (Globals.isTimezoneFormatEnabled = response["atlas.ui.date.timezone.format.enabled"]), 
                void 0 !== response["atlas.debug.metrics.enabled"] && (Globals.isDebugMetricsEnabled = response["atlas.debug.metrics.enabled"]), 
                void 0 !== response["atlas.tasks.enabled"] && (Globals.isTasksEnabled = response["atlas.tasks.enabled"]), 
                response["atlas.session.timeout.secs"] && (Globals.idealTimeoutSeconds = response["atlas.session.timeout.secs"]), 
                void 0 !== response["atlas.lineage.on.demand.enabled"] && (Globals.isLineageOnDemandEnabled = response["atlas.lineage.on.demand.enabled"]), 
                void 0 !== response["atlas.lineage.on.demand.default.node.count"] && (Globals.lineageNodeCount = response["atlas.lineage.on.demand.default.node.count"]), 
                $(document).ready(function() {
                    $(document).idleTimeout({
                        redirectUrl: Utils.getBaseUrl(window.location.pathname) + "/index.html?action=timeout",
                        idleTimeLimit: Globals.idealTimeoutSeconds,
                        activityEvents: "click keypress scroll wheel mousemove",
                        dialogDisplayLimit: 10,
                        sessionKeepAliveTimer: !1,
                        onModalKeepAlive: function() {
                            CommonViewFunction.userDataFetch({
                                url: UrlLinks.sessionApiUrl()
                            });
                        }
                    });
                });
            }
            --that.asyncFetchCounter, startApp();
        }
    }), this.entityDefCollection.fetch({
        complete: function() {
            that.entityDefCollection.fullCollection.comparator = function(model) {
                return model.get("name").toLowerCase();
            }, that.entityDefCollection.fullCollection.sort({
                silent: !0
            }), --that.asyncFetchCounter, startApp();
        }
    }), this.typeHeaders.fetch({
        async: !0,
        complete: function() {
            that.typeHeaders.fullCollection.comparator = function(model) {
                return model.get("name").toLowerCase();
            }, that.typeHeaders.fullCollection.sort({
                silent: !0
            }), --that.asyncFetchCounter, startApp();
        }
    }), this.enumDefCollection.fetch({
        complete: function() {
            that.enumDefCollection.fullCollection.comparator = function(model) {
                return model.get("name").toLowerCase();
            }, that.enumDefCollection.fullCollection.sort({
                silent: !0
            }), --that.asyncFetchCounter, startApp();
        }
    }), this.classificationDefCollection.fetch({
        async: !0,
        complete: function() {
            that.classificationDefCollection.fullCollection.comparator = function(model) {
                return model.get("name").toLowerCase();
            }, that.classificationDefCollection.fullCollection.sort({
                silent: !0
            }), that.classificationAndMetricEvent.trigger("classification:Update:ClassificationTab"), 
            that.classificationAndMetricEvent.trigger("classification:Update:Search");
        }
    }), this.metricCollection.fetch({
        async: !0,
        success: function() {
            that.classificationAndMetricEvent.trigger("metricCollection:Update");
        }
    }), this.businessMetadataDefCollection.fetch({
        complete: function() {
            that.businessMetadataDefCollection.fullCollection.comparator = function(model) {
                return model.get("name").toLowerCase();
            }, that.businessMetadataDefCollection.fullCollection.sort({
                silent: !0
            }), --that.asyncFetchCounter, startApp();
        }
    }), this.relationshipDefCollection.fetch({
        async: !0,
        complete: function() {
            that.relationshipDefCollection.fullCollection.comparator = function(model) {
                return model.get("name").toLowerCase();
            }, that.relationshipDefCollection.fullCollection.sort({
                silent: !0
            }), that.relationshipEventAgg.trigger("Relationship:Update");
        }
    }), CommonViewFunction.fetchRootEntityAttributes({
        url: UrlLinks.rootEntityDefUrl(Enums.addOnEntities[0]),
        entity: Enums.addOnEntities,
        callback: function() {
            --that.asyncFetchCounter, startApp();
        }
    }), CommonViewFunction.fetchRootClassificationAttributes({
        url: UrlLinks.rootClassificationDefUrl(Enums.addOnClassification[0]),
        classification: Enums.addOnClassification,
        callback: function() {
            --that.asyncFetchCounter, startApp();
        }
    });
});