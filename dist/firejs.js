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
const index_1 = require("./index");
const server_1 = require("./server");
const path_1 = require("path");
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const startTime = new Date().getTime();
        const app = new index_1.default();
        const $ = app.getContext();
        try {
            yield app.init();
            if ($.config.pro) {
                yield app.buildPro();
                $.cli.ok("Build finished in", (new Date().getTime() - startTime) / 1000 + "s");
                $.cli.log("Generating babel chunk map");
                const map = {
                    staticConfig: $.renderer.param,
                    pageMap: {},
                    template: $.template
                };
                for (const page of $.pageMap.values())
                    map.pageMap[page.toString()] = page.chunkGroup;
                $.outputFileSystem.writeFileSync(path_1.join($.config.paths.babel, "firejs.map.json"), JSON.stringify(map));
                $.cli.ok("Finished in", (new Date().getTime() - startTime) / 1000 + "s");
            }
            else
                yield server_1.default(app);
        }
        catch (err) {
            $.cli.error(err);
        }
    });
})();
