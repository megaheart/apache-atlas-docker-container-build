function doLogin() {
    var userName = $("#username").val().trim(), passwd = $("#password").val().trim();
    if ("" === userName || "" === passwd) return $("#errorBox").show(), $("#signInLoading").hide(), 
    $("#signIn").removeAttr("disabled"), $("#errorBox .errorMsg").text("The username or password you entered is blank.."), 
    !1;
    var baseUrl = getBaseUrl();
    $.ajax({
        data: {
            j_username: userName,
            j_password: passwd
        },
        url: baseUrl + "/j_spring_security_check",
        type: "POST",
        headers: {
            "cache-control": "no-cache"
        },
        success: function() {
            redirect(baseUrl);
        },
        error: function(jqXHR, textStatus, err) {
            if ($("#signIn").removeAttr("disabled"), $("#signInLoading").css("visibility", "hidden"), 
            jqXHR.status && 412 == jqXHR.status) $("#errorBox").hide(), $("#errorBoxUnsynced").show(); else {
                try {
                    var resp = JSON.parse(jqXHR.responseText);
                    resp.msgDesc.startsWith("Username not found") || resp.msgDesc.startsWith("Wrong password") ? $("#errorBox .errorMsg").text("Invalid User credentials. Please try again.") : resp.msgDesc.startsWith("User role credentials is not set properly") ? $("#errorBox .errorMsg").text("User role or credentials is not set properly") : $("#errorBox .errorMsg").text("Error while authenticating");
                } catch (err) {
                    $("#errorBox .errorMsg").text("Something went wrong");
                }
                $("#errorBox").show(), $("#errorBoxUnsynced").hide();
            }
        }
    });
}

function redirect(baseUrl) {
    $.ajax({
        url: baseUrl + "api/atlas/admin/session",
        success: function(data) {
            var PRIMARY_UI = "v2", indexpath = "/n/index.html";
            data && data["atlas.ui.default.version"] && (PRIMARY_UI = data["atlas.ui.default.version"]), 
            "v2" !== PRIMARY_UI && (indexpath = "/index.html"), "v1" === window.localStorage.last_ui_load ? indexpath = "/index.html" : "v2" === window.localStorage.last_ui_load && (indexpath = "/n/index.html"), 
            indexpath = baseUrl + indexpath, location.hash.length > 2 && (indexpath += location.hash), 
            window.location.replace(indexpath);
        },
        error: function() {
            window.location.replace("index.html");
        }
    });
}

function getBaseUrl() {
    return window.location.pathname.replace(/\/[\w-]+.(jsp|html)|\/+$/gi, "");
}

Array.prototype.indexOf || (Array.prototype.indexOf = function(obj, start) {
    for (var i = start || 0; i < this.length; i++) if (this[i] == obj) return i;
    return -1;
}), String.prototype.startsWith || (String.prototype.startsWith = function(str, matchStr) {
    return 0 === str.lastIndexOf(matchStr, 0);
}), $(function() {
    "placeholder" in HTMLInputElement.prototype || $("#username , #password").placeholder(), 
    $("#signIn").on("click", function() {
        return $("#signIn").attr("disabled", !0), $("#signInLoading").css("visibility", "visible"), 
        doLogin(), !1;
    }), $("#loginForm").each(function() {
        $("input").keypress(function(e) {
            10 != e.which && 13 != e.which || doLogin();
        });
    }), $("#loginForm  li[class^=control-group] > input").on("change", function(e) {
        "" === e.target.value ? $(e.target).parent().addClass("error") : $(e.target).parent().removeClass("error");
    }), $("#password").on("keyup", function() {
        "" === this.value.trim() ? $(".show-password ").hide() : $(".show-password ").show();
    });
    var showPassword = !1;
    $(".show-password").on("click", function() {
        showPassword = !showPassword, $("#password").attr("type", showPassword ? "text" : "password"), 
        $(".show-password").toggleClass("fa-eye-slash fa-eye");
    });
});