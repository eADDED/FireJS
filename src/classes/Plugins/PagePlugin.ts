import {WebpackConfig} from "../../FireJS";
import FireJSPlugin, {PluginCode} from "./FireJSPlugin";

export const PagePlugMinVer = 0.1;

export default abstract class extends FireJSPlugin {
    page: string;

    protected constructor(page: string) {
        super(0.1, PluginCode.PagePlugin);
        this.page = page;
    }

    async onBuild(renderPage: (path: string, content: any) => void) {
        renderPage("/" + this.page.toString().substring(0, this.page.toString().lastIndexOf(".")), {})
    }

    initWebpack(webpackConfig: WebpackConfig) {
    }
}