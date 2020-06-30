"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//tick ✓ log # warning ! error X
class default_1 {
    constructor(mode = undefined) {
        switch (mode) {
            case "silent":
                this.normal = this.ok = this.warn = () => {
                };
                this.error = console.error;
                break;
            case "plain":
                this.normal = this.ok = console.log;
                this.error = console.error;
                this.warn = console.warn;
                this.log = console.log;
                break;
            default:
                this.normal = console.log;
                this.log = (...messages) => console.log(' \x1b[34;1m#\x1b[0m\x1b[34m', ...messages, '\x1b[0m');
                this.ok = (...messages) => console.log(' \x1b[32;1m✓\x1b[0m\x1b[32m', ...messages, '\x1b[0m');
                this.error = (...messages) => console.error(' \x1b[31mX', ...messages, '\x1b[0m');
                this.warn = (...messages) => console.warn(' \x1b[33m!', ...messages, '\x1b[0m');
                console.clear();
                console.log(`\x1b[1mFireJS v${global.__FIREJS_VERSION__}\x1b[0m\n`);
        }
    }
}
exports.default = default_1;
