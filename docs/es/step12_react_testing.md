# Paso 12: React testing

[Volver al paso 11](/es/step11_python_testing)

## Framework de tests:
- [Jest](https://facebook.github.io/jest/).
- [Enzyme](http://airbnb.io/enzyme/).

## Instalar jest y enzyme

### Actualizar dependencias en el package.json
Usamos devDependencies porque estas dependencias porque son dependencias de desarrollo.
Necesitamos agregar lo siguiente en nuestro `workshop/front/package.json`:
```diff
"devDependencies": {
  "babel": "^6.23.0",
  "babel-core": "^6.26.0",
  "babel-eslint": "^8.0.1",
+ "babel-jest": "^21.2.0",
  "babel-loader": "^6.4.1",
  "babel-plugin-transform-decorators-legacy": "^1.3.4",
  "babel-preset-es2015": "^6.24.1",
  "babel-preset-react": "^6.24.1",
  "babel-preset-stage-0": "^6.24.1",
+ "enzyme": "^3.1.0",
+ "enzyme-adapter-react-16": "^1.0.1",
  "react-test-renderer": "^16.0.0",
  "eslint": "^4.8.0",
  "eslint-html-reporter": "^0.5.2",
  ...
  "eslint-plugin-import": "^2.7.0",
  "eslint-plugin-jest": "^21.2.0",
  "eslint-plugin-react": "^7.4.0",
+ "jest": "^21.2.1",
  "webpack": "^1.12.13",
  "webpack-bundle-tracker": "0.0.93",
  "webpack-dev-server": "^1.14.1"
  ...
  "babel-polyfill": "^6.26.0",
  "es6-promise": "^4.1.1",
  "isomorphic-fetch": "^2.2.1",
+ "jest-cli": "^21.2.1",
  "js-cookie": "^2.1.4",
  "lodash": "^4.17.4",
  "prop-types": "^15.6.0",
  ...
```

### Actualizar scripts del package.json
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

### Actualizar package.json con la configuración de jest
Necesitamos agregar lo siguiente en nuestro `workshop/front/package.json`:
```diff
+  "jest": {
+    "globals": {
+      "__PLATFORM__": "test"
+    },
+    "setupFiles": [
+      "raf/polyfill"
+    ],
+    "setupTestFrameworkScriptFile": "<rootDir>/jest-setup.js",
+    "modulePaths": [
+      "node_modules",
+      "src"
+    ],
+    "clearMocks": true,
+    "verbose": true,
+    "coverageReporters": [
+      "html",
+      "text",
+      "text-summary"
+    ],
+    "transform": {
+      "^.+\\.jsx?$": "babel-jest"
+    },
+    "moduleFileExtensions": [
+      "js",
+      "jsx",
+      "json",
+      "es6"
+    ],
+    "unmockedModulePathPatterns": [
+      "<rootDir>/node_modules/timeout-transition-group",
+      "<rootDir>/node_modules/expect",
+      "<rootDir>/node_modules/classnames",
+      "<rootDir>/node_modules/sinon",
+      "<rootDir>/node_modules/redux",
+      "<rootDir>/node_modules/redux-thunk",
+      "<rootDir>/node_modules/react",
+      "<rootDir>/node_modules/react-tools",
+      "<rootDir>/node_modules/react-devtools",
+      "react",
+      "enzyme",
+      "jest-enzyme"
+    ],
+    "modulePathIgnorePatterns": [
+      "/node_modules/",
+      "jest-setup.js"
+    ],
+    "collectCoverageFrom": [
+      "src/components/**/*.{js,jsx}",
+      "src/containers/**/*.{js,jsx}"
+    ]
+   }
```

### Instalar las dependencias
```bash
# con docker
docker exec -it workshopjs yarn install

# sin docker
cd workshop/front
yarn install
```

## Crear el script de configuración de jest
**jest-setup.js** (en **workshop/front/jest-setup.js**) es el script de configuración de **jest**.

```javascript
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

global.gettext = jest.fn(text => text)
global.$ = jest.fn()
```

## Crear tests

### Crear tests para la componente Headline
En **workshop/front/src/components/Headline/Headline.spec.jsx**:
```javascript
import React from 'react';
import Headline from './index.js';
import { shallow } from 'enzyme';

describe('Headline Component', () => {

  describe('props', () => {

    it('should declare propsTypes', () => {
      expect(Object.keys(Headline.propTypes)).toHaveLength(1);
      expect(Headline.propTypes).toHaveProperty('children');
    })

  })

  describe('render', () => {

    it('should render the component properly', () => {
      const wrapper = shallow(<Headline>Sample App!</Headline>);
      const componentInDOM = '<h1>Sample App!</h1>';
      expect(wrapper.html()).toBe(componentInDOM);
    })

  })

})
```

### Crear tests para la componente App
En **workshop/front/src/components/App/App.spec.jsx**:
```javascript
import React from 'react';
import App from './index.jsx';
import { shallow } from 'enzyme';

describe('App Component', () => {

  describe('#render', () => {

    it('should render the component properly', () => {
      const wrapper = shallow(<App/>);
      const componentInDOM = '<div class="container"><div class="row"><div class="col-sm-12"><h1>Sample App!</h1></div></div></div>';
      expect(wrapper.html()).toBe(componentInDOM);
    })

  })

})
```

### Crear tests para el container App
En **workshop/front/src/containers/App.spec.jsx**:
```javascript
import React from 'react';
import App from './App.jsx';
import { shallow } from 'enzyme';

describe('App Component', () => {

  describe('#render', () => {

    it('should render the component properly', () => {
      const wrapper = shallow(<App/>);
      const componentInDOM = '<div class="container"><div class="row"><div class="col-sm-12"><h1>Sample App!</h1></div></div></div>';
      expect(wrapper.html()).toBe(componentInDOM);
    })

  })

})
```

## Actualizar gitignore
Y finalmente tenemos que actualizar el archivo `.gitignore` y agregarle `coverage/` y `jest_*`.

## Resultado
En este punto, ya podemos ejecutar **jest** y leer el reporte de cobertura.

### Ejectutar jest
```bash
# con docker
docker exec -it workshopjs npm test

# sin docker
cd workshop/front
npm test
```

### Leer el reporte de jest
El comando **jest** nos retornar:
```c++
npm info it worked if it ends with ok
npm info using npm@5.4.2
npm info using node@v8.7.0
npm info lifecycle links@0.0.1~pretest: links@0.0.1
npm info lifecycle links@0.0.1~test: links@0.0.1

> links@0.0.1 test /src/workshop/front
> jest --forceExit --ci --coverage

 PASS  src/components/Headline/Headline.spec.jsx
  Headline Component
    props
      ✓ should declare propsTypes (4ms)
    render
      ✓ should render the component properly (7ms)

 PASS  src/components/App/App.spec.jsx
  App Component
    #render
      ✓ should render the component properly (12ms)

 PASS  src/containers/App.spec.jsx
  App Component
    #render
      ✓ should render the component properly (10ms)

Test Suites: 3 passed, 3 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        2.148s
Ran all test suites.
---------------------|----------|----------|----------|----------|----------------|
File                 |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
---------------------|----------|----------|----------|----------|----------------|
All files            |      100 |      100 |      100 |      100 |                |
 components/App      |      100 |      100 |      100 |      100 |                |
  index.jsx          |      100 |      100 |      100 |      100 |                |
 components/Headline |      100 |      100 |      100 |      100 |                |
  index.js           |      100 |      100 |      100 |      100 |                |
 containers          |      100 |      100 |      100 |      100 |                |
  App.jsx            |      100 |      100 |      100 |      100 |                |
---------------------|----------|----------|----------|----------|----------------|

=============================== Coverage summary ===============================
Statements   : 100% ( 3/3 )
Branches     : 100% ( 0/0 )
Functions    : 100% ( 3/3 )
Lines        : 100% ( 3/3 )
================================================================================
npm info lifecycle links@0.0.1~posttest: links@0.0.1
npm info ok
```

### Leer el reporte html de jest
Abri `workshop/front/coverage/index.html` en tu navegador.

[Paso 13: Agregar contexto de Django a React](/es/step13_django_context_in_react)
