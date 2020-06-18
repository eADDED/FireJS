# Fire JS 🔥
A zero config, highly customizable, progressive react static site generator with blazingly fast SSR and on the fly builds.

## Features

+ Fast web pages with smart preloading
+ Node interface for on the fly rendering (SSR)
+ Dev friendly CLI interface
+ Plugins for dynamic routes
+ Highly customizable project structure and webpack 
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

Make dir `src/pages` in project root. This dir will contain all the pages required for our brand-new hello world website.

Make a file **404.js** in the dir. This file will be the 404 page of our website.

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
Navigate to `http://localhost:5000` and there it says `Welcome to 404`.

*To change server **PORT** set env variable **PORT** to the required value*

**Note:** 404 page is mandatory

## Documentation

Documentation is available at the official [FireJS Github Wiki](https://github.com/eAdded/FireJS/wiki)

**NOTE** `v0.18.0` is currently in `beta` testing and its docs are yet to be published. The release has been planned for `20th July 2020`.
This release brings a brand-new mechanism for SSR lazy loaded components using `FireJS.lazyLoad`. No more `FOUC`. Small bundle size with a full featured SS DOM.

## Code of conduct

Code of conduct can be found at [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Contributing

Make sure to read **Contribution Guidelines** at [CONTRIBUTING.md](CONTRIBUTING.md) before contributing.

## License & Copyright

Copyright (C) 2020 Aniket Prajapati

Licensed under the [GNU GENERAL PUBLIC LICENSE](LICENSE)

## Contributors
 + [Aniket Prajapati](https://github.com/aniketfuryrocks) @ prajapati.ani306@gmail.com , [eAdded](http://www.eadded.com)

**Note** Stable `beta` releases will be published to the `latest` channel. `nitely` channel shall be used for unstable builds.
