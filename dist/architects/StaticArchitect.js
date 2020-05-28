"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("react-dom/server");
const react_helmet_1 = require("react-helmet");
const path_1 = require("path");
class default_1 {
    constructor(param) {
        this.param = param;
        this.param.template = this.addInnerHTML(this.param.template, `<script>` +
            `window.__LIB_REL__="${this.param.rel.libRel}";` +
            `window.__MAP_REL__="${this.param.rel.mapRel}";` +
            `window.__PAGES__={};` +
            `window.__PAGES__._404="/${this.param.explicitPages["404"].substring(0, this.param.explicitPages["404"].lastIndexOf("."))}";` +
            `</script>`, "head");
    }
    render(template, page, path, content) {
        template = this.addChunk(template, path_1.join(this.param.rel.mapRel, path + ".map.js"), "", "head");
        //add externals
        this.param.externals.forEach(external => {
            template = this.addChunk(template, external);
        });
        //add main entry
        template = this.addChunk(template, page.chunks[0]);
        template = this.addChunk(template, "i21345bb373762325b784.js");
        for (let i = 1; i < page.chunks.length; i++)
            template = this.addChunk(template, page.chunks[i]);
        template = template.replace(this.param.tags.static, `<div id='root'>${(() => {
            if (content) {
                // @ts-ignore
                global.React = require("react");
                // @ts-ignore
                global.ReactDOM = require("react-dom");
                // @ts-ignore
                global.ReactHelmet = { Helmet: react_helmet_1.Helmet };
                // @ts-ignore
                global.window = {
                    // @ts-ignore
                    __LIB_REL__: this.param.rel.libRel,
                    __MAP_REL__: this.param.rel.mapRel,
                    __MAP__: {
                        content,
                        chunks: []
                    },
                    __SSR__: true
                };
                // @ts-ignore
                global.location = {
                    pathname: path
                };
                // @ts-ignore
                global.document = {};
                require(path_1.join(this.param.pathToLib, page.chunks[0]));
                return server_1.renderToString(
                // @ts-ignore
                React.createElement(require("../../web/dist/wrapper.bundle").default, 
                // @ts-ignore
                { content: window.__MAP__.content }, undefined));
            }
            else
                return "";
        })()}</div>`);
        if (content) {
            const helmet = react_helmet_1.Helmet.renderStatic();
            for (let head_element in helmet)
                template = this.addInnerHTML(template, helmet[head_element].toString(), "head");
        }
        return template;
    }
    addChunk(template, chunk, root = undefined, tag = undefined) {
        root = root === undefined ? this.param.rel.libRel : root;
        const href = path_1.join(root, chunk);
        if (tag === "script" || chunk.endsWith(".js")) {
            template = template.replace(this.param.tags.style, `<link rel = "preload" as = "script"href = "/${href}"crossorigin = "anonymous" >${this.param.tags.style}`);
            return template.replace(this.param.tags.script, ` <script src = "/${href}" crossorigin = "anonymous" > </script>${this.param.tags.script}`);
        }
        else if (tag === "style" || chunk.endsWith(".css")) {
            template = template.replace(this.param.tags.style, `<link rel="preload" as="script" href="/${href}" crossorigin="anonymous">${this.param.tags.style}`);
            return template.replace(this.param.tags.style, `<link rel="stylesheet" href="/${href}" crossorigin="anonymous">${this.param.tags.style}`);
        }
        else if (tag === "head")
            return template.replace(this.param.tags.head, `<link href="/${href}" crossorigin="anonymous">${this.param.tags.head}`);
        else
            return template.replace(this.param.tags.unknown, `<link href="/${href}" crossorigin="anonymous">${this.param.tags.unknown}`);
    }
    addInnerHTML(template, element, tag) {
        return template.replace(this.param.tags[tag], `${element}${this.param.tags[tag]}`);
    }
    finalize(template) {
        Object.keys(this.param.tags).forEach(tag => {
            template = template.replace(this.param.tags[tag], "");
        });
        return template;
    }
}
exports.default = default_1;
