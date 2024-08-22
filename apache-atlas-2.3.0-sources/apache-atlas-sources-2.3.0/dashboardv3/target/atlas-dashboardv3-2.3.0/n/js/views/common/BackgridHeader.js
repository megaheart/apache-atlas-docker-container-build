define([ "require", "backbone", "underscore", "utils/Utils", "utils/Globals", "backgrid-filter", "backgrid-paginator", "select2" ], function(require, Backbone, _, Utils) {
    "use strict";
    var HeaderSearchCell = Backbone.View.extend({
        tagName: "td",
        className: "backgrid-filter",
        template: _.template('<input type="search" <% if (placeholder) { %> placeholder="<%- placeholder %>" <% } %> name="<%- name %>" <% if (style) { %> style="<%- style %>" <% } %> />'),
        placeholder: "",
        events: {
            "keyup input": "evKeyUp",
            submit: "search"
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "column")), this.name = this.column.get("name"), 
            void 0 !== this.column.get("reName") && (this.name = this.column.get("reName"));
            var collection = this.collection, self = this;
            Backbone.PageableCollection && collection instanceof Backbone.PageableCollection && (collection.queryParams[this.name] = function() {
                return self.searchBox().val() || null;
            });
        },
        render: function() {
            return this.$el.empty().append(this.template({
                name: this.column.get("name"),
                placeholder: this.column.get("placeholder") || "Search",
                style: this.column.get("headerSearchStyle")
            })), this.$el.addClass("renderable"), this.delegateEvents(), this;
        },
        evKeyUp: function(e) {
            var $clearButton = this.clearButton(), searchTerms = this.searchBox().val();
            e.shiftKey || this.search(), searchTerms ? $clearButton.show() : $clearButton.hide();
        },
        searchBox: function() {
            return this.$el.find("input[type=search]");
        },
        clearButton: function() {
            return this.$el.find(".clear");
        },
        search: function() {
            var data = {}, collection = this.collection;
            Backbone.PageableCollection && collection instanceof Backbone.PageableCollection && "server" === collection.mode && (collection.state.currentPage = collection.state.firstPage);
            var query = this.searchBox().val();
            query && (data[this.name] = query), collection.extraSearchParams && _.extend(data, collection.extraSearchParams), 
            "server" === collection.mode ? collection.fetch({
                data: data,
                reset: !0,
                success: function() {},
                error: function(msResponse) {
                    Utils.notifyError("Error", "Invalid input data!");
                }
            }) : "client" === collection.mode;
        },
        clear: function(e) {
            e && e.preventDefault(), this.searchBox().val(null), this.collection.fetch({
                reset: !0
            });
        }
    }), HeaderFilterCell = Backbone.View.extend({
        tagName: "td",
        className: "backgrid-filter",
        template: _.template('<select >  <option>ALL</option><% _.each(list, function(data) {if(_.isObject(data)){ %><option value="<%= data.value %>"><%= data.label %></option><% }else{ %><option value="<%= data %>"><%= data %></option><% } %><% }); %></select>'),
        placeholder: "",
        events: {
            click: function() {}
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "column")), this.name = this.column.get("name"), 
            this.headerFilterOptions = this.column.get("headerFilterOptions");
        },
        render: function() {
            var that = this;
            return this.$el.empty().append(this.template({
                name: this.column.get("name"),
                list: this.headerFilterOptions.filterList
            })), this.$el.find("select").select2({
                allowClear: !0,
                closeOnSelect: !1,
                width: this.headerFilterOptions.filterWidth || "100%",
                height: this.headerFilterOptions.filterHeight || "20px"
            }), this.$el.addClass("renderable"), this.$el.find("select").on("click", function(e) {
                that.search(e.currentTarget.value);
            }), this;
        },
        search: function(selectedOptionValue) {
            var query, data = {}, collection = this.collection;
            Backbone.PageableCollection && collection instanceof Backbone.PageableCollection && "server" === collection.mode && (collection.state.currentPage = collection.state.firstPage), 
            "ALL" !== selectedOptionValue && (query = selectedOptionValue), query && (data[this.name] = query), 
            collection.extraSearchParams && _.extend(data, collection.extraSearchParams), collection.fetch({
                data: data,
                reset: !0
            });
        }
    }), HeaderRow = Backgrid.Row.extend({
        requiredOptions: [ "columns", "collection" ],
        initialize: function() {
            Backgrid.Row.prototype.initialize.apply(this, arguments);
        },
        makeCell: function(column, options) {
            var headerCell;
            switch (!0) {
              case column.has("canHeaderSearch") && column.get("canHeaderSearch") === !0:
                headerCell = new HeaderSearchCell({
                    column: column,
                    collection: this.collection
                });
                break;

              case column.has("canHeaderFilter") && column.get("canHeaderFilter") === !0:
                headerCell = new HeaderFilterCell({
                    column: column,
                    collection: this.collection
                });
                break;

              default:
                headerCell = new Backbone.View({
                    tagName: "td"
                });
            }
            return headerCell;
        }
    }), Header = Backgrid.Header.extend({
        initialize: function(options) {
            var args = Array.prototype.slice.apply(arguments);
            Backgrid.Header.prototype.initialize.apply(this, args), this.searchRow = new HeaderRow({
                columns: this.columns,
                collection: this.collection
            });
        },
        render: function() {
            var args = Array.prototype.slice.apply(arguments);
            return Backgrid.Header.prototype.render.apply(this, args), this.$el.append(this.searchRow.render().$el), 
            this;
        },
        remove: function() {
            var args = Array.prototype.slice.apply(arguments);
            return Backgrid.Header.prototype.remove.apply(this, args), this.searchRow.remove.apply(this.searchRow, arguments), 
            Backbone.View.prototype.remove.apply(this, arguments);
        }
    });
    return Header;
});