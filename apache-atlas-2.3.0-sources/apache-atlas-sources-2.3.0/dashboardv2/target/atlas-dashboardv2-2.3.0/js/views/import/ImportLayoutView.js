define([ "require", "backbone", "hbs!tmpl/import/ImportLayoutView_tmpl", "modules/Modal", "utils/CommonViewFunction", "utils/Utils", "utils/UrlLinks", "dropzone" ], function(require, Backbone, ImportLayoutViewTmpl, Modal, CommonViewFunction, Utils, UrlLinks, dropzone) {
    var ImportLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "ImportLayoutView",
        template: ImportLayoutViewTmpl,
        regions: {},
        ui: {
            errorContainer: "[data-id='errorContainer']",
            importGlossary: "[data-id='importGlossary']",
            errorDetails: "[data-id='errorDetails']"
        },
        events: function() {
            var events = {};
            return events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "callback", "isGlossary"));
            var that = this;
            this.modal = new Modal({
                title: this.isGlossary ? "Import Glossary Term" : "Import Business Metadata",
                content: this,
                cancelText: "Cancel",
                okText: "Upload",
                allowCancel: !0,
                okCloses: !1,
                mainClass: "dropzone-modal"
            }).open(), this.modal.$el.find("button.ok").attr("disabled", !0), this.modal.on("ok", function(e) {
                that.dropzone.processQueue();
            }), this.modal.on("closeModal", function() {
                that.modal.trigger("cancel");
            }), this.bindEvents();
        },
        bindEvents: function() {
            var that = this;
            $("body").on("click", ".importBackBtn", function() {
                var modalTitle = that.isGlossary ? "Import Glossary Term" : "Import Business Metadata";
                that.toggleErrorAndDropZoneView({
                    title: modalTitle,
                    isErrorView: !1
                });
            });
        },
        onRender: function() {
            var that = this;
            this.dropzone = null;
            var updateButton = function(files) {
                var buttonEl = that.modal.$el.find("button.ok");
                0 === files.length ? buttonEl.attr("disabled", !0) : buttonEl.attr("disabled", !1);
            }, headers = {};
            headers[CommonViewFunction.restCsrfCustomHeader] = CommonViewFunction.restCsrfValue || '""', 
            this.ui.importGlossary.dropzone({
                url: that.isGlossary ? UrlLinks.glossaryImportUrl() : UrlLinks.businessMetadataImportUrl(),
                clickable: !0,
                acceptedFiles: ".csv,.xls,.xlsx",
                autoProcessQueue: !1,
                maxFiles: 1,
                addRemoveLinks: !0,
                timeout: 0,
                init: function() {
                    that.dropzone = this, this.on("addedfile", function(file) {
                        updateButton(this.files);
                    }), this.on("removedfile", function(file) {
                        updateButton(this.files);
                    });
                },
                maxfilesexceeded: function(file) {
                    this.removeAllFiles(), this.addFile(file);
                },
                success: function(file, response, responseObj) {
                    var success = !0;
                    if (response.failedImportInfoList && response.failedImportInfoList.length) {
                        var errorStr = "";
                        if (success = !1, that.ui.errorDetails.empty(), Utils.defaultErrorHandler(null, file.xhr, {
                            defaultErrorMessage: response.failedImportInfoList[0].remarks
                        }), response.failedImportInfoList.length > 1) {
                            var modalTitle = '<div class="back-button importBackBtn" title="Back to import file"><i class="fa fa-angle-left "></i> </div> <div class="modal-name">Error Details</div>';
                            _.each(response.failedImportInfoList, function(err_obj) {
                                errorStr += "<li>" + _.escape(err_obj.remarks) + "</li>";
                            }), that.ui.errorDetails.append(errorStr), that.toggleErrorAndDropZoneView({
                                title: modalTitle,
                                isErrorView: !0
                            });
                        }
                    }
                    success && (that.modal.trigger("cancel"), Utils.notifySuccess({
                        content: "File: " + file.name + " imported successfully"
                    })), that.callback && (response.successImportInfoList && response.successImportInfoList.length > 0 || success) && that.callback();
                },
                error: function(file, response, responseObj) {
                    Utils.defaultErrorHandler(null, responseObj, {
                        defaultErrorMessage: response.errorMessage || response
                    }), that.modal.$el.find("button.ok").attr("disabled", !1);
                },
                dictDefaultMessage: "Drop files here or click to upload(.csv, .xls, .xlsx).",
                headers: headers
            });
        },
        toggleErrorAndDropZoneView: function(options) {
            var that = this;
            options && (that.modal.$el.find(".modal-title").html(options.title), options.isErrorView ? (that.ui.importGlossary.addClass("hide"), 
            that.ui.errorContainer.removeClass("hide"), that.modal.$el.find("button.ok").addClass("hide")) : (that.ui.importGlossary.removeClass("hide"), 
            that.ui.errorContainer.addClass("hide"), that.modal.$el.find("button.ok").removeClass("hide"), 
            that.ui.errorDetails.empty()));
        }
    });
    return ImportLayoutView;
});