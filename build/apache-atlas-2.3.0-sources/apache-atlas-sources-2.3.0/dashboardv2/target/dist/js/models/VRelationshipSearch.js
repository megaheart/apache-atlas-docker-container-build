define([ "require", "models/BaseModel", "utils/UrlLinks" ], function(require, VBaseModel, UrlLinks) {
    "use strict";
    var VRelationshipSearch = VBaseModel.extend({
        urlRoot: UrlLinks.relationshipSearchApiUrl(),
        defaults: {},
        serverSchema: {},
        idAttribute: "id",
        initialize: function() {
            this.modelName = "VRelationshipSearch";
        },
        toString: function() {
            return this.get("name");
        },
        getRelationship: function(id, options) {
            var url = UrlLinks.relationshipSearchApiUrl({
                guid: id
            });
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "GET", options);
        }
    }, {});
    return VRelationshipSearch;
});