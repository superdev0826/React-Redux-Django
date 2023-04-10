# Step 5: Add django-webpack-loader

[Back to step 4](/en/step4_add_django_models)

Unfortunately, in this step a lot of stuff will happen all at once. This is
the step where most people give up, because Webpack is one monster of a tool
and super hard to understand and to configure.

Let's try to walk through this step by step.

## First of all we need to install webpack-loader:

### Install django-webpack-loader
```bash
# with docker
docker exec -it workshop pip install django-webpack-loader

# without docker
pip install django-webpack-loader
```

### Update requirements
we will also add it to `requirements.txt`. Tip: Whenever you install something
with `pip`, run `pip freeze` immediately after and copy and paste that package
with it's version number into your `requirements.txt`.

#### Command:
```bash
# with docker
docker exec -it workshop pip freeze > requirements.txt

# without docker
pip freeze > requirements.txt
```

### Add webpack_loader to Django INSTALLED_APPS
Next we need to add this reusable Django app to the `INSTALLED_APPS` setting
in our **workshop/workshop/settings.py**:

```python
INSTALLED_APPS = [
    ...
    'webpack_loader',
]
```

### Add static folders
Webpack is all about creating "bundles" (aka minified JavaScript files). These
bundles will be saved in our `static` folder, just like we always used to do it
with our CSS and JS files. So we need to make Django aware of this `static`
folder in **workshop/workshop/settings.py**:

```python
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'links/static'),
]
```

### Install ReactJs and ReactJs dependencies
Next we need to create a `package.json` file (in **workshop/front/package.json**), which is something similar to
Python's `requirements.txt` file:

```json
{
  "name": "links",
  "version": "0.0.1",
  "scripts": {
    "start": "node server.js",
    "react-devtools": "react-devtools"
  },
  "devDependencies": {
    "babel": "^6.23.0",
    "babel-core": "^6.26.0",
    "babel-loader": "^6.4.1",
    "babel-plugin-transform-decorators-legacy": "^1.3.4",
    "babel-preset-es2015": "^6.24.1",
    "babel-preset-react": "^6.24.1",
    "babel-preset-stage-0": "^6.24.1",
    "react-test-renderer": "^16.0.0",
    "webpack": "^1.12.13",
    "webpack-bundle-tracker": "0.0.93",
    "webpack-dev-server": "^1.14.1"
  },
  "dependencies": {
    "babel-polyfill": "^6.26.0",
    "es6-promise": "^4.1.1",
    "isomorphic-fetch": "^2.2.1",
    "js-cookie": "^2.1.4",
    "lodash": "^4.17.4",
    "prop-types": "^15.6.0",
    "radium": "^0.19.4",
    "raf": "^3.4.0",
    "react": "^16.0.0",
    "react-cookie": "^2.1.1",
    "react-dom": "^16.0.0",
    "react-websocket": "^1.2.0"
  }
}
```

I won't explain in detail what each package is good for. Finding out what you
really need is essentially one of the really hard parts when starting out
with ReactJS. Describing the reasons behind each of these packages would go
far beyond the scope of this quick tutorial. A lot of this stuff has to do with
[Babel](http://babeljs.io), which is a tool that "transpiles" cutting edge
JavaScript syntax into something that browsers support.

### Install nodejs, npm and yarn
```bash
# with docker
docker run -d -it --name workshopjs -v $PWD:/src -p 3000:3000 --workdir /src/workshop/front node:8 bash
docker exec -it workshopjs npm install yarn --global

# without docker
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y build-essential nodejs
npm install yarn --global
```
If you have never seen the `yarn` command, you could take some time
and read about [yarn vs npm](https://medium.com/@nikjohn/facebooks-yarn-vs-npm-is-yarn-really-better-1890b3ea6515) first.


### Install dependencies
When you have created the file, you can install the packages:

```bash
# with docker
docker exec -it workshopjs yarn install

# without docker
cd workshop/front
yarn install
```
This command will create a `yarn.lock` with all dependencies versions (similar to `requirements.txt`)
and create a `node_modules` folder, so we should also add that folder to
`.gitignore`.

### Add webpack configuration
After you ran `yarn install`, you should be able to use `webpack` (in theory).
In praxis, you need to create quite a monstrous config first. I will cheat a
little bit and already split it into two files because that will be quite
helpful later. The first file is called `webpack.base.config.js` and looks
like this:

```javascript
const path = require('path')
const webpack = require('webpack')

module.exports = {
  context: __dirname,

  entry: {
    // Add as many entry points as you have container-react-components here
    vendors: ['react', 'babel-polyfill'],
  },

  output: {
      path: path.resolve('./workshop/static/bundles/local/'),
      filename: '[name]-[hash].js'
  },

  externals: [
  ], // add all vendor libs

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
  ], // add all common plugins here

  module: {
    loaders: [] // add all common loaders here
  },

  resolve: {
    modulesDirectories: ['node_modules', 'bower_components'],
    extensions: ['', '.js', '.jsx']
  },
}
```

It does a lot of things:

1. It defines the entry point. That is the JS-file that should be loaded first
2. It defines the output path. This is where we want to save our bundle.
3. It uses the `CommonsChunksPlugin`, this makes sure that ReactJS will be
   saved as a different file (`vendors.js`), so that our actual app-bundle
   doesn't become too big.

The second file is called `webpack.local.config.js` and looks like this:

```javascript
const webpack = require('webpack')
const BundleTracker = require('webpack-bundle-tracker')

const config = require('./webpack.base.config.js')
const localSettings = require('./webpack.local-settings.js')

const port = 3000
const ip = localSettings.ip

const addDevVendors = (module) => [
  `webpack-dev-server/client?http://${ip}:${port}`,
  'webpack/hot/only-dev-server',
  module
];

config.devtool = "#eval-source-map"
config.ip = ip

// Use webpack dev server
config.entry = {
  vendors: ['react', 'babel-polyfill'],
}

// override django's STATIC_URL for webpack bundles
config.output.publicPath = `http://${ip}:${port}/assets/bundles/`

// Add HotModuleReplacementPlugin and BundleTracker plugins
config.plugins = config.plugins.concat([
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin(),
  new BundleTracker({filename: './webpack-stats-local.json'}),
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('development')
    }
  }),

])

// Add a loader for JSX files
config.module.loaders.push(
  { test: /\.jsx?$/, exclude: /node_modules/, loaders: ['babel'] }
)

module.exports = config
```

This essentially loads the base config and then adds a few things to it, most
notably one more plugin: The `BundleTracker` plugin.
This plugin creates a JSON file every time we generate bundles. Django can then
read that JSON file and will know which bundle belongs to which App-name (this
  will make more sense later).

### Add default webpack settings
We will create a file with base configuration for the local webpack setting,
`workshop/front/webpack.local-settings.js` and looks like this:
```javascript
module.exports = {
  ip: '127.0.0.1',
}
```

### Add babel configuration
We will be using bleeding edge ES2015 JavaScript syntax for all our JavaScript
code. A plugin called `babel` will "transpile" the advanced code back into
something that browsers can understand. For this to work, we need to create
the following `workshop/front/.babelrc` file:

```json
{
  "presets": ["es2015", "react", "stage-0"],
  "plugins": [
    ["transform-decorators-legacy"],
  ]
}
```

## Update gitignore
And finally we should update `.gitignore` file and add `webpack-stats-local.json` file.

## Result
Now we could use `webpack` to create a bundle, but we haven't written any
JavaScript or ReactJS code, yet. We will add the first React component in next step

[Step 6: Create first React component](/en/step6_create_first_react_component)
