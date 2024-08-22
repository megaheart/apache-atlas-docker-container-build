define([ "require", "utils/Globals", "models/BaseModel", "utils/UrlLinks" ], function(require, Globals, VBaseModel, UrlLinks) {
    "use strict";
    var VSchema = VBaseModel.extend({
        urlRoot: UrlLinks.baseURL,
        defaults: {},
        serverSchema: {},
        idAttribute: "id",
        initialize: function() {
            this.modelName = "VSchema";
        },
        toString: function() {
            return this.get("id");
        }
    }, {});
    return VSchema;
});