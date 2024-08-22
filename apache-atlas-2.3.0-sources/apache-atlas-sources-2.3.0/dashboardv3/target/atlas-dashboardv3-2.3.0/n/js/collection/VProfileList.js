define([ "require", "utils/Globals", "collection/BaseCollection", "models/VProfile" ], function(require, Globals, BaseCollection, VProfile) {
    "use strict";
    var VProfileList = BaseCollection.extend({
        url: Globals.baseURL + "/api/atlas/entities",
        model: VProfile,
        initialize: function() {
            this.modelName = "VProfile", this.modelAttrName = "definition", this.bindErrorEvents();
        }
    }, {
        tableCols: {}
    });
    return VProfileList;
});