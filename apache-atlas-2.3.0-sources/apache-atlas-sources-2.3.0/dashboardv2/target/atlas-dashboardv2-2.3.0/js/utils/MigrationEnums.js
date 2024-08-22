define([ "require" ], function(require) {
    "use strict";
    var Enums = {};
    return Enums.migrationStatus = {
        STARTED: "STARTED",
        IN_PROGRESS: "IN_PROGRESS",
        FAIL: "FAIL",
        DONE: "DONE"
    }, Enums;
});