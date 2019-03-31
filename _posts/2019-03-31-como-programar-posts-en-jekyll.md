---
layout: post
section-type: post
title: How to schedule posts in Jekyll 
date:   2019-03-31 9:22:00 +0100
categories: tutorial
language: es
locale: 'es'
permalink: "/:language/:year/:month/:day/how-schedule-posts-in-jekyll.html"
---

En esta publicación explicaré cómo usar la utilidad de Bash llamada **Jekyll Scheduler** para programar la subida de publicaciones de Jekyll.

> Jekyll Scheduler es un script de bash (ejecutado por los activadores nocturnos de CircleCI) que programa tus publicaciones.

Requiere que su repositorio Jekyll tenga un [configurado CircleCI en tu repositorio](https://z3nth10n.net/en/2019/03/20/jekyll-plugin-issue-with-github-pages).

Necesitarás acceder al [repositorio de este script](https://github.com/uta-org/jekyll-scheduler) para poder descargar ciertos archivos que se necesitarán al transcurso de este tutorial.

## Pasos de configuración

0. Clona este repositorio fuera de tu sitio de Jekyll.
	- `git clone https://github.com/uta-org/jekyll-scheduler.git`
1. Crea un archivo `sch.ini`, con esta configuración:

```ini
schedule_date=<fecha en formato YYYY-MM-DD>
schedule_post=<url to your posts>
```

*Example:*

```ini
schedule_date=2019-03-31
schedule_post=2019-03-31-how-schedule-posts-in-jekyll.md
schedule_date=2019-03-31
schedule_post=2019-03-31-configuring-custom-domains-github-pages-part-1.md
schedule_date=2019-04-01
schedule_post=2019-04-01-configuring-custom-domains-github-pages-part-2.md
```

> Esto programará 2 posts para el 31 de marzo de 2019 y otro para el 1 abril del mismo año.

3. Crea una carpeta "script" en la raíz de tu sitio.
	- `mkdir script`
2. Copia este script y el archivo `ini` en la carpeta "script".
	- `cp sch.ini <ruta de tu sitio de Jekyll>/script/sch.ini && cp get_scheduled_posts.sh <ruta de tu sitio de Jekyll>/script/get_scheduled_posts.sh`
4. Crea una carpeta llamada "scheduled-posts" dentro de la carpeta raíz de tu sitio. (**Nota:** aquí escribirás tus publicaciones programadas)
	- `mkdir scheduled-posts`
5. Copia esto en tu archivo de configuración `circle.yml`:

#### ¡No uses este método!

> ```yaml
> defaults: &defaults
>     working_directory: ~/repo
>     
> version: 2
> jobs:
>   # Tus otros jobs aquí... 
>     schedule_posts:
>         <<: *defaults
>         docker:
>           - image: circleci/ruby:2.6.0-node
>         filters:
>             branches:
>                 only:
>                   - gh-pages-ci
>                 ignore:
>                   - master
>         steps:
>             - checkout 
>             - run:
>                 name: Executing scheduler
>                 command: bash ~/repo/script/get_scheduled_posts.sh
> workflows:
>     version: 2
>     test-deploy:
>         jobs:
>             - schedule_posts:
>                 filters:
>                     branches:
>                         only:
>                           - gh-pages-ci
>                         ignore:
>                           - master              
>     nightly:
>         triggers:
>             - schedule:
>                 cron: "0 0 * * *"
>                 filters:
>                     branches:
>                         only:
>                             - gh-pages-ci
>                         ignore:
>                             - master
>         jobs:
>             - schedule_posts
> ```
>
> **Note:** Esto ejecutará el "scheduler" (el script que se encarga de publicar todo) cada vez que hagas un push, o cada día a las 12AM.

**Note2:** Esta no es la forma óptima de realizar esta tarea, recomiendo encarecidamente usar esto como un único paso en y tu job principal, y poner esto después del `checkout`. Mira [mi ejemplo en este archivo](https://github.com/z3nth10n/z3nth10n.github.io/blob/4500f380cd722a25e83108d5335edb87a9a3274e/circle.yml#L23).

```yaml
            - run:
                name: Executing scheduler
                command: bash ~/repo/script/get_scheduled_posts.sh
```

6. Necesitarás sincronizar todas tus publicaciones programadas en local, para realizar esto crea un alias de Git en tu entorno para automatizar esto en la parte local.

Para ello necesitarás descargar `scheduler-alias.sh`, con el siguiente comando:

`wget https://raw.githubusercontent.com/uta-org/jekyll-scheduler/master/scheduler-alias.sh -O ~/UnitedTeamworkAssociation/scheduler-alias.sh`

Y después, crear un alias:

`git config --global alias.publish '!script="$HOME/UnitedTeamworkAssociation/scheduler-alias.sh" && bash "$script"'`

Todo junto:

`wget https://raw.githubusercontent.com/uta-org/jekyll-scheduler/master/scheduler-alias.sh -O ${HOME}/UnitedTeamworkAssociation/scheduler-alias.sh && git config --global alias.publish '!script="$HOME/UnitedTeamworkAssociation/scheduler-alias.sh" && bash "$script"'`

Entonces en vez de usar `git push` usa `git publish`.

**Nota:** Este comando debe de ser llamado desde la raíz de tu repositorio.

7. ¡Disfruta!

### ¿Cómo funciona el script?

Simplemente copia los archivos requeridos en la fecha, de la carpeta "scheduled-posts" a la carpeta "_posts".

Así que, escribe publicaciones como normalmente sueles hacer.

**¡Un saludo!**