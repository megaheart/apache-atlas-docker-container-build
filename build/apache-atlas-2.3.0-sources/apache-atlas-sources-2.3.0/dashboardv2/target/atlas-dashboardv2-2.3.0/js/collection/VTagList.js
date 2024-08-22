define([ "require", "utils/Globals", "collection/BaseCollection", "models/VTag", "utils/UrlLinks" ], function(require, Globals, BaseCollection, VTag, UrlLinks) {
    "use strict";
    var VTagList = BaseCollection.extend({
        url: UrlLinks.classificationDefApiUrl(),
        model: VTag,
        initialize: function() {
            this.modelName = "VTag", this.modelAttrName = "classificationDefs";
        },
        parseRecords: function(resp, options) {
            try {
                if (!this.modelAttrName) throw new Error("this.modelAttrName not defined for " + this);
                return resp[this.modelAttrName] ? resp[this.modelAttrName] : resp;
            } catch (e) {
                console.log(e);
            }
        }
    }, {
        tableCols: {}
    });
    return VTagList;
});