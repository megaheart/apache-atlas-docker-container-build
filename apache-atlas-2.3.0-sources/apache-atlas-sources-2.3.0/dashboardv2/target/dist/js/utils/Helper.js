define([ "require", "utils/Utils", "utils/Globals", "d3", "marionette", "jquery-ui" ], function(require, Utils, Globals, d3) {
    "use strict";
    _.mixin({
        numberFormatWithComma: function(number) {
            return d3.format(",")(number);
        },
        numberFormatWithBytes: function(number) {
            if (number > -1) {
                if (0 === number) return "0 Bytes";
                var i = 0 == number ? 0 : Math.floor(Math.log(number) / Math.log(1024));
                return i > 8 ? _.numberFormatWithComma(number) : Number((number / Math.pow(1024, i)).toFixed(2)) + " " + [ "Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB" ][i];
            }
            return number;
        },
        isEmptyArray: function(val) {
            return !(!val || !_.isArray(val)) && _.isEmpty(val);
        },
        toArrayifObject: function(val) {
            return _.isObject(val) ? [ val ] : val;
        },
        startsWith: function(str, matchStr) {
            return str && matchStr && _.isString(str) && _.isString(matchStr) ? 0 === str.lastIndexOf(matchStr, 0) : void 0;
        },
        isUndefinedNull: function(val) {
            return !(!_.isUndefined(val) && !_.isNull(val));
        },
        trim: function(val) {
            return val && val.trim ? val.trim() : val;
        },
        isTypePrimitive: function(type) {
            return "int" === type || "byte" === type || "short" === type || "long" === type || "float" === type || "double" === type || "string" === type || "boolean" === type || "date" === type;
        }
    });
    var getPopoverEl = function(e) {
        return $(e.target).parent().data("bs.popover") || $(e.target).data("bs.popover") || $(e.target).parents(".popover").length;
    };
    if ($(document).on("click DOMMouseScroll mousewheel", function(e) {
        if (e.originalEvent) {
            var isPopOverEl = getPopoverEl(e);
            isPopOverEl ? isPopOverEl.$tip && $(".popover").not(isPopOverEl.$tip).popover("hide") : $(".popover").popover("hide"), 
            $(".tooltip").tooltip("hide");
        }
    }), $("body").on("hidden.bs.popover", function(e) {
        $(e.target).data("bs.popover").inState = {
            click: !1,
            hover: !1,
            focus: !1
        };
    }), $("body").on("show.bs.popover", '[data-js="popover"]', function() {
        $(".popover").not(this).popover("hide");
    }), $("body").on("keypress", "input.number-input,.number-input .select2-search__field", function(e) {
        if (8 != e.which && 0 != e.which && (e.which < 48 || e.which > 57)) return !1;
    }), $("body").on("keypress", "input.number-input-negative,.number-input-negative .select2-search__field", function(e) {
        if (8 != e.which && 0 != e.which && (e.which < 48 || e.which > 57)) {
            if (45 != e.which) return !1;
            if (this.value.length) return !1;
        }
    }), $("body").on("keypress", "input.number-input-exponential,.number-input-exponential .select2-search__field", function(e) {
        if (8 != e.which && 0 != e.which && (e.which < 48 || e.which > 57) && 69 != e.which && 101 != e.which && 43 != e.which && 45 != e.which && 46 != e.which && 190 != e.which) return !1;
    }), $("body").on("click", ".dropdown-menu.dropdown-changetitle li a", function() {
        $(this).parents("li").find(".btn:first-child").html($(this).text() + ' <span class="caret"></span>');
    }), $("body").on("click", ".btn", function() {
        $(this).blur();
    }), $("body").on("click", function(e) {
        $(e.target).hasClass("trumbowyg-editor-hidden") && ($(".trumbowyg").find(".trumbowyg-button-pane").removeClass("trumbowyg-button-pane-hidden"), 
        $(".trumbowyg").css("border", "1px solid #8fa5b1"));
    }), $("body").on("keyup input", ".modal-body", function(e) {
        var target = e.target, isGlossary = "searchTerm" === e.target.dataset.id || "searchCategory" === e.target.dataset.id;
        if (("text" === target.type || "textarea" === target.type) && !isGlossary) {
            var $this = $(this), $footerButton = $this.parents(".modal").find(".modal-footer button.ok"), requiredInputField = _.filter($this.find("input"), function($e) {
                if ($e.getAttribute("placeholder") && $e.getAttribute("placeholder").indexOf("require") >= 0) return "" == $e.value.trim();
            });
            requiredInputField.length > 0 ? $footerButton.attr("disabled", "true") : $footerButton.removeAttr("disabled");
        }
    }), $.fn.select2 && ($.fn.select2.amd.define("TagHideDeleteButtonAdapter", [ "select2/utils", "select2/selection/multiple", "select2/selection/placeholder", "select2/selection/eventRelay", "select2/selection/search" ], function(Utils, MultipleSelection, Placeholder, EventRelay, SelectionSearch) {
        var adapter = Utils.Decorate(MultipleSelection, Placeholder);
        return adapter = Utils.Decorate(adapter, SelectionSearch), adapter = Utils.Decorate(adapter, EventRelay), 
        adapter.prototype.render = function() {
            var $search = $('<li class="select2-search select2-search--inline"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" role="textbox" aria-autocomplete="list" /></li>');
            this.$searchContainer = $search, this.$search = $search.find("input");
            var $selection = MultipleSelection.prototype.render.call(this);
            return this._transferTabIndex(), $selection;
        }, adapter.prototype.update = function(data) {
            var that = this;
            if (this.clear(), 0 === data.length) return this.$selection.find(".select2-selection__rendered").append(this.$searchContainer), 
            void this.$search.attr("placeholder", this.options.get("placeholder"));
            this.$search.attr("placeholder", "");
            var $rendered = this.$selection.find(".select2-selection__rendered"), $selectionContainer = [];
            data.length > 0 && (_.each(data, function(obj) {
                var $container = $('<li class="select2-selection__choice"></li>'), formatted = that.display(obj, $rendered), $remove = $('<span class="select2-selection__choice__remove" role="presentation">&times;</span>'), allowRemoveAttr = $(obj.element).data("allowremove"), allowRemove = void 0 === obj.allowRemove ? allowRemoveAttr : obj.allowRemove;
                void 0 !== allowRemove && allowRemove === !1 || $container.append($remove), $container.data("data", obj), 
                $container.append(formatted), $selectionContainer.push($container);
            }), Utils.appendMany($rendered, $selectionContainer));
            var searchHadFocus = this.$search[0] == document.activeElement;
            this.$search.attr("placeholder", ""), this.$selection.find(".select2-selection__rendered").append(this.$searchContainer), 
            this.resizeSearch(), searchHadFocus && this.$search.focus();
        }, adapter;
    }), $.fn.select2.amd.define("ServiceTypeFilterDropdownAdapter", [ "select2/utils", "select2/dropdown", "select2/dropdown/attachBody", "select2/dropdown/attachContainer", "select2/dropdown/search", "select2/dropdown/minimumResultsForSearch", "select2/dropdown/closeOnSelect" ], function(Utils, Dropdown, AttachBody, AttachContainer, Search, MinimumResultsForSearch, CloseOnSelect) {
        var dropdownWithSearch = Utils.Decorate(Utils.Decorate(Dropdown, CloseOnSelect), Search);
        dropdownWithSearch.prototype.render = function() {
            var $rendered = Dropdown.prototype.render.call(this), dropdownCssClass = this.options.get("dropdownCssClass");
            dropdownCssClass && $rendered.addClass(dropdownCssClass);
            var placeholder = this.options.get("placeholderForSearch") || "", $search = $('<span class="select2-search select2-search--dropdown"><div class="clearfix"><div class="col-md-10 no-padding" style="width: calc(100% - 30px);"><input class="select2-search__field" placeholder="' + placeholder + '" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="textbox" /></div><div class="col-md-2 no-padding" style="width: 30px;"><button type="button" style="padding: 3px 6px;margin: 0px 4px;" class="btn btn-action btn-sm filter " title="Type Filter"><i class="fa fa-filter"></i></button></div></div></span>');
            if (!this.options.options.getFilterBox) throw "In order to render the filter options adapter needed getFilterBox function";
            var $Filter = $('<ul class="type-filter-ul"></ul>');
            return this.$Filter = $Filter, this.$Filter.append(this.options.options.getFilterBox()), 
            this.$Filter.hide(), this.$searchContainer = $search, $Filter.find('input[type="checkbox"]:checked').length ? $search.find("button.filter").addClass("active") : $search.find("button.filter").removeClass("active"), 
            this.$search = $search.find("input"), $rendered.prepend($search), $rendered.append($Filter), 
            $rendered;
        };
        var oldDropdownWithSearchBindRef = dropdownWithSearch.prototype.bind;
        dropdownWithSearch.prototype.bind = function(container, $container) {
            var self = this;
            oldDropdownWithSearchBindRef.call(this, container, $container);
            var self = this;
            this.$Filter.on("click", "li", function() {
                var itemCallback = self.options.options.onFilterItemSelect;
                itemCallback && itemCallback(this);
            }), this.$searchContainer.find("button.filter").click(function() {
                container.$dropdown.find(".select2-search").hide(150), container.$dropdown.find(".select2-results").hide(150), 
                self.$Filter.html(self.options.options.getFilterBox()), self.$Filter.show();
            }), this.$Filter.on("click", "button.filterDone", function() {
                container.$dropdown.find(".select2-search").show(150), container.$dropdown.find(".select2-results").show(150), 
                self.$Filter.hide();
                var filterSubmitCallback = self.options.options.onFilterSubmit;
                filterSubmitCallback && filterSubmitCallback({
                    filterVal: _.map(self.$Filter.find('input[type="checkbox"]:checked'), function(item) {
                        return $(item).data("value");
                    })
                });
            }), container.$element.on("hideFilter", function() {
                container.$dropdown.find(".select2-search").show(), container.$dropdown.find(".select2-results").show(), 
                self.$Filter.hide();
            });
        };
        var adapter = Utils.Decorate(dropdownWithSearch, AttachContainer);
        return adapter = Utils.Decorate(adapter, AttachBody);
    })), $.widget("custom.atlasAutoComplete", $.ui.autocomplete, {
        _create: function() {
            this._super(), this.widget().menu("option", "items", "> :not(.ui-autocomplete-category,.empty)");
        },
        _renderMenu: function(ul, items) {
            var that = this, currentCategory = "";
            items = _.sortBy(items, "order"), $.each(items, function(index, item) {
                item.category != currentCategory && (ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>"), 
                currentCategory = item.category), that._renderItemData(ul, item);
            });
        },
        _renderItemData: function(ul, item) {
            return this._renderItem(ul, item);
        }
    }), !("placeholder" in HTMLInputElement.prototype)) {
        var originalRender = Backbone.Marionette.LayoutView.prototype.render;
        Backbone.Marionette.LayoutView.prototype.render = function() {
            originalRender.apply(this, arguments), this.$("input, textarea").placeholder();
        };
    }
    $("body").on("click", "pre.code-block .expand-collapse-button", function(e) {
        var $el = $(this).parents(".code-block");
        $el.hasClass("shrink") ? $el.removeClass("shrink") : $el.addClass("shrink");
    }), $("body").on("mouseenter", ".select2-selection__choice", function() {
        $(this).attr("title", "");
    }), $("body").tooltip && $("body").tooltip({
        selector: '[title]:not(".select2-selection__choice,.select2-selection__rendered")',
        placement: function() {
            return this.$element.attr("data-placement") || "bottom";
        },
        container: "body"
    }), $(window).on("popstate", function() {
        $("body").find(".modal-dialog .close").click(), Globals.isFullScreenView || ($("#tab-lineage").removeClass("fullscreen-mode"), 
        $("#r_lineageLayoutView").find('button[data-id="fullScreen-toggler"]').attr("data-original-title", "Full Screen").find("i").removeClass("fa-compress").addClass("fa-expand")), 
        Globals.isFullScreenView = !1;
    });
});