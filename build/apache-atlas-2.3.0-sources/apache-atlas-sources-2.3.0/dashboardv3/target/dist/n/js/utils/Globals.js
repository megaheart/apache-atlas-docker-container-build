define([ "require", "underscore" ], function(require, _) {
    "use strict";
    var Globals = {};
    return window._ = _, Globals.settings = {}, Globals.settings.PAGE_SIZE = 25, Globals.saveApplicationState = {
        mainPageState: {},
        tabState: {
            stateChanged: !1,
            tagUrl: "#!/tag",
            searchUrl: "#!/search",
            glossaryUrl: "#!/glossary",
            administratorUrl: "#!/administrator",
            debugMetricsUrl: "#!/debugMetrics",
            relationUrl: "#!/relationSearch"
        },
        detailPageState: {}
    }, Globals.userLogedIn = {
        status: !1,
        response: {}
    }, Globals.serviceTypeMap = {}, Globals.entityImgPath = "/img/entity-icon/", Globals.DEFAULT_UI = "v2", 
    Globals.dateTimeFormat = "MM/DD/YYYY hh:mm:ss A", Globals.dateFormat = "MM/DD/YYYY", 
    Globals.isTimezoneFormatEnabled = !0, Globals.isDebugMetricsEnabled = !1, Globals.isTasksEnabled = !1, 
    Globals.advanceSearchData = {}, Globals.idealTimeoutSeconds = 900, Globals.isFullScreenView = !1, 
    Globals.isLineageOnDemandEnabled = !1, Globals.lineageNodeCount = 3, Globals.lineageDepth = 3, 
    Globals.fromRelationshipSearch = !1, Globals;
});