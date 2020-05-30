export interface Args {
    "--pro": boolean;
    "--export": boolean;
    "--export-fly": boolean;
    "--disk": boolean;
    "--webpack-conf": string;
    "--conf": string;
    "--verbose": boolean;
    "--plain": boolean;
    "--silent": boolean;
    "--disable-plugins": boolean;
    "--root": string;
    "--src": string;
    "--pages": string;
    "--out": string;
    "--dist": string;
    "--cache": string;
    "--fly": string;
    "--template": string;
    "--lib": string;
    "--map": string;
    "--static": string;
    "--plugins": string;
}
export declare function getArgs(): Args;
