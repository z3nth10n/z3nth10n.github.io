---
layout: post
section-type: post
title: Como instalar Windows 10 en Proxmox con los drivers de VirtIO
date:   2019-04-04 16:00:00 +0100
categories: tutorial
language: es
locale: 'es'
permalink: "/:language/:year/:month/:day/how-to-install-w10-in-promox-with-virtio-drivers.html"
---

Una guía (afortunadamente) infalible sobre cómo instalar una instalación de Windows 10 en Proxmox VE. La manera correcta.

Necesitarás:

* Una ISO de Windows 10 (¿necesitas una? Sugiero ver la herramienta `Media Creation` [aquí](https://www.microsoft.com/en-us/software-download/windows10))
* Una ISO de VirtIO estable (comienza mirando [aquí](https://fedoraproject.org/wiki/Windows_Virtio_Drivers#Direct_download))
* Una instalación de Proxmox VE

Instrucciones:

1. Carga los ISO de Windows 10 y VirtIO en el almacenamiento local de su nodo
2. Haz clic en "Crear VM"
    ![](https://jonspraggins.com/wp-content/uploads/2017/09/createvm.png)
3. Asigna VMID y Nombre, haz clic en "Siguiente" para ir a la pestaña OS
4. Selecciona "Windows 10/2016", haz clic en "Siguiente" para ir a la pestaña CD / DVD
5. Selecciona su ISO de Windows 10, haz clic en "Siguiente" para ir a la pestaña Disco duro
    ![](https://jonspraggins.com/wp-content/uploads/2017/09/isoselect.png)
6. Elige “VirtIO” como su Bus. Especifica su ubicación y tamaño de almacenamiento. Recuerda, el almacenamiento mínimo es de 16 GB para un sistema operativo de 32 bits y 20 GB para un sistema operativo de 64 bits. Bajo el caché, seleccione "Write back" (esto aumenta el rendimiento, pero es un poco más arriesgado). Haz clic en "Siguiente" para ir a la pestaña de la CPU
    ![](https://jonspraggins.com/wp-content/uploads/2017/09/harddisk.png)
7. Asigna tantos zócalos y núcleos como su entorno lo permita. 2 núcleos y 2 sockets suelen ser óptimos, en circunstancias normales, dependiendo de su entorno. Habilita `Numa`. Haga clic en "Siguiente" para ir a la pestaña Memoria
8. Asigna Ram como sea necesario. Recuerda, la memoria mínima es de 1 gigabyte (GB) para 32 bits y 2 GB para 64 bits. Haga clic en "Siguiente" para ir a la pestaña Red
9. Selecciona "VirtIO (paravirtualizado)" como el modelo. Todos los demás ajustes están sujetos a tu entorno. Haz clic en "Siguiente" para ir a la pestaña Confirmar
10. Confirma todos los ajustes y haz clic en "Finalizar".
11. Una vez que aparezca la nueva pestaña de la máquina virtual a la izquierda, observa la configuración del hardware.
12. Agrega un segundo CD / DVD, elige la ISO de VirtIO como la imagen.
    ![](https://jonspraggins.com/wp-content/uploads/2017/09/virtioiso.png)
13. Arranca tu VM, abre la consola.
14. La VM debería arrancar el Windows 10 ISO.
    ![](https://jonspraggins.com/wp-content/uploads/2017/09/win10boot-1024x829.png)
15. Procede con la instalación de forma normal. Cuando pulses "¿Qué tipo de instalación desea?", Selecciona "Personalizar: instalar solo Windows (avanzado)".
16. Recibirás un aviso de que no tienes los controladores de almacenamiento necesarios para que Windows detecte un disco duro.
    ![](https://jonspraggins.com/wp-content/uploads/2017/09/stordrivererror-1024x826.png)
17. Selecciona "Cargar controlador", luego busca el CD **virtio-win**. Desplázate hasta `viostor>w10>amd64` y haz clic en "Aceptar"
    ![](https://jonspraggins.com/wp-content/uploads/2017/09/viostorfolder-1024x826.png)
18. Windows detectará el controlador "Controlador SCSI Red Hat VirtIO". Haz clic en Siguiente". Ahora aparecerá el disco duro. Particiona el disco como mejor te parezca, o simplemente haz clic en "Siguiente".
19. Windows comenzará el proceso de instalación. Dependiendo de su entorno, esto puede tardar unos minutos.
20. La instalación se reiniciará. En este punto, puedes eliminar la ISO de Windows 10 (o la unidad de CD / DVD completa) a través de la pestaña Hardware en Proxmox, pero manten la ISO de VirtIO. Lo necesitaremos para la red y los controladores de memoria.
21. Continua configurando Windows configurando tu ubicación, teclado, nombre de usuario, contraseña, sugerencia de contraseña, configuración de privacidad, etc. Notarás que cuando aparece la pestaña "conectarse a una red", no hay opciones disponibles.
22. Una vez que tengas un escritorio real, abra el "Administrador de dispositivos".
23. Notará dos dispositivos con controladores faltantes: Controlador de Ethernet (La tarjeta de red VirtIO) y Dispositivo PCI (Memoria)
    ![](https://jonspraggins.com/wp-content/uploads/2017/09/devman-1024x826.png)
24. Actualiza el controlador del controlador Ethernet navegando al CD **virtio-win**. Desplázate hasta `NetKVM>w10>amd64` y haz clic en "Aceptar". Windows debe detectar e instalar el "Adaptador Ethernet Red Hat VirtIO". Tu máquina virtual debe poder acceder a las funciones de la red, siempre que tu hardware esté configurado correctamente.
25. Actualiza el controlador del dispositivo PCI navegando al CD **virtio-win**. Desplázate hasta `balloon>w10>amd64` y haz clic en "Aceptar". Windows debe detectar e instalar el "Controlador de memoria VirtIO".
26. Puedes eliminar el CD **virtio-win** (o el dispositivo de CD / DVD) en la pestaña Hardware de la VM en la GUI de Proxmox. Ten en cuenta que puedes eliminar el ISO inmediatamente. La eliminación del dispositivo requiere que apague la máquina virtual.
    ![](https://jonspraggins.com/wp-content/uploads/2017/09/removedevice-1024x733.png)
    
Las líneas rojas estarán allí hasta que apagues e inicies la máquina virtual desde Proxmox.

**¡Un sasludo!**