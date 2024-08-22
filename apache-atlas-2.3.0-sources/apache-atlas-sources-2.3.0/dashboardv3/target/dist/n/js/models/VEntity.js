define([ "require", "utils/Globals", "models/BaseModel", "utils/UrlLinks" ], function(require, Globals, VBaseModel, UrlLinks) {
    "use strict";
    var VEntity = VBaseModel.extend({
        urlRoot: UrlLinks.entitiesApiUrl(),
        defaults: {},
        serverSchema: {},
        idAttribute: "id",
        initialize: function() {
            this.modelName = "VEntity";
        },
        toString: function() {
            return this.get("name");
        },
        getEntity: function(token, options) {
            var url = UrlLinks.entitiesApiUrl({
                guid: token
            });
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "GET", options);
        },
        getEntityHeader: function(token, options) {
            var url = UrlLinks.entityHeaderApiUrl(token);
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "GET", options);
        },
        saveTraitsEntity: function(token, options) {
            var url = UrlLinks.entitiesTraitsApiUrl(token);
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "POST", options);
        },
        getEntityDef: function(name, options) {
            var url = UrlLinks.entitiesDefApiUrl(name);
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "GET", options);
        },
        createOreditEntity: function(options) {
            var url = UrlLinks.entitiesApiUrl();
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "", options);
        },
        saveEntityLabels: function(guid, options) {
            var url = UrlLinks.entityLabelsAPIUrl(guid);
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "POST", options);
        },
        saveBusinessMetadata: function(options) {
            var url = UrlLinks.businessMetadataDefApiUrl();
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "", options);
        },
        deleteBusinessMetadata: function(options) {
            var url = UrlLinks.businessMetadataDefApiUrl(options.typeName);
            return this.constructor.nonCrudOperation.call(this, url, "DELETE", options);
        },
        saveBusinessMetadataEntity: function(guid, options) {
            var url = UrlLinks.entitiesBusinessMetadataApiUrl(guid);
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "POST", options);
        }
    }, {});
    return VEntity;
});