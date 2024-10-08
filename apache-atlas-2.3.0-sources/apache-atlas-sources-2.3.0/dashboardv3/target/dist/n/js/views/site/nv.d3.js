!function() {
    var nv = {};
    nv.dev = !1, nv.tooltip = nv.tooltip || {}, nv.utils = nv.utils || {}, nv.models = nv.models || {}, 
    nv.charts = {}, nv.logs = {}, nv.dom = {}, "undefined" != typeof module && "undefined" != typeof exports && "undefined" == typeof d3 && (d3 = require("d3")), 
    nv.dispatch = d3.dispatch("render_start", "render_end"), Function.prototype.bind || (Function.prototype.bind = function(oThis) {
        if ("function" != typeof this) throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function() {}, fBound = function() {
            return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
        };
        return fNOP.prototype = this.prototype, fBound.prototype = new fNOP(), fBound;
    }), nv.dev && (nv.dispatch.on("render_start", function(e) {
        nv.logs.startTime = +new Date();
    }), nv.dispatch.on("render_end", function(e) {
        nv.logs.endTime = +new Date(), nv.logs.totalTime = nv.logs.endTime - nv.logs.startTime, 
        nv.log("total", nv.logs.totalTime);
    })), nv.log = function() {
        if (nv.dev && window.console && console.log && console.log.apply) console.log.apply(console, arguments); else if (nv.dev && window.console && "function" == typeof console.log && Function.prototype.bind) {
            var log = Function.prototype.bind.call(console.log, console);
            log.apply(console, arguments);
        }
        return arguments[arguments.length - 1];
    }, nv.deprecated = function(name, info) {
        console && console.warn && console.warn("nvd3 warning: `" + name + "` has been deprecated. ", info || "");
    }, nv.render = function(step) {
        step = step || 1, nv.render.active = !0, nv.dispatch.render_start();
        var renderLoop = function() {
            for (var chart, graph, i = 0; i < step && (graph = nv.render.queue[i]); i++) chart = graph.generate(), 
            typeof graph.callback == typeof Function && graph.callback(chart);
            nv.render.queue.splice(0, i), nv.render.queue.length ? setTimeout(renderLoop) : (nv.dispatch.render_end(), 
            nv.render.active = !1);
        };
        setTimeout(renderLoop);
    }, nv.render.active = !1, nv.render.queue = [], nv.addGraph = function(obj) {
        typeof arguments[0] == typeof Function && (obj = {
            generate: arguments[0],
            callback: arguments[1]
        }), nv.render.queue.push(obj), nv.render.active || nv.render();
    }, "undefined" != typeof module && "undefined" != typeof exports && (module.exports = nv), 
    "undefined" != typeof window && (window.nv = nv), nv.dom.write = function(callback) {
        return void 0 !== window.fastdom ? fastdom.mutate(callback) : callback();
    }, nv.dom.read = function(callback) {
        return void 0 !== window.fastdom ? fastdom.measure(callback) : callback();
    }, nv.interactiveGuideline = function() {
        "use strict";
        function layer(selection) {
            selection.each(function(data) {
                function mouseHandler() {
                    var mouseX = d3.event.clientX - this.getBoundingClientRect().left, mouseY = d3.event.clientY - this.getBoundingClientRect().top, subtractMargin = !0, mouseOutAnyReason = !1;
                    if (isMSIE && (mouseX = d3.event.offsetX, mouseY = d3.event.offsetY, "svg" !== d3.event.target.tagName && (subtractMargin = !1), 
                    d3.event.target.className.baseVal.match("nv-legend") && (mouseOutAnyReason = !0)), 
                    subtractMargin && (mouseX -= margin.left, mouseY -= margin.top), "mouseout" === d3.event.type || mouseX < 0 || mouseY < 0 || mouseX > availableWidth || mouseY > availableHeight || d3.event.relatedTarget && void 0 === d3.event.relatedTarget.ownerSVGElement || mouseOutAnyReason) {
                        if (isMSIE && d3.event.relatedTarget && void 0 === d3.event.relatedTarget.ownerSVGElement && (void 0 === d3.event.relatedTarget.className || d3.event.relatedTarget.className.match(tooltip.nvPointerEventsClass))) return;
                        return dispatch.elementMouseout({
                            mouseX: mouseX,
                            mouseY: mouseY
                        }), layer.renderGuideLine(null), void tooltip.hidden(!0);
                    }
                    tooltip.hidden(!1);
                    var scaleIsOrdinal = "function" == typeof xScale.rangeBands, pointXValue = void 0;
                    if (scaleIsOrdinal) {
                        var elementIndex = d3.bisect(xScale.range(), mouseX) - 1;
                        if (!(xScale.range()[elementIndex] + xScale.rangeBand() >= mouseX)) return dispatch.elementMouseout({
                            mouseX: mouseX,
                            mouseY: mouseY
                        }), layer.renderGuideLine(null), void tooltip.hidden(!0);
                        pointXValue = xScale.domain()[d3.bisect(xScale.range(), mouseX) - 1];
                    } else pointXValue = xScale.invert(mouseX);
                    dispatch.elementMousemove({
                        mouseX: mouseX,
                        mouseY: mouseY,
                        pointXValue: pointXValue
                    }), "dblclick" === d3.event.type && dispatch.elementDblclick({
                        mouseX: mouseX,
                        mouseY: mouseY,
                        pointXValue: pointXValue
                    }), "click" === d3.event.type && dispatch.elementClick({
                        mouseX: mouseX,
                        mouseY: mouseY,
                        pointXValue: pointXValue
                    }), "mousedown" === d3.event.type && dispatch.elementMouseDown({
                        mouseX: mouseX,
                        mouseY: mouseY,
                        pointXValue: pointXValue
                    }), "mouseup" === d3.event.type && dispatch.elementMouseUp({
                        mouseX: mouseX,
                        mouseY: mouseY,
                        pointXValue: pointXValue
                    });
                }
                var container = d3.select(this), availableWidth = width || 960, availableHeight = height || 400, wrap = container.selectAll("g.nv-wrap.nv-interactiveLineLayer").data([ data ]), wrapEnter = wrap.enter().append("g").attr("class", " nv-wrap nv-interactiveLineLayer");
                wrapEnter.append("g").attr("class", "nv-interactiveGuideLine"), svgContainer && (svgContainer.on("touchmove", mouseHandler).on("mousemove", mouseHandler, !0).on("mouseout", mouseHandler, !0).on("mousedown", mouseHandler, !0).on("mouseup", mouseHandler, !0).on("dblclick", mouseHandler).on("click", mouseHandler), 
                layer.guideLine = null, layer.renderGuideLine = function(x) {
                    showGuideLine && (layer.guideLine && layer.guideLine.attr("x1") === x || nv.dom.write(function() {
                        var line = wrap.select(".nv-interactiveGuideLine").selectAll("line").data(null != x ? [ nv.utils.NaNtoZero(x) ] : [], String);
                        line.enter().append("line").attr("class", "nv-guideline").attr("x1", function(d) {
                            return d;
                        }).attr("x2", function(d) {
                            return d;
                        }).attr("y1", availableHeight).attr("y2", 0), line.exit().remove();
                    }));
                });
            });
        }
        var margin = {
            left: 0,
            top: 0
        }, width = null, height = null, xScale = d3.scale.linear(), dispatch = d3.dispatch("elementMousemove", "elementMouseout", "elementClick", "elementDblclick", "elementMouseDown", "elementMouseUp"), showGuideLine = !0, svgContainer = null, tooltip = nv.models.tooltip(), isMSIE = window.ActiveXObject;
        return tooltip.duration(0).hideDelay(0).hidden(!1), layer.dispatch = dispatch, layer.tooltip = tooltip, 
        layer.margin = function(_) {
            return arguments.length ? (margin.top = "undefined" != typeof _.top ? _.top : margin.top, 
            margin.left = "undefined" != typeof _.left ? _.left : margin.left, layer) : margin;
        }, layer.width = function(_) {
            return arguments.length ? (width = _, layer) : width;
        }, layer.height = function(_) {
            return arguments.length ? (height = _, layer) : height;
        }, layer.xScale = function(_) {
            return arguments.length ? (xScale = _, layer) : xScale;
        }, layer.showGuideLine = function(_) {
            return arguments.length ? (showGuideLine = _, layer) : showGuideLine;
        }, layer.svgContainer = function(_) {
            return arguments.length ? (svgContainer = _, layer) : svgContainer;
        }, layer;
    }, nv.interactiveBisect = function(values, searchVal, xAccessor) {
        "use strict";
        if (!(values instanceof Array)) return null;
        var _xAccessor;
        _xAccessor = "function" != typeof xAccessor ? function(d) {
            return d.x;
        } : xAccessor;
        var _cmp = function(d, v) {
            return _xAccessor(d) - v;
        }, bisect = d3.bisector(_cmp).left, index = d3.max([ 0, bisect(values, searchVal) - 1 ]), currentValue = _xAccessor(values[index]);
        if ("undefined" == typeof currentValue && (currentValue = index), currentValue === searchVal) return index;
        var nextIndex = d3.min([ index + 1, values.length - 1 ]), nextValue = _xAccessor(values[nextIndex]);
        return "undefined" == typeof nextValue && (nextValue = nextIndex), Math.abs(nextValue - searchVal) >= Math.abs(currentValue - searchVal) ? index : nextIndex;
    }, nv.nearestValueIndex = function(values, searchVal, threshold) {
        "use strict";
        var yDistMax = 1 / 0, indexToHighlight = null;
        return values.forEach(function(d, i) {
            var delta = Math.abs(searchVal - d);
            null != d && delta <= yDistMax && delta < threshold && (yDistMax = delta, indexToHighlight = i);
        }), indexToHighlight;
    }, nv.models.tooltip = function() {
        "use strict";
        function initTooltip() {
            if (!tooltip || !tooltip.node()) {
                var data = [ 1 ];
                tooltip = d3.select(document.body).selectAll("#" + id).data(data), tooltip.enter().append("div").attr("class", "nvtooltip " + (classes ? classes : "xy-tooltip")).attr("id", id).style("top", 0).style("left", 0).style("opacity", 0).style("position", "absolute").selectAll("div, table, td, tr").classed(nvPointerEventsClass, !0).classed(nvPointerEventsClass, !0), 
                tooltip.exit().remove();
            }
        }
        function nvtooltip() {
            if (enabled && dataSeriesExists(data)) return nv.dom.write(function() {
                initTooltip();
                var newContent = contentGenerator(data, tooltip.node());
                newContent && (tooltip.node().innerHTML = newContent), positionTooltip();
            }), nvtooltip;
        }
        var id = "nvtooltip-" + Math.floor(1e5 * Math.random()), data = null, gravity = "w", distance = 25, snapDistance = 0, classes = null, hidden = !0, hideDelay = 200, tooltip = null, lastPosition = {
            left: null,
            top: null
        }, enabled = !0, duration = 100, headerEnabled = !0, nvPointerEventsClass = "nv-pointer-events-none", valueFormatter = function(d, i, p) {
            return d;
        }, headerFormatter = function(d) {
            return d;
        }, keyFormatter = function(d, i) {
            return d;
        }, contentGenerator = function(d, elem) {
            if (null === d) return "";
            var table = d3.select(document.createElement("table"));
            if (headerEnabled) {
                var theadEnter = table.selectAll("thead").data([ d ]).enter().append("thead");
                theadEnter.append("tr").append("td").attr("colspan", 3).append("strong").classed("x-value", !0).html(headerFormatter(d.value));
            }
            var tbodyEnter = table.selectAll("tbody").data([ d ]).enter().append("tbody"), trowEnter = tbodyEnter.selectAll("tr").data(function(p) {
                return p.series;
            }).enter().append("tr").classed("highlight", function(p) {
                return p.highlight;
            });
            trowEnter.append("td").classed("legend-color-guide", !0).append("div").style("background-color", function(p) {
                return p.color;
            }), trowEnter.append("td").classed("key", !0).classed("total", function(p) {
                return !!p.total;
            }).html(function(p, i) {
                return keyFormatter(p.key, i);
            }), trowEnter.append("td").classed("value", !0).html(function(p, i) {
                return valueFormatter(p.value, i, p);
            }), trowEnter.filter(function(p, i) {
                return void 0 !== p.percent;
            }).append("td").classed("percent", !0).html(function(p, i) {
                return "(" + d3.format("%")(p.percent) + ")";
            }), trowEnter.selectAll("td").each(function(p) {
                if (p.highlight) {
                    var opacityScale = d3.scale.linear().domain([ 0, 1 ]).range([ "#fff", p.color ]), opacity = .6;
                    d3.select(this).style("border-bottom-color", opacityScale(opacity)).style("border-top-color", opacityScale(opacity));
                }
            });
            var html = table.node().outerHTML;
            return void 0 !== d.footer && (html += "<div class='footer'>" + d.footer + "</div>"), 
            html;
        }, position = function() {
            var pos = {
                left: null !== d3.event ? d3.event.clientX : 0,
                top: null !== d3.event ? d3.event.clientY : 0
            };
            if ("none" != getComputedStyle(document.body).transform) {
                var client = document.body.getBoundingClientRect();
                pos.left -= client.left, pos.top -= client.top;
            }
            return pos;
        }, dataSeriesExists = function(d) {
            if (d && d.series) {
                if (nv.utils.isArray(d.series)) return !0;
                if (nv.utils.isObject(d.series)) return d.series = [ d.series ], !0;
            }
            return !1;
        }, calcGravityOffset = function(pos) {
            var left, top, tmp, height = tooltip.node().offsetHeight, width = tooltip.node().offsetWidth, clientWidth = document.documentElement.clientWidth, clientHeight = document.documentElement.clientHeight;
            switch (gravity) {
              case "e":
                left = -width - distance, top = -(height / 2), pos.left + left < 0 && (left = distance), 
                (tmp = pos.top + top) < 0 && (top -= tmp), (tmp = pos.top + top + height) > clientHeight && (top -= tmp - clientHeight);
                break;

              case "w":
                left = distance, top = -(height / 2), pos.left + left + width > clientWidth && (left = -width - distance), 
                (tmp = pos.top + top) < 0 && (top -= tmp), (tmp = pos.top + top + height) > clientHeight && (top -= tmp - clientHeight);
                break;

              case "n":
                left = -(width / 2) - 5, top = distance, pos.top + top + height > clientHeight && (top = -height - distance), 
                (tmp = pos.left + left) < 0 && (left -= tmp), (tmp = pos.left + left + width) > clientWidth && (left -= tmp - clientWidth);
                break;

              case "s":
                left = -(width / 2), top = -height - distance, pos.top + top < 0 && (top = distance), 
                (tmp = pos.left + left) < 0 && (left -= tmp), (tmp = pos.left + left + width) > clientWidth && (left -= tmp - clientWidth);
                break;

              case "center":
                left = -(width / 2), top = -(height / 2);
                break;

              default:
                left = 0, top = 0;
            }
            return {
                left: left,
                top: top
            };
        }, positionTooltip = function() {
            nv.dom.read(function() {
                var pos = position(), gravityOffset = calcGravityOffset(pos), left = pos.left + gravityOffset.left, top = pos.top + gravityOffset.top;
                if (hidden) tooltip.interrupt().transition().delay(hideDelay).duration(0).style("opacity", 0); else {
                    var old_translate = "translate(" + lastPosition.left + "px, " + lastPosition.top + "px)", new_translate = "translate(" + Math.round(left) + "px, " + Math.round(top) + "px)", translateInterpolator = d3.interpolateString(old_translate, new_translate), is_hidden = tooltip.style("opacity") < .1;
                    tooltip.interrupt().transition().duration(is_hidden ? 0 : duration).styleTween("transform", function(d) {
                        return translateInterpolator;
                    }, "important").styleTween("-webkit-transform", function(d) {
                        return translateInterpolator;
                    }).style("-ms-transform", new_translate).style("opacity", 1);
                }
                lastPosition.left = left, lastPosition.top = top;
            });
        };
        return nvtooltip.nvPointerEventsClass = nvPointerEventsClass, nvtooltip.options = nv.utils.optionsFunc.bind(nvtooltip), 
        nvtooltip._options = Object.create({}, {
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _;
                }
            },
            gravity: {
                get: function() {
                    return gravity;
                },
                set: function(_) {
                    gravity = _;
                }
            },
            distance: {
                get: function() {
                    return distance;
                },
                set: function(_) {
                    distance = _;
                }
            },
            snapDistance: {
                get: function() {
                    return snapDistance;
                },
                set: function(_) {
                    snapDistance = _;
                }
            },
            classes: {
                get: function() {
                    return classes;
                },
                set: function(_) {
                    classes = _;
                }
            },
            enabled: {
                get: function() {
                    return enabled;
                },
                set: function(_) {
                    enabled = _;
                }
            },
            hideDelay: {
                get: function() {
                    return hideDelay;
                },
                set: function(_) {
                    hideDelay = _;
                }
            },
            contentGenerator: {
                get: function() {
                    return contentGenerator;
                },
                set: function(_) {
                    contentGenerator = _;
                }
            },
            valueFormatter: {
                get: function() {
                    return valueFormatter;
                },
                set: function(_) {
                    valueFormatter = _;
                }
            },
            headerFormatter: {
                get: function() {
                    return headerFormatter;
                },
                set: function(_) {
                    headerFormatter = _;
                }
            },
            keyFormatter: {
                get: function() {
                    return keyFormatter;
                },
                set: function(_) {
                    keyFormatter = _;
                }
            },
            headerEnabled: {
                get: function() {
                    return headerEnabled;
                },
                set: function(_) {
                    headerEnabled = _;
                }
            },
            position: {
                get: function() {
                    return position;
                },
                set: function(_) {
                    position = _;
                }
            },
            chartContainer: {
                get: function() {
                    return document.body;
                },
                set: function(_) {
                    nv.deprecated("chartContainer", "feature removed after 1.8.3");
                }
            },
            fixedTop: {
                get: function() {
                    return null;
                },
                set: function(_) {
                    nv.deprecated("fixedTop", "feature removed after 1.8.1");
                }
            },
            offset: {
                get: function() {
                    return {
                        left: 0,
                        top: 0
                    };
                },
                set: function(_) {
                    nv.deprecated("offset", "use chart.tooltip.distance() instead");
                }
            },
            hidden: {
                get: function() {
                    return hidden;
                },
                set: function(_) {
                    hidden != _ && (hidden = !!_, nvtooltip());
                }
            },
            data: {
                get: function() {
                    return data;
                },
                set: function(_) {
                    _.point && (_.value = _.point.x, _.series = _.series || {}, _.series.value = _.point.y, 
                    _.series.color = _.point.color || _.series.color), data = _;
                }
            },
            node: {
                get: function() {
                    return tooltip.node();
                },
                set: function(_) {}
            },
            id: {
                get: function() {
                    return id;
                },
                set: function(_) {}
            }
        }), nv.utils.initOptions(nvtooltip), nvtooltip;
    }, nv.utils.windowSize = function() {
        var size = {
            width: 640,
            height: 480
        };
        return window.innerWidth && window.innerHeight ? (size.width = window.innerWidth, 
        size.height = window.innerHeight, size) : "CSS1Compat" == document.compatMode && document.documentElement && document.documentElement.offsetWidth ? (size.width = document.documentElement.offsetWidth, 
        size.height = document.documentElement.offsetHeight, size) : document.body && document.body.offsetWidth ? (size.width = document.body.offsetWidth, 
        size.height = document.body.offsetHeight, size) : size;
    }, nv.utils.isArray = Array.isArray, nv.utils.isObject = function(a) {
        return null !== a && "object" == typeof a;
    }, nv.utils.isFunction = function(a) {
        return "function" == typeof a;
    }, nv.utils.isDate = function(a) {
        return "[object Date]" === toString.call(a);
    }, nv.utils.isNumber = function(a) {
        return !isNaN(a) && "number" == typeof a;
    }, nv.utils.windowResize = function(handler) {
        return window.addEventListener ? window.addEventListener("resize", handler) : nv.log("ERROR: Failed to bind to window.resize with: ", handler), 
        {
            callback: handler,
            clear: function() {
                window.removeEventListener("resize", handler);
            }
        };
    }, nv.utils.getColor = function(color) {
        if (void 0 === color) return nv.utils.defaultColor();
        if (nv.utils.isArray(color)) {
            var color_scale = d3.scale.ordinal().range(color);
            return function(d, i) {
                var key = void 0 === i ? d : i;
                return d.color || color_scale(key);
            };
        }
        return color;
    }, nv.utils.defaultColor = function() {
        return nv.utils.getColor(d3.scale.category20().range());
    }, nv.utils.customTheme = function(dictionary, getKey, defaultColors) {
        getKey = getKey || function(series) {
            return series.key;
        }, defaultColors = defaultColors || d3.scale.category20().range();
        var defIndex = defaultColors.length;
        return function(series, index) {
            var key = getKey(series);
            return nv.utils.isFunction(dictionary[key]) ? dictionary[key]() : void 0 !== dictionary[key] ? dictionary[key] : (defIndex || (defIndex = defaultColors.length), 
            defIndex -= 1, defaultColors[defIndex]);
        };
    }, nv.utils.pjax = function(links, content) {
        var load = function(href) {
            d3.html(href, function(fragment) {
                var target = d3.select(content).node();
                target.parentNode.replaceChild(d3.select(fragment).select(content).node(), target), 
                nv.utils.pjax(links, content);
            });
        };
        d3.selectAll(links).on("click", function() {
            history.pushState(this.href, this.textContent, this.href), load(this.href), d3.event.preventDefault();
        }), d3.select(window).on("popstate", function() {
            d3.event.state && load(d3.event.state);
        });
    }, nv.utils.calcApproxTextWidth = function(svgTextElem) {
        if (nv.utils.isFunction(svgTextElem.style) && nv.utils.isFunction(svgTextElem.text)) {
            var fontSize = parseInt(svgTextElem.style("font-size").replace("px", ""), 10), textLength = svgTextElem.text().length;
            return nv.utils.NaNtoZero(textLength * fontSize * .5);
        }
        return 0;
    }, nv.utils.NaNtoZero = function(n) {
        return !nv.utils.isNumber(n) || isNaN(n) || null === n || n === 1 / 0 || n === -(1 / 0) ? 0 : n;
    }, d3.selection.prototype.watchTransition = function(renderWatch) {
        var args = [ this ].concat([].slice.call(arguments, 1));
        return renderWatch.transition.apply(renderWatch, args);
    }, nv.utils.renderWatch = function(dispatch, duration) {
        if (!(this instanceof nv.utils.renderWatch)) return new nv.utils.renderWatch(dispatch, duration);
        var _duration = void 0 !== duration ? duration : 250, renderStack = [], self = this;
        this.models = function(models) {
            return models = [].slice.call(arguments, 0), models.forEach(function(model) {
                model.__rendered = !1, function(m) {
                    m.dispatch.on("renderEnd", function(arg) {
                        m.__rendered = !0, self.renderEnd("model");
                    });
                }(model), renderStack.indexOf(model) < 0 && renderStack.push(model);
            }), this;
        }, this.reset = function(duration) {
            void 0 !== duration && (_duration = duration), renderStack = [];
        }, this.transition = function(selection, args, duration) {
            if (args = arguments.length > 1 ? [].slice.call(arguments, 1) : [], duration = args.length > 1 ? args.pop() : void 0 !== _duration ? _duration : 250, 
            selection.__rendered = !1, renderStack.indexOf(selection) < 0 && renderStack.push(selection), 
            0 === duration) return selection.__rendered = !0, selection.delay = function() {
                return this;
            }, selection.duration = function() {
                return this;
            }, selection;
            0 === selection.length ? selection.__rendered = !0 : selection.every(function(d) {
                return !d.length;
            }) ? selection.__rendered = !0 : selection.__rendered = !1;
            var n = 0;
            return selection.transition().duration(duration).each(function() {
                ++n;
            }).each("end", function(d, i) {
                0 === --n && (selection.__rendered = !0, self.renderEnd.apply(this, args));
            });
        }, this.renderEnd = function() {
            renderStack.every(function(d) {
                return d.__rendered;
            }) && (renderStack.forEach(function(d) {
                d.__rendered = !1;
            }), dispatch.renderEnd.apply(this, arguments));
        };
    }, nv.utils.deepExtend = function(dst) {
        var sources = arguments.length > 1 ? [].slice.call(arguments, 1) : [];
        sources.forEach(function(source) {
            for (var key in source) {
                var isArray = nv.utils.isArray(dst[key]), isObject = nv.utils.isObject(dst[key]), srcObj = nv.utils.isObject(source[key]);
                isObject && !isArray && srcObj ? nv.utils.deepExtend(dst[key], source[key]) : dst[key] = source[key];
            }
        });
    }, nv.utils.state = function() {
        if (!(this instanceof nv.utils.state)) return new nv.utils.state();
        var state = {}, _setState = function() {}, _getState = function() {
            return {};
        }, init = null, changed = null;
        this.dispatch = d3.dispatch("change", "set"), this.dispatch.on("set", function(state) {
            _setState(state, !0);
        }), this.getter = function(fn) {
            return _getState = fn, this;
        }, this.setter = function(fn, callback) {
            return callback || (callback = function() {}), _setState = function(state, update) {
                fn(state), update && callback();
            }, this;
        }, this.init = function(state) {
            init = init || {}, nv.utils.deepExtend(init, state);
        };
        var _set = function() {
            var settings = _getState();
            if (JSON.stringify(settings) === JSON.stringify(state)) return !1;
            for (var key in settings) void 0 === state[key] && (state[key] = {}), state[key] = settings[key], 
            changed = !0;
            return !0;
        };
        this.update = function() {
            init && (_setState(init, !1), init = null), _set.call(this) && this.dispatch.change(state);
        };
    }, nv.utils.optionsFunc = function(args) {
        return args && d3.map(args).forEach(function(key, value) {
            nv.utils.isFunction(this[key]) && this[key](value);
        }.bind(this)), this;
    }, nv.utils.calcTicksX = function(numTicks, data) {
        var numValues = 1, i = 0;
        for (i; i < data.length; i += 1) {
            var stream_len = data[i] && data[i].values ? data[i].values.length : 0;
            numValues = stream_len > numValues ? stream_len : numValues;
        }
        return nv.log("Requested number of ticks: ", numTicks), nv.log("Calculated max values to be: ", numValues), 
        numTicks = numTicks > numValues ? numTicks = numValues - 1 : numTicks, numTicks = numTicks < 1 ? 1 : numTicks, 
        numTicks = Math.floor(numTicks), nv.log("Calculating tick count as: ", numTicks), 
        numTicks;
    }, nv.utils.calcTicksY = function(numTicks, data) {
        return nv.utils.calcTicksX(numTicks, data);
    }, nv.utils.initOption = function(chart, name) {
        chart._calls && chart._calls[name] ? chart[name] = chart._calls[name] : (chart[name] = function(_) {
            return arguments.length ? (chart._overrides[name] = !0, chart._options[name] = _, 
            chart) : chart._options[name];
        }, chart["_" + name] = function(_) {
            return arguments.length ? (chart._overrides[name] || (chart._options[name] = _), 
            chart) : chart._options[name];
        });
    }, nv.utils.initOptions = function(chart) {
        chart._overrides = chart._overrides || {};
        var ops = Object.getOwnPropertyNames(chart._options || {}), calls = Object.getOwnPropertyNames(chart._calls || {});
        ops = ops.concat(calls);
        for (var i in ops) nv.utils.initOption(chart, ops[i]);
    }, nv.utils.inheritOptionsD3 = function(target, d3_source, oplist) {
        target._d3options = oplist.concat(target._d3options || []), target._d3options = (target._d3options || []).filter(function(item, i, ar) {
            return ar.indexOf(item) === i;
        }), oplist.unshift(d3_source), oplist.unshift(target), d3.rebind.apply(this, oplist);
    }, nv.utils.arrayUnique = function(a) {
        return a.sort().filter(function(item, pos) {
            return !pos || item != a[pos - 1];
        });
    }, nv.utils.symbolMap = d3.map(), nv.utils.symbol = function() {
        function symbol(d, i) {
            var t = type.call(this, d, i), s = size.call(this, d, i);
            return d3.svg.symbolTypes.indexOf(t) !== -1 ? d3.svg.symbol().type(t).size(s)() : nv.utils.symbolMap.get(t)(s);
        }
        var type, size = 64;
        return symbol.type = function(_) {
            return arguments.length ? (type = d3.functor(_), symbol) : type;
        }, symbol.size = function(_) {
            return arguments.length ? (size = d3.functor(_), symbol) : size;
        }, symbol;
    }, nv.utils.inheritOptions = function(target, source) {
        var ops = Object.getOwnPropertyNames(source._options || {}), calls = Object.getOwnPropertyNames(source._calls || {}), inherited = source._inherited || [], d3ops = source._d3options || [], args = ops.concat(calls).concat(inherited).concat(d3ops);
        args.unshift(source), args.unshift(target), d3.rebind.apply(this, args), target._inherited = nv.utils.arrayUnique(ops.concat(calls).concat(inherited).concat(ops).concat(target._inherited || [])), 
        target._d3options = nv.utils.arrayUnique(d3ops.concat(target._d3options || []));
    }, nv.utils.initSVG = function(svg) {
        svg.classed({
            "nvd3-svg": !0
        });
    }, nv.utils.sanitizeHeight = function(height, container) {
        return height || parseInt(container.style("height"), 10) || 400;
    }, nv.utils.sanitizeWidth = function(width, container) {
        return width || parseInt(container.style("width"), 10) || 960;
    }, nv.utils.availableHeight = function(height, container, margin) {
        return Math.max(0, nv.utils.sanitizeHeight(height, container) - margin.top - margin.bottom);
    }, nv.utils.availableWidth = function(width, container, margin) {
        return Math.max(0, nv.utils.sanitizeWidth(width, container) - margin.left - margin.right);
    }, nv.utils.noData = function(chart, container) {
        var opt = chart.options(), margin = opt.margin(), noData = opt.noData(), data = null == noData ? [ "No Data Available." ] : [ noData ], height = nv.utils.availableHeight(null, container, margin), width = nv.utils.availableWidth(null, container, margin), x = margin.left + width / 2, y = margin.top + height / 2;
        container.selectAll("g").remove();
        var noDataText = container.selectAll(".nv-noData").data(data);
        noDataText.enter().append("text").attr("class", "nvd3 nv-noData").attr("dy", "-.7em").style("text-anchor", "middle"), 
        noDataText.attr("x", x).attr("y", y).text(function(t) {
            return t;
        });
    }, nv.utils.wrapTicks = function(text, width) {
        text.each(function() {
            for (var word, text = d3.select(this), words = text.text().split(/\s+/).reverse(), line = [], lineNumber = 0, lineHeight = 1.1, y = text.attr("y"), dy = parseFloat(text.attr("dy")), tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em"); word = words.pop(); ) line.push(word), 
            tspan.text(line.join(" ")), tspan.node().getComputedTextLength() > width && (line.pop(), 
            tspan.text(line.join(" ")), line = [ word ], tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word));
        });
    }, nv.utils.arrayEquals = function(array1, array2) {
        if (array1 === array2) return !0;
        if (!array1 || !array2) return !1;
        if (array1.length != array2.length) return !1;
        for (var i = 0, l = array1.length; i < l; i++) if (array1[i] instanceof Array && array2[i] instanceof Array) {
            if (!nv.arrayEquals(array1[i], array2[i])) return !1;
        } else if (array1[i] != array2[i]) return !1;
        return !0;
    }, nv.utils.pointIsInArc = function(pt, ptData, d3Arc) {
        var r1 = d3Arc.innerRadius()(ptData), r2 = d3Arc.outerRadius()(ptData), theta1 = d3Arc.startAngle()(ptData), theta2 = d3Arc.endAngle()(ptData), dist = pt.x * pt.x + pt.y * pt.y, angle = Math.atan2(pt.x, -pt.y);
        return angle = angle < 0 ? angle + 2 * Math.PI : angle, r1 * r1 <= dist && dist <= r2 * r2 && theta1 <= angle && angle <= theta2;
    }, nv.models.axis = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), selection.each(function(data) {
                var container = d3.select(this);
                nv.utils.initSVG(container);
                var wrap = container.selectAll("g.nv-wrap.nv-axis").data([ data ]), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-axis"), g = (wrapEnter.append("g"), 
                wrap.select("g"));
                null !== ticks ? axis.ticks(ticks) : "top" != axis.orient() && "bottom" != axis.orient() || axis.ticks(Math.abs(scale.range()[1] - scale.range()[0]) / 100), 
                g.watchTransition(renderWatch, "axis").call(axis), scale0 = scale0 || axis.scale();
                var fmt = axis.tickFormat();
                null == fmt && (fmt = scale0.tickFormat());
                var axisLabel = g.selectAll("text.nv-axislabel").data([ axisLabelText || null ]);
                axisLabel.exit().remove(), void 0 !== fontSize && g.selectAll("g").select("text").style("font-size", fontSize);
                var xLabelMargin, axisMaxMin, w;
                switch (axis.orient()) {
                  case "top":
                    axisLabel.enter().append("text").attr("class", "nv-axislabel"), w = 0, 1 === scale.range().length ? w = isOrdinal ? 2 * scale.range()[0] + scale.rangeBand() : 0 : 2 === scale.range().length ? w = isOrdinal ? scale.range()[0] + scale.range()[1] + scale.rangeBand() : scale.range()[1] : scale.range().length > 2 && (w = scale.range()[scale.range().length - 1] + (scale.range()[1] - scale.range()[0])), 
                    axisLabel.attr("text-anchor", "middle").attr("y", 0).attr("x", w / 2), showMaxMin && (axisMaxMin = wrap.selectAll("g.nv-axisMaxMin").data(scale.domain()), 
                    axisMaxMin.enter().append("g").attr("class", function(d, i) {
                        return [ "nv-axisMaxMin", "nv-axisMaxMin-x", 0 == i ? "nv-axisMin-x" : "nv-axisMax-x" ].join(" ");
                    }).append("text"), axisMaxMin.exit().remove(), axisMaxMin.attr("transform", function(d, i) {
                        return "translate(" + nv.utils.NaNtoZero(scale(d)) + ",0)";
                    }).select("text").attr("dy", "-0.5em").attr("y", -axis.tickPadding()).attr("text-anchor", "middle").text(function(d, i) {
                        var formatter = tickFormatMaxMin || fmt, v = formatter(d);
                        return ("" + v).match("NaN") ? "" : v;
                    }), axisMaxMin.watchTransition(renderWatch, "min-max top").attr("transform", function(d, i) {
                        return "translate(" + nv.utils.NaNtoZero(scale.range()[i]) + ",0)";
                    }));
                    break;

                  case "bottom":
                    xLabelMargin = axisLabelDistance + 36;
                    var maxTextWidth = 30, textHeight = 0, xTicks = g.selectAll("g").select("text"), rotateLabelsRule = "";
                    if (rotateLabels % 360) {
                        xTicks.attr("transform", ""), xTicks.each(function(d, i) {
                            var box = this.getBoundingClientRect(), width = box.width;
                            textHeight = box.height, width > maxTextWidth && (maxTextWidth = width);
                        }), rotateLabelsRule = "rotate(" + rotateLabels + " 0," + (textHeight / 2 + axis.tickPadding()) + ")";
                        var sin = Math.abs(Math.sin(rotateLabels * Math.PI / 180));
                        xLabelMargin = (sin ? sin * maxTextWidth : maxTextWidth) + 30, xTicks.attr("transform", rotateLabelsRule).style("text-anchor", rotateLabels % 360 > 0 ? "start" : "end");
                    } else staggerLabels ? xTicks.attr("transform", function(d, i) {
                        return "translate(0," + (i % 2 == 0 ? "0" : "12") + ")";
                    }) : xTicks.attr("transform", "translate(0,0)");
                    axisLabel.enter().append("text").attr("class", "nv-axislabel"), w = 0, 1 === scale.range().length ? w = isOrdinal ? 2 * scale.range()[0] + scale.rangeBand() : 0 : 2 === scale.range().length ? w = isOrdinal ? scale.range()[0] + scale.range()[1] + scale.rangeBand() : scale.range()[1] : scale.range().length > 2 && (w = scale.range()[scale.range().length - 1] + (scale.range()[1] - scale.range()[0])), 
                    axisLabel.attr("text-anchor", "middle").attr("y", xLabelMargin).attr("x", w / 2), 
                    showMaxMin && (axisMaxMin = wrap.selectAll("g.nv-axisMaxMin").data([ scale.domain()[0], scale.domain()[scale.domain().length - 1] ]), 
                    axisMaxMin.enter().append("g").attr("class", function(d, i) {
                        return [ "nv-axisMaxMin", "nv-axisMaxMin-x", 0 == i ? "nv-axisMin-x" : "nv-axisMax-x" ].join(" ");
                    }).append("text"), axisMaxMin.exit().remove(), axisMaxMin.attr("transform", function(d, i) {
                        return "translate(" + nv.utils.NaNtoZero(scale(d) + (isOrdinal ? scale.rangeBand() / 2 : 0)) + ",0)";
                    }).select("text").attr("dy", ".71em").attr("y", axis.tickPadding()).attr("transform", rotateLabelsRule).style("text-anchor", rotateLabels ? rotateLabels % 360 > 0 ? "start" : "end" : "middle").text(function(d, i) {
                        var formatter = tickFormatMaxMin || fmt, v = formatter(d);
                        return ("" + v).match("NaN") ? "" : v;
                    }), axisMaxMin.watchTransition(renderWatch, "min-max bottom").attr("transform", function(d, i) {
                        return "translate(" + nv.utils.NaNtoZero(scale(d) + (isOrdinal ? scale.rangeBand() / 2 : 0)) + ",0)";
                    }));
                    break;

                  case "right":
                    axisLabel.enter().append("text").attr("class", "nv-axislabel"), axisLabel.style("text-anchor", rotateYLabel ? "middle" : "begin").attr("transform", rotateYLabel ? "rotate(90)" : "").attr("y", rotateYLabel ? -Math.max(margin.right, width) + 12 - (axisLabelDistance || 0) : -10).attr("x", rotateYLabel ? d3.max(scale.range()) / 2 : axis.tickPadding()), 
                    showMaxMin && (axisMaxMin = wrap.selectAll("g.nv-axisMaxMin").data(scale.domain()), 
                    axisMaxMin.enter().append("g").attr("class", function(d, i) {
                        return [ "nv-axisMaxMin", "nv-axisMaxMin-y", 0 == i ? "nv-axisMin-y" : "nv-axisMax-y" ].join(" ");
                    }).append("text").style("opacity", 0), axisMaxMin.exit().remove(), axisMaxMin.attr("transform", function(d, i) {
                        return "translate(0," + nv.utils.NaNtoZero(scale(d)) + ")";
                    }).select("text").attr("dy", ".32em").attr("y", 0).attr("x", axis.tickPadding()).style("text-anchor", "start").text(function(d, i) {
                        var formatter = tickFormatMaxMin || fmt, v = formatter(d);
                        return ("" + v).match("NaN") ? "" : v;
                    }), axisMaxMin.watchTransition(renderWatch, "min-max right").attr("transform", function(d, i) {
                        return "translate(0," + nv.utils.NaNtoZero(scale.range()[i]) + ")";
                    }).select("text").style("opacity", 1));
                    break;

                  case "left":
                    axisLabel.enter().append("text").attr("class", "nv-axislabel"), axisLabel.style("text-anchor", rotateYLabel ? "middle" : "end").attr("transform", rotateYLabel ? "rotate(-90)" : "").attr("y", rotateYLabel ? -Math.max(margin.left, width) + 25 - (axisLabelDistance || 0) : -10).attr("x", rotateYLabel ? -d3.max(scale.range()) / 2 : -axis.tickPadding()), 
                    showMaxMin && (axisMaxMin = wrap.selectAll("g.nv-axisMaxMin").data(scale.domain()), 
                    axisMaxMin.enter().append("g").attr("class", function(d, i) {
                        return [ "nv-axisMaxMin", "nv-axisMaxMin-y", 0 == i ? "nv-axisMin-y" : "nv-axisMax-y" ].join(" ");
                    }).append("text").style("opacity", 0), axisMaxMin.exit().remove(), axisMaxMin.attr("transform", function(d, i) {
                        return "translate(0," + nv.utils.NaNtoZero(scale0(d)) + ")";
                    }).select("text").attr("dy", ".32em").attr("y", 0).attr("x", -axis.tickPadding()).attr("text-anchor", "end").text(function(d, i) {
                        var formatter = tickFormatMaxMin || fmt, v = formatter(d);
                        return ("" + v).match("NaN") ? "" : v;
                    }), axisMaxMin.watchTransition(renderWatch, "min-max right").attr("transform", function(d, i) {
                        return "translate(0," + nv.utils.NaNtoZero(scale.range()[i]) + ")";
                    }).select("text").style("opacity", 1));
                }
                if (axisLabel.text(function(d) {
                    return d;
                }), !showMaxMin || "left" !== axis.orient() && "right" !== axis.orient() || (g.selectAll("g").each(function(d, i) {
                    d3.select(this).select("text").attr("opacity", 1), (scale(d) < scale.range()[1] + 10 || scale(d) > scale.range()[0] - 10) && ((d > 1e-10 || d < -1e-10) && d3.select(this).attr("opacity", 0), 
                    d3.select(this).select("text").attr("opacity", 0));
                }), scale.domain()[0] == scale.domain()[1] && 0 == scale.domain()[0] && wrap.selectAll("g.nv-axisMaxMin").style("opacity", function(d, i) {
                    return i ? 0 : 1;
                })), showMaxMin && ("top" === axis.orient() || "bottom" === axis.orient())) {
                    var maxMinRange = [];
                    wrap.selectAll("g.nv-axisMaxMin").each(function(d, i) {
                        try {
                            i ? maxMinRange.push(scale(d) - this.getBoundingClientRect().width - 4) : maxMinRange.push(scale(d) + this.getBoundingClientRect().width + 4);
                        } catch (err) {
                            i ? maxMinRange.push(scale(d) - 4) : maxMinRange.push(scale(d) + 4);
                        }
                    }), g.selectAll("g").each(function(d, i) {
                        (scale(d) < maxMinRange[0] || scale(d) > maxMinRange[1]) && (d > 1e-10 || d < -1e-10 ? d3.select(this).remove() : d3.select(this).select("text").remove());
                    });
                }
                g.selectAll(".tick").filter(function(d) {
                    return !parseFloat(Math.round(1e5 * d) / 1e6) && void 0 !== d;
                }).classed("zero", !0), scale0 = scale.copy();
            }), renderWatch.renderEnd("axis immediate"), chart;
        }
        var tickFormatMaxMin, axis = d3.svg.axis(), scale = d3.scale.linear(), margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, width = 75, height = 60, axisLabelText = null, showMaxMin = !0, rotateLabels = 0, rotateYLabel = !0, staggerLabels = !1, isOrdinal = !1, ticks = null, axisLabelDistance = 0, fontSize = void 0, duration = 250, dispatch = d3.dispatch("renderEnd");
        axis.scale(scale).orient("bottom").tickFormat(function(d) {
            return d;
        });
        var scale0, renderWatch = nv.utils.renderWatch(dispatch, duration);
        return chart.axis = axis, chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            axisLabelDistance: {
                get: function() {
                    return axisLabelDistance;
                },
                set: function(_) {
                    axisLabelDistance = _;
                }
            },
            staggerLabels: {
                get: function() {
                    return staggerLabels;
                },
                set: function(_) {
                    staggerLabels = _;
                }
            },
            rotateLabels: {
                get: function() {
                    return rotateLabels;
                },
                set: function(_) {
                    rotateLabels = _;
                }
            },
            rotateYLabel: {
                get: function() {
                    return rotateYLabel;
                },
                set: function(_) {
                    rotateYLabel = _;
                }
            },
            showMaxMin: {
                get: function() {
                    return showMaxMin;
                },
                set: function(_) {
                    showMaxMin = _;
                }
            },
            axisLabel: {
                get: function() {
                    return axisLabelText;
                },
                set: function(_) {
                    axisLabelText = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            ticks: {
                get: function() {
                    return ticks;
                },
                set: function(_) {
                    ticks = _;
                }
            },
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            fontSize: {
                get: function() {
                    return fontSize;
                },
                set: function(_) {
                    fontSize = _;
                }
            },
            tickFormatMaxMin: {
                get: function() {
                    return tickFormatMaxMin;
                },
                set: function(_) {
                    tickFormatMaxMin = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration);
                }
            },
            scale: {
                get: function() {
                    return scale;
                },
                set: function(_) {
                    scale = _, axis.scale(scale), isOrdinal = "function" == typeof scale.rangeBands, 
                    nv.utils.inheritOptionsD3(chart, scale, [ "domain", "range", "rangeBand", "rangeBands" ]);
                }
            }
        }), nv.utils.initOptions(chart), nv.utils.inheritOptionsD3(chart, axis, [ "orient", "tickValues", "tickSubdivide", "tickSize", "tickPadding", "tickFormat" ]), 
        nv.utils.inheritOptionsD3(chart, scale, [ "domain", "range", "rangeBand", "rangeBands" ]), 
        chart;
    }, nv.models.boxPlot = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), selection.each(function(data) {
                var availableWidth = width - margin.left - margin.right, availableHeight = height - margin.top - margin.bottom;
                container = d3.select(this), nv.utils.initSVG(container), xScale.domain(xDomain || data.map(function(d, i) {
                    return getX(d, i);
                })).rangeBands(xRange || [ 0, availableWidth ], .1);
                var yData = [];
                if (!yDomain) {
                    var yMin, yMax, values = [];
                    data.forEach(function(d, i) {
                        var q1 = getQ1(d), q3 = getQ3(d), wl = getWl(d), wh = getWh(d), olItems = getOlItems(d);
                        olItems && olItems.forEach(function(e, i) {
                            values.push(getOlValue(e, i, void 0));
                        }), wl && values.push(wl), q1 && values.push(q1), q3 && values.push(q3), wh && values.push(wh);
                    }), yMin = d3.min(values), yMax = d3.max(values), yData = [ yMin, yMax ];
                }
                yScale.domain(yDomain || yData), yScale.range(yRange || [ availableHeight, 0 ]), 
                xScale0 = xScale0 || xScale, yScale0 = yScale0 || yScale.copy().range([ yScale(0), yScale(0) ]);
                var wrap = container.selectAll("g.nv-wrap").data([ data ]);
                wrap.enter().append("g").attr("class", "nvd3 nv-wrap");
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var boxplots = wrap.selectAll(".nv-boxplot").data(function(d) {
                    return d;
                }), boxEnter = boxplots.enter().append("g").style("stroke-opacity", 1e-6).style("fill-opacity", 1e-6);
                boxplots.attr("class", "nv-boxplot").attr("transform", function(d, i, j) {
                    return "translate(" + (xScale(getX(d, i)) + .05 * xScale.rangeBand()) + ", 0)";
                }).classed("hover", function(d) {
                    return d.hover;
                }), boxplots.watchTransition(renderWatch, "nv-boxplot: boxplots").style("stroke-opacity", 1).style("fill-opacity", .75).delay(function(d, i) {
                    return i * duration / data.length;
                }).attr("transform", function(d, i) {
                    return "translate(" + (xScale(getX(d, i)) + .05 * xScale.rangeBand()) + ", 0)";
                }), boxplots.exit().remove(), boxEnter.each(function(d, i) {
                    var box = d3.select(this);
                    [ getWl, getWh ].forEach(function(f) {
                        if (void 0 !== f(d) && null !== f(d)) {
                            var key = f === getWl ? "low" : "high";
                            box.append("line").style("stroke", getColor(d) || color(d, i)).attr("class", "nv-boxplot-whisker nv-boxplot-" + key), 
                            box.append("line").style("stroke", getColor(d) || color(d, i)).attr("class", "nv-boxplot-tick nv-boxplot-" + key);
                        }
                    });
                });
                var box_width = function() {
                    return null === maxBoxWidth ? .9 * xScale.rangeBand() : Math.min(75, .9 * xScale.rangeBand());
                }, box_left = function() {
                    return .45 * xScale.rangeBand() - box_width() / 2;
                }, box_right = function() {
                    return .45 * xScale.rangeBand() + box_width() / 2;
                };
                [ getWl, getWh ].forEach(function(f) {
                    var key = f === getWl ? "low" : "high", endpoint = f === getWl ? getQ1 : getQ3;
                    boxplots.select("line.nv-boxplot-whisker.nv-boxplot-" + key).watchTransition(renderWatch, "nv-boxplot: boxplots").attr("x1", .45 * xScale.rangeBand()).attr("y1", function(d, i) {
                        return yScale(f(d));
                    }).attr("x2", .45 * xScale.rangeBand()).attr("y2", function(d, i) {
                        return yScale(endpoint(d));
                    }), boxplots.select("line.nv-boxplot-tick.nv-boxplot-" + key).watchTransition(renderWatch, "nv-boxplot: boxplots").attr("x1", box_left).attr("y1", function(d, i) {
                        return yScale(f(d));
                    }).attr("x2", box_right).attr("y2", function(d, i) {
                        return yScale(f(d));
                    });
                }), [ getWl, getWh ].forEach(function(f) {
                    var key = f === getWl ? "low" : "high";
                    boxEnter.selectAll(".nv-boxplot-" + key).on("mouseover", function(d, i, j) {
                        d3.select(this).classed("hover", !0), dispatch.elementMouseover({
                            series: {
                                key: f(d),
                                color: getColor(d) || color(d, j)
                            },
                            e: d3.event
                        });
                    }).on("mouseout", function(d, i, j) {
                        d3.select(this).classed("hover", !1), dispatch.elementMouseout({
                            series: {
                                key: f(d),
                                color: getColor(d) || color(d, j)
                            },
                            e: d3.event
                        });
                    }).on("mousemove", function(d, i) {
                        dispatch.elementMousemove({
                            e: d3.event
                        });
                    });
                }), boxEnter.append("rect").attr("class", "nv-boxplot-box").on("mouseover", function(d, i) {
                    d3.select(this).classed("hover", !0), dispatch.elementMouseover({
                        key: getX(d),
                        value: getX(d),
                        series: [ {
                            key: "Q3",
                            value: getQ3(d),
                            color: getColor(d) || color(d, i)
                        }, {
                            key: "Q2",
                            value: getQ2(d),
                            color: getColor(d) || color(d, i)
                        }, {
                            key: "Q1",
                            value: getQ1(d),
                            color: getColor(d) || color(d, i)
                        } ],
                        data: d,
                        index: i,
                        e: d3.event
                    });
                }).on("mouseout", function(d, i) {
                    d3.select(this).classed("hover", !1), dispatch.elementMouseout({
                        key: getX(d),
                        value: getX(d),
                        series: [ {
                            key: "Q3",
                            value: getQ3(d),
                            color: getColor(d) || color(d, i)
                        }, {
                            key: "Q2",
                            value: getQ2(d),
                            color: getColor(d) || color(d, i)
                        }, {
                            key: "Q1",
                            value: getQ1(d),
                            color: getColor(d) || color(d, i)
                        } ],
                        data: d,
                        index: i,
                        e: d3.event
                    });
                }).on("mousemove", function(d, i) {
                    dispatch.elementMousemove({
                        e: d3.event
                    });
                }), boxplots.select("rect.nv-boxplot-box").watchTransition(renderWatch, "nv-boxplot: boxes").attr("y", function(d, i) {
                    return yScale(getQ3(d));
                }).attr("width", box_width).attr("x", box_left).attr("height", function(d, i) {
                    return Math.abs(yScale(getQ3(d)) - yScale(getQ1(d))) || 1;
                }).style("fill", function(d, i) {
                    return getColor(d) || color(d, i);
                }).style("stroke", function(d, i) {
                    return getColor(d) || color(d, i);
                }), boxEnter.append("line").attr("class", "nv-boxplot-median"), boxplots.select("line.nv-boxplot-median").watchTransition(renderWatch, "nv-boxplot: boxplots line").attr("x1", box_left).attr("y1", function(d, i) {
                    return yScale(getQ2(d));
                }).attr("x2", box_right).attr("y2", function(d, i) {
                    return yScale(getQ2(d));
                });
                var outliers = boxplots.selectAll(".nv-boxplot-outlier").data(function(d) {
                    return getOlItems(d) || [];
                });
                outliers.enter().append("circle").style("fill", function(d, i, j) {
                    return getOlColor(d, i, j) || color(d, j);
                }).style("stroke", function(d, i, j) {
                    return getOlColor(d, i, j) || color(d, j);
                }).style("z-index", 9e3).on("mouseover", function(d, i, j) {
                    d3.select(this).classed("hover", !0), dispatch.elementMouseover({
                        series: {
                            key: getOlLabel(d, i, j),
                            color: getOlColor(d, i, j) || color(d, j)
                        },
                        e: d3.event
                    });
                }).on("mouseout", function(d, i, j) {
                    d3.select(this).classed("hover", !1), dispatch.elementMouseout({
                        series: {
                            key: getOlLabel(d, i, j),
                            color: getOlColor(d, i, j) || color(d, j)
                        },
                        e: d3.event
                    });
                }).on("mousemove", function(d, i) {
                    dispatch.elementMousemove({
                        e: d3.event
                    });
                }), outliers.attr("class", "nv-boxplot-outlier"), outliers.watchTransition(renderWatch, "nv-boxplot: nv-boxplot-outlier").attr("cx", .45 * xScale.rangeBand()).attr("cy", function(d, i, j) {
                    return yScale(getOlValue(d, i, j));
                }).attr("r", "3"), outliers.exit().remove(), xScale0 = xScale.copy(), yScale0 = yScale.copy();
            }), renderWatch.renderEnd("nv-boxplot immediate"), chart;
        }
        var xDomain, xRange, yDomain, yRange, xScale0, yScale0, margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, width = 730, height = 300, id = Math.floor(1e4 * Math.random()), xScale = d3.scale.ordinal(), yScale = d3.scale.linear(), getX = function(d) {
            return d.label;
        }, getQ1 = function(d) {
            return d.values.Q1;
        }, getQ2 = function(d) {
            return d.values.Q2;
        }, getQ3 = function(d) {
            return d.values.Q3;
        }, getWl = function(d) {
            return d.values.whisker_low;
        }, getWh = function(d) {
            return d.values.whisker_high;
        }, getColor = function(d) {
            return d.color;
        }, getOlItems = function(d) {
            return d.values.outliers;
        }, getOlValue = function(d, i, j) {
            return d;
        }, getOlLabel = function(d, i, j) {
            return d;
        }, getOlColor = function(d, i, j) {}, color = nv.utils.defaultColor(), container = null, dispatch = d3.dispatch("elementMouseover", "elementMouseout", "elementMousemove", "renderEnd"), duration = 250, maxBoxWidth = null, renderWatch = nv.utils.renderWatch(dispatch, duration);
        return chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            maxBoxWidth: {
                get: function() {
                    return maxBoxWidth;
                },
                set: function(_) {
                    maxBoxWidth = _;
                }
            },
            x: {
                get: function() {
                    return getX;
                },
                set: function(_) {
                    getX = _;
                }
            },
            q1: {
                get: function() {
                    return getQ1;
                },
                set: function(_) {
                    getQ1 = _;
                }
            },
            q2: {
                get: function() {
                    return getQ2;
                },
                set: function(_) {
                    getQ2 = _;
                }
            },
            q3: {
                get: function() {
                    return getQ3;
                },
                set: function(_) {
                    getQ3 = _;
                }
            },
            wl: {
                get: function() {
                    return getWl;
                },
                set: function(_) {
                    getWl = _;
                }
            },
            wh: {
                get: function() {
                    return getWh;
                },
                set: function(_) {
                    getWh = _;
                }
            },
            itemColor: {
                get: function() {
                    return getColor;
                },
                set: function(_) {
                    getColor = _;
                }
            },
            outliers: {
                get: function() {
                    return getOlItems;
                },
                set: function(_) {
                    getOlItems = _;
                }
            },
            outlierValue: {
                get: function() {
                    return getOlValue;
                },
                set: function(_) {
                    getOlValue = _;
                }
            },
            outlierLabel: {
                get: function() {
                    return getOlLabel;
                },
                set: function(_) {
                    getOlLabel = _;
                }
            },
            outlierColor: {
                get: function() {
                    return getOlColor;
                },
                set: function(_) {
                    getOlColor = _;
                }
            },
            xScale: {
                get: function() {
                    return xScale;
                },
                set: function(_) {
                    xScale = _;
                }
            },
            yScale: {
                get: function() {
                    return yScale;
                },
                set: function(_) {
                    yScale = _;
                }
            },
            xDomain: {
                get: function() {
                    return xDomain;
                },
                set: function(_) {
                    xDomain = _;
                }
            },
            yDomain: {
                get: function() {
                    return yDomain;
                },
                set: function(_) {
                    yDomain = _;
                }
            },
            xRange: {
                get: function() {
                    return xRange;
                },
                set: function(_) {
                    xRange = _;
                }
            },
            yRange: {
                get: function() {
                    return yRange;
                },
                set: function(_) {
                    yRange = _;
                }
            },
            id: {
                get: function() {
                    return id;
                },
                set: function(_) {
                    id = _;
                }
            },
            y: {
                get: function() {
                    return console.warn("BoxPlot 'y' chart option is deprecated. Please use model overrides instead."), 
                    {};
                },
                set: function(_) {
                    console.warn("BoxPlot 'y' chart option is deprecated. Please use model overrides instead.");
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration);
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.boxPlotChart = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), renderWatch.models(boxplot), showXAxis && renderWatch.models(xAxis), 
            showYAxis && renderWatch.models(yAxis), selection.each(function(data) {
                var container = d3.select(this);
                nv.utils.initSVG(container);
                var availableWidth = (width || parseInt(container.style("width")) || 960) - margin.left - margin.right, availableHeight = (height || parseInt(container.style("height")) || 400) - margin.top - margin.bottom;
                if (chart.update = function() {
                    dispatch.beforeUpdate(), container.transition().duration(duration).call(chart);
                }, chart.container = this, !data || !data.length) {
                    var noDataText = container.selectAll(".nv-noData").data([ noData ]);
                    return noDataText.enter().append("text").attr("class", "nvd3 nv-noData").attr("dy", "-.7em").style("text-anchor", "middle"), 
                    noDataText.attr("x", margin.left + availableWidth / 2).attr("y", margin.top + availableHeight / 2).text(function(d) {
                        return d;
                    }), chart;
                }
                container.selectAll(".nv-noData").remove(), x = boxplot.xScale(), y = boxplot.yScale().clamp(!0);
                var wrap = container.selectAll("g.nv-wrap.nv-boxPlotWithAxes").data([ data ]), gEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-boxPlotWithAxes").append("g"), defsEnter = gEnter.append("defs"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-x nv-axis"), gEnter.append("g").attr("class", "nv-y nv-axis").append("g").attr("class", "nv-zeroLine").append("line"), 
                gEnter.append("g").attr("class", "nv-barsWrap"), g.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), 
                rightAlignYAxis && g.select(".nv-y.nv-axis").attr("transform", "translate(" + availableWidth + ",0)"), 
                boxplot.width(availableWidth).height(availableHeight);
                var barsWrap = g.select(".nv-barsWrap").datum(data.filter(function(d) {
                    return !d.disabled;
                }));
                if (barsWrap.transition().call(boxplot), defsEnter.append("clipPath").attr("id", "nv-x-label-clip-" + boxplot.id()).append("rect"), 
                g.select("#nv-x-label-clip-" + boxplot.id() + " rect").attr("width", x.rangeBand() * (staggerLabels ? 2 : 1)).attr("height", 16).attr("x", -x.rangeBand() / (staggerLabels ? 1 : 2)), 
                showXAxis) {
                    xAxis.scale(x).ticks(nv.utils.calcTicksX(availableWidth / 100, data)).tickSize(-availableHeight, 0), 
                    g.select(".nv-x.nv-axis").attr("transform", "translate(0," + y.range()[0] + ")"), 
                    g.select(".nv-x.nv-axis").call(xAxis);
                    var xTicks = g.select(".nv-x.nv-axis").selectAll("g");
                    staggerLabels && xTicks.selectAll("text").attr("transform", function(d, i, j) {
                        return "translate(0," + (j % 2 === 0 ? "5" : "17") + ")";
                    });
                }
                showYAxis && (yAxis.scale(y).ticks(Math.floor(availableHeight / 36)).tickSize(-availableWidth, 0), 
                g.select(".nv-y.nv-axis").call(yAxis)), g.select(".nv-zeroLine line").attr("x1", 0).attr("x2", availableWidth).attr("y1", y(0)).attr("y2", y(0));
            }), renderWatch.renderEnd("nv-boxplot chart immediate"), chart;
        }
        var x, y, boxplot = nv.models.boxPlot(), xAxis = nv.models.axis(), yAxis = nv.models.axis(), margin = {
            top: 15,
            right: 10,
            bottom: 50,
            left: 60
        }, width = null, height = null, color = nv.utils.getColor(), showXAxis = !0, showYAxis = !0, rightAlignYAxis = !1, staggerLabels = !1, tooltip = nv.models.tooltip(), noData = "No Data Available.", dispatch = d3.dispatch("beforeUpdate", "renderEnd"), duration = 250;
        xAxis.orient("bottom").showMaxMin(!1).tickFormat(function(d) {
            return d;
        }), yAxis.orient(rightAlignYAxis ? "right" : "left").tickFormat(d3.format(",.1f")), 
        tooltip.duration(0);
        var renderWatch = nv.utils.renderWatch(dispatch, duration);
        return boxplot.dispatch.on("elementMouseover.tooltip", function(evt) {
            tooltip.data(evt).hidden(!1);
        }), boxplot.dispatch.on("elementMouseout.tooltip", function(evt) {
            tooltip.data(evt).hidden(!0);
        }), boxplot.dispatch.on("elementMousemove.tooltip", function(evt) {
            tooltip();
        }), chart.dispatch = dispatch, chart.boxplot = boxplot, chart.xAxis = xAxis, chart.yAxis = yAxis, 
        chart.tooltip = tooltip, chart.options = nv.utils.optionsFunc.bind(chart), chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            staggerLabels: {
                get: function() {
                    return staggerLabels;
                },
                set: function(_) {
                    staggerLabels = _;
                }
            },
            showXAxis: {
                get: function() {
                    return showXAxis;
                },
                set: function(_) {
                    showXAxis = _;
                }
            },
            showYAxis: {
                get: function() {
                    return showYAxis;
                },
                set: function(_) {
                    showYAxis = _;
                }
            },
            tooltipContent: {
                get: function() {
                    return tooltip;
                },
                set: function(_) {
                    tooltip = _;
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration), boxplot.duration(duration), xAxis.duration(duration), 
                    yAxis.duration(duration);
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_), boxplot.color(color);
                }
            },
            rightAlignYAxis: {
                get: function() {
                    return rightAlignYAxis;
                },
                set: function(_) {
                    rightAlignYAxis = _, yAxis.orient(_ ? "right" : "left");
                }
            }
        }), nv.utils.inheritOptions(chart, boxplot), nv.utils.initOptions(chart), chart;
    }, nv.models.bullet = function() {
        "use strict";
        function sortLabels(labels, values) {
            var lz = labels.slice();
            labels.sort(function(a, b) {
                var iA = lz.indexOf(a), iB = lz.indexOf(b);
                return d3.descending(values[iA], values[iB]);
            });
        }
        function chart(selection) {
            return selection.each(function(d, i) {
                var availableWidth = width - margin.left - margin.right, availableHeight = height - margin.top - margin.bottom;
                container = d3.select(this), nv.utils.initSVG(container);
                var rangez = ranges.call(this, d, i).slice(), markerz = markers.call(this, d, i).slice(), markerLinez = markerLines.call(this, d, i).slice(), measurez = measures.call(this, d, i).slice(), rangeLabelz = rangeLabels.call(this, d, i).slice(), markerLabelz = markerLabels.call(this, d, i).slice(), markerLineLabelz = markerLineLabels.call(this, d, i).slice(), measureLabelz = measureLabels.call(this, d, i).slice();
                sortLabels(rangeLabelz, rangez), sortLabels(markerLabelz, markerz), sortLabels(markerLineLabelz, markerLinez), 
                sortLabels(measureLabelz, measurez), rangez.sort(d3.descending), markerz.sort(d3.descending), 
                markerLinez.sort(d3.descending), measurez.sort(d3.descending);
                var x1 = d3.scale.linear().domain(d3.extent(d3.merge([ forceX, rangez ]))).range(reverse ? [ availableWidth, 0 ] : [ 0, availableWidth ]);
                this.__chart__ || d3.scale.linear().domain([ 0, 1 / 0 ]).range(x1.range());
                this.__chart__ = x1;
                for (var wrap = (d3.min(rangez), d3.max(rangez), rangez[1], container.selectAll("g.nv-wrap.nv-bullet").data([ d ])), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-bullet"), gEnter = wrapEnter.append("g"), g = wrap.select("g"), i = 0, il = rangez.length; i < il; i++) {
                    var rangeClassNames = "nv-range nv-range" + i;
                    i <= 2 && (rangeClassNames = rangeClassNames + " nv-range" + legacyRangeClassNames[i]), 
                    gEnter.append("rect").attr("class", rangeClassNames);
                }
                gEnter.append("rect").attr("class", "nv-measure"), wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                for (var w1 = function(d) {
                    return Math.abs(x1(d) - x1(0));
                }, xp1 = function(d) {
                    return x1(d < 0 ? d : 0);
                }, i = 0, il = rangez.length; i < il; i++) {
                    var range = rangez[i];
                    g.select("rect.nv-range" + i).datum(range).attr("height", availableHeight).transition().duration(duration).attr("width", w1(range)).attr("x", xp1(range));
                }
                g.select("rect.nv-measure").style("fill", color).attr("height", availableHeight / 3).attr("y", availableHeight / 3).on("mouseover", function() {
                    dispatch.elementMouseover({
                        value: measurez[0],
                        label: measureLabelz[0] || "Current",
                        color: d3.select(this).style("fill")
                    });
                }).on("mousemove", function() {
                    dispatch.elementMousemove({
                        value: measurez[0],
                        label: measureLabelz[0] || "Current",
                        color: d3.select(this).style("fill")
                    });
                }).on("mouseout", function() {
                    dispatch.elementMouseout({
                        value: measurez[0],
                        label: measureLabelz[0] || "Current",
                        color: d3.select(this).style("fill")
                    });
                }).transition().duration(duration).attr("width", measurez < 0 ? x1(0) - x1(measurez[0]) : x1(measurez[0]) - x1(0)).attr("x", xp1(measurez));
                var h3 = availableHeight / 6, markerData = markerz.map(function(marker, index) {
                    return {
                        value: marker,
                        label: markerLabelz[index]
                    };
                });
                gEnter.selectAll("path.nv-markerTriangle").data(markerData).enter().append("path").attr("class", "nv-markerTriangle").attr("d", "M0," + h3 + "L" + h3 + "," + -h3 + " " + -h3 + "," + -h3 + "Z").on("mouseover", function(d) {
                    dispatch.elementMouseover({
                        value: d.value,
                        label: d.label || "Previous",
                        color: d3.select(this).style("fill"),
                        pos: [ x1(d.value), availableHeight / 2 ]
                    });
                }).on("mousemove", function(d) {
                    dispatch.elementMousemove({
                        value: d.value,
                        label: d.label || "Previous",
                        color: d3.select(this).style("fill")
                    });
                }).on("mouseout", function(d, i) {
                    dispatch.elementMouseout({
                        value: d.value,
                        label: d.label || "Previous",
                        color: d3.select(this).style("fill")
                    });
                }), g.selectAll("path.nv-markerTriangle").data(markerData).transition().duration(duration).attr("transform", function(d) {
                    return "translate(" + x1(d.value) + "," + availableHeight / 2 + ")";
                });
                var markerLinesData = markerLinez.map(function(marker, index) {
                    return {
                        value: marker,
                        label: markerLineLabelz[index]
                    };
                });
                gEnter.selectAll("line.nv-markerLine").data(markerLinesData).enter().append("line").attr("cursor", "").attr("class", "nv-markerLine").attr("x1", function(d) {
                    return x1(d.value);
                }).attr("y1", "2").attr("x2", function(d) {
                    return x1(d.value);
                }).attr("y2", availableHeight - 2).on("mouseover", function(d) {
                    dispatch.elementMouseover({
                        value: d.value,
                        label: d.label || "Previous",
                        color: d3.select(this).style("fill"),
                        pos: [ x1(d.value), availableHeight / 2 ]
                    });
                }).on("mousemove", function(d) {
                    dispatch.elementMousemove({
                        value: d.value,
                        label: d.label || "Previous",
                        color: d3.select(this).style("fill")
                    });
                }).on("mouseout", function(d, i) {
                    dispatch.elementMouseout({
                        value: d.value,
                        label: d.label || "Previous",
                        color: d3.select(this).style("fill")
                    });
                }), g.selectAll("line.nv-markerLine").data(markerLinesData).transition().duration(duration).attr("x1", function(d) {
                    return x1(d.value);
                }).attr("x2", function(d) {
                    return x1(d.value);
                }), wrap.selectAll(".nv-range").on("mouseover", function(d, i) {
                    var label = rangeLabelz[i] || defaultRangeLabels[i];
                    dispatch.elementMouseover({
                        value: d,
                        label: label,
                        color: d3.select(this).style("fill")
                    });
                }).on("mousemove", function() {
                    dispatch.elementMousemove({
                        value: measurez[0],
                        label: measureLabelz[0] || "Previous",
                        color: d3.select(this).style("fill")
                    });
                }).on("mouseout", function(d, i) {
                    var label = rangeLabelz[i] || defaultRangeLabels[i];
                    dispatch.elementMouseout({
                        value: d,
                        label: label,
                        color: d3.select(this).style("fill")
                    });
                });
            }), chart;
        }
        var margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, orient = "left", reverse = !1, ranges = function(d) {
            return d.ranges;
        }, markers = function(d) {
            return d.markers ? d.markers : [];
        }, markerLines = function(d) {
            return d.markerLines ? d.markerLines : [ 0 ];
        }, measures = function(d) {
            return d.measures;
        }, rangeLabels = function(d) {
            return d.rangeLabels ? d.rangeLabels : [];
        }, markerLabels = function(d) {
            return d.markerLabels ? d.markerLabels : [];
        }, markerLineLabels = function(d) {
            return d.markerLineLabels ? d.markerLineLabels : [];
        }, measureLabels = function(d) {
            return d.measureLabels ? d.measureLabels : [];
        }, forceX = [ 0 ], width = 380, height = 30, container = null, tickFormat = null, color = nv.utils.getColor([ "#1f77b4" ]), dispatch = d3.dispatch("elementMouseover", "elementMouseout", "elementMousemove"), defaultRangeLabels = [ "Maximum", "Mean", "Minimum" ], legacyRangeClassNames = [ "Max", "Avg", "Min" ], duration = 1e3;
        return chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            ranges: {
                get: function() {
                    return ranges;
                },
                set: function(_) {
                    ranges = _;
                }
            },
            markers: {
                get: function() {
                    return markers;
                },
                set: function(_) {
                    markers = _;
                }
            },
            measures: {
                get: function() {
                    return measures;
                },
                set: function(_) {
                    measures = _;
                }
            },
            forceX: {
                get: function() {
                    return forceX;
                },
                set: function(_) {
                    forceX = _;
                }
            },
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            tickFormat: {
                get: function() {
                    return tickFormat;
                },
                set: function(_) {
                    tickFormat = _;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            orient: {
                get: function() {
                    return orient;
                },
                set: function(_) {
                    orient = _, reverse = "right" == orient || "bottom" == orient;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.bulletChart = function() {
        "use strict";
        function chart(selection) {
            return selection.each(function(d, i) {
                var container = d3.select(this);
                nv.utils.initSVG(container);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = height - margin.top - margin.bottom;
                if (chart.update = function() {
                    chart(selection);
                }, chart.container = this, !d || !ranges.call(this, d, i)) return nv.utils.noData(chart, container), 
                chart;
                container.selectAll(".nv-noData").remove();
                var rangez = ranges.call(this, d, i).slice().sort(d3.descending), markerz = markers.call(this, d, i).slice().sort(d3.descending), measurez = measures.call(this, d, i).slice().sort(d3.descending), wrap = container.selectAll("g.nv-wrap.nv-bulletChart").data([ d ]), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-bulletChart"), gEnter = wrapEnter.append("g"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-bulletWrap"), gEnter.append("g").attr("class", "nv-titles"), 
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var x1 = d3.scale.linear().domain([ 0, Math.max(rangez[0], markerz[0] || 0, measurez[0]) ]).range(reverse ? [ availableWidth, 0 ] : [ 0, availableWidth ]), x0 = this.__chart__ || d3.scale.linear().domain([ 0, 1 / 0 ]).range(x1.range());
                this.__chart__ = x1;
                var title = gEnter.select(".nv-titles").append("g").attr("text-anchor", "end").attr("transform", "translate(-6," + (height - margin.top - margin.bottom) / 2 + ")");
                title.append("text").attr("class", "nv-title").text(function(d) {
                    return d.title;
                }), title.append("text").attr("class", "nv-subtitle").attr("dy", "1em").text(function(d) {
                    return d.subtitle;
                }), bullet.width(availableWidth).height(availableHeight);
                var bulletWrap = g.select(".nv-bulletWrap");
                d3.transition(bulletWrap).call(bullet);
                var format = tickFormat || x1.tickFormat(availableWidth / 100), tick = g.selectAll("g.nv-tick").data(x1.ticks(ticks ? ticks : availableWidth / 50), function(d) {
                    return this.textContent || format(d);
                }), tickEnter = tick.enter().append("g").attr("class", "nv-tick").attr("transform", function(d) {
                    return "translate(" + x0(d) + ",0)";
                }).style("opacity", 1e-6);
                tickEnter.append("line").attr("y1", availableHeight).attr("y2", 7 * availableHeight / 6), 
                tickEnter.append("text").attr("text-anchor", "middle").attr("dy", "1em").attr("y", 7 * availableHeight / 6).text(format);
                var tickUpdate = d3.transition(tick).transition().duration(bullet.duration()).attr("transform", function(d) {
                    return "translate(" + x1(d) + ",0)";
                }).style("opacity", 1);
                tickUpdate.select("line").attr("y1", availableHeight).attr("y2", 7 * availableHeight / 6), 
                tickUpdate.select("text").attr("y", 7 * availableHeight / 6), d3.transition(tick.exit()).transition().duration(bullet.duration()).attr("transform", function(d) {
                    return "translate(" + x1(d) + ",0)";
                }).style("opacity", 1e-6).remove();
            }), d3.timer.flush(), chart;
        }
        var bullet = nv.models.bullet(), tooltip = nv.models.tooltip(), orient = "left", reverse = !1, margin = {
            top: 5,
            right: 40,
            bottom: 20,
            left: 120
        }, ranges = function(d) {
            return d.ranges;
        }, markers = function(d) {
            return d.markers ? d.markers : [];
        }, measures = function(d) {
            return d.measures;
        }, width = null, height = 55, tickFormat = null, ticks = null, noData = null, dispatch = d3.dispatch();
        return tooltip.duration(0).headerEnabled(!1), bullet.dispatch.on("elementMouseover.tooltip", function(evt) {
            evt.series = {
                key: evt.label,
                value: evt.value,
                color: evt.color
            }, tooltip.data(evt).hidden(!1);
        }), bullet.dispatch.on("elementMouseout.tooltip", function(evt) {
            tooltip.hidden(!0);
        }), bullet.dispatch.on("elementMousemove.tooltip", function(evt) {
            tooltip();
        }), chart.bullet = bullet, chart.dispatch = dispatch, chart.tooltip = tooltip, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            ranges: {
                get: function() {
                    return ranges;
                },
                set: function(_) {
                    ranges = _;
                }
            },
            markers: {
                get: function() {
                    return markers;
                },
                set: function(_) {
                    markers = _;
                }
            },
            measures: {
                get: function() {
                    return measures;
                },
                set: function(_) {
                    measures = _;
                }
            },
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            tickFormat: {
                get: function() {
                    return tickFormat;
                },
                set: function(_) {
                    tickFormat = _;
                }
            },
            ticks: {
                get: function() {
                    return ticks;
                },
                set: function(_) {
                    ticks = _;
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            orient: {
                get: function() {
                    return orient;
                },
                set: function(_) {
                    orient = _, reverse = "right" == orient || "bottom" == orient;
                }
            }
        }), nv.utils.inheritOptions(chart, bullet), nv.utils.initOptions(chart), chart;
    }, nv.models.candlestickBar = function() {
        "use strict";
        function chart(selection) {
            return selection.each(function(data) {
                container = d3.select(this);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin);
                nv.utils.initSVG(container);
                var barWidth = availableWidth / data[0].values.length * .45;
                x.domain(xDomain || d3.extent(data[0].values.map(getX).concat(forceX))), padData ? x.range(xRange || [ .5 * availableWidth / data[0].values.length, availableWidth * (data[0].values.length - .5) / data[0].values.length ]) : x.range(xRange || [ 5 + barWidth / 2, availableWidth - barWidth / 2 - 5 ]), 
                y.domain(yDomain || [ d3.min(data[0].values.map(getLow).concat(forceY)), d3.max(data[0].values.map(getHigh).concat(forceY)) ]).range(yRange || [ availableHeight, 0 ]), 
                x.domain()[0] === x.domain()[1] && (x.domain()[0] ? x.domain([ x.domain()[0] - .01 * x.domain()[0], x.domain()[1] + .01 * x.domain()[1] ]) : x.domain([ -1, 1 ])), 
                y.domain()[0] === y.domain()[1] && (y.domain()[0] ? y.domain([ y.domain()[0] + .01 * y.domain()[0], y.domain()[1] - .01 * y.domain()[1] ]) : y.domain([ -1, 1 ]));
                var wrap = d3.select(this).selectAll("g.nv-wrap.nv-candlestickBar").data([ data[0].values ]), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-candlestickBar"), defsEnter = wrapEnter.append("defs"), gEnter = wrapEnter.append("g"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-ticks"), wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), 
                container.on("click", function(d, i) {
                    dispatch.chartClick({
                        data: d,
                        index: i,
                        pos: d3.event,
                        id: id
                    });
                }), defsEnter.append("clipPath").attr("id", "nv-chart-clip-path-" + id).append("rect"), 
                wrap.select("#nv-chart-clip-path-" + id + " rect").attr("width", availableWidth).attr("height", availableHeight), 
                g.attr("clip-path", clipEdge ? "url(#nv-chart-clip-path-" + id + ")" : "");
                var ticks = wrap.select(".nv-ticks").selectAll(".nv-tick").data(function(d) {
                    return d;
                });
                ticks.exit().remove();
                var tickGroups = ticks.enter().append("g");
                ticks.attr("class", function(d, i, j) {
                    return (getOpen(d, i) > getClose(d, i) ? "nv-tick negative" : "nv-tick positive") + " nv-tick-" + j + "-" + i;
                });
                tickGroups.append("line").attr("class", "nv-candlestick-lines").attr("transform", function(d, i) {
                    return "translate(" + x(getX(d, i)) + ",0)";
                }).attr("x1", 0).attr("y1", function(d, i) {
                    return y(getHigh(d, i));
                }).attr("x2", 0).attr("y2", function(d, i) {
                    return y(getLow(d, i));
                }), tickGroups.append("rect").attr("class", "nv-candlestick-rects nv-bars").attr("transform", function(d, i) {
                    return "translate(" + (x(getX(d, i)) - barWidth / 2) + "," + (y(getY(d, i)) - (getOpen(d, i) > getClose(d, i) ? y(getClose(d, i)) - y(getOpen(d, i)) : 0)) + ")";
                }).attr("x", 0).attr("y", 0).attr("width", barWidth).attr("height", function(d, i) {
                    var open = getOpen(d, i), close = getClose(d, i);
                    return open > close ? y(close) - y(open) : y(open) - y(close);
                });
                ticks.select(".nv-candlestick-lines").transition().attr("transform", function(d, i) {
                    return "translate(" + x(getX(d, i)) + ",0)";
                }).attr("x1", 0).attr("y1", function(d, i) {
                    return y(getHigh(d, i));
                }).attr("x2", 0).attr("y2", function(d, i) {
                    return y(getLow(d, i));
                }), ticks.select(".nv-candlestick-rects").transition().attr("transform", function(d, i) {
                    return "translate(" + (x(getX(d, i)) - barWidth / 2) + "," + (y(getY(d, i)) - (getOpen(d, i) > getClose(d, i) ? y(getClose(d, i)) - y(getOpen(d, i)) : 0)) + ")";
                }).attr("x", 0).attr("y", 0).attr("width", barWidth).attr("height", function(d, i) {
                    var open = getOpen(d, i), close = getClose(d, i);
                    return open > close ? y(close) - y(open) : y(open) - y(close);
                });
            }), chart;
        }
        var container, xDomain, yDomain, xRange, yRange, margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, width = null, height = null, id = Math.floor(1e4 * Math.random()), x = d3.scale.linear(), y = d3.scale.linear(), getX = function(d) {
            return d.x;
        }, getY = function(d) {
            return d.y;
        }, getOpen = function(d) {
            return d.open;
        }, getClose = function(d) {
            return d.close;
        }, getHigh = function(d) {
            return d.high;
        }, getLow = function(d) {
            return d.low;
        }, forceX = [], forceY = [], padData = !1, clipEdge = !0, color = nv.utils.defaultColor(), interactive = !1, dispatch = d3.dispatch("stateChange", "changeState", "renderEnd", "chartClick", "elementClick", "elementDblClick", "elementMouseover", "elementMouseout", "elementMousemove");
        return chart.highlightPoint = function(pointIndex, isHoverOver) {
            chart.clearHighlights(), container.select(".nv-candlestickBar .nv-tick-0-" + pointIndex).classed("hover", isHoverOver);
        }, chart.clearHighlights = function() {
            container.select(".nv-candlestickBar .nv-tick.hover").classed("hover", !1);
        }, chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            xScale: {
                get: function() {
                    return x;
                },
                set: function(_) {
                    x = _;
                }
            },
            yScale: {
                get: function() {
                    return y;
                },
                set: function(_) {
                    y = _;
                }
            },
            xDomain: {
                get: function() {
                    return xDomain;
                },
                set: function(_) {
                    xDomain = _;
                }
            },
            yDomain: {
                get: function() {
                    return yDomain;
                },
                set: function(_) {
                    yDomain = _;
                }
            },
            xRange: {
                get: function() {
                    return xRange;
                },
                set: function(_) {
                    xRange = _;
                }
            },
            yRange: {
                get: function() {
                    return yRange;
                },
                set: function(_) {
                    yRange = _;
                }
            },
            forceX: {
                get: function() {
                    return forceX;
                },
                set: function(_) {
                    forceX = _;
                }
            },
            forceY: {
                get: function() {
                    return forceY;
                },
                set: function(_) {
                    forceY = _;
                }
            },
            padData: {
                get: function() {
                    return padData;
                },
                set: function(_) {
                    padData = _;
                }
            },
            clipEdge: {
                get: function() {
                    return clipEdge;
                },
                set: function(_) {
                    clipEdge = _;
                }
            },
            id: {
                get: function() {
                    return id;
                },
                set: function(_) {
                    id = _;
                }
            },
            interactive: {
                get: function() {
                    return interactive;
                },
                set: function(_) {
                    interactive = _;
                }
            },
            x: {
                get: function() {
                    return getX;
                },
                set: function(_) {
                    getX = _;
                }
            },
            y: {
                get: function() {
                    return getY;
                },
                set: function(_) {
                    getY = _;
                }
            },
            open: {
                get: function() {
                    return getOpen();
                },
                set: function(_) {
                    getOpen = _;
                }
            },
            close: {
                get: function() {
                    return getClose();
                },
                set: function(_) {
                    getClose = _;
                }
            },
            high: {
                get: function() {
                    return getHigh;
                },
                set: function(_) {
                    getHigh = _;
                }
            },
            low: {
                get: function() {
                    return getLow;
                },
                set: function(_) {
                    getLow = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 != _.top ? _.top : margin.top, margin.right = void 0 != _.right ? _.right : margin.right, 
                    margin.bottom = void 0 != _.bottom ? _.bottom : margin.bottom, margin.left = void 0 != _.left ? _.left : margin.left;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.cumulativeLineChart = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), renderWatch.models(lines), showXAxis && renderWatch.models(xAxis), 
            showYAxis && renderWatch.models(yAxis), selection.each(function(data) {
                function dragStart(d, i) {
                    d3.select(chart.container).style("cursor", "ew-resize");
                }
                function dragMove(d, i) {
                    index.x = d3.event.x, index.i = Math.round(dx.invert(index.x)), updateZero();
                }
                function dragEnd(d, i) {
                    d3.select(chart.container).style("cursor", "auto"), state.index = index.i, dispatch.stateChange(state);
                }
                function updateZero() {
                    indexLine.data([ index ]);
                    var oldDuration = chart.duration();
                    chart.duration(0), chart.update(), chart.duration(oldDuration);
                }
                var container = d3.select(this);
                nv.utils.initSVG(container), container.classed("nv-chart-" + id, !0);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin);
                if (chart.update = function() {
                    0 === duration ? container.call(chart) : container.transition().duration(duration).call(chart);
                }, chart.container = this, state.setter(stateSetter(data), chart.update).getter(stateGetter(data)).update(), 
                state.disabled = data.map(function(d) {
                    return !!d.disabled;
                }), !defaultState) {
                    var key;
                    defaultState = {};
                    for (key in state) state[key] instanceof Array ? defaultState[key] = state[key].slice(0) : defaultState[key] = state[key];
                }
                var indexDrag = d3.behavior.drag().on("dragstart", dragStart).on("drag", dragMove).on("dragend", dragEnd);
                if (!(data && data.length && data.filter(function(d) {
                    return d.values.length;
                }).length)) return nv.utils.noData(chart, container), chart;
                container.selectAll(".nv-noData").remove(), x = lines.xScale(), y = lines.yScale(), 
                dx.domain([ 0, data[0].values.length - 1 ]).range([ 0, availableWidth ]).clamp(!0);
                var data = indexify(index.i, data);
                "undefined" == typeof currentYDomain && (currentYDomain = getCurrentYDomain(data)), 
                rescaleY ? lines.yDomain(null) : (lines.yDomain(currentYDomain), lines.clipEdge(!0));
                var interactivePointerEvents = useInteractiveGuideline ? "none" : "all", wrap = container.selectAll("g.nv-wrap.nv-cumulativeLine").data([ data ]), gEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-cumulativeLine").append("g"), g = wrap.select("g");
                if (gEnter.append("g").attr("class", "nv-interactive"), gEnter.append("g").attr("class", "nv-x nv-axis").style("pointer-events", "none"), 
                gEnter.append("g").attr("class", "nv-y nv-axis"), gEnter.append("g").attr("class", "nv-background"), 
                gEnter.append("g").attr("class", "nv-linesWrap").style("pointer-events", interactivePointerEvents), 
                gEnter.append("g").attr("class", "nv-avgLinesWrap").style("pointer-events", "none"), 
                gEnter.append("g").attr("class", "nv-legendWrap"), gEnter.append("g").attr("class", "nv-controlsWrap"), 
                showLegend ? (legend.width(availableWidth), g.select(".nv-legendWrap").datum(data).call(legend), 
                marginTop || legend.height() === margin.top || (margin.top = legend.height(), availableHeight = nv.utils.availableHeight(height, container, margin)), 
                g.select(".nv-legendWrap").attr("transform", "translate(0," + -margin.top + ")")) : g.select(".nv-legendWrap").selectAll("*").remove(), 
                showControls) {
                    var controlsData = [ {
                        key: "Re-scale y-axis",
                        disabled: !rescaleY
                    } ];
                    controls.width(140).color([ "#444", "#444", "#444" ]).rightAlign(!1).margin({
                        top: 5,
                        right: 0,
                        bottom: 5,
                        left: 20
                    }), g.select(".nv-controlsWrap").datum(controlsData).attr("transform", "translate(0," + -margin.top + ")").call(controls);
                } else g.select(".nv-controlsWrap").selectAll("*").remove();
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), rightAlignYAxis && g.select(".nv-y.nv-axis").attr("transform", "translate(" + availableWidth + ",0)");
                var tempDisabled = data.filter(function(d) {
                    return d.tempDisabled;
                });
                wrap.select(".tempDisabled").remove(), tempDisabled.length && wrap.append("text").attr("class", "tempDisabled").attr("x", availableWidth / 2).attr("y", "-.71em").style("text-anchor", "end").text(tempDisabled.map(function(d) {
                    return d.key;
                }).join(", ") + " values cannot be calculated for this time period."), useInteractiveGuideline && (interactiveLayer.width(availableWidth).height(availableHeight).margin({
                    left: margin.left,
                    top: margin.top
                }).svgContainer(container).xScale(x), wrap.select(".nv-interactive").call(interactiveLayer)), 
                gEnter.select(".nv-background").append("rect"), g.select(".nv-background rect").attr("width", availableWidth).attr("height", availableHeight), 
                lines.y(function(d) {
                    return d.display.y;
                }).width(availableWidth).height(availableHeight).color(data.map(function(d, i) {
                    return d.color || color(d, i);
                }).filter(function(d, i) {
                    return !data[i].disabled && !data[i].tempDisabled;
                }));
                var linesWrap = g.select(".nv-linesWrap").datum(data.filter(function(d) {
                    return !d.disabled && !d.tempDisabled;
                }));
                linesWrap.call(lines), data.forEach(function(d, i) {
                    d.seriesIndex = i;
                });
                var avgLineData = data.filter(function(d) {
                    return !d.disabled && !!average(d);
                }), avgLines = g.select(".nv-avgLinesWrap").selectAll("line").data(avgLineData, function(d) {
                    return d.key;
                }), getAvgLineY = function(d) {
                    var yVal = y(average(d));
                    return yVal < 0 ? 0 : yVal > availableHeight ? availableHeight : yVal;
                };
                avgLines.enter().append("line").style("stroke-width", 2).style("stroke-dasharray", "10,10").style("stroke", function(d, i) {
                    return lines.color()(d, d.seriesIndex);
                }).attr("x1", 0).attr("x2", availableWidth).attr("y1", getAvgLineY).attr("y2", getAvgLineY), 
                avgLines.style("stroke-opacity", function(d) {
                    var yVal = y(average(d));
                    return yVal < 0 || yVal > availableHeight ? 0 : 1;
                }).attr("x1", 0).attr("x2", availableWidth).attr("y1", getAvgLineY).attr("y2", getAvgLineY), 
                avgLines.exit().remove();
                var indexLine = linesWrap.selectAll(".nv-indexLine").data([ index ]);
                indexLine.enter().append("rect").attr("class", "nv-indexLine").attr("width", 3).attr("x", -2).attr("fill", "red").attr("fill-opacity", .5).style("pointer-events", "all").call(indexDrag), 
                indexLine.attr("transform", function(d) {
                    return "translate(" + dx(d.i) + ",0)";
                }).attr("height", availableHeight), showXAxis && (xAxis.scale(x)._ticks(nv.utils.calcTicksX(availableWidth / 70, data)).tickSize(-availableHeight, 0), 
                g.select(".nv-x.nv-axis").attr("transform", "translate(0," + y.range()[0] + ")"), 
                g.select(".nv-x.nv-axis").call(xAxis)), showYAxis && (yAxis.scale(y)._ticks(nv.utils.calcTicksY(availableHeight / 36, data)).tickSize(-availableWidth, 0), 
                g.select(".nv-y.nv-axis").call(yAxis)), g.select(".nv-background rect").on("click", function() {
                    index.x = d3.mouse(this)[0], index.i = Math.round(dx.invert(index.x)), state.index = index.i, 
                    dispatch.stateChange(state), updateZero();
                }), lines.dispatch.on("elementClick", function(e) {
                    index.i = e.pointIndex, index.x = dx(index.i), state.index = index.i, dispatch.stateChange(state), 
                    updateZero();
                }), controls.dispatch.on("legendClick", function(d, i) {
                    d.disabled = !d.disabled, rescaleY = !d.disabled, state.rescaleY = rescaleY, rescaleY || (currentYDomain = getCurrentYDomain(data)), 
                    dispatch.stateChange(state), chart.update();
                }), legend.dispatch.on("stateChange", function(newState) {
                    for (var key in newState) state[key] = newState[key];
                    dispatch.stateChange(state), chart.update();
                }), interactiveLayer.dispatch.on("elementMousemove", function(e) {
                    lines.clearHighlights();
                    var singlePoint, pointIndex, pointXLocation, allData = [];
                    if (data.filter(function(series, i) {
                        return series.seriesIndex = i, !(series.disabled || series.tempDisabled);
                    }).forEach(function(series, i) {
                        pointIndex = nv.interactiveBisect(series.values, e.pointXValue, chart.x()), lines.highlightPoint(i, pointIndex, !0);
                        var point = series.values[pointIndex];
                        "undefined" != typeof point && ("undefined" == typeof singlePoint && (singlePoint = point), 
                        "undefined" == typeof pointXLocation && (pointXLocation = chart.xScale()(chart.x()(point, pointIndex))), 
                        allData.push({
                            key: series.key,
                            value: chart.y()(point, pointIndex),
                            color: color(series, series.seriesIndex)
                        }));
                    }), allData.length > 2) {
                        var yValue = chart.yScale().invert(e.mouseY), domainExtent = Math.abs(chart.yScale().domain()[0] - chart.yScale().domain()[1]), threshold = .03 * domainExtent, indexToHighlight = nv.nearestValueIndex(allData.map(function(d) {
                            return d.value;
                        }), yValue, threshold);
                        null !== indexToHighlight && (allData[indexToHighlight].highlight = !0);
                    }
                    var xValue = xAxis.tickFormat()(chart.x()(singlePoint, pointIndex), pointIndex);
                    interactiveLayer.tooltip.valueFormatter(function(d, i) {
                        return yAxis.tickFormat()(d);
                    }).data({
                        value: xValue,
                        series: allData
                    })(), interactiveLayer.renderGuideLine(pointXLocation);
                }), interactiveLayer.dispatch.on("elementMouseout", function(e) {
                    lines.clearHighlights();
                }), dispatch.on("changeState", function(e) {
                    "undefined" != typeof e.disabled && (data.forEach(function(series, i) {
                        series.disabled = e.disabled[i];
                    }), state.disabled = e.disabled), "undefined" != typeof e.index && (index.i = e.index, 
                    index.x = dx(index.i), state.index = e.index, indexLine.data([ index ])), "undefined" != typeof e.rescaleY && (rescaleY = e.rescaleY), 
                    chart.update();
                });
            }), renderWatch.renderEnd("cumulativeLineChart immediate"), chart;
        }
        function indexify(idx, data) {
            return indexifyYGetter || (indexifyYGetter = lines.y()), data.map(function(line, i) {
                if (!line.values) return line;
                var indexValue = line.values[idx];
                if (null == indexValue) return line;
                var v = indexifyYGetter(indexValue, idx);
                return Math.abs(v) < 1e-5 && !noErrorCheck ? (line.tempDisabled = !0, line) : (line.tempDisabled = !1, 
                line.values = line.values.map(function(point, pointIndex) {
                    return point.display = {
                        y: (indexifyYGetter(point, pointIndex) - v) / v
                    }, point;
                }), line);
            });
        }
        function getCurrentYDomain(data) {
            var seriesDomains = data.filter(function(series) {
                return !(series.disabled || series.tempDisabled);
            }).map(function(series, i) {
                return d3.extent(series.values, function(d) {
                    return d.display.y;
                });
            });
            return [ d3.min(seriesDomains, function(d) {
                return d[0];
            }), d3.max(seriesDomains, function(d) {
                return d[1];
            }) ];
        }
        var x, y, lines = nv.models.line(), xAxis = nv.models.axis(), yAxis = nv.models.axis(), legend = nv.models.legend(), controls = nv.models.legend(), interactiveLayer = nv.interactiveGuideline(), tooltip = nv.models.tooltip(), margin = {
            top: 30,
            right: 30,
            bottom: 50,
            left: 60
        }, marginTop = null, color = nv.utils.defaultColor(), width = null, height = null, showLegend = !0, showXAxis = !0, showYAxis = !0, rightAlignYAxis = !1, showControls = !0, useInteractiveGuideline = !1, rescaleY = !0, id = lines.id(), state = nv.utils.state(), defaultState = null, noData = null, average = function(d) {
            return d.average;
        }, dispatch = d3.dispatch("stateChange", "changeState", "renderEnd"), duration = 250, noErrorCheck = !1;
        state.index = 0, state.rescaleY = rescaleY, xAxis.orient("bottom").tickPadding(7), 
        yAxis.orient(rightAlignYAxis ? "right" : "left"), tooltip.valueFormatter(function(d, i) {
            return yAxis.tickFormat()(d, i);
        }).headerFormatter(function(d, i) {
            return xAxis.tickFormat()(d, i);
        }), controls.updateState(!1);
        var currentYDomain, dx = d3.scale.linear(), index = {
            i: 0,
            x: 0
        }, renderWatch = nv.utils.renderWatch(dispatch, duration), stateGetter = function(data) {
            return function() {
                return {
                    active: data.map(function(d) {
                        return !d.disabled;
                    }),
                    index: index.i,
                    rescaleY: rescaleY
                };
            };
        }, stateSetter = function(data) {
            return function(state) {
                void 0 !== state.index && (index.i = state.index), void 0 !== state.rescaleY && (rescaleY = state.rescaleY), 
                void 0 !== state.active && data.forEach(function(series, i) {
                    series.disabled = !state.active[i];
                });
            };
        };
        lines.dispatch.on("elementMouseover.tooltip", function(evt) {
            var point = {
                x: chart.x()(evt.point),
                y: chart.y()(evt.point),
                color: evt.point.color
            };
            evt.point = point, tooltip.data(evt).hidden(!1);
        }), lines.dispatch.on("elementMouseout.tooltip", function(evt) {
            tooltip.hidden(!0);
        });
        var indexifyYGetter = null;
        return chart.dispatch = dispatch, chart.lines = lines, chart.legend = legend, chart.controls = controls, 
        chart.xAxis = xAxis, chart.yAxis = yAxis, chart.interactiveLayer = interactiveLayer, 
        chart.state = state, chart.tooltip = tooltip, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            showControls: {
                get: function() {
                    return showControls;
                },
                set: function(_) {
                    showControls = _;
                }
            },
            showLegend: {
                get: function() {
                    return showLegend;
                },
                set: function(_) {
                    showLegend = _;
                }
            },
            average: {
                get: function() {
                    return average;
                },
                set: function(_) {
                    average = _;
                }
            },
            defaultState: {
                get: function() {
                    return defaultState;
                },
                set: function(_) {
                    defaultState = _;
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            showXAxis: {
                get: function() {
                    return showXAxis;
                },
                set: function(_) {
                    showXAxis = _;
                }
            },
            showYAxis: {
                get: function() {
                    return showYAxis;
                },
                set: function(_) {
                    showYAxis = _;
                }
            },
            noErrorCheck: {
                get: function() {
                    return noErrorCheck;
                },
                set: function(_) {
                    noErrorCheck = _;
                }
            },
            rescaleY: {
                get: function() {
                    return rescaleY;
                },
                set: function(_) {
                    rescaleY = _, chart.state.rescaleY = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    void 0 !== _.top && (margin.top = _.top, marginTop = _.top), margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_), legend.color(color);
                }
            },
            useInteractiveGuideline: {
                get: function() {
                    return useInteractiveGuideline;
                },
                set: function(_) {
                    useInteractiveGuideline = _, _ === !0 && (chart.interactive(!1), chart.useVoronoi(!1));
                }
            },
            rightAlignYAxis: {
                get: function() {
                    return rightAlignYAxis;
                },
                set: function(_) {
                    rightAlignYAxis = _, yAxis.orient(_ ? "right" : "left");
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, lines.duration(duration), xAxis.duration(duration), yAxis.duration(duration), 
                    renderWatch.reset(duration);
                }
            }
        }), nv.utils.inheritOptions(chart, lines), nv.utils.initOptions(chart), chart;
    }, nv.models.discreteBar = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), selection.each(function(data) {
                var availableWidth = width - margin.left - margin.right, availableHeight = height - margin.top - margin.bottom;
                container = d3.select(this), nv.utils.initSVG(container), data.forEach(function(series, i) {
                    series.values.forEach(function(point) {
                        point.series = i;
                    });
                });
                var seriesData = xDomain && yDomain ? [] : data.map(function(d) {
                    return d.values.map(function(d, i) {
                        return {
                            x: getX(d, i),
                            y: getY(d, i),
                            y0: d.y0
                        };
                    });
                });
                x.domain(xDomain || d3.merge(seriesData).map(function(d) {
                    return d.x;
                })).rangeBands(xRange || [ 0, availableWidth ], .1), y.domain(yDomain || d3.extent(d3.merge(seriesData).map(function(d) {
                    return d.y;
                }).concat(forceY))), showValues ? y.range(yRange || [ availableHeight - (y.domain()[0] < 0 ? 12 : 0), y.domain()[1] > 0 ? 12 : 0 ]) : y.range(yRange || [ availableHeight, 0 ]), 
                x0 = x0 || x, y0 = y0 || y.copy().range([ y(0), y(0) ]);
                var wrap = container.selectAll("g.nv-wrap.nv-discretebar").data([ data ]), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-discretebar"), gEnter = wrapEnter.append("g");
                wrap.select("g");
                gEnter.append("g").attr("class", "nv-groups"), wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var groups = wrap.select(".nv-groups").selectAll(".nv-group").data(function(d) {
                    return d;
                }, function(d) {
                    return d.key;
                });
                groups.enter().append("g").style("stroke-opacity", 1e-6).style("fill-opacity", 1e-6), 
                groups.exit().watchTransition(renderWatch, "discreteBar: exit groups").style("stroke-opacity", 1e-6).style("fill-opacity", 1e-6).remove(), 
                groups.attr("class", function(d, i) {
                    return "nv-group nv-series-" + i;
                }).classed("hover", function(d) {
                    return d.hover;
                }), groups.watchTransition(renderWatch, "discreteBar: groups").style("stroke-opacity", 1).style("fill-opacity", .75);
                var bars = groups.selectAll("g.nv-bar").data(function(d) {
                    return d.values;
                });
                bars.exit().remove();
                var barsEnter = bars.enter().append("g").attr("transform", function(d, i, j) {
                    return "translate(" + (x(getX(d, i)) + .05 * x.rangeBand()) + ", " + y(0) + ")";
                }).on("mouseover", function(d, i) {
                    d3.select(this).classed("hover", !0), dispatch.elementMouseover({
                        data: d,
                        index: i,
                        color: d3.select(this).style("fill")
                    });
                }).on("mouseout", function(d, i) {
                    d3.select(this).classed("hover", !1), dispatch.elementMouseout({
                        data: d,
                        index: i,
                        color: d3.select(this).style("fill")
                    });
                }).on("mousemove", function(d, i) {
                    dispatch.elementMousemove({
                        data: d,
                        index: i,
                        color: d3.select(this).style("fill")
                    });
                }).on("click", function(d, i) {
                    var element = this;
                    dispatch.elementClick({
                        data: d,
                        index: i,
                        color: d3.select(this).style("fill"),
                        event: d3.event,
                        element: element
                    }), d3.event.stopPropagation();
                }).on("dblclick", function(d, i) {
                    dispatch.elementDblClick({
                        data: d,
                        index: i,
                        color: d3.select(this).style("fill")
                    }), d3.event.stopPropagation();
                });
                barsEnter.append("rect").attr("height", 0).attr("width", .9 * x.rangeBand() / data.length), 
                showValues ? (barsEnter.append("text").attr("text-anchor", "middle"), bars.select("text").text(function(d, i) {
                    return valueFormat(getY(d, i));
                }).watchTransition(renderWatch, "discreteBar: bars text").attr("x", .9 * x.rangeBand() / 2).attr("y", function(d, i) {
                    return getY(d, i) < 0 ? y(getY(d, i)) - y(0) + 12 : -4;
                })) : bars.selectAll("text").remove(), bars.attr("class", function(d, i) {
                    return getY(d, i) < 0 ? "nv-bar negative" : "nv-bar positive";
                }).style("fill", function(d, i) {
                    return d.color || color(d, i);
                }).style("stroke", function(d, i) {
                    return d.color || color(d, i);
                }).select("rect").attr("class", rectClass).watchTransition(renderWatch, "discreteBar: bars rect").attr("width", .9 * x.rangeBand() / data.length), 
                bars.watchTransition(renderWatch, "discreteBar: bars").attr("transform", function(d, i) {
                    var left = x(getX(d, i)) + .05 * x.rangeBand(), top = getY(d, i) < 0 ? y(0) : y(0) - y(getY(d, i)) < 1 ? y(0) - 1 : y(getY(d, i));
                    return "translate(" + left + ", " + top + ")";
                }).select("rect").attr("height", function(d, i) {
                    return Math.max(Math.abs(y(getY(d, i)) - y(0)), 1);
                }), x0 = x.copy(), y0 = y.copy();
            }), renderWatch.renderEnd("discreteBar immediate"), chart;
        }
        var container, xDomain, yDomain, xRange, yRange, x0, y0, margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, width = 960, height = 500, id = Math.floor(1e4 * Math.random()), x = d3.scale.ordinal(), y = d3.scale.linear(), getX = function(d) {
            return d.x;
        }, getY = function(d) {
            return d.y;
        }, forceY = [ 0 ], color = nv.utils.defaultColor(), showValues = !1, valueFormat = d3.format(",.2f"), dispatch = d3.dispatch("chartClick", "elementClick", "elementDblClick", "elementMouseover", "elementMouseout", "elementMousemove", "renderEnd"), rectClass = "discreteBar", duration = 250, renderWatch = nv.utils.renderWatch(dispatch, duration);
        return chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            forceY: {
                get: function() {
                    return forceY;
                },
                set: function(_) {
                    forceY = _;
                }
            },
            showValues: {
                get: function() {
                    return showValues;
                },
                set: function(_) {
                    showValues = _;
                }
            },
            x: {
                get: function() {
                    return getX;
                },
                set: function(_) {
                    getX = _;
                }
            },
            y: {
                get: function() {
                    return getY;
                },
                set: function(_) {
                    getY = _;
                }
            },
            xScale: {
                get: function() {
                    return x;
                },
                set: function(_) {
                    x = _;
                }
            },
            yScale: {
                get: function() {
                    return y;
                },
                set: function(_) {
                    y = _;
                }
            },
            xDomain: {
                get: function() {
                    return xDomain;
                },
                set: function(_) {
                    xDomain = _;
                }
            },
            yDomain: {
                get: function() {
                    return yDomain;
                },
                set: function(_) {
                    yDomain = _;
                }
            },
            xRange: {
                get: function() {
                    return xRange;
                },
                set: function(_) {
                    xRange = _;
                }
            },
            yRange: {
                get: function() {
                    return yRange;
                },
                set: function(_) {
                    yRange = _;
                }
            },
            valueFormat: {
                get: function() {
                    return valueFormat;
                },
                set: function(_) {
                    valueFormat = _;
                }
            },
            id: {
                get: function() {
                    return id;
                },
                set: function(_) {
                    id = _;
                }
            },
            rectClass: {
                get: function() {
                    return rectClass;
                },
                set: function(_) {
                    rectClass = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration);
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.discreteBarChart = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), renderWatch.models(discretebar), showXAxis && renderWatch.models(xAxis), 
            showYAxis && renderWatch.models(yAxis), selection.each(function(data) {
                var container = d3.select(this);
                nv.utils.initSVG(container);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin);
                if (chart.update = function() {
                    dispatch.beforeUpdate(), container.transition().duration(duration).call(chart);
                }, chart.container = this, !(data && data.length && data.filter(function(d) {
                    return d.values.length;
                }).length)) return nv.utils.noData(chart, container), chart;
                container.selectAll(".nv-noData").remove(), x = discretebar.xScale(), y = discretebar.yScale().clamp(!0);
                var wrap = container.selectAll("g.nv-wrap.nv-discreteBarWithAxes").data([ data ]), gEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-discreteBarWithAxes").append("g"), defsEnter = gEnter.append("defs"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-x nv-axis"), gEnter.append("g").attr("class", "nv-y nv-axis").append("g").attr("class", "nv-zeroLine").append("line"), 
                gEnter.append("g").attr("class", "nv-barsWrap"), gEnter.append("g").attr("class", "nv-legendWrap"), 
                g.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), showLegend ? (legend.width(availableWidth), 
                g.select(".nv-legendWrap").datum(data).call(legend), marginTop || legend.height() === margin.top || (margin.top = legend.height(), 
                availableHeight = nv.utils.availableHeight(height, container, margin)), wrap.select(".nv-legendWrap").attr("transform", "translate(0," + -margin.top + ")")) : g.select(".nv-legendWrap").selectAll("*").remove(), 
                rightAlignYAxis && g.select(".nv-y.nv-axis").attr("transform", "translate(" + availableWidth + ",0)"), 
                discretebar.width(availableWidth).height(availableHeight);
                var barsWrap = g.select(".nv-barsWrap").datum(data.filter(function(d) {
                    return !d.disabled;
                }));
                if (barsWrap.transition().call(discretebar), defsEnter.append("clipPath").attr("id", "nv-x-label-clip-" + discretebar.id()).append("rect"), 
                g.select("#nv-x-label-clip-" + discretebar.id() + " rect").attr("width", x.rangeBand() * (staggerLabels ? 2 : 1)).attr("height", 16).attr("x", -x.rangeBand() / (staggerLabels ? 1 : 2)), 
                showXAxis) {
                    xAxis.scale(x)._ticks(nv.utils.calcTicksX(availableWidth / 100, data)).tickSize(-availableHeight, 0), 
                    g.select(".nv-x.nv-axis").attr("transform", "translate(0," + (y.range()[0] + (discretebar.showValues() && y.domain()[0] < 0 ? 16 : 0)) + ")"), 
                    g.select(".nv-x.nv-axis").call(xAxis);
                    var xTicks = g.select(".nv-x.nv-axis").selectAll("g");
                    staggerLabels && xTicks.selectAll("text").attr("transform", function(d, i, j) {
                        return "translate(0," + (j % 2 == 0 ? "5" : "17") + ")";
                    }), rotateLabels && xTicks.selectAll(".tick text").attr("transform", "rotate(" + rotateLabels + " 0,0)").style("text-anchor", rotateLabels > 0 ? "start" : "end"), 
                    wrapLabels && g.selectAll(".tick text").call(nv.utils.wrapTicks, chart.xAxis.rangeBand());
                }
                showYAxis && (yAxis.scale(y)._ticks(nv.utils.calcTicksY(availableHeight / 36, data)).tickSize(-availableWidth, 0), 
                g.select(".nv-y.nv-axis").call(yAxis)), g.select(".nv-zeroLine line").attr("x1", 0).attr("x2", rightAlignYAxis ? -availableWidth : availableWidth).attr("y1", y(0)).attr("y2", y(0));
            }), renderWatch.renderEnd("discreteBar chart immediate"), chart;
        }
        var x, y, discretebar = nv.models.discreteBar(), xAxis = nv.models.axis(), yAxis = nv.models.axis(), legend = nv.models.legend(), tooltip = nv.models.tooltip(), margin = {
            top: 15,
            right: 10,
            bottom: 50,
            left: 60
        }, marginTop = null, width = null, height = null, color = nv.utils.getColor(), showLegend = !1, showXAxis = !0, showYAxis = !0, rightAlignYAxis = !1, staggerLabels = !1, wrapLabels = !1, rotateLabels = 0, noData = null, dispatch = d3.dispatch("beforeUpdate", "renderEnd"), duration = 250;
        xAxis.orient("bottom").showMaxMin(!1).tickFormat(function(d) {
            return d;
        }), yAxis.orient(rightAlignYAxis ? "right" : "left").tickFormat(d3.format(",.1f")), 
        tooltip.duration(0).headerEnabled(!1).valueFormatter(function(d, i) {
            return yAxis.tickFormat()(d, i);
        }).keyFormatter(function(d, i) {
            return xAxis.tickFormat()(d, i);
        });
        var renderWatch = nv.utils.renderWatch(dispatch, duration);
        return discretebar.dispatch.on("elementMouseover.tooltip", function(evt) {
            evt.series = {
                key: chart.x()(evt.data),
                value: chart.y()(evt.data),
                color: evt.color
            }, tooltip.data(evt).hidden(!1);
        }), discretebar.dispatch.on("elementMouseout.tooltip", function(evt) {
            tooltip.hidden(!0);
        }), discretebar.dispatch.on("elementMousemove.tooltip", function(evt) {
            tooltip();
        }), chart.dispatch = dispatch, chart.discretebar = discretebar, chart.legend = legend, 
        chart.xAxis = xAxis, chart.yAxis = yAxis, chart.tooltip = tooltip, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            showLegend: {
                get: function() {
                    return showLegend;
                },
                set: function(_) {
                    showLegend = _;
                }
            },
            staggerLabels: {
                get: function() {
                    return staggerLabels;
                },
                set: function(_) {
                    staggerLabels = _;
                }
            },
            rotateLabels: {
                get: function() {
                    return rotateLabels;
                },
                set: function(_) {
                    rotateLabels = _;
                }
            },
            wrapLabels: {
                get: function() {
                    return wrapLabels;
                },
                set: function(_) {
                    wrapLabels = !!_;
                }
            },
            showXAxis: {
                get: function() {
                    return showXAxis;
                },
                set: function(_) {
                    showXAxis = _;
                }
            },
            showYAxis: {
                get: function() {
                    return showYAxis;
                },
                set: function(_) {
                    showYAxis = _;
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    void 0 !== _.top && (margin.top = _.top, marginTop = _.top), margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration), discretebar.duration(duration), xAxis.duration(duration), 
                    yAxis.duration(duration);
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_), discretebar.color(color), legend.color(color);
                }
            },
            rightAlignYAxis: {
                get: function() {
                    return rightAlignYAxis;
                },
                set: function(_) {
                    rightAlignYAxis = _, yAxis.orient(_ ? "right" : "left");
                }
            }
        }), nv.utils.inheritOptions(chart, discretebar), nv.utils.initOptions(chart), chart;
    }, nv.models.distribution = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), selection.each(function(data) {
                var naxis = (width - ("x" === axis ? margin.left + margin.right : margin.top + margin.bottom), 
                "x" == axis ? "y" : "x"), container = d3.select(this);
                nv.utils.initSVG(container), scale0 = scale0 || scale;
                var wrap = container.selectAll("g.nv-distribution").data([ data ]), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-distribution"), g = (wrapEnter.append("g"), 
                wrap.select("g"));
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var distWrap = g.selectAll("g.nv-dist").data(function(d) {
                    return d;
                }, function(d) {
                    return d.key;
                });
                distWrap.enter().append("g"), distWrap.attr("class", function(d, i) {
                    return "nv-dist nv-series-" + i;
                }).style("stroke", function(d, i) {
                    return color(d, i);
                });
                var dist = distWrap.selectAll("line.nv-dist" + axis).data(function(d) {
                    return d.values;
                });
                dist.enter().append("line").attr(axis + "1", function(d, i) {
                    return scale0(getData(d, i));
                }).attr(axis + "2", function(d, i) {
                    return scale0(getData(d, i));
                }), renderWatch.transition(distWrap.exit().selectAll("line.nv-dist" + axis), "dist exit").attr(axis + "1", function(d, i) {
                    return scale(getData(d, i));
                }).attr(axis + "2", function(d, i) {
                    return scale(getData(d, i));
                }).style("stroke-opacity", 0).remove(), dist.attr("class", function(d, i) {
                    return "nv-dist" + axis + " nv-dist" + axis + "-" + i;
                }).attr(naxis + "1", 0).attr(naxis + "2", size), renderWatch.transition(dist, "dist").attr(axis + "1", function(d, i) {
                    return scale(getData(d, i));
                }).attr(axis + "2", function(d, i) {
                    return scale(getData(d, i));
                }), scale0 = scale.copy();
            }), renderWatch.renderEnd("distribution immediate"), chart;
        }
        var scale0, margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, width = 400, size = 8, axis = "x", getData = function(d) {
            return d[axis];
        }, color = nv.utils.defaultColor(), scale = d3.scale.linear(), duration = 250, dispatch = d3.dispatch("renderEnd"), renderWatch = nv.utils.renderWatch(dispatch, duration);
        return chart.options = nv.utils.optionsFunc.bind(chart), chart.dispatch = dispatch, 
        chart.margin = function(_) {
            return arguments.length ? (margin.top = "undefined" != typeof _.top ? _.top : margin.top, 
            margin.right = "undefined" != typeof _.right ? _.right : margin.right, margin.bottom = "undefined" != typeof _.bottom ? _.bottom : margin.bottom, 
            margin.left = "undefined" != typeof _.left ? _.left : margin.left, chart) : margin;
        }, chart.width = function(_) {
            return arguments.length ? (width = _, chart) : width;
        }, chart.axis = function(_) {
            return arguments.length ? (axis = _, chart) : axis;
        }, chart.size = function(_) {
            return arguments.length ? (size = _, chart) : size;
        }, chart.getData = function(_) {
            return arguments.length ? (getData = d3.functor(_), chart) : getData;
        }, chart.scale = function(_) {
            return arguments.length ? (scale = _, chart) : scale;
        }, chart.color = function(_) {
            return arguments.length ? (color = nv.utils.getColor(_), chart) : color;
        }, chart.duration = function(_) {
            return arguments.length ? (duration = _, renderWatch.reset(duration), chart) : duration;
        }, chart;
    }, nv.models.distroPlot = function() {
        "use strict";
        function select_sigma(x) {
            var sorted = x.sort(d3.ascending), normalize = 1.349, IQR = (d3.quantile(sorted, .75) - d3.quantile(sorted, .25)) / normalize;
            return d3.min([ d3.deviation(sorted), IQR ]);
        }
        function calcBandwidth(x, type) {
            "undefined" == typeof type && (type = "scott");
            var A = select_sigma(x), n = x.length;
            return "scott" === type ? Math.pow(1.059 * A * n, -.2) : Math.pow(.9 * A * n, -.2);
        }
        function prepData(dat) {
            function calcStats(g, xGroup) {
                var v = g.map(function(d) {
                    return colorGroup && allColorGroups.add(colorGroup(d)), getY(d);
                }).sort(d3.ascending), q1 = d3.quantile(v, .25), q3 = d3.quantile(v, .75), iqr = q3 - q1, upper = q3 + 1.5 * iqr, lower = q1 - 1.5 * iqr, wl = {
                    iqr: d3.max([ d3.min(v), d3.min(v.filter(function(d) {
                        return d > lower;
                    })) ]),
                    minmax: d3.min(v),
                    stddev: d3.mean(v) - d3.deviation(v)
                }, wu = {
                    iqr: d3.min([ d3.max(v), d3.max(v.filter(function(d) {
                        return d < upper;
                    })) ]),
                    minmax: d3.max(v),
                    stddev: d3.mean(v) + d3.deviation(v)
                }, median = d3.median(v), mean = d3.mean(v), observations = [];
                if ("undefined" != typeof d3.beeswarm ? (observations = d3.beeswarm().data(g.map(function(e) {
                    return getY(e);
                })).radius(pointSize + 1).orientation("vertical").side("symmetric").distributeOn(function(e) {
                    return yScale(e);
                }).arrange(), observations.map(function(e, i) {
                    e.key = xGroup, e.object_constancy = g[i].object_constancy, e.isOutlier = e.datum < wl.iqr || e.datum > wu.iqr, 
                    e.isOutlierStdDev = e.datum < wl.stddev || e.datum > wu.stddev, e.randX = Math.random() * jitter * (1 == Math.floor(2 * Math.random()) ? 1 : -1);
                })) : v.forEach(function(e, i) {
                    observations.push({
                        object_constancy: e.object_constancy,
                        datum: e,
                        key: xGroup,
                        isOutlier: e < wl.iqr || e > wu.iqr,
                        isOutlierStdDev: e < wl.stddev || e > wu.stddev,
                        randX: Math.random() * jitter * (1 == Math.floor(2 * Math.random()) ? 1 : -1)
                    });
                }), isNaN(parseFloat(bandwidth))) {
                    var bandwidthCalc;
                    bandwidthCalc = [ "scott", "silverman" ].indexOf(bandwidth) != -1 ? calcBandwidth(v, bandwidth) : calcBandwidth(v);
                }
                var kde = kernelDensityEstimator(eKernel(bandwidthCalc), yScale.ticks(resolution)), kdeDat = clampViolin ? clampViolinKDE(kde(v), d3.extent(v)) : kde(v), tmpScale = d3.scale.linear().domain([ 0, d3.max(kdeDat, function(e) {
                    return e.y;
                }) ]).clamp(!0);
                yVScale.push(tmpScale);
                var reformat = {
                    count: v.length,
                    num_outlier: observations.filter(function(e) {
                        return e.isOutlier;
                    }).length,
                    sum: d3.sum(v),
                    mean: mean,
                    q1: q1,
                    q2: median,
                    q3: q3,
                    wl: wl,
                    wu: wu,
                    iqr: iqr,
                    min: d3.min(v),
                    max: d3.max(v),
                    dev: d3.deviation(v),
                    observations: observations,
                    key: xGroup,
                    kde: kdeDat,
                    notch: 1.57 * iqr / Math.sqrt(v.length)
                };
                return colorGroup && reformatDatFlat.push({
                    key: xGroup,
                    values: reformat
                }), reformat;
            }
            dat.forEach(function(d, i) {
                d.object_constancy = i + "_" + getY(d) + "_" + getX(d);
            });
            var formatted;
            if (colorGroup) {
                allColorGroups = d3.set();
                var tmp = d3.nest().key(function(d) {
                    return getX(d);
                }).key(function(d) {
                    return colorGroup(d);
                }).rollup(function(v) {
                    return calcStats(v, getX(v[0]));
                }).entries(dat);
                allColorGroups = allColorGroups.values();
                for (var xGroups = tmp.map(function(d) {
                    return d.key;
                }), allGroups = [], i = 0; i < xGroups.length; i++) for (var j = 0; j < allColorGroups.length; j++) allGroups.push(xGroups[i] + "_" + allColorGroups[j]);
                allColorGroups = allGroups, formatted = [], tmp.forEach(function(d) {
                    d.values.forEach(function(e) {
                        e.key = d.key + "_" + e.key;
                    }), formatted.push.apply(formatted, d.values);
                });
            } else formatted = d3.nest().key(function(d) {
                return getX(d);
            }).rollup(function(v, i) {
                return calcStats(v);
            }).entries(dat);
            return formatted;
        }
        function kernelDensityEstimator(kernel, X) {
            return function(sample) {
                return X.map(function(x) {
                    var y = d3.mean(sample, function(v) {
                        return kernel(x - v);
                    });
                    return {
                        x: x,
                        y: y
                    };
                });
            };
        }
        function clampViolinKDE(kde, extent) {
            if (extent[0] === extent[1]) return kde;
            var clamped = kde.reduce(function(res, d) {
                return d.x >= extent[0] && d.x <= extent[1] && res.push(d), res;
            }, []);
            return extent[0] < clamped[0].x && clamped.unshift({
                x: extent[0],
                y: clamped[0].y
            }), extent[1] > clamped[clamped.length - 1].x && clamped.push({
                x: extent[1],
                y: clamped[clamped.length - 1].y
            }), clamped;
        }
        function eKernel(scale) {
            return function(u) {
                return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
            };
        }
        function makeNotchBox(boxLeft, notchLeft, boxCenter, dat) {
            var boxPoints, y = "mean" == centralTendency ? getMean(dat) : getQ2(dat);
            return boxPoints = notchBox ? [ {
                x: boxCenter,
                y: yScale(getQ1(dat))
            }, {
                x: boxLeft,
                y: yScale(getQ1(dat))
            }, {
                x: boxLeft,
                y: yScale(getNl(dat))
            }, {
                x: notchLeft,
                y: yScale(y)
            }, {
                x: boxLeft,
                y: yScale(getNu(dat))
            }, {
                x: boxLeft,
                y: yScale(getQ3(dat))
            }, {
                x: boxCenter,
                y: yScale(getQ3(dat))
            } ] : [ {
                x: boxCenter,
                y: yScale(getQ1(dat))
            }, {
                x: boxLeft,
                y: yScale(getQ1(dat))
            }, {
                x: boxLeft,
                y: yScale(y)
            }, {
                x: boxLeft,
                y: yScale(y)
            }, {
                x: boxLeft,
                y: yScale(y)
            }, {
                x: boxLeft,
                y: yScale(getQ3(dat))
            }, {
                x: boxCenter,
                y: yScale(getQ3(dat))
            } ];
        }
        function isOutlier(d) {
            return "iqr" == whiskerDef && d.isOutlier || "stddev" == whiskerDef && d.isOutlierStdDev;
        }
        function chart(selection) {
            return renderWatch.reset(), selection.each(function(data) {
                availableWidth = width - margin.left - margin.right, availableHeight = height - margin.top - margin.bottom, 
                container = d3.select(this), nv.utils.initSVG(container), yScale.domain(yDomain || d3.extent(data.map(function(d) {
                    return getY(d);
                }))).nice().range(yRange || [ availableHeight, 0 ]), "undefined" == typeof reformatDat && (reformatDat = prepData(data)), 
                xScale.rangeBands(xRange || [ 0, availableWidth ], .1).domain(xDomain || colorGroup && !squash ? allColorGroups : reformatDat.map(function(d) {
                    return d.key;
                }));
                var wrap = container.selectAll("g.nv-wrap").data([ reformatDat ]);
                wrap.enter().append("g").attr("class", "nvd3 nv-wrap");
                wrap.watchTransition(renderWatch, "nv-wrap: wrap").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var areaEnter, distroplots = wrap.selectAll(".nv-distroplot-x-group").data(function(d) {
                    return d;
                });
                distroplots.each(function(d, i) {
                    d3.select(this).selectAll("line.nv-distroplot-middle").datum(d);
                }), areaEnter = distroplots.enter().append("g").attr("class", "nv-distroplot-x-group").style("stroke-opacity", 1e-6).style("fill-opacity", 1e-6).style("fill", function(d, i) {
                    return getColor(d) || color(d, i);
                }).style("stroke", function(d, i) {
                    return getColor(d) || color(d, i);
                }), distroplots.exit().remove();
                var rangeBand = function() {
                    return xScale.rangeBand();
                }, areaWidth = function() {
                    return d3.min([ maxBoxWidth, .9 * rangeBand() ]);
                }, areaCenter = function() {
                    return areaWidth() / 2;
                }, areaLeft = function() {
                    return areaCenter() - areaWidth() / 2;
                }, areaRight = function() {
                    return areaCenter() + areaWidth() / 2;
                }, tickLeft = function() {
                    return areaCenter() - areaWidth() / 5;
                }, tickRight = function() {
                    return areaCenter() + areaWidth() / 5;
                };
                areaEnter.attr("transform", function(d) {
                    return "translate(" + (xScale(d.key) + .5 * (rangeBand() - areaWidth())) + ", 0)";
                }), distroplots.watchTransition(renderWatch, "nv-distroplot-x-group: distroplots").style("stroke-opacity", 1).style("fill-opacity", .5).attr("transform", function(d) {
                    return "translate(" + (xScale(d.key) + .5 * (rangeBand() - areaWidth())) + ", 0)";
                }), yVScale.map(function(d) {
                    d.range([ areaWidth() / 2, 0 ]);
                }), plotType || (showOnlyOutliers = !1, observationType || (observationType = "random")), 
                areaEnter.each(function(d, i) {
                    var box = d3.select(this);
                    [ getWl, getWh ].forEach(function(f) {
                        var key = f === getWl ? "low" : "high";
                        box.append("line").style("opacity", function() {
                            return hideWhiskers ? "1" : "0";
                        }).attr("class", "nv-distroplot-whisker nv-distroplot-" + key), box.append("line").style("opacity", function() {
                            return hideWhiskers ? "0" : "1";
                        }).attr("class", "nv-distroplot-tick nv-distroplot-" + key);
                    });
                }), [ getWl, getWh ].forEach(function(f) {
                    var key = f === getWl ? "low" : "high", endpoint = f === getWl ? getQ1 : getQ3;
                    distroplots.select("line.nv-distroplot-whisker.nv-distroplot-" + key).watchTransition(renderWatch, "nv-distroplot-x-group: distroplots").attr("x1", areaCenter()).attr("y1", function(d) {
                        return yScale("violin" != plotType ? f(d) : getQ2(d));
                    }).attr("x2", areaCenter()).attr("y2", function(d) {
                        return yScale("box" == plotType ? endpoint(d) : getQ2(d));
                    }).style("opacity", function() {
                        return hideWhiskers ? "0" : "1";
                    }), distroplots.select("line.nv-distroplot-tick.nv-distroplot-" + key).watchTransition(renderWatch, "nv-distroplot-x-group: distroplots").attr("x1", function(d) {
                        return "violin" != plotType ? tickLeft() : areaCenter();
                    }).attr("y1", function(d, i) {
                        return yScale("violin" != plotType ? f(d) : getQ2(d));
                    }).attr("x2", function(d) {
                        return "violin" != plotType ? tickRight() : areaCenter();
                    }).attr("y2", function(d, i) {
                        return yScale("violin" != plotType ? f(d) : getQ2(d));
                    }).style("opacity", function() {
                        return hideWhiskers ? "0" : "1";
                    });
                }), [ getWl, getWh ].forEach(function(f) {
                    var key = f === getWl ? "low" : "high";
                    areaEnter.selectAll(".nv-distroplot-" + key).on("mouseover", function(d, i, j) {
                        d3.select(this.parentNode).selectAll("line.nv-distroplot-" + key).classed("hover", !0), 
                        dispatch.elementMouseover({
                            value: "low" == key ? "Lower whisker" : "Upper whisker",
                            series: {
                                key: f(d).toFixed(2),
                                color: getColor(d) || color(d, j)
                            },
                            e: d3.event
                        });
                    }).on("mouseout", function(d, i, j) {
                        d3.select(this.parentNode).selectAll("line.nv-distroplot-" + key).classed("hover", !1), 
                        dispatch.elementMouseout({
                            value: "low" == key ? "Lower whisker" : "Upper whisker",
                            series: {
                                key: f(d).toFixed(2),
                                color: getColor(d) || color(d, j)
                            },
                            e: d3.event
                        });
                    }).on("mousemove", function(d, i) {
                        dispatch.elementMousemove({
                            e: d3.event
                        });
                    });
                }), areaEnter.each(function(d, i) {
                    var violin = d3.select(this);
                    [ "left", "right" ].forEach(function(side) {
                        [ "line", "area" ].forEach(function(d) {
                            violin.append("path").attr("class", "nv-distribution-" + d + " nv-distribution-" + side).attr("transform", "rotate(90,0,0)   translate(0," + ("left" == side ? -areaWidth() : 0) + ")" + ("left" == side ? "" : " scale(1,-1)"));
                        });
                    }), areaEnter.selectAll(".nv-distribution-line").style("fill", "none"), areaEnter.selectAll(".nv-distribution-area").style("stroke", "none").style("opacity", .7);
                }), distroplots.each(function(d, i) {
                    var violin = d3.select(this), objData = "box" == plotType ? makeNotchBox(areaLeft(), tickLeft(), areaCenter(), d) : d.values.kde;
                    violin.selectAll("path").datum(objData);
                    var tmpScale = yVScale[i], interp = "box" == plotType ? "linear" : "basis";
                    "box" == plotType || "violin" == plotType ? [ "left", "right" ].forEach(function(side) {
                        distroplots.selectAll(".nv-distribution-line.nv-distribution-" + side).attr("d", d3.svg.line().x(function(e) {
                            return "box" == plotType ? e.y : yScale(e.x);
                        }).y(function(e) {
                            return "box" == plotType ? e.x : tmpScale(e.y);
                        }).interpolate(interp)).attr("transform", "rotate(90,0,0)   translate(0," + ("left" == side ? -areaWidth() : 0) + ")" + ("left" == side ? "" : " scale(1,-1)")).style("opacity", plotType ? "1" : "0"), 
                        distroplots.selectAll(".nv-distribution-area.nv-distribution-" + side).attr("d", d3.svg.area().x(function(e) {
                            return "box" == plotType ? e.y : yScale(e.x);
                        }).y(function(e) {
                            return "box" == plotType ? e.x : tmpScale(e.y);
                        }).y0(areaWidth() / 2).interpolate(interp)).attr("transform", "rotate(90,0,0)   translate(0," + ("left" == side ? -areaWidth() : 0) + ")" + ("left" == side ? "" : " scale(1,-1)")).style("opacity", plotType ? "1" : "0");
                    }) : (distroplots.selectAll(".nv-distribution-area").watchTransition(renderWatch, "nv-distribution-area: distroplots").style("opacity", plotType ? "1" : "0"), 
                    distroplots.selectAll(".nv-distribution-line").watchTransition(renderWatch, "nv-distribution-line: distroplots").style("opacity", plotType ? "1" : "0"));
                }), distroplots.selectAll("path").on("mouseover", function(d, i, j) {
                    d = d3.select(this.parentNode).datum(), d3.select(this).classed("hover", !0), dispatch.elementMouseover({
                        key: d.key,
                        value: "Group " + d.key + " stats",
                        series: [ {
                            key: "max",
                            value: getMax(d).toFixed(2),
                            color: getColor(d) || color(d, j)
                        }, {
                            key: "Q3",
                            value: getQ3(d).toFixed(2),
                            color: getColor(d) || color(d, j)
                        }, {
                            key: "Q2",
                            value: getQ2(d).toFixed(2),
                            color: getColor(d) || color(d, j)
                        }, {
                            key: "Q1",
                            value: getQ1(d).toFixed(2),
                            color: getColor(d) || color(d, j)
                        }, {
                            key: "min",
                            value: getMin(d).toFixed(2),
                            color: getColor(d) || color(d, j)
                        }, {
                            key: "mean",
                            value: getMean(d).toFixed(2),
                            color: getColor(d) || color(d, j)
                        }, {
                            key: "std. dev.",
                            value: getDev(d).toFixed(2),
                            color: getColor(d) || color(d, j)
                        }, {
                            key: "count",
                            value: d.values.count,
                            color: getColor(d) || color(d, j)
                        }, {
                            key: "num. outliers",
                            value: d.values.num_outlier,
                            color: getColor(d) || color(d, j)
                        } ],
                        data: d,
                        index: i,
                        e: d3.event
                    });
                }).on("mouseout", function(d, i, j) {
                    d3.select(this).classed("hover", !1), d = d3.select(this.parentNode).datum(), dispatch.elementMouseout({
                        key: d.key,
                        value: "Group " + d.key + " stats",
                        series: [ {
                            key: "max",
                            value: getMax(d).toFixed(2),
                            color: getColor(d) || color(d, j)
                        }, {
                            key: "Q3",
                            value: getQ3(d).toFixed(2),
                            color: getColor(d) || color(d, j)
                        }, {
                            key: "Q2",
                            value: getQ2(d).toFixed(2),
                            color: getColor(d) || color(d, j)
                        }, {
                            key: "Q1",
                            value: getQ1(d).toFixed(2),
                            color: getColor(d) || color(d, j)
                        }, {
                            key: "min",
                            value: getMin(d).toFixed(2),
                            color: getColor(d) || color(d, j)
                        }, {
                            key: "mean",
                            value: getMean(d).toFixed(2),
                            color: getColor(d) || color(d, j)
                        }, {
                            key: "std. dev.",
                            value: getDev(d).toFixed(2),
                            color: getColor(d) || color(d, j)
                        }, {
                            key: "count",
                            value: d.values.count,
                            color: getColor(d) || color(d, j)
                        }, {
                            key: "num. outliers",
                            value: d.values.num_outlier,
                            color: getColor(d) || color(d, j)
                        } ],
                        data: d,
                        index: i,
                        e: d3.event
                    });
                }).on("mousemove", function(d, i) {
                    dispatch.elementMousemove({
                        e: d3.event
                    });
                }), areaEnter.append("line").attr("class", function(d) {
                    return "nv-distroplot-middle";
                }), distroplots.selectAll("line.nv-distroplot-middle").watchTransition(renderWatch, "nv-distroplot-x-group: distroplots line").attr("x1", notchBox ? tickLeft : "violin" != plotType ? areaLeft : tickLeft()).attr("y1", function(d, i, j) {
                    return yScale("mean" == centralTendency ? getMean(d) : getQ2(d));
                }).attr("x2", notchBox ? tickRight : "violin" != plotType ? areaRight : tickRight()).attr("y2", function(d, i) {
                    return yScale("mean" == centralTendency ? getMean(d) : getQ2(d));
                }).style("opacity", centralTendency ? "1" : "0"), distroplots.selectAll(".nv-distroplot-middle").on("mouseover", function(d, i, j) {
                    if (0 != d3.select(this).style("opacity")) {
                        var fillColor = d3.select(this.parentNode).style("fill");
                        d3.select(this).classed("hover", !0), dispatch.elementMouseover({
                            value: "mean" == centralTendency ? "Mean" : "Median",
                            series: {
                                key: "mean" == centralTendency ? getMean(d).toFixed(2) : getQ2(d).toFixed(2),
                                color: fillColor
                            },
                            e: d3.event
                        });
                    }
                }).on("mouseout", function(d, i, j) {
                    if (0 != d3.select(this).style("opacity")) {
                        d3.select(this).classed("hover", !1);
                        var fillColor = d3.select(this.parentNode).style("fill");
                        dispatch.elementMouseout({
                            value: "mean" == centralTendency ? "Mean" : "Median",
                            series: {
                                key: "mean" == centralTendency ? getMean(d).toFixed(2) : getQ2(d).toFixed(2),
                                color: fillColor
                            },
                            e: d3.event
                        });
                    }
                }).on("mousemove", function(d, i) {
                    dispatch.elementMousemove({
                        e: d3.event
                    });
                });
                var obsWrap = distroplots.selectAll("g.nv-distroplot-observation").data(function(d) {
                    return getValsObj(d);
                }, function(d) {
                    return d.object_constancy;
                }), obsGroup = obsWrap.enter().append("g").attr("class", "nv-distroplot-observation");
                obsGroup.append("circle").style({
                    opacity: 0
                }), obsGroup.append("line").style("stroke-width", 1).style({
                    stroke: d3.rgb(85, 85, 85),
                    opacity: 0
                }), obsWrap.exit().remove(), obsWrap.attr("class", function(d) {
                    return "nv-distroplot-observation " + (isOutlier(d) && "box" == plotType ? "nv-distroplot-outlier" : "nv-distroplot-non-outlier");
                }), "line" == observationType ? distroplots.selectAll("g.nv-distroplot-observation line").watchTransition(renderWatch, "nv-distrolot-x-group: nv-distoplot-observation").attr("x1", tickLeft() + areaWidth() / 4).attr("x2", tickRight() - areaWidth() / 4).attr("y1", function(d) {
                    return yScale(d.datum);
                }).attr("y2", function(d) {
                    return yScale(d.datum);
                }) : (distroplots.selectAll("g.nv-distroplot-observation circle").watchTransition(renderWatch, "nv-distroplot: nv-distroplot-observation").attr("cy", function(d) {
                    return yScale(d.datum);
                }).attr("r", pointSize), distroplots.selectAll("g.nv-distroplot-observation circle").watchTransition(renderWatch, "nv-distroplot: nv-distroplot-observation").attr("cx", function(d) {
                    return "swarm" == observationType ? d.x + areaWidth() / 2 : "random" == observationType ? areaWidth() / 2 + d.randX * areaWidth() / 2 : areaWidth() / 2;
                })), observationType !== !1 && (showOnlyOutliers ? (distroplots.selectAll(".nv-distroplot-outlier " + ("line" == observationType ? "line" : "circle")).watchTransition(renderWatch, "nv-distroplot: nv-distroplot-observation").style("opacity", 1), 
                distroplots.selectAll(".nv-distroplot-non-outlier " + ("line" == observationType ? "line" : "circle")).watchTransition(renderWatch, "nv-distroplot: nv-distroplot-observation").style("opacity", 0)) : distroplots.selectAll("line" == observationType ? "line" : "circle").watchTransition(renderWatch, "nv-distroplot: nv-distroplot-observation").style("opacity", 1)), 
                distroplots.selectAll(".nv-distroplot-observation" + ("line" == observationType ? " circle" : " line")).watchTransition(renderWatch, "nv-distroplot: nv-distoplot-observation").style("opacity", 0), 
                distroplots.selectAll(".nv-distroplot-observation").on("mouseover", function(d, i, j) {
                    var pt = d3.select(this);
                    if (!showOnlyOutliers || "box" != plotType || isOutlier(d)) {
                        var fillColor = d3.select(this.parentNode).style("fill");
                        pt.classed("hover", !0), dispatch.elementMouseover({
                            value: "box" == plotType && isOutlier(d) ? "Outlier" : "Observation",
                            series: {
                                key: d.datum.toFixed(2),
                                color: fillColor
                            },
                            e: d3.event
                        });
                    }
                }).on("mouseout", function(d, i, j) {
                    var pt = d3.select(this), fillColor = d3.select(this.parentNode).style("fill");
                    pt.classed("hover", !1), dispatch.elementMouseout({
                        value: "box" == plotType && isOutlier(d) ? "Outlier" : "Observation",
                        series: {
                            key: d.datum.toFixed(2),
                            color: fillColor
                        },
                        e: d3.event
                    });
                }).on("mousemove", function(d, i) {
                    dispatch.elementMousemove({
                        e: d3.event
                    });
                });
            }), renderWatch.renderEnd("nv-distroplot-x-group immediate"), chart;
        }
        var plotType, xDomain, xRange, yDomain, yRange, reformatDat, availableWidth, availableHeight, margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, width = 960, height = 500, id = Math.floor(1e4 * Math.random()), xScale = d3.scale.ordinal(), yScale = d3.scale.linear(), getX = function(d) {
            return d.label;
        }, getY = function(d) {
            return d.value;
        }, getColor = function(d) {
            return d.color;
        }, getQ1 = function(d) {
            return d.values.q1;
        }, getQ2 = function(d) {
            return d.values.q2;
        }, getQ3 = function(d) {
            return d.values.q3;
        }, getNl = function(d) {
            return ("mean" == centralTendency ? getMean(d) : getQ2(d)) - d.values.notch;
        }, getNu = function(d) {
            return ("mean" == centralTendency ? getMean(d) : getQ2(d)) + d.values.notch;
        }, getMean = function(d) {
            return d.values.mean;
        }, getWl = function(d) {
            return d.values.wl[whiskerDef];
        }, getWh = function(d) {
            return d.values.wu[whiskerDef];
        }, getMin = function(d) {
            return d.values.min;
        }, getMax = function(d) {
            return d.values.max;
        }, getDev = function(d) {
            return d.values.dev;
        }, getValsObj = function(d) {
            return d.values.observations;
        }, observationType = !1, whiskerDef = "iqr", hideWhiskers = !1, notchBox = !1, colorGroup = !1, centralTendency = !1, showOnlyOutliers = !0, jitter = .7, squash = !0, bandwidth = "scott", clampViolin = !0, resolution = 50, pointSize = 3, color = nv.utils.defaultColor(), container = null, dispatch = d3.dispatch("elementMouseover", "elementMouseout", "elementMousemove", "renderEnd"), duration = 250, maxBoxWidth = null, allColorGroups = d3.set(), yVScale = [], reformatDatFlat = [], renderWatch = nv.utils.renderWatch(dispatch, duration);
        return chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            maxBoxWidth: {
                get: function() {
                    return maxBoxWidth;
                },
                set: function(_) {
                    maxBoxWidth = _;
                }
            },
            x: {
                get: function() {
                    return getX;
                },
                set: function(_) {
                    getX = _;
                }
            },
            y: {
                get: function() {
                    return getY;
                },
                set: function(_) {
                    getY = _;
                }
            },
            plotType: {
                get: function() {
                    return plotType;
                },
                set: function(_) {
                    plotType = _;
                }
            },
            observationType: {
                get: function() {
                    return observationType;
                },
                set: function(_) {
                    observationType = _;
                }
            },
            whiskerDef: {
                get: function() {
                    return whiskerDef;
                },
                set: function(_) {
                    whiskerDef = _;
                }
            },
            notchBox: {
                get: function() {
                    return notchBox;
                },
                set: function(_) {
                    notchBox = _;
                }
            },
            hideWhiskers: {
                get: function() {
                    return hideWhiskers;
                },
                set: function(_) {
                    hideWhiskers = _;
                }
            },
            colorGroup: {
                get: function() {
                    return colorGroup;
                },
                set: function(_) {
                    colorGroup = _;
                }
            },
            centralTendency: {
                get: function() {
                    return centralTendency;
                },
                set: function(_) {
                    centralTendency = _;
                }
            },
            bandwidth: {
                get: function() {
                    return bandwidth;
                },
                set: function(_) {
                    bandwidth = _;
                }
            },
            clampViolin: {
                get: function() {
                    return clampViolin;
                },
                set: function(_) {
                    clampViolin = _;
                }
            },
            resolution: {
                get: function() {
                    return resolution;
                },
                set: function(_) {
                    resolution = _;
                }
            },
            xScale: {
                get: function() {
                    return xScale;
                },
                set: function(_) {
                    xScale = _;
                }
            },
            yScale: {
                get: function() {
                    return yScale;
                },
                set: function(_) {
                    yScale = _;
                }
            },
            showOnlyOutliers: {
                get: function() {
                    return showOnlyOutliers;
                },
                set: function(_) {
                    showOnlyOutliers = _;
                }
            },
            jitter: {
                get: function() {
                    return jitter;
                },
                set: function(_) {
                    jitter = _;
                }
            },
            squash: {
                get: function() {
                    return squash;
                },
                set: function(_) {
                    squash = _;
                }
            },
            pointSize: {
                get: function() {
                    return pointSize;
                },
                set: function(_) {
                    pointSize = _;
                }
            },
            xDomain: {
                get: function() {
                    return xDomain;
                },
                set: function(_) {
                    xDomain = _;
                }
            },
            yDomain: {
                get: function() {
                    return yDomain;
                },
                set: function(_) {
                    yDomain = _;
                }
            },
            xRange: {
                get: function() {
                    return xRange;
                },
                set: function(_) {
                    xRange = _;
                }
            },
            yRange: {
                get: function() {
                    return yRange;
                },
                set: function(_) {
                    yRange = _;
                }
            },
            recalcData: {
                get: function() {
                    reformatDat = prepData(container.datum());
                }
            },
            itemColor: {
                get: function() {
                    return getColor;
                },
                set: function(_) {
                    getColor = _;
                }
            },
            id: {
                get: function() {
                    return id;
                },
                set: function(_) {
                    id = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration);
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.distroPlotChart = function() {
        "use strict";
        function dataHasChanged(d) {
            return !arraysEqual(d, dataCache) && (dataCache = JSON.parse(JSON.stringify(d)), 
            !0);
        }
        function arraysEqual(arr1, arr2) {
            if (arr1.length !== arr2.length) return !1;
            for (var i = arr1.length; i--; ) if ("object_constancy" in arr1[i] && delete arr1[i].object_constancy, 
            "object_constancy" in arr2[i] && delete arr2[i].object_constancy, !objectEquals(arr1[i], arr2[i])) return !1;
            return !0;
        }
        function objectEquals(a, b) {
            var aProps = Object.getOwnPropertyNames(a), bProps = Object.getOwnPropertyNames(b);
            if (aProps.length != bProps.length) return !1;
            for (var i = 0; i < aProps.length; i++) {
                var propName = aProps[i];
                if (a[propName] !== b[propName]) return !1;
            }
            return !0;
        }
        function chart(selection) {
            return renderWatch.reset(), renderWatch.models(distroplot), showXAxis && renderWatch.models(xAxis), 
            showYAxis && renderWatch.models(yAxis), selection.each(function(data) {
                var container = d3.select(this);
                nv.utils.initSVG(container);
                var availableWidth = (width || parseInt(container.style("width")) || 960) - margin.left - margin.right, availableHeight = (height || parseInt(container.style("height")) || 400) - margin.top - margin.bottom;
                if ("undefined" == typeof dataCache && (dataCache = JSON.parse(JSON.stringify(data))), 
                chart.update = function() {
                    dispatch.beforeUpdate();
                    var opts = distroplot.options();
                    (colorGroup0 !== opts.colorGroup() || x0 !== opts.x() || y0 !== opts.y() || bandwidth0 !== opts.bandwidth() || resolution0 !== opts.resolution() || clampViolin0 !== opts.clampViolin() || dataHasChanged(data)) && distroplot.recalcData(), 
                    container.transition().duration(duration).call(chart);
                }, chart.container = this, "function" != typeof d3.beeswarm && "swarm" == chart.options().observationType()) {
                    margin.left + availableWidth / 2;
                    return noData = 'Please include the library https://github.com/Kcnarf/d3-beeswarm to use "swarm".', 
                    nv.utils.noData(chart, container), chart;
                }
                if (!data || !data.length) return nv.utils.noData(chart, container), chart;
                container.selectAll(".nv-noData").remove(), x = distroplot.xScale(), y = distroplot.yScale().clamp(!0);
                var wrap = container.selectAll("g.nv-wrap.nv-distroPlot").data([ data ]), gEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-distroPlot").append("g"), defsEnter = gEnter.append("defs"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-x nv-axis"), gEnter.append("g").attr("class", "nv-y nv-axis").append("g").attr("class", "nv-zeroLine").append("line"), 
                gEnter.append("g").attr("class", "nv-distroWrap"), gEnter.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), 
                g.watchTransition(renderWatch, "nv-wrap: wrap").attr("transform", "translate(" + margin.left + "," + margin.top + ")"), 
                rightAlignYAxis && g.select(".nv-y.nv-axis").attr("transform", "translate(" + availableWidth + ",0)"), 
                distroplot.width(availableWidth).height(availableHeight);
                var distroWrap = g.select(".nv-distroWrap").datum(data);
                if (distroWrap.transition().call(distroplot), defsEnter.append("clipPath").attr("id", "nv-x-label-clip-" + distroplot.id()).append("rect"), 
                g.select("#nv-x-label-clip-" + distroplot.id() + " rect").attr("width", x.rangeBand() * (staggerLabels ? 2 : 1)).attr("height", 16).attr("x", -x.rangeBand() / (staggerLabels ? 1 : 2)), 
                showXAxis) {
                    xAxis.scale(x).ticks(nv.utils.calcTicksX(availableWidth / 100, data)).tickSize(-availableHeight, 0), 
                    g.select(".nv-x.nv-axis").attr("transform", "translate(0," + y.range()[0] + ")"), 
                    g.select(".nv-x.nv-axis").call(xAxis);
                    var xTicks = g.select(".nv-x.nv-axis").selectAll("g");
                    staggerLabels && xTicks.selectAll("text").attr("transform", function(d, i, j) {
                        return "translate(0," + (j % 2 === 0 ? "5" : "17") + ")";
                    });
                }
                showYAxis && (yAxis.scale(y).ticks(Math.floor(availableHeight / 36)).tickSize(-availableWidth, 0), 
                g.select(".nv-y.nv-axis").call(yAxis)), g.select(".nv-zeroLine line").attr("x1", 0).attr("x2", availableWidth).attr("y1", y(0)).attr("y2", y(0)), 
                colorGroup0 = distroplot.options().colorGroup(), x0 = distroplot.options().x(), 
                y0 = distroplot.options().y(), bandwidth0 = distroplot.options().bandwidth(), resolution0 = distroplot.options().resolution(), 
                clampViolin0 = distroplot.options().clampViolin();
            }), renderWatch.renderEnd("nv-distroplot chart immediate"), chart;
        }
        var x, y, distroplot = nv.models.distroPlot(), xAxis = nv.models.axis(), yAxis = nv.models.axis(), margin = {
            top: 25,
            right: 10,
            bottom: 40,
            left: 60
        }, width = null, height = null, color = nv.utils.getColor(), showXAxis = !0, showYAxis = !0, rightAlignYAxis = !1, staggerLabels = !1, xLabel = !1, yLabel = !1, tooltip = nv.models.tooltip(), noData = "No Data Available.", dispatch = d3.dispatch("stateChange", "beforeUpdate", "renderEnd"), duration = 500;
        xAxis.orient("bottom").showMaxMin(!1).tickFormat(function(d) {
            return d;
        }), yAxis.orient(rightAlignYAxis ? "right" : "left").tickFormat(d3.format(",.1f")), 
        tooltip.duration(0);
        var colorGroup0, x0, y0, resolution0, bandwidth0, clampViolin0, dataCache, renderWatch = nv.utils.renderWatch(dispatch, duration);
        margin.top;
        return distroplot.dispatch.on("elementMouseover.tooltip", function(evt) {
            tooltip.data(evt).hidden(!1);
        }), distroplot.dispatch.on("elementMouseout.tooltip", function(evt) {
            tooltip.data(evt).hidden(!0);
        }), distroplot.dispatch.on("elementMousemove.tooltip", function(evt) {
            tooltip();
        }), chart.dispatch = dispatch, chart.distroplot = distroplot, chart.xAxis = xAxis, 
        chart.yAxis = yAxis, chart.tooltip = tooltip, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            staggerLabels: {
                get: function() {
                    return staggerLabels;
                },
                set: function(_) {
                    staggerLabels = _;
                }
            },
            showXAxis: {
                get: function() {
                    return showXAxis;
                },
                set: function(_) {
                    showXAxis = _;
                }
            },
            showYAxis: {
                get: function() {
                    return showYAxis;
                },
                set: function(_) {
                    showYAxis = _;
                }
            },
            tooltipContent: {
                get: function() {
                    return tooltip;
                },
                set: function(_) {
                    tooltip = _;
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            defaultState: {
                get: function() {
                    return defaultState;
                },
                set: function(_) {
                    defaultState = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration), distroplot.duration(duration), xAxis.duration(duration), 
                    yAxis.duration(duration);
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_), distroplot.color(color);
                }
            },
            rightAlignYAxis: {
                get: function() {
                    return rightAlignYAxis;
                },
                set: function(_) {
                    rightAlignYAxis = _, yAxis.orient(_ ? "right" : "left");
                }
            },
            xLabel: {
                get: function() {
                    return xLabel;
                },
                set: function(_) {
                    xLabel = _, xAxis.axisLabel(xLabel);
                }
            },
            yLabel: {
                get: function() {
                    return yLabel;
                },
                set: function(_) {
                    yLabel = _, yAxis.axisLabel(yLabel);
                }
            }
        }), nv.utils.inheritOptions(chart, distroplot), nv.utils.initOptions(chart), chart;
    }, nv.models.focus = function(content) {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), renderWatch.models(content), showXAxis && renderWatch.models(xAxis), 
            showYAxis && renderWatch.models(yAxis), selection.each(function(data) {
                function resizePath(d) {
                    var e = +("e" == d), x = e ? 1 : -1, y = availableHeight / 3;
                    return "M" + .5 * x + "," + y + "A6,6 0 0 " + e + " " + 6.5 * x + "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + .5 * x + "," + 2 * y + "ZM" + 2.5 * x + "," + (y + 8) + "V" + (2 * y - 8) + "M" + 4.5 * x + "," + (y + 8) + "V" + (2 * y - 8);
                }
                function updateBrushBG() {
                    brush.empty() || brush.extent(brushExtent), brushBG.data([ brush.empty() ? x.domain() : brushExtent ]).each(function(d, i) {
                        var leftWidth = x(d[0]) - x.range()[0], rightWidth = availableWidth - x(d[1]);
                        d3.select(this).select(".left").attr("width", leftWidth < 0 ? 0 : leftWidth), d3.select(this).select(".right").attr("x", x(d[1])).attr("width", rightWidth < 0 ? 0 : rightWidth);
                    });
                }
                function onBrush(shouldDispatch) {
                    brushExtent = brush.empty() ? null : brush.extent();
                    var extent = brush.empty() ? x.domain() : brush.extent();
                    dispatch.brush({
                        extent: extent,
                        brush: brush
                    }), updateBrushBG(), shouldDispatch && dispatch.onBrush(extent);
                }
                var container = d3.select(this);
                nv.utils.initSVG(container);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = height - margin.top - margin.bottom;
                chart.update = function() {
                    0 === duration ? container.call(chart) : container.transition().duration(duration).call(chart);
                }, chart.container = this, x = content.xScale(), y = content.yScale();
                var wrap = container.selectAll("g.nv-focus").data([ data ]), gEnter = wrap.enter().append("g").attr("class", "nvd3 nv-focus").append("g"), g = wrap.select("g");
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), gEnter.append("g").attr("class", "nv-background").append("rect"), 
                gEnter.append("g").attr("class", "nv-x nv-axis"), gEnter.append("g").attr("class", "nv-y nv-axis"), 
                gEnter.append("g").attr("class", "nv-contentWrap"), gEnter.append("g").attr("class", "nv-brushBackground"), 
                gEnter.append("g").attr("class", "nv-x nv-brush"), rightAlignYAxis && g.select(".nv-y.nv-axis").attr("transform", "translate(" + availableWidth + ",0)"), 
                g.select(".nv-background rect").attr("width", availableWidth).attr("height", availableHeight), 
                content.width(availableWidth).height(availableHeight).color(data.map(function(d, i) {
                    return d.color || color(d, i);
                }).filter(function(d, i) {
                    return !data[i].disabled;
                }));
                var contentWrap = g.select(".nv-contentWrap").datum(data.filter(function(d) {
                    return !d.disabled;
                }));
                d3.transition(contentWrap).call(content), brush.x(x).on("brush", function() {
                    onBrush(syncBrushing);
                }), brush.on("brushend", function() {
                    syncBrushing || dispatch.onBrush(brush.empty() ? x.domain() : brush.extent());
                }), brushExtent && brush.extent(brushExtent);
                var brushBG = g.select(".nv-brushBackground").selectAll("g").data([ brushExtent || brush.extent() ]), brushBGenter = brushBG.enter().append("g");
                brushBGenter.append("rect").attr("class", "left").attr("x", 0).attr("y", 0).attr("height", availableHeight), 
                brushBGenter.append("rect").attr("class", "right").attr("x", 0).attr("y", 0).attr("height", availableHeight);
                var gBrush = g.select(".nv-x.nv-brush").call(brush);
                gBrush.selectAll("rect").attr("height", availableHeight), gBrush.selectAll(".resize").append("path").attr("d", resizePath), 
                onBrush(!0), g.select(".nv-background rect").attr("width", availableWidth).attr("height", availableHeight), 
                showXAxis && (xAxis.scale(x)._ticks(nv.utils.calcTicksX(availableWidth / 100, data)).tickSize(-availableHeight, 0), 
                g.select(".nv-x.nv-axis").attr("transform", "translate(0," + y.range()[0] + ")"), 
                d3.transition(g.select(".nv-x.nv-axis")).call(xAxis)), showYAxis && (yAxis.scale(y)._ticks(nv.utils.calcTicksY(availableHeight / 36, data)).tickSize(-availableWidth, 0), 
                d3.transition(g.select(".nv-y.nv-axis")).call(yAxis)), g.select(".nv-x.nv-axis").attr("transform", "translate(0," + y.range()[0] + ")");
            }), renderWatch.renderEnd("focus immediate"), chart;
        }
        var x, y, content = content || nv.models.line(), xAxis = nv.models.axis(), yAxis = nv.models.axis(), brush = d3.svg.brush(), margin = {
            top: 10,
            right: 0,
            bottom: 30,
            left: 0
        }, color = nv.utils.defaultColor(), width = null, height = 70, showXAxis = !0, showYAxis = !1, rightAlignYAxis = !1, brushExtent = null, duration = 250, dispatch = d3.dispatch("brush", "onBrush", "renderEnd"), syncBrushing = !0;
        content.interactive(!1), content.pointActive(function(d) {
            return !1;
        });
        var renderWatch = nv.utils.renderWatch(dispatch, duration);
        return chart.dispatch = dispatch, chart.content = content, chart.brush = brush, 
        chart.xAxis = xAxis, chart.yAxis = yAxis, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            showXAxis: {
                get: function() {
                    return showXAxis;
                },
                set: function(_) {
                    showXAxis = _;
                }
            },
            showYAxis: {
                get: function() {
                    return showYAxis;
                },
                set: function(_) {
                    showYAxis = _;
                }
            },
            brushExtent: {
                get: function() {
                    return brushExtent;
                },
                set: function(_) {
                    brushExtent = _;
                }
            },
            syncBrushing: {
                get: function() {
                    return syncBrushing;
                },
                set: function(_) {
                    syncBrushing = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration), content.duration(duration), xAxis.duration(duration), 
                    yAxis.duration(duration);
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_), content.color(color);
                }
            },
            interpolate: {
                get: function() {
                    return content.interpolate();
                },
                set: function(_) {
                    content.interpolate(_);
                }
            },
            xTickFormat: {
                get: function() {
                    return xAxis.tickFormat();
                },
                set: function(_) {
                    xAxis.tickFormat(_);
                }
            },
            yTickFormat: {
                get: function() {
                    return yAxis.tickFormat();
                },
                set: function(_) {
                    yAxis.tickFormat(_);
                }
            },
            x: {
                get: function() {
                    return content.x();
                },
                set: function(_) {
                    content.x(_);
                }
            },
            y: {
                get: function() {
                    return content.y();
                },
                set: function(_) {
                    content.y(_);
                }
            },
            rightAlignYAxis: {
                get: function() {
                    return rightAlignYAxis;
                },
                set: function(_) {
                    rightAlignYAxis = _, yAxis.orient(rightAlignYAxis ? "right" : "left");
                }
            }
        }), nv.utils.inheritOptions(chart, content), nv.utils.initOptions(chart), chart;
    }, nv.models.forceDirectedGraph = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), selection.each(function(data) {
                container = d3.select(this), nv.utils.initSVG(container);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin);
                if (container.attr("width", availableWidth).attr("height", availableHeight), !(data && data.links && data.nodes)) return nv.utils.noData(chart, container), 
                chart;
                container.selectAll(".nv-noData").remove(), container.selectAll("*").remove();
                var nodeFieldSet = new Set();
                data.nodes.forEach(function(node) {
                    var keys = Object.keys(node);
                    keys.forEach(function(key) {
                        nodeFieldSet.add(key);
                    });
                });
                var force = d3.layout.force().nodes(data.nodes).links(data.links).size([ availableWidth, availableHeight ]).linkStrength(linkStrength).friction(friction).linkDistance(linkDist).charge(charge).gravity(gravity).theta(theta).alpha(alpha).start(), link = container.selectAll(".link").data(data.links).enter().append("line").attr("class", "nv-force-link").style("stroke-width", function(d) {
                    return Math.sqrt(d.value);
                }), node = container.selectAll(".node").data(data.nodes).enter().append("g").attr("class", "nv-force-node").call(force.drag);
                node.append("circle").attr("r", radius).style("fill", function(d) {
                    return color(d);
                }).on("mouseover", function(evt) {
                    container.select(".nv-series-" + evt.seriesIndex + " .nv-distx-" + evt.pointIndex).attr("y1", evt.py), 
                    container.select(".nv-series-" + evt.seriesIndex + " .nv-disty-" + evt.pointIndex).attr("x2", evt.px);
                    var nodeColor = color(evt);
                    evt.series = [], nodeFieldSet.forEach(function(field) {
                        evt.series.push({
                            color: nodeColor,
                            key: field,
                            value: evt[field]
                        });
                    }), tooltip.data(evt).hidden(!1);
                }).on("mouseout", function(d) {
                    tooltip.hidden(!0);
                }), tooltip.headerFormatter(function(d) {
                    return "Node";
                }), linkExtras(link), nodeExtras(node), force.on("tick", function() {
                    link.attr("x1", function(d) {
                        return d.source.x;
                    }).attr("y1", function(d) {
                        return d.source.y;
                    }).attr("x2", function(d) {
                        return d.target.x;
                    }).attr("y2", function(d) {
                        return d.target.y;
                    }), node.attr("transform", function(d) {
                        return "translate(" + d.x + ", " + d.y + ")";
                    });
                });
            }), chart;
        }
        var margin = {
            top: 2,
            right: 0,
            bottom: 2,
            left: 0
        }, width = 400, height = 32, container = null, dispatch = d3.dispatch("renderEnd"), color = nv.utils.getColor([ "#000" ]), tooltip = nv.models.tooltip(), noData = null, linkStrength = .1, friction = .9, linkDist = 30, charge = -120, gravity = .1, theta = .8, alpha = .1, radius = 5, nodeExtras = function(nodes) {}, linkExtras = function(links) {}, getX = d3.functor(0), getY = d3.functor(0), renderWatch = nv.utils.renderWatch(dispatch);
        return chart.options = nv.utils.optionsFunc.bind(chart), chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            linkStrength: {
                get: function() {
                    return linkStrength;
                },
                set: function(_) {
                    linkStrength = _;
                }
            },
            friction: {
                get: function() {
                    return friction;
                },
                set: function(_) {
                    friction = _;
                }
            },
            linkDist: {
                get: function() {
                    return linkDist;
                },
                set: function(_) {
                    linkDist = _;
                }
            },
            charge: {
                get: function() {
                    return charge;
                },
                set: function(_) {
                    charge = _;
                }
            },
            gravity: {
                get: function() {
                    return gravity;
                },
                set: function(_) {
                    gravity = _;
                }
            },
            theta: {
                get: function() {
                    return theta;
                },
                set: function(_) {
                    theta = _;
                }
            },
            alpha: {
                get: function() {
                    return alpha;
                },
                set: function(_) {
                    alpha = _;
                }
            },
            radius: {
                get: function() {
                    return radius;
                },
                set: function(_) {
                    radius = _;
                }
            },
            x: {
                get: function() {
                    return getX;
                },
                set: function(_) {
                    getX = d3.functor(_);
                }
            },
            y: {
                get: function() {
                    return getY;
                },
                set: function(_) {
                    getY = d3.functor(_);
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            nodeExtras: {
                get: function() {
                    return nodeExtras;
                },
                set: function(_) {
                    nodeExtras = _;
                }
            },
            linkExtras: {
                get: function() {
                    return linkExtras;
                },
                set: function(_) {
                    linkExtras = _;
                }
            }
        }), chart.dispatch = dispatch, chart.tooltip = tooltip, nv.utils.initOptions(chart), 
        chart;
    }, nv.models.furiousLegend = function() {
        "use strict";
        function chart(selection) {
            function setTextColor(d, i) {
                return "furious" != vers ? "#000" : expanded ? d.disengaged ? color(d, i) : "#fff" : expanded ? void 0 : d.disabled ? color(d, i) : "#fff";
            }
            function setBGColor(d, i) {
                return expanded && "furious" == vers ? d.disengaged ? "#fff" : color(d, i) : d.disabled ? "#fff" : color(d, i);
            }
            return selection.each(function(data) {
                var availableWidth = width - margin.left - margin.right, container = d3.select(this);
                nv.utils.initSVG(container);
                var wrap = container.selectAll("g.nv-legend").data([ data ]), g = (wrap.enter().append("g").attr("class", "nvd3 nv-legend").append("g"), 
                wrap.select("g"));
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var seriesShape, series = g.selectAll(".nv-series").data(function(d) {
                    return "furious" != vers ? d : d.filter(function(n) {
                        return !!expanded || !n.disengaged;
                    });
                }), seriesEnter = series.enter().append("g").attr("class", "nv-series");
                if ("classic" == vers) seriesEnter.append("circle").style("stroke-width", 2).attr("class", "nv-legend-symbol").attr("r", 5), 
                seriesShape = series.select("circle"); else if ("furious" == vers) {
                    seriesEnter.append("rect").style("stroke-width", 2).attr("class", "nv-legend-symbol").attr("rx", 3).attr("ry", 3), 
                    seriesShape = series.select("rect"), seriesEnter.append("g").attr("class", "nv-check-box").property("innerHTML", '<path d="M0.5,5 L22.5,5 L22.5,26.5 L0.5,26.5 L0.5,5 Z" class="nv-box"></path><path d="M5.5,12.8618467 L11.9185089,19.2803556 L31,0.198864511" class="nv-check"></path>').attr("transform", "translate(-10,-8)scale(0.5)");
                    var seriesCheckbox = series.select(".nv-check-box");
                    seriesCheckbox.each(function(d, i) {
                        d3.select(this).selectAll("path").attr("stroke", setTextColor(d, i));
                    });
                }
                seriesEnter.append("text").attr("text-anchor", "start").attr("class", "nv-legend-text").attr("dy", ".32em").attr("dx", "8");
                var seriesText = series.select("text.nv-legend-text");
                series.on("mouseover", function(d, i) {
                    dispatch.legendMouseover(d, i);
                }).on("mouseout", function(d, i) {
                    dispatch.legendMouseout(d, i);
                }).on("click", function(d, i) {
                    dispatch.legendClick(d, i);
                    var data = series.data();
                    if (updateState) {
                        if ("classic" == vers) radioButtonMode ? (data.forEach(function(series) {
                            series.disabled = !0;
                        }), d.disabled = !1) : (d.disabled = !d.disabled, data.every(function(series) {
                            return series.disabled;
                        }) && data.forEach(function(series) {
                            series.disabled = !1;
                        })); else if ("furious" == vers) if (expanded) d.disengaged = !d.disengaged, d.userDisabled = void 0 == d.userDisabled ? !!d.disabled : d.userDisabled, 
                        d.disabled = d.disengaged || d.userDisabled; else if (!expanded) {
                            d.disabled = !d.disabled, d.userDisabled = d.disabled;
                            var engaged = data.filter(function(d) {
                                return !d.disengaged;
                            });
                            engaged.every(function(series) {
                                return series.userDisabled;
                            }) && data.forEach(function(series) {
                                series.disabled = series.userDisabled = !1;
                            });
                        }
                        dispatch.stateChange({
                            disabled: data.map(function(d) {
                                return !!d.disabled;
                            }),
                            disengaged: data.map(function(d) {
                                return !!d.disengaged;
                            })
                        });
                    }
                }).on("dblclick", function(d, i) {
                    if (("furious" != vers || !expanded) && (dispatch.legendDblclick(d, i), updateState)) {
                        var data = series.data();
                        data.forEach(function(series) {
                            series.disabled = !0, "furious" == vers && (series.userDisabled = series.disabled);
                        }), d.disabled = !1, "furious" == vers && (d.userDisabled = d.disabled), dispatch.stateChange({
                            disabled: data.map(function(d) {
                                return !!d.disabled;
                            })
                        });
                    }
                }), series.classed("nv-disabled", function(d) {
                    return d.userDisabled;
                }), series.exit().remove(), seriesText.attr("fill", setTextColor).text(function(d) {
                    return keyFormatter(getKey(d));
                });
                var versPadding;
                switch (vers) {
                  case "furious":
                    versPadding = 23;
                    break;

                  case "classic":
                    versPadding = 20;
                }
                if (align) {
                    var seriesWidths = [];
                    series.each(function(d, i) {
                        var legendText;
                        if (keyFormatter(getKey(d)) && keyFormatter(getKey(d)).length > maxKeyLength) {
                            var trimmedKey = keyFormatter(getKey(d)).substring(0, maxKeyLength);
                            legendText = d3.select(this).select("text").text(trimmedKey + "..."), d3.select(this).append("svg:title").text(keyFormatter(getKey(d)));
                        } else legendText = d3.select(this).select("text");
                        var nodeTextLength;
                        try {
                            if (nodeTextLength = legendText.node().getComputedTextLength(), nodeTextLength <= 0) throw Error();
                        } catch (e) {
                            nodeTextLength = nv.utils.calcApproxTextWidth(legendText);
                        }
                        seriesWidths.push(nodeTextLength + padding);
                    });
                    for (var seriesPerRow = 0, legendWidth = 0, columnWidths = []; legendWidth < availableWidth && seriesPerRow < seriesWidths.length; ) columnWidths[seriesPerRow] = seriesWidths[seriesPerRow], 
                    legendWidth += seriesWidths[seriesPerRow++];
                    for (0 === seriesPerRow && (seriesPerRow = 1); legendWidth > availableWidth && seriesPerRow > 1; ) {
                        columnWidths = [], seriesPerRow--;
                        for (var k = 0; k < seriesWidths.length; k++) seriesWidths[k] > (columnWidths[k % seriesPerRow] || 0) && (columnWidths[k % seriesPerRow] = seriesWidths[k]);
                        legendWidth = columnWidths.reduce(function(prev, cur, index, array) {
                            return prev + cur;
                        });
                    }
                    for (var xPositions = [], i = 0, curX = 0; i < seriesPerRow; i++) xPositions[i] = curX, 
                    curX += columnWidths[i];
                    series.attr("transform", function(d, i) {
                        return "translate(" + xPositions[i % seriesPerRow] + "," + (5 + Math.floor(i / seriesPerRow) * versPadding) + ")";
                    }), rightAlign ? g.attr("transform", "translate(" + (width - margin.right - legendWidth) + "," + margin.top + ")") : g.attr("transform", "translate(0," + margin.top + ")"), 
                    height = margin.top + margin.bottom + Math.ceil(seriesWidths.length / seriesPerRow) * versPadding;
                } else {
                    var xpos, ypos = 5, newxpos = 5, maxwidth = 0;
                    series.attr("transform", function(d, i) {
                        var length = d3.select(this).select("text").node().getComputedTextLength() + padding;
                        return xpos = newxpos, width < margin.left + margin.right + xpos + length && (newxpos = xpos = 5, 
                        ypos += versPadding), newxpos += length, newxpos > maxwidth && (maxwidth = newxpos), 
                        "translate(" + xpos + "," + ypos + ")";
                    }), g.attr("transform", "translate(" + (width - margin.right - maxwidth) + "," + margin.top + ")"), 
                    height = margin.top + margin.bottom + ypos + 15;
                }
                "furious" == vers && seriesShape.attr("width", function(d, i) {
                    return seriesText[0][i].getComputedTextLength() + 27;
                }).attr("height", 18).attr("y", -9).attr("x", -15), seriesShape.style("fill", setBGColor).style("stroke", function(d, i) {
                    return d.color || color(d, i);
                });
            }), chart;
        }
        var margin = {
            top: 5,
            right: 0,
            bottom: 5,
            left: 0
        }, width = 400, height = 20, getKey = function(d) {
            return d.key;
        }, keyFormatter = function(d) {
            return d;
        }, color = nv.utils.getColor(), maxKeyLength = 20, align = !0, padding = 28, rightAlign = !0, updateState = !0, radioButtonMode = !1, expanded = !1, dispatch = d3.dispatch("legendClick", "legendDblclick", "legendMouseover", "legendMouseout", "stateChange"), vers = "classic";
        return chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            key: {
                get: function() {
                    return getKey;
                },
                set: function(_) {
                    getKey = _;
                }
            },
            keyFormatter: {
                get: function() {
                    return keyFormatter;
                },
                set: function(_) {
                    keyFormatter = _;
                }
            },
            align: {
                get: function() {
                    return align;
                },
                set: function(_) {
                    align = _;
                }
            },
            rightAlign: {
                get: function() {
                    return rightAlign;
                },
                set: function(_) {
                    rightAlign = _;
                }
            },
            maxKeyLength: {
                get: function() {
                    return maxKeyLength;
                },
                set: function(_) {
                    maxKeyLength = _;
                }
            },
            padding: {
                get: function() {
                    return padding;
                },
                set: function(_) {
                    padding = _;
                }
            },
            updateState: {
                get: function() {
                    return updateState;
                },
                set: function(_) {
                    updateState = _;
                }
            },
            radioButtonMode: {
                get: function() {
                    return radioButtonMode;
                },
                set: function(_) {
                    radioButtonMode = _;
                }
            },
            expanded: {
                get: function() {
                    return expanded;
                },
                set: function(_) {
                    expanded = _;
                }
            },
            vers: {
                get: function() {
                    return vers;
                },
                set: function(_) {
                    vers = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.heatMap = function() {
        "use strict";
        function cellTextColor(bgColor) {
            if (highContrastText) {
                var rgbColor = d3.rgb(bgColor), r = rgbColor.r, g = rgbColor.g, b = rgbColor.b, yiq = (299 * r + 587 * g + 114 * b) / 1e3;
                return yiq >= 128 ? "#404040" : "#EDEDED";
            }
            return "black";
        }
        function getHeatmapValues(data, axis) {
            var vals = {};
            return data.forEach(function(cell, i) {
                "row" == axis ? (getIY(cell) in vals || (vals[getIY(cell)] = []), vals[getIY(cell)].push(getCellValue(cell))) : "col" == axis ? (getIX(cell) in vals || (vals[getIX(cell)] = []), 
                vals[getIX(cell)].push(getCellValue(cell))) : null == axis && (0 in vals || (vals[0] = []), 
                vals[0].push(getCellValue(cell)));
            }), vals;
        }
        function mad(dat) {
            var med = d3.median(dat), vals = dat.map(function(d) {
                return Math.abs(d - med);
            });
            return d3.median(vals);
        }
        function cellColor(d) {
            var colorVal = normalize ? getNorm(d) : getCellValue(d);
            return cellsAreNumeric() && !isNaN(colorVal) || "undefined" != typeof colorVal ? colorScale(colorVal) : missingDataColor;
        }
        function getColorDomain() {
            return cellsAreNumeric() ? normalize ? d3.extent(prepedData, function(d) {
                return getNorm(d);
            }) : d3.extent(uniqueColor) : cellsAreNumeric() ? void 0 : uniqueColor;
        }
        function cellsAreNumeric() {
            return "number" == typeof uniqueColor[0];
        }
        function normalizeData(dat) {
            var normTypes = [ "centerRow", "robustCenterRow", "centerScaleRow", "robustCenterScaleRow", "centerColumn", "robustCenterColumn", "centerScaleColumn", "robustCenterScaleColumn", "centerAll", "robustCenterAll", "centerScaleAll", "robustCenterScaleAll" ];
            if (normTypes.indexOf(normalize) != -1) {
                var scale = (Object.keys(uniqueX), Object.keys(uniqueY), !!normalize.includes("Scale")), agg = normalize.includes("robust") ? "median" : "mean", axis = normalize.includes("Row") ? "row" : normalize.includes("Column") ? "col" : null, vals = getHeatmapValues(dat, axis), stat = {}, dev = {};
                for (var key in vals) stat[key] = "mean" == agg ? d3.mean(vals[key]) : d3.median(vals[key]), 
                scale && (dev[key] = "mean" == agg ? d3.deviation(vals[key]) : mad(vals[key]));
                dat.forEach(function(cell, i) {
                    if (cellsAreNumeric()) {
                        if ("row" == axis) var key = getIY(cell); else if ("col" == axis) var key = getIX(cell); else if (null == axis) var key = 0;
                        var normVal = getCellValue(cell) - stat[key];
                        scale ? cell._cellPos.norm = normVal / dev[key] : cell._cellPos.norm = normVal;
                    } else cell._cellPos.norm = getCellValue(cell);
                });
            } else normalize = !1;
            return dat;
        }
        function prepData(data) {
            uniqueX = {}, uniqueY = {}, uniqueColor = [], uniqueXMeta = [], uniqueYMeta = [], 
            uniqueCells = [];
            var combo, warnings = [], sortedCells = {}, ix = 0, iy = 0, idx = 0;
            data.forEach(function(cell) {
                var valX = getX(cell), valY = getY(cell), valColor = getCellValue(cell);
                valX in uniqueX || (uniqueX[valX] = ix, ix++, sortedCells[valX] = {}, "function" == typeof xMeta && uniqueXMeta.push(xMeta(cell))), 
                valY in uniqueY || (uniqueY[valY] = iy, iy++, sortedCells[valX][valY] = {}, "function" == typeof yMeta && uniqueYMeta.push(yMeta(cell))), 
                uniqueColor.indexOf(valColor) == -1 && uniqueColor.push(valColor), cell._cellPos = {
                    idx: idx,
                    ix: uniqueX[valX],
                    iy: uniqueY[valY]
                }, idx++, combo = [ valX, valY ], isArrayInArray(uniqueCells, combo) ? warnings.indexOf(valX + valY) == -1 && (warnings.push(valX + valY), 
                console.warn("The row/column position " + valX + "/" + valY + " has multiple values; ensure each cell has only a single value.")) : (uniqueCells.push(combo), 
                sortedCells[valX][valY] = cell);
            }), uniqueColor = uniqueColor.sort();
            var reformatData = [];
            return Object.keys(uniqueY).forEach(function(j) {
                Object.keys(uniqueX).forEach(function(i) {
                    var cellVal = sortedCells[i][j];
                    if (cellVal) reformatData.push(cellVal); else {
                        var cellPos = {
                            idx: idx,
                            ix: uniqueX[i],
                            iy: uniqueY[j]
                        };
                        idx++, reformatData.push({
                            _cellPos: cellPos
                        });
                    }
                });
            }), normalize ? normalizeData(reformatData) : reformatData;
        }
        function isArrayInArray(arr, item) {
            var item_as_string = JSON.stringify(item), contains = arr.some(function(ele) {
                return JSON.stringify(ele) === item_as_string;
            });
            return contains;
        }
        function removeAllHoverClasses() {
            d3.selectAll(".cell-hover").classed("cell-hover", !1), d3.selectAll(".no-hover").classed("no-hover", !1), 
            d3.selectAll(".row-hover").classed("row-hover", !1), d3.selectAll(".column-hover").classed("column-hover", !1);
        }
        function sortObjByVals(obj) {
            return Object.keys(obj).sort(function(a, b) {
                return obj[a] - obj[b];
            });
        }
        function getKeyByValue(object, value) {
            return Object.keys(object).filter(function(key) {
                return object[key] === value;
            })[0];
        }
        function chart(selection) {
            return renderWatch.reset(), selection.each(function(data) {
                prepedData = prepData(data);
                var availableWidth = width - margin.left - margin.right, availableHeight = height - margin.top - margin.bottom;
                cellWidth = availableWidth / Object.keys(uniqueX).length, cellHeight = cellAspectRatio ? cellWidth / cellAspectRatio : availableHeight / Object.keys(uniqueY).length, 
                cellAspectRatio && (availableHeight = cellHeight * Object.keys(uniqueY).length - margin.top - margin.bottom), 
                container = d3.select(this), nv.utils.initSVG(container), xScale.domain(xDomain || sortObjByVals(uniqueX)).rangeBands(xRange || [ 0, availableWidth - cellBorderWidth / 2 ]), 
                yScale.domain(yDomain || sortObjByVals(uniqueY)).rangeBands(yRange || [ 0, availableHeight - cellBorderWidth / 2 ]), 
                colorScale = cellsAreNumeric() ? d3.scale.quantize() : d3.scale.ordinal(), colorScale.domain(colorDomain || getColorDomain()).range(colorRange || RdYlBu);
                var wrap = container.selectAll("g.nv-heatMapWrap").data([ prepedData ]), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-heatMapWrap");
                wrapEnter.append("g").attr("class", "cellWrap"), wrap.watchTransition(renderWatch, "nv-wrap: heatMapWrap").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var gridLinesV = (wrapEnter.append("g").attr("class", "cellGrid").style("opacity", 1e-6), 
                wrap.select(".cellGrid").selectAll(".gridLines.verticalGrid").data(Object.values(uniqueX).concat([ Object.values(uniqueX).length ])));
                gridLinesV.enter().append("line").attr("class", "gridLines verticalGrid"), gridLinesV.exit().remove();
                var gridLinesH = wrap.select(".cellGrid").selectAll(".gridLines.horizontalGrid").data(Object.values(uniqueY).concat([ Object.values(uniqueY).length ]));
                gridLinesH.enter().append("line").attr("class", "gridLines horizontalGrid"), gridLinesH.exit().remove();
                var cellWrap = wrap.select(".cellWrap").selectAll(".nv-cell").data(function(d) {
                    return d;
                }, function(e) {
                    return getIdx(e);
                }), xMetas = (wrapEnter.append("g").attr("class", "xMetaWrap").attr("transform", function() {
                    return "translate(0," + (-xMetaHeight() - cellBorderWidth - metaOffset) + ")";
                }), wrap.select(".xMetaWrap").selectAll(".x-meta").data(uniqueXMeta)), yMetas = (xMetas.enter().append("rect").attr("class", "x-meta meta").attr("width", cellWidth - cellBorderWidth).attr("height", xMetaHeight()).attr("transform", "translate(0,0)").attr("fill", function(d) {
                    return xMetaColorScale(d);
                }), wrapEnter.append("g").attr("class", "yMetaWrap").attr("transform", function(d, i) {
                    return "translate(" + (-yMetaWidth() - cellBorderWidth - metaOffset) + ",0)";
                }), wrap.select(".yMetaWrap").selectAll(".y-meta").data(uniqueYMeta));
                yMetas.enter().append("rect").attr("class", "y-meta meta").attr("width", yMetaWidth()).attr("height", cellHeight - cellBorderWidth).attr("transform", function(d, i) {
                    return "translate(0,0)";
                }).attr("fill", function(d, i) {
                    return yMetaColorScale(d);
                });
                xMetas.exit().remove(), yMetas.exit().remove();
                var cellsEnter = cellWrap.enter().append("g").style("opacity", 1e-6).attr("transform", function(d) {
                    return "translate(0," + getIY(d) * cellHeight + ")";
                }).attr("data-row", function(d) {
                    return getIY(d);
                }).attr("data-column", function(d) {
                    return getIX(d);
                });
                cellsEnter.append("rect"), cellsEnter.append("text").attr("text-anchor", "middle").attr("dy", 4).attr("class", "cell-text"), 
                cellWrap.selectAll("rect").watchTransition(renderWatch, "heatMap: rect").attr("width", cellWidth - cellBorderWidth).attr("height", cellHeight - cellBorderWidth).attr("rx", cellRadius).attr("ry", cellRadius).style("stroke", function(d) {
                    return cellColor(d);
                }), cellWrap.attr("class", function(d) {
                    return isNaN(getCellValue(d)) ? "nv-cell cell-missing" : "nv-cell";
                }).watchTransition(renderWatch, "heatMap: cells").style({
                    opacity: 1,
                    fill: function(d) {
                        return cellColor(d);
                    }
                }).attr("transform", function(d) {
                    return "translate(" + getIX(d) * cellWidth + "," + getIY(d) * cellHeight + ")";
                }).attr("class", function(d) {
                    return isNaN(getCellValue(d)) ? "nv-cell cell-missing" : "nv-cell";
                }), cellWrap.exit().remove(), cellWrap.selectAll("text").watchTransition(renderWatch, "heatMap: cells text").text(function(d) {
                    return cellValueLabel(d);
                }).attr("x", function(d) {
                    return (cellWidth - cellBorderWidth) / 2;
                }).attr("y", function(d) {
                    return (cellHeight - cellBorderWidth) / 2;
                }).style("fill", function(d) {
                    return cellTextColor(cellColor(d));
                }).style("opacity", function() {
                    return showCellValues ? 1 : 0;
                }), wrap.selectAll(".verticalGrid").watchTransition(renderWatch, "heatMap: gridLines").attr("y1", 0).attr("y2", availableHeight - cellBorderWidth).attr("x1", function(d) {
                    return d * cellWidth - cellBorderWidth / 2;
                }).attr("x2", function(d) {
                    return d * cellWidth - cellBorderWidth / 2;
                });
                var numHLines = Object.keys(uniqueY).length;
                wrap.selectAll(".horizontalGrid").watchTransition(renderWatch, "heatMap: gridLines").attr("x1", function(d) {
                    return 0 == d || d == numHLines ? -cellBorderWidth : 0;
                }).attr("x2", function(d) {
                    return 0 == d || d == numHLines ? availableWidth : availableWidth - cellBorderWidth;
                }).attr("y1", function(d) {
                    return d * cellHeight - cellBorderWidth / 2;
                }).attr("y2", function(d) {
                    return d * cellHeight - cellBorderWidth / 2;
                }), wrap.select(".cellGrid").watchTransition(renderWatch, "heatMap: gridLines").style({
                    "stroke-width": cellBorderWidth,
                    opacity: function() {
                        return showGrid ? 1 : 1e-6;
                    }
                });
                var allMetaRect = (wrap.selectAll(".x-meta"), wrap.selectAll(".y-meta"), wrap.selectAll(".meta"));
                xMetas.watchTransition(renderWatch, "heatMap: xMetaRect").attr("width", cellWidth - cellBorderWidth).attr("height", xMetaHeight()).attr("transform", function(d, i) {
                    return "translate(" + i * cellWidth + ",0)";
                }), yMetas.watchTransition(renderWatch, "heatMap: yMetaRect").attr("width", yMetaWidth()).attr("height", cellHeight - cellBorderWidth).attr("transform", function(d, i) {
                    return "translate(0," + i * cellHeight + ")";
                }), wrap.select(".xMetaWrap").watchTransition(renderWatch, "heatMap: xMetaWrap").attr("transform", function(d, i) {
                    return "translate(0," + (-xMetaHeight() - cellBorderWidth - metaOffset) + ")";
                }).style("opacity", function() {
                    return xMeta !== !1 ? 1 : 0;
                }), wrap.select(".yMetaWrap").watchTransition(renderWatch, "heatMap: yMetaWrap").attr("transform", function(d, i) {
                    return "translate(" + (-yMetaWidth() - cellBorderWidth - metaOffset) + ",0)";
                }).style("opacity", function() {
                    return yMeta !== !1 ? 1 : 0;
                }), cellWrap.on("mouseover", function(d, i) {
                    var idx = getIdx(d), ix = getIX(d), iy = getIY(d);
                    d3.selectAll(".nv-cell").each(function(e) {
                        idx == getIdx(e) ? (d3.select(this).classed("cell-hover", !0), d3.select(this).classed("no-hover", !1)) : (d3.select(this).classed("no-hover", !0), 
                        d3.select(this).classed("cell-hover", !1)), ix == getIX(e) && (d3.select(this).classed("no-hover", !1), 
                        d3.select(this).classed("column-hover", !0)), iy == getIY(e) && (d3.select(this).classed("no-hover", !1), 
                        d3.select(this).classed("row-hover", !0));
                    }), d3.selectAll(".x-meta").each(function(e, j) {
                        j == ix ? (d3.select(this).classed("cell-hover", !0), d3.select(this).classed("no-hover", !1)) : (d3.select(this).classed("no-hover", !0), 
                        d3.select(this).classed("cell-hover", !1));
                    }), d3.selectAll(".y-meta").each(function(e, j) {
                        j == iy ? (d3.select(this).classed("cell-hover", !0), d3.select(this).classed("no-hover", !1)) : (d3.select(this).classed("no-hover", !0), 
                        d3.select(this).classed("cell-hover", !1));
                    }), dispatch.elementMouseover({
                        value: getKeyByValue(uniqueX, ix) + " & " + getKeyByValue(uniqueY, iy),
                        series: {
                            value: cellValueLabel(d),
                            color: d3.select(this).select("rect").style("fill")
                        },
                        e: d3.event
                    });
                }).on("mouseout", function(d, i) {
                    var coordinates = (d3.select(this).select("rect").node().getBBox(), d3.mouse(d3.select(".nv-heatMap").node())), x = coordinates[0], y = coordinates[1];
                    (x + cellBorderWidth >= availableWidth || y + cellBorderWidth >= availableHeight || x < 0 || y < 0) && (removeAllHoverClasses(), 
                    dispatch.elementMouseout({
                        e: d3.event
                    }));
                }).on("mousemove", function(d, i) {
                    dispatch.elementMousemove({
                        e: d3.event
                    });
                }), allMetaRect.on("mouseover", function(d, i) {
                    var isColMeta = d3.select(this).attr("class").indexOf("x-meta") != -1;
                    d3.selectAll(".nv-cell").each(function(e) {
                        isColMeta && i == getIX(e) ? (d3.select(this).classed("column-hover", !0), d3.select(this).classed("no-hover", !1)) : isColMeta || i - uniqueXMeta.length != getIY(e) ? (d3.select(this).classed("no-hover", !0), 
                        d3.select(this).classed("column-hover", !1), d3.select(this).classed("row-hover", !1)) : (d3.select(this).classed("row-hover", !0), 
                        d3.select(this).classed("no-hover", !1)), d3.select(this).classed("cell-hover", !1);
                    }), d3.selectAll(".meta").classed("no-hover", !0), d3.select(this).classed("cell-hover", !0), 
                    d3.select(this).classed("no-hover", !1), dispatch.elementMouseover({
                        value: isColMeta ? "Column meta" : "Row meta",
                        series: {
                            value: d,
                            color: d3.select(this).style("fill")
                        }
                    });
                }).on("mouseout", function(d, i) {
                    var isColMeta = d3.select(this).attr("class").indexOf("x-meta") != -1, coordinates = (d3.select(this).node().getBBox(), 
                    d3.mouse(d3.select(isColMeta ? ".xMetaWrap" : ".yMetaWrap").node())), x = coordinates[0], y = coordinates[1];
                    (y < 0 || x < 0 || isColMeta && x + cellBorderWidth >= availableWidth || !isColMeta && y + cellBorderWidth >= availableHeight) && (removeAllHoverClasses(), 
                    dispatch.elementMouseout({
                        e: d3.event
                    }));
                }).on("mousemove", function(d, i) {
                    dispatch.elementMousemove({
                        e: d3.event
                    });
                });
            }), renderWatch.renderEnd("heatMap immediate"), chart;
        }
        var container, xDomain, yDomain, xRange, yRange, xMeta, yMeta, colorRange, colorDomain, prepedData, cellHeight, cellWidth, margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, width = 960, height = 500, id = Math.floor(1e4 * Math.random()), xScale = d3.scale.ordinal(), yScale = d3.scale.ordinal(), colorScale = !1, getX = function(d) {
            return d.x;
        }, getY = function(d) {
            return d.y;
        }, getCellValue = function(d) {
            return d.value;
        }, showCellValues = !0, cellValueFormat = function(d) {
            return "number" == typeof d ? d.toFixed(0) : d;
        }, cellAspectRatio = !1, cellRadius = 2, cellBorderWidth = 4, normalize = !1, highContrastText = !0, xMetaColorScale = nv.utils.defaultColor(), yMetaColorScale = nv.utils.defaultColor(), missingDataColor = "#bcbcbc", missingDataLabel = "", metaOffset = 5, dispatch = d3.dispatch("chartClick", "elementClick", "elementDblClick", "elementMouseover", "elementMouseout", "elementMousemove", "renderEnd"), duration = 250, xMetaHeight = function(d) {
            return cellHeight / 3;
        }, yMetaWidth = function(d) {
            return cellWidth / 3;
        }, showGrid = !1, cellValueLabel = function(d) {
            var val = cellValueFormat(normalize ? getNorm(d) : getCellValue(d));
            return cellsAreNumeric() && !isNaN(val) || "undefined" != typeof val ? val : missingDataLabel;
        }, uniqueX = {}, uniqueY = {}, uniqueColor = [], uniqueXMeta = [], uniqueYMeta = [], uniqueCells = [], renderWatch = nv.utils.renderWatch(dispatch, duration), RdYlBu = [ "#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695" ], getCellPos = function(d) {
            return d._cellPos;
        }, getIX = function(d) {
            return getCellPos(d).ix;
        }, getIY = function(d) {
            return getCellPos(d).iy;
        }, getNorm = function(d) {
            return getCellPos(d).norm;
        }, getIdx = function(d) {
            return getCellPos(d).idx;
        };
        return chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            showCellValues: {
                get: function() {
                    return showCellValues;
                },
                set: function(_) {
                    showCellValues = _;
                }
            },
            x: {
                get: function() {
                    return getX;
                },
                set: function(_) {
                    getX = _;
                }
            },
            y: {
                get: function() {
                    return getY;
                },
                set: function(_) {
                    getY = _;
                }
            },
            cellValue: {
                get: function() {
                    return getCellValue;
                },
                set: function(_) {
                    getCellValue = _;
                }
            },
            missingDataColor: {
                get: function() {
                    return missingDataColor;
                },
                set: function(_) {
                    missingDataColor = _;
                }
            },
            missingDataLabel: {
                get: function() {
                    return missingDataLabel;
                },
                set: function(_) {
                    missingDataLabel = _;
                }
            },
            xScale: {
                get: function() {
                    return xScale;
                },
                set: function(_) {
                    xScale = _;
                }
            },
            yScale: {
                get: function() {
                    return yScale;
                },
                set: function(_) {
                    yScale = _;
                }
            },
            colorScale: {
                get: function() {
                    return colorScale;
                },
                set: function(_) {
                    colorScale = _;
                }
            },
            xDomain: {
                get: function() {
                    return xDomain;
                },
                set: function(_) {
                    xDomain = _;
                }
            },
            yDomain: {
                get: function() {
                    return yDomain;
                },
                set: function(_) {
                    yDomain = _;
                }
            },
            xRange: {
                get: function() {
                    return xRange;
                },
                set: function(_) {
                    xRange = _;
                }
            },
            yRange: {
                get: function() {
                    return yRange;
                },
                set: function(_) {
                    yRange = _;
                }
            },
            colorRange: {
                get: function() {
                    return colorRange;
                },
                set: function(_) {
                    colorRange = _;
                }
            },
            colorDomain: {
                get: function() {
                    return colorDomain;
                },
                set: function(_) {
                    colorDomain = _;
                }
            },
            xMeta: {
                get: function() {
                    return xMeta;
                },
                set: function(_) {
                    xMeta = _;
                }
            },
            yMeta: {
                get: function() {
                    return yMeta;
                },
                set: function(_) {
                    yMeta = _;
                }
            },
            xMetaColorScale: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            },
            yMetaColorScale: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            },
            cellAspectRatio: {
                get: function() {
                    return cellAspectRatio;
                },
                set: function(_) {
                    cellAspectRatio = _;
                }
            },
            cellRadius: {
                get: function() {
                    return cellRadius;
                },
                set: function(_) {
                    cellRadius = _;
                }
            },
            cellHeight: {
                get: function() {
                    return cellHeight;
                }
            },
            cellWidth: {
                get: function() {
                    return cellWidth;
                }
            },
            normalize: {
                get: function() {
                    return normalize;
                },
                set: function(_) {
                    normalize = _;
                }
            },
            cellBorderWidth: {
                get: function() {
                    return cellBorderWidth;
                },
                set: function(_) {
                    cellBorderWidth = _;
                }
            },
            highContrastText: {
                get: function() {
                    return highContrastText;
                },
                set: function(_) {
                    highContrastText = _;
                }
            },
            cellValueFormat: {
                get: function() {
                    return cellValueFormat;
                },
                set: function(_) {
                    cellValueFormat = _;
                }
            },
            id: {
                get: function() {
                    return id;
                },
                set: function(_) {
                    id = _;
                }
            },
            metaOffset: {
                get: function() {
                    return metaOffset;
                },
                set: function(_) {
                    metaOffset = _;
                }
            },
            xMetaHeight: {
                get: function() {
                    return xMetaHeight;
                },
                set: function(_) {
                    xMetaHeight = _;
                }
            },
            yMetaWidth: {
                get: function() {
                    return yMetaWidth;
                },
                set: function(_) {
                    yMetaWidth = _;
                }
            },
            showGrid: {
                get: function() {
                    return showGrid;
                },
                set: function(_) {
                    showGrid = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration);
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.heatMapChart = function() {
        "use strict";
        function quantizeLegendValues() {
            var legendVals, e = heatMap.colorScale();
            return legendVals = "string" == typeof e.domain()[0] ? e.domain() : e.range().map(function(color) {
                var d = e.invertExtent(color);
                return null === d[0] && (d[0] = e.domain()[0]), null === d[1] && (d[1] = e.domain()[1]), 
                d;
            });
        }
        function hasRowMeta() {
            return "function" == typeof heatMap.yMeta();
        }
        function hasColumnMeta() {
            return "function" == typeof heatMap.xMeta();
        }
        function chart(selection) {
            return renderWatch.reset(), renderWatch.models(heatMap), renderWatch.models(xAxis), 
            renderWatch.models(yAxis), selection.each(function(data) {
                var container = d3.select(this);
                nv.utils.initSVG(container);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin);
                if (chart.update = function() {
                    dispatch.beforeUpdate(), container.transition().duration(duration).call(chart);
                }, chart.container = this, !data || !data.length) return nv.utils.noData(chart, container), 
                chart;
                container.selectAll(".nv-noData").remove(), x = heatMap.xScale(), y = heatMap.yScale();
                var wrap = container.selectAll("g.nv-wrap").data([ data ]), gEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap").append("g"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-heatMap"), gEnter.append("g").attr("class", "nv-legendWrap"), 
                gEnter.append("g").attr("class", "nv-x nv-axis"), gEnter.append("g").attr("class", "nv-y nv-axis"), 
                g.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), heatMap.width(availableWidth).height(availableHeight);
                var heatMapWrap = g.select(".nv-heatMap").datum(data.filter(function(d) {
                    return !d.disabled;
                }));
                heatMapWrap.transition().call(heatMap), heatMap.cellAspectRatio() && (availableHeight = heatMap.cellHeight() * y.domain().length, 
                heatMap.height(availableHeight)), xAxis.scale(x)._ticks(nv.utils.calcTicksX(availableWidth / 100, data)).tickSize(-availableHeight, 0);
                var axisX = g.select(".nv-x.nv-axis");
                axisX.call(xAxis).watchTransition(renderWatch, "heatMap: axisX").selectAll(".tick").style("opacity", function() {
                    return showXAxis ? 1 : 0;
                });
                var xTicks = axisX.selectAll("g");
                xTicks.selectAll(".tick text").attr("transform", function(d, i, j) {
                    var rot = 0 != rotateLabels ? rotateLabels : "0", stagger = staggerLabels ? j % 2 == 0 ? "5" : "17" : "0";
                    return "translate(0, " + stagger + ") rotate(" + rot + " 0,0)";
                }).style("text-anchor", rotateLabels > 0 ? "start" : rotateLabels < 0 ? "end" : "middle");
                var yPos = -5;
                if (hasColumnMeta() && (axisX.selectAll("text").style("text-anchor", "middle"), 
                yPos = -heatMap.xMetaHeight()() / 2 - heatMap.metaOffset() + 3), "bottom" == alignXAxis) {
                    if (axisX.watchTransition(renderWatch, "heatMap: axisX").attr("transform", "translate(0," + (availableHeight - yPos) + ")"), 
                    heatMap.xMeta() !== !1) {
                        var pos = availableHeight + heatMap.metaOffset() + heatMap.cellBorderWidth();
                        g.select(".xMetaWrap").watchTransition(renderWatch, "heatMap: xMetaWrap").attr("transform", function(d, i) {
                            return "translate(0," + pos + ")";
                        });
                    }
                } else axisX.watchTransition(renderWatch, "heatMap: axisX").attr("transform", "translate(0," + yPos + ")");
                yAxis.scale(y)._ticks(nv.utils.calcTicksY(availableHeight / 36, data)).tickSize(-availableWidth, 0);
                var axisY = g.select(".nv-y.nv-axis");
                axisY.call(yAxis).watchTransition(renderWatch, "heatMap: axisY").selectAll(".tick").style("opacity", function() {
                    return showYAxis ? 1 : 0;
                });
                var xPos = -5;
                if (hasRowMeta() && (axisY.selectAll("text").style("text-anchor", "middle"), xPos = -heatMap.yMetaWidth()() / 2 - heatMap.metaOffset()), 
                "right" == alignYAxis) {
                    if (axisY.attr("transform", "translate(" + (availableWidth - xPos) + ",0)"), heatMap.yMeta() !== !1) {
                        var pos = availableWidth + heatMap.metaOffset() + heatMap.cellBorderWidth();
                        g.select(".yMetaWrap").watchTransition(renderWatch, "heatMap: yMetaWrap").attr("transform", function(d, i) {
                            return "translate(" + pos + ",0)";
                        });
                    }
                } else axisY.attr("transform", "translate(" + xPos + ",0)");
                var legendWrap = g.select(".nv-legendWrap");
                legend.width(availableWidth).color(heatMap.colorScale().range());
                var legendVal = quantizeLegendValues().map(function(d) {
                    return Array.isArray(d) ? {
                        key: d[0].toFixed(1) + " - " + d[1].toFixed(1)
                    } : {
                        key: d
                    };
                });
                legendWrap.datum(legendVal).call(legend).attr("transform", "translate(0," + ("top" == alignXAxis ? availableHeight : -30) + ")"), 
                legendWrap.watchTransition(renderWatch, "heatMap: nv-legendWrap").style("opacity", function() {
                    return showLegend ? 1 : 0;
                });
            }), d3.selectAll(".nv-axis").selectAll("line").style("stroke-opacity", 0), d3.select(".nv-y").select("path.domain").remove(), 
            renderWatch.renderEnd("heatMap chart immediate"), chart;
        }
        var x, y, heatMap = nv.models.heatMap(), legend = nv.models.legend(), tooltip = (nv.models.legend(), 
        nv.models.legend(), nv.models.tooltip()), xAxis = nv.models.axis(), yAxis = nv.models.axis(), margin = {
            top: 20,
            right: 10,
            bottom: 50,
            left: 60
        }, marginTop = null, width = null, height = null, showLegend = (nv.utils.getColor(), 
        !0), staggerLabels = !1, showXAxis = !0, showYAxis = !0, alignYAxis = "left", alignXAxis = "top", rotateLabels = 0, noData = null, dispatch = d3.dispatch("beforeUpdate", "renderEnd"), duration = 250;
        xAxis.orient(alignXAxis).showMaxMin(!1).tickFormat(function(d) {
            return d;
        }), yAxis.orient(alignYAxis).showMaxMin(!1).tickFormat(function(d) {
            return d;
        }), tooltip.duration(0).headerEnabled(!0).keyFormatter(function(d, i) {
            return xAxis.tickFormat()(d, i);
        });
        var renderWatch = nv.utils.renderWatch(dispatch, duration);
        return heatMap.dispatch.on("elementMouseover.tooltip", function(evt) {
            tooltip.data(evt).hidden(!1);
        }), heatMap.dispatch.on("elementMouseout.tooltip", function(evt) {
            tooltip.hidden(!0);
        }), heatMap.dispatch.on("elementMousemove.tooltip", function(evt) {
            tooltip();
        }), chart.dispatch = dispatch, chart.heatMap = heatMap, chart.legend = legend, chart.xAxis = xAxis, 
        chart.yAxis = yAxis, chart.tooltip = tooltip, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            showLegend: {
                get: function() {
                    return showLegend;
                },
                set: function(_) {
                    showLegend = _;
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            showXAxis: {
                get: function() {
                    return showXAxis;
                },
                set: function(_) {
                    showXAxis = _;
                }
            },
            showYAxis: {
                get: function() {
                    return showYAxis;
                },
                set: function(_) {
                    showYAxis = _;
                }
            },
            staggerLabels: {
                get: function() {
                    return staggerLabels;
                },
                set: function(_) {
                    staggerLabels = _;
                }
            },
            rotateLabels: {
                get: function() {
                    return rotateLabels;
                },
                set: function(_) {
                    rotateLabels = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    void 0 !== _.top && (margin.top = _.top, marginTop = _.top), margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration), heatMap.duration(duration), xAxis.duration(duration), 
                    yAxis.duration(duration);
                }
            },
            alignYAxis: {
                get: function() {
                    return alignYAxis;
                },
                set: function(_) {
                    alignYAxis = _, yAxis.orient(_);
                }
            },
            alignXAxis: {
                get: function() {
                    return alignXAxis;
                },
                set: function(_) {
                    alignXAxis = _, xAxis.orient(_);
                }
            }
        }), nv.utils.inheritOptions(chart, heatMap), nv.utils.initOptions(chart), chart;
    }, nv.models.historicalBar = function() {
        "use strict";
        function chart(selection) {
            return selection.each(function(data) {
                renderWatch.reset(), container = d3.select(this);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin);
                nv.utils.initSVG(container), x.domain(xDomain || d3.extent(data[0].values.map(getX).concat(forceX))), 
                padData ? x.range(xRange || [ .5 * availableWidth / data[0].values.length, availableWidth * (data[0].values.length - .5) / data[0].values.length ]) : x.range(xRange || [ 0, availableWidth ]), 
                y.domain(yDomain || d3.extent(data[0].values.map(getY).concat(forceY))).range(yRange || [ availableHeight, 0 ]), 
                x.domain()[0] === x.domain()[1] && (x.domain()[0] ? x.domain([ x.domain()[0] - .01 * x.domain()[0], x.domain()[1] + .01 * x.domain()[1] ]) : x.domain([ -1, 1 ])), 
                y.domain()[0] === y.domain()[1] && (y.domain()[0] ? y.domain([ y.domain()[0] + .01 * y.domain()[0], y.domain()[1] - .01 * y.domain()[1] ]) : y.domain([ -1, 1 ]));
                var wrap = container.selectAll("g.nv-wrap.nv-historicalBar-" + id).data([ data[0].values ]), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-historicalBar-" + id), defsEnter = wrapEnter.append("defs"), gEnter = wrapEnter.append("g"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-bars"), wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), 
                container.on("click", function(d, i) {
                    dispatch.chartClick({
                        data: d,
                        index: i,
                        pos: d3.event,
                        id: id
                    });
                }), defsEnter.append("clipPath").attr("id", "nv-chart-clip-path-" + id).append("rect"), 
                wrap.select("#nv-chart-clip-path-" + id + " rect").attr("width", availableWidth).attr("height", availableHeight), 
                g.attr("clip-path", clipEdge ? "url(#nv-chart-clip-path-" + id + ")" : "");
                var bars = wrap.select(".nv-bars").selectAll(".nv-bar").data(function(d) {
                    return d;
                }, function(d, i) {
                    return getX(d, i);
                });
                bars.exit().remove(), bars.enter().append("rect").attr("x", 0).attr("y", function(d, i) {
                    return nv.utils.NaNtoZero(y(Math.max(0, getY(d, i))));
                }).attr("height", function(d, i) {
                    return nv.utils.NaNtoZero(Math.abs(y(getY(d, i)) - y(0)));
                }).attr("transform", function(d, i) {
                    return "translate(" + (x(getX(d, i)) - availableWidth / data[0].values.length * .45) + ",0)";
                }).on("mouseover", function(d, i) {
                    interactive && (d3.select(this).classed("hover", !0), dispatch.elementMouseover({
                        data: d,
                        index: i,
                        color: d3.select(this).style("fill")
                    }));
                }).on("mouseout", function(d, i) {
                    interactive && (d3.select(this).classed("hover", !1), dispatch.elementMouseout({
                        data: d,
                        index: i,
                        color: d3.select(this).style("fill")
                    }));
                }).on("mousemove", function(d, i) {
                    interactive && dispatch.elementMousemove({
                        data: d,
                        index: i,
                        color: d3.select(this).style("fill")
                    });
                }).on("click", function(d, i) {
                    if (interactive) {
                        var element = this;
                        dispatch.elementClick({
                            data: d,
                            index: i,
                            color: d3.select(this).style("fill"),
                            event: d3.event,
                            element: element
                        }), d3.event.stopPropagation();
                    }
                }).on("dblclick", function(d, i) {
                    interactive && (dispatch.elementDblClick({
                        data: d,
                        index: i,
                        color: d3.select(this).style("fill")
                    }), d3.event.stopPropagation());
                }), bars.attr("fill", function(d, i) {
                    return color(d, i);
                }).attr("class", function(d, i, j) {
                    return (getY(d, i) < 0 ? "nv-bar negative" : "nv-bar positive") + " nv-bar-" + j + "-" + i;
                }).watchTransition(renderWatch, "bars").attr("transform", function(d, i) {
                    return "translate(" + (x(getX(d, i)) - availableWidth / data[0].values.length * .45) + ",0)";
                }).attr("width", availableWidth / data[0].values.length * .9), bars.watchTransition(renderWatch, "bars").attr("y", function(d, i) {
                    var rval = getY(d, i) < 0 ? y(0) : y(0) - y(getY(d, i)) < 1 ? y(0) - 1 : y(getY(d, i));
                    return nv.utils.NaNtoZero(rval);
                }).attr("height", function(d, i) {
                    return nv.utils.NaNtoZero(Math.max(Math.abs(y(getY(d, i)) - y(0)), 1));
                });
            }), renderWatch.renderEnd("historicalBar immediate"), chart;
        }
        var xDomain, yDomain, xRange, yRange, margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, width = null, height = null, id = Math.floor(1e4 * Math.random()), container = null, x = d3.scale.linear(), y = d3.scale.linear(), getX = function(d) {
            return d.x;
        }, getY = function(d) {
            return d.y;
        }, forceX = [], forceY = [ 0 ], padData = !1, clipEdge = !0, color = nv.utils.defaultColor(), dispatch = d3.dispatch("chartClick", "elementClick", "elementDblClick", "elementMouseover", "elementMouseout", "elementMousemove", "renderEnd"), interactive = !0, renderWatch = nv.utils.renderWatch(dispatch, 0);
        return chart.highlightPoint = function(pointIndex, isHoverOver) {
            container.select(".nv-bars .nv-bar-0-" + pointIndex).classed("hover", isHoverOver);
        }, chart.clearHighlights = function() {
            container.select(".nv-bars .nv-bar.hover").classed("hover", !1);
        }, chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            forceX: {
                get: function() {
                    return forceX;
                },
                set: function(_) {
                    forceX = _;
                }
            },
            forceY: {
                get: function() {
                    return forceY;
                },
                set: function(_) {
                    forceY = _;
                }
            },
            padData: {
                get: function() {
                    return padData;
                },
                set: function(_) {
                    padData = _;
                }
            },
            x: {
                get: function() {
                    return getX;
                },
                set: function(_) {
                    getX = _;
                }
            },
            y: {
                get: function() {
                    return getY;
                },
                set: function(_) {
                    getY = _;
                }
            },
            xScale: {
                get: function() {
                    return x;
                },
                set: function(_) {
                    x = _;
                }
            },
            yScale: {
                get: function() {
                    return y;
                },
                set: function(_) {
                    y = _;
                }
            },
            xDomain: {
                get: function() {
                    return xDomain;
                },
                set: function(_) {
                    xDomain = _;
                }
            },
            yDomain: {
                get: function() {
                    return yDomain;
                },
                set: function(_) {
                    yDomain = _;
                }
            },
            xRange: {
                get: function() {
                    return xRange;
                },
                set: function(_) {
                    xRange = _;
                }
            },
            yRange: {
                get: function() {
                    return yRange;
                },
                set: function(_) {
                    yRange = _;
                }
            },
            clipEdge: {
                get: function() {
                    return clipEdge;
                },
                set: function(_) {
                    clipEdge = _;
                }
            },
            id: {
                get: function() {
                    return id;
                },
                set: function(_) {
                    id = _;
                }
            },
            interactive: {
                get: function() {
                    return interactive;
                },
                set: function(_) {
                    interactive = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.historicalBarChart = function(bar_model) {
        "use strict";
        function chart(selection) {
            return selection.each(function(data) {
                renderWatch.reset(), renderWatch.models(bars), showXAxis && renderWatch.models(xAxis), 
                showYAxis && renderWatch.models(yAxis);
                var container = d3.select(this);
                nv.utils.initSVG(container);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin);
                if (chart.update = function() {
                    container.transition().duration(transitionDuration).call(chart);
                }, chart.container = this, state.disabled = data.map(function(d) {
                    return !!d.disabled;
                }), !defaultState) {
                    var key;
                    defaultState = {};
                    for (key in state) state[key] instanceof Array ? defaultState[key] = state[key].slice(0) : defaultState[key] = state[key];
                }
                if (!(data && data.length && data.filter(function(d) {
                    return d.values.length;
                }).length)) return nv.utils.noData(chart, container), chart;
                container.selectAll(".nv-noData").remove(), x = bars.xScale(), y = bars.yScale();
                var wrap = container.selectAll("g.nv-wrap.nv-historicalBarChart").data([ data ]), gEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-historicalBarChart").append("g"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-x nv-axis"), gEnter.append("g").attr("class", "nv-y nv-axis"), 
                gEnter.append("g").attr("class", "nv-barsWrap"), gEnter.append("g").attr("class", "nv-legendWrap"), 
                gEnter.append("g").attr("class", "nv-interactive"), showLegend ? (legend.width(availableWidth), 
                g.select(".nv-legendWrap").datum(data).call(legend), marginTop || legend.height() === margin.top || (margin.top = legend.height(), 
                availableHeight = nv.utils.availableHeight(height, container, margin)), wrap.select(".nv-legendWrap").attr("transform", "translate(0," + -margin.top + ")")) : g.select(".nv-legendWrap").selectAll("*").remove(), 
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), rightAlignYAxis && g.select(".nv-y.nv-axis").attr("transform", "translate(" + availableWidth + ",0)"), 
                useInteractiveGuideline && (interactiveLayer.width(availableWidth).height(availableHeight).margin({
                    left: margin.left,
                    top: margin.top
                }).svgContainer(container).xScale(x), wrap.select(".nv-interactive").call(interactiveLayer)), 
                bars.width(availableWidth).height(availableHeight).color(data.map(function(d, i) {
                    return d.color || color(d, i);
                }).filter(function(d, i) {
                    return !data[i].disabled;
                }));
                var barsWrap = g.select(".nv-barsWrap").datum(data.filter(function(d) {
                    return !d.disabled;
                }));
                barsWrap.transition().call(bars), showXAxis && (xAxis.scale(x)._ticks(nv.utils.calcTicksX(availableWidth / 100, data)).tickSize(-availableHeight, 0), 
                g.select(".nv-x.nv-axis").attr("transform", "translate(0," + y.range()[0] + ")"), 
                g.select(".nv-x.nv-axis").transition().call(xAxis)), showYAxis && (yAxis.scale(y)._ticks(nv.utils.calcTicksY(availableHeight / 36, data)).tickSize(-availableWidth, 0), 
                g.select(".nv-y.nv-axis").transition().call(yAxis)), interactiveLayer.dispatch.on("elementMousemove", function(e) {
                    bars.clearHighlights();
                    var singlePoint, pointIndex, pointXLocation, allData = [];
                    data.filter(function(series, i) {
                        return series.seriesIndex = i, !series.disabled;
                    }).forEach(function(series, i) {
                        pointIndex = nv.interactiveBisect(series.values, e.pointXValue, chart.x()), bars.highlightPoint(pointIndex, !0);
                        var point = series.values[pointIndex];
                        void 0 !== point && (void 0 === singlePoint && (singlePoint = point), void 0 === pointXLocation && (pointXLocation = chart.xScale()(chart.x()(point, pointIndex))), 
                        allData.push({
                            key: series.key,
                            value: chart.y()(point, pointIndex),
                            color: color(series, series.seriesIndex),
                            data: series.values[pointIndex]
                        }));
                    });
                    var xValue = xAxis.tickFormat()(chart.x()(singlePoint, pointIndex));
                    interactiveLayer.tooltip.valueFormatter(function(d, i) {
                        return yAxis.tickFormat()(d);
                    }).data({
                        value: xValue,
                        index: pointIndex,
                        series: allData
                    })(), interactiveLayer.renderGuideLine(pointXLocation);
                }), interactiveLayer.dispatch.on("elementMouseout", function(e) {
                    dispatch.tooltipHide(), bars.clearHighlights();
                }), legend.dispatch.on("legendClick", function(d, i) {
                    d.disabled = !d.disabled, data.filter(function(d) {
                        return !d.disabled;
                    }).length || data.map(function(d) {
                        return d.disabled = !1, wrap.selectAll(".nv-series").classed("disabled", !1), d;
                    }), state.disabled = data.map(function(d) {
                        return !!d.disabled;
                    }), dispatch.stateChange(state), selection.transition().call(chart);
                }), legend.dispatch.on("legendDblclick", function(d) {
                    data.forEach(function(d) {
                        d.disabled = !0;
                    }), d.disabled = !1, state.disabled = data.map(function(d) {
                        return !!d.disabled;
                    }), dispatch.stateChange(state), chart.update();
                }), dispatch.on("changeState", function(e) {
                    "undefined" != typeof e.disabled && (data.forEach(function(series, i) {
                        series.disabled = e.disabled[i];
                    }), state.disabled = e.disabled), chart.update();
                });
            }), renderWatch.renderEnd("historicalBarChart immediate"), chart;
        }
        var x, y, bars = bar_model || nv.models.historicalBar(), xAxis = nv.models.axis(), yAxis = nv.models.axis(), legend = nv.models.legend(), interactiveLayer = nv.interactiveGuideline(), tooltip = nv.models.tooltip(), margin = {
            top: 30,
            right: 90,
            bottom: 50,
            left: 90
        }, marginTop = null, color = nv.utils.defaultColor(), width = null, height = null, showLegend = !1, showXAxis = !0, showYAxis = !0, rightAlignYAxis = !1, useInteractiveGuideline = !1, state = {}, defaultState = null, noData = null, dispatch = d3.dispatch("tooltipHide", "stateChange", "changeState", "renderEnd"), transitionDuration = 250;
        xAxis.orient("bottom").tickPadding(7), yAxis.orient(rightAlignYAxis ? "right" : "left"), 
        tooltip.duration(0).headerEnabled(!1).valueFormatter(function(d, i) {
            return yAxis.tickFormat()(d, i);
        }).headerFormatter(function(d, i) {
            return xAxis.tickFormat()(d, i);
        });
        var renderWatch = nv.utils.renderWatch(dispatch, 0);
        return bars.dispatch.on("elementMouseover.tooltip", function(evt) {
            evt.series = {
                key: chart.x()(evt.data),
                value: chart.y()(evt.data),
                color: evt.color
            }, tooltip.data(evt).hidden(!1);
        }), bars.dispatch.on("elementMouseout.tooltip", function(evt) {
            tooltip.hidden(!0);
        }), bars.dispatch.on("elementMousemove.tooltip", function(evt) {
            tooltip();
        }), chart.dispatch = dispatch, chart.bars = bars, chart.legend = legend, chart.xAxis = xAxis, 
        chart.yAxis = yAxis, chart.interactiveLayer = interactiveLayer, chart.tooltip = tooltip, 
        chart.options = nv.utils.optionsFunc.bind(chart), chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            showLegend: {
                get: function() {
                    return showLegend;
                },
                set: function(_) {
                    showLegend = _;
                }
            },
            showXAxis: {
                get: function() {
                    return showXAxis;
                },
                set: function(_) {
                    showXAxis = _;
                }
            },
            showYAxis: {
                get: function() {
                    return showYAxis;
                },
                set: function(_) {
                    showYAxis = _;
                }
            },
            defaultState: {
                get: function() {
                    return defaultState;
                },
                set: function(_) {
                    defaultState = _;
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    void 0 !== _.top && (margin.top = _.top, marginTop = _.top), margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_), legend.color(color), bars.color(color);
                }
            },
            duration: {
                get: function() {
                    return transitionDuration;
                },
                set: function(_) {
                    transitionDuration = _, renderWatch.reset(transitionDuration), yAxis.duration(transitionDuration), 
                    xAxis.duration(transitionDuration);
                }
            },
            rightAlignYAxis: {
                get: function() {
                    return rightAlignYAxis;
                },
                set: function(_) {
                    rightAlignYAxis = _, yAxis.orient(_ ? "right" : "left");
                }
            },
            useInteractiveGuideline: {
                get: function() {
                    return useInteractiveGuideline;
                },
                set: function(_) {
                    useInteractiveGuideline = _, _ === !0 && chart.interactive(!1);
                }
            }
        }), nv.utils.inheritOptions(chart, bars), nv.utils.initOptions(chart), chart;
    }, nv.models.ohlcBarChart = function() {
        var chart = nv.models.historicalBarChart(nv.models.ohlcBar());
        return chart.useInteractiveGuideline(!0), chart.interactiveLayer.tooltip.contentGenerator(function(data) {
            var d = data.series[0].data, color = d.open < d.close ? "2ca02c" : "d62728";
            return '<h3 style="color: #' + color + '">' + data.value + "</h3><table><tr><td>open:</td><td>" + chart.yAxis.tickFormat()(d.open) + "</td></tr><tr><td>close:</td><td>" + chart.yAxis.tickFormat()(d.close) + "</td></tr><tr><td>high</td><td>" + chart.yAxis.tickFormat()(d.high) + "</td></tr><tr><td>low:</td><td>" + chart.yAxis.tickFormat()(d.low) + "</td></tr></table>";
        }), chart;
    }, nv.models.candlestickBarChart = function() {
        var chart = nv.models.historicalBarChart(nv.models.candlestickBar());
        return chart.useInteractiveGuideline(!0), chart.interactiveLayer.tooltip.contentGenerator(function(data) {
            var d = data.series[0].data, color = d.open < d.close ? "2ca02c" : "d62728";
            return '<h3 style="color: #' + color + '">' + data.value + "</h3><table><tr><td>open:</td><td>" + chart.yAxis.tickFormat()(d.open) + "</td></tr><tr><td>close:</td><td>" + chart.yAxis.tickFormat()(d.close) + "</td></tr><tr><td>high</td><td>" + chart.yAxis.tickFormat()(d.high) + "</td></tr><tr><td>low:</td><td>" + chart.yAxis.tickFormat()(d.low) + "</td></tr></table>";
        }), chart;
    }, nv.models.legend = function() {
        "use strict";
        function chart(selection) {
            function setTextColor(d, i) {
                return "furious" != vers ? "#000" : expanded ? d.disengaged ? "#000" : "#fff" : expanded ? void 0 : (d.color || (d.color = color(d, i)), 
                d.disabled ? d.color : "#fff");
            }
            function setBGColor(d, i) {
                return expanded && "furious" == vers && d.disengaged ? "#eee" : d.color || color(d, i);
            }
            function setBGOpacity(d, i) {
                return expanded && "furious" == vers ? 1 : d.disabled ? 0 : 1;
            }
            return selection.each(function(data) {
                var availableWidth = width - margin.left - margin.right, container = d3.select(this);
                nv.utils.initSVG(container);
                var wrap = container.selectAll("g.nv-legend").data([ data ]), gEnter = wrap.enter().append("g").attr("class", "nvd3 nv-legend").append("g"), g = wrap.select("g");
                rightAlign ? wrap.attr("transform", "translate(" + -margin.right + "," + margin.top + ")") : wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var seriesShape, versPadding, series = g.selectAll(".nv-series").data(function(d) {
                    return "furious" != vers ? d : d.filter(function(n) {
                        return !!expanded || !n.disengaged;
                    });
                }), seriesEnter = series.enter().append("g").attr("class", "nv-series");
                switch (vers) {
                  case "furious":
                    versPadding = 23;
                    break;

                  case "classic":
                    versPadding = 20;
                }
                if ("classic" == vers) seriesEnter.append("circle").style("stroke-width", 2).attr("class", "nv-legend-symbol").attr("r", 5), 
                seriesShape = series.select(".nv-legend-symbol"); else if ("furious" == vers) {
                    seriesEnter.append("rect").style("stroke-width", 2).attr("class", "nv-legend-symbol").attr("rx", 3).attr("ry", 3), 
                    seriesShape = series.select(".nv-legend-symbol"), seriesEnter.append("g").attr("class", "nv-check-box").property("innerHTML", '<path d="M0.5,5 L22.5,5 L22.5,26.5 L0.5,26.5 L0.5,5 Z" class="nv-box"></path><path d="M5.5,12.8618467 L11.9185089,19.2803556 L31,0.198864511" class="nv-check"></path>').attr("transform", "translate(-10,-8)scale(0.5)");
                    var seriesCheckbox = series.select(".nv-check-box");
                    seriesCheckbox.each(function(d, i) {
                        d3.select(this).selectAll("path").attr("stroke", setTextColor(d, i));
                    });
                }
                seriesEnter.append("text").attr("text-anchor", "start").attr("class", "nv-legend-text").attr("dy", ".32em").attr("dx", "8");
                var seriesText = series.select("text.nv-legend-text");
                series.on("mouseover", function(d, i) {
                    dispatch.legendMouseover(d, i);
                }).on("mouseout", function(d, i) {
                    dispatch.legendMouseout(d, i);
                }).on("click", function(d, i) {
                    dispatch.legendClick(d, i);
                    var data = series.data();
                    if (updateState) {
                        if ("classic" == vers) radioButtonMode ? (data.forEach(function(series) {
                            series.disabled = !0;
                        }), d.disabled = !1) : (d.disabled = !d.disabled, data.every(function(series) {
                            return series.disabled;
                        }) && data.forEach(function(series) {
                            series.disabled = !1;
                        })); else if ("furious" == vers) if (expanded) d.disengaged = !d.disengaged, d.userDisabled = void 0 == d.userDisabled ? !!d.disabled : d.userDisabled, 
                        d.disabled = d.disengaged || d.userDisabled; else if (!expanded) {
                            d.disabled = !d.disabled, d.userDisabled = d.disabled;
                            var engaged = data.filter(function(d) {
                                return !d.disengaged;
                            });
                            engaged.every(function(series) {
                                return series.userDisabled;
                            }) && data.forEach(function(series) {
                                series.disabled = series.userDisabled = !1;
                            });
                        }
                        dispatch.stateChange({
                            disabled: data.map(function(d) {
                                return !!d.disabled;
                            }),
                            disengaged: data.map(function(d) {
                                return !!d.disengaged;
                            })
                        });
                    }
                }).on("dblclick", function(d, i) {
                    if (enableDoubleClick) {
                        if ("furious" == vers && expanded) return;
                        if (dispatch.legendDblclick(d, i), updateState) {
                            var data = series.data();
                            data.forEach(function(series) {
                                series.disabled = !0, "furious" == vers && (series.userDisabled = series.disabled);
                            }), d.disabled = !1, "furious" == vers && (d.userDisabled = d.disabled), dispatch.stateChange({
                                disabled: data.map(function(d) {
                                    return !!d.disabled;
                                })
                            });
                        }
                    }
                }), series.classed("nv-disabled", function(d) {
                    return d.userDisabled;
                }), series.exit().remove(), seriesText.attr("fill", setTextColor).text(function(d) {
                    return keyFormatter(getKey(d));
                });
                var legendWidth = 0;
                if (align) {
                    var seriesWidths = [];
                    series.each(function(d, i) {
                        var legendText;
                        if (keyFormatter(getKey(d)) && keyFormatter(getKey(d)).length > maxKeyLength) {
                            var trimmedKey = keyFormatter(getKey(d)).substring(0, maxKeyLength);
                            legendText = d3.select(this).select("text").text(trimmedKey + "..."), d3.select(this).append("svg:title").text(keyFormatter(getKey(d)));
                        } else legendText = d3.select(this).select("text");
                        var nodeTextLength;
                        try {
                            if (nodeTextLength = legendText.node().getComputedTextLength(), nodeTextLength <= 0) throw Error();
                        } catch (e) {
                            nodeTextLength = nv.utils.calcApproxTextWidth(legendText);
                        }
                        seriesWidths.push(nodeTextLength + padding);
                    });
                    var seriesPerRow = 0, columnWidths = [];
                    for (legendWidth = 0; legendWidth < availableWidth && seriesPerRow < seriesWidths.length; ) columnWidths[seriesPerRow] = seriesWidths[seriesPerRow], 
                    legendWidth += seriesWidths[seriesPerRow++];
                    for (0 === seriesPerRow && (seriesPerRow = 1); legendWidth > availableWidth && seriesPerRow > 1; ) {
                        columnWidths = [], seriesPerRow--;
                        for (var k = 0; k < seriesWidths.length; k++) seriesWidths[k] > (columnWidths[k % seriesPerRow] || 0) && (columnWidths[k % seriesPerRow] = seriesWidths[k]);
                        legendWidth = columnWidths.reduce(function(prev, cur, index, array) {
                            return prev + cur;
                        });
                    }
                    for (var xPositions = [], i = 0, curX = 0; i < seriesPerRow; i++) xPositions[i] = curX, 
                    curX += columnWidths[i];
                    series.attr("transform", function(d, i) {
                        return "translate(" + xPositions[i % seriesPerRow] + "," + (5 + Math.floor(i / seriesPerRow) * versPadding) + ")";
                    }), rightAlign ? g.attr("transform", "translate(" + (width - margin.right - legendWidth) + "," + margin.top + ")") : g.attr("transform", "translate(0," + margin.top + ")"), 
                    height = margin.top + margin.bottom + Math.ceil(seriesWidths.length / seriesPerRow) * versPadding;
                } else {
                    var xpos, ypos = 5, newxpos = 5, maxwidth = 0;
                    series.attr("transform", function(d, i) {
                        var length = d3.select(this).select("text").node().getComputedTextLength() + padding;
                        return xpos = newxpos, width < margin.left + margin.right + xpos + length && (newxpos = xpos = 5, 
                        ypos += versPadding), newxpos += length, newxpos > maxwidth && (maxwidth = newxpos), 
                        legendWidth < xpos + maxwidth && (legendWidth = xpos + maxwidth), "translate(" + xpos + "," + ypos + ")";
                    }), g.attr("transform", "translate(" + (width - margin.right - maxwidth) + "," + margin.top + ")"), 
                    height = margin.top + margin.bottom + ypos + 15;
                }
                if ("furious" == vers) {
                    seriesShape.attr("width", function(d, i) {
                        return seriesText[0][i].getComputedTextLength() + 27;
                    }).attr("height", 18).attr("y", -9).attr("x", -15), gEnter.insert("rect", ":first-child").attr("class", "nv-legend-bg").attr("fill", "#eee").attr("opacity", 0);
                    var seriesBG = g.select(".nv-legend-bg");
                    seriesBG.transition().duration(300).attr("x", -versPadding).attr("width", legendWidth + versPadding - 12).attr("height", height + 10).attr("y", -margin.top - 10).attr("opacity", expanded ? 1 : 0);
                }
                seriesShape.style("fill", setBGColor).style("fill-opacity", setBGOpacity).style("stroke", setBGColor);
            }), chart;
        }
        var margin = {
            top: 5,
            right: 0,
            bottom: 5,
            left: 0
        }, width = 400, height = 20, getKey = function(d) {
            return d.key;
        }, keyFormatter = function(d) {
            return d;
        }, color = nv.utils.getColor(), maxKeyLength = 20, align = !0, padding = 32, rightAlign = !0, updateState = !0, enableDoubleClick = !0, radioButtonMode = !1, expanded = !1, dispatch = d3.dispatch("legendClick", "legendDblclick", "legendMouseover", "legendMouseout", "stateChange"), vers = "classic";
        return chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            key: {
                get: function() {
                    return getKey;
                },
                set: function(_) {
                    getKey = _;
                }
            },
            keyFormatter: {
                get: function() {
                    return keyFormatter;
                },
                set: function(_) {
                    keyFormatter = _;
                }
            },
            align: {
                get: function() {
                    return align;
                },
                set: function(_) {
                    align = _;
                }
            },
            maxKeyLength: {
                get: function() {
                    return maxKeyLength;
                },
                set: function(_) {
                    maxKeyLength = _;
                }
            },
            rightAlign: {
                get: function() {
                    return rightAlign;
                },
                set: function(_) {
                    rightAlign = _;
                }
            },
            padding: {
                get: function() {
                    return padding;
                },
                set: function(_) {
                    padding = _;
                }
            },
            updateState: {
                get: function() {
                    return updateState;
                },
                set: function(_) {
                    updateState = _;
                }
            },
            enableDoubleClick: {
                get: function() {
                    return enableDoubleClick;
                },
                set: function(_) {
                    enableDoubleClick = _;
                }
            },
            radioButtonMode: {
                get: function() {
                    return radioButtonMode;
                },
                set: function(_) {
                    radioButtonMode = _;
                }
            },
            expanded: {
                get: function() {
                    return expanded;
                },
                set: function(_) {
                    expanded = _;
                }
            },
            vers: {
                get: function() {
                    return vers;
                },
                set: function(_) {
                    vers = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.line = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), renderWatch.models(scatter), selection.each(function(data) {
                container = d3.select(this);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin);
                nv.utils.initSVG(container), x = scatter.xScale(), y = scatter.yScale(), x0 = x0 || x, 
                y0 = y0 || y;
                var wrap = container.selectAll("g.nv-wrap.nv-line").data([ data ]), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-line"), defsEnter = wrapEnter.append("defs"), gEnter = wrapEnter.append("g"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-groups"), gEnter.append("g").attr("class", "nv-scatterWrap"), 
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), scatter.width(availableWidth).height(availableHeight);
                var scatterWrap = wrap.select(".nv-scatterWrap");
                scatterWrap.call(scatter), defsEnter.append("clipPath").attr("id", "nv-edge-clip-" + scatter.id()).append("rect"), 
                wrap.select("#nv-edge-clip-" + scatter.id() + " rect").attr("width", availableWidth).attr("height", availableHeight > 0 ? availableHeight : 0), 
                g.attr("clip-path", clipEdge ? "url(#nv-edge-clip-" + scatter.id() + ")" : ""), 
                scatterWrap.attr("clip-path", clipEdge ? "url(#nv-edge-clip-" + scatter.id() + ")" : "");
                var groups = wrap.select(".nv-groups").selectAll(".nv-group").data(function(d) {
                    return d;
                }, function(d) {
                    return d.key;
                });
                groups.enter().append("g").style("stroke-opacity", 1e-6).style("stroke-width", function(d) {
                    return d.strokeWidth || strokeWidth;
                }).style("fill-opacity", 1e-6), groups.exit().remove(), groups.attr("class", function(d, i) {
                    return (d.classed || "") + " nv-group nv-series-" + i;
                }).classed("hover", function(d) {
                    return d.hover;
                }).style("fill", function(d, i) {
                    return color(d, i);
                }).style("stroke", function(d, i) {
                    return color(d, i);
                }), groups.watchTransition(renderWatch, "line: groups").style("stroke-opacity", 1).style("fill-opacity", function(d) {
                    return d.fillOpacity || .5;
                });
                var areaPaths = groups.selectAll("path.nv-area").data(function(d) {
                    return isArea(d) ? [ d ] : [];
                });
                areaPaths.enter().append("path").attr("class", "nv-area").attr("d", function(d) {
                    return d3.svg.area().interpolate(interpolate).defined(defined).x(function(d, i) {
                        return nv.utils.NaNtoZero(x0(getX(d, i)));
                    }).y0(function(d, i) {
                        return nv.utils.NaNtoZero(y0(getY(d, i)));
                    }).y1(function(d, i) {
                        return y0(y.domain()[0] <= 0 ? y.domain()[1] >= 0 ? 0 : y.domain()[1] : y.domain()[0]);
                    }).apply(this, [ d.values ]);
                }), groups.exit().selectAll("path.nv-area").remove(), areaPaths.watchTransition(renderWatch, "line: areaPaths").attr("d", function(d) {
                    return d3.svg.area().interpolate(interpolate).defined(defined).x(function(d, i) {
                        return nv.utils.NaNtoZero(x(getX(d, i)));
                    }).y0(function(d, i) {
                        return nv.utils.NaNtoZero(y(getY(d, i)));
                    }).y1(function(d, i) {
                        return y(y.domain()[0] <= 0 ? y.domain()[1] >= 0 ? 0 : y.domain()[1] : y.domain()[0]);
                    }).apply(this, [ d.values ]);
                });
                var linePaths = groups.selectAll("path.nv-line").data(function(d) {
                    return [ d.values ];
                });
                linePaths.enter().append("path").attr("class", "nv-line").attr("d", d3.svg.line().interpolate(interpolate).defined(defined).x(function(d, i) {
                    return nv.utils.NaNtoZero(x0(getX(d, i)));
                }).y(function(d, i) {
                    return nv.utils.NaNtoZero(y0(getY(d, i)));
                })), linePaths.watchTransition(renderWatch, "line: linePaths").attr("d", d3.svg.line().interpolate(interpolate).defined(defined).x(function(d, i) {
                    return nv.utils.NaNtoZero(x(getX(d, i)));
                }).y(function(d, i) {
                    return nv.utils.NaNtoZero(y(getY(d, i)));
                })), x0 = x.copy(), y0 = y.copy();
            }), renderWatch.renderEnd("line immediate"), chart;
        }
        var x, y, scatter = nv.models.scatter(), margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, width = 960, height = 500, container = null, strokeWidth = 1.5, color = nv.utils.defaultColor(), getX = function(d) {
            return d.x;
        }, getY = function(d) {
            return d.y;
        }, defined = function(d, i) {
            return !isNaN(getY(d, i)) && null !== getY(d, i);
        }, isArea = function(d) {
            return d.area;
        }, clipEdge = !1, interpolate = "linear", duration = 250, dispatch = d3.dispatch("elementClick", "elementMouseover", "elementMouseout", "renderEnd");
        scatter.pointSize(16).pointDomain([ 16, 256 ]);
        var x0, y0, renderWatch = nv.utils.renderWatch(dispatch, duration);
        return chart.dispatch = dispatch, chart.scatter = scatter, scatter.dispatch.on("elementClick", function() {
            dispatch.elementClick.apply(this, arguments);
        }), scatter.dispatch.on("elementMouseover", function() {
            dispatch.elementMouseover.apply(this, arguments);
        }), scatter.dispatch.on("elementMouseout", function() {
            dispatch.elementMouseout.apply(this, arguments);
        }), chart.options = nv.utils.optionsFunc.bind(chart), chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            defined: {
                get: function() {
                    return defined;
                },
                set: function(_) {
                    defined = _;
                }
            },
            interpolate: {
                get: function() {
                    return interpolate;
                },
                set: function(_) {
                    interpolate = _;
                }
            },
            clipEdge: {
                get: function() {
                    return clipEdge;
                },
                set: function(_) {
                    clipEdge = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration), scatter.duration(duration);
                }
            },
            isArea: {
                get: function() {
                    return isArea;
                },
                set: function(_) {
                    isArea = d3.functor(_);
                }
            },
            x: {
                get: function() {
                    return getX;
                },
                set: function(_) {
                    getX = _, scatter.x(_);
                }
            },
            y: {
                get: function() {
                    return getY;
                },
                set: function(_) {
                    getY = _, scatter.y(_);
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_), scatter.color(color);
                }
            }
        }), nv.utils.inheritOptions(chart, scatter), nv.utils.initOptions(chart), chart;
    }, nv.models.lineChart = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), renderWatch.models(lines), showXAxis && renderWatch.models(xAxis), 
            showYAxis && renderWatch.models(yAxis), selection.each(function(data) {
                function updateXAxis() {
                    showXAxis && g.select(".nv-focus .nv-x.nv-axis").transition().duration(duration).call(xAxis);
                }
                function updateYAxis() {
                    showYAxis && g.select(".nv-focus .nv-y.nv-axis").transition().duration(duration).call(yAxis);
                }
                function onBrush(extent) {
                    var focusLinesWrap = g.select(".nv-focus .nv-linesWrap").datum(data.filter(function(d) {
                        return !d.disabled;
                    }).map(function(d, i) {
                        return {
                            key: d.key,
                            area: d.area,
                            classed: d.classed,
                            values: d.values.filter(function(d, i) {
                                return lines.x()(d, i) >= extent[0] && lines.x()(d, i) <= extent[1];
                            }),
                            disableTooltip: d.disableTooltip
                        };
                    }));
                    focusLinesWrap.transition().duration(duration).call(lines), updateXAxis(), updateYAxis();
                }
                var container = d3.select(this);
                nv.utils.initSVG(container);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin) - (focusEnable ? focus.height() : 0);
                if (chart.update = function() {
                    0 === duration ? container.call(chart) : container.transition().duration(duration).call(chart);
                }, chart.container = this, state.setter(stateSetter(data), chart.update).getter(stateGetter(data)).update(), 
                state.disabled = data.map(function(d) {
                    return !!d.disabled;
                }), !defaultState) {
                    var key;
                    defaultState = {};
                    for (key in state) state[key] instanceof Array ? defaultState[key] = state[key].slice(0) : defaultState[key] = state[key];
                }
                if (!(data && data.length && data.filter(function(d) {
                    return d.values.length;
                }).length)) return nv.utils.noData(chart, container), chart;
                container.selectAll(".nv-noData").remove(), focus.dispatch.on("onBrush", function(extent) {
                    onBrush(extent);
                }), x = lines.xScale(), y = lines.yScale();
                var wrap = container.selectAll("g.nv-wrap.nv-lineChart").data([ data ]), gEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-lineChart").append("g"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-legendWrap");
                var focusEnter = gEnter.append("g").attr("class", "nv-focus");
                focusEnter.append("g").attr("class", "nv-background").append("rect"), focusEnter.append("g").attr("class", "nv-x nv-axis"), 
                focusEnter.append("g").attr("class", "nv-y nv-axis"), focusEnter.append("g").attr("class", "nv-linesWrap"), 
                focusEnter.append("g").attr("class", "nv-interactive");
                gEnter.append("g").attr("class", "nv-focusWrap");
                showLegend ? (legend.width(availableWidth), g.select(".nv-legendWrap").datum(data).call(legend), 
                "bottom" === legendPosition ? (margin.bottom = xAxis.height() + legend.height(), 
                availableHeight = nv.utils.availableHeight(height, container, margin), g.select(".nv-legendWrap").attr("transform", "translate(0," + (availableHeight + xAxis.height()) + ")")) : "top" === legendPosition && (marginTop || legend.height() === margin.top || (margin.top = legend.height(), 
                availableHeight = nv.utils.availableHeight(height, container, margin) - (focusEnable ? focus.height() : 0)), 
                wrap.select(".nv-legendWrap").attr("transform", "translate(0," + -margin.top + ")"))) : g.select(".nv-legendWrap").selectAll("*").remove(), 
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), rightAlignYAxis && g.select(".nv-y.nv-axis").attr("transform", "translate(" + availableWidth + ",0)"), 
                useInteractiveGuideline && (interactiveLayer.width(availableWidth).height(availableHeight).margin({
                    left: margin.left,
                    top: margin.top
                }).svgContainer(container).xScale(x), wrap.select(".nv-interactive").call(interactiveLayer)), 
                g.select(".nv-focus .nv-background rect").attr("width", availableWidth).attr("height", availableHeight), 
                lines.width(availableWidth).height(availableHeight).color(data.map(function(d, i) {
                    return d.color || color(d, i);
                }).filter(function(d, i) {
                    return !data[i].disabled;
                }));
                var linesWrap = g.select(".nv-linesWrap").datum(data.filter(function(d) {
                    return !d.disabled;
                }));
                if (showXAxis && xAxis.scale(x)._ticks(nv.utils.calcTicksX(availableWidth / 100, data)).tickSize(-availableHeight, 0), 
                showYAxis && yAxis.scale(y)._ticks(nv.utils.calcTicksY(availableHeight / 36, data)).tickSize(-availableWidth, 0), 
                g.select(".nv-focus .nv-x.nv-axis").attr("transform", "translate(0," + availableHeight + ")"), 
                focusEnable || null !== focus.brush.extent()) {
                    focus.width(availableWidth), g.select(".nv-focusWrap").style("display", focusEnable ? "initial" : "none").attr("transform", "translate(0," + (availableHeight + margin.bottom + focus.margin().top) + ")").call(focus);
                    var extent = focus.brush.empty() ? focus.xDomain() : focus.brush.extent();
                    null !== extent && onBrush(extent);
                } else linesWrap.transition().call(lines), updateXAxis(), updateYAxis();
                legend.dispatch.on("stateChange", function(newState) {
                    for (var key in newState) state[key] = newState[key];
                    dispatch.stateChange(state), chart.update();
                }), interactiveLayer.dispatch.on("elementMousemove", function(e) {
                    lines.clearHighlights();
                    var singlePoint, pointIndex, pointXLocation, allData = [];
                    if (data.filter(function(series, i) {
                        return series.seriesIndex = i, !series.disabled && !series.disableTooltip;
                    }).forEach(function(series, i) {
                        var extent = null !== focus.brush.extent() ? focus.brush.empty() ? focus.xScale().domain() : focus.brush.extent() : x.domain(), currentValues = series.values.filter(function(d, i) {
                            return extent[0] <= extent[1] ? lines.x()(d, i) >= extent[0] && lines.x()(d, i) <= extent[1] : lines.x()(d, i) >= extent[1] && lines.x()(d, i) <= extent[0];
                        });
                        if (currentValues.length > 0) {
                            pointIndex = nv.interactiveBisect(currentValues, e.pointXValue, lines.x());
                            var point = currentValues[pointIndex], pointYValue = chart.y()(point, pointIndex);
                            if (null !== pointYValue && lines.highlightPoint(i, series.values.indexOf(point), !0), 
                            void 0 === point) return;
                            void 0 === singlePoint && (singlePoint = point), void 0 === pointXLocation && (pointXLocation = chart.xScale()(chart.x()(point, pointIndex))), 
                            allData.push({
                                key: series.key,
                                value: pointYValue,
                                color: color(series, series.seriesIndex),
                                data: point
                            });
                        }
                    }), allData.length > 2) {
                        var yValue = chart.yScale().invert(e.mouseY), domainExtent = Math.abs(chart.yScale().domain()[0] - chart.yScale().domain()[1]), threshold = .03 * domainExtent, indexToHighlight = nv.nearestValueIndex(allData.map(function(d) {
                            return d.value;
                        }), yValue, threshold);
                        null !== indexToHighlight && (allData[indexToHighlight].highlight = !0);
                    }
                    var defaultValueFormatter = function(d, i) {
                        return null == d ? "N/A" : yAxis.tickFormat()(d);
                    };
                    "undefined" != typeof pointIndex && (interactiveLayer.tooltip.valueFormatter(interactiveLayer.tooltip.valueFormatter() || defaultValueFormatter).data({
                        value: chart.x()(singlePoint, pointIndex),
                        index: pointIndex,
                        series: allData
                    })(), interactiveLayer.renderGuideLine(pointXLocation));
                }), interactiveLayer.dispatch.on("elementClick", function(e) {
                    var pointXLocation, allData = [];
                    data.filter(function(series, i) {
                        return series.seriesIndex = i, !series.disabled;
                    }).forEach(function(series) {
                        var pointIndex = nv.interactiveBisect(series.values, e.pointXValue, chart.x()), point = series.values[pointIndex];
                        if ("undefined" != typeof point) {
                            "undefined" == typeof pointXLocation && (pointXLocation = chart.xScale()(chart.x()(point, pointIndex)));
                            var yPos = chart.yScale()(chart.y()(point, pointIndex));
                            allData.push({
                                point: point,
                                pointIndex: pointIndex,
                                pos: [ pointXLocation, yPos ],
                                seriesIndex: series.seriesIndex,
                                series: series
                            });
                        }
                    }), lines.dispatch.elementClick(allData);
                }), interactiveLayer.dispatch.on("elementMouseout", function(e) {
                    lines.clearHighlights();
                }), dispatch.on("changeState", function(e) {
                    "undefined" != typeof e.disabled && data.length === e.disabled.length && (data.forEach(function(series, i) {
                        series.disabled = e.disabled[i];
                    }), state.disabled = e.disabled), chart.update();
                });
            }), renderWatch.renderEnd("lineChart immediate"), chart;
        }
        var x, y, lines = nv.models.line(), xAxis = nv.models.axis(), yAxis = nv.models.axis(), legend = nv.models.legend(), interactiveLayer = nv.interactiveGuideline(), tooltip = nv.models.tooltip(), focus = nv.models.focus(nv.models.line()), margin = {
            top: 30,
            right: 20,
            bottom: 50,
            left: 60
        }, marginTop = null, color = nv.utils.defaultColor(), width = null, height = null, showLegend = !0, legendPosition = "top", showXAxis = !0, showYAxis = !0, rightAlignYAxis = !1, useInteractiveGuideline = !1, focusEnable = !1, state = nv.utils.state(), defaultState = null, noData = null, dispatch = d3.dispatch("stateChange", "changeState", "renderEnd"), duration = 250;
        xAxis.orient("bottom").tickPadding(7), yAxis.orient(rightAlignYAxis ? "right" : "left"), 
        lines.clipEdge(!0).duration(0), tooltip.valueFormatter(function(d, i) {
            return yAxis.tickFormat()(d, i);
        }).headerFormatter(function(d, i) {
            return xAxis.tickFormat()(d, i);
        }), interactiveLayer.tooltip.valueFormatter(function(d, i) {
            return yAxis.tickFormat()(d, i);
        }).headerFormatter(function(d, i) {
            return xAxis.tickFormat()(d, i);
        });
        var renderWatch = nv.utils.renderWatch(dispatch, duration), stateGetter = function(data) {
            return function() {
                return {
                    active: data.map(function(d) {
                        return !d.disabled;
                    })
                };
            };
        }, stateSetter = function(data) {
            return function(state) {
                void 0 !== state.active && data.forEach(function(series, i) {
                    series.disabled = !state.active[i];
                });
            };
        };
        return lines.dispatch.on("elementMouseover.tooltip", function(evt) {
            evt.series.disableTooltip || tooltip.data(evt).hidden(!1);
        }), lines.dispatch.on("elementMouseout.tooltip", function(evt) {
            tooltip.hidden(!0);
        }), chart.dispatch = dispatch, chart.lines = lines, chart.legend = legend, chart.focus = focus, 
        chart.xAxis = xAxis, chart.x2Axis = focus.xAxis, chart.yAxis = yAxis, chart.y2Axis = focus.yAxis, 
        chart.interactiveLayer = interactiveLayer, chart.tooltip = tooltip, chart.state = state, 
        chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            showLegend: {
                get: function() {
                    return showLegend;
                },
                set: function(_) {
                    showLegend = _;
                }
            },
            legendPosition: {
                get: function() {
                    return legendPosition;
                },
                set: function(_) {
                    legendPosition = _;
                }
            },
            showXAxis: {
                get: function() {
                    return showXAxis;
                },
                set: function(_) {
                    showXAxis = _;
                }
            },
            showYAxis: {
                get: function() {
                    return showYAxis;
                },
                set: function(_) {
                    showYAxis = _;
                }
            },
            defaultState: {
                get: function() {
                    return defaultState;
                },
                set: function(_) {
                    defaultState = _;
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            focusEnable: {
                get: function() {
                    return focusEnable;
                },
                set: function(_) {
                    focusEnable = _;
                }
            },
            focusHeight: {
                get: function() {
                    return focus.height();
                },
                set: function(_) {
                    focus.height(_);
                }
            },
            focusShowAxisX: {
                get: function() {
                    return focus.showXAxis();
                },
                set: function(_) {
                    focus.showXAxis(_);
                }
            },
            focusShowAxisY: {
                get: function() {
                    return focus.showYAxis();
                },
                set: function(_) {
                    focus.showYAxis(_);
                }
            },
            brushExtent: {
                get: function() {
                    return focus.brushExtent();
                },
                set: function(_) {
                    focus.brushExtent(_);
                }
            },
            focusMargin: {
                get: function() {
                    return focus.margin;
                },
                set: function(_) {
                    void 0 !== _.top && (margin.top = _.top, marginTop = _.top), focus.margin.right = void 0 !== _.right ? _.right : focus.margin.right, 
                    focus.margin.bottom = void 0 !== _.bottom ? _.bottom : focus.margin.bottom, focus.margin.left = void 0 !== _.left ? _.left : focus.margin.left;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration), lines.duration(duration), focus.duration(duration), 
                    xAxis.duration(duration), yAxis.duration(duration);
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_), legend.color(color), lines.color(color), focus.color(color);
                }
            },
            interpolate: {
                get: function() {
                    return lines.interpolate();
                },
                set: function(_) {
                    lines.interpolate(_), focus.interpolate(_);
                }
            },
            xTickFormat: {
                get: function() {
                    return xAxis.tickFormat();
                },
                set: function(_) {
                    xAxis.tickFormat(_), focus.xTickFormat(_);
                }
            },
            yTickFormat: {
                get: function() {
                    return yAxis.tickFormat();
                },
                set: function(_) {
                    yAxis.tickFormat(_), focus.yTickFormat(_);
                }
            },
            x: {
                get: function() {
                    return lines.x();
                },
                set: function(_) {
                    lines.x(_), focus.x(_);
                }
            },
            y: {
                get: function() {
                    return lines.y();
                },
                set: function(_) {
                    lines.y(_), focus.y(_);
                }
            },
            rightAlignYAxis: {
                get: function() {
                    return rightAlignYAxis;
                },
                set: function(_) {
                    rightAlignYAxis = _, yAxis.orient(rightAlignYAxis ? "right" : "left");
                }
            },
            useInteractiveGuideline: {
                get: function() {
                    return useInteractiveGuideline;
                },
                set: function(_) {
                    useInteractiveGuideline = _, useInteractiveGuideline && (lines.interactive(!1), 
                    lines.useVoronoi(!1));
                }
            }
        }), nv.utils.inheritOptions(chart, lines), nv.utils.initOptions(chart), chart;
    }, nv.models.lineWithFocusChart = function() {
        return nv.models.lineChart().margin({
            bottom: 30
        }).focusEnable(!0);
    }, nv.models.linePlusBarChart = function() {
        "use strict";
        function chart(selection) {
            return selection.each(function(data) {
                function resizePath(d) {
                    var e = +("e" == d), x = e ? 1 : -1, y = availableHeight2 / 3;
                    return "M" + .5 * x + "," + y + "A6,6 0 0 " + e + " " + 6.5 * x + "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + .5 * x + "," + 2 * y + "ZM" + 2.5 * x + "," + (y + 8) + "V" + (2 * y - 8) + "M" + 4.5 * x + "," + (y + 8) + "V" + (2 * y - 8);
                }
                function updateBrushBG() {
                    brush.empty() || brush.extent(brushExtent), brushBG.data([ brush.empty() ? x2.domain() : brushExtent ]).each(function(d, i) {
                        var leftWidth = x2(d[0]) - x2.range()[0], rightWidth = x2.range()[1] - x2(d[1]);
                        d3.select(this).select(".left").attr("width", leftWidth < 0 ? 0 : leftWidth), d3.select(this).select(".right").attr("x", x2(d[1])).attr("width", rightWidth < 0 ? 0 : rightWidth);
                    });
                }
                function onBrush() {
                    brushExtent = brush.empty() ? null : brush.extent(), extent = brush.empty() ? x2.domain() : brush.extent(), 
                    dispatch.brush({
                        extent: extent,
                        brush: brush
                    }), updateBrushBG(), bars.width(availableWidth).height(availableHeight1).color(data.map(function(d, i) {
                        return d.color || color(d, i);
                    }).filter(function(d, i) {
                        return !data[i].disabled && data[i].bar;
                    })), lines.width(availableWidth).height(availableHeight1).color(data.map(function(d, i) {
                        return d.color || color(d, i);
                    }).filter(function(d, i) {
                        return !data[i].disabled && !data[i].bar;
                    }));
                    var focusBarsWrap = g.select(".nv-focus .nv-barsWrap").datum(dataBars.length ? dataBars.map(function(d, i) {
                        return {
                            key: d.key,
                            values: d.values.filter(function(d, i) {
                                return bars.x()(d, i) >= extent[0] && bars.x()(d, i) <= extent[1];
                            })
                        };
                    }) : [ {
                        values: []
                    } ]), focusLinesWrap = g.select(".nv-focus .nv-linesWrap").datum(allDisabled(dataLines) ? [ {
                        values: []
                    } ] : dataLines.filter(function(dataLine) {
                        return !dataLine.disabled;
                    }).map(function(d, i) {
                        return {
                            area: d.area,
                            fillOpacity: d.fillOpacity,
                            strokeWidth: d.strokeWidth,
                            key: d.key,
                            values: d.values.filter(function(d, i) {
                                return lines.x()(d, i) >= extent[0] && lines.x()(d, i) <= extent[1];
                            })
                        };
                    }));
                    x = dataBars.length && !switchYAxisOrder ? bars.xScale() : lines.xScale(), xAxis.scale(x)._ticks(nv.utils.calcTicksX(availableWidth / 100, data)).tickSize(-availableHeight1, 0), 
                    xAxis.domain([ Math.ceil(extent[0]), Math.floor(extent[1]) ]), g.select(".nv-x.nv-axis").transition().duration(transitionDuration).call(xAxis), 
                    focusBarsWrap.transition().duration(transitionDuration).call(bars), focusLinesWrap.transition().duration(transitionDuration).call(lines), 
                    g.select(".nv-focus .nv-x.nv-axis").attr("transform", "translate(0," + y1.range()[0] + ")"), 
                    y1Axis.scale(y1)._ticks(nv.utils.calcTicksY(availableHeight1 / 36, data)).tickSize(-availableWidth, 0), 
                    y2Axis.scale(y2)._ticks(nv.utils.calcTicksY(availableHeight1 / 36, data)), switchYAxisOrder ? y2Axis.tickSize(dataLines.length ? 0 : -availableWidth, 0) : y2Axis.tickSize(dataBars.length ? 0 : -availableWidth, 0);
                    var barsOpacity = dataBars.length ? 1 : 0, linesOpacity = dataLines.length && !allDisabled(dataLines) ? 1 : 0, y1Opacity = switchYAxisOrder ? linesOpacity : barsOpacity, y2Opacity = switchYAxisOrder ? barsOpacity : linesOpacity;
                    g.select(".nv-focus .nv-y1.nv-axis").style("opacity", y1Opacity), g.select(".nv-focus .nv-y2.nv-axis").style("opacity", y2Opacity).attr("transform", "translate(" + x.range()[1] + ",0)"), 
                    g.select(".nv-focus .nv-y1.nv-axis").transition().duration(transitionDuration).call(y1Axis), 
                    g.select(".nv-focus .nv-y2.nv-axis").transition().duration(transitionDuration).call(y2Axis);
                }
                var container = d3.select(this);
                nv.utils.initSVG(container);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight1 = nv.utils.availableHeight(height, container, margin) - (focusEnable ? focusHeight : 0), availableHeight2 = focusHeight - margin2.top - margin2.bottom;
                if (chart.update = function() {
                    container.transition().duration(transitionDuration).call(chart);
                }, chart.container = this, state.setter(stateSetter(data), chart.update).getter(stateGetter(data)).update(), 
                state.disabled = data.map(function(d) {
                    return !!d.disabled;
                }), !defaultState) {
                    var key;
                    defaultState = {};
                    for (key in state) state[key] instanceof Array ? defaultState[key] = state[key].slice(0) : defaultState[key] = state[key];
                }
                if (!(data && data.length && data.filter(function(d) {
                    return d.values.length;
                }).length)) return nv.utils.noData(chart, container), chart;
                container.selectAll(".nv-noData").remove();
                var dataBars = data.filter(function(d) {
                    return !d.disabled && d.bar;
                }), dataLines = data.filter(function(d) {
                    return !d.bar;
                });
                x = dataBars.length && !switchYAxisOrder ? bars.xScale() : lines.xScale(), x2 = x2Axis.scale(), 
                y1 = switchYAxisOrder ? lines.yScale() : bars.yScale(), y2 = switchYAxisOrder ? bars.yScale() : lines.yScale(), 
                y3 = switchYAxisOrder ? lines2.yScale() : bars2.yScale(), y4 = switchYAxisOrder ? bars2.yScale() : lines2.yScale();
                var series1 = data.filter(function(d) {
                    return !d.disabled && (switchYAxisOrder ? !d.bar : d.bar);
                }).map(function(d) {
                    return d.values.map(function(d, i) {
                        return {
                            x: getX(d, i),
                            y: getY(d, i)
                        };
                    });
                }), series2 = data.filter(function(d) {
                    return !d.disabled && (switchYAxisOrder ? d.bar : !d.bar);
                }).map(function(d) {
                    return d.values.map(function(d, i) {
                        return {
                            x: getX(d, i),
                            y: getY(d, i)
                        };
                    });
                });
                x.range([ 0, availableWidth ]), x2.domain(d3.extent(d3.merge(series1.concat(series2)), function(d) {
                    return d.x;
                })).range([ 0, availableWidth ]);
                var wrap = container.selectAll("g.nv-wrap.nv-linePlusBar").data([ data ]), gEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-linePlusBar").append("g"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-legendWrap");
                var focusEnter = gEnter.append("g").attr("class", "nv-focus");
                focusEnter.append("g").attr("class", "nv-x nv-axis"), focusEnter.append("g").attr("class", "nv-y1 nv-axis"), 
                focusEnter.append("g").attr("class", "nv-y2 nv-axis"), focusEnter.append("g").attr("class", "nv-barsWrap"), 
                focusEnter.append("g").attr("class", "nv-linesWrap");
                var contextEnter = gEnter.append("g").attr("class", "nv-context");
                if (contextEnter.append("g").attr("class", "nv-x nv-axis"), contextEnter.append("g").attr("class", "nv-y1 nv-axis"), 
                contextEnter.append("g").attr("class", "nv-y2 nv-axis"), contextEnter.append("g").attr("class", "nv-barsWrap"), 
                contextEnter.append("g").attr("class", "nv-linesWrap"), contextEnter.append("g").attr("class", "nv-brushBackground"), 
                contextEnter.append("g").attr("class", "nv-x nv-brush"), showLegend) {
                    var legendWidth = legend.align() ? availableWidth / 2 : availableWidth, legendXPosition = legend.align() ? legendWidth : 0;
                    legend.width(legendWidth), g.select(".nv-legendWrap").datum(data.map(function(series) {
                        return series.originalKey = void 0 === series.originalKey ? series.key : series.originalKey, 
                        switchYAxisOrder ? series.key = series.originalKey + (series.bar ? legendRightAxisHint : legendLeftAxisHint) : series.key = series.originalKey + (series.bar ? legendLeftAxisHint : legendRightAxisHint), 
                        series;
                    })).call(legend), marginTop || legend.height() === margin.top || (margin.top = legend.height(), 
                    availableHeight1 = nv.utils.availableHeight(height, container, margin) - focusHeight), 
                    g.select(".nv-legendWrap").attr("transform", "translate(" + legendXPosition + "," + -margin.top + ")");
                } else g.select(".nv-legendWrap").selectAll("*").remove();
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), g.select(".nv-context").style("display", focusEnable ? "initial" : "none"), 
                bars2.width(availableWidth).height(availableHeight2).color(data.map(function(d, i) {
                    return d.color || color(d, i);
                }).filter(function(d, i) {
                    return !data[i].disabled && data[i].bar;
                })), lines2.width(availableWidth).height(availableHeight2).color(data.map(function(d, i) {
                    return d.color || color(d, i);
                }).filter(function(d, i) {
                    return !data[i].disabled && !data[i].bar;
                }));
                var bars2Wrap = g.select(".nv-context .nv-barsWrap").datum(dataBars.length ? dataBars : [ {
                    values: []
                } ]), lines2Wrap = g.select(".nv-context .nv-linesWrap").datum(allDisabled(dataLines) ? [ {
                    values: []
                } ] : dataLines.filter(function(dataLine) {
                    return !dataLine.disabled;
                }));
                g.select(".nv-context").attr("transform", "translate(0," + (availableHeight1 + margin.bottom + margin2.top) + ")"), 
                bars2Wrap.transition().call(bars2), lines2Wrap.transition().call(lines2), focusShowAxisX && (x2Axis._ticks(nv.utils.calcTicksX(availableWidth / 100, data)).tickSize(-availableHeight2, 0), 
                g.select(".nv-context .nv-x.nv-axis").attr("transform", "translate(0," + y3.range()[0] + ")"), 
                g.select(".nv-context .nv-x.nv-axis").transition().call(x2Axis)), focusShowAxisY && (y3Axis.scale(y3)._ticks(availableHeight2 / 36).tickSize(-availableWidth, 0), 
                y4Axis.scale(y4)._ticks(availableHeight2 / 36).tickSize(dataBars.length ? 0 : -availableWidth, 0), 
                g.select(".nv-context .nv-y3.nv-axis").style("opacity", dataBars.length ? 1 : 0).attr("transform", "translate(0," + x2.range()[0] + ")"), 
                g.select(".nv-context .nv-y2.nv-axis").style("opacity", dataLines.length ? 1 : 0).attr("transform", "translate(" + x2.range()[1] + ",0)"), 
                g.select(".nv-context .nv-y1.nv-axis").transition().call(y3Axis), g.select(".nv-context .nv-y2.nv-axis").transition().call(y4Axis)), 
                brush.x(x2).on("brush", onBrush), brushExtent && brush.extent(brushExtent);
                var brushBG = g.select(".nv-brushBackground").selectAll("g").data([ brushExtent || brush.extent() ]), brushBGenter = brushBG.enter().append("g");
                brushBGenter.append("rect").attr("class", "left").attr("x", 0).attr("y", 0).attr("height", availableHeight2), 
                brushBGenter.append("rect").attr("class", "right").attr("x", 0).attr("y", 0).attr("height", availableHeight2);
                var gBrush = g.select(".nv-x.nv-brush").call(brush);
                gBrush.selectAll("rect").attr("height", availableHeight2), gBrush.selectAll(".resize").append("path").attr("d", resizePath), 
                legend.dispatch.on("stateChange", function(newState) {
                    for (var key in newState) state[key] = newState[key];
                    dispatch.stateChange(state), chart.update();
                }), dispatch.on("changeState", function(e) {
                    "undefined" != typeof e.disabled && (data.forEach(function(series, i) {
                        series.disabled = e.disabled[i];
                    }), state.disabled = e.disabled), chart.update();
                }), onBrush();
            }), chart;
        }
        var extent, x, x2, y1, y2, y3, y4, lines = nv.models.line(), lines2 = nv.models.line(), bars = nv.models.historicalBar(), bars2 = nv.models.historicalBar(), xAxis = nv.models.axis(), x2Axis = nv.models.axis(), y1Axis = nv.models.axis(), y2Axis = nv.models.axis(), y3Axis = nv.models.axis(), y4Axis = nv.models.axis(), legend = nv.models.legend(), brush = d3.svg.brush(), tooltip = nv.models.tooltip(), margin = {
            top: 30,
            right: 30,
            bottom: 30,
            left: 60
        }, marginTop = null, margin2 = {
            top: 0,
            right: 30,
            bottom: 20,
            left: 60
        }, width = null, height = null, getX = function(d) {
            return d.x;
        }, getY = function(d) {
            return d.y;
        }, color = nv.utils.defaultColor(), showLegend = !0, focusEnable = !0, focusShowAxisY = !1, focusShowAxisX = !0, focusHeight = 50, brushExtent = null, noData = null, dispatch = d3.dispatch("brush", "stateChange", "changeState"), transitionDuration = 0, state = nv.utils.state(), defaultState = null, legendLeftAxisHint = " (left axis)", legendRightAxisHint = " (right axis)", switchYAxisOrder = !1;
        lines.clipEdge(!0), lines2.interactive(!1), lines2.pointActive(function(d) {
            return !1;
        }), xAxis.orient("bottom").tickPadding(5), y1Axis.orient("left"), y2Axis.orient("right"), 
        x2Axis.orient("bottom").tickPadding(5), y3Axis.orient("left"), y4Axis.orient("right"), 
        tooltip.headerEnabled(!0).headerFormatter(function(d, i) {
            return xAxis.tickFormat()(d, i);
        });
        var getBarsAxis = function() {
            return switchYAxisOrder ? {
                main: y2Axis,
                focus: y4Axis
            } : {
                main: y1Axis,
                focus: y3Axis
            };
        }, getLinesAxis = function() {
            return switchYAxisOrder ? {
                main: y1Axis,
                focus: y3Axis
            } : {
                main: y2Axis,
                focus: y4Axis
            };
        }, stateGetter = function(data) {
            return function() {
                return {
                    active: data.map(function(d) {
                        return !d.disabled;
                    })
                };
            };
        }, stateSetter = function(data) {
            return function(state) {
                void 0 !== state.active && data.forEach(function(series, i) {
                    series.disabled = !state.active[i];
                });
            };
        }, allDisabled = function(data) {
            return data.every(function(series) {
                return series.disabled;
            });
        };
        return lines.dispatch.on("elementMouseover.tooltip", function(evt) {
            tooltip.duration(100).valueFormatter(function(d, i) {
                return getLinesAxis().main.tickFormat()(d, i);
            }).data(evt).hidden(!1);
        }), lines.dispatch.on("elementMouseout.tooltip", function(evt) {
            tooltip.hidden(!0);
        }), bars.dispatch.on("elementMouseover.tooltip", function(evt) {
            evt.value = chart.x()(evt.data), evt.series = {
                value: chart.y()(evt.data),
                color: evt.color
            }, tooltip.duration(0).valueFormatter(function(d, i) {
                return getBarsAxis().main.tickFormat()(d, i);
            }).data(evt).hidden(!1);
        }), bars.dispatch.on("elementMouseout.tooltip", function(evt) {
            tooltip.hidden(!0);
        }), bars.dispatch.on("elementMousemove.tooltip", function(evt) {
            tooltip();
        }), chart.dispatch = dispatch, chart.legend = legend, chart.lines = lines, chart.lines2 = lines2, 
        chart.bars = bars, chart.bars2 = bars2, chart.xAxis = xAxis, chart.x2Axis = x2Axis, 
        chart.y1Axis = y1Axis, chart.y2Axis = y2Axis, chart.y3Axis = y3Axis, chart.y4Axis = y4Axis, 
        chart.tooltip = tooltip, chart.options = nv.utils.optionsFunc.bind(chart), chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            showLegend: {
                get: function() {
                    return showLegend;
                },
                set: function(_) {
                    showLegend = _;
                }
            },
            brushExtent: {
                get: function() {
                    return brushExtent;
                },
                set: function(_) {
                    brushExtent = _;
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            focusEnable: {
                get: function() {
                    return focusEnable;
                },
                set: function(_) {
                    focusEnable = _;
                }
            },
            focusHeight: {
                get: function() {
                    return focusHeight;
                },
                set: function(_) {
                    focusHeight = _;
                }
            },
            focusShowAxisX: {
                get: function() {
                    return focusShowAxisX;
                },
                set: function(_) {
                    focusShowAxisX = _;
                }
            },
            focusShowAxisY: {
                get: function() {
                    return focusShowAxisY;
                },
                set: function(_) {
                    focusShowAxisY = _;
                }
            },
            legendLeftAxisHint: {
                get: function() {
                    return legendLeftAxisHint;
                },
                set: function(_) {
                    legendLeftAxisHint = _;
                }
            },
            legendRightAxisHint: {
                get: function() {
                    return legendRightAxisHint;
                },
                set: function(_) {
                    legendRightAxisHint = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    void 0 !== _.top && (margin.top = _.top, marginTop = _.top), margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            focusMargin: {
                get: function() {
                    return margin2;
                },
                set: function(_) {
                    margin2.top = void 0 !== _.top ? _.top : margin2.top, margin2.right = void 0 !== _.right ? _.right : margin2.right, 
                    margin2.bottom = void 0 !== _.bottom ? _.bottom : margin2.bottom, margin2.left = void 0 !== _.left ? _.left : margin2.left;
                }
            },
            duration: {
                get: function() {
                    return transitionDuration;
                },
                set: function(_) {
                    transitionDuration = _;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_), legend.color(color);
                }
            },
            x: {
                get: function() {
                    return getX;
                },
                set: function(_) {
                    getX = _, lines.x(_), lines2.x(_), bars.x(_), bars2.x(_);
                }
            },
            y: {
                get: function() {
                    return getY;
                },
                set: function(_) {
                    getY = _, lines.y(_), lines2.y(_), bars.y(_), bars2.y(_);
                }
            },
            switchYAxisOrder: {
                get: function() {
                    return switchYAxisOrder;
                },
                set: function(_) {
                    if (switchYAxisOrder !== _) {
                        var y1 = y1Axis;
                        y1Axis = y2Axis, y2Axis = y1;
                        var y3 = y3Axis;
                        y3Axis = y4Axis, y4Axis = y3;
                    }
                    switchYAxisOrder = _, y1Axis.orient("left"), y2Axis.orient("right"), y3Axis.orient("left"), 
                    y4Axis.orient("right");
                }
            }
        }), nv.utils.inheritOptions(chart, lines), nv.utils.initOptions(chart), chart;
    }, nv.models.multiBar = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), selection.each(function(data) {
                var availableWidth = width - margin.left - margin.right, availableHeight = height - margin.top - margin.bottom;
                container = d3.select(this), nv.utils.initSVG(container);
                var nonStackableCount = 0;
                if (hideable && data.length && (hideable = [ {
                    values: data[0].values.map(function(d) {
                        return {
                            x: d.x,
                            y: 0,
                            series: d.series,
                            size: .01
                        };
                    })
                } ]), stacked) {
                    var parsed = d3.layout.stack().offset(stackOffset).values(function(d) {
                        return d.values;
                    }).y(getY)(!data.length && hideable ? hideable : data);
                    parsed.forEach(function(series, i) {
                        series.nonStackable ? (data[i].nonStackableSeries = nonStackableCount++, parsed[i] = data[i]) : i > 0 && parsed[i - 1].nonStackable && parsed[i].values.map(function(d, j) {
                            d.y0 -= parsed[i - 1].values[j].y, d.y1 = d.y0 + d.y;
                        });
                    }), data = parsed;
                }
                data.forEach(function(series, i) {
                    series.values.forEach(function(point) {
                        point.series = i, point.key = series.key;
                    });
                }), stacked && data.length > 0 && data[0].values.map(function(d, i) {
                    var posBase = 0, negBase = 0;
                    data.map(function(d, idx) {
                        if (!data[idx].nonStackable) {
                            var f = d.values[i];
                            f.size = Math.abs(f.y), f.y < 0 ? (f.y1 = negBase, negBase -= f.size) : (f.y1 = f.size + posBase, 
                            posBase += f.size);
                        }
                    });
                });
                var seriesData = xDomain && yDomain ? [] : data.map(function(d, idx) {
                    return d.values.map(function(d, i) {
                        return {
                            x: getX(d, i),
                            y: getY(d, i),
                            y0: d.y0,
                            y1: d.y1,
                            idx: idx
                        };
                    });
                });
                x.domain(xDomain || d3.merge(seriesData).map(function(d) {
                    return d.x;
                })).rangeBands(xRange || [ 0, availableWidth ], groupSpacing), y.domain(yDomain || d3.extent(d3.merge(seriesData).map(function(d) {
                    var domain = d.y;
                    return stacked && !data[d.idx].nonStackable && (domain = d.y > 0 ? d.y1 : d.y1 + d.y), 
                    domain;
                }).concat(forceY))).range(yRange || [ availableHeight, 0 ]), x.domain()[0] === x.domain()[1] && (x.domain()[0] ? x.domain([ x.domain()[0] - .01 * x.domain()[0], x.domain()[1] + .01 * x.domain()[1] ]) : x.domain([ -1, 1 ])), 
                y.domain()[0] === y.domain()[1] && (y.domain()[0] ? y.domain([ y.domain()[0] + .01 * y.domain()[0], y.domain()[1] - .01 * y.domain()[1] ]) : y.domain([ -1, 1 ])), 
                x0 = x0 || x, y0 = y0 || y;
                var wrap = container.selectAll("g.nv-wrap.nv-multibar").data([ data ]), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-multibar"), defsEnter = wrapEnter.append("defs"), gEnter = wrapEnter.append("g"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-groups"), wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), 
                defsEnter.append("clipPath").attr("id", "nv-edge-clip-" + id).append("rect"), wrap.select("#nv-edge-clip-" + id + " rect").attr("width", availableWidth).attr("height", availableHeight), 
                g.attr("clip-path", clipEdge ? "url(#nv-edge-clip-" + id + ")" : "");
                var groups = wrap.select(".nv-groups").selectAll(".nv-group").data(function(d) {
                    return d;
                }, function(d, i) {
                    return i;
                });
                groups.enter().append("g").style("stroke-opacity", 1e-6).style("fill-opacity", 1e-6);
                var exitTransition = renderWatch.transition(groups.exit().selectAll("rect.nv-bar"), "multibarExit", Math.min(100, duration)).attr("y", function(d, i, j) {
                    var yVal = y0(0) || 0;
                    return stacked && data[d.series] && !data[d.series].nonStackable && (yVal = y0(d.y0)), 
                    yVal;
                }).attr("height", 0).remove();
                exitTransition.delay && exitTransition.delay(function(d, i) {
                    var delay = i * (duration / (last_datalength + 1)) - i;
                    return delay;
                }), groups.attr("class", function(d, i) {
                    return "nv-group nv-series-" + i;
                }).classed("hover", function(d) {
                    return d.hover;
                }).style("fill", function(d, i) {
                    return color(d, i);
                }).style("stroke", function(d, i) {
                    return color(d, i);
                }), groups.style("stroke-opacity", 1).style("fill-opacity", fillOpacity);
                var bars = groups.selectAll("rect.nv-bar").data(function(d) {
                    return hideable && !data.length ? hideable.values : d.values;
                });
                bars.exit().remove();
                bars.enter().append("rect").attr("class", function(d, i) {
                    return getY(d, i) < 0 ? "nv-bar negative" : "nv-bar positive";
                }).attr("x", function(d, i, j) {
                    return stacked && !data[j].nonStackable ? 0 : j * x.rangeBand() / data.length;
                }).attr("y", function(d, i, j) {
                    return y0(stacked && !data[j].nonStackable ? d.y0 : 0) || 0;
                }).attr("height", 0).attr("width", function(d, i, j) {
                    return x.rangeBand() / (stacked && !data[j].nonStackable ? 1 : data.length);
                }).attr("transform", function(d, i) {
                    return "translate(" + x(getX(d, i)) + ",0)";
                });
                bars.style("fill", function(d, i, j) {
                    return color(d, j, i);
                }).style("stroke", function(d, i, j) {
                    return color(d, j, i);
                }).on("mouseover", function(d, i, j) {
                    d3.select(this).classed("hover", !0), dispatch.elementMouseover({
                        data: d,
                        index: i,
                        series: data[j],
                        color: d3.select(this).style("fill")
                    });
                }).on("mouseout", function(d, i, j) {
                    d3.select(this).classed("hover", !1), dispatch.elementMouseout({
                        data: d,
                        index: i,
                        series: data[j],
                        color: d3.select(this).style("fill")
                    });
                }).on("mousemove", function(d, i, j) {
                    dispatch.elementMousemove({
                        data: d,
                        index: i,
                        series: data[j],
                        color: d3.select(this).style("fill")
                    });
                }).on("click", function(d, i, j) {
                    var element = this;
                    dispatch.elementClick({
                        data: d,
                        index: i,
                        series: data[j],
                        color: d3.select(this).style("fill"),
                        event: d3.event,
                        element: element
                    }), d3.event.stopPropagation();
                }).on("dblclick", function(d, i, j) {
                    dispatch.elementDblClick({
                        data: d,
                        index: i,
                        series: data[j],
                        color: d3.select(this).style("fill")
                    }), d3.event.stopPropagation();
                }), bars.attr("class", function(d, i) {
                    return getY(d, i) < 0 ? "nv-bar negative" : "nv-bar positive";
                }).attr("transform", function(d, i) {
                    return "translate(" + x(getX(d, i)) + ",0)";
                }), barColor && (disabled || (disabled = data.map(function() {
                    return !0;
                })), bars.style("fill", function(d, i, j) {
                    return d3.rgb(barColor(d, i)).darker(disabled.map(function(d, i) {
                        return i;
                    }).filter(function(d, i) {
                        return !disabled[i];
                    })[j]).toString();
                }).style("stroke", function(d, i, j) {
                    return d3.rgb(barColor(d, i)).darker(disabled.map(function(d, i) {
                        return i;
                    }).filter(function(d, i) {
                        return !disabled[i];
                    })[j]).toString();
                }));
                var barSelection = bars.watchTransition(renderWatch, "multibar", Math.min(250, duration)).delay(function(d, i) {
                    return i * duration / data[0].values.length;
                });
                stacked ? barSelection.attr("y", function(d, i, j) {
                    var yVal = 0;
                    return yVal = data[j].nonStackable ? getY(d, i) < 0 ? y(0) : y(0) - y(getY(d, i)) < -1 ? y(0) - 1 : y(getY(d, i)) || 0 : y(d.y1);
                }).attr("height", function(d, i, j) {
                    return data[j].nonStackable ? Math.max(Math.abs(y(getY(d, i)) - y(0)), 0) || 0 : Math.max(Math.abs(y(d.y + d.y0) - y(d.y0)), 0);
                }).attr("x", function(d, i, j) {
                    var width = 0;
                    return data[j].nonStackable && (width = d.series * x.rangeBand() / data.length, 
                    data.length !== nonStackableCount && (width = data[j].nonStackableSeries * x.rangeBand() / (2 * nonStackableCount))), 
                    width;
                }).attr("width", function(d, i, j) {
                    if (data[j].nonStackable) {
                        var width = x.rangeBand() / nonStackableCount;
                        return data.length !== nonStackableCount && (width = x.rangeBand() / (2 * nonStackableCount)), 
                        width;
                    }
                    return x.rangeBand();
                }) : barSelection.attr("x", function(d, i) {
                    return d.series * x.rangeBand() / data.length;
                }).attr("width", x.rangeBand() / data.length).attr("y", function(d, i) {
                    return getY(d, i) < 0 ? y(0) : y(0) - y(getY(d, i)) < 1 ? y(0) - 1 : y(getY(d, i)) || 0;
                }).attr("height", function(d, i) {
                    return Math.max(Math.abs(y(getY(d, i)) - y(0)), 1) || 0;
                }), x0 = x.copy(), y0 = y.copy(), data[0] && data[0].values && (last_datalength = data[0].values.length);
            }), renderWatch.renderEnd("multibar immediate"), chart;
        }
        var disabled, xDomain, yDomain, xRange, yRange, x0, y0, margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, width = 960, height = 500, x = d3.scale.ordinal(), y = d3.scale.linear(), id = Math.floor(1e4 * Math.random()), container = null, getX = function(d) {
            return d.x;
        }, getY = function(d) {
            return d.y;
        }, forceY = [ 0 ], clipEdge = !0, stacked = !1, stackOffset = "zero", color = nv.utils.defaultColor(), hideable = !1, barColor = null, duration = 500, groupSpacing = .1, fillOpacity = .75, dispatch = d3.dispatch("chartClick", "elementClick", "elementDblClick", "elementMouseover", "elementMouseout", "elementMousemove", "renderEnd"), renderWatch = nv.utils.renderWatch(dispatch, duration), last_datalength = 0;
        return chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            x: {
                get: function() {
                    return getX;
                },
                set: function(_) {
                    getX = _;
                }
            },
            y: {
                get: function() {
                    return getY;
                },
                set: function(_) {
                    getY = _;
                }
            },
            xScale: {
                get: function() {
                    return x;
                },
                set: function(_) {
                    x = _;
                }
            },
            yScale: {
                get: function() {
                    return y;
                },
                set: function(_) {
                    y = _;
                }
            },
            xDomain: {
                get: function() {
                    return xDomain;
                },
                set: function(_) {
                    xDomain = _;
                }
            },
            yDomain: {
                get: function() {
                    return yDomain;
                },
                set: function(_) {
                    yDomain = _;
                }
            },
            xRange: {
                get: function() {
                    return xRange;
                },
                set: function(_) {
                    xRange = _;
                }
            },
            yRange: {
                get: function() {
                    return yRange;
                },
                set: function(_) {
                    yRange = _;
                }
            },
            forceY: {
                get: function() {
                    return forceY;
                },
                set: function(_) {
                    forceY = _;
                }
            },
            stacked: {
                get: function() {
                    return stacked;
                },
                set: function(_) {
                    stacked = _;
                }
            },
            stackOffset: {
                get: function() {
                    return stackOffset;
                },
                set: function(_) {
                    stackOffset = _;
                }
            },
            clipEdge: {
                get: function() {
                    return clipEdge;
                },
                set: function(_) {
                    clipEdge = _;
                }
            },
            disabled: {
                get: function() {
                    return disabled;
                },
                set: function(_) {
                    disabled = _;
                }
            },
            id: {
                get: function() {
                    return id;
                },
                set: function(_) {
                    id = _;
                }
            },
            hideable: {
                get: function() {
                    return hideable;
                },
                set: function(_) {
                    hideable = _;
                }
            },
            groupSpacing: {
                get: function() {
                    return groupSpacing;
                },
                set: function(_) {
                    groupSpacing = _;
                }
            },
            fillOpacity: {
                get: function() {
                    return fillOpacity;
                },
                set: function(_) {
                    fillOpacity = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration);
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            },
            barColor: {
                get: function() {
                    return barColor;
                },
                set: function(_) {
                    barColor = _ ? nv.utils.getColor(_) : null;
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.multiBarChart = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), renderWatch.models(multibar), showXAxis && renderWatch.models(xAxis), 
            showYAxis && renderWatch.models(yAxis), selection.each(function(data) {
                var container = d3.select(this);
                nv.utils.initSVG(container);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin);
                if (chart.update = function() {
                    0 === duration ? container.call(chart) : container.transition().duration(duration).call(chart);
                }, chart.container = this, state.setter(stateSetter(data), chart.update).getter(stateGetter(data)).update(), 
                state.disabled = data.map(function(d) {
                    return !!d.disabled;
                }), !defaultState) {
                    var key;
                    defaultState = {};
                    for (key in state) state[key] instanceof Array ? defaultState[key] = state[key].slice(0) : defaultState[key] = state[key];
                }
                if (!(data && data.length && data.filter(function(d) {
                    return d.values.length;
                }).length)) return nv.utils.noData(chart, container), chart;
                container.selectAll(".nv-noData").remove(), x = multibar.xScale(), y = multibar.yScale();
                var wrap = container.selectAll("g.nv-wrap.nv-multiBarWithLegend").data([ data ]), gEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-multiBarWithLegend").append("g"), g = wrap.select("g");
                if (gEnter.append("g").attr("class", "nv-x nv-axis"), gEnter.append("g").attr("class", "nv-y nv-axis"), 
                gEnter.append("g").attr("class", "nv-barsWrap"), gEnter.append("g").attr("class", "nv-legendWrap"), 
                gEnter.append("g").attr("class", "nv-controlsWrap"), gEnter.append("g").attr("class", "nv-interactive"), 
                showLegend ? "bottom" === legendPosition ? (legend.width(availableWidth - margin.right), 
                g.select(".nv-legendWrap").datum(data).call(legend), margin.bottom = xAxis.height() + legend.height(), 
                availableHeight = nv.utils.availableHeight(height, container, margin), g.select(".nv-legendWrap").attr("transform", "translate(0," + (availableHeight + xAxis.height()) + ")")) : (legend.width(availableWidth - controlWidth()), 
                g.select(".nv-legendWrap").datum(data).call(legend), marginTop || legend.height() === margin.top || (margin.top = legend.height(), 
                availableHeight = nv.utils.availableHeight(height, container, margin)), g.select(".nv-legendWrap").attr("transform", "translate(" + controlWidth() + "," + -margin.top + ")")) : g.select(".nv-legendWrap").selectAll("*").remove(), 
                showControls) {
                    var controlsData = [ {
                        key: controlLabels.grouped || "Grouped",
                        disabled: multibar.stacked()
                    }, {
                        key: controlLabels.stacked || "Stacked",
                        disabled: !multibar.stacked()
                    } ];
                    controls.width(controlWidth()).color([ "#444", "#444", "#444" ]), g.select(".nv-controlsWrap").datum(controlsData).attr("transform", "translate(0," + -margin.top + ")").call(controls);
                } else g.select(".nv-controlsWrap").selectAll("*").remove();
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), rightAlignYAxis && g.select(".nv-y.nv-axis").attr("transform", "translate(" + availableWidth + ",0)"), 
                multibar.disabled(data.map(function(series) {
                    return series.disabled;
                })).width(availableWidth).height(availableHeight).color(data.map(function(d, i) {
                    return d.color || color(d, i);
                }).filter(function(d, i) {
                    return !data[i].disabled;
                }));
                var barsWrap = g.select(".nv-barsWrap").datum(data.filter(function(d) {
                    return !d.disabled;
                }));
                if (barsWrap.call(multibar), showXAxis) {
                    xAxis.scale(x)._ticks(nv.utils.calcTicksX(availableWidth / 100, data)).tickSize(-availableHeight, 0), 
                    g.select(".nv-x.nv-axis").attr("transform", "translate(0," + y.range()[0] + ")"), 
                    g.select(".nv-x.nv-axis").call(xAxis);
                    var xTicks = g.select(".nv-x.nv-axis > g").selectAll("g");
                    if (xTicks.selectAll("line, text").style("opacity", 1), staggerLabels) {
                        var getTranslate = function(x, y) {
                            return "translate(" + x + "," + y + ")";
                        }, staggerUp = 5, staggerDown = 17;
                        xTicks.selectAll("text").attr("transform", function(d, i, j) {
                            return getTranslate(0, j % 2 == 0 ? staggerUp : staggerDown);
                        });
                        var totalInBetweenTicks = d3.selectAll(".nv-x.nv-axis .nv-wrap g g text")[0].length;
                        g.selectAll(".nv-x.nv-axis .nv-axisMaxMin text").attr("transform", function(d, i) {
                            return getTranslate(0, 0 === i || totalInBetweenTicks % 2 !== 0 ? staggerDown : staggerUp);
                        });
                    }
                    wrapLabels && g.selectAll(".tick text").call(nv.utils.wrapTicks, chart.xAxis.rangeBand()), 
                    reduceXTicks && xTicks.filter(function(d, i) {
                        return i % Math.ceil(data[0].values.length / (availableWidth / 100)) !== 0;
                    }).selectAll("text, line").style("opacity", 0), rotateLabels && xTicks.selectAll(".tick text").attr("transform", "rotate(" + rotateLabels + " 0,0)").style("text-anchor", rotateLabels > 0 ? "start" : "end"), 
                    g.select(".nv-x.nv-axis").selectAll("g.nv-axisMaxMin text").style("opacity", 1);
                }
                showYAxis && (yAxis.scale(y)._ticks(nv.utils.calcTicksY(availableHeight / 36, data)).tickSize(-availableWidth, 0), 
                g.select(".nv-y.nv-axis").call(yAxis)), useInteractiveGuideline && (interactiveLayer.width(availableWidth).height(availableHeight).margin({
                    left: margin.left,
                    top: margin.top
                }).svgContainer(container).xScale(x), wrap.select(".nv-interactive").call(interactiveLayer)), 
                legend.dispatch.on("stateChange", function(newState) {
                    for (var key in newState) state[key] = newState[key];
                    dispatch.stateChange(state), chart.update();
                }), controls.dispatch.on("legendClick", function(d, i) {
                    if (d.disabled) {
                        switch (controlsData = controlsData.map(function(s) {
                            return s.disabled = !0, s;
                        }), d.disabled = !1, d.key) {
                          case "Grouped":
                          case controlLabels.grouped:
                            multibar.stacked(!1);
                            break;

                          case "Stacked":
                          case controlLabels.stacked:
                            multibar.stacked(!0);
                        }
                        state.stacked = multibar.stacked(), dispatch.stateChange(state), chart.update();
                    }
                }), dispatch.on("changeState", function(e) {
                    "undefined" != typeof e.disabled && (data.forEach(function(series, i) {
                        series.disabled = e.disabled[i];
                    }), state.disabled = e.disabled), "undefined" != typeof e.stacked && (multibar.stacked(e.stacked), 
                    state.stacked = e.stacked, stacked = e.stacked), chart.update();
                }), useInteractiveGuideline ? (interactiveLayer.dispatch.on("elementMousemove", function(e) {
                    if (void 0 != e.pointXValue) {
                        var singlePoint, pointIndex, pointXLocation, xValue, allData = [];
                        data.filter(function(series, i) {
                            return series.seriesIndex = i, !series.disabled;
                        }).forEach(function(series, i) {
                            pointIndex = x.domain().indexOf(e.pointXValue);
                            var point = series.values[pointIndex];
                            void 0 !== point && (xValue = point.x, void 0 === singlePoint && (singlePoint = point), 
                            void 0 === pointXLocation && (pointXLocation = e.mouseX), allData.push({
                                key: series.key,
                                value: chart.y()(point, pointIndex),
                                color: color(series, series.seriesIndex),
                                data: series.values[pointIndex]
                            }));
                        }), interactiveLayer.tooltip.data({
                            value: xValue,
                            index: pointIndex,
                            series: allData
                        })(), interactiveLayer.renderGuideLine(pointXLocation);
                    }
                }), interactiveLayer.dispatch.on("elementMouseout", function(e) {
                    interactiveLayer.tooltip.hidden(!0);
                })) : (multibar.dispatch.on("elementMouseover.tooltip", function(evt) {
                    evt.value = chart.x()(evt.data), evt.series = {
                        key: evt.data.key,
                        value: chart.y()(evt.data),
                        color: evt.color
                    }, tooltip.data(evt).hidden(!1);
                }), multibar.dispatch.on("elementMouseout.tooltip", function(evt) {
                    tooltip.hidden(!0);
                }), multibar.dispatch.on("elementMousemove.tooltip", function(evt) {
                    tooltip();
                }));
            }), renderWatch.renderEnd("multibarchart immediate"), chart;
        }
        var x, y, multibar = nv.models.multiBar(), xAxis = nv.models.axis(), yAxis = nv.models.axis(), interactiveLayer = nv.interactiveGuideline(), legend = nv.models.legend(), controls = nv.models.legend(), tooltip = nv.models.tooltip(), margin = {
            top: 30,
            right: 20,
            bottom: 50,
            left: 60
        }, marginTop = null, width = null, height = null, color = nv.utils.defaultColor(), showControls = !0, controlLabels = {}, showLegend = !0, legendPosition = null, showXAxis = !0, showYAxis = !0, rightAlignYAxis = !1, reduceXTicks = !0, staggerLabels = !1, wrapLabels = !1, rotateLabels = 0, state = nv.utils.state(), defaultState = null, noData = null, dispatch = d3.dispatch("stateChange", "changeState", "renderEnd"), controlWidth = function() {
            return showControls ? 180 : 0;
        }, duration = 250, useInteractiveGuideline = !1;
        state.stacked = !1, multibar.stacked(!1), xAxis.orient("bottom").tickPadding(7).showMaxMin(!1).tickFormat(function(d) {
            return d;
        }), yAxis.orient(rightAlignYAxis ? "right" : "left").tickFormat(d3.format(",.1f")), 
        tooltip.duration(0).valueFormatter(function(d, i) {
            return yAxis.tickFormat()(d, i);
        }).headerFormatter(function(d, i) {
            return xAxis.tickFormat()(d, i);
        }), interactiveLayer.tooltip.valueFormatter(function(d, i) {
            return null == d ? "N/A" : yAxis.tickFormat()(d, i);
        }).headerFormatter(function(d, i) {
            return xAxis.tickFormat()(d, i);
        }), interactiveLayer.tooltip.valueFormatter(function(d, i) {
            return null == d ? "N/A" : yAxis.tickFormat()(d, i);
        }).headerFormatter(function(d, i) {
            return xAxis.tickFormat()(d, i);
        }), interactiveLayer.tooltip.duration(0).valueFormatter(function(d, i) {
            return yAxis.tickFormat()(d, i);
        }).headerFormatter(function(d, i) {
            return xAxis.tickFormat()(d, i);
        }), controls.updateState(!1);
        var renderWatch = nv.utils.renderWatch(dispatch), stacked = !1, stateGetter = function(data) {
            return function() {
                return {
                    active: data.map(function(d) {
                        return !d.disabled;
                    }),
                    stacked: stacked
                };
            };
        }, stateSetter = function(data) {
            return function(state) {
                void 0 !== state.stacked && (stacked = state.stacked), void 0 !== state.active && data.forEach(function(series, i) {
                    series.disabled = !state.active[i];
                });
            };
        };
        return chart.dispatch = dispatch, chart.multibar = multibar, chart.legend = legend, 
        chart.controls = controls, chart.xAxis = xAxis, chart.yAxis = yAxis, chart.state = state, 
        chart.tooltip = tooltip, chart.interactiveLayer = interactiveLayer, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            showLegend: {
                get: function() {
                    return showLegend;
                },
                set: function(_) {
                    showLegend = _;
                }
            },
            legendPosition: {
                get: function() {
                    return legendPosition;
                },
                set: function(_) {
                    legendPosition = _;
                }
            },
            showControls: {
                get: function() {
                    return showControls;
                },
                set: function(_) {
                    showControls = _;
                }
            },
            controlLabels: {
                get: function() {
                    return controlLabels;
                },
                set: function(_) {
                    controlLabels = _;
                }
            },
            showXAxis: {
                get: function() {
                    return showXAxis;
                },
                set: function(_) {
                    showXAxis = _;
                }
            },
            showYAxis: {
                get: function() {
                    return showYAxis;
                },
                set: function(_) {
                    showYAxis = _;
                }
            },
            defaultState: {
                get: function() {
                    return defaultState;
                },
                set: function(_) {
                    defaultState = _;
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            reduceXTicks: {
                get: function() {
                    return reduceXTicks;
                },
                set: function(_) {
                    reduceXTicks = _;
                }
            },
            rotateLabels: {
                get: function() {
                    return rotateLabels;
                },
                set: function(_) {
                    rotateLabels = _;
                }
            },
            staggerLabels: {
                get: function() {
                    return staggerLabels;
                },
                set: function(_) {
                    staggerLabels = _;
                }
            },
            wrapLabels: {
                get: function() {
                    return wrapLabels;
                },
                set: function(_) {
                    wrapLabels = !!_;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    void 0 !== _.top && (margin.top = _.top, marginTop = _.top), margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, multibar.duration(duration), xAxis.duration(duration), yAxis.duration(duration), 
                    renderWatch.reset(duration);
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_), legend.color(color);
                }
            },
            rightAlignYAxis: {
                get: function() {
                    return rightAlignYAxis;
                },
                set: function(_) {
                    rightAlignYAxis = _, yAxis.orient(rightAlignYAxis ? "right" : "left");
                }
            },
            useInteractiveGuideline: {
                get: function() {
                    return useInteractiveGuideline;
                },
                set: function(_) {
                    useInteractiveGuideline = _;
                }
            },
            barColor: {
                get: function() {
                    return multibar.barColor;
                },
                set: function(_) {
                    multibar.barColor(_), legend.color(function(d, i) {
                        return d3.rgb("#ccc").darker(1.5 * i).toString();
                    });
                }
            }
        }), nv.utils.inheritOptions(chart, multibar), nv.utils.initOptions(chart), chart;
    }, nv.models.multiBarHorizontal = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), selection.each(function(data) {
                var availableWidth = width - margin.left - margin.right, availableHeight = height - margin.top - margin.bottom;
                container = d3.select(this), nv.utils.initSVG(container), stacked && (data = d3.layout.stack().offset("zero").values(function(d) {
                    return d.values;
                }).y(getY)(data)), data.forEach(function(series, i) {
                    series.values.forEach(function(point) {
                        point.series = i, point.key = series.key;
                    });
                }), stacked && data[0].values.map(function(d, i) {
                    var posBase = 0, negBase = 0;
                    data.map(function(d) {
                        var f = d.values[i];
                        f.size = Math.abs(f.y), f.y < 0 ? (f.y1 = negBase - f.size, negBase -= f.size) : (f.y1 = posBase, 
                        posBase += f.size);
                    });
                });
                var seriesData = xDomain && yDomain ? [] : data.map(function(d) {
                    return d.values.map(function(d, i) {
                        return {
                            x: getX(d, i),
                            y: getY(d, i),
                            y0: d.y0,
                            y1: d.y1
                        };
                    });
                });
                x.domain(xDomain || d3.merge(seriesData).map(function(d) {
                    return d.x;
                })).rangeBands(xRange || [ 0, availableHeight ], groupSpacing), y.domain(yDomain || d3.extent(d3.merge(seriesData).map(function(d) {
                    return stacked ? d.y > 0 ? d.y1 + d.y : d.y1 : d.y;
                }).concat(forceY))), showValues && !stacked ? y.range(yRange || [ y.domain()[0] < 0 ? valuePadding : 0, availableWidth - (y.domain()[1] > 0 ? valuePadding : 0) ]) : y.range(yRange || [ 0, availableWidth ]), 
                x0 = x0 || x, y0 = y0 || d3.scale.linear().domain(y.domain()).range([ y(0), y(0) ]);
                var wrap = d3.select(this).selectAll("g.nv-wrap.nv-multibarHorizontal").data([ data ]), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-multibarHorizontal"), gEnter = (wrapEnter.append("defs"), 
                wrapEnter.append("g"));
                wrap.select("g");
                gEnter.append("g").attr("class", "nv-groups"), wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var groups = wrap.select(".nv-groups").selectAll(".nv-group").data(function(d) {
                    return d;
                }, function(d, i) {
                    return i;
                });
                groups.enter().append("g").style("stroke-opacity", 1e-6).style("fill-opacity", 1e-6), 
                groups.exit().watchTransition(renderWatch, "multibarhorizontal: exit groups").style("stroke-opacity", 1e-6).style("fill-opacity", 1e-6).remove(), 
                groups.attr("class", function(d, i) {
                    return "nv-group nv-series-" + i;
                }).classed("hover", function(d) {
                    return d.hover;
                }).style("fill", function(d, i) {
                    return color(d, i);
                }).style("stroke", function(d, i) {
                    return color(d, i);
                }), groups.watchTransition(renderWatch, "multibarhorizontal: groups").style("stroke-opacity", 1).style("fill-opacity", fillOpacity);
                var bars = groups.selectAll("g.nv-bar").data(function(d) {
                    return d.values;
                });
                bars.exit().remove();
                var barsEnter = bars.enter().append("g").attr("transform", function(d, i, j) {
                    return "translate(" + y0(stacked ? d.y0 : 0) + "," + (stacked ? 0 : j * x.rangeBand() / data.length + x(getX(d, i))) + ")";
                });
                barsEnter.append("rect").attr("width", 0).attr("height", x.rangeBand() / (stacked ? 1 : data.length)), 
                bars.on("mouseover", function(d, i) {
                    d3.select(this).classed("hover", !0), dispatch.elementMouseover({
                        data: d,
                        index: i,
                        color: d3.select(this).style("fill")
                    });
                }).on("mouseout", function(d, i) {
                    d3.select(this).classed("hover", !1), dispatch.elementMouseout({
                        data: d,
                        index: i,
                        color: d3.select(this).style("fill")
                    });
                }).on("mouseout", function(d, i) {
                    dispatch.elementMouseout({
                        data: d,
                        index: i,
                        color: d3.select(this).style("fill")
                    });
                }).on("mousemove", function(d, i) {
                    dispatch.elementMousemove({
                        data: d,
                        index: i,
                        color: d3.select(this).style("fill")
                    });
                }).on("click", function(d, i) {
                    var element = this;
                    dispatch.elementClick({
                        data: d,
                        index: i,
                        color: d3.select(this).style("fill"),
                        event: d3.event,
                        element: element
                    }), d3.event.stopPropagation();
                }).on("dblclick", function(d, i) {
                    dispatch.elementDblClick({
                        data: d,
                        index: i,
                        color: d3.select(this).style("fill")
                    }), d3.event.stopPropagation();
                }), getYerr(data[0], 0) && (barsEnter.append("polyline"), bars.select("polyline").attr("fill", "none").attr("points", function(d, i) {
                    var xerr = getYerr(d, i), mid = .8 * x.rangeBand() / (2 * (stacked ? 1 : data.length));
                    xerr = xerr.length ? xerr : [ -Math.abs(xerr), Math.abs(xerr) ], xerr = xerr.map(function(e) {
                        return y(e + (getY(d, i) < 0 ? 0 : getY(d, i))) - y(0);
                    });
                    var a = [ [ xerr[0], -mid ], [ xerr[0], mid ], [ xerr[0], 0 ], [ xerr[1], 0 ], [ xerr[1], -mid ], [ xerr[1], mid ] ];
                    return a.map(function(path) {
                        return path.join(",");
                    }).join(" ");
                }).attr("transform", function(d, i) {
                    var mid = x.rangeBand() / (2 * (stacked ? 1 : data.length));
                    return "translate(0, " + mid + ")";
                })), barsEnter.append("text"), showValues && !stacked ? (bars.select("text").attr("text-anchor", function(d, i) {
                    return getY(d, i) < 0 ? "end" : "start";
                }).attr("y", x.rangeBand() / (2 * data.length)).attr("dy", ".32em").text(function(d, i) {
                    var t = valueFormat(getY(d, i)), yerr = getYerr(d, i);
                    return void 0 === yerr ? t : yerr.length ? t + "+" + valueFormat(Math.abs(yerr[1])) + "-" + valueFormat(Math.abs(yerr[0])) : t + "±" + valueFormat(Math.abs(yerr));
                }), bars.watchTransition(renderWatch, "multibarhorizontal: bars").select("text").attr("x", function(d, i) {
                    return getY(d, i) < 0 ? -4 : y(getY(d, i)) - y(0) + 4;
                })) : bars.selectAll("text").text(""), showBarLabels && !stacked ? (barsEnter.append("text").classed("nv-bar-label", !0), 
                bars.select("text.nv-bar-label").attr("text-anchor", function(d, i) {
                    return getY(d, i) < 0 ? "start" : "end";
                }).attr("y", x.rangeBand() / (2 * data.length)).attr("dy", ".32em").text(function(d, i) {
                    return getX(d, i);
                }), bars.watchTransition(renderWatch, "multibarhorizontal: bars").select("text.nv-bar-label").attr("x", function(d, i) {
                    return getY(d, i) < 0 ? y(0) - y(getY(d, i)) + 4 : -4;
                })) : bars.selectAll("text.nv-bar-label").text(""), bars.attr("class", function(d, i) {
                    return getY(d, i) < 0 ? "nv-bar negative" : "nv-bar positive";
                }), barColor && (disabled || (disabled = data.map(function() {
                    return !0;
                })), bars.style("fill", function(d, i, j) {
                    return d3.rgb(barColor(d, i)).darker(disabled.map(function(d, i) {
                        return i;
                    }).filter(function(d, i) {
                        return !disabled[i];
                    })[j]).toString();
                }).style("stroke", function(d, i, j) {
                    return d3.rgb(barColor(d, i)).darker(disabled.map(function(d, i) {
                        return i;
                    }).filter(function(d, i) {
                        return !disabled[i];
                    })[j]).toString();
                })), stacked ? bars.watchTransition(renderWatch, "multibarhorizontal: bars").attr("transform", function(d, i) {
                    return "translate(" + y(d.y1) + "," + x(getX(d, i)) + ")";
                }).select("rect").attr("width", function(d, i) {
                    return Math.abs(y(getY(d, i) + d.y0) - y(d.y0)) || 0;
                }).attr("height", x.rangeBand()) : bars.watchTransition(renderWatch, "multibarhorizontal: bars").attr("transform", function(d, i) {
                    return "translate(" + y(getY(d, i) < 0 ? getY(d, i) : 0) + "," + (d.series * x.rangeBand() / data.length + x(getX(d, i))) + ")";
                }).select("rect").attr("height", x.rangeBand() / data.length).attr("width", function(d, i) {
                    return Math.max(Math.abs(y(getY(d, i)) - y(0)), 1) || 0;
                }), x0 = x.copy(), y0 = y.copy();
            }), renderWatch.renderEnd("multibarHorizontal immediate"), chart;
        }
        var disabled, xDomain, yDomain, xRange, yRange, x0, y0, margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, width = 960, height = 500, id = Math.floor(1e4 * Math.random()), container = null, x = d3.scale.ordinal(), y = d3.scale.linear(), getX = function(d) {
            return d.x;
        }, getY = function(d) {
            return d.y;
        }, getYerr = function(d) {
            return d.yErr;
        }, forceY = [ 0 ], color = nv.utils.defaultColor(), barColor = null, stacked = !1, showValues = !1, showBarLabels = !1, valuePadding = 60, groupSpacing = .1, fillOpacity = .75, valueFormat = d3.format(",.2f"), duration = 250, dispatch = d3.dispatch("chartClick", "elementClick", "elementDblClick", "elementMouseover", "elementMouseout", "elementMousemove", "renderEnd"), renderWatch = nv.utils.renderWatch(dispatch, duration);
        return chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            x: {
                get: function() {
                    return getX;
                },
                set: function(_) {
                    getX = _;
                }
            },
            y: {
                get: function() {
                    return getY;
                },
                set: function(_) {
                    getY = _;
                }
            },
            yErr: {
                get: function() {
                    return getYerr;
                },
                set: function(_) {
                    getYerr = _;
                }
            },
            xScale: {
                get: function() {
                    return x;
                },
                set: function(_) {
                    x = _;
                }
            },
            yScale: {
                get: function() {
                    return y;
                },
                set: function(_) {
                    y = _;
                }
            },
            xDomain: {
                get: function() {
                    return xDomain;
                },
                set: function(_) {
                    xDomain = _;
                }
            },
            yDomain: {
                get: function() {
                    return yDomain;
                },
                set: function(_) {
                    yDomain = _;
                }
            },
            xRange: {
                get: function() {
                    return xRange;
                },
                set: function(_) {
                    xRange = _;
                }
            },
            yRange: {
                get: function() {
                    return yRange;
                },
                set: function(_) {
                    yRange = _;
                }
            },
            forceY: {
                get: function() {
                    return forceY;
                },
                set: function(_) {
                    forceY = _;
                }
            },
            stacked: {
                get: function() {
                    return stacked;
                },
                set: function(_) {
                    stacked = _;
                }
            },
            showValues: {
                get: function() {
                    return showValues;
                },
                set: function(_) {
                    showValues = _;
                }
            },
            disabled: {
                get: function() {
                    return disabled;
                },
                set: function(_) {
                    disabled = _;
                }
            },
            id: {
                get: function() {
                    return id;
                },
                set: function(_) {
                    id = _;
                }
            },
            valueFormat: {
                get: function() {
                    return valueFormat;
                },
                set: function(_) {
                    valueFormat = _;
                }
            },
            valuePadding: {
                get: function() {
                    return valuePadding;
                },
                set: function(_) {
                    valuePadding = _;
                }
            },
            groupSpacing: {
                get: function() {
                    return groupSpacing;
                },
                set: function(_) {
                    groupSpacing = _;
                }
            },
            fillOpacity: {
                get: function() {
                    return fillOpacity;
                },
                set: function(_) {
                    fillOpacity = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration);
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            },
            barColor: {
                get: function() {
                    return barColor;
                },
                set: function(_) {
                    barColor = _ ? nv.utils.getColor(_) : null;
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.multiBarHorizontalChart = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), renderWatch.models(multibar), showXAxis && renderWatch.models(xAxis), 
            showYAxis && renderWatch.models(yAxis), selection.each(function(data) {
                var container = d3.select(this);
                nv.utils.initSVG(container);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin);
                if (chart.update = function() {
                    container.transition().duration(duration).call(chart);
                }, chart.container = this, stacked = multibar.stacked(), state.setter(stateSetter(data), chart.update).getter(stateGetter(data)).update(), 
                state.disabled = data.map(function(d) {
                    return !!d.disabled;
                }), !defaultState) {
                    var key;
                    defaultState = {};
                    for (key in state) state[key] instanceof Array ? defaultState[key] = state[key].slice(0) : defaultState[key] = state[key];
                }
                if (!(data && data.length && data.filter(function(d) {
                    return d.values.length;
                }).length)) return nv.utils.noData(chart, container), chart;
                container.selectAll(".nv-noData").remove(), x = multibar.xScale(), y = multibar.yScale().clamp(!0);
                var wrap = container.selectAll("g.nv-wrap.nv-multiBarHorizontalChart").data([ data ]), gEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-multiBarHorizontalChart").append("g"), g = wrap.select("g");
                if (gEnter.append("g").attr("class", "nv-x nv-axis"), gEnter.append("g").attr("class", "nv-y nv-axis").append("g").attr("class", "nv-zeroLine").append("line"), 
                gEnter.append("g").attr("class", "nv-barsWrap"), gEnter.append("g").attr("class", "nv-legendWrap"), 
                gEnter.append("g").attr("class", "nv-controlsWrap"), showLegend ? (legend.width(availableWidth - controlWidth()), 
                g.select(".nv-legendWrap").datum(data).call(legend), "bottom" === legendPosition ? (margin.bottom = xAxis.height() + legend.height(), 
                availableHeight = nv.utils.availableHeight(height, container, margin), g.select(".nv-legendWrap").attr("transform", "translate(" + controlWidth() + "," + (availableHeight + xAxis.height()) + ")")) : "top" === legendPosition && (marginTop || legend.height() === margin.top || (margin.top = legend.height(), 
                availableHeight = nv.utils.availableHeight(height, container, margin)), g.select(".nv-legendWrap").attr("transform", "translate(" + controlWidth() + "," + -margin.top + ")"))) : g.select(".nv-legendWrap").selectAll("*").remove(), 
                showControls) {
                    var controlsData = [ {
                        key: controlLabels.grouped || "Grouped",
                        disabled: multibar.stacked()
                    }, {
                        key: controlLabels.stacked || "Stacked",
                        disabled: !multibar.stacked()
                    } ];
                    controls.width(controlWidth()).color([ "#444", "#444", "#444" ]), "bottom" === controlsPosition ? (margin.bottom = xAxis.height() + legend.height(), 
                    availableHeight = nv.utils.availableHeight(height, container, margin), g.select(".nv-controlsWrap").datum(controlsData).attr("transform", "translate(0," + (availableHeight + xAxis.height()) + ")").call(controls)) : "top" === controlsPosition && g.select(".nv-controlsWrap").datum(controlsData).attr("transform", "translate(0," + -margin.top + ")").call(controls);
                } else g.select(".nv-controlsWrap").selectAll("*").remove();
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), multibar.disabled(data.map(function(series) {
                    return series.disabled;
                })).width(availableWidth).height(availableHeight).color(data.map(function(d, i) {
                    return d.color || color(d, i);
                }).filter(function(d, i) {
                    return !data[i].disabled;
                }));
                var barsWrap = g.select(".nv-barsWrap").datum(data.filter(function(d) {
                    return !d.disabled;
                }));
                if (barsWrap.transition().call(multibar), showXAxis) {
                    xAxis.scale(x)._ticks(nv.utils.calcTicksY(availableHeight / 24, data)).tickSize(-availableWidth, 0), 
                    g.select(".nv-x.nv-axis").call(xAxis);
                    var xTicks = g.select(".nv-x.nv-axis").selectAll("g");
                    xTicks.selectAll("line, text");
                }
                showYAxis && (yAxis.scale(y)._ticks(nv.utils.calcTicksX(availableWidth / 100, data)).tickSize(-availableHeight, 0), 
                g.select(".nv-y.nv-axis").attr("transform", "translate(0," + availableHeight + ")"), 
                g.select(".nv-y.nv-axis").call(yAxis)), g.select(".nv-zeroLine line").attr("x1", y(0)).attr("x2", y(0)).attr("y1", 0).attr("y2", -availableHeight), 
                legend.dispatch.on("stateChange", function(newState) {
                    for (var key in newState) state[key] = newState[key];
                    dispatch.stateChange(state), chart.update();
                }), controls.dispatch.on("legendClick", function(d, i) {
                    if (d.disabled) {
                        switch (controlsData = controlsData.map(function(s) {
                            return s.disabled = !0, s;
                        }), d.disabled = !1, d.key) {
                          case "Grouped":
                          case controlLabels.grouped:
                            multibar.stacked(!1);
                            break;

                          case "Stacked":
                          case controlLabels.stacked:
                            multibar.stacked(!0);
                        }
                        state.stacked = multibar.stacked(), dispatch.stateChange(state), stacked = multibar.stacked(), 
                        chart.update();
                    }
                }), dispatch.on("changeState", function(e) {
                    "undefined" != typeof e.disabled && (data.forEach(function(series, i) {
                        series.disabled = e.disabled[i];
                    }), state.disabled = e.disabled), "undefined" != typeof e.stacked && (multibar.stacked(e.stacked), 
                    state.stacked = e.stacked, stacked = e.stacked), chart.update();
                });
            }), renderWatch.renderEnd("multibar horizontal chart immediate"), chart;
        }
        var x, y, multibar = nv.models.multiBarHorizontal(), xAxis = nv.models.axis(), yAxis = nv.models.axis(), legend = nv.models.legend().height(30), controls = nv.models.legend().height(30), tooltip = nv.models.tooltip(), margin = {
            top: 30,
            right: 20,
            bottom: 50,
            left: 60
        }, marginTop = null, width = null, height = null, color = nv.utils.defaultColor(), showControls = !0, controlsPosition = "top", controlLabels = {}, showLegend = !0, legendPosition = "top", showXAxis = !0, showYAxis = !0, stacked = !1, state = nv.utils.state(), defaultState = null, noData = null, dispatch = d3.dispatch("stateChange", "changeState", "renderEnd"), controlWidth = function() {
            return showControls ? 180 : 0;
        }, duration = 250;
        state.stacked = !1, multibar.stacked(stacked), xAxis.orient("left").tickPadding(5).showMaxMin(!1).tickFormat(function(d) {
            return d;
        }), yAxis.orient("bottom").tickFormat(d3.format(",.1f")), tooltip.duration(0).valueFormatter(function(d, i) {
            return yAxis.tickFormat()(d, i);
        }).headerFormatter(function(d, i) {
            return xAxis.tickFormat()(d, i);
        }), controls.updateState(!1);
        var stateGetter = function(data) {
            return function() {
                return {
                    active: data.map(function(d) {
                        return !d.disabled;
                    }),
                    stacked: stacked
                };
            };
        }, stateSetter = function(data) {
            return function(state) {
                void 0 !== state.stacked && (stacked = state.stacked), void 0 !== state.active && data.forEach(function(series, i) {
                    series.disabled = !state.active[i];
                });
            };
        }, renderWatch = nv.utils.renderWatch(dispatch, duration);
        return multibar.dispatch.on("elementMouseover.tooltip", function(evt) {
            evt.value = chart.x()(evt.data), evt.series = {
                key: evt.data.key,
                value: chart.y()(evt.data),
                color: evt.color
            }, tooltip.data(evt).hidden(!1);
        }), multibar.dispatch.on("elementMouseout.tooltip", function(evt) {
            tooltip.hidden(!0);
        }), multibar.dispatch.on("elementMousemove.tooltip", function(evt) {
            tooltip();
        }), chart.dispatch = dispatch, chart.multibar = multibar, chart.legend = legend, 
        chart.controls = controls, chart.xAxis = xAxis, chart.yAxis = yAxis, chart.state = state, 
        chart.tooltip = tooltip, chart.options = nv.utils.optionsFunc.bind(chart), chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            showLegend: {
                get: function() {
                    return showLegend;
                },
                set: function(_) {
                    showLegend = _;
                }
            },
            legendPosition: {
                get: function() {
                    return legendPosition;
                },
                set: function(_) {
                    legendPosition = _;
                }
            },
            controlsPosition: {
                get: function() {
                    return controlsPosition;
                },
                set: function(_) {
                    controlsPosition = _;
                }
            },
            showControls: {
                get: function() {
                    return showControls;
                },
                set: function(_) {
                    showControls = _;
                }
            },
            controlLabels: {
                get: function() {
                    return controlLabels;
                },
                set: function(_) {
                    controlLabels = _;
                }
            },
            showXAxis: {
                get: function() {
                    return showXAxis;
                },
                set: function(_) {
                    showXAxis = _;
                }
            },
            showYAxis: {
                get: function() {
                    return showYAxis;
                },
                set: function(_) {
                    showYAxis = _;
                }
            },
            defaultState: {
                get: function() {
                    return defaultState;
                },
                set: function(_) {
                    defaultState = _;
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    void 0 !== _.top && (margin.top = _.top, marginTop = _.top), margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration), multibar.duration(duration), xAxis.duration(duration), 
                    yAxis.duration(duration);
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_), legend.color(color);
                }
            },
            barColor: {
                get: function() {
                    return multibar.barColor;
                },
                set: function(_) {
                    multibar.barColor(_), legend.color(function(d, i) {
                        return d3.rgb("#ccc").darker(1.5 * i).toString();
                    });
                }
            }
        }), nv.utils.inheritOptions(chart, multibar), nv.utils.initOptions(chart), chart;
    }, nv.models.multiChart = function() {
        "use strict";
        function chart(selection) {
            return selection.each(function(data) {
                function mouseover_line(evt) {
                    var yaxis = 2 === evt.series.yAxis ? yAxis2 : yAxis1;
                    evt.value = evt.point.x, evt.series = {
                        value: evt.point.y,
                        color: evt.point.color,
                        key: evt.series.key
                    }, tooltip.duration(0).headerFormatter(function(d, i) {
                        return xAxis.tickFormat()(d, i);
                    }).valueFormatter(function(d, i) {
                        return yaxis.tickFormat()(d, i);
                    }).data(evt).hidden(!1);
                }
                function mouseover_scatter(evt) {
                    var yaxis = 2 === evt.series.yAxis ? yAxis2 : yAxis1;
                    evt.value = evt.point.x, evt.series = {
                        value: evt.point.y,
                        color: evt.point.color,
                        key: evt.series.key
                    }, tooltip.duration(100).headerFormatter(function(d, i) {
                        return xAxis.tickFormat()(d, i);
                    }).valueFormatter(function(d, i) {
                        return yaxis.tickFormat()(d, i);
                    }).data(evt).hidden(!1);
                }
                function mouseover_stack(evt) {
                    var yaxis = 2 === evt.series.yAxis ? yAxis2 : yAxis1;
                    evt.point.x = stack1.x()(evt.point), evt.point.y = stack1.y()(evt.point), tooltip.duration(0).headerFormatter(function(d, i) {
                        return xAxis.tickFormat()(d, i);
                    }).valueFormatter(function(d, i) {
                        return yaxis.tickFormat()(d, i);
                    }).data(evt).hidden(!1);
                }
                function mouseover_bar(evt) {
                    var yaxis = 2 === evt.series.yAxis ? yAxis2 : yAxis1;
                    evt.value = bars1.x()(evt.data), evt.series = {
                        value: bars1.y()(evt.data),
                        color: evt.color,
                        key: evt.data.key
                    }, tooltip.duration(0).headerFormatter(function(d, i) {
                        return xAxis.tickFormat()(d, i);
                    }).valueFormatter(function(d, i) {
                        return yaxis.tickFormat()(d, i);
                    }).data(evt).hidden(!1);
                }
                function clearHighlights() {
                    for (var i = 0, il = charts.length; i < il; i++) {
                        var chart = charts[i];
                        try {
                            chart.clearHighlights();
                        } catch (e) {}
                    }
                }
                function highlightPoint(serieIndex, pointIndex, b) {
                    for (var i = 0, il = charts.length; i < il; i++) {
                        var chart = charts[i];
                        try {
                            chart.highlightPoint(serieIndex, pointIndex, b);
                        } catch (e) {}
                    }
                }
                var container = d3.select(this);
                nv.utils.initSVG(container), chart.update = function() {
                    container.transition().call(chart);
                }, chart.container = this;
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin), dataLines1 = data.filter(function(d) {
                    return "line" == d.type && 1 == d.yAxis;
                }), dataLines2 = data.filter(function(d) {
                    return "line" == d.type && 2 == d.yAxis;
                }), dataScatters1 = data.filter(function(d) {
                    return "scatter" == d.type && 1 == d.yAxis;
                }), dataScatters2 = data.filter(function(d) {
                    return "scatter" == d.type && 2 == d.yAxis;
                }), dataBars1 = data.filter(function(d) {
                    return "bar" == d.type && 1 == d.yAxis;
                }), dataBars2 = data.filter(function(d) {
                    return "bar" == d.type && 2 == d.yAxis;
                }), dataStack1 = data.filter(function(d) {
                    return "area" == d.type && 1 == d.yAxis;
                }), dataStack2 = data.filter(function(d) {
                    return "area" == d.type && 2 == d.yAxis;
                });
                if (!(data && data.length && data.filter(function(d) {
                    return d.values.length;
                }).length)) return nv.utils.noData(chart, container), chart;
                container.selectAll(".nv-noData").remove();
                var series1 = data.filter(function(d) {
                    return !d.disabled && 1 == d.yAxis;
                }).map(function(d) {
                    return d.values.map(function(d, i) {
                        return {
                            x: getX(d),
                            y: getY(d)
                        };
                    });
                }), series2 = data.filter(function(d) {
                    return !d.disabled && 2 == d.yAxis;
                }).map(function(d) {
                    return d.values.map(function(d, i) {
                        return {
                            x: getX(d),
                            y: getY(d)
                        };
                    });
                });
                x.domain(d3.extent(d3.merge(series1.concat(series2)), function(d) {
                    return d.x;
                })).range([ 0, availableWidth ]);
                var wrap = container.selectAll("g.wrap.multiChart").data([ data ]), gEnter = wrap.enter().append("g").attr("class", "wrap nvd3 multiChart").append("g");
                gEnter.append("g").attr("class", "nv-x nv-axis"), gEnter.append("g").attr("class", "nv-y1 nv-axis"), 
                gEnter.append("g").attr("class", "nv-y2 nv-axis"), gEnter.append("g").attr("class", "stack1Wrap"), 
                gEnter.append("g").attr("class", "stack2Wrap"), gEnter.append("g").attr("class", "bars1Wrap"), 
                gEnter.append("g").attr("class", "bars2Wrap"), gEnter.append("g").attr("class", "scatters1Wrap"), 
                gEnter.append("g").attr("class", "scatters2Wrap"), gEnter.append("g").attr("class", "lines1Wrap"), 
                gEnter.append("g").attr("class", "lines2Wrap"), gEnter.append("g").attr("class", "legendWrap"), 
                gEnter.append("g").attr("class", "nv-interactive");
                var g = wrap.select("g"), color_array = data.map(function(d, i) {
                    return data[i].color || color(d, i);
                });
                if (showLegend) {
                    var legendWidth = legend.align() ? availableWidth / 2 : availableWidth, legendXPosition = legend.align() ? legendWidth : 0;
                    legend.width(legendWidth), legend.color(color_array), g.select(".legendWrap").datum(data.map(function(series) {
                        return series.originalKey = void 0 === series.originalKey ? series.key : series.originalKey, 
                        series.key = series.originalKey + (1 == series.yAxis ? "" : legendRightAxisHint), 
                        series;
                    })).call(legend), marginTop || legend.height() === margin.top || (margin.top = legend.height(), 
                    availableHeight = nv.utils.availableHeight(height, container, margin)), g.select(".legendWrap").attr("transform", "translate(" + legendXPosition + "," + -margin.top + ")");
                } else g.select(".legendWrap").selectAll("*").remove();
                lines1.width(availableWidth).height(availableHeight).interpolate(interpolate).color(color_array.filter(function(d, i) {
                    return !data[i].disabled && 1 == data[i].yAxis && "line" == data[i].type;
                })), lines2.width(availableWidth).height(availableHeight).interpolate(interpolate).color(color_array.filter(function(d, i) {
                    return !data[i].disabled && 2 == data[i].yAxis && "line" == data[i].type;
                })), scatters1.width(availableWidth).height(availableHeight).color(color_array.filter(function(d, i) {
                    return !data[i].disabled && 1 == data[i].yAxis && "scatter" == data[i].type;
                })), scatters2.width(availableWidth).height(availableHeight).color(color_array.filter(function(d, i) {
                    return !data[i].disabled && 2 == data[i].yAxis && "scatter" == data[i].type;
                })), bars1.width(availableWidth).height(availableHeight).color(color_array.filter(function(d, i) {
                    return !data[i].disabled && 1 == data[i].yAxis && "bar" == data[i].type;
                })), bars2.width(availableWidth).height(availableHeight).color(color_array.filter(function(d, i) {
                    return !data[i].disabled && 2 == data[i].yAxis && "bar" == data[i].type;
                })), stack1.width(availableWidth).height(availableHeight).interpolate(interpolate).color(color_array.filter(function(d, i) {
                    return !data[i].disabled && 1 == data[i].yAxis && "area" == data[i].type;
                })), stack2.width(availableWidth).height(availableHeight).interpolate(interpolate).color(color_array.filter(function(d, i) {
                    return !data[i].disabled && 2 == data[i].yAxis && "area" == data[i].type;
                })), g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var lines1Wrap = g.select(".lines1Wrap").datum(dataLines1.filter(function(d) {
                    return !d.disabled;
                })), scatters1Wrap = g.select(".scatters1Wrap").datum(dataScatters1.filter(function(d) {
                    return !d.disabled;
                })), bars1Wrap = g.select(".bars1Wrap").datum(dataBars1.filter(function(d) {
                    return !d.disabled;
                })), stack1Wrap = g.select(".stack1Wrap").datum(dataStack1.filter(function(d) {
                    return !d.disabled;
                })), lines2Wrap = g.select(".lines2Wrap").datum(dataLines2.filter(function(d) {
                    return !d.disabled;
                })), scatters2Wrap = g.select(".scatters2Wrap").datum(dataScatters2.filter(function(d) {
                    return !d.disabled;
                })), bars2Wrap = g.select(".bars2Wrap").datum(dataBars2.filter(function(d) {
                    return !d.disabled;
                })), stack2Wrap = g.select(".stack2Wrap").datum(dataStack2.filter(function(d) {
                    return !d.disabled;
                })), extraValue1BarStacked = [];
                if (bars1.stacked() && dataBars1.length) {
                    var extraValue1BarStacked = dataBars1.filter(function(d) {
                        return !d.disabled;
                    }).map(function(a) {
                        return a.values;
                    });
                    extraValue1BarStacked.length > 0 && (extraValue1BarStacked = extraValue1BarStacked.reduce(function(a, b) {
                        return a.map(function(aVal, i) {
                            return {
                                x: aVal.x,
                                y: aVal.y + b[i].y
                            };
                        });
                    }));
                }
                dataBars1.length && extraValue1BarStacked.push({
                    x: 0,
                    y: 0
                });
                var extraValue2BarStacked = [];
                if (bars2.stacked() && dataBars2.length) {
                    var extraValue2BarStacked = dataBars2.filter(function(d) {
                        return !d.disabled;
                    }).map(function(a) {
                        return a.values;
                    });
                    extraValue2BarStacked.length > 0 && (extraValue2BarStacked = extraValue2BarStacked.reduce(function(a, b) {
                        return a.map(function(aVal, i) {
                            return {
                                x: aVal.x,
                                y: aVal.y + b[i].y
                            };
                        });
                    }));
                }
                dataBars2.length && extraValue2BarStacked.push({
                    x: 0,
                    y: 0
                }), yScale1.domain(yDomain1 || d3.extent(d3.merge(series1).concat(extraValue1BarStacked), function(d) {
                    return d.y;
                })).range([ 0, availableHeight ]), yScale2.domain(yDomain2 || d3.extent(d3.merge(series2).concat(extraValue2BarStacked), function(d) {
                    return d.y;
                })).range([ 0, availableHeight ]), lines1.yDomain(yScale1.domain()), scatters1.yDomain(yScale1.domain()), 
                bars1.yDomain(yScale1.domain()), stack1.yDomain(yScale1.domain()), lines2.yDomain(yScale2.domain()), 
                scatters2.yDomain(yScale2.domain()), bars2.yDomain(yScale2.domain()), stack2.yDomain(yScale2.domain()), 
                dataStack1.length && d3.transition(stack1Wrap).call(stack1), dataStack2.length && d3.transition(stack2Wrap).call(stack2), 
                dataBars1.length && d3.transition(bars1Wrap).call(bars1), dataBars2.length && d3.transition(bars2Wrap).call(bars2), 
                dataLines1.length && d3.transition(lines1Wrap).call(lines1), dataLines2.length && d3.transition(lines2Wrap).call(lines2), 
                dataScatters1.length && d3.transition(scatters1Wrap).call(scatters1), dataScatters2.length && d3.transition(scatters2Wrap).call(scatters2), 
                xAxis._ticks(nv.utils.calcTicksX(availableWidth / 100, data)).tickSize(-availableHeight, 0), 
                g.select(".nv-x.nv-axis").attr("transform", "translate(0," + availableHeight + ")"), 
                d3.transition(g.select(".nv-x.nv-axis")).call(xAxis), yAxis1._ticks(nv.utils.calcTicksY(availableHeight / 36, data)).tickSize(-availableWidth, 0), 
                d3.transition(g.select(".nv-y1.nv-axis")).call(yAxis1), yAxis2._ticks(nv.utils.calcTicksY(availableHeight / 36, data)).tickSize(-availableWidth, 0), 
                d3.transition(g.select(".nv-y2.nv-axis")).call(yAxis2), g.select(".nv-y1.nv-axis").classed("nv-disabled", !series1.length).attr("transform", "translate(" + x.range()[0] + ",0)"), 
                g.select(".nv-y2.nv-axis").classed("nv-disabled", !series2.length).attr("transform", "translate(" + x.range()[1] + ",0)"), 
                legend.dispatch.on("stateChange", function(newState) {
                    chart.update();
                }), useInteractiveGuideline && (interactiveLayer.width(availableWidth).height(availableHeight).margin({
                    left: margin.left,
                    top: margin.top
                }).svgContainer(container).xScale(x), wrap.select(".nv-interactive").call(interactiveLayer)), 
                useInteractiveGuideline ? (interactiveLayer.dispatch.on("elementMousemove", function(e) {
                    clearHighlights();
                    var singlePoint, pointIndex, pointXLocation, allData = [];
                    data.filter(function(series, i) {
                        return series.seriesIndex = i, !series.disabled;
                    }).forEach(function(series, i) {
                        var extent = x.domain(), currentValues = series.values.filter(function(d, i) {
                            return chart.x()(d, i) >= extent[0] && chart.x()(d, i) <= extent[1];
                        });
                        pointIndex = nv.interactiveBisect(currentValues, e.pointXValue, chart.x());
                        var point = currentValues[pointIndex], pointYValue = chart.y()(point, pointIndex);
                        null !== pointYValue && highlightPoint(i, pointIndex, !0), void 0 !== point && (void 0 === singlePoint && (singlePoint = point), 
                        void 0 === pointXLocation && (pointXLocation = x(chart.x()(point, pointIndex))), 
                        allData.push({
                            key: series.key,
                            value: pointYValue,
                            color: color(series, series.seriesIndex),
                            data: point,
                            yAxis: 2 == series.yAxis ? yAxis2 : yAxis1
                        }));
                    });
                    var defaultValueFormatter = function(d, i) {
                        var yAxis = allData[i].yAxis;
                        return null == d ? "N/A" : yAxis.tickFormat()(d);
                    };
                    interactiveLayer.tooltip.headerFormatter(function(d, i) {
                        return xAxis.tickFormat()(d, i);
                    }).valueFormatter(interactiveLayer.tooltip.valueFormatter() || defaultValueFormatter).data({
                        value: chart.x()(singlePoint, pointIndex),
                        index: pointIndex,
                        series: allData
                    })(), interactiveLayer.renderGuideLine(pointXLocation);
                }), interactiveLayer.dispatch.on("elementMouseout", function(e) {
                    clearHighlights();
                })) : (lines1.dispatch.on("elementMouseover.tooltip", mouseover_line), lines2.dispatch.on("elementMouseover.tooltip", mouseover_line), 
                lines1.dispatch.on("elementMouseout.tooltip", function(evt) {
                    tooltip.hidden(!0);
                }), lines2.dispatch.on("elementMouseout.tooltip", function(evt) {
                    tooltip.hidden(!0);
                }), scatters1.dispatch.on("elementMouseover.tooltip", mouseover_scatter), scatters2.dispatch.on("elementMouseover.tooltip", mouseover_scatter), 
                scatters1.dispatch.on("elementMouseout.tooltip", function(evt) {
                    tooltip.hidden(!0);
                }), scatters2.dispatch.on("elementMouseout.tooltip", function(evt) {
                    tooltip.hidden(!0);
                }), stack1.dispatch.on("elementMouseover.tooltip", mouseover_stack), stack2.dispatch.on("elementMouseover.tooltip", mouseover_stack), 
                stack1.dispatch.on("elementMouseout.tooltip", function(evt) {
                    tooltip.hidden(!0);
                }), stack2.dispatch.on("elementMouseout.tooltip", function(evt) {
                    tooltip.hidden(!0);
                }), bars1.dispatch.on("elementMouseover.tooltip", mouseover_bar), bars2.dispatch.on("elementMouseover.tooltip", mouseover_bar), 
                bars1.dispatch.on("elementMouseout.tooltip", function(evt) {
                    tooltip.hidden(!0);
                }), bars2.dispatch.on("elementMouseout.tooltip", function(evt) {
                    tooltip.hidden(!0);
                }), bars1.dispatch.on("elementMousemove.tooltip", function(evt) {
                    tooltip();
                }), bars2.dispatch.on("elementMousemove.tooltip", function(evt) {
                    tooltip();
                }));
            }), chart;
        }
        var yDomain1, yDomain2, margin = {
            top: 30,
            right: 20,
            bottom: 50,
            left: 60
        }, marginTop = null, color = nv.utils.defaultColor(), width = null, height = null, showLegend = !0, noData = null, getX = function(d) {
            return d.x;
        }, getY = function(d) {
            return d.y;
        }, interpolate = "linear", useVoronoi = !0, interactiveLayer = nv.interactiveGuideline(), useInteractiveGuideline = !1, legendRightAxisHint = " (right axis)", duration = 250, x = d3.scale.linear(), yScale1 = d3.scale.linear(), yScale2 = d3.scale.linear(), lines1 = nv.models.line().yScale(yScale1).duration(duration), lines2 = nv.models.line().yScale(yScale2).duration(duration), scatters1 = nv.models.scatter().yScale(yScale1).duration(duration), scatters2 = nv.models.scatter().yScale(yScale2).duration(duration), bars1 = nv.models.multiBar().stacked(!1).yScale(yScale1).duration(duration), bars2 = nv.models.multiBar().stacked(!1).yScale(yScale2).duration(duration), stack1 = nv.models.stackedArea().yScale(yScale1).duration(duration), stack2 = nv.models.stackedArea().yScale(yScale2).duration(duration), xAxis = nv.models.axis().scale(x).orient("bottom").tickPadding(5).duration(duration), yAxis1 = nv.models.axis().scale(yScale1).orient("left").duration(duration), yAxis2 = nv.models.axis().scale(yScale2).orient("right").duration(duration), legend = nv.models.legend().height(30), tooltip = nv.models.tooltip(), dispatch = d3.dispatch(), charts = [ lines1, lines2, scatters1, scatters2, bars1, bars2, stack1, stack2 ];
        return chart.dispatch = dispatch, chart.legend = legend, chart.lines1 = lines1, 
        chart.lines2 = lines2, chart.scatters1 = scatters1, chart.scatters2 = scatters2, 
        chart.bars1 = bars1, chart.bars2 = bars2, chart.stack1 = stack1, chart.stack2 = stack2, 
        chart.xAxis = xAxis, chart.yAxis1 = yAxis1, chart.yAxis2 = yAxis2, chart.tooltip = tooltip, 
        chart.interactiveLayer = interactiveLayer, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            showLegend: {
                get: function() {
                    return showLegend;
                },
                set: function(_) {
                    showLegend = _;
                }
            },
            xScale: {
                get: function() {
                    return x;
                },
                set: function(_) {
                    x = _, xAxis.scale(x);
                }
            },
            yDomain1: {
                get: function() {
                    return yDomain1;
                },
                set: function(_) {
                    yDomain1 = _;
                }
            },
            yDomain2: {
                get: function() {
                    return yDomain2;
                },
                set: function(_) {
                    yDomain2 = _;
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            interpolate: {
                get: function() {
                    return interpolate;
                },
                set: function(_) {
                    interpolate = _;
                }
            },
            legendRightAxisHint: {
                get: function() {
                    return legendRightAxisHint;
                },
                set: function(_) {
                    legendRightAxisHint = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    void 0 !== _.top && (margin.top = _.top, marginTop = _.top), margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            },
            x: {
                get: function() {
                    return getX;
                },
                set: function(_) {
                    getX = _, lines1.x(_), lines2.x(_), scatters1.x(_), scatters2.x(_), bars1.x(_), 
                    bars2.x(_), stack1.x(_), stack2.x(_);
                }
            },
            y: {
                get: function() {
                    return getY;
                },
                set: function(_) {
                    getY = _, lines1.y(_), lines2.y(_), scatters1.y(_), scatters2.y(_), stack1.y(_), 
                    stack2.y(_), bars1.y(_), bars2.y(_);
                }
            },
            useVoronoi: {
                get: function() {
                    return useVoronoi;
                },
                set: function(_) {
                    useVoronoi = _, lines1.useVoronoi(_), lines2.useVoronoi(_), stack1.useVoronoi(_), 
                    stack2.useVoronoi(_);
                }
            },
            useInteractiveGuideline: {
                get: function() {
                    return useInteractiveGuideline;
                },
                set: function(_) {
                    useInteractiveGuideline = _, useInteractiveGuideline && (lines1.interactive(!1), 
                    lines1.useVoronoi(!1), lines2.interactive(!1), lines2.useVoronoi(!1), stack1.interactive(!1), 
                    stack1.useVoronoi(!1), stack2.interactive(!1), stack2.useVoronoi(!1), scatters1.interactive(!1), 
                    scatters2.interactive(!1));
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, [ lines1, lines2, stack1, stack2, scatters1, scatters2, xAxis, yAxis1, yAxis2 ].forEach(function(model) {
                        model.duration(duration);
                    });
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.ohlcBar = function() {
        "use strict";
        function chart(selection) {
            return selection.each(function(data) {
                container = d3.select(this);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin);
                nv.utils.initSVG(container);
                var w = availableWidth / data[0].values.length * .9;
                x.domain(xDomain || d3.extent(data[0].values.map(getX).concat(forceX))), padData ? x.range(xRange || [ .5 * availableWidth / data[0].values.length, availableWidth * (data[0].values.length - .5) / data[0].values.length ]) : x.range(xRange || [ 5 + w / 2, availableWidth - w / 2 - 5 ]), 
                y.domain(yDomain || [ d3.min(data[0].values.map(getLow).concat(forceY)), d3.max(data[0].values.map(getHigh).concat(forceY)) ]).range(yRange || [ availableHeight, 0 ]), 
                x.domain()[0] === x.domain()[1] && (x.domain()[0] ? x.domain([ x.domain()[0] - .01 * x.domain()[0], x.domain()[1] + .01 * x.domain()[1] ]) : x.domain([ -1, 1 ])), 
                y.domain()[0] === y.domain()[1] && (y.domain()[0] ? y.domain([ y.domain()[0] + .01 * y.domain()[0], y.domain()[1] - .01 * y.domain()[1] ]) : y.domain([ -1, 1 ]));
                var wrap = d3.select(this).selectAll("g.nv-wrap.nv-ohlcBar").data([ data[0].values ]), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-ohlcBar"), defsEnter = wrapEnter.append("defs"), gEnter = wrapEnter.append("g"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-ticks"), wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), 
                container.on("click", function(d, i) {
                    dispatch.chartClick({
                        data: d,
                        index: i,
                        pos: d3.event,
                        id: id
                    });
                }), defsEnter.append("clipPath").attr("id", "nv-chart-clip-path-" + id).append("rect"), 
                wrap.select("#nv-chart-clip-path-" + id + " rect").attr("width", availableWidth).attr("height", availableHeight), 
                g.attr("clip-path", clipEdge ? "url(#nv-chart-clip-path-" + id + ")" : "");
                var ticks = wrap.select(".nv-ticks").selectAll(".nv-tick").data(function(d) {
                    return d;
                });
                ticks.exit().remove(), ticks.enter().append("path").attr("class", function(d, i, j) {
                    return (getOpen(d, i) > getClose(d, i) ? "nv-tick negative" : "nv-tick positive") + " nv-tick-" + j + "-" + i;
                }).attr("d", function(d, i) {
                    return "m0,0l0," + (y(getOpen(d, i)) - y(getHigh(d, i))) + "l" + -w / 2 + ",0l" + w / 2 + ",0l0," + (y(getLow(d, i)) - y(getOpen(d, i))) + "l0," + (y(getClose(d, i)) - y(getLow(d, i))) + "l" + w / 2 + ",0l" + -w / 2 + ",0z";
                }).attr("transform", function(d, i) {
                    return "translate(" + x(getX(d, i)) + "," + y(getHigh(d, i)) + ")";
                }).attr("fill", function(d, i) {
                    return color[0];
                }).attr("stroke", function(d, i) {
                    return color[0];
                }).attr("x", 0).attr("y", function(d, i) {
                    return y(Math.max(0, getY(d, i)));
                }).attr("height", function(d, i) {
                    return Math.abs(y(getY(d, i)) - y(0));
                }), ticks.attr("class", function(d, i, j) {
                    return (getOpen(d, i) > getClose(d, i) ? "nv-tick negative" : "nv-tick positive") + " nv-tick-" + j + "-" + i;
                }), d3.transition(ticks).attr("transform", function(d, i) {
                    return "translate(" + x(getX(d, i)) + "," + y(getHigh(d, i)) + ")";
                }).attr("d", function(d, i) {
                    var w = availableWidth / data[0].values.length * .9;
                    return "m0,0l0," + (y(getOpen(d, i)) - y(getHigh(d, i))) + "l" + -w / 2 + ",0l" + w / 2 + ",0l0," + (y(getLow(d, i)) - y(getOpen(d, i))) + "l0," + (y(getClose(d, i)) - y(getLow(d, i))) + "l" + w / 2 + ",0l" + -w / 2 + ",0z";
                });
            }), chart;
        }
        var xDomain, yDomain, xRange, yRange, margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, width = null, height = null, id = Math.floor(1e4 * Math.random()), container = null, x = d3.scale.linear(), y = d3.scale.linear(), getX = function(d) {
            return d.x;
        }, getY = function(d) {
            return d.y;
        }, getOpen = function(d) {
            return d.open;
        }, getClose = function(d) {
            return d.close;
        }, getHigh = function(d) {
            return d.high;
        }, getLow = function(d) {
            return d.low;
        }, forceX = [], forceY = [], padData = !1, clipEdge = !0, color = nv.utils.defaultColor(), interactive = !1, dispatch = d3.dispatch("stateChange", "changeState", "renderEnd", "chartClick", "elementClick", "elementDblClick", "elementMouseover", "elementMouseout", "elementMousemove");
        return chart.highlightPoint = function(pointIndex, isHoverOver) {
            chart.clearHighlights(), container.select(".nv-ohlcBar .nv-tick-0-" + pointIndex).classed("hover", isHoverOver);
        }, chart.clearHighlights = function() {
            container.select(".nv-ohlcBar .nv-tick.hover").classed("hover", !1);
        }, chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            xScale: {
                get: function() {
                    return x;
                },
                set: function(_) {
                    x = _;
                }
            },
            yScale: {
                get: function() {
                    return y;
                },
                set: function(_) {
                    y = _;
                }
            },
            xDomain: {
                get: function() {
                    return xDomain;
                },
                set: function(_) {
                    xDomain = _;
                }
            },
            yDomain: {
                get: function() {
                    return yDomain;
                },
                set: function(_) {
                    yDomain = _;
                }
            },
            xRange: {
                get: function() {
                    return xRange;
                },
                set: function(_) {
                    xRange = _;
                }
            },
            yRange: {
                get: function() {
                    return yRange;
                },
                set: function(_) {
                    yRange = _;
                }
            },
            forceX: {
                get: function() {
                    return forceX;
                },
                set: function(_) {
                    forceX = _;
                }
            },
            forceY: {
                get: function() {
                    return forceY;
                },
                set: function(_) {
                    forceY = _;
                }
            },
            padData: {
                get: function() {
                    return padData;
                },
                set: function(_) {
                    padData = _;
                }
            },
            clipEdge: {
                get: function() {
                    return clipEdge;
                },
                set: function(_) {
                    clipEdge = _;
                }
            },
            id: {
                get: function() {
                    return id;
                },
                set: function(_) {
                    id = _;
                }
            },
            interactive: {
                get: function() {
                    return interactive;
                },
                set: function(_) {
                    interactive = _;
                }
            },
            x: {
                get: function() {
                    return getX;
                },
                set: function(_) {
                    getX = _;
                }
            },
            y: {
                get: function() {
                    return getY;
                },
                set: function(_) {
                    getY = _;
                }
            },
            open: {
                get: function() {
                    return getOpen();
                },
                set: function(_) {
                    getOpen = _;
                }
            },
            close: {
                get: function() {
                    return getClose();
                },
                set: function(_) {
                    getClose = _;
                }
            },
            high: {
                get: function() {
                    return getHigh;
                },
                set: function(_) {
                    getHigh = _;
                }
            },
            low: {
                get: function() {
                    return getLow;
                },
                set: function(_) {
                    getLow = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 != _.top ? _.top : margin.top, margin.right = void 0 != _.right ? _.right : margin.right, 
                    margin.bottom = void 0 != _.bottom ? _.bottom : margin.bottom, margin.left = void 0 != _.left ? _.left : margin.left;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.parallelCoordinates = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), selection.each(function(data) {
                function path(d) {
                    return line(enabledDimensions.map(function(p) {
                        if (isNaN(d.values[p.key]) || isNaN(parseFloat(d.values[p.key])) || displayMissingValuesline) {
                            var domain = y[p.key].domain(), range = y[p.key].range(), min = domain[0] - (domain[1] - domain[0]) / 9;
                            if (axisWithUndefinedValues.indexOf(p.key) < 0) {
                                var newscale = d3.scale.linear().domain([ min, domain[1] ]).range([ availableHeight - 12, range[1] ]);
                                y[p.key].brush.y(newscale), axisWithUndefinedValues.push(p.key);
                            }
                            if (isNaN(d.values[p.key]) || isNaN(parseFloat(d.values[p.key]))) return [ x(p.key), y[p.key](min) ];
                        }
                        return void 0 !== missingValuesline && (axisWithUndefinedValues.length > 0 || displayMissingValuesline ? (missingValuesline.style("display", "inline"), 
                        missingValueslineText.style("display", "inline")) : (missingValuesline.style("display", "none"), 
                        missingValueslineText.style("display", "none"))), [ x(p.key), y[p.key](d.values[p.key]) ];
                    }));
                }
                function restoreBrush(visible) {
                    filters.forEach(function(f) {
                        var brushDomain = y[f.dimension].brush.y().domain();
                        f.hasOnlyNaN && (f.extent[1] = (y[f.dimension].domain()[1] - brushDomain[0]) * (f.extent[1] - f.extent[0]) / (oldDomainMaxValue[f.dimension] - f.extent[0]) + brushDomain[0]), 
                        f.hasNaN && (f.extent[0] = brushDomain[0]), visible && y[f.dimension].brush.extent(f.extent);
                    }), dimensions.select(".nv-brushBackground").each(function(d) {
                        d3.select(this).call(y[d.key].brush);
                    }).selectAll("rect").attr("x", -8).attr("width", 16), updateTicks();
                }
                function brushstart() {
                    displayBrush === !1 && (displayBrush = !0, restoreBrush(!0));
                }
                function brush() {
                    actives = dimensionNames.filter(function(p) {
                        return !y[p].brush.empty();
                    }), extents = actives.map(function(p) {
                        return y[p].brush.extent();
                    }), filters = [], actives.forEach(function(d, i) {
                        filters[i] = {
                            dimension: d,
                            extent: extents[i],
                            hasNaN: !1,
                            hasOnlyNaN: !1
                        };
                    }), active = [], foreground.style("display", function(d) {
                        var isActive = actives.every(function(p, i) {
                            return !(!isNaN(d.values[p]) && !isNaN(parseFloat(d.values[p])) || extents[i][0] != y[p].brush.y().domain()[0]) || extents[i][0] <= d.values[p] && d.values[p] <= extents[i][1] && !isNaN(parseFloat(d.values[p]));
                        });
                        return isActive && active.push(d), isActive ? null : "none";
                    }), updateTicks(), dispatch.brush({
                        filters: filters,
                        active: active
                    });
                }
                function brushend() {
                    var hasActiveBrush = actives.length > 0;
                    filters.forEach(function(f) {
                        f.extent[0] === y[f.dimension].brush.y().domain()[0] && axisWithUndefinedValues.indexOf(f.dimension) >= 0 && (f.hasNaN = !0), 
                        f.extent[1] < y[f.dimension].domain()[0] && (f.hasOnlyNaN = !0);
                    }), dispatch.brushEnd(active, hasActiveBrush);
                }
                function updateTicks() {
                    dimensions.select(".nv-axis").each(function(d, i) {
                        var f = filters.filter(function(k) {
                            return k.dimension == d.key;
                        });
                        currentTicks[d.key] = y[d.key].domain(), 0 != f.length && displayBrush && (currentTicks[d.key] = [], 
                        f[0].extent[1] > y[d.key].domain()[0] && (currentTicks[d.key] = [ f[0].extent[1] ]), 
                        f[0].extent[0] >= y[d.key].domain()[0] && currentTicks[d.key].push(f[0].extent[0])), 
                        d3.select(this).call(axis.scale(y[d.key]).tickFormat(d.format).tickValues(currentTicks[d.key]));
                    });
                }
                function dragStart(d) {
                    dragging[d.key] = this.parentNode.__origin__ = x(d.key), background.attr("visibility", "hidden");
                }
                function dragMove(d) {
                    dragging[d.key] = Math.min(availableWidth, Math.max(0, this.parentNode.__origin__ += d3.event.x)), 
                    foreground.attr("d", path), enabledDimensions.sort(function(a, b) {
                        return dimensionPosition(a.key) - dimensionPosition(b.key);
                    }), enabledDimensions.forEach(function(d, i) {
                        return d.currentPosition = i;
                    }), x.domain(enabledDimensions.map(function(d) {
                        return d.key;
                    })), dimensions.attr("transform", function(d) {
                        return "translate(" + dimensionPosition(d.key) + ")";
                    });
                }
                function dragEnd(d, i) {
                    delete this.parentNode.__origin__, delete dragging[d.key], d3.select(this.parentNode).attr("transform", "translate(" + x(d.key) + ")"), 
                    foreground.attr("d", path), background.attr("d", path).attr("visibility", null), 
                    dispatch.dimensionsOrder(enabledDimensions);
                }
                function dimensionPosition(d) {
                    var v = dragging[d];
                    return null == v ? x(d) : v;
                }
                var container = d3.select(this);
                if (availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin), 
                nv.utils.initSVG(container), void 0 === data[0].values) {
                    var newData = [];
                    data.forEach(function(d) {
                        var val = {}, key = Object.keys(d);
                        key.forEach(function(k) {
                            "name" !== k && (val[k] = d[k]);
                        }), newData.push({
                            key: d.name,
                            values: val
                        });
                    }), data = newData;
                }
                var dataValues = data.map(function(d) {
                    return d.values;
                });
                0 === active.length && (active = data), dimensionNames = dimensionData.sort(function(a, b) {
                    return a.currentPosition - b.currentPosition;
                }).map(function(d) {
                    return d.key;
                }), enabledDimensions = dimensionData.filter(function(d) {
                    return !d.disabled;
                }), x.rangePoints([ 0, availableWidth ], 1).domain(enabledDimensions.map(function(d) {
                    return d.key;
                }));
                var oldDomainMaxValue = {}, displayMissingValuesline = !1, currentTicks = [];
                dimensionNames.forEach(function(d) {
                    var extent = d3.extent(dataValues, function(p) {
                        return +p[d];
                    }), min = extent[0], max = extent[1], onlyUndefinedValues = !1;
                    (isNaN(min) || isNaN(max)) && (onlyUndefinedValues = !0, min = 0, max = 0), min === max && (min -= 1, 
                    max += 1);
                    var f = filters.filter(function(k) {
                        return k.dimension == d;
                    });
                    0 !== f.length && (onlyUndefinedValues ? (min = y[d].domain()[0], max = y[d].domain()[1]) : !f[0].hasOnlyNaN && displayBrush ? (min = min > f[0].extent[0] ? f[0].extent[0] : min, 
                    max = max < f[0].extent[1] ? f[0].extent[1] : max) : f[0].hasNaN && (max = max < f[0].extent[1] ? f[0].extent[1] : max, 
                    oldDomainMaxValue[d] = y[d].domain()[1], displayMissingValuesline = !0)), y[d] = d3.scale.linear().domain([ min, max ]).range([ .9 * (availableHeight - 12), 0 ]), 
                    axisWithUndefinedValues = [], y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush).on("brushend", brushend);
                });
                var wrap = container.selectAll("g.nv-wrap.nv-parallelCoordinates").data([ data ]), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-parallelCoordinates"), gEnter = wrapEnter.append("g"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-parallelCoordinates background"), gEnter.append("g").attr("class", "nv-parallelCoordinates foreground"), 
                gEnter.append("g").attr("class", "nv-parallelCoordinates missingValuesline"), wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), 
                line.interpolate("cardinal").tension(lineTension), axis.orient("left");
                var missingValuesline, missingValueslineText, axisDrag = d3.behavior.drag().on("dragstart", dragStart).on("drag", dragMove).on("dragend", dragEnd), step = x.range()[1] - x.range()[0];
                if (step = isNaN(step) ? x.range()[0] : step, !isNaN(step)) {
                    var lineData = [ 0 + step / 2, availableHeight - 12, availableWidth - step / 2, availableHeight - 12 ];
                    missingValuesline = wrap.select(".missingValuesline").selectAll("line").data([ lineData ]), 
                    missingValuesline.enter().append("line"), missingValuesline.exit().remove(), missingValuesline.attr("x1", function(d) {
                        return d[0];
                    }).attr("y1", function(d) {
                        return d[1];
                    }).attr("x2", function(d) {
                        return d[2];
                    }).attr("y2", function(d) {
                        return d[3];
                    }), missingValueslineText = wrap.select(".missingValuesline").selectAll("text").data([ undefinedValuesLabel ]), 
                    missingValueslineText.append("text").data([ undefinedValuesLabel ]), missingValueslineText.enter().append("text"), 
                    missingValueslineText.exit().remove(), missingValueslineText.attr("y", availableHeight).attr("x", availableWidth - 92 - step / 2).text(function(d) {
                        return d;
                    });
                }
                background = wrap.select(".background").selectAll("path").data(data), background.enter().append("path"), 
                background.exit().remove(), background.attr("d", path), foreground = wrap.select(".foreground").selectAll("path").data(data), 
                foreground.enter().append("path"), foreground.exit().remove(), foreground.attr("d", path).style("stroke-width", function(d, i) {
                    return isNaN(d.strokeWidth) && (d.strokeWidth = 1), d.strokeWidth;
                }).attr("stroke", function(d, i) {
                    return d.color || color(d, i);
                }), foreground.on("mouseover", function(d, i) {
                    d3.select(this).classed("hover", !0).style("stroke-width", d.strokeWidth + 2 + "px").style("stroke-opacity", 1), 
                    dispatch.elementMouseover({
                        label: d.name,
                        color: d.color || color(d, i),
                        values: d.values,
                        dimensions: enabledDimensions
                    });
                }), foreground.on("mouseout", function(d, i) {
                    d3.select(this).classed("hover", !1).style("stroke-width", d.strokeWidth + "px").style("stroke-opacity", .7), 
                    dispatch.elementMouseout({
                        label: d.name,
                        index: i
                    });
                }), foreground.on("mousemove", function(d, i) {
                    dispatch.elementMousemove();
                }), foreground.on("click", function(d) {
                    dispatch.elementClick({
                        id: d.id
                    });
                }), dimensions = g.selectAll(".dimension").data(enabledDimensions);
                var dimensionsEnter = dimensions.enter().append("g").attr("class", "nv-parallelCoordinates dimension");
                dimensions.attr("transform", function(d) {
                    return "translate(" + x(d.key) + ",0)";
                }), dimensionsEnter.append("g").attr("class", "nv-axis"), dimensionsEnter.append("text").attr("class", "nv-label").style("cursor", "move").attr("dy", "-1em").attr("text-anchor", "middle").on("mouseover", function(d, i) {
                    dispatch.elementMouseover({
                        label: d.tooltip || d.key,
                        color: d.color
                    });
                }).on("mouseout", function(d, i) {
                    dispatch.elementMouseout({
                        label: d.tooltip
                    });
                }).on("mousemove", function(d, i) {
                    dispatch.elementMousemove();
                }).call(axisDrag), dimensionsEnter.append("g").attr("class", "nv-brushBackground"), 
                dimensions.exit().remove(), dimensions.select(".nv-label").text(function(d) {
                    return d.key;
                }), restoreBrush(displayBrush);
                var actives = dimensionNames.filter(function(p) {
                    return !y[p].brush.empty();
                }), extents = actives.map(function(p) {
                    return y[p].brush.extent();
                }), formerActive = active.slice(0);
                active = [], foreground.style("display", function(d) {
                    var isActive = actives.every(function(p, i) {
                        return !(!isNaN(d.values[p]) && !isNaN(parseFloat(d.values[p])) || extents[i][0] != y[p].brush.y().domain()[0]) || extents[i][0] <= d.values[p] && d.values[p] <= extents[i][1] && !isNaN(parseFloat(d.values[p]));
                    });
                    return isActive && active.push(d), isActive ? null : "none";
                }), (filters.length > 0 || !nv.utils.arrayEquals(active, formerActive)) && dispatch.activeChanged(active);
            }), chart;
        }
        var foreground, background, dimensions, margin = {
            top: 30,
            right: 0,
            bottom: 10,
            left: 0
        }, width = null, height = null, availableWidth = null, availableHeight = null, x = d3.scale.ordinal(), y = {}, undefinedValuesLabel = "undefined values", dimensionData = [], enabledDimensions = [], dimensionNames = [], displayBrush = !0, color = nv.utils.defaultColor(), filters = [], active = [], dragging = [], axisWithUndefinedValues = [], lineTension = 1, line = d3.svg.line(), axis = d3.svg.axis(), dispatch = d3.dispatch("brushstart", "brush", "brushEnd", "dimensionsOrder", "stateChange", "elementClick", "elementMouseover", "elementMouseout", "elementMousemove", "renderEnd", "activeChanged"), renderWatch = nv.utils.renderWatch(dispatch);
        return chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            dimensionData: {
                get: function() {
                    return dimensionData;
                },
                set: function(_) {
                    dimensionData = _;
                }
            },
            displayBrush: {
                get: function() {
                    return displayBrush;
                },
                set: function(_) {
                    displayBrush = _;
                }
            },
            filters: {
                get: function() {
                    return filters;
                },
                set: function(_) {
                    filters = _;
                }
            },
            active: {
                get: function() {
                    return active;
                },
                set: function(_) {
                    active = _;
                }
            },
            lineTension: {
                get: function() {
                    return lineTension;
                },
                set: function(_) {
                    lineTension = _;
                }
            },
            undefinedValuesLabel: {
                get: function() {
                    return undefinedValuesLabel;
                },
                set: function(_) {
                    undefinedValuesLabel = _;
                }
            },
            dimensions: {
                get: function() {
                    return dimensionData.map(function(d) {
                        return d.key;
                    });
                },
                set: function(_) {
                    nv.deprecated("dimensions", "use dimensionData instead"), 0 === dimensionData.length ? _.forEach(function(k) {
                        dimensionData.push({
                            key: k
                        });
                    }) : _.forEach(function(k, i) {
                        dimensionData[i].key = k;
                    });
                }
            },
            dimensionNames: {
                get: function() {
                    return dimensionData.map(function(d) {
                        return d.key;
                    });
                },
                set: function(_) {
                    nv.deprecated("dimensionNames", "use dimensionData instead"), dimensionNames = [], 
                    0 === dimensionData.length ? _.forEach(function(k) {
                        dimensionData.push({
                            key: k
                        });
                    }) : _.forEach(function(k, i) {
                        dimensionData[i].key = k;
                    });
                }
            },
            dimensionFormats: {
                get: function() {
                    return dimensionData.map(function(d) {
                        return d.format;
                    });
                },
                set: function(_) {
                    nv.deprecated("dimensionFormats", "use dimensionData instead"), 0 === dimensionData.length ? _.forEach(function(f) {
                        dimensionData.push({
                            format: f
                        });
                    }) : _.forEach(function(f, i) {
                        dimensionData[i].format = f;
                    });
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.parallelCoordinatesChart = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), renderWatch.models(parallelCoordinates), selection.each(function(data) {
                var container = d3.select(this);
                nv.utils.initSVG(container);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin);
                if (chart.update = function() {
                    container.call(chart);
                }, chart.container = this, state.setter(stateSetter(dimensionData), chart.update).getter(stateGetter(dimensionData)).update(), 
                state.disabled = dimensionData.map(function(d) {
                    return !!d.disabled;
                }), dimensionData = dimensionData.map(function(d) {
                    return d.disabled = !!d.disabled, d;
                }), dimensionData.forEach(function(d, i) {
                    d.originalPosition = isNaN(d.originalPosition) ? i : d.originalPosition, d.currentPosition = isNaN(d.currentPosition) ? i : d.currentPosition;
                }), !defaultState) {
                    var key;
                    defaultState = {};
                    for (key in state) state[key] instanceof Array ? defaultState[key] = state[key].slice(0) : defaultState[key] = state[key];
                }
                if (!data || !data.length) return nv.utils.noData(chart, container), chart;
                container.selectAll(".nv-noData").remove();
                var wrap = container.selectAll("g.nv-wrap.nv-parallelCoordinatesChart").data([ data ]), gEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-parallelCoordinatesChart").append("g"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-parallelCoordinatesWrap"), gEnter.append("g").attr("class", "nv-legendWrap"), 
                g.select("rect").attr("width", availableWidth).attr("height", availableHeight > 0 ? availableHeight : 0), 
                showLegend ? (legend.width(availableWidth).color(function(d) {
                    return "rgb(188,190,192)";
                }), g.select(".nv-legendWrap").datum(dimensionData.sort(function(a, b) {
                    return a.originalPosition - b.originalPosition;
                })).call(legend), marginTop || legend.height() === margin.top || (margin.top = legend.height(), 
                availableHeight = nv.utils.availableHeight(height, container, margin)), wrap.select(".nv-legendWrap").attr("transform", "translate( 0 ," + -margin.top + ")")) : g.select(".nv-legendWrap").selectAll("*").remove(), 
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), parallelCoordinates.width(availableWidth).height(availableHeight).dimensionData(dimensionData).displayBrush(displayBrush);
                var parallelCoordinatesWrap = g.select(".nv-parallelCoordinatesWrap ").datum(data);
                parallelCoordinatesWrap.transition().call(parallelCoordinates), parallelCoordinates.dispatch.on("brushEnd", function(active, hasActiveBrush) {
                    hasActiveBrush ? (displayBrush = !0, dispatch.brushEnd(active)) : displayBrush = !1;
                }), legend.dispatch.on("stateChange", function(newState) {
                    for (var key in newState) state[key] = newState[key];
                    dispatch.stateChange(state), chart.update();
                }), parallelCoordinates.dispatch.on("dimensionsOrder", function(e) {
                    dimensionData.sort(function(a, b) {
                        return a.currentPosition - b.currentPosition;
                    });
                    var isSorted = !1;
                    dimensionData.forEach(function(d, i) {
                        d.currentPosition = i, d.currentPosition !== d.originalPosition && (isSorted = !0);
                    }), dispatch.dimensionsOrder(dimensionData, isSorted);
                }), dispatch.on("changeState", function(e) {
                    "undefined" != typeof e.disabled && (dimensionData.forEach(function(series, i) {
                        series.disabled = e.disabled[i];
                    }), state.disabled = e.disabled), chart.update();
                });
            }), renderWatch.renderEnd("parraleleCoordinateChart immediate"), chart;
        }
        var parallelCoordinates = nv.models.parallelCoordinates(), legend = nv.models.legend(), tooltip = nv.models.tooltip(), margin = (nv.models.tooltip(), 
        {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }), marginTop = null, width = null, height = null, showLegend = !0, color = nv.utils.defaultColor(), state = nv.utils.state(), dimensionData = [], displayBrush = !0, defaultState = null, noData = null, nanValue = "undefined", dispatch = d3.dispatch("dimensionsOrder", "brushEnd", "stateChange", "changeState", "renderEnd"), renderWatch = nv.utils.renderWatch(dispatch), stateGetter = function(data) {
            return function() {
                return {
                    active: data.map(function(d) {
                        return !d.disabled;
                    })
                };
            };
        }, stateSetter = function(data) {
            return function(state) {
                void 0 !== state.active && data.forEach(function(series, i) {
                    series.disabled = !state.active[i];
                });
            };
        };
        return tooltip.contentGenerator(function(data) {
            var str = '<table><thead><tr><td class="legend-color-guide"><div style="background-color:' + data.color + '"></div></td><td><strong>' + data.key + "</strong></td></tr></thead>";
            return 0 !== data.series.length && (str += '<tbody><tr><td height ="10px"></td></tr>', 
            data.series.forEach(function(d) {
                str = str + '<tr><td class="legend-color-guide"><div style="background-color:' + d.color + '"></div></td><td class="key">' + d.key + '</td><td class="value">' + d.value + "</td></tr>";
            }), str += "</tbody>"), str += "</table>";
        }), parallelCoordinates.dispatch.on("elementMouseover.tooltip", function(evt) {
            var tp = {
                key: evt.label,
                color: evt.color,
                series: []
            };
            evt.values && (Object.keys(evt.values).forEach(function(d) {
                var dim = evt.dimensions.filter(function(dd) {
                    return dd.key === d;
                })[0];
                if (dim) {
                    var v;
                    v = isNaN(evt.values[d]) || isNaN(parseFloat(evt.values[d])) ? nanValue : dim.format(evt.values[d]), 
                    tp.series.push({
                        idx: dim.currentPosition,
                        key: d,
                        value: v,
                        color: dim.color
                    });
                }
            }), tp.series.sort(function(a, b) {
                return a.idx - b.idx;
            })), tooltip.data(tp).hidden(!1);
        }), parallelCoordinates.dispatch.on("elementMouseout.tooltip", function(evt) {
            tooltip.hidden(!0);
        }), parallelCoordinates.dispatch.on("elementMousemove.tooltip", function() {
            tooltip();
        }), chart.dispatch = dispatch, chart.parallelCoordinates = parallelCoordinates, 
        chart.legend = legend, chart.tooltip = tooltip, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            showLegend: {
                get: function() {
                    return showLegend;
                },
                set: function(_) {
                    showLegend = _;
                }
            },
            defaultState: {
                get: function() {
                    return defaultState;
                },
                set: function(_) {
                    defaultState = _;
                }
            },
            dimensionData: {
                get: function() {
                    return dimensionData;
                },
                set: function(_) {
                    dimensionData = _;
                }
            },
            displayBrush: {
                get: function() {
                    return displayBrush;
                },
                set: function(_) {
                    displayBrush = _;
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            nanValue: {
                get: function() {
                    return nanValue;
                },
                set: function(_) {
                    nanValue = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    void 0 !== _.top && (margin.top = _.top, marginTop = _.top), margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_), legend.color(color), parallelCoordinates.color(color);
                }
            }
        }), nv.utils.inheritOptions(chart, parallelCoordinates), nv.utils.initOptions(chart), 
        chart;
    }, nv.models.pie = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), selection.each(function(data) {
                function arcTween(a, idx) {
                    a.endAngle = isNaN(a.endAngle) ? 0 : a.endAngle, a.startAngle = isNaN(a.startAngle) ? 0 : a.startAngle, 
                    donut || (a.innerRadius = 0);
                    var i = d3.interpolate(this._current, a);
                    return this._current = i(0), function(t) {
                        return arcs[idx](i(t));
                    };
                }
                var availableWidth = width - margin.left - margin.right, availableHeight = height - margin.top - margin.bottom, radius = Math.min(availableWidth, availableHeight) / 2, arcsRadiusOuter = [], arcsRadiusInner = [];
                if (container = d3.select(this), 0 === arcsRadius.length) for (var outer = radius - radius / 10, inner = donutRatio * radius, i = 0; i < data[0].length; i++) arcsRadiusOuter.push(outer), 
                arcsRadiusInner.push(inner); else growOnHover ? (arcsRadiusOuter = arcsRadius.map(function(d) {
                    return (d.outer - d.outer / 10) * radius;
                }), arcsRadiusInner = arcsRadius.map(function(d) {
                    return (d.inner - d.inner / 10) * radius;
                }), donutRatio = d3.min(arcsRadius.map(function(d) {
                    return d.inner - d.inner / 10;
                }))) : (arcsRadiusOuter = arcsRadius.map(function(d) {
                    return d.outer * radius;
                }), arcsRadiusInner = arcsRadius.map(function(d) {
                    return d.inner * radius;
                }), donutRatio = d3.min(arcsRadius.map(function(d) {
                    return d.inner;
                })));
                nv.utils.initSVG(container);
                var wrap = container.selectAll(".nv-wrap.nv-pie").data(data), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-pie nv-chart-" + id), gEnter = wrapEnter.append("g"), g = wrap.select("g"), g_pie = gEnter.append("g").attr("class", "nv-pie");
                gEnter.append("g").attr("class", "nv-pieLabels"), wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), 
                g.select(".nv-pie").attr("transform", "translate(" + availableWidth / 2 + "," + availableHeight / 2 + ")"), 
                g.select(".nv-pieLabels").attr("transform", "translate(" + availableWidth / 2 + "," + availableHeight / 2 + ")"), 
                container.on("click", function(d, i) {
                    dispatch.chartClick({
                        data: d,
                        index: i,
                        pos: d3.event,
                        id: id
                    });
                }), arcs = [], arcsOver = [];
                for (var i = 0; i < data[0].length; i++) {
                    var arc = d3.svg.arc().outerRadius(arcsRadiusOuter[i]), arcOver = d3.svg.arc().outerRadius(arcsRadiusOuter[i] + 5);
                    startAngle !== !1 && (arc.startAngle(startAngle), arcOver.startAngle(startAngle)), 
                    endAngle !== !1 && (arc.endAngle(endAngle), arcOver.endAngle(endAngle)), donut && (arc.innerRadius(arcsRadiusInner[i]), 
                    arcOver.innerRadius(arcsRadiusInner[i])), arc.cornerRadius && cornerRadius && (arc.cornerRadius(cornerRadius), 
                    arcOver.cornerRadius(cornerRadius)), arcs.push(arc), arcsOver.push(arcOver);
                }
                var pie = d3.layout.pie().sort(null).value(function(d) {
                    return d.disabled ? 0 : getY(d);
                });
                pie.padAngle && padAngle && pie.padAngle(padAngle), donut && title && (g_pie.append("text").attr("class", "nv-pie-title"), 
                wrap.select(".nv-pie-title").style("text-anchor", "middle").text(function(d) {
                    return title;
                }).style("font-size", Math.min(availableWidth, availableHeight) * donutRatio * 2 / (title.length + 2) + "px").attr("dy", "0.35em").attr("transform", function(d, i) {
                    return "translate(0, " + titleOffset + ")";
                }));
                var slices = wrap.select(".nv-pie").selectAll(".nv-slice").data(pie), pieLabels = wrap.select(".nv-pieLabels").selectAll(".nv-label").data(pie);
                slices.exit().remove(), pieLabels.exit().remove();
                var ae = slices.enter().append("g");
                ae.attr("class", "nv-slice"), ae.on("mouseover", function(d, i) {
                    d3.select(this).classed("hover", !0), growOnHover && d3.select(this).select("path").transition().duration(70).attr("d", arcsOver[i]), 
                    dispatch.elementMouseover({
                        data: d.data,
                        index: i,
                        color: d3.select(this).style("fill"),
                        percent: (d.endAngle - d.startAngle) / (2 * Math.PI)
                    });
                }), ae.on("mouseout", function(d, i) {
                    d3.select(this).classed("hover", !1), growOnHover && d3.select(this).select("path").transition().duration(50).attr("d", arcs[i]), 
                    dispatch.elementMouseout({
                        data: d.data,
                        index: i
                    });
                }), ae.on("mousemove", function(d, i) {
                    dispatch.elementMousemove({
                        data: d.data,
                        index: i
                    });
                }), ae.on("click", function(d, i) {
                    var element = this;
                    dispatch.elementClick({
                        data: d.data,
                        index: i,
                        color: d3.select(this).style("fill"),
                        event: d3.event,
                        element: element
                    });
                }), ae.on("dblclick", function(d, i) {
                    dispatch.elementDblClick({
                        data: d.data,
                        index: i,
                        color: d3.select(this).style("fill")
                    });
                }), slices.attr("fill", function(d, i) {
                    return color(d.data, i);
                }), slices.attr("stroke", function(d, i) {
                    return color(d.data, i);
                });
                ae.append("path").each(function(d) {
                    this._current = d;
                });
                if (slices.select("path").transition().duration(duration).attr("d", function(d, i) {
                    return arcs[i](d);
                }).attrTween("d", arcTween), showLabels) {
                    for (var labelsArc = [], i = 0; i < data[0].length; i++) labelsArc.push(arcs[i]), 
                    labelsOutside ? donut && (labelsArc[i] = d3.svg.arc().outerRadius(arcs[i].outerRadius()), 
                    startAngle !== !1 && labelsArc[i].startAngle(startAngle), endAngle !== !1 && labelsArc[i].endAngle(endAngle)) : donut || labelsArc[i].innerRadius(0);
                    pieLabels.enter().append("g").classed("nv-label", !0).each(function(d, i) {
                        var group = d3.select(this);
                        group.attr("transform", function(d, i) {
                            if (labelSunbeamLayout) {
                                d.outerRadius = arcsRadiusOuter[i] + 10, d.innerRadius = arcsRadiusOuter[i] + 15;
                                var rotateAngle = (d.startAngle + d.endAngle) / 2 * (180 / Math.PI);
                                return (d.startAngle + d.endAngle) / 2 < Math.PI ? rotateAngle -= 90 : rotateAngle += 90, 
                                "translate(" + labelsArc[i].centroid(d) + ") rotate(" + rotateAngle + ")";
                            }
                            return d.outerRadius = radius + 10, d.innerRadius = radius + 15, "translate(" + labelsArc[i].centroid(d) + ")";
                        }), group.append("rect").style("stroke", "#fff").style("fill", "#fff").attr("rx", 3).attr("ry", 3), 
                        group.append("text").style("text-anchor", labelSunbeamLayout ? (d.startAngle + d.endAngle) / 2 < Math.PI ? "start" : "end" : "middle").style("fill", "#000");
                    });
                    var labelLocationHash = {}, avgHeight = 14, avgWidth = 140, createHashKey = function(coordinates) {
                        return Math.floor(coordinates[0] / avgWidth) * avgWidth + "," + Math.floor(coordinates[1] / avgHeight) * avgHeight;
                    }, getSlicePercentage = function(d) {
                        return (d.endAngle - d.startAngle) / (2 * Math.PI);
                    };
                    pieLabels.watchTransition(renderWatch, "pie labels").attr("transform", function(d, i) {
                        if (labelSunbeamLayout) {
                            d.outerRadius = arcsRadiusOuter[i] + 10, d.innerRadius = arcsRadiusOuter[i] + 15;
                            var rotateAngle = (d.startAngle + d.endAngle) / 2 * (180 / Math.PI);
                            return (d.startAngle + d.endAngle) / 2 < Math.PI ? rotateAngle -= 90 : rotateAngle += 90, 
                            "translate(" + labelsArc[i].centroid(d) + ") rotate(" + rotateAngle + ")";
                        }
                        d.outerRadius = radius + 10, d.innerRadius = radius + 15;
                        var center = labelsArc[i].centroid(d), percent = getSlicePercentage(d);
                        if (d.value && percent >= labelThreshold) {
                            var hashKey = createHashKey(center);
                            labelLocationHash[hashKey] && (center[1] -= avgHeight), labelLocationHash[createHashKey(center)] = !0;
                        }
                        return "translate(" + center + ")";
                    }), pieLabels.select(".nv-label text").style("text-anchor", function(d, i) {
                        return labelSunbeamLayout ? (d.startAngle + d.endAngle) / 2 < Math.PI ? "start" : "end" : "middle";
                    }).text(function(d, i) {
                        var percent = getSlicePercentage(d), label = "";
                        if (!d.value || percent < labelThreshold) return "";
                        if ("function" == typeof labelType) label = labelType(d, i, {
                            key: getX(d.data),
                            value: getY(d.data),
                            percent: valueFormat(percent)
                        }); else switch (labelType) {
                          case "key":
                            label = getX(d.data);
                            break;

                          case "value":
                            label = valueFormat(getY(d.data));
                            break;

                          case "percent":
                            label = d3.format("%")(percent);
                        }
                        return label;
                    }), hideOverlapLabels && pieLabels.each(function(d, i) {
                        if (this.getBBox) {
                            var bb = this.getBBox(), center = labelsArc[i].centroid(d), topLeft = {
                                x: center[0] + bb.x,
                                y: center[1] + bb.y
                            }, topRight = {
                                x: topLeft.x + bb.width,
                                y: topLeft.y
                            }, bottomLeft = {
                                x: topLeft.x,
                                y: topLeft.y + bb.height
                            }, bottomRight = {
                                x: topLeft.x + bb.width,
                                y: topLeft.y + bb.height
                            };
                            d.visible = nv.utils.pointIsInArc(topLeft, d, arc) && nv.utils.pointIsInArc(topRight, d, arc) && nv.utils.pointIsInArc(bottomLeft, d, arc) && nv.utils.pointIsInArc(bottomRight, d, arc);
                        }
                    }).style("display", function(d) {
                        return d.visible ? null : "none";
                    });
                }
            }), renderWatch.renderEnd("pie immediate"), chart;
        }
        var margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, width = 500, height = 500, getX = function(d) {
            return d.x;
        }, getY = function(d) {
            return d.y;
        }, id = Math.floor(1e4 * Math.random()), container = null, color = nv.utils.defaultColor(), valueFormat = d3.format(",.2f"), showLabels = !0, labelsOutside = !1, labelType = "key", labelThreshold = .02, hideOverlapLabels = !1, donut = !1, title = !1, growOnHover = !0, titleOffset = 0, labelSunbeamLayout = !1, startAngle = !1, padAngle = !1, endAngle = !1, cornerRadius = 0, donutRatio = .5, duration = 250, arcsRadius = [], dispatch = d3.dispatch("chartClick", "elementClick", "elementDblClick", "elementMouseover", "elementMouseout", "elementMousemove", "renderEnd"), arcs = [], arcsOver = [], renderWatch = nv.utils.renderWatch(dispatch);
        return chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            arcsRadius: {
                get: function() {
                    return arcsRadius;
                },
                set: function(_) {
                    arcsRadius = _;
                }
            },
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            showLabels: {
                get: function() {
                    return showLabels;
                },
                set: function(_) {
                    showLabels = _;
                }
            },
            title: {
                get: function() {
                    return title;
                },
                set: function(_) {
                    title = _;
                }
            },
            titleOffset: {
                get: function() {
                    return titleOffset;
                },
                set: function(_) {
                    titleOffset = _;
                }
            },
            labelThreshold: {
                get: function() {
                    return labelThreshold;
                },
                set: function(_) {
                    labelThreshold = _;
                }
            },
            hideOverlapLabels: {
                get: function() {
                    return hideOverlapLabels;
                },
                set: function(_) {
                    hideOverlapLabels = _;
                }
            },
            valueFormat: {
                get: function() {
                    return valueFormat;
                },
                set: function(_) {
                    valueFormat = _;
                }
            },
            x: {
                get: function() {
                    return getX;
                },
                set: function(_) {
                    getX = _;
                }
            },
            id: {
                get: function() {
                    return id;
                },
                set: function(_) {
                    id = _;
                }
            },
            endAngle: {
                get: function() {
                    return endAngle;
                },
                set: function(_) {
                    endAngle = _;
                }
            },
            startAngle: {
                get: function() {
                    return startAngle;
                },
                set: function(_) {
                    startAngle = _;
                }
            },
            padAngle: {
                get: function() {
                    return padAngle;
                },
                set: function(_) {
                    padAngle = _;
                }
            },
            cornerRadius: {
                get: function() {
                    return cornerRadius;
                },
                set: function(_) {
                    cornerRadius = _;
                }
            },
            donutRatio: {
                get: function() {
                    return donutRatio;
                },
                set: function(_) {
                    donutRatio = _;
                }
            },
            labelsOutside: {
                get: function() {
                    return labelsOutside;
                },
                set: function(_) {
                    labelsOutside = _;
                }
            },
            labelSunbeamLayout: {
                get: function() {
                    return labelSunbeamLayout;
                },
                set: function(_) {
                    labelSunbeamLayout = _;
                }
            },
            donut: {
                get: function() {
                    return donut;
                },
                set: function(_) {
                    donut = _;
                }
            },
            growOnHover: {
                get: function() {
                    return growOnHover;
                },
                set: function(_) {
                    growOnHover = _;
                }
            },
            pieLabelsOutside: {
                get: function() {
                    return labelsOutside;
                },
                set: function(_) {
                    labelsOutside = _, nv.deprecated("pieLabelsOutside", "use labelsOutside instead");
                }
            },
            donutLabelsOutside: {
                get: function() {
                    return labelsOutside;
                },
                set: function(_) {
                    labelsOutside = _, nv.deprecated("donutLabelsOutside", "use labelsOutside instead");
                }
            },
            labelFormat: {
                get: function() {
                    return valueFormat;
                },
                set: function(_) {
                    valueFormat = _, nv.deprecated("labelFormat", "use valueFormat instead");
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = "undefined" != typeof _.top ? _.top : margin.top, margin.right = "undefined" != typeof _.right ? _.right : margin.right, 
                    margin.bottom = "undefined" != typeof _.bottom ? _.bottom : margin.bottom, margin.left = "undefined" != typeof _.left ? _.left : margin.left;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration);
                }
            },
            y: {
                get: function() {
                    return getY;
                },
                set: function(_) {
                    getY = d3.functor(_);
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            },
            labelType: {
                get: function() {
                    return labelType;
                },
                set: function(_) {
                    labelType = _ || "key";
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.pieChart = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), renderWatch.models(pie), selection.each(function(data) {
                var container = d3.select(this);
                nv.utils.initSVG(container);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin);
                if (chart.update = function() {
                    container.transition().call(chart);
                }, chart.container = this, state.setter(stateSetter(data), chart.update).getter(stateGetter(data)).update(), 
                state.disabled = data.map(function(d) {
                    return !!d.disabled;
                }), !defaultState) {
                    var key;
                    defaultState = {};
                    for (key in state) state[key] instanceof Array ? defaultState[key] = state[key].slice(0) : defaultState[key] = state[key];
                }
                if (!data || !data.length) return nv.utils.noData(chart, container), chart;
                container.selectAll(".nv-noData").remove();
                var wrap = container.selectAll("g.nv-wrap.nv-pieChart").data([ data ]), gEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-pieChart").append("g"), g = wrap.select("g");
                if (gEnter.append("g").attr("class", "nv-pieWrap"), gEnter.append("g").attr("class", "nv-legendWrap"), 
                showLegend) if ("top" === legendPosition) legend.width(availableWidth).key(pie.x()), 
                wrap.select(".nv-legendWrap").datum(data).call(legend), marginTop || legend.height() === margin.top || (margin.top = legend.height(), 
                availableHeight = nv.utils.availableHeight(height, container, margin)), wrap.select(".nv-legendWrap").attr("transform", "translate(0," + -margin.top + ")"); else if ("right" === legendPosition) {
                    var legendWidth = nv.models.legend().width();
                    availableWidth / 2 < legendWidth && (legendWidth = availableWidth / 2), legend.height(availableHeight).key(pie.x()), 
                    legend.width(legendWidth), availableWidth -= legend.width(), wrap.select(".nv-legendWrap").datum(data).call(legend).attr("transform", "translate(" + availableWidth + ",0)");
                } else "bottom" === legendPosition && (legend.width(availableWidth).key(pie.x()), 
                wrap.select(".nv-legendWrap").datum(data).call(legend), margin.bottom = legend.height(), 
                availableHeight = nv.utils.availableHeight(height, container, margin), wrap.select(".nv-legendWrap").attr("transform", "translate(0," + availableHeight + ")")); else g.select(".nv-legendWrap").selectAll("*").remove();
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), pie.width(availableWidth).height(availableHeight);
                var pieWrap = g.select(".nv-pieWrap").datum([ data ]);
                d3.transition(pieWrap).call(pie), legend.dispatch.on("stateChange", function(newState) {
                    for (var key in newState) state[key] = newState[key];
                    dispatch.stateChange(state), chart.update();
                }), dispatch.on("changeState", function(e) {
                    "undefined" != typeof e.disabled && (data.forEach(function(series, i) {
                        series.disabled = e.disabled[i];
                    }), state.disabled = e.disabled), chart.update();
                });
            }), renderWatch.renderEnd("pieChart immediate"), chart;
        }
        var pie = nv.models.pie(), legend = nv.models.legend(), tooltip = nv.models.tooltip(), margin = {
            top: 30,
            right: 20,
            bottom: 20,
            left: 20
        }, marginTop = null, width = null, height = null, showTooltipPercent = !1, showLegend = !0, legendPosition = "top", color = nv.utils.defaultColor(), state = nv.utils.state(), defaultState = null, noData = null, duration = 250, dispatch = d3.dispatch("stateChange", "changeState", "renderEnd");
        tooltip.duration(0).headerEnabled(!1).valueFormatter(function(d, i) {
            return pie.valueFormat()(d, i);
        });
        var renderWatch = nv.utils.renderWatch(dispatch), stateGetter = function(data) {
            return function() {
                return {
                    active: data.map(function(d) {
                        return !d.disabled;
                    })
                };
            };
        }, stateSetter = function(data) {
            return function(state) {
                void 0 !== state.active && data.forEach(function(series, i) {
                    series.disabled = !state.active[i];
                });
            };
        };
        return pie.dispatch.on("elementMouseover.tooltip", function(evt) {
            evt.series = {
                key: chart.x()(evt.data),
                value: chart.y()(evt.data),
                color: evt.color,
                percent: evt.percent
            }, showTooltipPercent || (delete evt.percent, delete evt.series.percent), tooltip.data(evt).hidden(!1);
        }), pie.dispatch.on("elementMouseout.tooltip", function(evt) {
            tooltip.hidden(!0);
        }), pie.dispatch.on("elementMousemove.tooltip", function(evt) {
            tooltip();
        }), chart.legend = legend, chart.dispatch = dispatch, chart.pie = pie, chart.tooltip = tooltip, 
        chart.options = nv.utils.optionsFunc.bind(chart), chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            showTooltipPercent: {
                get: function() {
                    return showTooltipPercent;
                },
                set: function(_) {
                    showTooltipPercent = _;
                }
            },
            showLegend: {
                get: function() {
                    return showLegend;
                },
                set: function(_) {
                    showLegend = _;
                }
            },
            legendPosition: {
                get: function() {
                    return legendPosition;
                },
                set: function(_) {
                    legendPosition = _;
                }
            },
            defaultState: {
                get: function() {
                    return defaultState;
                },
                set: function(_) {
                    defaultState = _;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = _, legend.color(color), pie.color(color);
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration), pie.duration(duration);
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    void 0 !== _.top && (margin.top = _.top, marginTop = _.top), margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            }
        }), nv.utils.inheritOptions(chart, pie), nv.utils.initOptions(chart), chart;
    }, nv.models.sankey = function() {
        "use strict";
        function computeNodeLinks() {
            nodes.forEach(function(node) {
                node.sourceLinks = [], node.targetLinks = [];
            }), links.forEach(function(link) {
                var source = link.source, target = link.target;
                "number" == typeof source && (source = link.source = nodes[link.source]), "number" == typeof target && (target = link.target = nodes[link.target]), 
                source.sourceLinks.push(link), target.targetLinks.push(link);
            });
        }
        function computeNodeValues() {
            nodes.forEach(function(node) {
                node.value = Math.max(d3.sum(node.sourceLinks, value), d3.sum(node.targetLinks, value));
            });
        }
        function computeNodeBreadths() {
            for (var nextNodes, remainingNodes = nodes, x = 0; remainingNodes.length && x < nodes.length; ) nextNodes = [], 
            remainingNodes.forEach(function(node) {
                node.x = x, node.dx = nodeWidth, node.sourceLinks.forEach(function(link) {
                    nextNodes.indexOf(link.target) < 0 && nextNodes.push(link.target);
                });
            }), remainingNodes = nextNodes, ++x;
            sinksRight && moveSinksRight(x), scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
        }
        function moveSinksRight(x) {
            nodes.forEach(function(node) {
                node.sourceLinks.length || (node.x = x - 1);
            });
        }
        function scaleNodeBreadths(kx) {
            nodes.forEach(function(node) {
                node.x *= kx;
            });
        }
        function computeNodeDepths(iterations) {
            function initializeNodeDepth() {
                var ky = d3.min(nodesByBreadth, function(nodes) {
                    return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
                });
                nodesByBreadth.forEach(function(nodes) {
                    nodes.forEach(function(node, i) {
                        node.y = i, node.dy = node.value * ky;
                    });
                }), links.forEach(function(link) {
                    link.dy = link.value * ky;
                });
            }
            function relaxLeftToRight(alpha) {
                function weightedSource(link) {
                    return (link.source.y + link.sy + link.dy / 2) * link.value;
                }
                nodesByBreadth.forEach(function(nodes, breadth) {
                    nodes.forEach(function(node) {
                        if (node.targetLinks.length) {
                            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
                            node.y += (y - center(node)) * alpha;
                        }
                    });
                });
            }
            function relaxRightToLeft(alpha) {
                function weightedTarget(link) {
                    return (link.target.y + link.ty + link.dy / 2) * link.value;
                }
                nodesByBreadth.slice().reverse().forEach(function(nodes) {
                    nodes.forEach(function(node) {
                        if (node.sourceLinks.length) {
                            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
                            node.y += (y - center(node)) * alpha;
                        }
                    });
                });
            }
            function resolveCollisions() {
                nodesByBreadth.forEach(function(nodes) {
                    var node, dy, i, y0 = 0, n = nodes.length;
                    for (nodes.sort(ascendingDepth), i = 0; i < n; ++i) node = nodes[i], dy = y0 - node.y, 
                    dy > 0 && (node.y += dy), y0 = node.y + node.dy + nodePadding;
                    if (dy = y0 - nodePadding - size[1], dy > 0) for (y0 = node.y -= dy, i = n - 2; i >= 0; --i) node = nodes[i], 
                    dy = node.y + node.dy + nodePadding - y0, dy > 0 && (node.y -= dy), y0 = node.y;
                });
            }
            function ascendingDepth(a, b) {
                return a.y - b.y;
            }
            var nodesByBreadth = d3.nest().key(function(d) {
                return d.x;
            }).sortKeys(d3.ascending).entries(nodes).map(function(d) {
                return d.values;
            });
            initializeNodeDepth(), resolveCollisions(), computeLinkDepths();
            for (var alpha = 1; iterations > 0; --iterations) relaxRightToLeft(alpha *= .99), 
            resolveCollisions(), computeLinkDepths(), relaxLeftToRight(alpha), resolveCollisions(), 
            computeLinkDepths();
        }
        function computeLinkDepths() {
            function ascendingSourceDepth(a, b) {
                return a.source.y - b.source.y;
            }
            function ascendingTargetDepth(a, b) {
                return a.target.y - b.target.y;
            }
            nodes.forEach(function(node) {
                node.sourceLinks.sort(ascendingTargetDepth), node.targetLinks.sort(ascendingSourceDepth);
            }), nodes.forEach(function(node) {
                var sy = 0, ty = 0;
                node.sourceLinks.forEach(function(link) {
                    link.sy = sy, sy += link.dy;
                }), node.targetLinks.forEach(function(link) {
                    link.ty = ty, ty += link.dy;
                });
            });
        }
        function value(x) {
            return x.value;
        }
        var sankey = {}, nodeWidth = 24, nodePadding = 8, size = [ 1, 1 ], nodes = [], links = [], sinksRight = !0, layout = function(iterations) {
            computeNodeLinks(), computeNodeValues(), computeNodeBreadths(), computeNodeDepths(iterations);
        }, relayout = function() {
            computeLinkDepths();
        }, link = function() {
            function link(d) {
                var x0 = d.source.x + d.source.dx, x1 = d.target.x, xi = d3.interpolateNumber(x0, x1), x2 = xi(curvature), x3 = xi(1 - curvature), y0 = d.source.y + d.sy + d.dy / 2, y1 = d.target.y + d.ty + d.dy / 2, linkPath = "M" + x0 + "," + y0 + "C" + x2 + "," + y0 + " " + x3 + "," + y1 + " " + x1 + "," + y1;
                return linkPath;
            }
            var curvature = .5;
            return link.curvature = function(_) {
                return arguments.length ? (curvature = +_, link) : curvature;
            }, link;
        }, center = function(node) {
            return node.y + node.dy / 2;
        };
        return sankey.options = nv.utils.optionsFunc.bind(sankey), sankey._options = Object.create({}, {
            nodeWidth: {
                get: function() {
                    return nodeWidth;
                },
                set: function(_) {
                    nodeWidth = +_;
                }
            },
            nodePadding: {
                get: function() {
                    return nodePadding;
                },
                set: function(_) {
                    nodePadding = _;
                }
            },
            nodes: {
                get: function() {
                    return nodes;
                },
                set: function(_) {
                    nodes = _;
                }
            },
            links: {
                get: function() {
                    return links;
                },
                set: function(_) {
                    links = _;
                }
            },
            size: {
                get: function() {
                    return size;
                },
                set: function(_) {
                    size = _;
                }
            },
            sinksRight: {
                get: function() {
                    return sinksRight;
                },
                set: function(_) {
                    sinksRight = _;
                }
            },
            layout: {
                get: function() {
                    layout(32);
                },
                set: function(_) {
                    layout(_);
                }
            },
            relayout: {
                get: function() {
                    relayout();
                },
                set: function(_) {}
            },
            center: {
                get: function() {
                    return center();
                },
                set: function(_) {
                    "function" == typeof _ && (center = _);
                }
            },
            link: {
                get: function() {
                    return link();
                },
                set: function(_) {
                    return "function" == typeof _ && (link = _), link();
                }
            }
        }), nv.utils.initOptions(sankey), sankey;
    }, nv.models.sankeyChart = function() {
        "use strict";
        function chart(selection) {
            return selection.each(function(data) {
                function dragmove(d) {
                    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")"), 
                    sankey.relayout(), link.attr("d", path);
                }
                var testData = {
                    nodes: [ {
                        node: 1,
                        name: "Test 1"
                    }, {
                        node: 2,
                        name: "Test 2"
                    }, {
                        node: 3,
                        name: "Test 3"
                    }, {
                        node: 4,
                        name: "Test 4"
                    }, {
                        node: 5,
                        name: "Test 5"
                    }, {
                        node: 6,
                        name: "Test 6"
                    } ],
                    links: [ {
                        source: 0,
                        target: 1,
                        value: 2295
                    }, {
                        source: 0,
                        target: 5,
                        value: 1199
                    }, {
                        source: 1,
                        target: 2,
                        value: 1119
                    }, {
                        source: 1,
                        target: 5,
                        value: 1176
                    }, {
                        source: 2,
                        target: 3,
                        value: 487
                    }, {
                        source: 2,
                        target: 5,
                        value: 632
                    }, {
                        source: 3,
                        target: 4,
                        value: 301
                    }, {
                        source: 3,
                        target: 5,
                        value: 186
                    } ]
                }, isDataValid = !1, dataAvailable = !1;
                if (("object" == typeof data.nodes && data.nodes.length) >= 0 && ("object" == typeof data.links && data.links.length) >= 0 && (isDataValid = !0), 
                data.nodes && data.nodes.length > 0 && data.links && data.links.length > 0 && (dataAvailable = !0), 
                !isDataValid) return console.error("NVD3 Sankey chart error:", "invalid data format for", data), 
                console.info("Valid data format is: ", testData, JSON.stringify(testData)), showError(selection, "Error loading chart, data is invalid"), 
                !1;
                if (!dataAvailable) return showError(selection, "No data available"), !1;
                var svg = selection.append("svg").attr("width", width).attr("height", height).append("g").attr("class", "nvd3 nv-wrap nv-sankeyChart");
                sankey.nodeWidth(nodeWidth).nodePadding(nodePadding).size([ width, height ]);
                var path = sankey.link();
                sankey.nodes(data.nodes).links(data.links).layout(32).center(center);
                var link = svg.append("g").selectAll(".link").data(data.links).enter().append("path").attr("class", "link").attr("d", path).style("stroke-width", function(d) {
                    return Math.max(1, d.dy);
                }).sort(function(a, b) {
                    return b.dy - a.dy;
                });
                link.append("title").text(linkTitle);
                var node = svg.append("g").selectAll(".node").data(data.nodes).enter().append("g").attr("class", "node").attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                }).call(d3.behavior.drag().origin(function(d) {
                    return d;
                }).on("dragstart", function() {
                    this.parentNode.appendChild(this);
                }).on("drag", dragmove));
                node.append("rect").attr("height", function(d) {
                    return d.dy;
                }).attr("width", sankey.nodeWidth()).style("fill", nodeFillColor).style("stroke", nodeStrokeColor).append("title").text(nodeTitle), 
                node.append("text").attr("x", -6).attr("y", function(d) {
                    return d.dy / 2;
                }).attr("dy", ".35em").attr("text-anchor", "end").attr("transform", null).text(function(d) {
                    return d.name;
                }).filter(function(d) {
                    return d.x < width / 2;
                }).attr("x", 6 + sankey.nodeWidth()).attr("text-anchor", "start");
            }), chart;
        }
        var margin = {
            top: 5,
            right: 0,
            bottom: 5,
            left: 0
        }, sankey = nv.models.sankey(), width = 600, height = 400, nodeWidth = 36, nodePadding = 40, units = "units", center = void 0, formatNumber = d3.format(",.0f"), format = function(d) {
            return formatNumber(d) + " " + units;
        }, color = d3.scale.category20(), linkTitle = function(d) {
            return d.source.name + " → " + d.target.name + "\n" + format(d.value);
        }, nodeFillColor = function(d) {
            return d.color = color(d.name.replace(/ .*/, ""));
        }, nodeStrokeColor = function(d) {
            return d3.rgb(d.color).darker(2);
        }, nodeTitle = function(d) {
            return d.name + "\n" + format(d.value);
        }, showError = function(element, message) {
            element.append("text").attr("x", 0).attr("y", 0).attr("class", "nvd3-sankey-chart-error").attr("text-anchor", "middle").text(message);
        };
        return chart.options = nv.utils.optionsFunc.bind(chart), chart._options = Object.create({}, {
            units: {
                get: function() {
                    return units;
                },
                set: function(_) {
                    units = _;
                }
            },
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            format: {
                get: function() {
                    return format;
                },
                set: function(_) {
                    format = _;
                }
            },
            linkTitle: {
                get: function() {
                    return linkTitle;
                },
                set: function(_) {
                    linkTitle = _;
                }
            },
            nodeWidth: {
                get: function() {
                    return nodeWidth;
                },
                set: function(_) {
                    nodeWidth = _;
                }
            },
            nodePadding: {
                get: function() {
                    return nodePadding;
                },
                set: function(_) {
                    nodePadding = _;
                }
            },
            center: {
                get: function() {
                    return center;
                },
                set: function(_) {
                    center = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            nodeStyle: {
                get: function() {
                    return {};
                },
                set: function(_) {
                    nodeFillColor = void 0 !== _.fillColor ? _.fillColor : nodeFillColor, nodeStrokeColor = void 0 !== _.strokeColor ? _.strokeColor : nodeStrokeColor, 
                    nodeTitle = void 0 !== _.title ? _.title : nodeTitle;
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.scatter = function() {
        "use strict";
        function getCache(d) {
            var key, val;
            return key = d[0].series + ":" + d[1], val = _cache[key] = _cache[key] || {};
        }
        function delCache(d) {
            var key;
            key = d[0].series + ":" + d[1], delete _cache[key];
        }
        function getDiffs(d) {
            var i, key, val, cache = getCache(d), diffs = !1;
            for (i = 1; i < arguments.length; i += 2) key = arguments[i], val = arguments[i + 1](d[0], d[1]), 
            cache[key] === val && cache.hasOwnProperty(key) || (cache[key] = val, diffs = !0);
            return diffs;
        }
        function chart(selection) {
            return renderWatch.reset(), selection.each(function(data) {
                function updateInteractiveLayer() {
                    if (needsUpdate = !1, !interactive) return !1;
                    if (container.selectAll(".nv-point.hover").classed("hover", !1), wrap.select(".nv-point-paths").selectAll("path").remove(), 
                    useVoronoi === !0) {
                        var vertices = d3.merge(data.map(function(group, groupIndex) {
                            return group.values.map(function(point, pointIndex) {
                                var pX = getX(point, pointIndex), pY = getY(point, pointIndex);
                                return [ nv.utils.NaNtoZero(x(pX)) + 1e-4 * Math.random(), nv.utils.NaNtoZero(y(pY)) + 1e-4 * Math.random(), groupIndex, pointIndex, point ];
                            }).filter(function(pointArray, pointIndex) {
                                return pointActive(pointArray[4], pointIndex);
                            });
                        }));
                        if (0 == vertices.length) return !1;
                        vertices.length < 3 && (vertices.push([ x.range()[0] - 20, y.range()[0] - 20, null, null ]), 
                        vertices.push([ x.range()[1] + 20, y.range()[1] + 20, null, null ]), vertices.push([ x.range()[0] - 20, y.range()[0] + 20, null, null ]), 
                        vertices.push([ x.range()[1] + 20, y.range()[1] - 20, null, null ]));
                        var bounds = d3.geom.polygon([ [ -10, -10 ], [ -10, height + 10 ], [ width + 10, height + 10 ], [ width + 10, -10 ] ]), epsilon = 1e-4;
                        vertices = vertices.sort(function(a, b) {
                            return a[0] - b[0] || a[1] - b[1];
                        });
                        for (var i = 0; i < vertices.length - 1; ) Math.abs(vertices[i][0] - vertices[i + 1][0]) < epsilon && Math.abs(vertices[i][1] - vertices[i + 1][1]) < epsilon ? vertices.splice(i + 1, 1) : i++;
                        var voronoi = d3.geom.voronoi(vertices).map(function(d, i) {
                            return 0 === d.length ? null : {
                                data: bounds.clip(d),
                                series: vertices[i][2],
                                point: vertices[i][3]
                            };
                        }), pointPaths = wrap.select(".nv-point-paths").selectAll("path").data(voronoi), vPointPaths = pointPaths.enter().append("svg:path").attr("d", function(d) {
                            return d && d.data && 0 !== d.data.length ? "M" + d.data.join(",") + "Z" : "M 0 0";
                        }).attr("id", function(d, i) {
                            return "nv-path-" + i;
                        }).attr("clip-path", function(d, i) {
                            return "url(#nv-clip-" + id + "-" + i + ")";
                        });
                        if (showVoronoi && vPointPaths.style("fill", d3.rgb(230, 230, 230)).style("fill-opacity", .4).style("stroke-opacity", 1).style("stroke", d3.rgb(200, 200, 200)), 
                        clipVoronoi) {
                            wrap.select(".nv-point-clips").selectAll("*").remove();
                            var pointClips = wrap.select(".nv-point-clips").selectAll("clipPath").data(vertices);
                            pointClips.enter().append("svg:clipPath").attr("id", function(d, i) {
                                return "nv-clip-" + id + "-" + i;
                            }).append("svg:circle").attr("cx", function(d) {
                                return d[0];
                            }).attr("cy", function(d) {
                                return d[1];
                            }).attr("r", clipRadius);
                        }
                        var mouseEventCallback = function(el, d, mDispatch) {
                            if (needsUpdate) return 0;
                            var series = data[d.series];
                            if (void 0 !== series) {
                                var point = series.values[d.point];
                                point.color = color(series, d.series), point.x = getX(point), point.y = getY(point);
                                var box = container.node().getBoundingClientRect(), scrollTop = window.pageYOffset || document.documentElement.scrollTop, scrollLeft = window.pageXOffset || document.documentElement.scrollLeft, pos = {
                                    left: x(getX(point, d.point)) + box.left + scrollLeft + margin.left + 10,
                                    top: y(getY(point, d.point)) + box.top + scrollTop + margin.top + 10
                                };
                                mDispatch({
                                    point: point,
                                    series: series,
                                    pos: pos,
                                    relativePos: [ x(getX(point, d.point)) + margin.left, y(getY(point, d.point)) + margin.top ],
                                    seriesIndex: d.series,
                                    pointIndex: d.point,
                                    event: d3.event,
                                    element: el
                                });
                            }
                        };
                        pointPaths.on("click", function(d) {
                            mouseEventCallback(this, d, dispatch.elementClick);
                        }).on("dblclick", function(d) {
                            mouseEventCallback(this, d, dispatch.elementDblClick);
                        }).on("mouseover", function(d) {
                            mouseEventCallback(this, d, dispatch.elementMouseover);
                        }).on("mouseout", function(d, i) {
                            mouseEventCallback(this, d, dispatch.elementMouseout);
                        });
                    } else wrap.select(".nv-groups").selectAll(".nv-group").selectAll(".nv-point").on("click", function(d, i) {
                        if (needsUpdate || !data[d[0].series]) return 0;
                        var series = data[d[0].series], point = series.values[i], element = this;
                        dispatch.elementClick({
                            point: point,
                            series: series,
                            pos: [ x(getX(point, i)) + margin.left, y(getY(point, i)) + margin.top ],
                            relativePos: [ x(getX(point, i)) + margin.left, y(getY(point, i)) + margin.top ],
                            seriesIndex: d[0].series,
                            pointIndex: i,
                            event: d3.event,
                            element: element
                        });
                    }).on("dblclick", function(d, i) {
                        if (needsUpdate || !data[d[0].series]) return 0;
                        var series = data[d[0].series], point = series.values[i];
                        dispatch.elementDblClick({
                            point: point,
                            series: series,
                            pos: [ x(getX(point, i)) + margin.left, y(getY(point, i)) + margin.top ],
                            relativePos: [ x(getX(point, i)) + margin.left, y(getY(point, i)) + margin.top ],
                            seriesIndex: d[0].series,
                            pointIndex: i
                        });
                    }).on("mouseover", function(d, i) {
                        if (needsUpdate || !data[d[0].series]) return 0;
                        var series = data[d[0].series], point = series.values[i];
                        dispatch.elementMouseover({
                            point: point,
                            series: series,
                            pos: [ x(getX(point, i)) + margin.left, y(getY(point, i)) + margin.top ],
                            relativePos: [ x(getX(point, i)) + margin.left, y(getY(point, i)) + margin.top ],
                            seriesIndex: d[0].series,
                            pointIndex: i,
                            color: color(d[0], i)
                        });
                    }).on("mouseout", function(d, i) {
                        if (needsUpdate || !data[d[0].series]) return 0;
                        var series = data[d[0].series], point = series.values[i];
                        dispatch.elementMouseout({
                            point: point,
                            series: series,
                            pos: [ x(getX(point, i)) + margin.left, y(getY(point, i)) + margin.top ],
                            relativePos: [ x(getX(point, i)) + margin.left, y(getY(point, i)) + margin.top ],
                            seriesIndex: d[0].series,
                            pointIndex: i,
                            color: color(d[0], i)
                        });
                    });
                }
                container = d3.select(this);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin);
                nv.utils.initSVG(container), data.forEach(function(series, i) {
                    series.values.forEach(function(point) {
                        point.series = i;
                    });
                });
                var logScale = "function" == typeof chart.yScale().base, seriesData = xDomain && yDomain && sizeDomain ? [] : d3.merge(data.map(function(d) {
                    return d.values.map(function(d, i) {
                        return {
                            x: getX(d, i),
                            y: getY(d, i),
                            size: getSize(d, i)
                        };
                    });
                }));
                if (x.domain(xDomain || d3.extent(seriesData.map(function(d) {
                    return d.x;
                }).concat(forceX))), padData && data[0] ? x.range(xRange || [ (availableWidth * padDataOuter + availableWidth) / (2 * data[0].values.length), availableWidth - availableWidth * (1 + padDataOuter) / (2 * data[0].values.length) ]) : x.range(xRange || [ 0, availableWidth ]), 
                logScale) {
                    var min = d3.min(seriesData.map(function(d) {
                        if (0 !== d.y) return d.y;
                    }));
                    y.clamp(!0).domain(yDomain || d3.extent(seriesData.map(function(d) {
                        return 0 !== d.y ? d.y : .1 * min;
                    }).concat(forceY))).range(yRange || [ availableHeight, 0 ]);
                } else y.domain(yDomain || d3.extent(seriesData.map(function(d) {
                    return d.y;
                }).concat(forceY))).range(yRange || [ availableHeight, 0 ]);
                z.domain(sizeDomain || d3.extent(seriesData.map(function(d) {
                    return d.size;
                }).concat(forceSize))).range(sizeRange || _sizeRange_def), singlePoint = x.domain()[0] === x.domain()[1] || y.domain()[0] === y.domain()[1], 
                x.domain()[0] === x.domain()[1] && (x.domain()[0] ? x.domain([ x.domain()[0] - .01 * x.domain()[0], x.domain()[1] + .01 * x.domain()[1] ]) : x.domain([ -1, 1 ])), 
                y.domain()[0] === y.domain()[1] && (y.domain()[0] ? y.domain([ y.domain()[0] - .01 * y.domain()[0], y.domain()[1] + .01 * y.domain()[1] ]) : y.domain([ -1, 1 ])), 
                isNaN(x.domain()[0]) && x.domain([ -1, 1 ]), isNaN(y.domain()[0]) && y.domain([ -1, 1 ]), 
                x0 = x0 || x, y0 = y0 || y, z0 = z0 || z;
                var scaleDiff = x(1) !== x0(1) || y(1) !== y0(1) || z(1) !== z0(1);
                width0 = width0 || width, height0 = height0 || height;
                var sizeDiff = width0 !== width || height0 !== height;
                xDom = xDom || [];
                var domainDiff = xDom[0] !== x.domain()[0] || xDom[1] !== x.domain()[1];
                xDom = x.domain(), yDom = yDom || [], domainDiff = domainDiff || yDom[0] !== y.domain()[0] || yDom[1] !== y.domain()[1], 
                yDom = y.domain();
                var wrap = container.selectAll("g.nv-wrap.nv-scatter").data([ data ]), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-scatter nv-chart-" + id), defsEnter = wrapEnter.append("defs"), gEnter = wrapEnter.append("g"), g = wrap.select("g");
                wrap.classed("nv-single-point", singlePoint), gEnter.append("g").attr("class", "nv-groups"), 
                gEnter.append("g").attr("class", "nv-point-paths"), wrapEnter.append("g").attr("class", "nv-point-clips"), 
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), defsEnter.append("clipPath").attr("id", "nv-edge-clip-" + id).append("rect").attr("transform", "translate( -10, -10)"), 
                wrap.select("#nv-edge-clip-" + id + " rect").attr("width", availableWidth + 20).attr("height", availableHeight > 0 ? availableHeight + 20 : 0), 
                g.attr("clip-path", clipEdge ? "url(#nv-edge-clip-" + id + ")" : ""), needsUpdate = !0;
                var groups = wrap.select(".nv-groups").selectAll(".nv-group").data(function(d) {
                    return d;
                }, function(d) {
                    return d.key;
                });
                groups.enter().append("g").style("stroke-opacity", 1e-6).style("fill-opacity", 1e-6), 
                groups.exit().remove(), groups.attr("class", function(d, i) {
                    return (d.classed || "") + " nv-group nv-series-" + i;
                }).classed("nv-noninteractive", !interactive).classed("hover", function(d) {
                    return d.hover;
                }), groups.watchTransition(renderWatch, "scatter: groups").style("fill", function(d, i) {
                    return color(d, i);
                }).style("stroke", function(d, i) {
                    return d.pointBorderColor || pointBorderColor || color(d, i);
                }).style("stroke-opacity", 1).style("fill-opacity", .5);
                var points = groups.selectAll("path.nv-point").data(function(d) {
                    return d.values.map(function(point, pointIndex) {
                        return [ point, pointIndex ];
                    }).filter(function(pointArray, pointIndex) {
                        return pointActive(pointArray[0], pointIndex);
                    });
                });
                if (points.enter().append("path").attr("class", function(d) {
                    return "nv-point nv-point-" + d[1];
                }).style("fill", function(d) {
                    return d.color;
                }).style("stroke", function(d) {
                    return d.color;
                }).attr("transform", function(d) {
                    return "translate(" + nv.utils.NaNtoZero(x0(getX(d[0], d[1]))) + "," + nv.utils.NaNtoZero(y0(getY(d[0], d[1]))) + ")";
                }).attr("d", nv.utils.symbol().type(function(d) {
                    return getShape(d[0]);
                }).size(function(d) {
                    return z(getSize(d[0], d[1]));
                })), points.exit().each(delCache).remove(), groups.exit().selectAll("path.nv-point").watchTransition(renderWatch, "scatter exit").attr("transform", function(d) {
                    return "translate(" + nv.utils.NaNtoZero(x(getX(d[0], d[1]))) + "," + nv.utils.NaNtoZero(y(getY(d[0], d[1]))) + ")";
                }).remove(), points.filter(function(d) {
                    return getDiffs(d, "x", getX, "y", getY) || scaleDiff || sizeDiff || domainDiff;
                }).watchTransition(renderWatch, "scatter points").attr("transform", function(d) {
                    return "translate(" + nv.utils.NaNtoZero(x(getX(d[0], d[1]))) + "," + nv.utils.NaNtoZero(y(getY(d[0], d[1]))) + ")";
                }), points.filter(function(d) {
                    return getDiffs(d, "shape", getShape, "size", getSize) || scaleDiff || sizeDiff || domainDiff;
                }).watchTransition(renderWatch, "scatter points").attr("d", nv.utils.symbol().type(function(d) {
                    return getShape(d[0]);
                }).size(function(d) {
                    return z(getSize(d[0], d[1]));
                })), showLabels) {
                    var titles = groups.selectAll(".nv-label").data(function(d) {
                        return d.values.map(function(point, pointIndex) {
                            return [ point, pointIndex ];
                        }).filter(function(pointArray, pointIndex) {
                            return pointActive(pointArray[0], pointIndex);
                        });
                    });
                    titles.enter().append("text").style("fill", function(d, i) {
                        return d.color;
                    }).style("stroke-opacity", 0).style("fill-opacity", 1).attr("transform", function(d) {
                        var dx = nv.utils.NaNtoZero(x0(getX(d[0], d[1]))) + Math.sqrt(z(getSize(d[0], d[1])) / Math.PI) + 2;
                        return "translate(" + dx + "," + nv.utils.NaNtoZero(y0(getY(d[0], d[1]))) + ")";
                    }).text(function(d, i) {
                        return d[0].label;
                    }), titles.exit().remove(), groups.exit().selectAll("path.nv-label").watchTransition(renderWatch, "scatter exit").attr("transform", function(d) {
                        var dx = nv.utils.NaNtoZero(x(getX(d[0], d[1]))) + Math.sqrt(z(getSize(d[0], d[1])) / Math.PI) + 2;
                        return "translate(" + dx + "," + nv.utils.NaNtoZero(y(getY(d[0], d[1]))) + ")";
                    }).remove(), titles.each(function(d) {
                        d3.select(this).classed("nv-label", !0).classed("nv-label-" + d[1], !1).classed("hover", !1);
                    }), titles.watchTransition(renderWatch, "scatter labels").text(function(d, i) {
                        return d[0].label;
                    }).attr("transform", function(d) {
                        var dx = nv.utils.NaNtoZero(x(getX(d[0], d[1]))) + Math.sqrt(z(getSize(d[0], d[1])) / Math.PI) + 2;
                        return "translate(" + dx + "," + nv.utils.NaNtoZero(y(getY(d[0], d[1]))) + ")";
                    });
                }
                interactiveUpdateDelay ? (clearTimeout(timeoutID), timeoutID = setTimeout(updateInteractiveLayer, interactiveUpdateDelay)) : updateInteractiveLayer(), 
                x0 = x.copy(), y0 = y.copy(), z0 = z.copy(), width0 = width, height0 = height;
            }), renderWatch.renderEnd("scatter immediate"), chart;
        }
        var x0, y0, z0, xDom, yDom, width0, height0, timeoutID, margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, width = null, height = null, color = nv.utils.defaultColor(), pointBorderColor = null, id = Math.floor(1e5 * Math.random()), container = null, x = d3.scale.linear(), y = d3.scale.linear(), z = d3.scale.linear(), getX = function(d) {
            return d.x;
        }, getY = function(d) {
            return d.y;
        }, getSize = function(d) {
            return d.size || 1;
        }, getShape = function(d) {
            return d.shape || "circle";
        }, forceX = [], forceY = [], forceSize = [], interactive = !0, pointActive = function(d) {
            return !d.notActive;
        }, padData = !1, padDataOuter = .1, clipEdge = !1, clipVoronoi = !0, showVoronoi = !1, clipRadius = function() {
            return 25;
        }, xDomain = null, yDomain = null, xRange = null, yRange = null, sizeDomain = null, sizeRange = null, singlePoint = !1, dispatch = d3.dispatch("elementClick", "elementDblClick", "elementMouseover", "elementMouseout", "renderEnd"), useVoronoi = !0, duration = 250, interactiveUpdateDelay = 300, showLabels = !1, needsUpdate = !1, renderWatch = nv.utils.renderWatch(dispatch, duration), _sizeRange_def = [ 16, 256 ], _cache = {};
        return chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._calls = new function() {
            this.clearHighlights = function() {
                return nv.dom.write(function() {
                    container.selectAll(".nv-point.hover").classed("hover", !1);
                }), null;
            }, this.highlightPoint = function(seriesIndex, pointIndex, isHoverOver) {
                nv.dom.write(function() {
                    container.select(".nv-groups").selectAll(".nv-series-" + seriesIndex).selectAll(".nv-point-" + pointIndex).classed("hover", isHoverOver);
                });
            };
        }(), dispatch.on("elementMouseover.point", function(d) {
            interactive && chart._calls.highlightPoint(d.seriesIndex, d.pointIndex, !0);
        }), dispatch.on("elementMouseout.point", function(d) {
            interactive && chart._calls.highlightPoint(d.seriesIndex, d.pointIndex, !1);
        }), chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            xScale: {
                get: function() {
                    return x;
                },
                set: function(_) {
                    x = _;
                }
            },
            yScale: {
                get: function() {
                    return y;
                },
                set: function(_) {
                    y = _;
                }
            },
            pointScale: {
                get: function() {
                    return z;
                },
                set: function(_) {
                    z = _;
                }
            },
            xDomain: {
                get: function() {
                    return xDomain;
                },
                set: function(_) {
                    xDomain = _;
                }
            },
            yDomain: {
                get: function() {
                    return yDomain;
                },
                set: function(_) {
                    yDomain = _;
                }
            },
            pointDomain: {
                get: function() {
                    return sizeDomain;
                },
                set: function(_) {
                    sizeDomain = _;
                }
            },
            xRange: {
                get: function() {
                    return xRange;
                },
                set: function(_) {
                    xRange = _;
                }
            },
            yRange: {
                get: function() {
                    return yRange;
                },
                set: function(_) {
                    yRange = _;
                }
            },
            pointRange: {
                get: function() {
                    return sizeRange;
                },
                set: function(_) {
                    sizeRange = _;
                }
            },
            forceX: {
                get: function() {
                    return forceX;
                },
                set: function(_) {
                    forceX = _;
                }
            },
            forceY: {
                get: function() {
                    return forceY;
                },
                set: function(_) {
                    forceY = _;
                }
            },
            forcePoint: {
                get: function() {
                    return forceSize;
                },
                set: function(_) {
                    forceSize = _;
                }
            },
            interactive: {
                get: function() {
                    return interactive;
                },
                set: function(_) {
                    interactive = _;
                }
            },
            pointActive: {
                get: function() {
                    return pointActive;
                },
                set: function(_) {
                    pointActive = _;
                }
            },
            padDataOuter: {
                get: function() {
                    return padDataOuter;
                },
                set: function(_) {
                    padDataOuter = _;
                }
            },
            padData: {
                get: function() {
                    return padData;
                },
                set: function(_) {
                    padData = _;
                }
            },
            clipEdge: {
                get: function() {
                    return clipEdge;
                },
                set: function(_) {
                    clipEdge = _;
                }
            },
            clipVoronoi: {
                get: function() {
                    return clipVoronoi;
                },
                set: function(_) {
                    clipVoronoi = _;
                }
            },
            clipRadius: {
                get: function() {
                    return clipRadius;
                },
                set: function(_) {
                    clipRadius = _;
                }
            },
            showVoronoi: {
                get: function() {
                    return showVoronoi;
                },
                set: function(_) {
                    showVoronoi = _;
                }
            },
            id: {
                get: function() {
                    return id;
                },
                set: function(_) {
                    id = _;
                }
            },
            interactiveUpdateDelay: {
                get: function() {
                    return interactiveUpdateDelay;
                },
                set: function(_) {
                    interactiveUpdateDelay = _;
                }
            },
            showLabels: {
                get: function() {
                    return showLabels;
                },
                set: function(_) {
                    showLabels = _;
                }
            },
            pointBorderColor: {
                get: function() {
                    return pointBorderColor;
                },
                set: function(_) {
                    pointBorderColor = _;
                }
            },
            x: {
                get: function() {
                    return getX;
                },
                set: function(_) {
                    getX = d3.functor(_);
                }
            },
            y: {
                get: function() {
                    return getY;
                },
                set: function(_) {
                    getY = d3.functor(_);
                }
            },
            pointSize: {
                get: function() {
                    return getSize;
                },
                set: function(_) {
                    getSize = d3.functor(_);
                }
            },
            pointShape: {
                get: function() {
                    return getShape;
                },
                set: function(_) {
                    getShape = d3.functor(_);
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration);
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            },
            useVoronoi: {
                get: function() {
                    return useVoronoi;
                },
                set: function(_) {
                    useVoronoi = _, useVoronoi === !1 && (clipVoronoi = !1);
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.scatterChart = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), renderWatch.models(scatter), showXAxis && renderWatch.models(xAxis), 
            showYAxis && renderWatch.models(yAxis), showDistX && renderWatch.models(distX), 
            showDistY && renderWatch.models(distY), selection.each(function(data) {
                container = d3.select(this), nv.utils.initSVG(container);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin);
                if (chart.update = function() {
                    0 === duration ? container.call(chart) : container.transition().duration(duration).call(chart);
                }, chart.container = this, state.setter(stateSetter(data), chart.update).getter(stateGetter(data)).update(), 
                state.disabled = data.map(function(d) {
                    return !!d.disabled;
                }), !defaultState) {
                    var key;
                    defaultState = {};
                    for (key in state) state[key] instanceof Array ? defaultState[key] = state[key].slice(0) : defaultState[key] = state[key];
                }
                if (!(data && data.length && data.filter(function(d) {
                    return d.values.length;
                }).length)) return nv.utils.noData(chart, container), renderWatch.renderEnd("scatter immediate"), 
                chart;
                container.selectAll(".nv-noData").remove(), x = scatter.xScale(), y = scatter.yScale();
                var wrap = container.selectAll("g.nv-wrap.nv-scatterChart").data([ data ]), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-scatterChart nv-chart-" + scatter.id()), gEnter = wrapEnter.append("g"), g = wrap.select("g");
                if (gEnter.append("rect").attr("class", "nvd3 nv-background").style("pointer-events", "none"), 
                gEnter.append("g").attr("class", "nv-x nv-axis"), gEnter.append("g").attr("class", "nv-y nv-axis"), 
                gEnter.append("g").attr("class", "nv-scatterWrap"), gEnter.append("g").attr("class", "nv-regressionLinesWrap"), 
                gEnter.append("g").attr("class", "nv-distWrap"), gEnter.append("g").attr("class", "nv-legendWrap"), 
                rightAlignYAxis && g.select(".nv-y.nv-axis").attr("transform", "translate(" + availableWidth + ",0)"), 
                showLegend) {
                    var legendWidth = availableWidth;
                    legend.width(legendWidth), wrap.select(".nv-legendWrap").datum(data).call(legend), 
                    marginTop || legend.height() === margin.top || (margin.top = legend.height(), availableHeight = nv.utils.availableHeight(height, container, margin)), 
                    wrap.select(".nv-legendWrap").attr("transform", "translate(0," + -margin.top + ")");
                } else g.select(".nv-legendWrap").selectAll("*").remove();
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), scatter.width(availableWidth).height(availableHeight).color(data.map(function(d, i) {
                    return d.color = d.color || color(d, i), d.color;
                }).filter(function(d, i) {
                    return !data[i].disabled;
                })).showLabels(showLabels), wrap.select(".nv-scatterWrap").datum(data.filter(function(d) {
                    return !d.disabled;
                })).call(scatter), wrap.select(".nv-regressionLinesWrap").attr("clip-path", "url(#nv-edge-clip-" + scatter.id() + ")");
                var regWrap = wrap.select(".nv-regressionLinesWrap").selectAll(".nv-regLines").data(function(d) {
                    return d;
                });
                regWrap.enter().append("g").attr("class", "nv-regLines");
                var regLine = regWrap.selectAll(".nv-regLine").data(function(d) {
                    return [ d ];
                });
                regLine.enter().append("line").attr("class", "nv-regLine").style("stroke-opacity", 0), 
                regLine.filter(function(d) {
                    return d.intercept && d.slope;
                }).watchTransition(renderWatch, "scatterPlusLineChart: regline").attr("x1", x.range()[0]).attr("x2", x.range()[1]).attr("y1", function(d, i) {
                    return y(x.domain()[0] * d.slope + d.intercept);
                }).attr("y2", function(d, i) {
                    return y(x.domain()[1] * d.slope + d.intercept);
                }).style("stroke", function(d, i, j) {
                    return color(d, j);
                }).style("stroke-opacity", function(d, i) {
                    return d.disabled || "undefined" == typeof d.slope || "undefined" == typeof d.intercept ? 0 : 1;
                }), showXAxis && (xAxis.scale(x)._ticks(nv.utils.calcTicksX(availableWidth / 100, data)).tickSize(-availableHeight, 0), 
                g.select(".nv-x.nv-axis").attr("transform", "translate(0," + y.range()[0] + ")").call(xAxis)), 
                showYAxis && (yAxis.scale(y)._ticks(nv.utils.calcTicksY(availableHeight / 36, data)).tickSize(-availableWidth, 0), 
                g.select(".nv-y.nv-axis").call(yAxis)), distX.getData(scatter.x()).scale(x).width(availableWidth).color(data.map(function(d, i) {
                    return d.color || color(d, i);
                }).filter(function(d, i) {
                    return !data[i].disabled;
                })), gEnter.select(".nv-distWrap").append("g").attr("class", "nv-distributionX"), 
                g.select(".nv-distributionX").attr("transform", "translate(0," + y.range()[0] + ")").datum(data.filter(function(d) {
                    return !d.disabled;
                })).call(distX).style("opacity", function() {
                    return showDistX ? "1" : "1e-6";
                }).watchTransition(renderWatch, "scatterPlusLineChart").style("opacity", function() {
                    return showDistX ? "1" : "1e-6";
                }), distY.getData(scatter.y()).scale(y).width(availableHeight).color(data.map(function(d, i) {
                    return d.color || color(d, i);
                }).filter(function(d, i) {
                    return !data[i].disabled;
                })), gEnter.select(".nv-distWrap").append("g").attr("class", "nv-distributionY"), 
                g.select(".nv-distributionY").attr("transform", "translate(" + (rightAlignYAxis ? availableWidth : -distY.size()) + ",0)").datum(data.filter(function(d) {
                    return !d.disabled;
                })).call(distY).style("opacity", function() {
                    return showDistY ? "1" : "1e-6";
                }).watchTransition(renderWatch, "scatterPlusLineChart").style("opacity", function() {
                    return showDistY ? "1" : "1e-6";
                }), legend.dispatch.on("stateChange", function(newState) {
                    for (var key in newState) state[key] = newState[key];
                    dispatch.stateChange(state), chart.update();
                }), dispatch.on("changeState", function(e) {
                    "undefined" != typeof e.disabled && (data.forEach(function(series, i) {
                        series.disabled = e.disabled[i];
                    }), state.disabled = e.disabled), chart.update();
                }), scatter.dispatch.on("elementMouseout.tooltip", function(evt) {
                    tooltip.hidden(!0), container.select(".nv-chart-" + scatter.id() + " .nv-series-" + evt.seriesIndex + " .nv-distx-" + evt.pointIndex).attr("y1", 0), 
                    container.select(".nv-chart-" + scatter.id() + " .nv-series-" + evt.seriesIndex + " .nv-disty-" + evt.pointIndex).attr("x2", distY.size());
                }), scatter.dispatch.on("elementMouseover.tooltip", function(evt) {
                    container.select(".nv-series-" + evt.seriesIndex + " .nv-distx-" + evt.pointIndex).attr("y1", evt.relativePos[1] - availableHeight), 
                    container.select(".nv-series-" + evt.seriesIndex + " .nv-disty-" + evt.pointIndex).attr("x2", evt.relativePos[0] + distX.size()), 
                    tooltip.data(evt).hidden(!1);
                }), x0 = x.copy(), y0 = y.copy();
            }), renderWatch.renderEnd("scatter with line immediate"), chart;
        }
        var scatter = nv.models.scatter(), xAxis = nv.models.axis(), yAxis = nv.models.axis(), legend = nv.models.legend(), distX = nv.models.distribution(), distY = nv.models.distribution(), tooltip = nv.models.tooltip(), margin = {
            top: 30,
            right: 20,
            bottom: 50,
            left: 75
        }, marginTop = null, width = null, height = null, container = null, color = nv.utils.defaultColor(), x = scatter.xScale(), y = scatter.yScale(), showDistX = !1, showDistY = !1, showLegend = !0, showXAxis = !0, showYAxis = !0, rightAlignYAxis = !1, state = nv.utils.state(), defaultState = null, dispatch = d3.dispatch("stateChange", "changeState", "renderEnd"), noData = null, duration = 250, showLabels = !1;
        scatter.xScale(x).yScale(y), xAxis.orient("bottom").tickPadding(10), yAxis.orient(rightAlignYAxis ? "right" : "left").tickPadding(10), 
        distX.axis("x"), distY.axis("y"), tooltip.headerFormatter(function(d, i) {
            return xAxis.tickFormat()(d, i);
        }).valueFormatter(function(d, i) {
            return yAxis.tickFormat()(d, i);
        });
        var x0, y0, renderWatch = nv.utils.renderWatch(dispatch, duration), stateGetter = function(data) {
            return function() {
                return {
                    active: data.map(function(d) {
                        return !d.disabled;
                    })
                };
            };
        }, stateSetter = function(data) {
            return function(state) {
                void 0 !== state.active && data.forEach(function(series, i) {
                    series.disabled = !state.active[i];
                });
            };
        };
        return chart.dispatch = dispatch, chart.scatter = scatter, chart.legend = legend, 
        chart.xAxis = xAxis, chart.yAxis = yAxis, chart.distX = distX, chart.distY = distY, 
        chart.tooltip = tooltip, chart.options = nv.utils.optionsFunc.bind(chart), chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            container: {
                get: function() {
                    return container;
                },
                set: function(_) {
                    container = _;
                }
            },
            showDistX: {
                get: function() {
                    return showDistX;
                },
                set: function(_) {
                    showDistX = _;
                }
            },
            showDistY: {
                get: function() {
                    return showDistY;
                },
                set: function(_) {
                    showDistY = _;
                }
            },
            showLegend: {
                get: function() {
                    return showLegend;
                },
                set: function(_) {
                    showLegend = _;
                }
            },
            showXAxis: {
                get: function() {
                    return showXAxis;
                },
                set: function(_) {
                    showXAxis = _;
                }
            },
            showYAxis: {
                get: function() {
                    return showYAxis;
                },
                set: function(_) {
                    showYAxis = _;
                }
            },
            defaultState: {
                get: function() {
                    return defaultState;
                },
                set: function(_) {
                    defaultState = _;
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _;
                }
            },
            showLabels: {
                get: function() {
                    return showLabels;
                },
                set: function(_) {
                    showLabels = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    void 0 !== _.top && (margin.top = _.top, marginTop = _.top), margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            rightAlignYAxis: {
                get: function() {
                    return rightAlignYAxis;
                },
                set: function(_) {
                    rightAlignYAxis = _, yAxis.orient(_ ? "right" : "left");
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_), legend.color(color), distX.color(color), distY.color(color);
                }
            }
        }), nv.utils.inheritOptions(chart, scatter), nv.utils.initOptions(chart), chart;
    }, nv.models.sparkline = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), selection.each(function(data) {
                var availableWidth = width - margin.left - margin.right, availableHeight = height - margin.top - margin.bottom;
                container = d3.select(this), nv.utils.initSVG(container), x.domain(xDomain || d3.extent(data, getX)).range(xRange || [ 0, availableWidth ]), 
                y.domain(yDomain || d3.extent(data, getY)).range(yRange || [ availableHeight, 0 ]);
                var wrap = container.selectAll("g.nv-wrap.nv-sparkline").data([ data ]), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-sparkline");
                wrapEnter.append("g"), wrap.select("g");
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var paths = wrap.selectAll("path").data(function(d) {
                    return [ d ];
                });
                paths.enter().append("path"), paths.exit().remove(), paths.style("stroke", function(d, i) {
                    return d.color || color(d, i);
                }).attr("d", d3.svg.line().x(function(d, i) {
                    return x(getX(d, i));
                }).y(function(d, i) {
                    return y(getY(d, i));
                }));
                var points = wrap.selectAll("circle.nv-point").data(function(data) {
                    function pointIndex(index) {
                        if (index != -1) {
                            var result = data[index];
                            return result.pointIndex = index, result;
                        }
                        return null;
                    }
                    var yValues = data.map(function(d, i) {
                        return getY(d, i);
                    }), maxPoint = pointIndex(yValues.lastIndexOf(y.domain()[1])), minPoint = pointIndex(yValues.indexOf(y.domain()[0])), currentPoint = pointIndex(yValues.length - 1);
                    return [ showMinMaxPoints ? minPoint : null, showMinMaxPoints ? maxPoint : null, showCurrentPoint ? currentPoint : null ].filter(function(d) {
                        return null != d;
                    });
                });
                points.enter().append("circle"), points.exit().remove(), points.attr("cx", function(d, i) {
                    return x(getX(d, d.pointIndex));
                }).attr("cy", function(d, i) {
                    return y(getY(d, d.pointIndex));
                }).attr("r", 2).attr("class", function(d, i) {
                    return getX(d, d.pointIndex) == x.domain()[1] ? "nv-point nv-currentValue" : getY(d, d.pointIndex) == y.domain()[0] ? "nv-point nv-minValue" : "nv-point nv-maxValue";
                });
            }), renderWatch.renderEnd("sparkline immediate"), chart;
        }
        var xDomain, yDomain, xRange, yRange, margin = {
            top: 2,
            right: 0,
            bottom: 2,
            left: 0
        }, width = 400, height = 32, container = null, animate = !0, x = d3.scale.linear(), y = d3.scale.linear(), getX = function(d) {
            return d.x;
        }, getY = function(d) {
            return d.y;
        }, color = nv.utils.getColor([ "#000" ]), showMinMaxPoints = !0, showCurrentPoint = !0, dispatch = d3.dispatch("renderEnd"), renderWatch = nv.utils.renderWatch(dispatch);
        return chart.options = nv.utils.optionsFunc.bind(chart), chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            xDomain: {
                get: function() {
                    return xDomain;
                },
                set: function(_) {
                    xDomain = _;
                }
            },
            yDomain: {
                get: function() {
                    return yDomain;
                },
                set: function(_) {
                    yDomain = _;
                }
            },
            xRange: {
                get: function() {
                    return xRange;
                },
                set: function(_) {
                    xRange = _;
                }
            },
            yRange: {
                get: function() {
                    return yRange;
                },
                set: function(_) {
                    yRange = _;
                }
            },
            xScale: {
                get: function() {
                    return x;
                },
                set: function(_) {
                    x = _;
                }
            },
            yScale: {
                get: function() {
                    return y;
                },
                set: function(_) {
                    y = _;
                }
            },
            animate: {
                get: function() {
                    return animate;
                },
                set: function(_) {
                    animate = _;
                }
            },
            showMinMaxPoints: {
                get: function() {
                    return showMinMaxPoints;
                },
                set: function(_) {
                    showMinMaxPoints = _;
                }
            },
            showCurrentPoint: {
                get: function() {
                    return showCurrentPoint;
                },
                set: function(_) {
                    showCurrentPoint = _;
                }
            },
            x: {
                get: function() {
                    return getX;
                },
                set: function(_) {
                    getX = d3.functor(_);
                }
            },
            y: {
                get: function() {
                    return getY;
                },
                set: function(_) {
                    getY = d3.functor(_);
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            }
        }), chart.dispatch = dispatch, nv.utils.initOptions(chart), chart;
    }, nv.models.sparklinePlus = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), renderWatch.models(sparkline), selection.each(function(data) {
                function updateValueLine() {
                    if (!paused) {
                        var hoverValue = g.selectAll(".nv-hoverValue").data(index), hoverEnter = hoverValue.enter().append("g").attr("class", "nv-hoverValue").style("stroke-opacity", 0).style("fill-opacity", 0);
                        hoverValue.exit().transition().duration(250).style("stroke-opacity", 0).style("fill-opacity", 0).remove(), 
                        hoverValue.attr("transform", function(d) {
                            return "translate(" + x(sparkline.x()(data[d], d)) + ",0)";
                        }).transition().duration(250).style("stroke-opacity", 1).style("fill-opacity", 1), 
                        index.length && (hoverEnter.append("line").attr("x1", 0).attr("y1", -margin.top).attr("x2", 0).attr("y2", availableHeight), 
                        hoverEnter.append("text").attr("class", "nv-xValue").attr("x", -6).attr("y", -margin.top).attr("text-anchor", "end").attr("dy", ".9em"), 
                        g.select(".nv-hoverValue .nv-xValue").text(xTickFormat(sparkline.x()(data[index[0]], index[0]))), 
                        hoverEnter.append("text").attr("class", "nv-yValue").attr("x", 6).attr("y", -margin.top).attr("text-anchor", "start").attr("dy", ".9em"), 
                        g.select(".nv-hoverValue .nv-yValue").text(yTickFormat(sparkline.y()(data[index[0]], index[0]))));
                    }
                }
                function sparklineHover() {
                    function getClosestIndex(data, x) {
                        for (var distance = Math.abs(sparkline.x()(data[0], 0) - x), closestIndex = 0, i = 0; i < data.length; i++) Math.abs(sparkline.x()(data[i], i) - x) < distance && (distance = Math.abs(sparkline.x()(data[i], i) - x), 
                        closestIndex = i);
                        return closestIndex;
                    }
                    if (!paused) {
                        var pos = d3.mouse(this)[0] - margin.left;
                        index = [ getClosestIndex(data, Math.round(x.invert(pos))) ], updateValueLine();
                    }
                }
                var container = d3.select(this);
                nv.utils.initSVG(container);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin);
                if (chart.update = function() {
                    container.call(chart);
                }, chart.container = this, !data || !data.length) return nv.utils.noData(chart, container), 
                chart;
                container.selectAll(".nv-noData").remove();
                var currentValue = sparkline.y()(data[data.length - 1], data.length - 1);
                x = sparkline.xScale(), y = sparkline.yScale();
                var wrap = container.selectAll("g.nv-wrap.nv-sparklineplus").data([ data ]), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-sparklineplus"), gEnter = wrapEnter.append("g"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-sparklineWrap"), gEnter.append("g").attr("class", "nv-valueWrap"), 
                gEnter.append("g").attr("class", "nv-hoverArea"), wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var sparklineWrap = g.select(".nv-sparklineWrap");
                if (sparkline.width(availableWidth).height(availableHeight), sparklineWrap.call(sparkline), 
                showLastValue) {
                    var valueWrap = g.select(".nv-valueWrap"), value = valueWrap.selectAll(".nv-currentValue").data([ currentValue ]);
                    value.enter().append("text").attr("class", "nv-currentValue").attr("dx", rightAlignValue ? -8 : 8).attr("dy", ".9em").style("text-anchor", rightAlignValue ? "end" : "start"), 
                    value.attr("x", availableWidth + (rightAlignValue ? margin.right : 0)).attr("y", alignValue ? function(d) {
                        return y(d);
                    } : 0).style("fill", sparkline.color()(data[data.length - 1], data.length - 1)).text(yTickFormat(currentValue));
                }
                gEnter.select(".nv-hoverArea").append("rect").on("mousemove", sparklineHover).on("click", function() {
                    paused = !paused;
                }).on("mouseout", function() {
                    index = [], updateValueLine();
                }), g.select(".nv-hoverArea rect").attr("transform", function(d) {
                    return "translate(" + -margin.left + "," + -margin.top + ")";
                }).attr("width", availableWidth + margin.left + margin.right).attr("height", availableHeight + margin.top);
            }), renderWatch.renderEnd("sparklinePlus immediate"), chart;
        }
        var x, y, sparkline = nv.models.sparkline(), margin = {
            top: 15,
            right: 100,
            bottom: 10,
            left: 50
        }, width = null, height = null, index = [], paused = !1, xTickFormat = d3.format(",r"), yTickFormat = d3.format(",.2f"), showLastValue = !0, alignValue = !0, rightAlignValue = !1, noData = null, dispatch = d3.dispatch("renderEnd"), renderWatch = nv.utils.renderWatch(dispatch);
        return chart.dispatch = dispatch, chart.sparkline = sparkline, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            xTickFormat: {
                get: function() {
                    return xTickFormat;
                },
                set: function(_) {
                    xTickFormat = _;
                }
            },
            yTickFormat: {
                get: function() {
                    return yTickFormat;
                },
                set: function(_) {
                    yTickFormat = _;
                }
            },
            showLastValue: {
                get: function() {
                    return showLastValue;
                },
                set: function(_) {
                    showLastValue = _;
                }
            },
            alignValue: {
                get: function() {
                    return alignValue;
                },
                set: function(_) {
                    alignValue = _;
                }
            },
            rightAlignValue: {
                get: function() {
                    return rightAlignValue;
                },
                set: function(_) {
                    rightAlignValue = _;
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            }
        }), nv.utils.inheritOptions(chart, sparkline), nv.utils.initOptions(chart), chart;
    }, nv.models.stackedArea = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), renderWatch.models(scatter), selection.each(function(data) {
                var availableWidth = width - margin.left - margin.right, availableHeight = height - margin.top - margin.bottom;
                container = d3.select(this), nv.utils.initSVG(container), x = scatter.xScale(), 
                y = scatter.yScale();
                var dataRaw = data;
                data.forEach(function(aseries, i) {
                    aseries.seriesIndex = i, aseries.values = aseries.values.map(function(d, j) {
                        return d.index = j, d.seriesIndex = i, d;
                    });
                });
                var dataFiltered = data.filter(function(series) {
                    return !series.disabled;
                });
                data = d3.layout.stack().order(order).offset(offset).values(function(d) {
                    return d.values;
                }).x(getX).y(getY).out(function(d, y0, y) {
                    d.display = {
                        y: y,
                        y0: y0
                    };
                })(dataFiltered);
                var wrap = container.selectAll("g.nv-wrap.nv-stackedarea").data([ data ]), wrapEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-stackedarea"), defsEnter = wrapEnter.append("defs"), gEnter = wrapEnter.append("g"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-areaWrap"), gEnter.append("g").attr("class", "nv-scatterWrap"), 
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), 0 == scatter.forceY().length && scatter.forceY().push(0), 
                scatter.width(availableWidth).height(availableHeight).x(getX).y(function(d) {
                    if (void 0 !== d.display) return d.display.y + d.display.y0;
                }).color(data.map(function(d, i) {
                    return d.color = d.color || color(d, d.seriesIndex), d.color;
                }));
                var scatterWrap = g.select(".nv-scatterWrap").datum(data);
                scatterWrap.call(scatter), defsEnter.append("clipPath").attr("id", "nv-edge-clip-" + id).append("rect"), 
                wrap.select("#nv-edge-clip-" + id + " rect").attr("width", availableWidth).attr("height", availableHeight), 
                g.attr("clip-path", clipEdge ? "url(#nv-edge-clip-" + id + ")" : "");
                var area = d3.svg.area().defined(defined).x(function(d, i) {
                    return x(getX(d, i));
                }).y0(function(d) {
                    return y(d.display.y0);
                }).y1(function(d) {
                    return y(d.display.y + d.display.y0);
                }).interpolate(interpolate), zeroArea = d3.svg.area().defined(defined).x(function(d, i) {
                    return x(getX(d, i));
                }).y0(function(d) {
                    return y(d.display.y0);
                }).y1(function(d) {
                    return y(d.display.y0);
                }), path = g.select(".nv-areaWrap").selectAll("path.nv-area").data(function(d) {
                    return d;
                });
                path.enter().append("path").attr("class", function(d, i) {
                    return "nv-area nv-area-" + i;
                }).attr("d", function(d, i) {
                    return zeroArea(d.values, d.seriesIndex);
                }).on("mouseover", function(d, i) {
                    d3.select(this).classed("hover", !0), dispatch.areaMouseover({
                        point: d,
                        series: d.key,
                        pos: [ d3.event.pageX, d3.event.pageY ],
                        seriesIndex: d.seriesIndex
                    });
                }).on("mouseout", function(d, i) {
                    d3.select(this).classed("hover", !1), dispatch.areaMouseout({
                        point: d,
                        series: d.key,
                        pos: [ d3.event.pageX, d3.event.pageY ],
                        seriesIndex: d.seriesIndex
                    });
                }).on("click", function(d, i) {
                    d3.select(this).classed("hover", !1), dispatch.areaClick({
                        point: d,
                        series: d.key,
                        pos: [ d3.event.pageX, d3.event.pageY ],
                        seriesIndex: d.seriesIndex
                    });
                }), path.exit().remove(), path.style("fill", function(d, i) {
                    return d.color || color(d, d.seriesIndex);
                }).style("stroke", function(d, i) {
                    return d.color || color(d, d.seriesIndex);
                }), path.watchTransition(renderWatch, "stackedArea path").attr("d", function(d, i) {
                    return area(d.values, i);
                }), scatter.dispatch.on("elementMouseover.area", function(e) {
                    g.select(".nv-chart-" + id + " .nv-area-" + e.seriesIndex).classed("hover", !0);
                }), scatter.dispatch.on("elementMouseout.area", function(e) {
                    g.select(".nv-chart-" + id + " .nv-area-" + e.seriesIndex).classed("hover", !1);
                }), chart.d3_stackedOffset_stackPercent = function(stackData) {
                    var i, j, o, n = stackData.length, m = stackData[0].length, y0 = [];
                    for (j = 0; j < m; ++j) {
                        for (i = 0, o = 0; i < dataRaw.length; i++) o += getY(dataRaw[i].values[j]);
                        if (o) for (i = 0; i < n; i++) stackData[i][j][1] /= o; else for (i = 0; i < n; i++) stackData[i][j][1] = 0;
                    }
                    for (j = 0; j < m; ++j) y0[j] = 0;
                    return y0;
                };
            }), renderWatch.renderEnd("stackedArea immediate"), chart;
        }
        var x, y, margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, width = 960, height = 500, color = nv.utils.defaultColor(), id = Math.floor(1e5 * Math.random()), container = null, getX = function(d) {
            return d.x;
        }, getY = function(d) {
            return d.y;
        }, defined = function(d, i) {
            return !isNaN(getY(d, i)) && null !== getY(d, i);
        }, style = "stack", offset = "zero", order = "default", interpolate = "linear", clipEdge = !1, scatter = nv.models.scatter(), duration = 250, dispatch = d3.dispatch("areaClick", "areaMouseover", "areaMouseout", "renderEnd", "elementClick", "elementMouseover", "elementMouseout");
        scatter.pointSize(2.2).pointDomain([ 2.2, 2.2 ]);
        var renderWatch = nv.utils.renderWatch(dispatch, duration);
        return chart.dispatch = dispatch, chart.scatter = scatter, scatter.dispatch.on("elementClick", function() {
            dispatch.elementClick.apply(this, arguments);
        }), scatter.dispatch.on("elementMouseover", function() {
            dispatch.elementMouseover.apply(this, arguments);
        }), scatter.dispatch.on("elementMouseout", function() {
            dispatch.elementMouseout.apply(this, arguments);
        }), chart.interpolate = function(_) {
            return arguments.length ? (interpolate = _, chart) : interpolate;
        }, chart.duration = function(_) {
            return arguments.length ? (duration = _, renderWatch.reset(duration), scatter.duration(duration), 
            chart) : duration;
        }, chart.dispatch = dispatch, chart.scatter = scatter, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            defined: {
                get: function() {
                    return defined;
                },
                set: function(_) {
                    defined = _;
                }
            },
            clipEdge: {
                get: function() {
                    return clipEdge;
                },
                set: function(_) {
                    clipEdge = _;
                }
            },
            offset: {
                get: function() {
                    return offset;
                },
                set: function(_) {
                    offset = _;
                }
            },
            order: {
                get: function() {
                    return order;
                },
                set: function(_) {
                    order = _;
                }
            },
            interpolate: {
                get: function() {
                    return interpolate;
                },
                set: function(_) {
                    interpolate = _;
                }
            },
            x: {
                get: function() {
                    return getX;
                },
                set: function(_) {
                    getX = d3.functor(_);
                }
            },
            y: {
                get: function() {
                    return getY;
                },
                set: function(_) {
                    getY = d3.functor(_);
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            },
            style: {
                get: function() {
                    return style;
                },
                set: function(_) {
                    switch (style = _) {
                      case "stack":
                        chart.offset("zero"), chart.order("default");
                        break;

                      case "stream":
                        chart.offset("wiggle"), chart.order("inside-out");
                        break;

                      case "stream-center":
                        chart.offset("silhouette"), chart.order("inside-out");
                        break;

                      case "expand":
                        chart.offset("expand"), chart.order("default");
                        break;

                      case "stack_percent":
                        chart.offset(chart.d3_stackedOffset_stackPercent), chart.order("default");
                    }
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration), scatter.duration(duration);
                }
            }
        }), nv.utils.inheritOptions(chart, scatter), nv.utils.initOptions(chart), chart;
    }, nv.models.stackedAreaChart = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), renderWatch.models(stacked), showXAxis && renderWatch.models(xAxis), 
            showYAxis && renderWatch.models(yAxis), selection.each(function(data) {
                function updateXAxis() {
                    showXAxis && g.select(".nv-focus .nv-x.nv-axis").attr("transform", "translate(0," + availableHeight + ")").transition().duration(duration).call(xAxis);
                }
                function updateYAxis() {
                    if (showYAxis) {
                        if ("expand" === stacked.style() || "stack_percent" === stacked.style()) {
                            var currentFormat = yAxis.tickFormat();
                            oldYTickFormat && currentFormat === percentFormatter || (oldYTickFormat = currentFormat), 
                            yAxis.tickFormat(percentFormatter);
                        } else oldYTickFormat && (yAxis.tickFormat(oldYTickFormat), oldYTickFormat = null);
                        g.select(".nv-focus .nv-y.nv-axis").transition().duration(0).call(yAxis);
                    }
                }
                function onBrush(extent) {
                    var stackedWrap = g.select(".nv-focus .nv-stackedWrap").datum(data.filter(function(d) {
                        return !d.disabled;
                    }).map(function(d, i) {
                        return {
                            key: d.key,
                            area: d.area,
                            classed: d.classed,
                            values: d.values.filter(function(d, i) {
                                return stacked.x()(d, i) >= extent[0] && stacked.x()(d, i) <= extent[1];
                            }),
                            disableTooltip: d.disableTooltip
                        };
                    }));
                    stackedWrap.transition().duration(duration).call(stacked), updateXAxis(), updateYAxis();
                }
                var container = d3.select(this);
                nv.utils.initSVG(container);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin) - (focusEnable ? focus.height() : 0);
                if (chart.update = function() {
                    container.transition().duration(duration).call(chart);
                }, chart.container = this, state.setter(stateSetter(data), chart.update).getter(stateGetter(data)).update(), 
                state.disabled = data.map(function(d) {
                    return !!d.disabled;
                }), !defaultState) {
                    var key;
                    defaultState = {};
                    for (key in state) state[key] instanceof Array ? defaultState[key] = state[key].slice(0) : defaultState[key] = state[key];
                }
                if (!(data && data.length && data.filter(function(d) {
                    return d.values.length;
                }).length)) return nv.utils.noData(chart, container), chart;
                container.selectAll(".nv-noData").remove(), x = stacked.xScale(), y = stacked.yScale();
                var wrap = container.selectAll("g.nv-wrap.nv-stackedAreaChart").data([ data ]), gEnter = wrap.enter().append("g").attr("class", "nvd3 nv-wrap nv-stackedAreaChart").append("g"), g = wrap.select("g");
                gEnter.append("g").attr("class", "nv-legendWrap"), gEnter.append("g").attr("class", "nv-controlsWrap");
                var focusEnter = gEnter.append("g").attr("class", "nv-focus");
                focusEnter.append("g").attr("class", "nv-background").append("rect"), focusEnter.append("g").attr("class", "nv-x nv-axis"), 
                focusEnter.append("g").attr("class", "nv-y nv-axis"), focusEnter.append("g").attr("class", "nv-stackedWrap"), 
                focusEnter.append("g").attr("class", "nv-interactive");
                gEnter.append("g").attr("class", "nv-focusWrap");
                if (showLegend) {
                    var legendWidth = showControls && "top" === legendPosition ? availableWidth - controlWidth : availableWidth;
                    if (legend.width(legendWidth), g.select(".nv-legendWrap").datum(data).call(legend), 
                    "bottom" === legendPosition) {
                        var xAxisHeight = xAxis.height();
                        margin.bottom = Math.max(legend.height() + xAxisHeight, margin.bottom), availableHeight = nv.utils.availableHeight(height, container, margin) - (focusEnable ? focus.height() : 0);
                        var legendTop = availableHeight + xAxisHeight;
                        g.select(".nv-legendWrap").attr("transform", "translate(0," + legendTop + ")");
                    } else "top" === legendPosition && (marginTop || margin.top == legend.height() || (margin.top = legend.height(), 
                    availableHeight = nv.utils.availableHeight(height, container, margin) - (focusEnable ? focus.height() : 0)), 
                    g.select(".nv-legendWrap").attr("transform", "translate(" + (availableWidth - legendWidth) + "," + -margin.top + ")"));
                } else g.select(".nv-legendWrap").selectAll("*").remove();
                if (showControls) {
                    var controlsData = [ {
                        key: controlLabels.stacked || "Stacked",
                        metaKey: "Stacked",
                        disabled: "stack" != stacked.style(),
                        style: "stack"
                    }, {
                        key: controlLabels.stream || "Stream",
                        metaKey: "Stream",
                        disabled: "stream" != stacked.style(),
                        style: "stream"
                    }, {
                        key: controlLabels.stream_center || "Stream Center",
                        metaKey: "Stream_Center",
                        disabled: "stream_center" != stacked.style(),
                        style: "stream-center"
                    }, {
                        key: controlLabels.expanded || "Expanded",
                        metaKey: "Expanded",
                        disabled: "expand" != stacked.style(),
                        style: "expand"
                    }, {
                        key: controlLabels.stack_percent || "Stack %",
                        metaKey: "Stack_Percent",
                        disabled: "stack_percent" != stacked.style(),
                        style: "stack_percent"
                    } ];
                    controlWidth = controlOptions.length / 3 * 260, controlsData = controlsData.filter(function(d) {
                        return controlOptions.indexOf(d.metaKey) !== -1;
                    }), controls.width(controlWidth).color([ "#444", "#444", "#444" ]), g.select(".nv-controlsWrap").datum(controlsData).call(controls);
                    var requiredTop = Math.max(controls.height(), showLegend && "top" === legendPosition ? legend.height() : 0);
                    margin.top != requiredTop && (margin.top = requiredTop, availableHeight = nv.utils.availableHeight(height, container, margin) - (focusEnable ? focus.height() : 0)), 
                    g.select(".nv-controlsWrap").attr("transform", "translate(0," + -margin.top + ")");
                } else g.select(".nv-controlsWrap").selectAll("*").remove();
                wrap.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), rightAlignYAxis && g.select(".nv-y.nv-axis").attr("transform", "translate(" + availableWidth + ",0)"), 
                useInteractiveGuideline && (interactiveLayer.width(availableWidth).height(availableHeight).margin({
                    left: margin.left,
                    top: margin.top
                }).svgContainer(container).xScale(x), wrap.select(".nv-interactive").call(interactiveLayer)), 
                g.select(".nv-focus .nv-background rect").attr("width", availableWidth).attr("height", availableHeight), 
                stacked.width(availableWidth).height(availableHeight).color(data.map(function(d, i) {
                    return d.color || color(d, i);
                }).filter(function(d, i) {
                    return !data[i].disabled;
                }));
                var stackedWrap = g.select(".nv-focus .nv-stackedWrap").datum(data.filter(function(d) {
                    return !d.disabled;
                }));
                if (showXAxis && xAxis.scale(x)._ticks(nv.utils.calcTicksX(availableWidth / 100, data)).tickSize(-availableHeight, 0), 
                showYAxis) {
                    var ticks;
                    ticks = "wiggle" === stacked.offset() ? 0 : nv.utils.calcTicksY(availableHeight / 36, data), 
                    yAxis.scale(y)._ticks(ticks).tickSize(-availableWidth, 0);
                }
                if (focusEnable) {
                    focus.width(availableWidth), g.select(".nv-focusWrap").attr("transform", "translate(0," + (availableHeight + margin.bottom + focus.margin().top) + ")").datum(data.filter(function(d) {
                        return !d.disabled;
                    })).call(focus);
                    var extent = focus.brush.empty() ? focus.xDomain() : focus.brush.extent();
                    null !== extent && onBrush(extent);
                } else stackedWrap.transition().call(stacked), updateXAxis(), updateYAxis();
                stacked.dispatch.on("areaClick.toggle", function(e) {
                    1 === data.filter(function(d) {
                        return !d.disabled;
                    }).length ? data.forEach(function(d) {
                        d.disabled = !1;
                    }) : data.forEach(function(d, i) {
                        d.disabled = i != e.seriesIndex;
                    }), state.disabled = data.map(function(d) {
                        return !!d.disabled;
                    }), dispatch.stateChange(state), chart.update();
                }), legend.dispatch.on("stateChange", function(newState) {
                    for (var key in newState) state[key] = newState[key];
                    dispatch.stateChange(state), chart.update();
                }), controls.dispatch.on("legendClick", function(d, i) {
                    d.disabled && (controlsData = controlsData.map(function(s) {
                        return s.disabled = !0, s;
                    }), d.disabled = !1, stacked.style(d.style), state.style = stacked.style(), dispatch.stateChange(state), 
                    chart.update());
                }), interactiveLayer.dispatch.on("elementMousemove", function(e) {
                    stacked.clearHighlights();
                    var singlePoint, pointIndex, pointXLocation, allData = [], valueSum = 0, allNullValues = !0, atleastOnePoint = !1;
                    if (data.filter(function(series, i) {
                        return series.seriesIndex = i, !series.disabled;
                    }).forEach(function(series, i) {
                        pointIndex = nv.interactiveBisect(series.values, e.pointXValue, chart.x());
                        var point = series.values[pointIndex], pointYValue = chart.y()(point, pointIndex);
                        if (null != pointYValue && pointYValue > 0 && (stacked.highlightPoint(i, pointIndex, !0), 
                        atleastOnePoint = !0), i !== data.length - 1 || atleastOnePoint || stacked.highlightPoint(i, pointIndex, !0), 
                        "undefined" != typeof point) {
                            "undefined" == typeof singlePoint && (singlePoint = point), "undefined" == typeof pointXLocation && (pointXLocation = chart.xScale()(chart.x()(point, pointIndex)));
                            var tooltipValue = "expand" == stacked.style() ? point.display.y : chart.y()(point, pointIndex);
                            allData.push({
                                key: series.key,
                                value: tooltipValue,
                                color: color(series, series.seriesIndex),
                                point: point
                            }), showTotalInTooltip && "expand" != stacked.style() && null != tooltipValue && (valueSum += tooltipValue, 
                            allNullValues = !1);
                        }
                    }), allData.reverse(), allData.length > 2) {
                        var yValue = chart.yScale().invert(e.mouseY), indexToHighlight = null;
                        allData.forEach(function(series, i) {
                            yValue = Math.abs(yValue);
                            var stackedY0 = Math.abs(series.point.display.y0), stackedY = Math.abs(series.point.display.y);
                            if (yValue >= stackedY0 && yValue <= stackedY + stackedY0) return void (indexToHighlight = i);
                        }), null != indexToHighlight && (allData[indexToHighlight].highlight = !0);
                    }
                    showTotalInTooltip && "expand" != stacked.style() && allData.length >= 2 && !allNullValues && allData.push({
                        key: totalLabel,
                        value: valueSum,
                        total: !0
                    });
                    var xValue = chart.x()(singlePoint, pointIndex), valueFormatter = interactiveLayer.tooltip.valueFormatter();
                    "expand" === stacked.style() || "stack_percent" === stacked.style() ? (oldValueFormatter || (oldValueFormatter = valueFormatter), 
                    valueFormatter = d3.format(".1%")) : oldValueFormatter && (valueFormatter = oldValueFormatter, 
                    oldValueFormatter = null), interactiveLayer.tooltip.valueFormatter(valueFormatter).data({
                        value: xValue,
                        series: allData
                    })(), interactiveLayer.renderGuideLine(pointXLocation);
                }), interactiveLayer.dispatch.on("elementMouseout", function(e) {
                    stacked.clearHighlights();
                }), focus.dispatch.on("onBrush", function(extent) {
                    onBrush(extent);
                }), dispatch.on("changeState", function(e) {
                    "undefined" != typeof e.disabled && data.length === e.disabled.length && (data.forEach(function(series, i) {
                        series.disabled = e.disabled[i];
                    }), state.disabled = e.disabled), "undefined" != typeof e.style && (stacked.style(e.style), 
                    style = e.style), chart.update();
                });
            }), renderWatch.renderEnd("stacked Area chart immediate"), chart;
        }
        var x, y, stacked = nv.models.stackedArea(), xAxis = nv.models.axis(), yAxis = nv.models.axis(), legend = nv.models.legend(), controls = nv.models.legend(), interactiveLayer = nv.interactiveGuideline(), tooltip = nv.models.tooltip(), focus = nv.models.focus(nv.models.stackedArea()), margin = {
            top: 10,
            right: 25,
            bottom: 50,
            left: 60
        }, marginTop = null, width = null, height = null, color = nv.utils.defaultColor(), showControls = !0, showLegend = !0, legendPosition = "top", showXAxis = !0, showYAxis = !0, rightAlignYAxis = !1, focusEnable = !1, useInteractiveGuideline = !1, showTotalInTooltip = !0, totalLabel = "TOTAL", state = nv.utils.state(), defaultState = null, noData = null, dispatch = d3.dispatch("stateChange", "changeState", "renderEnd"), controlWidth = 250, controlOptions = [ "Stacked", "Stream", "Expanded" ], controlLabels = {}, duration = 250;
        state.style = stacked.style(), xAxis.orient("bottom").tickPadding(7), yAxis.orient(rightAlignYAxis ? "right" : "left"), 
        tooltip.headerFormatter(function(d, i) {
            return xAxis.tickFormat()(d, i);
        }).valueFormatter(function(d, i) {
            return yAxis.tickFormat()(d, i);
        }), interactiveLayer.tooltip.headerFormatter(function(d, i) {
            return xAxis.tickFormat()(d, i);
        }).valueFormatter(function(d, i) {
            return null == d ? "N/A" : yAxis.tickFormat()(d, i);
        });
        var oldYTickFormat = null, oldValueFormatter = null;
        controls.updateState(!1);
        var renderWatch = nv.utils.renderWatch(dispatch), style = stacked.style(), stateGetter = function(data) {
            return function() {
                return {
                    active: data.map(function(d) {
                        return !d.disabled;
                    }),
                    style: stacked.style()
                };
            };
        }, stateSetter = function(data) {
            return function(state) {
                void 0 !== state.style && (style = state.style), void 0 !== state.active && data.forEach(function(series, i) {
                    series.disabled = !state.active[i];
                });
            };
        }, percentFormatter = d3.format("%");
        return stacked.dispatch.on("elementMouseover.tooltip", function(evt) {
            evt.point.x = stacked.x()(evt.point), evt.point.y = stacked.y()(evt.point), tooltip.data(evt).hidden(!1);
        }), stacked.dispatch.on("elementMouseout.tooltip", function(evt) {
            tooltip.hidden(!0);
        }), chart.dispatch = dispatch, chart.stacked = stacked, chart.legend = legend, chart.controls = controls, 
        chart.xAxis = xAxis, chart.x2Axis = focus.xAxis, chart.yAxis = yAxis, chart.y2Axis = focus.yAxis, 
        chart.interactiveLayer = interactiveLayer, chart.tooltip = tooltip, chart.focus = focus, 
        chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            showLegend: {
                get: function() {
                    return showLegend;
                },
                set: function(_) {
                    showLegend = _;
                }
            },
            legendPosition: {
                get: function() {
                    return legendPosition;
                },
                set: function(_) {
                    legendPosition = _;
                }
            },
            showXAxis: {
                get: function() {
                    return showXAxis;
                },
                set: function(_) {
                    showXAxis = _;
                }
            },
            showYAxis: {
                get: function() {
                    return showYAxis;
                },
                set: function(_) {
                    showYAxis = _;
                }
            },
            defaultState: {
                get: function() {
                    return defaultState;
                },
                set: function(_) {
                    defaultState = _;
                }
            },
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            showControls: {
                get: function() {
                    return showControls;
                },
                set: function(_) {
                    showControls = _;
                }
            },
            controlLabels: {
                get: function() {
                    return controlLabels;
                },
                set: function(_) {
                    controlLabels = _;
                }
            },
            controlOptions: {
                get: function() {
                    return controlOptions;
                },
                set: function(_) {
                    controlOptions = _;
                }
            },
            showTotalInTooltip: {
                get: function() {
                    return showTotalInTooltip;
                },
                set: function(_) {
                    showTotalInTooltip = _;
                }
            },
            totalLabel: {
                get: function() {
                    return totalLabel;
                },
                set: function(_) {
                    totalLabel = _;
                }
            },
            focusEnable: {
                get: function() {
                    return focusEnable;
                },
                set: function(_) {
                    focusEnable = _;
                }
            },
            focusHeight: {
                get: function() {
                    return focus.height();
                },
                set: function(_) {
                    focus.height(_);
                }
            },
            brushExtent: {
                get: function() {
                    return focus.brushExtent();
                },
                set: function(_) {
                    focus.brushExtent(_);
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    void 0 !== _.top && (margin.top = _.top, marginTop = _.top), margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left;
                }
            },
            focusMargin: {
                get: function() {
                    return focus.margin;
                },
                set: function(_) {
                    focus.margin.top = void 0 !== _.top ? _.top : focus.margin.top, focus.margin.right = void 0 !== _.right ? _.right : focus.margin.right, 
                    focus.margin.bottom = void 0 !== _.bottom ? _.bottom : focus.margin.bottom, focus.margin.left = void 0 !== _.left ? _.left : focus.margin.left;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration), stacked.duration(duration), xAxis.duration(duration), 
                    yAxis.duration(duration);
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_), legend.color(color), stacked.color(color), focus.color(color);
                }
            },
            x: {
                get: function() {
                    return stacked.x();
                },
                set: function(_) {
                    stacked.x(_), focus.x(_);
                }
            },
            y: {
                get: function() {
                    return stacked.y();
                },
                set: function(_) {
                    stacked.y(_), focus.y(_);
                }
            },
            rightAlignYAxis: {
                get: function() {
                    return rightAlignYAxis;
                },
                set: function(_) {
                    rightAlignYAxis = _, yAxis.orient(rightAlignYAxis ? "right" : "left");
                }
            },
            useInteractiveGuideline: {
                get: function() {
                    return useInteractiveGuideline;
                },
                set: function(_) {
                    useInteractiveGuideline = !!_, chart.interactive(!_), chart.useVoronoi(!_), stacked.scatter.interactive(!_);
                }
            }
        }), nv.utils.inheritOptions(chart, stacked), nv.utils.initOptions(chart), chart;
    }, nv.models.stackedAreaWithFocusChart = function() {
        return nv.models.stackedAreaChart().margin({
            bottom: 30
        }).focusEnable(!0);
    }, nv.models.sunburst = function() {
        "use strict";
        function rotationToAvoidUpsideDown(d) {
            var centerAngle = computeCenterAngle(d);
            return centerAngle > 90 ? 180 : 0;
        }
        function computeCenterAngle(d) {
            var startAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x))), endAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))), centerAngle = (startAngle + endAngle) / 2 * (180 / Math.PI) - 90;
            return centerAngle;
        }
        function computeNodePercentage(d) {
            var startAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x))), endAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
            return (endAngle - startAngle) / (2 * Math.PI);
        }
        function labelThresholdMatched(d) {
            var startAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x))), endAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))), size = endAngle - startAngle;
            return size > labelThreshold;
        }
        function arcTweenZoom(e, i) {
            var xd = d3.interpolate(x.domain(), [ node.x, node.x + node.dx ]), yd = d3.interpolate(y.domain(), [ node.y, 1 ]), yr = d3.interpolate(y.range(), [ node.y ? 20 : 0, radius ]);
            return 0 === i ? function() {
                return arc(e);
            } : function(t) {
                return x.domain(xd(t)), y.domain(yd(t)).range(yr(t)), arc(e);
            };
        }
        function arcTweenUpdate(d) {
            var ipo = d3.interpolate({
                x: d.x0,
                dx: d.dx0,
                y: d.y0,
                dy: d.dy0
            }, d);
            return function(t) {
                var b = ipo(t);
                return d.x0 = b.x, d.dx0 = b.dx, d.y0 = b.y, d.dy0 = b.dy, arc(b);
            };
        }
        function updatePrevPosition(node) {
            var k = key(node);
            prevPositions[k] || (prevPositions[k] = {});
            var pP = prevPositions[k];
            pP.dx = node.dx, pP.x = node.x, pP.dy = node.dy, pP.y = node.y;
        }
        function storeRetrievePrevPositions(nodes) {
            nodes.forEach(function(n) {
                var k = key(n), pP = prevPositions[k];
                pP ? (n.dx0 = pP.dx, n.x0 = pP.x, n.dy0 = pP.dy, n.y0 = pP.y) : (n.dx0 = n.dx, n.x0 = n.x, 
                n.dy0 = n.dy, n.y0 = n.y), updatePrevPosition(n);
            });
        }
        function zoomClick(d) {
            var labels = container.selectAll("text"), path = container.selectAll("path");
            labels.transition().attr("opacity", 0), node = d, path.transition().duration(duration).attrTween("d", arcTweenZoom).each("end", function(e) {
                if (e.x >= d.x && e.x < d.x + d.dx && e.depth >= d.depth) {
                    var parentNode = d3.select(this.parentNode), arcText = parentNode.select("text");
                    arcText.transition().duration(duration).text(function(e) {
                        return labelFormat(e);
                    }).attr("opacity", function(d) {
                        return labelThresholdMatched(d) ? 1 : 0;
                    }).attr("transform", function() {
                        var width = this.getBBox().width;
                        if (0 === e.depth) return "translate(" + width / 2 * -1 + ",0)";
                        if (e.depth === d.depth) return "translate(" + (y(e.y) + 5) + ",0)";
                        var centerAngle = computeCenterAngle(e), rotation = rotationToAvoidUpsideDown(e);
                        return 0 === rotation ? "rotate(" + centerAngle + ")translate(" + (y(e.y) + 5) + ",0)" : "rotate(" + centerAngle + ")translate(" + (y(e.y) + width + 5) + ",0)rotate(" + rotation + ")";
                    });
                }
            });
        }
        function chart(selection) {
            return renderWatch.reset(), selection.each(function(data) {
                container = d3.select(this), availableWidth = nv.utils.availableWidth(width, container, margin), 
                availableHeight = nv.utils.availableHeight(height, container, margin), radius = Math.min(availableWidth, availableHeight) / 2, 
                y.range([ 0, radius ]);
                var wrap = container.select("g.nvd3.nv-wrap.nv-sunburst");
                wrap[0][0] ? wrap.attr("transform", "translate(" + (availableWidth / 2 + margin.left + margin.right) + "," + (availableHeight / 2 + margin.top + margin.bottom) + ")") : wrap = container.append("g").attr("class", "nvd3 nv-wrap nv-sunburst nv-chart-" + id).attr("transform", "translate(" + (availableWidth / 2 + margin.left + margin.right) + "," + (availableHeight / 2 + margin.top + margin.bottom) + ")"), 
                container.on("click", function(d, i) {
                    dispatch.chartClick({
                        data: d,
                        index: i,
                        pos: d3.event,
                        id: id
                    });
                }), partition.value(modes[mode] || modes.count);
                var nodes = partition.nodes(data[0]).reverse();
                storeRetrievePrevPositions(nodes);
                var cG = wrap.selectAll(".arc-container").data(nodes, key), cGE = cG.enter().append("g").attr("class", "arc-container");
                cGE.append("path").attr("d", arc).style("fill", function(d) {
                    return d.color ? d.color : color(groupColorByParent ? (d.children ? d : d.parent).name : d.name);
                }).style("stroke", "#FFF").on("click", function(d, i) {
                    zoomClick(d), dispatch.elementClick({
                        data: d,
                        index: i
                    });
                }).on("mouseover", function(d, i) {
                    d3.select(this).classed("hover", !0).style("opacity", .8), dispatch.elementMouseover({
                        data: d,
                        color: d3.select(this).style("fill"),
                        percent: computeNodePercentage(d)
                    });
                }).on("mouseout", function(d, i) {
                    d3.select(this).classed("hover", !1).style("opacity", 1), dispatch.elementMouseout({
                        data: d
                    });
                }).on("mousemove", function(d, i) {
                    dispatch.elementMousemove({
                        data: d
                    });
                }), cG.each(function(d) {
                    d3.select(this).select("path").transition().duration(duration).attrTween("d", arcTweenUpdate);
                }), showLabels && (cG.selectAll("text").remove(), cG.append("text").text(function(e) {
                    return labelFormat(e);
                }).transition().duration(duration).attr("opacity", function(d) {
                    return labelThresholdMatched(d) ? 1 : 0;
                }).attr("transform", function(d) {
                    var width = this.getBBox().width;
                    if (0 === d.depth) return "rotate(0)translate(" + width / 2 * -1 + ",0)";
                    var centerAngle = computeCenterAngle(d), rotation = rotationToAvoidUpsideDown(d);
                    return 0 === rotation ? "rotate(" + centerAngle + ")translate(" + (y(d.y) + 5) + ",0)" : "rotate(" + centerAngle + ")translate(" + (y(d.y) + width + 5) + ",0)rotate(" + rotation + ")";
                })), zoomClick(nodes[nodes.length - 1]), cG.exit().transition().duration(duration).attr("opacity", 0).each("end", function(d) {
                    var k = key(d);
                    prevPositions[k] = void 0;
                }).remove();
            }), renderWatch.renderEnd("sunburst immediate"), chart;
        }
        var node, availableWidth, availableHeight, radius, margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, width = 600, height = 600, mode = "count", modes = {
            count: function(d) {
                return 1;
            },
            value: function(d) {
                return d.value || d.size;
            },
            size: function(d) {
                return d.value || d.size;
            }
        }, id = Math.floor(1e4 * Math.random()), container = null, color = nv.utils.defaultColor(), showLabels = !1, labelFormat = function(d) {
            return "count" === mode ? d.name + " #" + d.value : d.name + " " + (d.value || d.size);
        }, labelThreshold = .02, sort = function(d1, d2) {
            return d1.name > d2.name;
        }, key = function(d, i) {
            return void 0 !== d.parent ? d.name + "-" + d.parent.name + "-" + i : d.name;
        }, groupColorByParent = !0, duration = 500, dispatch = d3.dispatch("chartClick", "elementClick", "elementDblClick", "elementMousemove", "elementMouseover", "elementMouseout", "renderEnd"), x = d3.scale.linear().range([ 0, 2 * Math.PI ]), y = d3.scale.sqrt(), partition = d3.layout.partition().sort(sort), prevPositions = {}, arc = d3.svg.arc().startAngle(function(d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
        }).endAngle(function(d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
        }).innerRadius(function(d) {
            return Math.max(0, y(d.y));
        }).outerRadius(function(d) {
            return Math.max(0, y(d.y + d.dy));
        }), renderWatch = nv.utils.renderWatch(dispatch);
        return chart.dispatch = dispatch, chart.options = nv.utils.optionsFunc.bind(chart), 
        chart._options = Object.create({}, {
            width: {
                get: function() {
                    return width;
                },
                set: function(_) {
                    width = _;
                }
            },
            height: {
                get: function() {
                    return height;
                },
                set: function(_) {
                    height = _;
                }
            },
            mode: {
                get: function() {
                    return mode;
                },
                set: function(_) {
                    mode = _;
                }
            },
            id: {
                get: function() {
                    return id;
                },
                set: function(_) {
                    id = _;
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _;
                }
            },
            groupColorByParent: {
                get: function() {
                    return groupColorByParent;
                },
                set: function(_) {
                    groupColorByParent = !!_;
                }
            },
            showLabels: {
                get: function() {
                    return showLabels;
                },
                set: function(_) {
                    showLabels = !!_;
                }
            },
            labelFormat: {
                get: function() {
                    return labelFormat;
                },
                set: function(_) {
                    labelFormat = _;
                }
            },
            labelThreshold: {
                get: function() {
                    return labelThreshold;
                },
                set: function(_) {
                    labelThreshold = _;
                }
            },
            sort: {
                get: function() {
                    return sort;
                },
                set: function(_) {
                    sort = _;
                }
            },
            key: {
                get: function() {
                    return key;
                },
                set: function(_) {
                    key = _;
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 != _.top ? _.top : margin.top, margin.right = void 0 != _.right ? _.right : margin.right, 
                    margin.bottom = void 0 != _.bottom ? _.bottom : margin.bottom, margin.left = void 0 != _.left ? _.left : margin.left;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = nv.utils.getColor(_);
                }
            }
        }), nv.utils.initOptions(chart), chart;
    }, nv.models.sunburstChart = function() {
        "use strict";
        function chart(selection) {
            return renderWatch.reset(), renderWatch.models(sunburst), selection.each(function(data) {
                var container = d3.select(this);
                nv.utils.initSVG(container);
                var availableWidth = nv.utils.availableWidth(width, container, margin), availableHeight = nv.utils.availableHeight(height, container, margin);
                return chart.update = function() {
                    0 === duration ? container.call(chart) : container.transition().duration(duration).call(chart);
                }, chart.container = container, data && data.length ? (container.selectAll(".nv-noData").remove(), 
                sunburst.width(availableWidth).height(availableHeight).margin(margin), void container.call(sunburst)) : (nv.utils.noData(chart, container), 
                chart);
            }), renderWatch.renderEnd("sunburstChart immediate"), chart;
        }
        var sunburst = nv.models.sunburst(), tooltip = nv.models.tooltip(), margin = {
            top: 30,
            right: 20,
            bottom: 20,
            left: 20
        }, width = null, height = null, color = nv.utils.defaultColor(), showTooltipPercent = !1, defaultState = (Math.round(1e5 * Math.random()), 
        null), noData = null, duration = 250, dispatch = d3.dispatch("stateChange", "changeState", "renderEnd"), renderWatch = nv.utils.renderWatch(dispatch);
        return tooltip.duration(0).headerEnabled(!1).valueFormatter(function(d) {
            return d;
        }), sunburst.dispatch.on("elementMouseover.tooltip", function(evt) {
            evt.series = {
                key: evt.data.name,
                value: evt.data.value || evt.data.size,
                color: evt.color,
                percent: evt.percent
            }, showTooltipPercent || (delete evt.percent, delete evt.series.percent), tooltip.data(evt).hidden(!1);
        }), sunburst.dispatch.on("elementMouseout.tooltip", function(evt) {
            tooltip.hidden(!0);
        }), sunburst.dispatch.on("elementMousemove.tooltip", function(evt) {
            tooltip();
        }), chart.dispatch = dispatch, chart.sunburst = sunburst, chart.tooltip = tooltip, 
        chart.options = nv.utils.optionsFunc.bind(chart), chart._options = Object.create({}, {
            noData: {
                get: function() {
                    return noData;
                },
                set: function(_) {
                    noData = _;
                }
            },
            defaultState: {
                get: function() {
                    return defaultState;
                },
                set: function(_) {
                    defaultState = _;
                }
            },
            showTooltipPercent: {
                get: function() {
                    return showTooltipPercent;
                },
                set: function(_) {
                    showTooltipPercent = _;
                }
            },
            color: {
                get: function() {
                    return color;
                },
                set: function(_) {
                    color = _, sunburst.color(color);
                }
            },
            duration: {
                get: function() {
                    return duration;
                },
                set: function(_) {
                    duration = _, renderWatch.reset(duration), sunburst.duration(duration);
                }
            },
            margin: {
                get: function() {
                    return margin;
                },
                set: function(_) {
                    margin.top = void 0 !== _.top ? _.top : margin.top, margin.right = void 0 !== _.right ? _.right : margin.right, 
                    margin.bottom = void 0 !== _.bottom ? _.bottom : margin.bottom, margin.left = void 0 !== _.left ? _.left : margin.left, 
                    sunburst.margin(margin);
                }
            }
        }), nv.utils.inheritOptions(chart, sunburst), nv.utils.initOptions(chart), chart;
    }, nv.version = "1.8.6-dev";
}();