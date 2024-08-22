define([ "require", "utils/Globals", "models/BaseModel", "utils/UrlLinks" ], function(require, Globals, VBaseModel, UrlLinks) {
    "use strict";
    var VGlossary = VBaseModel.extend({
        urlRoot: UrlLinks.glossaryApiUrl(),
        defaults: {},
        serverSchema: {},
        idAttribute: "guid",
        initialize: function() {
            this.modelName = "VGlossary";
        },
        toString: function() {
            return this.get("name");
        },
        createEditCategory: function(options) {
            var type = "POST", url = UrlLinks.categoryApiUrl();
            return options.guid && (type = "PUT", url = UrlLinks.categoryApiUrl({
                guid: options.guid
            })), options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, type, options);
        },
        createEditTerm: function(options) {
            var type = "POST", url = UrlLinks.termApiUrl();
            return options.guid && (type = "PUT", url = UrlLinks.termApiUrl({
                guid: options.guid
            })), options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, type, options);
        },
        deleteGlossary: function(guid, options) {
            var url = UrlLinks.glossaryApiUrl({
                guid: guid
            });
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "DELETE", options);
        },
        deleteCategory: function(guid, options) {
            var url = UrlLinks.categoryApiUrl({
                guid: guid
            });
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "DELETE", options);
        },
        deleteTerm: function(guid, options) {
            var url = UrlLinks.termApiUrl({
                guid: guid
            });
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "DELETE", options);
        },
        assignTermToEntity: function(guid, options) {
            var url = UrlLinks.termToEntityApiUrl(guid);
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "POST", options);
        },
        assignTermToCategory: function(options) {
            return this.createEditCategory(options);
        },
        assignCategoryToTerm: function(options) {
            return this.createEditTerm(options);
        },
        assignTermToAttributes: function(options) {
            return this.createEditTerm(options);
        },
        removeTermFromAttributes: function(options) {
            return this.createEditTerm(options);
        },
        removeTermFromEntity: function(guid, options) {
            var url = UrlLinks.termToEntityApiUrl(guid);
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "PUT", options);
        },
        removeTermFromCategory: function() {},
        removeCategoryFromTerm: function() {}
    }, {});
    return VGlossary;
});