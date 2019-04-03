---
layout: post
section-type: post
title: Configurando dominios personalizados en Github Pages (Parte 3)
date:   2019-04-02 16:00:00 +0100
categories: tutorial
language: es
locale: 'es'
permalink: "/:language/:year/:month/:day/configuring-custom-domains-github-pages-part-3.html"
---

## Configurar y usar PHPMyAdmin con Heroku usando JawsDB

En el último tutorial, mostré cómo configurar [tu primer backend PHP usando Heroku](/es/2019/04/01/configuring-custom-domains-github-pages-part-2), ahora os explicaremos como usar PHPMyAdmin en Heroku.

Para esto, utilizarás [esta increíble plantilla de Heroku para usar PHPMyAdmin creada por smsaladi](https://github.com/smsaladi/phpmyadmin_heroku). Solo necesitas copiar las siguientes líneas en tu archivo `composer.json`:

```json
  "scripts" : {
    "post-install-cmd" : "composer create-project phpmyadmin/phpmyadmin; cp config.inc.php phpmyadmin/"
  }
```

y dentro del `require`:

```json
"ext-mbstring": "*"
```

Además, deberás copiar el `config.inc.php` en la raíz de tu proyecto Heroku.

Tendrás que modificar el "post-install-cmd" si deseas usar una subcarpeta que apunte a un subdominio como lo hice en la Parte 2:

Entonces, modifica el "post-install-cmd" para que coincida con esto:

```json
cd web/ && composer create-project phpmyadmin/phpmyadmin; cp ../config.inc.php phpmyadmin/
```

Y crea la carpeta `phpmyadmin` dentro de `web`.

**Nota:** Si deseas apuntar un subdominio en lugar de usar la carpeta, asegúrate de configurar correctamente sus registros DNS en Cloudflare y copia la parte correcta de mi `.htaccess` en el ejemplo de la **Parte 2**.

Luego, ejecuta los siguientes comandos:

```bash
$ composer update
$ git add .
$ git commit -m "Deploying PHPMyAdmin"
% git push heroku master
```

### Configurando JawsDB

Para configurar JawsDB, deberás seguir [los pasos en la guía de Heroku sobre esto](https://devcenter.heroku.com/articles/jawsdb#provisioning-the-add-on).

Solo utiliza estos dos comandos de esta guía:

```bash
$ heroku addons:create jawsdb
```

> Para añadir el addon.

```bash
$ heroku config:get JAWSDB_URL
```

> Para obtener las credenciales que necesitarás usar en el login de PHPMyAdmin.

### Configurando las variables de entorno

El archivo `config.inc.php` de PHPMyAdmin necesitará dos variables de entorno:

* [MYSQL_HOST](https://github.com/smsaladi/phpmyadmin_heroku/blob/cb0930fc82ffed1facb50ecd010b4be29b31c614/config.inc.php#L31)
* [PHPMYADMIN_BLOWFISH_SECRET](https://github.com/smsaladi/phpmyadmin_heroku/blob/cb0930fc82ffed1facb50ecd010b4be29b31c614/config.inc.php#L17)

Para generar la variable `PHPMYADMIN_BLOWFISH_SECRET`, solo use un generador de hash SHA-1 o MD5 online (que no almacene los datos en su base de datos :joy:, por ejemplo sha1-online.com). Una vez que hayas creado uno, simplemente configúralo con [este comando](https://devcenter.heroku.com/articles/getting-started-with-php#define-config-vars):

```bash
$ heroku config:set PHPMYADMIN_BLOWFISH_SECRET=<hash>
```

La variable `MYSQL_HOST` se puede extraer del `heroku config: get JAWSDB_URL` que expliqué antes. Simplemente siga su formato (`mysql://nombre de usuario:contraseña@nombre de host:puerto/default_schema`)

Y configúralo como expliqué antes para la clave "**PHPMYADMIN_BLOWFISH_SECRET**".

### ¿No puedes iniciar sesión usando SSL?

Bueno, ese comportamiento se esperaría si usas Heroku gratis y Cloudflare con SSL.

Si siguió la Parte 2 de este tutorial, deberá desactivar la opción **"Usar siempre HTTPS"** en **Crypto** dentro de tu panel de control y crear algunas reglas para mantener a los usuarios redirigidos al protocolo **https**:

* https://sql.example.com/
    * Regla => SSL: desactivado
* http: //&#x2A;example.com/&#x2A;
    * Regla => Usar siempre HTTPS
    
Haz clic en **"Guardar e implementar"**.

**Consejo importante:** No inicie sesións en tu base de datos en un wifi público debido a un posible [*ataque MitM (de intermediario)*](https://es.wikipedia.org/wiki/Ataque_de_intermediario).

**¡Un saludo!**