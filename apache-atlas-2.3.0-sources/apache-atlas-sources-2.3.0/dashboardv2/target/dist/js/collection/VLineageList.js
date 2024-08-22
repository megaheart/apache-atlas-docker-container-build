define([ "require", "utils/Globals", "collection/BaseCollection", "models/VLineage", "utils/UrlLinks" ], function(require, Globals, BaseCollection, VLineage, UrlLinks) {
    "use strict";
    var VLineageList = BaseCollection.extend({
        url: UrlLinks.baseURL,
        model: VLineage,
        initialize: function() {
            this.modelName = "VLineage", this.modelAttrName = "results";
        },
        getLineage: function(id, options) {
            var url = UrlLinks.lineageApiUrl(id);
            return options = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options), options.compactLineageEnabled ? this.constructor.nonCrudOperation.call(this, url, "POST", options) : this.constructor.nonCrudOperation.call(this, url, "GET", options);
        }
    }, {
        tableCols: {}
    });
    return VLineageList;
});