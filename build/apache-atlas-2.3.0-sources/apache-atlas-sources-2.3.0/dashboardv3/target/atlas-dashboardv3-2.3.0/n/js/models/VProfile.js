define([ "require", "utils/Globals", "models/BaseModel" ], function(require, Globals, VBaseModel) {
    "use strict";
    var VProfile = VBaseModel.extend({
        urlRoot: Globals.baseURL,
        defaults: {},
        serverSchema: {},
        idAttribute: "id",
        initialize: function() {
            this.modelName = "VLineage", this.bindErrorEvents();
        },
        toString: function() {
            return this.get("id");
        }
    }, {});
    return VProfile;
});