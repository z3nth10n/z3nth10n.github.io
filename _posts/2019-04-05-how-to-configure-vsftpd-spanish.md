---
layout: post
section-type: post
title: Como configurar VSFTPD en Linux
date:   2019-04-05 16:00:00 +0100
categories: tutorial
language: es
locale: 'es'
permalink: "/:language/:year/:month/:day/how-to-configure-vsftpd.html"
---

Todos los tutoriales que he leído hasta el momento de **cómo instalar vsftpd** comienzan de la misma forma, **advirtiendo de que el protocolo FTP es inseguro porque no está cifrado**. Esto es cierto, pero también es cierto que si queremos montar un servidor FTP local para uso propio, usar vsftpd es la solución más rápida y sencilla. Por este motivo me decidí a escribir este **tutorial de cómo instalar vsftpd en Linux Ubuntu y configurarlo correctamente paso a paso**.

![Cómo instalar vsftpd en Linux Ubuntu y configurarlo correctamente](https://www.vozidea.com/wp-content/uploads/2017/03/como-instalar-vsftpd-en-Linux-Ubuntu.png "Cómo instalar vsftpd en Linux Ubuntu y configurarlo correctamente")

También es necesario que conozcas las alternativas a FTP consideradas como seguras, donde nos encontramos los protocolos **sFTP** y **SCP** como los más usados. También podemos configurar vsftpd para que use una conexión segura bajo SSL/TLS.

**A pesar de que es relativamente sencillo configurar vsftp con SSL/TLS, no lo voy a incluir en este tutorial, ya que el objetivo es hacer una explicación rápida y sencilla.** Quizás le dedique un tutorial a ese aspecto más adelante.

Cómo instalar vsftpd en Linux Ubuntu y configurarlo paso a paso.
----------------------------------------------------------------

Voy a intentar que este tutorial sea válido para tanto para versiones recientes de Ubuntu como para versiones más antiguas. En el momento de escribir este artículo estoy trabajando con [Ubuntu 18.04](http://releases.ubuntu.com/18.04/), pero el tutorial también será compatible con Ubuntu 14.04 y seguramente también sirva para versiones anteriores.

Antes de entrar de lleno en la **configuración de vsftpd**, recordar que en este tutorial **no voy a incluir la configuración del firewall**, ya que cada usuario tendrá instalado el que más le guste. Con esto quiero recordarles que gestionen las reglas del firewall para que permita las conexiones al servidor FTP, que suelen emplear los puertos 20 y 21 a menos que lo configuremos de otra manera. **Sino usas ningún firewall, no necesitarás hacer nada de esto.**

**He elegido vsftpd como servidor FTP porque es muy sencillo de instalar y de usar.** Además lo encontramos en los repositorios oficiales de Ubuntu, lo cual nos simplifica mucho más la tarea.

### Instalar vsftpd en Ubuntu.

Para **instalar vsftpd en Ubuntu 16.04** podemos emplear el comando:  
`sudo apt install vsftpd`

Si empleamos e la versión **Ubuntu 14.04**, el comando que usaremos es:  
`sudo apt-get install vsftpd`

Antes de seguir avanzando, debemos conocer los comandos para iniciar, detener y reiniciar el demonio de vsftpd. **En Ubuntu 16.04 los comandos para iniciar, detener y reiniciar vsftpd son:**  
`sudo systemctl restart vsftpd`  
`sudo systemctl start vsftpd`  
`sudo systemctl stop vsftpd`

**En Ubuntu 10.04 los comandos para iniciar, detener y reiniciar vsftpd son:**  
`sudo service vsftpd restart`  
`sudo service vsftpd start`  
`sudo service vsftpd stop`

### Configurar vsftpd en Ubuntu.

Para configurar vsftpd voy a partir de cero, agregando un nuevo usuario al que darle los permisos adecuados para que pueda subir y bajar archivos a una carpeta determinada. Este usuario quedará encerrado en su carpeta `home`, de forma que no podrá acceder a ninguna otra parte del sistema operativo. De este modo, conseguimos una configuración más segura.

Para añadir el usuario ejecutamos el comando:  
`sudo adduser vozidea`

Tras ejecutar este comando nos solicitará que introduzcamos una contraseña.

Hago un pequeño inciso para recordar el tutorial de [cómo añadir y eliminar usuarios en Linux](https://www.vozidea.com/como-anadir-y-eliminar-usuarios-en-linux) que escribimos hace algún tiempo.

Usaremos este usuario `vozidea` para acceder al servidor FTP. Debemos saber que el sistema de seguridad de jaulas chroot de vsftp encierra al usuario en su carpeta `home`, por lo que en nuestro caso el chroot sería `/home/vozidea`. Además, vsftp maneja las jaulas chroot de forma que se deben cumplir dos condiciones:

*   **El dueño de la carpeta chroot y el usuario que se conecta por FTP no pueden ser el mismo.**
*   **La carpeta chroot no puede tener permisos de escritura.**

Así que debemos cambiar el dueño de esta carpeta con el siguiente comando:  
`sudo chown root:root /home/vozidea`

Si queremos que el usuario pueda subir archivos al servidor FTP, necesitaremos crear una carpeta:  
`sudo mkdir /home/vozidea/ftp_subidas`  
`sudo chown vozidea:vozidea /home/vozidea/ftp_subidas`

**Algo muy importante es quitar el acceso al intérprete de comandos _(shell)_ del usuario `vozidea` que agregamos. Insisto en que es muy importante porque puede suponer un grave riesgo de seguridad.** El problema está en que al quitar acceso a la shell, vsftpd no nos deja acceder al servidor FTP porque el usuario no tiene una shell válida asignada. Para solucionar esto **vamos a crear una shell personalizada, que añadiremos a la lista de shells válidas y finalmente asignaremos esta shell a nuestro usuario**.

Empezamos ejecutando el siguiente comando:  
`sudo nano /bin/ftponly`

Añadimos las siguientes líneas y guardamos el archivo:

```bash
#!/bin/sh
echo "Esta cuenta solo dispone de acceso por FTP."
```

Damos permisos de ejecución a la shell `ftponly` con el comando:  
`sudo chmod a+x /bin/ftponly`

Editamos la lista de shells válidas con el comando:  
`sudo nano /etc/shells`

Añadimos `/bin/ftponly` al final de la lista:

```bash
# /etc/shells: valid login shells
/bin/sh
/bin/dash
/bin/bash
/bin/rbash
/bin/ftponly
```

Asignamos la shell `ftponly` a nuestro usuario:  
`sudo usermod vozidea -s /bin/ftponly`

**Nota importante:** en algunos tutoriales que he podido leer no crean esta shell personalizada `ftponly`, sino que usan la shell del sistema `/usr/sbin/nologin` o `/sbin/nologin`. Como hay varios servicios del sistema que emplean esta shell `nologin`, **no debemos usarla o estaremos creando un problema de seguridad grave**.

Llegados a este punto, ya tenemos nuestro usuario listo. Ahora procedemos a **editar el archivo de configuración de vsftpd** con el comando:  
`sudo nano /etc/vsftpd.conf`

Hay que modificar el archivo eliminando el carácter `#` en las partes correspondientes y haciendo las modificaciones tal y como las mostramos a continuación:

```apache
...
 
# Allow anonymous FTP? (Disabled by default).
anonymous_enable=NO
#
# Uncomment this to allow local users to log in.
local_enable=YES
#
# Uncomment this to enable any form of FTP write command.
write_enable=YES
#
 
...
 
# You may restrict local users to their home directories.  See the FAQ for
# the possible risks in this before using chroot_local_user or
# chroot_list_enable below.
chroot_local_user=YES
#
...
```

Ya sólo nos queda reiniciar vsftpd con el comando que os mostramos al comienzo de este tutorial y pasamos a probar que todo funciona correctamente. Así de sencillo es instalar vsftpd en Linux Ubuntu.

![Probar servidor vsftpd](https://www.vozidea.com/wp-content/uploads/2017/03/probar-servidor-vsftpd.png "Probar servidor vsftpd")

Para probar el servidor FTP podéis probar a conectaros empleando un [cliente FTP como FileZilla](https://dl3.cdn.filezilla-project.org/client/FileZilla_3.41.2_win64-setup.exe?h=zYebHHHn4nzjxSQ0IsqTmQ&x=1554261497).

## Troubleshooting

Quizás ya te haya pasado a mi que aún no puedas conectarte... Aquí recogeré una lista de posibles casos de error:

* **Error: 500 OOPS: vsftpd: refusing to run with writable root inside chroot()**
    * La solución es sencilla, solo debes de añadir esta línea a tu `vsftpd.conf`: `allow_writeable_chroot=YES`
    * Reinicia el servicio
    
* **¿Cómo cambiar el puerto del 21 a otro?**
    * Añade esta línea a tu `vsftpd.conf`: `listen_port=2121`
    * Reinicia el servicio
    
* **Failed to retrieve directory listing**
    * Esto es debido a que necesitas configurar el modo pasivo del FTP ya que un Firewall por parte de tu Ubuntu o bien por la parte del cliente está bloqueando la conexión
    * Necesitarás habilitar el modo pasivo en tu `vsftpd.conf`:
    
```apache
pasv_enable=YES
pasv_min_port=9010
pasv_max_port=9020
```

    * Estos puertos deden de estar abiertos...
    * Reinicia el servicio
    * Configura una nueva sesión en tu Filezilla para poder acceder en modo pasivo, [aquí un tutorial](https://www.nerion.es/soporte/tutoriales/error-connection-timed-out-after-20-seconds-of-inactivity/).
    * No haría falta cambiar las opciones generales a Pasivo, dentro de tu nuevo sitio, ve a "Opciones de Transferencia" y cambia al modo pasivo.

**¡Un saludo!**