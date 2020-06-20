"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./GlobalsSetter");
const ConfigMapper_1 = require("./mappers/ConfigMapper");
const Cli_1 = require("./utils/Cli");
const path_1 = require("path");
const PluginMapper_1 = require("./mappers/PluginMapper");
const PageArchitect_1 = require("./architects/PageArchitect");
const Fs_1 = require("./utils/Fs");
const fs_extra_1 = require("fs-extra");
const fs = require("fs");
const StaticArchitect_1 = require("./architects/StaticArchitect");
const PathMapper_1 = require("./mappers/PathMapper");
const WebpackArchitect_1 = require("./architects/WebpackArchitect");
class default_1 {
    constructor(params = {}) {
        this.$ = { globalPlugins: [] };
        this.constructParams(params);
        process.env.NODE_ENV = params.config.pro ? 'production' : 'development';
        // @ts-ignore
        fs.mkdirp = fs_extra_1.mkdirp;
        this.$.inputFileSystem = params.inputFileSystem || fs;
        this.$.outputFileSystem = params.outputFileSystem || fs;
        //config
        this.$.config = new ConfigMapper_1.default(this.$.inputFileSystem, this.$.outputFileSystem).getConfig(params.config);
        //cli
        this.$.cli = new Cli_1.default(this.$.config.logMode);
        //log
        this.$.cli.ok(`NODE_ENV : ${process.env.NODE_ENV}`);
        this.$.cli.ok(`SSR : ${this.$.config.ssr}`);
        //pageMap
        this.$.pageMap = PathMapper_1.createMap(this.$.config.paths.pages, this.$.inputFileSystem);
        //rel
        this.$.rel = {
            libRel: path_1.relative(this.$.config.paths.dist, this.$.config.paths.lib),
            mapRel: path_1.relative(this.$.config.paths.dist, this.$.config.paths.map)
        };
        //pageArchitect
        this.$.pageArchitect = new PageArchitect_1.default(this.$, new WebpackArchitect_1.default(this.$), !!params.outputFileSystem, !!params.inputFileSystem);
        //mapPlugins
        if (this.$.config.plugins.length > 0) {
            this.$.cli.log("Mapping plugins");
            this.$.config.plugins.forEach(plugin => PluginMapper_1.mapPlugin(plugin, {
                globalPlugins: this.$.globalPlugins,
                webpackArchitect: this.$.pageArchitect.webpackArchitect,
                pageMap: this.$.pageMap,
                rootPath: this.$.config.paths.root
            }));
        }
    }
    constructParams(params) {
        params.config = params.config || {};
        params.config.paths = params.config.paths || {};
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.$.cli.log("Building Externals");
            this.$.renderer = new StaticArchitect_1.default({
                rel: this.$.rel,
                pathToLib: this.$.config.paths.lib,
                externals: yield this.$.pageArchitect.buildExternals(),
                explicitPages: this.$.config.pages,
                template: this.$.inputFileSystem.readFileSync(path_1.join(__dirname, "./web/template.html")).toString(),
                ssr: this.$.config.ssr,
            });
            this.$.globalPlugins.forEach(globalPlugin => this.$.renderer.renderGlobalPlugin(globalPlugin));
        });
    }
    buildPage(page, resolve, reject) {
        this.$.pageArchitect.buildPage(page, () => {
            this.$.cli.ok(`Successfully built page ${page.toString()}`);
            page.plugin.onBuild((path, content) => __awaiter(this, void 0, void 0, function* () {
                this.$.cli.log(`Rendering path ${path}`);
                let done = 0;
                this.$.renderer.render(page, path, content).then(html => {
                    this.$.cli.ok(`Successfully rendered path ${path}`);
                    Fs_1.writeFileRecursively(path_1.join(this.$.config.paths.dist, `${path}.html`), html, this.$.outputFileSystem).then(() => {
                        if (++done == 2)
                            resolve();
                    }).catch(reject);
                }).catch(e => {
                    this.$.cli.error(`Error while rendering path ${path}`);
                    Fs_1.writeFileRecursively(path_1.join(this.$.config.paths.dist, `${path}.html`), `Error while rendering path ${path}\n${e}`, this.$.outputFileSystem);
                    reject(e);
                });
                Fs_1.writeFileRecursively(path_1.join(this.$.config.paths.map, `${path}.map.js`), `FireJS.map=${JSON.stringify({
                    content,
                    chunks: page.chunks
                })}`, this.$.outputFileSystem).then(() => {
                    if (++done == 2)
                        resolve();
                }).catch(reject);
            }));
        }, reject);
    }
    export() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            this.$.pageMap.forEach(page => {
                promises.push(this.buildPage(page, () => {
                }, (e) => {
                    this.$.cli.error(`Error while building page ${page}`, e);
                    throw "";
                }));
            });
            return Promise.all(promises);
        });
    }
    exportFly() {
        return new Promise((resolve) => {
            const map = {
                staticConfig: Object.assign(Object.assign({}, this.$.renderer.config), { template: this.$.inputFileSystem.readFileSync(path_1.join(__dirname, "./web/template.html")).toString() }),
                pageMap: {},
            };
            const promises = [];
            for (const page of this.$.pageMap.values()) {
                promises.push(new Promise(resolve => this.buildPage(page, () => {
                    map.pageMap[page.toString()] = page.chunks;
                    page.chunks.forEach(chunk => {
                        if (chunk.endsWith(".js")) {
                            const chunkPath = path_1.join(this.$.config.paths.lib, chunk);
                            this.$.outputFileSystem.copyFile(chunkPath, path_1.join(this.$.config.paths.fly, chunk), err => {
                                resolve();
                                if (err)
                                    throw new Error(`Error while moving ${chunkPath} to ${this.$.config.paths.fly}`);
                            });
                        }
                    });
                }, (e) => {
                    this.$.cli.error(`Error while building page ${page}`, e);
                    throw "";
                })));
            }
            const fullExternalName = map.staticConfig.externals[0].substr(map.staticConfig.externals[0].lastIndexOf("/") + 1);
            this.$.outputFileSystem.rename(path_1.join(this.$.config.paths.lib, map.staticConfig.externals[0]), path_1.join(this.$.config.paths.fly, fullExternalName), err => {
                if (err)
                    throw new Error(`Error while moving ${fullExternalName} to ${this.$.config.paths.fly}`);
                map.staticConfig.externals[0] = fullExternalName;
                Promise.all(promises).then(() => this.$.outputFileSystem.writeFile(path_1.join(this.$.config.paths.fly, "firejs.map.json"), JSON.stringify(map), resolve));
            });
        });
    }
    getContext() {
        return this.$;
    }
}
exports.default = default_1;
