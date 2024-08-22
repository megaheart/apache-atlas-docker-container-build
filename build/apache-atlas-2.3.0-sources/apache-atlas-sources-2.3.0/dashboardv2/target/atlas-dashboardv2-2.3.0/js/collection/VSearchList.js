define([ "require", "utils/Globals", "collection/BaseCollection", "models/VSearch", "utils/UrlLinks" ], function(require, Globals, BaseCollection, VSearch, UrlLinks) {
    "use strict";
    var VSearchList = BaseCollection.extend({
        url: UrlLinks.searchApiUrl(),
        model: VSearch,
        initialize: function(options) {
            _.extend(this, options), this.modelName = "VSearchList", this.modelAttrName = "";
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
        getExpimpAudit: function(params, options) {
            var url = UrlLinks.expimpAudit(params);
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "GET", options);
        },
        getBasicRearchResult: function(options) {
            var url = UrlLinks.searchApiUrl("basic");
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), options.data = JSON.stringify(options.data), this.constructor.nonCrudOperation.call(this, url, "POST", options);
        }
    }, {
        tableCols: {}
    });
    return VSearchList;
});