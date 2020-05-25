import { $, WebpackConfig, WebpackStat } from "../index";
import Page from "../classes/Page";
export default class {
    private readonly $;
    private readonly webpackArchitect;
    isOutputCustom: boolean;
    isInputCustom: boolean;
    constructor(globalData: $, webpackArchitect: any, isOutputCustom: boolean, isInputCustom: boolean);
    buildExternals(): Promise<string[]>;
    buildBabel(page: Page): Promise<unknown>;
    buildDirect(page: Page, resolve: () => void, reject: (err: any | undefined) => void): void;
    build(config: WebpackConfig, resolve: (stat: any) => void, reject: (err: any) => void): void;
    logStat(stat: WebpackStat): boolean;
}
