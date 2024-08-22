define([ "require", "utils/Globals", "models/BaseModel", "utils/UrlLinks" ], function(require, Globals, vBaseModel, UrlLinks) {
    "use strict";
    var VTag = vBaseModel.extend({
        urlRoot: UrlLinks.classificationDefApiUrl(),
        defaults: {},
        serverSchema: {},
        idAttribute: "id",
        initialize: function() {
            this.modelName = "VTag";
        },
        toString: function() {
            return this.get("name");
        },
        deleteAssociation: function(guid, name, associatedGuid, options) {
            var url = UrlLinks.entitiesApiUrl({
                guid: guid,
                name: name,
                associatedGuid: associatedGuid
            });
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "DELETE", options);
        },
        deleteTag: function(options) {
            var url = UrlLinks.getDefApiUrl(null, options.typeName);
            return this.constructor.nonCrudOperation.call(this, url, "DELETE", options);
        },
        saveTagAttribute: function(options) {
            var url = UrlLinks.classificationDefApiUrl();
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "PUT", options);
        }
    }, {});
    return VTag;
});