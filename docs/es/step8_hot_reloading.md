# Paso 8: Recarga automática

[Volver al paso 7](/es/step7_use_the_bundle)

El paso 7 fue interesante e impresionante, pero no alucinante. Hagámoslo alucinante ahora.
Realmente no queremos ejecutar el comando `webpack` cada vez que cambiamos código de
ReactJS (y crear miles de paquetes locales en el proceso).
Queremos ver los cambios en el navegador de inmediato.

## Agregar servidor de desarrollo para React
Primero, necesitamos un archivo `server.js` (en `workshop/front/server.js`) que iniciará un webpack-dev-server para nosotros:
```javascript
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const config = require('./webpack.local.config')
const host = '0.0.0.0'
const port = 3000

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  inline: true,
  historyApiFallback: true,
  headers: { 'Access-Control-Allow-Origin': '*' }
}).listen(port, host, (err) => {
  if (err) console.log(err);
  console.log(`Listening at ${host}:${port}`);
})
```

## Convierte el webpack local a la configuración del webpack de desarrollo
A continuación, debemos reemplazar lo siguiente en nuestro `webpack.local.config.js`:
```javascript
-  App: ['./src/views/App'],
+  App: addDevVendors('./src/views/App')

-config.output.publicPath = `/static/bundles/local/`
+config.output.publicPath = `http://${ip}:${port}/assets/bundles/`
```

## Aceptar la recarga automática a la vista
Añadiremos esta línea en `workshop/front/src/views/App.jsx`:
```javascript
if (module.hot) module.hot.accept();
```

## Resultado
Listo?

### Ejecutar servidor desarrollo de webpack
En una terminal, iniciaremos el servidor de desarrollo de webpack con:
```javascript
# npm start es igual a node server.js

# con docker
docker exec -it workshopjs npm start

# sin docker
cd workshop/front
npm start
```

### Ejecute el servidor Django Dev
En otra ventana de terminal, inicie el servidor de desarrollo de Django:
```
# con docker
docker exec -it workshop ./workshop/manage.py runserver 0.0.0.0:8000

# sin docker
./workshop/manage.py runserver
```

Asegúrate de que aún puedas ver "Something New!" in `http://localhost:8000/links/`.

Y ahora cámbialo a `Sample App!` en `workshop/front/src/components/App/index.jsx` y
vuelve a tu navegador.
Si eres muy rápido, puedes ver cómo se actualiza automática.

Hay otra cosa interesante: si abrís el sitio en Google Chrome, abrís
las herramientas de desarrollador con `COMMAND + OPTION + i` y luego abrir la pestaña `Sources`,
puedes ver `webpack://` en la barra lateral.
Tiene una carpeta llamada `.` donde estan las fuentes originales de ReactJS.
Incluso puedes poner puntos de interrupción aquí y depurar su aplicación como un profesional.
No más `console.log()` en tu código JavaScript.

[Paso 9: Python linter](/es/step9_python_linter)
