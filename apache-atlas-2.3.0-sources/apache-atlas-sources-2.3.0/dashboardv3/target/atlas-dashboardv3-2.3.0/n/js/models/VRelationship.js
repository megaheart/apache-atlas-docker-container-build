define([ "require", "utils/Globals", "models/BaseModel", "utils/UrlLinks" ], function(require, Globals, VBaseModel, UrlLinks) {
    "use strict";
    var VRelationship = VBaseModel.extend({
        urlRoot: UrlLinks.relationshipApiUrl(),
        defaults: {},
        serverSchema: {},
        idAttribute: "id",
        initialize: function() {
            this.modelName = "VRelationship";
        },
        toString: function() {
            return this.get("name");
        },
        getRelationship: function(token, options) {
            var url = UrlLinks.relationshipApiUrl(token);
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "GET", options);
        },
        saveRelationship: function(options) {
            var url = UrlLinks.relationshipApiUrl();
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "PUT", options);
        }
    }, {});
    return VRelationship;
});