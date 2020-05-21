import { Args, Config } from "./mappers/ConfigMapper";
import Cli from "./utils/Cli";
import MapComponent from "./classes/MapComponent";
import { Configuration, Stats } from "webpack";
import { StaticConfig } from "./architects/StaticArchitect";
export declare type WebpackConfig = Configuration;
export declare type WebpackStat = Stats;
export interface PathRelatives {
    libRel: string;
    mapRel: string;
}
export interface ChunkGroup {
    babelChunk: string;
    chunks: string[];
}
export interface FireJS_MAP {
    externals: string[];
    pages: {
        [key: string]: ChunkGroup;
    };
}
export interface $ {
    args?: Args;
    config?: Config;
    map?: Map<string, MapComponent>;
    cli?: Cli;
    webpackConfig?: WebpackConfig;
    template?: string;
    externals?: string[];
    rel?: PathRelatives;
}
export interface Params {
    config?: Config;
    args?: Args;
    pages?: string[];
    webpackConfig?: WebpackConfig;
    template?: string;
}
export default class {
    private readonly $;
    constructor(params?: Params);
    mapPluginsAndBuildExternals(): Promise<unknown>;
    buildPro(callback: any): void;
    generateMap(): FireJS_MAP;
    get Context(): $;
}
export declare class foo {
    readonly config: StaticConfig;
    readonly plugins: string[];
    constructor(config: any, pathToPlugins: any, otherPlugins?: string[]);
    renderPath(): void;
}
