---
layout: post
section-type: post
title: How to schedule posts in Jekyll 
date:   2019-03-31 22:00:00 +0100
categories: tutorial
language: es
locale: 'es'
permalink: "/:language/:year/:month/:day/configuring-custom-domains-github-pages-part-1.html"
---

En este tutorial, mostraré cómo configurar un dominio con [name.com](https://name.com) y utilizarlo en su sitio web de Jekyll con [Cloudflare](https://cloudflare.com).

## pasos

1. Registrate en [name.com](https://name.com) y luego busca tu dominio:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/00.PNG?raw=true)

2. Después de enviar su información, deberá pagar (puede pagar con PayPal pero necesita una cuenta de Paypal verificada):

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/01.PNG?raw=true)

3. Si todo está bien, deberías preguntarte por esto:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/02.PNG?raw=true)

4. Luego, tendrás que volver a la `configuración del repositorio de tu sitio`:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/03.PNG?raw=true)

5. Y escriba tu dominio personalizado (**Nota:** la palabra clave `www` es obligatorio):

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/04.PNG?raw=true)

5.1. Es necesario que crees un archivo `CNAME` en la raíz de tu sitio con el dominio que vas a gestionar:

En mi caso:

- z3nth10n.net
- www.zenth10n.net

Pero hay un comando para hacer esto:

```bash
printf "<domain>\n<domain with www>" > CNAME && git add . && git commit -m "Added CNAME" && git push
```

Ejemplo:

```bash
printf "zenth10n.net\nwww.zenth10n.net" > CNAME && git add . && git commit -m "Added CNAME" && git push
```

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/05.PNG?raw=true)

6. Ahora ve a [Cloudflare](https://cloudflare.com) y registra una nueva cuenta:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/06.PNG?raw=true)

7. Cloudflare solicitará tu nombre de dominio, simplemente "Agrégalo" (botón `Add site`) como se muestra a continuación:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/07.PNG?raw=true)

8. Por defecto esto se mostrará así:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/08.PNG?raw=true)

Aquí debe presionar el botón "Continuar", lo configuraremos más adelante.

9. Cloudflare necesitará un nuevo `registro NS` en name.com:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/12.PNG?raw=true)

10. Ve a `Configuración de su sitio > Servidores de nombres`, y elimina los que ya hay:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/13.PNG?raw=true)

11. Deberás aplicar los cambios para que esto funcione:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/14.PNG?raw=true)

12. Entonces, simplemente escribe los nuevos registros solicitados por Cloudflare:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/15.PNG?raw=true)

13. Si todo va bien verás esto:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/16.PNG?raw=true)

14. Ve a tu archivo `_config.yml` y cambia todas las variables que dependen de la url:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/17.PNG?raw=true)

15. Regrese a Cloudflare y apunta este IP de Github: `192.30.252.153` (como un `registro A` para el comodín `@`) y para el `registro CNAME` que apunta a `www` como alias a la url de su sitio (en mi caso: `z3nth10n.github.com`) en su panel de Cloudflare:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/18.PNG?raw=true)

16. ¡Disfruta!

**Nota:** En caso de tener problemas, no dudes en preguntar en un comentario.

**¡Un saludo!**