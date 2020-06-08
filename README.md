# Fire JS 🔥
A zero config, highly customizable, progressive react static site generator with blazingly fast SSR. Built for fast on the fly builds and SSR.


## Features

+ Fast webpages with smart preloading
+ Node interface for on the fly rendering (SSR)
+ Dev friendly CLI interface
+ Plugins for dynamic routes
+ Highly customizable project stucture and webpack 
+ Supports LESS, JSX, SASS, CSS out of the box.

## Install

install using **yarn** or **npm**

**yarn**

```bash
$ yarn add @eadded/firejs react react-dom
```

**npm**

```bash
$ npm install @eadded/firejs react react-dom
```

## Quick Start

Make dir `src/pages` in project root. This dir will contain all of the pages for our brand new hello world website.

Make a file **404.js** or **404.js** in the dir. This file will be the 404 page of our website.

```jsx
export default () => {  
  return (
    <div>
        <p>Welcome to 404</p>
    </div>  
  )
}
```

Add the following **script(s)** to **package.json**

```json 
"scripts": {
    "dev": "firejs",  
}
```

Now run using **yarn** or **npm**

**yarn**
```bash
$ yarn run dev
```
**npm**
```bash
$ npm run dev
```
Navigate to `http://localhost:5000` and there it says `hello world`.

*To change server **PORT** set env variable **PORT** to the required value*

**Note:** 404 page is mandatory

## Args  
```
-p, --pro       production mode
-e, --export    export project for distribution
--export-fly    export project for distribution and for fly build
```
Run firejs with flag [-h, --help] to list all valid args

## Project Structure
This is a typical project structure which can be modified using **firejs.yml**  
```
Project    
└─── out                 
│   └─── dist             
│       └─── lib           
│           └─── map    
└─── src    
│   └─── pages        
│       │   external_group.js      
│       │   about.js
│       │   404.js          
│       │   ...    
│    
│   └─── plugins          
│       │   example.js    
│       │   ...
│
│   └─── static             //all static files go here. eg : images
│       │   example.png
|
| firejs.yml                //default config file
```

## Components
**Firejs** exports two components : Link and Head

 - Link : Used for navigating pages (in project only). Preloads page content onMouseEnter. Preserves history.
 - Head : Injects children to head element. A wrapper around react-helmet. Allows SSR.

*Example*
```jsx
import Link from "@eadded/firejs/components/Link"  
import Head from "@eadded/firejs/components/Head";  
export default () => {  
   return (  
    <div>  
      <Head>  
        <title>Index Page</title>  
      </Head>  
      <Link to="/about">Link to About Page</Link>  
    </div>  
   )
}
```
## Plugins
A plugin can be used to supply **paths** and **content** for pages.

Suppose that you have a page *[author]/[article].js*. A plugin can be used to provide path */aniket/rust*, and a markdown as content.
    
~~~javascript    
import Plugin from "@eadded/firejs/dist/classes/Plugin";

export default class extends Plugin {
    constructor() {
        super("[author]/[article].js");
    }

    async onBuild(renderPage, callback) {
        renderPage("/aniket/rust", {md: "# Markdown as content"})
        callback();
    }

    async onRequest(req, res) {
        //This func is called when the respcted page's map is requested
    }
}
~~~    
File `[author]/[article].js` which is found in pages dir, is used to create the route `/aniket/rust`.

Page **content** can be accessed from [prop](https://reactjs.org/docs/components-and-props.html).

## Configuration
Create a **firejs.yml** file in the root dir or specify a file using `[-c,--config]` flags.

*Type Interface*

```typescript
interface Config {
    pro?: boolean,              //production mode when true, dev mode when false
    verbose?: boolean,
    logMode?: "plain" | "silent",
    disablePlugins?: boolean,
    paths?: {                   //paths absolute or relative to root
        root?: string,          //project root, default : process.cwd()
        src?: string,           //src dir, default : root/src
        pages?: string,         //pages dir, default : root/src/pages
        out?: string,           //production dist, default : root/out
        dist?: string,          //production dist, default : root/out/dist
        cache?: string,         //cache dir, default : root/out/.cache
        fly?: string,           //cache dir, default : root/out/fly
        template?: string,      //template file, default : inbuilt template file
        lib?: string,           //dir where chunks are exported, default : root/out/dist/lib
        map?: string,           //dir where chunk map and page data is exported, default : root/out/dist/lib/map
        static?: string,        //dir where page static elements are stored eg. images, default : root/src/static
        plugins?: string,       //plugins dir, default : root/src/plugins
        webpackConfig?: string, //webpack Config file
    },
    templateTags?: TemplateTags,
    pages?: ExplicitPages
}

interface ExplicitPages {
    "404"?: string       //404 page, default : 404.js
}

interface TemplateTags {
    script?: string,    //this is replaced by all page scripts, default : "<%=SCRIPT=%>"
    static?: string,    //this is replaced by static content enclosed in <div id="root"></div>, default : "<%=STATIC=%>"
    head?: string,      //this is replaced by static head tags i.e tags in Head Component, default : "<%=HEAD=%>"
    style?: string,     //this is replaced by all page styles, default : "<%=STYLE=%>"
    unknown?: string    //files imported in pages other than [js,css] go here. Make sure you use a webpack loader for these files, default : "<%=UNKNOWN=%>"
}
```
Example **firejs.yml**

```yaml
pro : true
paths :
  out : "./new out"
```

## Node Interface

Building a specific page. Eg: external_group.js

~~~javascript
import FireJS from "@eadded/firejs"

(async () => {
    const app = new FireJS({config: {pro: true}});
    await app.init();
    await app.buildPage(app.getContext().pageMap.get("external_group.js"))
})()
~~~

## Rendering On the fly

If you need to SSR (Server Side Render) your page, or if you want to do something like [this](https://dev.to/aniketfuryrocks/dynamically-building-static-react-pages-upon-request-4pg3). We've got your back.

First export your project using `--export-fly`. This will spit all the chunks required for SSR in the `out/fly` dir.

**Rendering a page with custom data**
~~~javascript
import CustomRenderer from "@eadded/firejs/dist/CustomRenderer";

(async () => {
    const renderer = new CustomRenderer("./out/fly", "./src/plugins");
    const obj = await renderer.render("[author]/[article].js", "/aniket/rust",{name:"any content"})
    console.log(obj);
})()
~~~

The **obj** variable is json of structure

~~~typescript
{
    html : string,  //contains the statically rendered html
    map : string    //contains map for the page
}
~~~
The **map** property contains the page map and its content. It shall be served by the route **/lib/map/[path].map.js**

Make sure you serve the **map** by the correct route to ensure the correct functioning of **Link** component

The map for path */aniket/rust* shall be served by the route */lib/map/aniket/rust.map.js*

of course, the route can be changed using *firejs.yml*

**Rendering a page with data from plugins**

~~~javascript
import CustomRenderer from "@eadded/firejs/dist/CustomRenderer";

(async () => {
    const renderer = new CustomRenderer("./out/babel", "./src/plugins");
    const obj = await renderer.renderWithPluginData("[author]/[article].js", "/aniket/rust")
    console.log(obj);
})()
~~~

**pageMap variable**

The map variable i.e app.pageMap , maps all the pages, with its paths and plugins.
## Default Path

When you don't provide a path for a page using a plugin then the path of the page will be used as its' path.

Eg. A page "external_group.js" will have a default path "/index".

If you provide a blank plugin then default paths will not be applied.

## Globals

`window.__SSR__` To check if page is being rendered on *Server* or on *Browser*

`window.__HYDRATE__` To check if page was [`hydrated`](https://reactjs.org/docs/react-dom.html#hydrate) or [`rendered`](https://reactjs.org/docs/react-dom.html#render)

`window.__LIB_REL__` Relative-Path to lib dir( dir where all of your js bundles will be exported). default : `lib`

`window.__MAP_REL__` Relative-Path to map dir( dir where all of your page maps will be exported). default : `lib/map`

`window.__PAGES__["404"]` Route to 404 page

## [Code Of Conduct](CODE_OF_CONDUCT.md)

## [Contributing](CONTRIBUTING.md)

## License & Copyright

Copyright (C) 2020 Aniket Prajapati

Licensed under the [GNU GENERAL PUBLIC LICENSE](LICENSE)

## Contributors
 + [Aniket Prajapati](https://github.com/aniketfuryrocks) @ prajapati.ani306@gmail.com , [eAdded](http://www.eadded.com)
