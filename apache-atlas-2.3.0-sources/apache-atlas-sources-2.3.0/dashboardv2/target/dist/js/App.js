define([ "marionette" ], function(Marionette) {
    var App = new Marionette.Application();
    return App.addRegions({
        rHeader: "#header",
        rSideNav: "#sideNav-wrapper",
        rNContent: "#new-page-wrapper",
        rNHeader: "#new-header",
        rContent: "#page-wrapper",
        rFooter: "#footer"
    }), App.addInitializer(function() {
        Backbone.history.start();
    }), App;
});