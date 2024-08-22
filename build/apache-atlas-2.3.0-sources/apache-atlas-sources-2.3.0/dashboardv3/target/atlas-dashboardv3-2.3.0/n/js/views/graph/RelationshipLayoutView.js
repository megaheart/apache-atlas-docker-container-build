define([ "require", "backbone", "hbs!tmpl/graph/RelationshipLayoutView_tmpl", "collection/VLineageList", "models/VEntity", "utils/Utils", "utils/CommonViewFunction", "d3", "d3-tip", "utils/Enums", "utils/UrlLinks", "platform" ], function(require, Backbone, RelationshipLayoutViewtmpl, VLineageList, VEntity, Utils, CommonViewFunction, d3, d3Tip, Enums, UrlLinks, platform) {
    "use strict";
    var RelationshipLayoutView = Backbone.Marionette.LayoutView.extend({
        _viewName: "RelationshipLayoutView",
        template: RelationshipLayoutViewtmpl,
        className: "resizeGraph",
        regions: {},
        ui: {
            relationshipDetailClose: '[data-id="close"]',
            searchNode: '[data-id="searchNode"]',
            relationshipViewToggle: 'input[name="relationshipViewToggle"]',
            relationshipDetailTable: "[data-id='relationshipDetailTable']",
            relationshipSVG: "[data-id='relationshipSVG']",
            relationshipDetailValue: "[data-id='relationshipDetailValue']",
            zoomControl: "[data-id='zoomControl']",
            boxClose: '[data-id="box-close"]',
            noValueToggle: "[data-id='noValueToggle']",
            relationshipDetails: ".relationship-details",
            noData: ".no-data"
        },
        events: function() {
            var events = {};
            return events["click " + this.ui.relationshipDetailClose] = function() {
                this.toggleInformationSlider({
                    close: !0
                });
            }, events["keyup " + this.ui.searchNode] = "searchNode", events["click " + this.ui.boxClose] = "toggleBoxPanel", 
            events["change " + this.ui.relationshipViewToggle] = function(e) {
                this.relationshipViewToggle(e.currentTarget.checked);
            }, events["click " + this.ui.noValueToggle] = function(e) {
                Utils.togglePropertyRelationshipTableEmptyValues({
                    inputType: this.ui.noValueToggle,
                    tableEl: this.ui.relationshipDetailValue
                });
            }, events;
        },
        initialize: function(options) {
            _.extend(this, _.pick(options, "entity", "entityName", "guid", "actionCallBack", "attributeDefs")), 
            this.graphData = this.createData(this.entity);
        },
        createData: function(entity) {
            var that = this, links = [], nodes = {};
            return entity && entity.relationshipAttributes && _.each(entity.relationshipAttributes, function(obj, key) {
                _.isEmpty(obj) || links.push({
                    source: nodes[that.entity.typeName] || (nodes[that.entity.typeName] = _.extend({
                        name: that.entity.typeName
                    }, {
                        value: entity
                    })),
                    target: nodes[key] || (nodes[key] = _.extend({
                        name: key
                    }, {
                        value: obj
                    })),
                    value: obj
                });
            }), {
                nodes: nodes,
                links: links
            };
        },
        onRender: function() {
            this.ui.zoomControl.hide(), this.$el.addClass("auto-height");
        },
        onShow: function(argument) {
            this.graphData && _.isEmpty(this.graphData.links) ? this.noRelationship() : this.createGraph(this.graphData), 
            this.createTable();
        },
        noRelationship: function() {
            this.ui.relationshipDetails.hide(), this.ui.noData.show();
        },
        toggleInformationSlider: function(options) {
            options.open && !this.$(".relationship-details").hasClass("open") ? this.$(".relationship-details").addClass("open") : options.close && this.$(".relationship-details").hasClass("open") && (d3.selectAll("circle").attr("stroke", "none"), 
            this.$(".relationship-details").removeClass("open"));
        },
        toggleBoxPanel: function(options) {
            var el = options && options.el;
            options && options.nodeDetailToggler, options.currentTarget;
            this.$el.find(".show-box-panel").removeClass("show-box-panel"), el && el.addClass && el.addClass("show-box-panel"), 
            this.$("circle.node-detail-highlight").removeClass("node-detail-highlight");
        },
        searchNode: function(e) {
            var $el = $(e.currentTarget);
            this.updateRelationshipDetails(_.extend({}, $el.data(), {
                searchString: $el.val()
            }));
        },
        updateRelationshipDetails: function(options) {
            var data = options.obj.value, typeName = data.typeName || options.obj.name, searchString = _.escape(options.searchString), listString = "", getEntityTypelist = function(options) {
                var activeEntityColor = "#4a90e2", deletedEntityColor = "#BB5838", entityTypeHtml = "<pre>", getdefault = function(obj) {
                    var options = obj.options, status = Enums.entityStateReadOnly[options.entityStatus || options.status] ? " deleted-relation" : "", guid = options.guid, entityColor = obj.color, name = obj.name, typeName = options.typeName;
                    return "AtlasGlossaryTerm" === typeName ? "<li class=" + status + '><a style="color:' + entityColor + '" href="#!/glossary/' + guid + "?guid=" + guid + '&gType=term&viewType=term&fromView=entity">' + name + " (" + typeName + ")</a></li>" : "<li class=" + status + "><a style='color:" + entityColor + "' href=#!/detailPage/" + guid + "?tabActive=relationship>" + name + " (" + typeName + ")</a></li>";
                }, getWithButton = function(obj) {
                    var options = obj.options, status = Enums.entityStateReadOnly[options.entityStatus || options.status] ? " deleted-relation" : "", entityColor = (options.guid, 
                    obj.color), name = obj.name, relationship = (options.typeName, obj.relationship || !1), icon = (obj.entity || !1, 
                    '<i class="fa fa-trash"></i>'), title = "Deleted";
                    return relationship && (icon = '<i class="fa fa-long-arrow-right"></i>', status = Enums.entityStateReadOnly[options.relationshipStatus || options.status] ? "deleted-relation" : "", 
                    title = "Relationship Deleted"), "<li class=" + status + "><a style='color:" + entityColor + "' href=#!/detailPage/" + options.guid + "?tabActive=relationship>" + _.escape(name) + " (" + options.typeName + ')</a><button type="button" title="' + title + '" class="btn btn-sm deleteBtn deletedTableBtn btn-action ">' + icon + "</button></li>";
                }, name = options.entityName ? options.entityName : Utils.getName(options, "displayText");
                return "ACTIVE" == options.entityStatus ? "ACTIVE" == options.relationshipStatus ? entityTypeHtml = getdefault({
                    color: activeEntityColor,
                    options: options,
                    name: name
                }) : "DELETED" == options.relationshipStatus && (entityTypeHtml = getWithButton({
                    color: activeEntityColor,
                    options: options,
                    name: name,
                    relationship: !0
                })) : entityTypeHtml = "DELETED" == options.entityStatus ? getWithButton({
                    color: deletedEntityColor,
                    options: options,
                    name: name,
                    entity: !0
                }) : getdefault({
                    color: activeEntityColor,
                    options: options,
                    name: name
                }), entityTypeHtml + "</pre>";
            };
            this.ui.searchNode.hide(), this.$("[data-id='typeName']").text(typeName);
            var getElement = function(options) {
                var entityTypeButton = (options.entityName ? options.entityName : Utils.getName(options, "displayText"), 
                getEntityTypelist(options));
                return entityTypeButton;
            };
            _.isArray(data) ? (data.length > 1 && this.ui.searchNode.show(), _.each(_.sortBy(data, "displayText"), function(val) {
                var name = Utils.getName(val, "displayText"), valObj = _.extend({}, val, {
                    entityName: name
                });
                if (searchString) {
                    if (name.search(new RegExp(searchString, "i")) == -1) return;
                    listString += getElement(valObj);
                } else listString += getElement(valObj);
            })) : listString += getElement(data), this.$("[data-id='entityList']").html(listString);
        },
        createGraph: function(data) {
            function update() {
                path = container.append("svg:g").selectAll("path").data(links).enter().append("svg:path").attr("class", "relatioship-link").attr("stroke", function(d) {
                    return getPathColor({
                        data: d,
                        type: "path"
                    });
                }).attr("marker-end", function(d) {
                    return "url(#" + (isAllEntityRelationDeleted({
                        data: d
                    }) ? "deletedLink" : "activeLink") + ")";
                }), node = container.selectAll(".node").data(nodes).enter().append("g").attr("class", "node").on("mousedown", function() {
                    console.log(d3.event), d3.event.preventDefault();
                }).on("click", function(d) {
                    if (!d3.event.defaultPrevented) {
                        if (d && d.value && d.value.guid == that.guid) return void that.ui.boxClose.trigger("click");
                        that.toggleBoxPanel({
                            el: that.$(".relationship-node-details")
                        }), that.ui.searchNode.data({
                            obj: d
                        }), $(this).find("circle").addClass("node-detail-highlight"), that.updateRelationshipDetails({
                            obj: d
                        });
                    }
                }).call(d3.drag().on("start", dragstarted).on("drag", dragged));
                var circleContainer = node.append("g");
                circleContainer.append("circle").attr("cx", 0).attr("cy", 0).attr("r", function(d) {
                    return d.radius = 25, d.radius;
                }).attr("fill", function(d) {
                    return d && d.value && d.value.guid == that.guid ? isAllEntityRelationDeleted({
                        data: d,
                        type: "node"
                    }) ? deletedEntityColor : selectedNodeColor : isAllEntityRelationDeleted({
                        data: d,
                        type: "node"
                    }) ? deletedEntityColor : activeEntityColor;
                }).attr("typename", function(d) {
                    return d.name;
                }), circleContainer.append("text").attr("x", 0).attr("y", 0).attr("dy", 8).attr("text-anchor", "middle").style("font-family", "FontAwesome").style("font-size", function(d) {
                    return "25px";
                }).text(function(d) {
                    var iconObj = Enums.graphIcon[d.name];
                    return iconObj && iconObj.textContent ? iconObj.textContent : d && _.isArray(d.value) && d.value.length > 1 ? "" : "";
                }).attr("fill", function(d) {
                    return "#fff";
                });
                var countBox = circleContainer.append("g");
                countBox.append("circle").attr("cx", 18).attr("cy", -20).attr("r", function(d) {
                    if (_.isArray(d.value) && d.value.length > 1) return 10;
                }), countBox.append("text").attr("dx", 18).attr("dy", -16).attr("text-anchor", "middle").attr("fill", defaultEntityColor).text(function(d) {
                    if (_.isArray(d.value) && d.value.length > 1) return d.value.length;
                }), node.append("text").attr("x", -15).attr("y", "35").text(function(d) {
                    return d.name;
                }), simulation.nodes(nodes).on("tick", ticked), simulation.force("link").links(links);
            }
            function ticked() {
                path.attr("d", function(d) {
                    var diffX = d.target.x - d.source.x, diffY = d.target.y - d.source.y, pathLength = Math.sqrt(diffX * diffX + diffY * diffY), offsetX = diffX * d.target.radius / pathLength, offsetY = diffY * d.target.radius / pathLength;
                    return "M" + d.source.x + "," + d.source.y + "A" + pathLength + "," + pathLength + " 0 0,1 " + (d.target.x - offsetX) + "," + (d.target.y - offsetY);
                }), node.attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
            }
            function dragstarted(d) {
                d3.event.sourceEvent.stopPropagation(), d && d.value && d.value.guid != that.guid && (d3.event.active || simulation.alphaTarget(.3).restart(), 
                d.fx = d.x, d.fy = d.y);
            }
            function dragged(d) {
                d && d.value && d.value.guid != that.guid && (d.fx = d3.event.x, d.fy = d3.event.y);
            }
            function getPathColor(options) {
                return isAllEntityRelationDeleted(options) ? deletedEntityColor : activeEntityColor;
            }
            function isAllEntityRelationDeleted(options) {
                var data = options.data, type = options.type, d = $.extend(!0, {}, data);
                return d && !_.isArray(d.value) && (d.value = [ d.value ]), _.findIndex(d.value, function(val) {
                    return "node" == type ? "ACTIVE" == (val.entityStatus || val.status) : "ACTIVE" == val.relationshipStatus;
                }) == -1;
            }
            var node, path, that = this, width = this.$("svg").width(), height = this.$("svg").height(), nodes = d3.values(data.nodes), links = data.links, activeEntityColor = "#00b98b", deletedEntityColor = "#BB5838", defaultEntityColor = "#e0e0e0", selectedNodeColor = "#4a90e2", svg = d3.select(this.$("svg")[0]).attr("viewBox", "0 0 " + width + " " + height).attr("enable-background", "new 0 0 " + width + " " + height), container = svg.append("g").attr("id", "container").attr("transform", "translate(0,0)scale(1,1)"), zoom = d3.zoom().scaleExtent([ .1, 4 ]).on("zoom", function() {
                container.attr("transform", d3.event.transform);
            });
            svg.call(zoom).on("dblclick.zoom", null), container.append("svg:defs").selectAll("marker").data([ "deletedLink", "activeLink" ]).enter().append("svg:marker").attr("id", String).attr("viewBox", "-0 -5 10 10").attr("refX", 10).attr("refY", -.5).attr("orient", "auto").attr("markerWidth", 6).attr("markerHeight", 6).append("svg:path").attr("d", "M 0,-5 L 10 ,0 L 0,5").attr("fill", function(d) {
                return "deletedLink" == d ? deletedEntityColor : activeEntityColor;
            }).style("stroke", "none");
            var forceLink = d3.forceLink().id(function(d) {
                return d.id;
            }).distance(function(d) {
                return 100;
            }).strength(1), simulation = d3.forceSimulation().force("link", forceLink).force("charge", d3.forceManyBody()).force("center", d3.forceCenter(width / 2, height / 2));
            update();
            var zoomClick = function() {
                var scaleFactor = .8;
                "zoom_in" === this.id && (scaleFactor = 1.3), zoom.scaleBy(svg.transition().duration(750), scaleFactor);
            };
            d3.selectAll(this.$(".lineageZoomButton")).on("click", zoomClick);
        },
        createTable: function() {
            this.entityModel = new VEntity({});
            var table = CommonViewFunction.propertyTable({
                scope: this,
                valueObject: this.entity.relationshipAttributes,
                attributeDefs: this.attributeDefs
            });
            this.ui.relationshipDetailValue.html(table), Utils.togglePropertyRelationshipTableEmptyValues({
                inputType: this.ui.noValueToggle,
                tableEl: this.ui.relationshipDetailValue
            });
        },
        relationshipViewToggle: function(checked) {
            this.ui.relationshipDetailTable.toggleClass("visible invisible"), this.ui.relationshipSVG.toggleClass("visible invisible"), 
            checked ? (this.ui.zoomControl.hide(), this.$el.addClass("auto-height")) : (this.ui.zoomControl.show(), 
            this.$el.removeClass("auto-height"));
        }
    });
    return RelationshipLayoutView;
});