# Paso 5: Agregar django-webpack-loader

[Volver al paso 4](/es/step4_add_django_models)

Desafortunadamente, en este paso muchas cosas sucederán todas a la vez. Esto es
el paso donde la mayoría de la gente se rinde, porque Webpack es una herramienta
 muy grande y difícil de entender y configurar.

Vamos paso a paso.

## Antes que nada, necesitamos instalar webpack-loader:

### Instalar django-webpack-loader
```bash
# con docker
docker exec -it workshop pip install django-webpack-loader

# sin docker
pip install django-webpack-loader
```

### Actualizamos requirements

También vamos a agregararlo al `requirements.txt`.
Sugerencia: cada vez que instales algo con `pip`, ejecuta `pip freeze`
inmediatamente después y agrega los paquetes con su número de versión a `requirements.txt`.

#### Comando:
```bash
# con docker
docker exec -it workshop pip freeze > requirements.txt

# sin docker
pip freeze > requirements.txt
```

### Agregar webpack_loader a INSTALLED_APPS en Django settings
A continuación, tenemos que agregar esta aplicación a la configuración  de
`INSTALLED_APPS` en nuestro **workshop/workshop/settings.py**:

```python
INSTALLED_APPS = [
    ...
    'webpack_loader',
]
```

### Agregar carpetas con archivos estáticos
Webpack se trata de crear "paquetes" (también conocidos como archivos
minificados de JavaScript). Estos paquetes se guardarán en nuestra carpeta `static`,
como todos los archivos css y js que siempre usamos en Django.
Entonces, tenemos que hacer que Django sea consciente de estos estáticos.
Agregamos la carpeta en **workshop/workshop/settings.py**:


```python
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'links/static'),
]
```

### Instalar ReactJs y sus dependencias
Luego tenemos que crear un archivo `package.json` (en **workshop/front/package.json**),
que es similar a el archivo `requirements.txt` de Python:

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

No explicaré en detalle para qué sirve cada paquete. Descubrir lo que realmente
necesitas es una de las partes realmente difíciles al comenzar con ReactJS.
Describir las razones detrás de cada uno de estos paquetes iría
mucho más allá del alcance de este paso. Mucho de esto tiene que ver con
[Babel](http://babeljs.io), que es una herramienta que "transpila" la nueva
sintaxis de JavaScript en algo que admiten los navegadores actuales.

### Instalar nodejs, npm y yarn
```bash
# con docker
docker run -d -it --name workshopjs -v $PWD:/src -p 3000:3000 --workdir /src/workshop/front node:8 bash
docker exec -it workshopjs npm install yarn --global

# sin docker
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y build-essential nodejs
npm install yarn --global
```
Si nunca has visto el comando `yarn`, te aconsejo que leas sobre [yarn vs npm](https://medium.com/@nikjohn/facebooks-yarn-vs-npm-is-yarn-really-better-1890b3ea6515) primero.

### Instalat dependencias
Cuando haya creado el archivo **package.json**, podes instalar los paquetes:

```bash
# con docker
docker exec -it workshopjs yarn install

# sin docker
cd workshop/front
yarn install
```
Este comando creará un `yarn.lock` con todas las versiones de dependencias (similar a `requirements.txt`)
y crea una carpeta `node_modules` con las dependencias, por lo que también deberíamos agregar esa carpeta a
`.gitignore`.

### Agregar configuración de webpack
Después de ejecutar `yarn install`, deberías poder utilizar `webpack` (en teoría).
En la práctica, primero necesitas crear una configuración. Voy a adelantar un
poco y ya lo divido en dos archivos porque esto será bastante
útil más tarde. El primer archivo se llama `webpack.base.config.js` y tiene las siguientes lineas:

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

Hace muchas cosas:

1. Define el punto de entrada. Ese es el archivo JS que debe cargarse primero.
2. Define la ruta de salida. Aquí es donde queremos guardar nuestro paquete.
3. Utiliza el `CommonsChunksPlugin`, esto asegura que ReactJS será
   guardado como un archivo diferente (`vendors.js`), para que nuestro paquete de aplicaciones no se vuelve demasiado grande

El segundo archivo se llama `webpack.local.config.js` y se ve así:
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

Esto esencialmente carga la configuración base y luego le agrega algunas cosas, lo mas
notable es un plugin llamado `BundleTracker`.
Este modulo crea un archivo JSON cada vez que generamos traspilados de ReactJs.
Django puede entonces leer ese archivo JSON y sabrá qué paquete pertenece a qué
nombre en la aplicación (este tendrá más sentido más adelante).

### Agregar la configuración base para webpack local
Vamos a crear un archivo con configuración base para el webpack local,
`workshop/front/webpack.local-settings.js`  y se ve así:
```javascript
module.exports = {
  ip: '127.0.0.1',
}
```

### Agregar configuración de babel
Usaremos la sintaxis de JavaScript de ES2015 para todos nuestro códifo JavaScript.
Un complemento llamado `babel` transpilara nuevamente el código avanzado a
algo que los navegadores pueden entender. Para que esto funcione, tenemos que crear
el siguiente archivo **workshop/front/.babelrc**:

```json
{
  "presets": ["es2015", "react", "stage-0"],
  "plugins": [
    ["transform-decorators-legacy"],
  ]
}
```

## Actualizar gitignore
Y finalmente tenemos que actualizar el archivo `.gitignore` y agregarle `webpack-stats-local.json`.

## Resultado
Ahora podríamos usar `webpack` para crear un compilado, pero no hemos escrito ningún
código JavaScript o ReactJS, aún. Vamos a agregar el primer componente React en el próximo paso

[Paso 6: Crear el primer componente de React](/es/step6_create_first_react_component)
