define([ "require", "utils/Globals", "models/BaseModel", "utils/UrlLinks" ], function(require, Globals, VBaseModel, UrlLinks) {
    "use strict";
    var VSearch = VBaseModel.extend({
        urlRoot: UrlLinks.searchApiUrl(),
        defaults: {},
        serverSchema: {},
        idAttribute: "id",
        initialize: function() {
            this.modelName = "VSearch";
        },
        toString: function() {
            return this.get("name");
        },
        getEntity: function(id, options) {
            var url = UrlLinks.entitiesApiUrl({
                guid: id
            });
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "GET", options);
        }
    }, {});
    return VSearch;
});