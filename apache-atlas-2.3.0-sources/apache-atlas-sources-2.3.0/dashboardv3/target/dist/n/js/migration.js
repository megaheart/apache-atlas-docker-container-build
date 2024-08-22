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
    waitSeconds: 30,
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
}), require([ "marionette", "utils/Helper", "bootstrap", "select2" ], function(Marionette, Helper) {
    var App = new Marionette.Application();
    App.addRegions({
        rContent: ".page-wrapper"
    }), App.addInitializer(function() {
        Backbone.history.start();
    });
    var Router = Backbone.Router.extend({
        routes: {
            "": "defaultAction",
            "*actions": "defaultAction"
        },
        initialize: function(options) {},
        showRegions: function() {},
        execute: function(callback, args) {
            this.preRouteExecute(), callback && callback.apply(this, args), this.postRouteExecute();
        },
        preRouteExecute: function() {},
        postRouteExecute: function(name, args) {},
        defaultAction: function() {
            require([ "views/migration/MigrationView" ], function(MigrationView) {
                App.rContent.show(new MigrationView());
            });
        }
    });
    App.appRouter = new Router({
        entityDefCollection: this.entityDefCollection
    }), App.start();
});