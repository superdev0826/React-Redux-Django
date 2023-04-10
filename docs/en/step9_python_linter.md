# Step 9: Python linter

[Back to step 8](/en/step8_hot_reloading)

**Pylint** is a tool that checks for errors in Python code, tries to enforce a
coding standard and looks for code smells. It can also look for certain type errors,
it can recommend suggestions about how particular blocks can be refactored and can
offer you details about the code’s complexity.

Other similar projects would include the now defunct **pychecker**, **pyflakes**, **flake8** and **mypy**.
The default coding style used by Pylint is close to PEP 008.

Pylint will display a number of messages as it analyzes the code and it can also
be used for displaying some statistics about the number of warnings and errors found
in different files.
The messages are classified under various categories such as errors and warnings.

Last but not least, the code is given an overall mark, based on the number and severity of the warnings and errors.

## Install dependencies for pylint
Install **pylint** and **pylint-django**:
```bash
# with docker
docker exec -it workshop pip install pylint pylint-django

# without docker
pip install pylint pylint-django
```

### Create requirements-dev
We use requirements-dev because this dependencies are only development dependencies.
```bash
# with docker
docker exec -it workshop pip freeze | grep pylint > requirements-dev.txt

# without docker
pip freeze | grep pylint > requirements-dev.txt
```

## Create .pylintrc
**.pylintrc** file have all rules for **pylint**.

### Generate default rcfile
```bash
# with docker
docker exec -it workshop pylint --generate-rcfile > .pylintrc

# without docker
pylint --generate-rcfile > .pylintrc
```

### Customize our rcfile
```diff
 # Add files or directories to the blacklist. They should be base names, not
 # paths.
-ignore=CVS
+ignore=tests.py, urls.py, wsgi.py, migrations

 # Add files or directories matching the regex patterns to the blacklist. The
 # regex matches against base names, not paths.
-ignore-patterns=
+ignore-patterns=migrations
```

## Result
At this point, you can run **pylint**.

### Run pylint
```bash
# with docker
docker exec -it workshop pylint --output-format=colorized --load-plugins pylint_django workshop/workshop workshop/links

# without docker
pylint --output-format=colorized --load-plugins pylint_django workshop/workshop workshop/links
```

### Read pylint report
**pylint** command returns:
```c++
************* Module links.models
C: 11, 0: Missing class docstring (missing-docstring)
C: 25, 0: Missing class docstring (missing-docstring)
C: 41, 0: Missing class docstring (missing-docstring)
************* Module links.admin
C: 11, 0: Missing class docstring (missing-docstring)
C: 15, 0: Missing class docstring (missing-docstring)
C: 20, 0: Missing class docstring (missing-docstring)
************* Module links.views
C:  1, 0: Missing module docstring (missing-docstring)
W:  1, 0: Unused render imported from django.shortcuts (unused-import)
************* Module links.apps
C:  1, 0: Missing module docstring (missing-docstring)
C:  4, 0: Missing class docstring (missing-docstring)

------------------------------------------------------------------
Your code has been rated at 8.51/10 (previous run: 6.74/10, +1.76)
```

The message type can be:
- **R**: Refactor for a “good practice” metric violation
- **C**: Convention for coding standard violation (PEP8)
- **W**: Warning for stylistic problems, or minor programming issues
- **E**: Error for important programming issues (i.e. most probably bug)
- **F**: Fatal for errors which prevented further processing

And finally, you could fix the pylints that the linter returns us. If you want, you could see how I fix them in this commit: [Fixes](https://gitlab.com/FedeG/django-react-workshop/commit/e462a19f96b8ad44e026df84ecddaa8639b1a5a6)

[Step 10: React linter](/en/step10_react_linter)
