---
layout: post
section-type: post
title: Como usar cualquier plugin de Jekyll con Github Pages
date:   2019-03-20 13:00:00 +0100
categories: jekyll
language: es
locale: 'es'
permalink: "/:language/:year/:month/:day/jekyll-plugin-issue-with-github-pages.html"
---

## ¿Problemas con los plugins de Jekyll en Github Pages?

Para este blog, sabía que quería poder personalizarlo y no quería aprender a personalizar los temas de WordPress. La idea de utilizar un generador de sitio estático como [Jekyll](https://jekyllrb.com) me atraía porque no tendría que tratar con una base de datos. Además, dado que [GitHub Pages](https://pages.github.com) aloja y crea automáticamente los sitios Jekyll, no tendría que lidiar con el hosting. Fui a instalar Jekyll localmente, creé un sitio de blog de inicio y envié mis cambios a GitHub. ¡[z3nth10n.github.io](/) estaba en funcionamiento!

Luego quise insertar un enlace de YouTube en la página principal del blog. @joelverhagen publicó un [gist](https://gist.github.com/joelverhagen/1805814) de Jekyll YouTube Embed Plugin. Lo probé localmente y generó la publicación del blog y el sitio bien. Pero cuando GitHub Pages trató de construir los archivos html estáticos, falló con un mensaje de error `Liquid Exception: Unknown tag 'youtube'`.

Aparentemente y de manera comprensible, GitHub Pages no permite ningún complemento arbitrario como parte de su proceso de compilación Jekyll; específicamente, `bundle exec jekyll build —safe` se ejecuta. En su lugar, GitHub Pages incluye un conjunto limitado de complementos Jekyll enumerados [aquí](https://pages.github.com/versions/), solo 47 en el momento de escribir este artículo. Por lo tanto, si desea usar un complemento que aún no está oficialmente soportado, tendrá que pedirle a GitHub que lo agregue. Aquí hay un [ejemplo](https://github.com/jekyll/jekyll/issues/325): "Por favor, agregue el complemento jekyll-asciidoc a la lista blanca". [La página de documentación de Jekyll Plugins](http://jekyllrb.com/docs/plugins/) sugiere esta solución:

> You can still use GitHub Pages to publish your site, but you’ll need to convert the site locally and push the generated static files to your GitHub repository instead of the Jekyll source files.

En español:

> Aún puede usar GitHub Pages para publicar su sitio, pero deberá convertir el sitio localmente y enviar los archivos estáticos generados a su repositorio de GitHub en lugar de a los archivos de origen Jekyll.

La solución no es tan sencilla como simplemente hacer un push de tu rama a GitHub y hacer que GitHub Pages construya automáticamente el sitio estático. Podría haber seguido la sugerencia y haber escrito una tarea de rake para automatizar esto localmente, pero luego tendría que acordarse de ejecutar un comando adicional.

## Comenzando con la Integración Continua con CircleCI

Jekyll documentation has a neat example of [Continuous Integration](http://jekyllrb.com/docs/continuous-integration/) with [html-proofer](https://github.com/gjtorikian/html-proofer). Running html-proofer will ensure that the html output will not have any broken links, images, etc. So I figured that I'd kill two birds with one stone and set up continuous integration on [CirleCI](https://circleci.com/). It will both run html-proofer and build the static html files. The workflow:

La documentación de Jekyll tiene un buen ejemplo de [Integración Continua](http://jekyllrb.com/docs/continuous-integration/) con [html-proofer](https://github.com/gjtorikian/html-proofer). Ejecutar html-proofer asegurará que la salida de html no tenga enlaces rotos, imágenes, etc. Así que pensé que mataría dos pájaros de un tiro y configuraría la integración continua en [CirleCI](https://circleci.com/). Ejecutará html-proofer y construirá los archivos html estáticos. El flujo de trabajo:

1.  Haz un push a una rama especial de gh-pages-ci
2.  CircleCI mira solo la rama gh-pages-ci
3.  Prueba el sitio a través de html-proofer
4.  Construye los archivos html estáticos
5.  Haz un push de los archivos html estáticos a la rama "master" de git
6.  Esto activa las GitHub Pages para actualizar el sitio.

I chose to use the gh-pages-ci branch because I'll likely use this technique for static html projects sites where GitHub Pages watches the gh-pages instead of master branch. The relevant scripts used in this workflow are below:

The rake task in the Rakefile that runs html-proofer:

Elegí usar la rama gh-pages-ci porque probablemente usaré esta técnica para los sitios de proyectos que usen html estático donde GitHub Pages mira las páginas gh en lugar de la rama maestra. Los scripts relevantes utilizados en este flujo de trabajo se encuentran a continuación:

La tarea de rake en el Rakefile que ejecuta html-proofer:

```ruby
    require 'html/proofer'

    task :test do
      sh "bundle exec jekyll build"
      HTML::Proofer.new(
        "./_site",
        check_html: true,
        only_4xx: true
      ).run
    end

```

El script "script/build_html" que construirá el sitio Jekyll y lo enviará a la rama principal ("master") de git:

```bash
    #!/bin/bash -ex

    GIT_COMMIT_DESC="$1"

    # Configurar git para que podamos usarlo
    git config --global user.email "<your email>"
    git config --global user.name "<your username>"
    
    # Eliminar cambios de la rama gh-pages-ci actual
    git checkout -f
    git checkout master

    # Asegúrese de que la rama "master" local coincida con la rama "master" remota
    # CircleCI combina los cambios realizados en la rama "master", por lo que es necesario restablecerlo
    git fetch origin master
    git reset --hard origin/master

    # Obtiene los archivos "_site/*" y hace un push a la rama "master"
    # Nota: CircleCI crea los archivos "vendor" y ".bundle" (por lo que sería conveniente borrarlos)
    mv _site /tmp/
    rm -rf * .bundle .sass-cache
    mv /tmp/_site/* .
    git add --all
    git commit -m "$GIT_COMMIT_DESC"
    git push origin master

```

El circle.yml que está configurado para observar solo los cambios en la rama gh-pages-ci:

```yaml

defaults: &defaults
    working_directory: ~/repo
    
version: 2
jobs:
    build:
        <<: *defaults
        docker:
          - image: circleci/ruby:2.6.0-node
        filters:
            branches:
                only:
                  - gh-pages-ci
                ignore:
                  - master
        environment:
            BUNDLER_VERSION: 2.0.1
            BUNDLE_PATH: ~/repo/vendor/bundle
            GIT_COMMIT_DESC: git log -1 --pretty=%B
            JEKYLL_ENV: production
        steps:
            - checkout
            - restore_cache:
                keys:
                    - rubygems-v1-&#x7B;&#x7B;  checksum "Gemfile.lock" &#x7D;&#x7D;
                    - rubygems-v1-fallback
            # Si usas submodules quizás debas descomentar esto
            # - run:
            #    name: Update Git submodules
            #    command: git submodule update --init --recursive
            - run:
                name: Bundle Pre Install
                command: gem install bundler:$BUNDLER_VERSION
            - run:
                name: Bundle Install
                command: bundle check || bundle install
            - run:
                name: Rake tests
                command: bundle exec rake
            - save_cache:
                key: rubygems-v1-&#x7B;&#x7B;  checksum "Gemfile.lock" &#x7D;&#x7D;
                paths:
                    - vendor/bundle
            - run:
                name: Jekyll build
                command: bundle exec jekyll build --trace
            - run:
                name: Run Build HTML
                command: bash ~/repo/script/build_html "`$GIT_COMMIT_DESC`"

workflows:
    version: 2
    test-deploy:
        jobs:
            - build
```

### Un consejo para CircleCI

CircleCI is great about being security conscientious. They set things up so that a deploy read-only ssh key is used to clone the repo. Since the build_html script above pushes to master at the end, you will need to add a key that has write access to the repo. This is a simple 1-click step in "Project Settings -> Permissions / Checkout SSH Keys".

CircleCI es genial en ser consciente de la seguridad. Configuran las cosas para que se use una clave ssh de solo lectura para clonar el repositorio. Dado que la secuencia de comandos build_html anterior ejecuta un push a la rama "master" al final, deberá agregar una clave que tenga acceso de escritura al repositorio. Este es un paso simple de 1 clic en "Configuración del proyecto -> Permisos / verificación de claves SSH" ("Project Settings -> Permissions / Checkout SSH Keys").

![Verificación de claves SSH por parte de CircleCI](/img/blogs/circleci-checkout-ssh-keys.png "CircleCI Checkout SSH Keys")

### Resumen del flujo final

Todo lo que hay que hacer ahora para actualizar el blog es hacer modificaciones a la rama gh-pages-ci y luego ejecutar `git push`. Fue más trabajo configurar todo esto que solo hacer que GitHub Pages construya el sitio Jekyll, pero el sitio siempre será revisado por html-proofer ahora. ¡Y ahora también puedo usar cualquier complemento de Jekyll que necesite! :thumbsup: