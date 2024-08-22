define([ "require", "collection/BaseCollection", "models/VRelationshipSearch", "utils/UrlLinks" ], function(require, BaseCollection, VRelationshipSearch, UrlLinks) {
    "use strict";
    var VRelationshipSearchList = BaseCollection.extend({
        url: UrlLinks.baseURL,
        model: VRelationshipSearch,
        initialize: function() {
            this.modelName = "VRelationshipSearch", this.modelAttrName = "results";
        },
        getRelationship: function(id, options) {
            var url = UrlLinks.relationshipApiUrl(id);
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "GET", options);
        }
    }, {
        tableCols: {}
    });
    return VRelationshipSearchList;
});