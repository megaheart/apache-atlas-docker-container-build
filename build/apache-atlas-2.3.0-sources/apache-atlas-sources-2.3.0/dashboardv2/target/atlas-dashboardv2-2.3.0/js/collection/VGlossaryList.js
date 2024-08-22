define([ "require", "utils/Globals", "collection/BaseCollection", "models/VGlossary", "utils/UrlLinks" ], function(require, Globals, BaseCollection, VGlossary, UrlLinks) {
    "use strict";
    var VGlossaryList = BaseCollection.extend({
        url: UrlLinks.glossaryApiUrl(),
        model: VGlossary,
        initialize: function() {
            this.modelName = "VGlossary", this.modelAttrName = "";
        },
        parseRecords: function(resp, options) {
            return _.isEmpty(this.modelAttrName) ? resp : resp[this.modelAttrName];
        },
        getCategory: function(options) {
            var url = UrlLinks.categoryApiUrl({
                guid: options.guid,
                related: options.related
            }), apiOptions = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options.ajaxOptions);
            return this.constructor.nonCrudOperation.call(this, url, "GET", apiOptions);
        },
        getTerm: function(options) {
            var url = UrlLinks.termApiUrl({
                guid: options.guid,
                related: options.related
            }), apiOptions = _.extend({
                contentType: "application/json",
                dataType: "json"
            }, options.ajaxOptions);
            return this.constructor.nonCrudOperation.call(this, url, "GET", apiOptions);
        }
    }, {
        tableCols: {}
    });
    return VGlossaryList;
});