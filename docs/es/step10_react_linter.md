# Paso 10: React linter

[Volver al paso 9](/es/step9_python_linter)

**ESLint** es una herramienta JavaScript de código abierto creada originalmente por Nicholas C. Zakas en junio de 2013. Code linting es un tipo de análisis estático que se utiliza con frecuencia para encontrar patrones problemáticos o códigos que no se adhieren a ciertas pautas de estilo.
Existen linters de código para la mayoría de los lenguajes de programación.

JavaScript, al ser un lenguaje dinámico y poco definido, es especialmente propenso a errores de desarrollador.
Sin el beneficio de un proceso de compilación, el código JavaScript se ejecuta en orden para encontrar la sintaxis u otros errores.
Las herramientas de linting como **ESLint** permiten a los desarrolladores descubrir problemas con su código JavaScript sin ejecutarlo.

El motivo principal por el que se creó **ESLint** fue permitir a los desarrolladores crear sus propias reglas de linting.
**ESLint** está diseñado para tener todas las reglas completamente configurables.
Las reglas predeterminadas se escriben tal como lo haría cualquier otra regla de linter.
Si bien **ESLint** incluirá algunas reglas integradas para que sea útil desde el principio, podrá cargar dinámicamente las reglas en cualquier momento.

**ESLint** está escrito con **Node.js** para proporcionar un entorno de ejecución rápido y una instalación sencilla mediante **npm** o **yarn**.

## Instalar eslint

### Actualizar dependencias en package.json
Vamos a usar devDependencies porque estas dependencias son de desarrollo.
Necesitamos agregar lo siguiente en nuestro `workshop/front/package.json`:
```diff
"devDependencies": {
  "babel": "^6.23.0",
  "babel-core": "^6.26.0",
+ "babel-eslint": "^8.0.1",
  "babel-loader": "^6.4.1",
  "babel-plugin-transform-decorators-legacy": "^1.3.4",
  "babel-preset-es2015": "^6.24.1",
  "babel-preset-react": "^6.24.1",
  "babel-preset-stage-0": "^6.24.1",
  "react-test-renderer": "^16.0.0",
+ "eslint": "^4.8.0",
+ "eslint-html-reporter": "^0.5.2",
+ "eslint-import-resolver-node": "^0.3.1",
+ "eslint-plugin-import": "^2.7.0",
+ "eslint-plugin-jest": "^21.2.0",
+ "eslint-plugin-react": "^7.4.0",
  "webpack": "^1.12.13",
  "webpack-bundle-tracker": "0.0.93",
  "webpack-dev-server": "^1.14.1"
  ...
```

### Actualizar scripts de package.json
Necesitamos agregar lo siguiente en nuestro `workshop/front/package.json`:
```diff
"scripts": {
     "start": "node server.js",
-    "react-devtools": "react-devtools"
+    "react-devtools": "react-devtools",
+    "eslint": "./node_modules/.bin/eslint --ext .jsx --ext .js src",
+    "eslint-report": "./node_modules/.bin/eslint -f node_modules/eslint-html-reporter/reporter.js -o report.html --ext .jsx --ext .js src || true"
   },
```

### Instalar dependencias
```bash
# con docker
docker exec -it workshopjs yarn install

# sin docker
cd workshop/front
yarn install
```

## Crear .eslintrc.yaml
El archivo **.eslintrc.yaml** tiene todas las reglas para **eslint**.
Yo voy a subir mi **.eslintrc.yaml** (en **workshop/front/.eslintrc.yaml**) pero vos podes crearte uno con:
- [generador](http://rapilabs.github.io/eslintrc-generator/)
- o crear **.eslintrc.yaml** con el comando **eslint**:

```bash
# con docker
docker exec -it workshopjs ./node_modules/.bin/eslint --init

# sin docker
cd workshop/front
./node_modules/.bin/eslint --init
```

## Actualizar gitignore
Y finalmente vamos a actualizar el archivo `.gitignore` y agregar `workshop/front/report.html`.

## Resultado
En este punto, podes ejecutar **eslint**.

### Ejecutar eslint con reporte en consola
```bash
# con docker
docker exec -it workshopjs npm run eslint

# sin docker
cd workshop/front
npm run eslint
```

#### Leer reporte en consola de eslint
El comando **eslint** retorna:
```javascript
/src/workshop/front/src/components/App/index.jsx
  1:19  error  Strings must use singlequote  quotes
  3:22  error  Strings must use singlequote  quotes

/src/workshop/front/src/components/Headline/index.js
  1:19  error  Strings must use singlequote               quotes
  6:24  error  'children' is missing in props validation  react/prop-types

/src/workshop/front/src/containers/App.jsx
  1:19  error  Strings must use singlequote  quotes
  3:26  error  Strings must use singlequote  quotes

/src/workshop/front/src/views/App.jsx
  1:19  error  Strings must use singlequote  quotes
  2:24  error  Strings must use singlequote  quotes

✖ 8 problems (8 errors, 0 warnings)
  7 errors, 0 warnings potentially fixable with the `--fix` option.
```

### Corrección automática de errores
**Eslint** tiene una función que arregle automaticamente algunos errores
```bash
# con docker
docker exec -it workshopjs ./node_modules/.bin/eslint --ext .jsx --ext .js src --fix

# sin docker
cd workshop/front
./node_modules/.bin/eslint --ext .jsx --ext .js src --fix
```

#### Leer reporte en consola de eslint despues de **--fix**
El comando **eslint** retorna:
```javascript
/src/workshop/front/src/components/Headline/index.js
  6:24  error  'children' is missing in props validation  react/prop-types

✖ 1 problems (1 errors, 0 warnings)
```

### Ejecutar eslint con reporte html
```bash
# con docker
docker exec -it workshopjs npm run eslint-report

# sin docker
cd workshop/front
npm run eslint-report
```

#### Leer reporte html de eslint
Abri **workshop/front/report.html** en tu navegador.

Y finalmente, podrías arreglar los eslints que el linter nos devuelve.
Si quieres, podrías ver cómo los soluciono en este commit: [correcciones](https://gitlab.com/FedeG/django-react-workshop/commit/375ac6c510708e44b51a6606d93f4e1efbd152e0)

[Paso 11: Python testing](/es/step11_python_testing)
