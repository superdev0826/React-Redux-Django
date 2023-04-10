# Step 6: Create first react component

[Back to step 5](/en/step5_add_django_webpack_loader)

## React concepts used in this step
If you have never seen these concepts, you could take some time and read about these in the links.
I will use:
- Presentational and container components: [presentational vs container components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
- Composition: [composition vs inheritance](https://reactjs.org/docs/composition-vs-inheritance.html)
- Jsx: [introducing jsx](https://reactjs.org/docs/introducing-jsx.html) and [jsx in depth](https://reactjs.org/docs/jsx-in-depth.html)
- Children prop: [this.props.children](https://learn.co/lessons/react-this-props-children)

## Create a view
First, create a `src/views` (in `workshop/front/src/views`) folder and
put a `App.jsx` file inside. This is going to be one of our entry-points for bundling.
`webpack` will look into that file and then follow all it's imports and add them
to the bundle, so that in the end we will have one big `App.jsx` file that can be used by the browser.

```javascript
import React from "react"
import { render } from "react-dom"
import App from '../containers/App'

render(<App/>, document.getElementById('app'))
```

## Create a container
After, create a `src/containers` (in `workshop/front/src/containers`) folder and
put a `App.jsx` file inside. This is the first React component, inside will have render function with **App** presentational component.

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

## Create a component
As you can see, **App** tries to import another component called
`AppComponent`. So let's create that one as well in the file
`workshop/front/src/components/App/index.jsx`:

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

## Add sub-component
And once again, that component imports another component called `Headline`.
Let's create that one as well in `workshop/front/src/components/Headline/index.jsx`:

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

## Add App to webpack entries

In `workshop/front/webpack.base.config.js`:
```diff
entry: {
  // Add as many entry points as you have container-react-components here
+ App: ['./src/views/App'],
  vendors: ['react', 'babel-polyfill'],
},
```

In `workshop/front/webpack.local.config.js`:
```diff
// Use webpack dev server
config.entry = {
+ App: ['./src/views/App'],
  vendors: ['react', 'babel-polyfill'],
}
```

## Update gitignore
And finally we should update `.gitignore` file and add `workshop/front/workshop/static/` file.

## Result
You might wonder why I am using a component `App` and another one
`AppComponent`. This will make more sense a bit later. We will be using
something called `Redux` to manage our app's state and you will see that Redux
requires quite a lot of boilerplate to be wrapped around your app. To keep my
files cleaner, I like to have one "boilerplate" file, which then imports the
actual ReactJS component that I want to build.

You will also notice that I separate my components into a `containers` folder
and into a `components` folder. You can think about this a bit like Django
views. The main view template is your container. It contains the general
structure and markup for your page. In the `components` we will have much
smaller components that do one thing and one thing well. These components will
be re-used and orchestrated by all our `container` components, they would be the
equivalent of smaller partial templates that you import in Django using the
`{% import %}` tag.

At this point you can run build:
```bash
# with docker
docker exec -it workshopjs ./node_modules/.bin/webpack --config webpack.local.config.js

# without docker
cd front/src
./node_modules/.bin/webpack --config webpack.local.config.js
```

and it should generate some files in `workshop/front/workshop/static/bundles/`.

[Step 7: Use the bundle](/en/step7_use_the_bundle)
