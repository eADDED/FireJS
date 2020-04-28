const {renderToString} = require("react-dom/server");
const _path = require("path");
//set globals for ssr

module.exports = class {
    #$;

    constructor(globalData) {
        this.#$ = globalData;
    }

    render(mapComponent, pagePath) {
        let template = this.#$.template
        if(pagePath.content){//if page has content then add it
            template = this.addChunk(template,pagePath.getPath().concat(".js"),_path.relative(this.#$.config.paths.dist, this.#$.config.paths.pageData))
        }
        mapComponent.chunks.forEach(chunk => {
            template = this.addChunk(template, chunk);
        });
        return template.replace(
            this.#$.config.templateTags.static,
            "<div id='root'>".concat(
                (() => {
                    if (this.#$.config.pro) {
                        global.window = {};
                        global.document = {};
                        global.__SSR__ = true;
                        global.React = require("react");
                        return renderToString(React.createElement(require(_path.join(this.#$.config.paths.babel, mapComponent.babelChunk)).default, pagePath.content, undefined))
                    } else
                        return "";
                })())
            , "</div>");
    }

    addChunk(template, chunk, root) {
        root = root || _path.relative(this.#$.config.paths.dist, this.#$.config.paths.lib)
        const templateTags = this.#$.config.templateTags;
        const href = _path.join(root, chunk);
        if (chunk.endsWith(".js"))
            return template.replace(templateTags.script, `<script src="/${href}"></script>${templateTags.script}`);
        else if (chunk.endsWith(".css"))
            return template.replace(templateTags.style, `<link rel="stylesheet" href="/${href}">${templateTags.style}`);
        else
            return template.replace(templateTags.unknown, `<link href="/${href}">${templateTags.unknown}`);
    }

    finalize(template) {
        Object.keys(this.#$.config.templateTags).forEach(tag => {
            template = template.replace(this.#$.config.templateTags[tag], "");
        })
    }
}