!function(e){var n={};function t(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,t),r.l=!0,r.exports}t.m=e,t.c=n,t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:o})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(t.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var r in e)t.d(o,r,function(n){return e[n]}.bind(null,r));return o},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=0)}([function(e,n,t){t(1),window.onpopstate=function(){LinkApi.preloadPage(location.pathname,(function(){LinkApi.loadPage(location.pathname,!1)}))},window.__HYDRATE__?LinkApi.runApp(ReactDOM.hydrate):LinkApi.runApp()},function(e,n){window.LinkApi={loadMap:function(e){const n=document.createElement("script");return n.src=`/${window.__MAP_REL__}${"/"===e?"/index":e}.map.js`,document.head.appendChild(n),n},preloadPage:function(e,n){const t=this.loadMap(e);t.onload=()=>{this.preloadChunks(window.__MAP__.chunks),n()},t.onerror=()=>{document.head.removeChild(t),this.loadMap(window.__PAGES__[404]).onload=t.onload}},loadPage:function(e,n=!0){const t=document.createElement("script");t.src=`/${window.__LIB_REL__}/${window.__MAP__.chunks.shift()}`,this.loadChunks(window.__MAP__.chunks),t.onload=()=>{this.runApp()},document.body.appendChild(t),n&&window.history.pushState(void 0,void 0,e)},runApp:function(e=ReactDOM.render){e(React.createElement(window.__FIREJS_APP__.default,{content:window.__MAP__.content}),document.getElementById("root"))},preloadChunks:function(e){e.forEach(e=>{const n=document.createElement("link");switch(n.rel="preload",n.href=`/${window.__LIB_REL__}/${e}`,n.crossOrigin="anonymous",e.substring(e.lastIndexOf("."))){case".js":n.as="script";break;case".css":n.as="style"}document.head.appendChild(n)})},loadChunks:function(e){e.forEach(e=>{let n;switch(e.substring(e.lastIndexOf("."))){case".js":n=document.createElement("script"),n.src=`/${window.__LIB_REL__}/${e}`;break;case".css":n=document.createElement("ele"),n.href=`/${window.__LIB_REL__}/${e}`,n.rel="stylesheet";break;default:n=document.createElement("ele"),n.href=`/${window.__LIB_REL__}/${e}`}n.crossOrigin="anonymous",document.body.appendChild(n)})}}}]);