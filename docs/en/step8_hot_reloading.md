# Step 8: Hot Reloading

[Back to step 7](/en/step7_use_the_bundle)

Step 7 was nice and awesome, but not mind-blowing. Let's do mind-blowing now.
We don't really want to run that `webpack` command every time we change our
ReactJS app (and create thousands of local bundles in the process). We want to
see the changes in the browser immediately.

## Add javascript dev server
First, we need a `server.js` (in `workshop/front/server.js`) file that will start a webpack-dev-server for us:

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

## Convert webpack local to development webpack settings
Next, we need to replace the following in our `webpack.local.config.js`:

```javascript
-  App: ['./src/views/App'],
+  App: addDevVendors('./src/views/App')

-config.output.publicPath = `/static/bundles/local/`
+config.output.publicPath = `http://${ip}:${port}/assets/bundles/`
```

## Accept hot reloading in view
We will add this line in `workshop/front/src/views/App.jsx`:
```javascript
if (module.hot) module.hot.accept();
```

## Result
Ready?

### Run webpack dev server
In one terminal window, start the webpack-dev-server with:
```javascript
# npm start is equal to node server.js

# with docker
docker exec -it workshopjs npm start

# without docker
cd workshop/front
npm start
```

### Run Django dev server
In another terminal window, start the Django dev server:
```
# with docker
docker exec -it workshop ./workshop/manage.py runserver 0.0.0.0:8000

# without docker
./workshop/manage.py runserver
```

Make sure that you can still see "Something New!" in `http://localhost:8000/links/`.

And now change it to `Sample App!` in `workshop/front/src/components/App/index.jsx` and
switch back to your browser. If you are very fast, you can see how it updates
itself.

There is another cool thing: When you open the site in Google Chrome and open
the developer tools with `COMMAND+OPTION+i` and then open the `Sources` tab,
you can see `webpack://` in the sidebar. It has a folder called `.` where you
will find the original ReactJS sources. You can even put breakpoints here and
debug your app like a pro. No more `console.log()` in your JavaScript code.

[Step 9: Python linter](/en/step9_python_linter)
