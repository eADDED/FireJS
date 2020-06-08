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
    let userConfig = new ConfigMapper_1.default().getUserConfig(args["--conf"]);
    const customConfig = !!userConfig;
    userConfig = userConfig || {};
    userConfig.disablePlugins = args["--disable-plugins"] || userConfig.disablePlugins;
    userConfig.pro = args["--pro"] || userConfig.pro;
    userConfig.verbose = args["--verbose"] || userConfig.verbose;
    userConfig.logMode = args["--log-mode"] || userConfig.logMode;
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
        lib: args["--lib"] || userConfig.paths.lib,
        webpackConfig: args["--webpack-conf"] || userConfig.paths.webpackConfig
    };
    userConfig.ssr = args["--ssr"] || userConfig.ssr;
    return [customConfig, userConfig];
}
function initWebpackConfig(args, { paths: { webpackConfig } }) {
    const webpackConf = webpackConfig ? require(path_1.isAbsolute(webpackConfig) ? webpackConfig : path_1.resolve(process.cwd(), webpackConfig)) : {};
    if (!args["--export"])
        webpackConf.watch = webpackConf.watch || true;
    return webpackConf;
}
function init() {
    const args = ArgsMapper_1.getArgs();
    //export fly
    if (args["--export-fly"]) {
        if (args["--export"])
            throw new Error("flag --export is redundant when exporting for fly build. Rerun after removing this flag");
        if (args["--pro"])
            throw new Error("flag --pro is redundant when exporting for fly build. Rerun after removing this flag");
        if (args["--ssr"])
            throw new Error("flag --ssr is redundant when exporting for fly build. Rerun after removing this flag");
        args["--ssr"] = true;
        args["--pro"] = true;
    }
    //export if export-fly
    args["--export"] = args["--export-fly"] || args["--export"];
    //check if log mode is valid
    if (args["--log-mode"])
        if (args["--log-mode"] !== "silent" && args["--log-mode"] !== "plain")
            throw new Error(`unknown log mode ${args["--log-mode"]}. Expected [ silent | plain ]`);
    //init config acc to args
    const [customConfig, config] = initConfig(args);
    //config disk
    if (args["--disk"]) {
        if (args["--export"])
            throw new Error("flag --disk is redundant when exporting");
        config.paths.dist = path_1.join(config.paths.cache || "out/.cache", "disk");
    }
    //get webpack config
    const webpackConfig = initWebpackConfig(args, config);
    //undefined cause it is not valid in the main app
    config.paths.webpackConfig = undefined;
    //return acc to flags
    return {
        app: args["--export"] ?
            new FireJS_1.default({ config, webpackConfig }) :
            new FireJS_1.default({
                config,
                webpackConfig,
                outputFileSystem: args["--disk"] ? undefined : new MemoryFS()
            }),
        args,
        customConfig
    };
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const { app, args, customConfig } = init();
        const $ = app.getContext();
        if (customConfig)
            $.cli.log("Using config from user");
        else
            $.cli.log("Using default config");
        try {
            yield app.init();
            if (args["--export"]) {
                $.cli.ok("Exporting");
                const startTime = new Date().getTime();
                const promises = [];
                $.pageMap.forEach(page => {
                    promises.push(app.buildPage(page));
                });
                yield Promise.all(promises);
                $.cli.ok("Build finished in", (new Date().getTime() - startTime) / 1000 + "s");
                if (args["--export-fly"]) {
                    $.cli.ok("Exporting for fly builds");
                    const map = {
                        staticConfig: $.renderer.param,
                        pageMap: {},
                    };
                    //replace template cause its been edited
                    map.staticConfig.template = $.inputFileSystem.readFileSync($.config.paths.template).toString();
                    const promises = [];
                    for (const page of $.pageMap.values()) {
                        map.pageMap[page.toString()] = page.chunks;
                        const chunkPath = path_1.join($.config.paths.lib, page.chunks[0]);
                        promises.push(new Promise(resolve => {
                            $.outputFileSystem.copyFile(chunkPath, path_1.join($.config.paths.fly, page.chunks[0]), err => {
                                resolve();
                                if (err)
                                    throw new Error(`Error while moving ${chunkPath} to ${$.config.paths.fly}`);
                            });
                        }));
                    }
                    const fullExternalName = map.staticConfig.externals[0].substr(map.staticConfig.externals[0].lastIndexOf("/") + 1);
                    $.outputFileSystem.rename(path_1.join($.config.paths.lib, map.staticConfig.externals[0]), path_1.join($.config.paths.fly, fullExternalName), err => {
                        if (err)
                            throw new Error(`Error while moving ${fullExternalName} to ${$.config.paths.fly}`);
                        map.staticConfig.externals[0] = fullExternalName;
                        Promise.all(promises).then(() => $.outputFileSystem.writeFileSync(path_1.join($.config.paths.fly, "firejs.map.json"), JSON.stringify(map)));
                    });
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
})().catch(err => console.error(err));
