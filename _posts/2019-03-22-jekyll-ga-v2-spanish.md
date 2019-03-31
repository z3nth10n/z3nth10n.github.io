---
layout: post
section-type: post
title: Jekyll-ga-v2 un plugin para obtener datos de Google Analytics en tu sitio
date:   2019-03-22 2:35:00 +0100
categories: jekyll-plugin
language: es
locale: 'es'
permalink: "/:language/:year/:month/:day/jekyll-ga-v2-plugin-to-get-google-analytics-data-into-your-site.html"
---

En este post explicaré cómo usar el complemento llamado **jekyll-ga-v2**. He creado este plugin para poder implementar un widget que muestra la información que Google Analytics nos puede ofrecer.

**Nota:** Requiere Ruby 2.5+ y Jekyll 3.8+

# ¿Para qué sirve este plugin?

> Es un complemento de Jekyll que descarga datos de Google Analytics y los agrega a su sitio web de Jekyll. La métrica de Google Analytics se agrega a los metadatos de cada publicación/página y se puede acceder desde la variable `page.stats`. Se puede imprimir en una plantilla.

## Instalación

Este plugin requiere tres gemas de Ruby:

```bash
$ sudo gem install chronic
$ sudo gem install google-api-client
$ sudo gem install googleauth
```

Agregue esta línea al archivo Gem de su sitio:

```ruby
gem 'jekyll-ga-v2'
```

### Configurar una cuenta de servicio para la API de datos de Google

- Vaya a https://code.google.com/apis/console/b/0/ y cree un nuevo proyecto.
- Active la API de Analytics y acepte los términos del servicio.
- Vaya a `Acceso a la API` en el menú de la barra lateral izquierda, cree una nueva ID de cliente de OAuth 2.0, asigne un nombre a su proyecto y haga clic en `Siguiente`.
- Seleccione el tipo de aplicación: `Cuenta de servicio`, y haga clic en `Crear ID de cliente`
- Anote la contraseña de la clave privada. Probablemente será `notasecret` a menos que Google cambie algo. Tendrá que usarla para obtener la clave privada a partir de OpenSSL.
- Descarga la clave privada. Guarda este archivo porque solo puedes descargarlo una vez.
- Anote la dirección de correo electrónico para la cuenta de servicio. Lo necesitará para sus ajustes de configuración y en el siguiente paso.
- Inicie sesión en Google Analytics y agregue la dirección de correo electrónico de la cuenta de servicio como usuario de su perfil de Google Analytics: Desde una página de informe, `Admin > Seleccione un perfil > Usuarios > Nuevo usuario`

#### Configuración de las variables de entorno

[GoogleAuth necesita las siguientes variables de entorno para funcionar.](https://github.com/googleapis/google-auth-library-ruby#example-environment-variables)

Hay una manera fácil de implementar esto utilizando CircleCI (quizás estás usando una herramienta similar para implementar tu sitio web Jekyll). Si no estás familiarizado con CircleCI, debes leer atentamente esta publicación en mi blog sobre "[Cómo utilizar cualquier plugin de Jekyll en las páginas de GitHub con CircleCI](/es/2019/03/20/jekyll-plugin-issue-with-github-pages)".

Una vez que lo implementes, deberás ir a tu [Dashboard de CircleCI](https://circleci.com/dashboard), buscar en la configuración de tu proyecto e ir a "**Organización > Contextos** (**Organization > Contexts**)" y crear [un nuevo Contexto](https://circleci.com/docs/2.0/contexts/).

Mira la [configuración CircleCI.yml](https://github.com/z3nth10n/z3nth10n.github.io/blob/b9f7ef42e5fce33800aab80f8eabe6868b38f8e5/circle.yml#L54) de mi sitio web. Lo único que queda es crear el nombre de contexto adecuado y, a continuación, crear las variables de entorno requeridas:

![](https://i.gyazo.com/3ad97b8e09ee7e05b8496f1cd631affa.png)

**Nota:** El valor `GOOGLE_PRIVATE_KEY` es la salida de OpenSSL. Deberá ejecutar el siguiente comando para obtenerlo del archivo `*.p12`:

```bash
$ openssl pkcs12 -in filename.p12 -clcerts -nodes -nocerts
```

Deberá reemplazar todos los caracteres de líneas nuevas por `\n`. Esto se puede hacer fácilmente con Sublime Text 3 especificando las opciones Regex y reemplazando `\n` por` \\n`.
 
## Configuración

Para configurar `jekyll-ga-v2`, debes especificar cierta información sobre tu cuenta de servicio de Google Analytics (según lo establecido anteriormente) y la configuración de su informe.

Agregua el siguiente bloque al archivo `_config.yml` de tu sitio Jekyll:

```yaml
####################
# Google Analytics #
####################

jekyll_ga:
  profileID: ga:<user_id>   # Profile ID 
  start: last week          # Beginning of report
  end: now                  # End of report
  compare_period: true      
  metrics: ga:pageviews     # Metrics code
  dimensions: ga:pagePath   # Dimensions
  segment:                  # Optional
  filters:                  # Optional
  sort: true                # Sort posts by this metric
  max_results: 10000        # Number of the maximum results get by the API
  debug: false              # Debug mode
```

* `profileID` es el perfil de informe específico del que deseas extraer datos. Encuéntralo yendo a la página de informes en Google Analytics. Mira la URL. Se verá algo como `https://www.google.com/analytics/web/?hl=en&pli=1#report/visitors-overview/###########p######/`. El número después de `p` al final de la URL es su `profileID`.
* El `start` y el `end` indican el rango de tiempo de los datos que desea consultar. Se analizan utilizando la gema `Chronic` de Ruby, por lo que puede incluir fechas relativas o absolutas, como `now`, `yesterday`, `last month`, `2 weeks ago` **(solo en inglés)**. Consulta [la documentación de Chronic](https://github.com/mojombo/chronic#examples) para obtener más opciones.
* El valor de `metrics` es lo que desea medir a partir de sus datos de Google Analytics. Por lo general, esto será `ga:pageviews` o `ga:visits`, pero puede ser cualquier métrica disponible en Google Analytics. Especifique sólo uno. Consulta [el explorador de consultas de Google Analytics](http://ga-dev-tools.appspot.com/explorer/?csw=1) para experimentar con diferentes métricas. (El parametro `dimension` siempre debe ser `ga:pagePath`). Te recomiendo la siguiente cadena `ga:pageviews,ga:bounceRate,ga:session,ga:users,ga:newUsers`.
* Las claves `segment` y `filters` son parámetros opcionales para su consulta. Consulta [el explorador de consultas de Google Analytics](http://ga-dev-tools.appspot.com/explorer/?csw=1) para obtener una descripción de cómo usarlos, o simplemente omítalos.

Nuevos params en v2:

* Si `compare_period` es verdadero, esto creará dos informes (**ejemplo:** si la clave `start` está configurado como "last month", se creará un informe desde "end" hasta "start" (como siempre) y el segundo informe empezará en el "start" del último reporte y para el caso de "last month" su "start" se establecerá 2 meses antes, con estos datos se creará una comparación).

### ¿Necesitas automatizar esto?

Tal vez estás pensando que tendrás que hacer un nuevo push cada vez que necesites actualizar tus estadísticas. Y tienes razón, pero CircleCI viene aquí de nuevo al rescate. Todo lo que necesitas es [programar una compilación nocturna con CircleCI](https://circleci.com/docs/2.0/workflows/#nightly-example).

Aquí está mi propia implementación en [mi configuración CircleCI.yml, otra vez](https://github.com/z3nth10n/z3nth10n.github.io/blob/b9f7ef42e5fce33800aab80f8eabe6868b38f8e5/circle.yml#L56).

```yaml
    nightly:
        triggers:
            - schedule:
                cron: "0 0 * * *"
                filters:
                    branches:
                        only:
                            - gh-pages-ci
                        ignore:
                            - master
        jobs:
            - build:
                context: "Google Analytics Sensitive Data"
```

Por supuesto, necesitarás especificar el contexto otra vez.

### ¿Necesitas ejemplos?

Mira esos dos archivos HTML que creé para representar mi configuración:

```html
&#x3C;&#x64;&#x69;&#x76;&#x20;&#x69;&#x64;&#x3D;&#x22;&#x67;&#x65;&#x6E;&#x73;&#x74;&#x61;&#x74;&#x73;&#x22;&#x20;&#x63;&#x6C;&#x61;&#x73;&#x73;&#x3D;&#x22;&#x63;&#x6F;&#x6C;&#x2D;&#x6D;&#x64;&#x2D;&#x33;&#x20;&#x61;&#x6C;&#x69;&#x67;&#x6E;&#x2D;&#x73;&#x6D;&#x2D;&#x72;&#x69;&#x67;&#x68;&#x74;&#x20;&#x76;&#x65;&#x72;&#x74;&#x69;&#x63;&#x61;&#x6C;&#x2D;&#x6D;&#x61;&#x72;&#x67;&#x69;&#x6E;&#x20;&#x6F;&#x72;&#x64;&#x65;&#x72;&#x2D;&#x78;&#x73;&#x2D;&#x66;&#x6F;&#x75;&#x72;&#x74;&#x68;&#x20;&#x63;&#x6F;&#x6C;&#x2D;&#x78;&#x73;&#x2D;&#x65;&#x78;&#x70;&#x61;&#x6E;&#x64;&#x22;&#x3E;&#xA;&#x20;&#x20;&#x20;&#x20;&#x3C;&#x62;&#x6F;&#x78;&#x20;&#x63;&#x6C;&#x61;&#x73;&#x73;&#x3D;&#x22;&#x62;&#x6F;&#x74;&#x68;&#x2D;&#x6F;&#x66;&#x66;&#x73;&#x65;&#x74;&#x20;&#x65;&#x78;&#x70;&#x61;&#x6E;&#x64;&#x2D;&#x77;&#x69;&#x64;&#x74;&#x68;&#x22;&#x3E;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x3C;&#x70;&#x3E;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x3C;&#x68;&#x33;&#x3E;&#x53;&#x74;&#x61;&#x74;&#x69;&#x73;&#x74;&#x69;&#x63;&#x73;&#x3C;&#x2F;&#x68;&#x33;&#x3E;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x3C;&#x70;&#x3E;&#x28;&#x6C;&#x61;&#x73;&#x74;&#x20;&#x7B;&#x7B;&#x20;&#x73;&#x69;&#x74;&#x65;&#x2E;&#x64;&#x61;&#x74;&#x61;&#x2E;&#x70;&#x65;&#x72;&#x69;&#x6F;&#x64;&#x20;&#x7D;&#x7D;&#x20;&#x64;&#x61;&#x79;&#x73;&#x29;&#x3C;&#x2F;&#x70;&#x3E;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x3C;&#x2F;&#x70;&#x3E;&#xA;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x66;&#x6F;&#x72;&#x20;&#x68;&#x65;&#x61;&#x64;&#x65;&#x72;&#x20;&#x69;&#x6E;&#x20;&#x73;&#x69;&#x74;&#x65;&#x2E;&#x64;&#x61;&#x74;&#x61;&#x2E;&#x68;&#x65;&#x61;&#x64;&#x65;&#x72;&#x73;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x3C;&#x70;&#x3E;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x61;&#x73;&#x73;&#x69;&#x67;&#x6E;&#x20;&#x68;&#x76;&#x61;&#x6C;&#x75;&#x65;&#x20;&#x3D;&#x20;&#x68;&#x65;&#x61;&#x64;&#x65;&#x72;&#x2E;&#x76;&#x61;&#x6C;&#x75;&#x65;&#x20;&#x7C;&#x20;&#x70;&#x6C;&#x75;&#x73;&#x3A;&#x20;&#x30;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x7B;&#x20;&#x68;&#x76;&#x61;&#x6C;&#x75;&#x65;&#x20;&#x7C;&#x20;&#x72;&#x6F;&#x75;&#x6E;&#x64;&#x20;&#x7D;&#x7D;&#x20;&#x7B;&#x7B;&#x20;&#x68;&#x65;&#x61;&#x64;&#x65;&#x72;&#x2E;&#x6E;&#x61;&#x6D;&#x65;&#x20;&#x7D;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x3C;&#x2F;&#x70;&#x3E;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x3C;&#x70;&#x20;&#x63;&#x6C;&#x61;&#x73;&#x73;&#x3D;&#x22;&#x73;&#x75;&#x62;&#x22;&#x3E;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x69;&#x66;&#x20;&#x73;&#x69;&#x74;&#x65;&#x2E;&#x6A;&#x65;&#x6B;&#x79;&#x6C;&#x6C;&#x5F;&#x67;&#x61;&#x2E;&#x63;&#x6F;&#x6D;&#x70;&#x61;&#x72;&#x65;&#x5F;&#x70;&#x65;&#x72;&#x69;&#x6F;&#x64;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x28;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x6C;&#x61;&#x73;&#x74;&#x20;&#x7B;&#x7B;&#x20;&#x73;&#x69;&#x74;&#x65;&#x2E;&#x64;&#x61;&#x74;&#x61;&#x2E;&#x70;&#x65;&#x72;&#x69;&#x6F;&#x64;&#x20;&#x7D;&#x7D;&#x20;&#x64;&#x61;&#x79;&#x73;&#x3A;&#x20;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x69;&#x66;&#x20;&#x68;&#x65;&#x61;&#x64;&#x65;&#x72;&#x2E;&#x76;&#x61;&#x6C;&#x75;&#x65;&#x5F;&#x70;&#x65;&#x72;&#x63;&#x20;&#x21;&#x3D;&#x20;&#x22;&#x221E;&#x22;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x61;&#x73;&#x73;&#x69;&#x67;&#x6E;&#x20;&#x70;&#x65;&#x72;&#x63;&#x20;&#x3D;&#x20;&#x68;&#x65;&#x61;&#x64;&#x65;&#x72;&#x2E;&#x76;&#x61;&#x6C;&#x75;&#x65;&#x5F;&#x70;&#x65;&#x72;&#x63;&#x20;&#x7C;&#x20;&#x70;&#x6C;&#x75;&#x73;&#x3A;&#x20;&#x30;&#x20;&#x25;&#x7D;&#xA;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x69;&#x66;&#x20;&#x70;&#x65;&#x72;&#x63;&#x20;&#x3E;&#x20;&#x30;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x3C;&#x69;&#x20;&#x63;&#x6C;&#x61;&#x73;&#x73;&#x3D;&#x22;&#x66;&#x61;&#x73;&#x20;&#x66;&#x61;&#x2D;&#x61;&#x72;&#x72;&#x6F;&#x77;&#x2D;&#x75;&#x70;&#x20;&#x63;&#x6F;&#x6C;&#x6F;&#x72;&#x2D;&#x67;&#x72;&#x65;&#x65;&#x6E;&#x22;&#x3E;&#x3C;&#x2F;&#x69;&#x3E;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x65;&#x6C;&#x73;&#x69;&#x66;&#x20;&#x70;&#x65;&#x72;&#x63;&#x20;&#x3D;&#x3D;&#x20;&#x30;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x3C;&#x69;&#x20;&#x63;&#x6C;&#x61;&#x73;&#x73;&#x3D;&#x22;&#x66;&#x61;&#x73;&#x20;&#x66;&#x61;&#x2D;&#x65;&#x71;&#x75;&#x61;&#x6C;&#x73;&#x22;&#x3E;&#x3C;&#x2F;&#x69;&#x3E;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x65;&#x6C;&#x73;&#x69;&#x66;&#x20;&#x70;&#x65;&#x72;&#x63;&#x20;&#x3C;&#x20;&#x30;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x3C;&#x69;&#x20;&#x63;&#x6C;&#x61;&#x73;&#x73;&#x3D;&#x22;&#x66;&#x61;&#x73;&#x20;&#x66;&#x61;&#x2D;&#x61;&#x72;&#x72;&#x6F;&#x77;&#x2D;&#x64;&#x6F;&#x77;&#x6E;&#x20;&#x63;&#x6F;&#x6C;&#x6F;&#x72;&#x2D;&#x72;&#x65;&#x64;&#x22;&#x3E;&#x3C;&#x2F;&#x69;&#x3E;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x65;&#x6E;&#x64;&#x69;&#x66;&#x20;&#x25;&#x7D;&#xA;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x7B;&#x20;&#x70;&#x65;&#x72;&#x63;&#x20;&#x7C;&#x20;&#x72;&#x6F;&#x75;&#x6E;&#x64;&#x20;&#x7D;&#x7D;&#x20;&#x25;&#x20;&#x7C;&#x20;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x61;&#x73;&#x73;&#x69;&#x67;&#x6E;&#x20;&#x64;&#x69;&#x66;&#x66;&#x20;&#x3D;&#x20;&#x68;&#x65;&#x61;&#x64;&#x65;&#x72;&#x2E;&#x64;&#x69;&#x66;&#x66;&#x5F;&#x76;&#x61;&#x6C;&#x75;&#x65;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x69;&#x66;&#x20;&#x64;&#x69;&#x66;&#x66;&#x20;&#x3E;&#x20;&#x30;&#x20;&#x25;&#x7D;&#x2B;&#x7B;&#x25;&#x20;&#x65;&#x6E;&#x64;&#x69;&#x66;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x7B;&#x20;&#x64;&#x69;&#x66;&#x66;&#x20;&#x7C;&#x20;&#x72;&#x6F;&#x75;&#x6E;&#x64;&#x20;&#x7D;&#x7D;&#x20;&#x74;&#x68;&#x61;&#x6E;&#x20;&#x6C;&#x61;&#x73;&#x74;&#x20;&#x70;&#x65;&#x72;&#x69;&#x6F;&#x64;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x65;&#x6C;&#x73;&#x65;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x221E;&#x20;&#x25;&#x20;&#x20;&#x20;&#x20;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x65;&#x6E;&#x64;&#x69;&#x66;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x29;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x65;&#x6E;&#x64;&#x69;&#x66;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x3C;&#x2F;&#x70;&#x3E;&#xA;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x65;&#x6E;&#x64;&#x66;&#x6F;&#x72;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x3C;&#x2F;&#x62;&#x6F;&#x78;&#x3E;&#xA;&#x3C;&#x2F;&#x64;&#x69;&#x76;&#x3E;
```

Esto muestra un cuadro con las diferentes métricas seleccionadas en tu parámetro de configuración `metrics`:

![](https://i.gyazo.com/3105ff73fc023c5cf3506b9adcd63577.png)

Yo uso esto para cualquier publicación:

```html
&#x7B;&#x25;&#x20;&#x69;&#x66;&#x20;&#x70;&#x61;&#x67;&#x65;&#x2E;&#x73;&#x74;&#x61;&#x74;&#x73;&#x2E;&#x70;&#x61;&#x67;&#x65;&#x76;&#x69;&#x65;&#x77;&#x73;&#x20;&#x21;&#x3D;&#x20;&#x62;&#x6C;&#x61;&#x6E;&#x6B;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x61;&#x73;&#x73;&#x69;&#x67;&#x6E;&#x20;&#x68;&#x76;&#x61;&#x6C;&#x75;&#x65;&#x20;&#x3D;&#x20;&#x68;&#x65;&#x61;&#x64;&#x65;&#x72;&#x2E;&#x76;&#x61;&#x6C;&#x75;&#x65;&#x20;&#x7C;&#x20;&#x70;&#x6C;&#x75;&#x73;&#x3A;&#x20;&#x30;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x7B;&#x20;&#x68;&#x76;&#x61;&#x6C;&#x75;&#x65;&#x20;&#x7C;&#x20;&#x72;&#x6F;&#x75;&#x6E;&#x64;&#x20;&#x7D;&#x7D;&#x20;&#x76;&#x69;&#x65;&#x77;&#x73;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#xA;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x69;&#x66;&#x20;&#x73;&#x69;&#x74;&#x65;&#x2E;&#x6A;&#x65;&#x6B;&#x79;&#x6C;&#x6C;&#x5F;&#x67;&#x61;&#x2E;&#x63;&#x6F;&#x6D;&#x70;&#x61;&#x72;&#x65;&#x5F;&#x70;&#x65;&#x72;&#x69;&#x6F;&#x64;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x28;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x6C;&#x61;&#x73;&#x74;&#x20;&#x7B;&#x7B;&#x20;&#x73;&#x69;&#x74;&#x65;&#x2E;&#x64;&#x61;&#x74;&#x61;&#x2E;&#x70;&#x65;&#x72;&#x69;&#x6F;&#x64;&#x20;&#x7D;&#x7D;&#x20;&#x64;&#x61;&#x79;&#x73;&#x3A;&#x20;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x69;&#x66;&#x20;&#x70;&#x61;&#x67;&#x65;&#x2E;&#x73;&#x74;&#x61;&#x74;&#x73;&#x2E;&#x70;&#x61;&#x67;&#x65;&#x76;&#x69;&#x65;&#x77;&#x73;&#x5F;&#x70;&#x65;&#x72;&#x63;&#x20;&#x21;&#x3D;&#x20;&#x22;&#x221E;&#x22;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x61;&#x73;&#x73;&#x69;&#x67;&#x6E;&#x20;&#x70;&#x65;&#x72;&#x63;&#x20;&#x3D;&#x20;&#x70;&#x61;&#x67;&#x65;&#x2E;&#x73;&#x74;&#x61;&#x74;&#x73;&#x2E;&#x70;&#x61;&#x67;&#x65;&#x76;&#x69;&#x65;&#x77;&#x73;&#x5F;&#x70;&#x65;&#x72;&#x63;&#x20;&#x7C;&#x20;&#x70;&#x6C;&#x75;&#x73;&#x3A;&#x20;&#x30;&#x20;&#x25;&#x7D;&#xA;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x69;&#x66;&#x20;&#x70;&#x65;&#x72;&#x63;&#x20;&#x3E;&#x20;&#x30;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x3C;&#x69;&#x20;&#x63;&#x6C;&#x61;&#x73;&#x73;&#x3D;&#x22;&#x66;&#x61;&#x73;&#x20;&#x66;&#x61;&#x2D;&#x61;&#x72;&#x72;&#x6F;&#x77;&#x2D;&#x75;&#x70;&#x20;&#x63;&#x6F;&#x6C;&#x6F;&#x72;&#x2D;&#x67;&#x72;&#x65;&#x65;&#x6E;&#x22;&#x3E;&#x3C;&#x2F;&#x69;&#x3E;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x65;&#x6C;&#x73;&#x69;&#x66;&#x20;&#x70;&#x65;&#x72;&#x63;&#x20;&#x3D;&#x3D;&#x20;&#x30;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x3C;&#x69;&#x20;&#x63;&#x6C;&#x61;&#x73;&#x73;&#x3D;&#x22;&#x66;&#x61;&#x73;&#x20;&#x66;&#x61;&#x2D;&#x65;&#x71;&#x75;&#x61;&#x6C;&#x73;&#x22;&#x3E;&#x3C;&#x2F;&#x69;&#x3E;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x65;&#x6C;&#x73;&#x69;&#x66;&#x20;&#x70;&#x65;&#x72;&#x63;&#x20;&#x3C;&#x20;&#x30;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x3C;&#x69;&#x20;&#x63;&#x6C;&#x61;&#x73;&#x73;&#x3D;&#x22;&#x66;&#x61;&#x73;&#x20;&#x66;&#x61;&#x2D;&#x61;&#x72;&#x72;&#x6F;&#x77;&#x2D;&#x64;&#x6F;&#x77;&#x6E;&#x20;&#x63;&#x6F;&#x6C;&#x6F;&#x72;&#x2D;&#x72;&#x65;&#x64;&#x22;&#x3E;&#x3C;&#x2F;&#x69;&#x3E;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x65;&#x6E;&#x64;&#x69;&#x66;&#x20;&#x25;&#x7D;&#xA;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x7B;&#x20;&#x70;&#x65;&#x72;&#x63;&#x20;&#x7C;&#x20;&#x72;&#x6F;&#x75;&#x6E;&#x64;&#x20;&#x7D;&#x7D;&#x20;&#x25;&#x20;&#x7C;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x61;&#x73;&#x73;&#x69;&#x67;&#x6E;&#x20;&#x64;&#x69;&#x66;&#x66;&#x20;&#x3D;&#x20;&#x70;&#x61;&#x67;&#x65;&#x2E;&#x73;&#x74;&#x61;&#x74;&#x73;&#x2E;&#x64;&#x69;&#x66;&#x66;&#x5F;&#x70;&#x61;&#x67;&#x65;&#x76;&#x69;&#x65;&#x77;&#x73;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x69;&#x66;&#x20;&#x64;&#x69;&#x66;&#x66;&#x20;&#x3E;&#x20;&#x30;&#x20;&#x25;&#x7D;&#x2B;&#x7B;&#x25;&#x20;&#x65;&#x6E;&#x64;&#x69;&#x66;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x7B;&#x20;&#x64;&#x69;&#x66;&#x66;&#x20;&#x7C;&#x20;&#x72;&#x6F;&#x75;&#x6E;&#x64;&#x20;&#x7D;&#x7D;&#x20;&#x74;&#x68;&#x61;&#x6E;&#x20;&#x6C;&#x61;&#x73;&#x74;&#x20;&#x70;&#x65;&#x72;&#x69;&#x6F;&#x64;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x65;&#x6C;&#x73;&#x65;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x221E;&#x20;&#x25;&#x20;&#x20;&#x20;&#x20;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x65;&#x6E;&#x64;&#x69;&#x66;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x20;&#x29;&#xA;&#x20;&#x20;&#x20;&#x20;&#x7B;&#x25;&#x20;&#x65;&#x6E;&#x64;&#x69;&#x66;&#x20;&#x25;&#x7D;&#xA;&#x20;&#x20;&#x20;&#x20;&#x2E;&#xA;&#x7B;&#x25;&#x20;&#x65;&#x6E;&#x64;&#x69;&#x66;&#x20;&#x25;&#x7D;
```

Sólo muestra `xx visitas (porcentaje % | diferencia entre dos rangos)`.

## ¿Problemas?

¿Tienes problemas? Repórtalos en [la sección de problemas](https://github.com/uta-org/jekyll-ga-v2/issues). **¡Gracias por el feedback!**

**¡Un saludo!**