define([ "require", "collection/BaseCollection", "models/VRelationSearch", "utils/UrlLinks" ], function(require, BaseCollection, VRelationSearch, UrlLinks) {
    "use strict";
    var VRelationshipSearchResultList = BaseCollection.extend({
        url: UrlLinks.relationshipSearchApiUrl(),
        model: VRelationSearch,
        initialize: function(options) {
            _.extend(this, options), this.modelName = "VRelationshipSearchResultList", this.modelAttrName = "", 
            this.dynamicTable = !1;
        },
        parseRecords: function(resp, options) {
            if (this.queryType = resp.queryType, this.queryText = resp.queryText, this.referredEntities = resp.referredEntities, 
            resp.attributes) {
                this.dynamicTable = !0;
                var entities = [];
                return _.each(resp.attributes.values, function(obj) {
                    var temp = {};
                    _.each(obj, function(val, index) {
                        var key = resp.attributes.name[index];
                        "__guid" == key && (key = "guid"), temp[key] = val;
                    }), entities.push(temp);
                }), entities;
            }
            return resp.entities ? (this.dynamicTable = !1, resp.entities ? resp.entities : []) : [];
        },
        getBasicRearchResult: function(options) {
            var url = UrlLinks.relationshipSearchApiUrl("basic");
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), options.data = JSON.stringify(options.data), this.constructor.nonCrudOperation.call(this, url, "POST", options);
        }
    }, {
        tableCols: {}
    });
    return VRelationshipSearchResultList;
});