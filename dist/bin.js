#!/usr/bin/env node
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
const FireJS_1 = require("./FireJS");
const server_1 = require("./server");
const path_1 = require("path");
const ArgsMapper_1 = require("./mappers/ArgsMapper");
const ConfigMapper_1 = require("./mappers/ConfigMapper");
const MemoryFS = require("memory-fs");
function initConfig(args) {
    const userConfig = new ConfigMapper_1.default().getUserConfig(args["--conf"]);
    console.log(userConfig);
    userConfig.disablePlugins = args["--disable-plugins"] || !!userConfig.disablePlugins;
    userConfig.pro = args["--export"] || args["--pro"] || !!userConfig.pro;
    userConfig.verbose = args["--verbose"] || !!userConfig.verbose;
    userConfig.logMode = args["--plain"] ? "plain" : args["--silent"] ? "silent" : userConfig.logMode;
    userConfig.paths = userConfig.paths || {};
    userConfig.paths = {
        fly: args["--fly"] || userConfig.paths.fly,
        out: args["--out"] || userConfig.paths.out,
        root: args["--root"] || userConfig.paths.root,
        cache: args["--cache"] || userConfig.paths.cache,
        dist: args["--dist"] || userConfig.paths.dist,
        map: args["--map"] || userConfig.paths.map,
        pages: args["--pages"] || userConfig.paths.pages,
        template: args["--template"] || userConfig.paths.template,
        src: args["--src"] || userConfig.paths.src,
        static: args["--static"] || userConfig.paths.static,
        plugins: args["--plugins"] || userConfig.paths.plugins,
        lib: args["--lib"] || userConfig.paths.lib
    };
    return userConfig;
}
function initWebpackConfig(args) {
    const webpackConfig = args["--webpack-conf"] ? require(path_1.resolve(process.cwd(), args["--webpack-conf"])) : {};
    if (!args["--export"])
        webpackConfig.watch = webpackConfig.watch || true;
    return webpackConfig;
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const args = ArgsMapper_1.getArgs();
        args["--export"] = args["--export-fly"] ? true : args["--export"];
        const config = initConfig(args);
        if (args["--disk"])
            config.paths.dist = config.paths.cache;
        const webpackConfig = initWebpackConfig(args);
        console.log(webpackConfig);
        const app = args["--export"] ?
            new FireJS_1.default({ config, webpackConfig }) :
            new FireJS_1.default({
                config,
                webpackConfig,
                outputFileSystem: args["--disk"] ? undefined : new MemoryFS()
            });
        const $ = app.getContext();
        try {
            yield app.init();
            if (args["--export"]) {
                const startTime = new Date().getTime();
                const promises = [];
                $.pageMap.forEach(page => {
                    promises.push(app.buildPage(page));
                });
                yield Promise.all(promises);
                $.cli.ok("Build finished in", (new Date().getTime() - startTime) / 1000 + "s");
                if (args["--export-fly"]) {
                    $.cli.log("Exporting for on the fly builds");
                    const map = {
                        staticConfig: $.renderer.param,
                        pageMap: {},
                    };
                    for (const page of $.pageMap.values()) {
                        map.pageMap[page.toString()] = page.chunks;
                        page.chunks.forEach(chunk => {
                            if (chunk.endsWith(".js")) { //only js files are required
                                const chunkPath = path_1.join($.config.paths.lib, chunk);
                                $.outputFileSystem.exists(chunkPath, exists => {
                                    if (exists) { //only copy if it exists because it might be already copied before for page having same chunk
                                        $.outputFileSystem.rename(chunkPath, path_1.join($.config.paths.fly, chunk), err => {
                                            if (err)
                                                throw new Error(`Error while moving ${chunkPath} to ${$.config.paths.fly}`);
                                        });
                                    }
                                });
                            }
                        });
                    }
                    $.outputFileSystem.writeFileSync(path_1.join($.config.paths.fly, "firejs.map.json"), JSON.stringify(map));
                }
                process.on('exit', () => {
                    $.cli.ok("Finished in", (new Date().getTime() - startTime) / 1000 + "s");
                    if ($.config.paths.static)
                        $.cli.warn("Don't forget to copy the static folder to dist");
                });
            }
            else {
                const server = new server_1.default(app);
                yield server.init();
            }
        }
        catch (err) {
            $.cli.error(err);
        }
    });
})();
