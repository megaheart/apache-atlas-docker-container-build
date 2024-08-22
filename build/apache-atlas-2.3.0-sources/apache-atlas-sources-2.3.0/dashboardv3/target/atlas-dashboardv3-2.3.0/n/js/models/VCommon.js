define([ "require", "utils/Globals", "models/BaseModel", "utils/UrlLinks" ], function(require, Globals, VBaseModel, UrlLinks) {
    "use strict";
    var VCommon = VBaseModel.extend({
        urlRoot: UrlLinks.baseUrl + "",
        defaults: {},
        serverSchema: {},
        idAttribute: "id",
        initialize: function() {
            this.modelName = "VCommon";
        },
        toString: function() {
            return this.get("name");
        },
        aboutUs: function(url, options) {
            var url = url;
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "GET", options);
        }
    }, {});
    return VCommon;
});