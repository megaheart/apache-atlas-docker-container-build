!function(a,b){if("function"==typeof define&&define.amd)define(["d3"],b);else if("object"==typeof module&&module.exports){var c=require("d3");module.exports=b(c)}else a.d3.tip=b(a.d3)}(this,function(a){return function(){function b(a){w=o(a),x=w.createSVGPoint(),document.body.appendChild(v)}function c(){return"n"}function d(){return[0,0]}function e(){return" "}function f(){var a=q();return{top:a.n.y-v.offsetHeight,left:a.n.x-v.offsetWidth/2}}function g(){var a=q();return{top:a.s.y,left:a.s.x-v.offsetWidth/2}}function h(){var a=q();return{top:a.e.y-v.offsetHeight/2,left:a.e.x}}function i(){var a=q();return{top:a.w.y-v.offsetHeight/2,left:a.w.x-v.offsetWidth}}function j(){var a=q();return{top:a.nw.y-v.offsetHeight,left:a.nw.x-v.offsetWidth}}function k(){var a=q();return{top:a.ne.y-v.offsetHeight,left:a.ne.x}}function l(){var a=q();return{top:a.sw.y,left:a.sw.x-v.offsetWidth}}function m(){var a=q();return{top:a.se.y,left:a.e.x}}function n(){var b=a.select(document.createElement("div"));return b.style("position","absolute").style("top",0).style("opacity",0).style("pointer-events","none").style("box-sizing","border-box"),b.node()}function o(a){return a=a.node(),"svg"===a.tagName.toLowerCase()?a:a.ownerSVGElement}function p(){return null===v&&(v=n(),document.body.appendChild(v)),a.select(v)}function q(){for(var b=y||a.event.target;"undefined"==typeof b.getScreenCTM&&"undefined"===b.parentNode;)b=b.parentNode;var c={},d=b.getScreenCTM(),e=b.getBBox(),f=e.width,g=e.height,h=e.x,i=e.y;return x.x=h,x.y=i,c.nw=x.matrixTransform(d),x.x+=f,c.ne=x.matrixTransform(d),x.y+=g,c.se=x.matrixTransform(d),x.x-=f,c.sw=x.matrixTransform(d),x.y-=g/2,c.w=x.matrixTransform(d),x.x+=f,c.e=x.matrixTransform(d),x.x-=f/2,x.y-=g/2,c.n=x.matrixTransform(d),x.y+=g,c.s=x.matrixTransform(d),c}function r(a){return"function"==typeof a?a:function(){return a}}var s=c,t=d,u=e,v=n(),w=null,x=null,y=null;b.show=function(){var a=Array.prototype.slice.call(arguments);a[a.length-1]instanceof SVGElement&&(y=a.pop());var c,d=u.apply(this,a),e=t.apply(this,a),f=s.apply(this,a),g=p(),h=A.length,i=document.documentElement.scrollTop||document.body.scrollTop,j=document.documentElement.scrollLeft||document.body.scrollLeft;for(g.html(d).style("opacity",1).style("pointer-events","all");h--;)g.classed(A[h],!1);return c=z.get(f).apply(this),g.classed(f,!0).style("top",c.top+e[0]+i+"px").style("left",c.left+e[1]+j+"px"),b},b.hide=function(){var a=p();return a.style("opacity",0).style("pointer-events","none"),b},b.attr=function(c,d){if(arguments.length<2&&"string"==typeof c)return p().attr(c);var e=Array.prototype.slice.call(arguments);return a.selection.prototype.attr.apply(p(),e),b},b.style=function(c,d){if(arguments.length<2&&"string"==typeof c)return p().style(c);var e=Array.prototype.slice.call(arguments);return a.selection.prototype.style.apply(p(),e),b},b.direction=function(a){return arguments.length?(s=null==a?a:r(a),b):s},b.offset=function(a){return arguments.length?(t=null==a?a:r(a),b):t},b.html=function(a){return arguments.length?(u=null==a?a:r(a),b):u},b.destroy=function(){return v&&(p().remove(),v=null),b};var z=a.map({n:f,s:g,e:h,w:i,nw:j,ne:k,sw:l,se:m}),A=z.keys();return b}});