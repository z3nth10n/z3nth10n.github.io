---
layout: post
section-type: post
title: Configurando dominios personalizados en Github Pages (Parte 2)
date:   2019-04-01 16:00:00 +0100
categories: tutorial
language: es
locale: 'es'
permalink: "/:language/:year/:month/:day/configuring-custom-domains-github-pages-part-2.html"
---

## Configurando Heroku para usar múltiples subdominios en el mismo dominio de forma gratuita con SSL

En este tutorial, el primer paso que mostraré es cómo implementar una aplicación Heroku con PHP, que usaremos como backend.

Necesitarás tener una cuenta en Heroku, así que [no dudes en registrarte](https://signup.heroku.com/login).

> Para esto, debe reproducir los pasos de la guía sobre [cómo comenzar en PHP en Heroku] (https://devcenter.heroku.com/articles/getting-started-with-php) hasta la parte de configuración de variables. (**Nota:** la guía está en inglés)

**Nota:** Si ya sabes cómo publicar una aplicación PHP con Heroku, crea una.

Una vez que acabemos la guía, tendremos que deshacer algunos pasos del tutorial Heroku, porque personalmente, no usaré Symfony (prefiero Laravel, enseñaré algunos conceptos básicos en los próximos tutoriales), pero no quiero usar el enrutamiento que Symfony ofrece por el momento.

Volviendo al tema, debes eliminar manualmente estas líneas del archivo `composer.json`:


```json
  "require" : {
    "silex/silex": "^2.0.4",
    "monolog/monolog": "^1.22",
    "twig/twig": "^2.0",
    "symfony/twig-bridge": "^3"
  }
```

reemplaza esta parte de esta manera:

```json
  "require" : {}
```

Por el momento no utilizaremos ninguna dependencia.

Luego solo use los siguientes comandos para actualizar el proyecto y cargar una nueva versión del mismo:

En Linux:

```bash
$ rm -rf vendor
$ rm composer.lock
```

En Windows:

```dos
@ rmdir /S vendor
@ del /F composer.lock
```

Después:

```bash
$ composer install
$ git add .
$ git commit -m "<descripción del commit>"
$ git push heroku master
```

### Algunas advertencias

Para iniciar sesión en Heroku, deberás ejecutar el comando `heroku login`, pero una vez que hagas tu primer commit si pones credenciales incorrectas (al hacer push) [un error ocurrirá](https: //devcenter.heroku.com/articles/git#http-git-authentication), si esto te sucede, tengo una solución:

Primero borra las credenciales de Git usando:

```bash
$ git config --system --unset credential.helper
```

Si estás en Windows y usas la consola Mingw64 para tus proyectos y estás usando CMD, estás fuera de riesgo porque [la configuración del almacén de credenciales de git](https://git-scm.com/docs/git-credential-store) no será borrada.

Acabo de leer este artículo donde [Heroku sugiere que uses su opción `auth:token`](https://devcenter.heroku.com/articles/authentication). Estas son las credenciales que debes usar en tu primer inicio de sesión, la que se le da en el archivo `.netrc` en su HOME o en Windows: `C:/Users/<tu usuario>`.

## Configurar dominios personalizados

Para lograr esto, deberá seguir [este tutorial](https://devcenter.heroku.com/articles/custom-domains#add-a-custom-domain-with-a-Subdominio). **Nota:** No intentes agregarlos hasta que no hagas tu primer push a la aplicación.

Luego, todo lo que debes hacer es agregar un nuevo **'registro CNAME'** en tu panel de Cloudflare ([estábamos usando Cloudflare en la última publicación](/es/2019/03/31/configuring-custom-domains-github-pages-part-1) apuntando al enlace DNS solicitado en la consola. **Nota:** Por defecto, uso el subdominio `app.example.com`.

Pero la buena noticia aquí es que puedes usar tantos subdominios como necesites, y con algunos trucos, en tus proyectos.

Normalmente, otros usuarios desplegarían varios proyectos, pero quiero usar un solo proyecto. Por lo tanto, usaría algunos archivos `.htaccess` para lograr esto a través de la configuración de Apache.

Lo primero que debe tener en cuenta es que usaremos subcarpetas para apuntar a diferentes subcarpetas, por ejemplo:

```
raíz
    web/
        phpmyadmin/ # Esto apunta a sql.example.com
        api/        # Esto apunta a api.example.com
        dev/        # Esto apunta a dev.example.com
```

Primero necesitarás agregar todos estos subdominios:

```bash
$ heroku domains:add api.example.com
$ heroku domains:add dev.example.com
$ heroku domains:add sql.example.com
```

Luego, ve a Cloudflare y agregue subdominios como "registros CNAME":

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/01-heroku+free%20ssl/00.PNG?raw=true)

* En esta captura de pantalla me falta el subdominio `sql`.

Elimina el archivo `.htaccess` actual en la carpeta `web` y cree uno nuevo.

Entonces, necesitarás la siguiente configuración .htaccess:

```apache
Options +FollowSymLinks

RewriteEngine On

# Subdominio 1 (carpeta sql-admin)
RewriteCond %{HTTP_HOST} ^sql\.z3nth10n\.net$ [NC]
RewriteCond %{REQUEST_URI} !^/phpmyadmin/.*$
RewriteRule ^(.*)$ /phpmyadmin/$1 [L]

# Subdominio 2 (carpeta api)
RewriteCond %{HTTP_HOST} ^api\.z3nth10n\.net$ [NC]
RewriteCond %{REQUEST_URI} !^/api/.*$
RewriteRule ^(.*)$ /api/$1 [L]

# Subdominio 3 (carpeta dev)
RewriteCond %{HTTP_HOST} ^dev\.z3nth10n\.net$ [NC]
RewriteCond %{REQUEST_URI} !^/dev/.*$
RewriteRule ^(.*)$ /dev/$1 [L]
```

As you can see it has a very simple pattern usage:

```apache
# Subdominio # (carpeta x)
RewriteCond %{HTTP_HOST} ^<subdominio x>\.example\.com$ [NC]
RewriteCond %{REQUEST_URI} !^/<nombre de carpeta>/.*$
RewriteRule ^(.*)$ /<nombre de carpeta>/$1 [L]
```

## Configurando SSL

Aquí vienen los problemas, ya que el SSL no es gratis en Heroku. Necesitarás [un dyno pagado para tenerlo](https://devcenter.heroku.com/articles/ssl).

Pero Cloudflare puede cifrar el último punto final (Usuario-Cloudflare), para esto, tendremos que ir a la sección Crypto debajo de nuestro tablero y colocar la opción SSL en **el modo "Flexible"** (si lo pone **"Completo"** o **"Completo (estricto)"** se mostrará un error 502). Esto significa que Cloudflare ofrecerá su SSL como protección, pero desde Heroku hasta Cloudflare no habrá ningún túnel de encriptación como el que ofrece SSL/TLS.

* Puedes leer más sobre esto [aquí bajo el encabezado "Configuración SSL de Cloudflare"](https://www.cloudflare.com/ssl/).

Luego, para hacer que todos los usuarios usen **https** de manera predeterminada, desplázate hacia abajo y habilita la opción **"Usar siempre HTTPS"**.

**¡Un saludo!**