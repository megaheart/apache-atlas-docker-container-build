define([ "require", "models/BaseModel", "utils/UrlLinks" ], function(require, VBaseModel, UrlLinks) {
    "use strict";
    var VRelationSearch = VBaseModel.extend({
        urlRoot: UrlLinks.relationshipSearchApiUrl(),
        defaults: {},
        serverSchema: {},
        idAttribute: "id",
        initialize: function() {
            this.modelName = "VRelationSearch";
        },
        toString: function() {
            return this.get("name");
        },
        getEntity: function(id, options) {
            var url = UrlLinks.relationApiUrl({
                guid: id
            });
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "GET", options);
        }
    }, {});
    return VRelationSearch;
});