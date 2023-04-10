# Step 7: Use the bundle

[Back to step 6](/en/step6_create_first_react_component)

In the last step we have create our first bundle, but we haven't seen the result
in the browser. Let's update our template to use our fancy new ReactJS app now.

## Update template view1
Change `workshop/links/templates/view1.html` so that it looks like this:

```html
{% extends "base.html" %}
{% load render_bundle from webpack_loader %}

{% block main %}
  <div id="app"></div>

  {% render_bundle 'vendors' %}
  {% render_bundle 'App' %}
{% endblock %}
```

## Update Django settings

### Add WEBPACK_LOADER settings
In `workshop/workshop/settings.py`:
```python
WEBPACK_LOADER = {
    'DEFAULT': {
        'BUNDLE_DIR_NAME': 'bundles/local/',  # end with slash
        'STATS_FILE': os.path.join(BASE_DIR, 'front/webpack-stats-local.json'),
    }
}
```

#### Notes:
- `BUNDLE_DIR_NAME` tells Django in which folder within the `static` folder it
can find our bundle.
- `STATS_FILE` tells Django where it can find the JSON-file that maps entry-point
names to bundle files. It is because of this stats file that we can use
`{% render_bundle 'App' %}` in our template. You will also find this `App`
name in your `webpack.base.config.js` file under the `entry` attribute.

### Add STATIC_ROOT and update STATICFILES_DIRS
```diff
STATIC_URL = '/static/'
+STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'links/static'),
+   os.path.join(BASE_DIR, 'front/workshop/static'),
]
```

## Change webpack publicpath
Change publicpath in **workshop/front/webpack.local.config.js**:
```diff
// override django's STATIC_URL for webpack bundles
-config.output.publicPath = `http://${ip}:${port}/assets/bundles/`
+config.output.publicPath = `/static/bundles/local/`
```

## Build the packages
```bash
# with docker
docker exec -it workshopjs node_modules/.bin/webpack --config webpack.local.config.js

# without docker
cd workshop/front
node_modules/.bin/webpack --config webpack.local.config.js
```

## Collect static files in Django
```bash
mkdir workshop/links/static
# with docker
docker exec -it workshop ./workshop/manage.py collectstatic

# without docker
./workshop/manage.py collectstatic
```

## Update gitignore
And finally we should update `.gitignore` file and add `workshop/static/`.

## Result
At this point, you can run project.

### Run project
```
# with docker
docker exec -it workshop ./workshop/manage.py runserver 0.0.0.0:8000

# without docker
./workshop/manage.py runserver
```

You should see the React App page in your browser at `http://localhost:8000/`.

Now try to make a change to your ReactJS app. Change `Sample App!` to
`Something New!` in `workshop/front/src/components/App/index.jsx`.

Then run build and collectstatic again, make sure that runserver is still running and visit your site
in the browser. It should say "Something New!" now.

Amazing, right?
We will add hot reloading for this case in next step.

[Step 8: Hot Reloading](/en/step8_hot_reloading)
