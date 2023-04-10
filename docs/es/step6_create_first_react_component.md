# Paso 6: Crear la primer componente de React

[Volver al paso 5](/es/step5_add_django_webpack_loader)

## Conceptos de React que vamos a usar en este paso
Si nunca has visto estos conceptos, puedes tomarse tu tiempo y leer sobre ellos accediendo a los enlaces.
Usaremos:
- Componentes de presentación y contenedores: [presentational vs container components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
- Composición: [composition vs inheritance](https://reactjs.org/docs/composition-vs-inheritance.html)
- Jsx: [introducing jsx](https://reactjs.org/docs/introducing-jsx.html) and [jsx in depth](https://reactjs.org/docs/jsx-in-depth.html)
- Children prop: [this.props.children](https://learn.co/lessons/react-this-props-children)

## Crear una vista
Primero, creamos una vista en la carpeta `src/views` (en `workshop/front/src/views`) y
agregamos el archivo `App.jsx` adentro. Este va a ser uno de nuestros puntos de entrada para **webpack**.
**webpack** buscará ese archivo, luego seguirá todas sus importaciones y las agregará
al paquete, para que al final tengamos un gran archivo `App.jsx` que pueda ser utilizado por el navegador.

```javascript
import React from "react"
import { render } from "react-dom"
import App from '../containers/App'

render(<App/>, document.getElementById('app'))
```

## Crear un contenedor
Después, creamos una carpeta `src/containers` (en `workshop/front/src/containers`) y
agreguamos el archivo `App.jsx` adentro. Este es el primer componente de React,
en su interior tendrá una función de renderizado con el componente de presentación **App**.

```javascript
import React from "react"

import AppComponent from "../components/App"

export default class App extends React.Component {
  render() {
    return (
      <AppComponent />
    )
  }
}
```

## Crear una componente
Como podes ver, **App** intenta importar otra componente llamada `AppComponent`.
Ahora vamos a crear el archivo que intenta importar, `workshop/front/src/components/App/index.jsx`:

```javascript
import React from "react"

import Headline from "../Headline"

export default class App extends React.Component {
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <Headline>Sample App!</Headline>
          </div>
        </div>
      </div>
    )
  }
}
```

## Agregar sub-componente
Y otra vez, esa componente importa otra componente llamada `Headline`.
Vamos a crearla en `workshop/front/src/components/Headline/index.jsx`:

```javascript
import React from "react"

export default class Headline extends React.Component {
  render() {
    return (
      <h1>{ this.props.children }</h1>
    )
  }
}
```

## Agregar la vista App a las entidades de webpack

En `workshop/front/webpack.base.config.js`:
```diff
entry: {
  // Add as many entry points as you have container-react-components here
+ App: ['./src/views/App'],
  vendors: ['react', 'babel-polyfill'],
},
```

En `workshop/front/webpack.local.config.js`:
```diff
// Use webpack dev server
config.entry = {
+ App: ['./src/views/App'],
  vendors: ['react', 'babel-polyfill'],
}
```

## Actualizar gitignore
Y finalmente debemos actualizar el archivo `.gitignore` y agregarle el archivo `workshop/front/workshop/static/`.

## Resultado
Puede que te preguntes por qué estoy usando la componente `App` (container) y otra
`AppComponent`. Esto tendrá más sentido en posteriores pasos. Usaremos `Redux` para administrar el estado de nuestra aplicación y veremos que Redux
requiere varias configuraciones para envolver su aplicación y manejar sus estados.
Para mantener mis archivos más limpios, me gusta tener un archivo contenedor, que luego
importa el componente real de ReactJS que quiero construir.

También notarás que separé mis componentes en una carpeta `containers`
y en una carpeta `components`. Puedes pensar en esto un poco como las vistas de Django.
La template principal es tu contenedor. Contiene la estructura general y dependencias para tu página. En la carpeta `componentes` tendremos mucho
componentes más pequeñas que hacen una unica cosa. Estos componentes serán
reutilizados y orquestados por `containers`, por ende las componentes serían las
equivalentes a las templates parciales más pequeñas que usted importa en Django usando el
etiqueta `{% import %}`.

En este punto puedes ejecutar el build:
```bash
# con docker
docker exec -it workshopjs ./node_modules/.bin/webpack --config webpack.local.config.js

# sin docker
cd front/src
./node_modules/.bin/webpack --config webpack.local.config.js
```

Y esto debe generar algunos archivos en `workshop/front/workshop/static/bundles/`.

[Paso 7: Usar el paquete](/es/step7_use_the_bundle)
