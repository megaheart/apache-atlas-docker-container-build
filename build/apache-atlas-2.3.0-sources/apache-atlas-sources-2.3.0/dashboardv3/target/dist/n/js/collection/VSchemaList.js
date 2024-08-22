define([ "require", "utils/Globals", "collection/BaseCollection", "models/VSchema", "utils/UrlLinks" ], function(require, Globals, BaseCollection, VSchema, UrlLinks) {
    "use strict";
    var VSchemaList = BaseCollection.extend({
        url: UrlLinks.baseURL,
        model: VSchema,
        initialize: function() {
            this.modelName = "VSchema", this.modelAttrName = "results";
        },
        parseRecords: function(resp, options) {
            try {
                if (!this.modelAttrName) throw new Error("this.modelAttrName not defined for " + this);
                this.keyList = resp[this.modelAttrName].dataType.attributeDefinitions, resp[this.modelAttrName].dataType.superTypes && resp[this.modelAttrName].dataType.superTypes.indexOf("Asset") != -1 && this.keyList.push({
                    name: "name",
                    dataTypeName: "string",
                    isComposite: !1,
                    isIndexable: !0,
                    isUnique: !1,
                    multiplicity: {},
                    reverseAttributeName: null
                });
                var arr = [];
                return resp[this.modelAttrName].rows.forEach(function(d) {
                    arr.push(d);
                }), arr;
            } catch (e) {
                console.log(e);
            }
        }
    }, {
        tableCols: {}
    });
    return VSchemaList;
});