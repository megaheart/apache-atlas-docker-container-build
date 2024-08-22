define([ "require", "backbone", "hbs!tmpl/common/Modal" ], function(require, Backbone, template) {
    var Modal = Backbone.View.extend({
        className: "modal",
        events: {
            "click .close": function(event) {
                event.preventDefault(), this.trigger("closeModal"), this.options.content && this.options.content.trigger && this.options.content.trigger("closeModal", this, event);
            },
            "click .cancel": function(event) {
                event.preventDefault(), this.trigger("closeModal"), this.options.content && this.options.content.trigger && this.options.content.trigger("closeModal", this, event);
            },
            "click .ok": function(event) {
                event.preventDefault(), this.trigger("ok"), this.options.content && this.options.content.trigger && this.options.content.trigger("ok", this, event), 
                this.options.okCloses && this.close();
            }
        },
        initialize: function(options) {
            this.options = _.extend({
                title: null,
                okText: "OK",
                focusOk: !0,
                okCloses: !0,
                cancelText: "Cancel",
                allowCancel: !1,
                allowBackdrop: !0,
                showFooter: !0,
                escape: !0,
                animate: !0,
                contentWithFooter: !1,
                template: template,
                width: null,
                buttons: null
            }, options);
        },
        render: function() {
            var $el = this.$el, options = this.options, content = options.content;
            return $el.html(options.template(options)), content && content.$el ? (content.render(), 
            options.contentWithFooter ? $el.find(".modal-content").append(content.$el) : $el.find(".modal-body").html(content.$el)) : options.htmlContent && $el.find(".modal-body").append(options.htmlContent), 
            options.animate && $el.addClass("fade"), this.isRendered = !0, this;
        },
        onClose: function() {
            alert("close");
        },
        open: function(cb) {
            this.isRendered || this.render(), $(".tooltip").tooltip("hide");
            var self = this, $el = this.$el;
            $el.modal(_.extend({
                keyboard: this.options.allowCancel,
                backdrop: !this.options.allowBackdrop || "static"
            }, this.options.modalOptions)), $el.one("shown", function() {
                self.options.focusOk && $el.find(".btn.ok").focus(), self.options.content && self.options.content.trigger && self.options.content.trigger("shown", self), 
                self.trigger("shown");
            });
            var numModals = Modal.count, $backdrop = $(".modal-backdrop:eq(" + numModals + ")"), backdropIndex = parseInt($backdrop.css("z-index"), 10), elIndex = parseInt($backdrop.css("z-index"), 10);
            return $backdrop.css("z-index", backdropIndex + numModals), this.$el.css("z-index", elIndex + numModals), 
            this.options.allowCancel && ($backdrop.one("click", function() {
                self.options.content && self.options.content.trigger && self.options.content.trigger("closeModal", self), 
                self.trigger("closeModal");
            }), $(document).one("keyup.dismiss.modal", function(e) {
                27 == e.which && self.trigger("closeModal"), self.options.content && self.options.content.trigger && 27 == e.which && self.options.content.trigger("shown", self);
            })), this.on("cancel", function() {
                self.close();
            }), Modal.count++, cb && self.on("ok", cb), $el.one("shown.bs.modal", function() {
                self.trigger("shownModal");
            }), $el.find(".header-button").on("click", "button", function() {
                var headerButtons = self.options.headerButtons, clickedButtonIndex = $(this).data("index"), clickedButtonObj = headerButtons && headerButtons[clickedButtonIndex];
                clickedButtonObj && clickedButtonObj.onClick && clickedButtonObj.onClick.apply(this, arguments);
            }), this;
        },
        close: function() {
            var self = this, $el = this.$el;
            return this._preventClose ? void (this._preventClose = !1) : ($(".tooltip").tooltip("hide"), 
            $el.one("hidden.bs.modal", function onHidden(e) {
                return e.target !== e.currentTarget ? $el.one("hidden.bs.modal", onHidden) : (self.remove(), 
                self.options.content && self.options.content.trigger && self.options.content.trigger("hidden.bs.modal", self), 
                void self.trigger("hidden.bs.modal"));
            }), $el.modal("hide"), void Modal.count--);
        },
        preventClose: function() {
            this._preventClose = !0;
        }
    }, {
        count: 0
    });
    return Modal;
});