# Step 1: Create your Django project

[Back to master branch](/en/master)

## Create django project
Since we don't have a project at hand, let's just create a new one:

```bash
docker run -d -it --name workshop -v $PWD:/src -p 8000:8000 --workdir /src python:3.6 bash
docker exec -it workshop bash

# within docker container
pip install Django
django-admin startproject workshop
```
If you have never seen this `docker` command, you should take some time
and learn about [docker](https://docs.docker.com) first.

Option without `docker` (with `mkvirtualenv`):
```bash
mkvirtualenv djreact
pip install Django
django-admin startproject workshop
```
If you have never seen this `mkvirtualenv` command, you could take some time
and learn about [virtualenvwrapper](http://virtualenvwrapper.readthedocs.org/en/latest/) first.

This creates a new Django project in the root folder of your repository.

## Add requirements
You also want to create a `requirements.txt`:
```bash
# with docker
docker exec -it workshop pip freeze > requirements.txt

# without docker
pip freeze > requirements.txt
```
If you have never used a `requirements.txt` file, have a look at the
[pip documentation](https://pip.readthedocs.org/en/1.1/requirements.html).

## Add gitignore
And finally we should create a `.gitignore` file and add `*.pyc` files and
`db.sqlite3`.

## Result
At this point, you can run project.

### Run project
```
# with docker
docker exec -it workshop ./workshop/manage.py runserver 0.0.0.0:8000

# without docker
./workshop/manage.py runserver
```

You should see the Django welcome page in your browser at `http://localhost:8000/`.

[Step 2: Create Django app](/en/step2_create_django_app)
