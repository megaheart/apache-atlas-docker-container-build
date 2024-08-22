define([ "require", "utils/Globals", "utils/Utils", "utils/CommonViewFunction", "backbone.paginator" ], function(require, Globals, Utils, CommonViewFunction) {
    "use strict";
    var BaseCollection = Backbone.PageableCollection.extend({
        initialize: function() {
            this.sort_key = "id";
        },
        comparator: function(key, value) {
            return key = key.get(this.sort_key), value = value.get(this.sort_key), key > value ? 1 : key < value ? -1 : 0;
        },
        sortByKey: function(sortKey) {
            this.sort_key = sortKey, this.sort();
        },
        state: {
            firstPage: 0,
            pageSize: Globals.settings.PAGE_SIZE
        },
        mode: "client",
        parseRecords: function(resp, options) {
            this.responseData = {
                dataType: resp.dataType,
                query: resp.query,
                queryType: resp.queryType,
                requestId: resp.requestId
            };
            try {
                if (!this.modelAttrName) throw new Error("this.modelAttrName not defined for " + this);
                return resp[this.modelAttrName];
            } catch (e) {
                console.log(e);
            }
        },
        getFirstPage: function(options) {
            return this.getPage("first", _.extend({
                reset: !0
            }, options));
        },
        getPreviousPage: function(options) {
            return this.getPage("prev", _.extend({
                reset: !0
            }, options));
        },
        getNextPage: function(options) {
            return this.getPage("next", _.extend({
                reset: !0
            }, options));
        },
        getLastPage: function(options) {
            return this.getPage("last", _.extend({
                reset: !0
            }, options));
        },
        hasPrevious: function(options) {
            return this.hasPreviousPage();
        },
        hasNext: function(options) {
            return this.hasNextPage();
        }
    }, {
        getTableCols: function(cols, collection, defaultSortDirection) {
            var retCols = _.map(cols, function(v, k, l) {
                var defaults = collection.constructor.tableCols[k];
                return defaults || (defaults = {}), _.extend({
                    name: k,
                    direction: defaultSortDirection ? defaultSortDirection : null
                }, defaults, v);
            });
            return retCols;
        },
        nonCrudOperation: function(url, requestMethod, options) {
            return options.beforeSend = CommonViewFunction.addRestCsrfCustomHeader, options.data && "object" == typeof options.data && (options.data = JSON.stringify(options.data)), 
            Backbone.sync.call(this, null, this, _.extend({
                url: url,
                type: requestMethod
            }, options));
        }
    });
    return BaseCollection;
});