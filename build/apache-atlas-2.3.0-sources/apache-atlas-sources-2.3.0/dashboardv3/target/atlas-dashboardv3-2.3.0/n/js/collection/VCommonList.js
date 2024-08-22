define([ "require", "utils/Globals", "collection/BaseCollection", "models/VCommon", "utils/UrlLinks" ], function(require, Globals, BaseCollection, VCommon, UrlLinks) {
    "use strict";
    var VCommonList = BaseCollection.extend({
        url: UrlLinks.baseURL + "",
        model: VCommon,
        initialize: function() {
            this.modelName = "VCommon", this.modelAttrName = "";
        }
    }, {
        tableCols: {}
    });
    return VCommonList;
});