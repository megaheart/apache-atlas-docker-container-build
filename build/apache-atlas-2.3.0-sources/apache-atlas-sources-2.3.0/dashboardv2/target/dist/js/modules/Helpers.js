define([ "require", "handlebars" ], function(require, Handlebars, localization) {
    var HHelpers = {};
    return HHelpers.nl2br = function(text) {
        text = Handlebars.Utils.escapeExpression(text);
        var nl2br = (text + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, "$1<br>$2");
        return new Handlebars.SafeString(nl2br);
    }, Handlebars.registerHelper("nl2br", HHelpers.nl2br), Handlebars.registerHelper("toHumanDate", function(val) {
        return val ? val : "";
    }), Handlebars.registerHelper("tt", function(str) {
        return str;
    }), Handlebars.registerHelper("ifCond", function(v1, operator, v2, options) {
        switch (operator) {
          case "==":
            return v1 == v2 ? options.fn(this) : options.inverse(this);

          case "===":
            return v1 === v2 ? options.fn(this) : options.inverse(this);

          case "!=":
            return v1 !== v2 ? options.fn(this) : options.inverse(this);

          case "!==":
            return v1 !== v2 ? options.fn(this) : options.inverse(this);

          case "<":
            return v1 < v2 ? options.fn(this) : options.inverse(this);

          case "<=":
            return v1 <= v2 ? options.fn(this) : options.inverse(this);

          case ">":
            return v1 > v2 ? options.fn(this) : options.inverse(this);

          case ">=":
            return v1 >= v2 ? options.fn(this) : options.inverse(this);

          case "isEmpty":
            return _.isEmpty(v1) ? options.fn(this) : options.inverse(this);

          case "has":
            return _.has(v1, v2) ? options.fn(this) : options.inverse(this);

          default:
            return options.inverse(this);
        }
    }), Handlebars.registerHelper("arithmetic", function(val1, operator, val2, commaFormat, options) {
        var v1 = val1 && parseInt(val1.toString().replace(/\,/g, "")) || 0, v2 = val2 && parseInt(val2.toString().replace(/\,/g, "")) || 0, val = null;
        switch (operator) {
          case "+":
            val = v1 + v2;
            break;

          case "-":
            val = v1 - v2;
            break;

          case "/":
            val = v1 / v2;
            break;

          case "*":
            val = v1 * v2;
            break;

          case "%":
            val = v1 % v2;
            break;

          default:
            val = 0;
        }
        return commaFormat === !1 ? val : _.numberFormatWithComma(val);
    }), Handlebars.registerHelper("lookup", function(obj, field, defaulValue) {
        return obj[field] ? obj[field] : defaulValue ? defaulValue : "";
    }), Handlebars.registerHelper("eachlookup", function(obj, field, options) {
        return Handlebars.helpers.each(obj[field] ? obj[field] : null, options);
    }), Handlebars.registerHelper("callmyfunction", function(functionObj, param, options) {
        var argumentObj = _.extend([], arguments);
        return argumentObj.shift(), functionObj.apply(this, argumentObj);
    }), HHelpers;
});