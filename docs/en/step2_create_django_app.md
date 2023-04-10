# Step 2: Create your Django app

[Back to Step 1](/en/step1_create_project)

## Create django app
Let's just create a new app:

```bash
# with docker
docker exec -it workshop bash -c "cd workshop && ./manage.py startapp links"

# without docker
cd workshop
./manage.py startapp links
```
This creates a new Django app in Django project folder (__./workshop/links__).

## Add new aplication to INSTALLED_APPS:
Add application name (`links`) to **INSTALLED_APPS** in __./workshop/workshop/settings.py__.

## Add django admin

### Create db with initial state (migrate django auth models)
Let's just migrate db:
```bash
# with docker
docker exec -it workshop ./workshop/manage.py migrate

# without docker
./workshop/manage.py migrate
```

### Add admin user
Let's just create super user:
```bash
# with docker
docker exec -it workshop ./workshop/manage.py createsuperuser

# without docker
./workshop/manage.py createsuperuser
```

## Result
At this point, you can run project.

### Run project
```
# with docker
docker exec -it workshop ./workshop/manage.py runserver 0.0.0.0:8000

# without docker
./workshop/manage.py runserver
```

You should see the Django admin page in your browser at `http://localhost:8000/admin/`.

[Step 3: Add non-React views](/en/step3_add_non_react_views)

