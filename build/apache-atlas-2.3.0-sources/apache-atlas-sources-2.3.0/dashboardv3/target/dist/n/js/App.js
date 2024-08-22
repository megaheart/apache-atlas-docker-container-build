define([ "marionette" ], function(Marionette) {
    var App = new Marionette.Application();
    return App.addRegions({
        rHeader: "#header",
        rSideNav: "#sidebar-wrapper",
        rContent: "#page-wrapper"
    }), App.addInitializer(function() {
        Backbone.history.start();
    }), App;
});