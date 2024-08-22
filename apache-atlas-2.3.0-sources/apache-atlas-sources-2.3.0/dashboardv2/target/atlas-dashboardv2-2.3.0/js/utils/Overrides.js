define([ "require", "utils/Utils", "lossless-json", "marionette", "backgrid", "asBreadcrumbs", "jquery-placeholder" ], function(require, Utils, LosslessJSON) {
    "use strict";
    Backbone.$.ajaxSetup({
        cache: !1
    });
    var oldBackboneSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        var that = this;
        if (options.queryParam) {
            var generateQueryParam = $.param(options.queryParam);
            options.url.indexOf("?") !== -1 ? options.url = options.url + "&" + generateQueryParam : options.url = options.url + "?" + generateQueryParam;
        }
        return oldBackboneSync.apply(this, [ method, model, _.extend(options, {
            error: function(response) {
                Utils.defaultErrorHandler(that, response, options), that.trigger("error", that, response), 
                options.cust_error && options.cust_error(that, response);
            },
            converters: _.extend($.ajaxSettings.converters, {
                "text json": function(data) {
                    try {
                        return LosslessJSON.parse(data, function(k, v) {
                            try {
                                return v.isLosslessNumber ? v.valueOf() : v;
                            } catch (err) {
                                return v.value;
                            }
                        });
                    } catch (err) {
                        if (!("syntaxerror" === err.name.toLowerCase() && data.length > 0 && data.indexOf("<html") > -1)) return $.parseJSON(data);
                        var redirectUrl = window.location.origin + window.location.pathname;
                        window.location = redirectUrl.substring(0, redirectUrl.lastIndexOf("/"));
                    }
                }
            })
        }) ]);
    }, String.prototype.trunc = String.prototype.trunc || function(n) {
        return this.length > n ? this.substr(0, n - 1) + "..." : this;
    }, String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }, Backgrid.Column.prototype.defaults.sortType = "toggle";
    var cellInit = Backgrid.Cell.prototype.initialize;
    Backgrid.Cell.prototype.initialize = function() {
        cellInit.apply(this, arguments);
        var className = this.column.get("className"), rowClassName = this.column.get("rowClassName");
        rowClassName && this.$el.addClass(rowClassName), className && this.$el.addClass(className);
    }, Backgrid.HeaderRow = Backgrid.HeaderRow.extend({
        render: function() {
            var that = this;
            return Backgrid.HeaderRow.__super__.render.apply(this, arguments), _.each(this.columns.models, function(modelValue) {
                var elAttr = modelValue.get("elAttr"), elAttrObj = null;
                elAttr && (_.isFunction(elAttr) ? elAttrObj = elAttr(modelValue) : _.isObject(elAttr) && (elAttrObj = _.isArray(elAttr) ? elAttr : [ elAttr ]), 
                _.each(elAttrObj, function(val) {
                    that.$el.find("." + modelValue.get("name")).data(val);
                })), modelValue.get("width") && that.$el.find("." + modelValue.get("name")).css("min-width", modelValue.get("width") + "px"), 
                modelValue.get("fixWidth") && that.$el.find("." + modelValue.get("name")).css("width", modelValue.get("fixWidth") + "px"), 
                modelValue.get("toolTip") && that.$el.find("." + modelValue.get("name")).attr("title", modelValue.get("toolTip")), 
                modelValue.get("headerClassName") && that.$el.find("." + modelValue.get("name").replace(".", "\\.")).addClass(modelValue.get("headerClassName"));
            }), this;
        }
    });
    var BackgridHeaderInitializeMethod = (Backgrid.HtmlCell = Backgrid.Cell.extend({
        className: "html-cell",
        render: function() {
            this.$el.empty();
            var rawValue = this.model.get(this.column.get("name")), formattedValue = this.formatter.fromRaw(rawValue, this.model);
            return this.$el.append(formattedValue), this.delegateEvents(), this;
        }
    }), function(options) {
        this.columns = options.columns, this.columns instanceof Backbone.Collection || (this.columns = new Backgrid.Columns(this.columns)), 
        this.createHeaderRow(), this.listenTo(this.columns, "sort", _.bind(function() {
            this.createHeaderRow(), this.render();
        }, this));
    }), BackgridHeaderCreateHeaderRowMethod = function() {
        this.row = new Backgrid.HeaderRow({
            columns: this.columns,
            collection: this.collection
        });
    }, BackgridHeaderRenderMethod = function() {
        return this.$el.empty(), this.$el.append(this.row.render().$el), this.delegateEvents(), 
        this.trigger("backgrid:header:rendered", this), this;
    };
    Backgrid.ExpandableCell = Backgrid.Cell.extend({
        accordion: !0,
        toggle: '<i style="cursor: pointer;" class="glyphicon toggle pull-left"></i>',
        toggleClass: "toggle",
        toggleExpandedClass: "fa fa-angle-down",
        toggleCollapsedClass: "fa fa-angle-right",
        trClass: "expandable",
        tdClass: "expandable-content",
        events: {
            click: "setToggle"
        },
        initialize: function(options) {
            options.accordion && (this.accordion = options.accordion), this.column = options.column, 
            this.column instanceof Backgrid.Column || (this.column = new Backgrid.Column(this.column));
            var column = this.column, model = this.model, $el = this.$el;
            Backgrid.callByNeed(column.renderable(), column, model) && $el.addClass("renderable");
        },
        render: function() {
            this.$el.empty();
            var isExpand = !0;
            return this.column.get("isExpandVisible") && (isExpand = this.column.get("isExpandVisible")(this.$el, this.model)), 
            this.$toggleEl = $(this.toggle).addClass(this.toggleClass).addClass(this.toggleCollapsedClass), 
            this.$toggleEl = isExpand ? this.$toggleEl : this.$toggleEl.addClass("noToggle"), 
            this.$el.append(this.$toggleEl), this.delegateEvents(), this;
        },
        setToggle: function() {
            var detailsRow = this.$el.data("details"), toggle = this.$toggleEl;
            if (!detailsRow && this.$toggleEl.hasClass("noToggle")) return !1;
            if (detailsRow) $(detailsRow).remove(), this.$el.data("details", null), toggle.removeClass(this.toggleExpandedClass).addClass(this.toggleCollapsedClass); else {
                if (this.accordion) {
                    var table = this.$el.closest("table");
                    $("." + this.toggleClass, table).filter("." + this.toggleExpandedClass).click();
                }
                var renderableColumns = this.$el.closest("table").find("th.renderable").length, isRenderable = !1, cellClass = this.tdClass;
                Backgrid.callByNeed(this.column.renderable(), this.column, this.model) && (isRenderable = !0, 
                cellClass += " renderable"), detailsRow = $('<tr class="' + this.trClass + '"></td><td class="' + cellClass + '" colspan="' + (renderableColumns - 1) + '"></td></tr>'), 
                this.$el.closest("tr").after(detailsRow), this.column.get("expand")(detailsRow.find("td." + this.tdClass), this.model), 
                this.$el.data("details", detailsRow), toggle.removeClass(this.toggleCollapsedClass).addClass(this.toggleExpandedClass);
            }
            return this;
        }
    }), Backgrid.Header.prototype.initialize = BackgridHeaderInitializeMethod, Backgrid.Header.prototype.createHeaderRow = BackgridHeaderCreateHeaderRowMethod, 
    Backgrid.Header.prototype.render = BackgridHeaderRenderMethod;
    var UriCell = Backgrid.UriCell = Backgrid.Cell.extend({
        className: "uri-cell",
        title: null,
        target: "_blank",
        initialize: function(options) {
            UriCell.__super__.initialize.apply(this, arguments), this.title = options.title || this.title, 
            this.target = options.target || this.target;
        },
        render: function() {
            this.$el.empty();
            var rawValue = this.model.get(this.column.get("name")), href = _.isFunction(this.column.get("href")) ? this.column.get("href")(this.model) : this.column.get("href"), klass = this.column.get("klass"), formattedValue = this.formatter.fromRaw(rawValue, this.model);
            if (this.$el.append($("<a>", {
                tabIndex: -1,
                href: href,
                title: this.title || formattedValue,
                class: klass
            }).text(formattedValue)), this.column.has("iconKlass")) {
                var iconKlass = this.column.get("iconKlass"), iconTitle = this.column.get("iconTitle");
                this.$el.find("a").append('<i class="' + iconKlass + '" title="' + iconTitle + '"></i>');
            }
            return this.delegateEvents(), this;
        }
    });
    Backgrid.HeaderHTMLDecodeCell = Backgrid.HeaderCell.extend({
        initialize: function(options) {
            Backgrid.HeaderCell.prototype.initialize.apply(this, arguments), this.name = _.unescape(this.column.get("label")), 
            this.$el.addClass(this.name);
        },
        render: function() {
            return this.$el.empty(), this.$el.text(this.name), this.delegateEvents(), this;
        }
    });
});