define([ "require", "utils/Utils", "backbone", "utils/CommonViewFunction" ], function(require, Utils, Backbone, CommonViewFunction) {
    "use strict";
    var BaseModel = Backbone.Model.extend({
        initialize: function() {},
        toString: function() {
            throw new Error("ERROR: toString() not defined for " + this.modelName);
        },
        silent_set: function(attrs) {
            return this.set(attrs, {
                silent: !0
            });
        }
    }, {
        nonCrudOperation: function(url, requestMethod, options) {
            return options.beforeSend = CommonViewFunction.addRestCsrfCustomHeader, options.data && "object" == typeof options.data && (options.data = JSON.stringify(options.data)), 
            Backbone.sync.call(this, null, this, _.extend({
                url: url,
                type: requestMethod
            }, options));
        }
    });
    return BaseModel;
});