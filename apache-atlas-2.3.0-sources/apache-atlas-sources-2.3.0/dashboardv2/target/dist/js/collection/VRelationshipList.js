define([ "require", "utils/Globals", "collection/BaseCollection", "models/VRelationship", "utils/UrlLinks" ], function(require, Globals, BaseCollection, VRelationship, UrlLinks) {
    "use strict";
    var VRelationshipList = BaseCollection.extend({
        url: UrlLinks.baseURL,
        model: VRelationship,
        initialize: function() {
            this.modelName = "VRelationship", this.modelAttrName = "results";
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
    return VRelationshipList;
});