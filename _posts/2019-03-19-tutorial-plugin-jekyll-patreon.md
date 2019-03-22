---
layout: post
section-type: post
title: Como usar Patreon en Jekyll (tutorial sobre el plugin jekyll-patreon) 
date:   2019-03-19 9:22:00 +0100
categories: jekyll-plugin
language: es
locale: 'es'
permalink: "/:language/:year/:month/:day/jekyll-patreon-plugin-tutorial.html"
---

En este post explicaré como usar el plugin llamado **jekyll-patreon**, el cual he creado para poder implementar un widget el cual nos muestre información sobre nuestro perfil de Patreon.

**Nota:** Este plugin requiere Ruby 2.5+ y Jekyll 3.8+

## ¿Para que sirve este plugin?

> Esto es un plugin para Jekyll que añade soporte a Patreon dentro de tu blog para incrustar un widget con metas

## Características

* Implementa varios tipos de diseños: default, fancy, minimal, streamlined, reversed, swapped
* Implementa varios tipos de colores: red, green, orange, red nostripes, green nostripes, orange nostripes, blue nostripes
* Implementa internacionalización (compatible con [jekyll-language-plugin](https://github.com/vwochnik/jekyll-language-plugin))
* Implementa el formato Markdown en las descripciones de tus metas de Patreon

> Para ver todos los posibles estilos y diseños navega a [la carpeta assets del repositorio](https://github.com/uta-org/jekyll-patreon/tree/master/assets), aquí podrás ver los pantallazos

## Instalación

Añade esta línea al Gemfile de tu sitio: 

```ruby
gem 'jekyll-patreon'
```

Añade esta configuración a tu _config.yml:

```yaml
####################
# Patreon Settings #
####################

patreon:
    enabled: true
    design: 'default' # Supports the following desings: default, fancy, minimal, streamlined, reversed, swapped
    title: 'Example title'
    metercolor: 'green' # Supports the following colors: red, green, orange, red nostripes, green nostripes, orange nostripes, blue nostripes
    toptext: 'Example top text' # Text that appears in before the progress bar (optional)
    bottomtext: 'Example bottom text' # Text that appears in after the progress bar (optional)
    showgoaltext: true # Display the goal text?
    showbutton: true # Display the "Become a patron" button?
    username: 'Your username here'
    default_lang: "en" # The default language to use (to avoid writing twice the same text from Patreon)
```

## Uso

Simplemente pon el siguiente tag donde lo quieras usar:

<pre>
   <code>
        {&percnt; patreon &percnt;}
   </code>
</pre>

### i18n (internacionalización)

Para implementar los idiomas solamente usa la configuración de [jekyll-language-plugin](https://github.com/vwochnik/jekyll-language-plugin). O si no lo usas, sigue los siguientes pasos:

Primero, en tu index.html principal (o donde necesites usar la internacionalización) declara las siguientes líneas:

<pre><code data-trim class="yaml">
&ndash;&ndash;&ndash;
layout: &lt;layout&gt;
language: en
&ndash;&ndash;&ndash;
</code></pre>

O si quieres implementar varios idiomas en la misma página:

<pre><code data-trim class="yaml">
&ndash;&ndash;&ndash;
layout: &lt;layout&gt;
languages:
- en
- es
&ndash;&ndash;&ndash;
</code></pre>

Después, en "_data/lang/" crea un archibvo para cada idioma.

> Por ejemplo: `en.yml` y `es.yml`. 

Después, escribe las traducciones de tus metas así: 

<pre><code data-trim class="yaml">
#################
# Patreon Goals #
#################

patreon_goal_0: "..."
patreon_goal_1: "..."
patreon_goal_2: "..."
# etc etc...
</code></pre>

Aquí deberás de crear tantas traducciones como metas tengas en la página/perfil de Patreon. (**Nota:** el índice de comienzo es el 0 (cero))

## ¿Problemas?

¿Tienes problemas? Repórtalos en [la sección de problemas](https://github.com/uta-org/jekyll-patreon/issues). **¡Gracias por el feedback!**

**¡Un saludo!**