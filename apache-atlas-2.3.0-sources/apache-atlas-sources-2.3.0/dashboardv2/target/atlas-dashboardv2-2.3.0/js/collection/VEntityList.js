define([ "require", "utils/Globals", "collection/BaseCollection", "models/VEntity", "utils/UrlLinks" ], function(require, Globals, BaseCollection, VEntity, UrlLinks) {
    "use strict";
    var VEntityList = BaseCollection.extend({
        url: UrlLinks.entitiesApiUrl(),
        model: VEntity,
        initialize: function() {
            this.modelName = "VEntity", this.modelAttrName = "entityDefs";
        },
        parseRecords: function(resp, options) {
            try {
                if (resp.entity && resp.referredEntities) {
                    var obj = {
                        entity: resp.entity,
                        referredEntities: resp.referredEntities
                    };
                    return obj;
                }
                return resp[this.modelAttrName] ? resp[this.modelAttrName] : resp;
            } catch (e) {
                console.log(e);
            }
        },
        getAdminData: function(options) {
            var url = UrlLinks.adminApiUrl();
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), this.constructor.nonCrudOperation.call(this, url, "POST", options);
        }
    }, {
        tableCols: {}
    });
    return VEntityList;
});