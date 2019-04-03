---
layout: post
section-type: post
title: 4 formas de extraer contenido de una máquina virtual (VMDK) cuando está totalmente inutilizada
date:   2019-04-03 16:00:00 +0100
categories: tutorial
language: es
locale: 'es'
permalink: "/:language/:year/:month/:day/4-ways-extact-content-vmdk-vm-totally-dead.html"
---

A veces, necesitas desesperadamente tus datos de una máquina virtual en VMWare, ¡pero esa máquina simplemente no puede encenderse por alguna razón! Bueno, puedes intentar iniciar esa VM una vez más según [este artículo] (https://kb.vmware.com/s/article/1003648) y acceder a los datos con un poco de suerte. Pero, si no tienes suerte y la VM está muerta, necesita otro método para extraer el contenido del archivo VMDK.

**Disclaimer:** Ninguno de los métodos que discuto aquí funciona si hay datos cifrados en el disco. Descifrar es un tema bastante amplio que se incluirá en esta publicación. Por lo tanto, en el artículo de hoy, analizo cómo recuperar datos del disco VM muerto que no está dañado ni encriptado.

Eso es absolutamente cierto que hay varios tipos de discos. Todos se describen [aquí](https://pubs.vmware.com/vsphere-50/index.jsp?topic=%2Fcom.vmware.vddk.pg.doc_50%2FvddkDataStruct.5.3.html). No quiero escribir mucho sobre ellos en este artículo, ya que tienen muchas cosas en común en términos de extracción de datos.

## ** Espera, ¿qué es realmente un VMDK? **

Bueno, primero, echemos un vistazo debajo de VMDK. Cada disco consta de dos archivos más pequeños: el descriptor y el archivo plano. El primero no es más que un archivo de texto visible en cualquier editor de texto. El descriptor mantiene parámetros tales como IDS, versión de hardware virtual y geometría del disco. El archivo &#x2A;flat.vmdk, a su vez, es donde residen los datos de la máquina virtual. En el navegador del almacén de datos, tanto el descriptor como el &#x2A;flat.vmdk se muestran como un solo volumen VMDK.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/1.png)](http://www.vmwareblog.org/wp-content/uploads/2018/09/1.png)

El único momento en que el contenido de VMDK aparece en primer plano es cuando se descarga el archivo. Luego, aparece un mensaje que le pide que permita la descarga de varios archivos.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/2-1.png)](http://www.vmwareblog.org/wp-content/uploads/2018 /09/2-1.png)

A nivel local, puedes ver ambos archivos con su tamaño real.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/3-1.png)](http://www.vmwareblog.org/wp-content/uploads/2018 /09/3-1.png)

En este punto, me gustaría mencionar que a menos que alguno de esos tipos funcione, ninguna de las formas de extraer el contenido del archivo VMDK descrito en mi artículo funciona. Hoy no veo esos casos en los que necesita recuperar tus datos de los archivos dañados. Solo te enseñaré cómo extraer datos cuando tienes un VMDK en buen estado, pero no puedes iniciar la VM por algún motivo. También tenga en cuenta que hacer las cosas que escribo aquí puede ser bastante arriesgado, ya que la mayoría de los métodos que analizo hoy le permiten acceder a un disco VM como un volumen de lectura-escritura. ¡Ten cuidado y no me culpes si te equivocas!

Vale, con eso dicho, veamos ahora cómo obtiene tus datos. Hay dos tipos de métodos para hacerlo: métodos que permiten modificar el contenido del disco (montaje de VMDK como un volumen de lectura-escritura) y métodos exclusivamente para la recuperación de datos (abrir el archivo como un volumen de solo lectura).

## ** Montaje del disco como un volumen de lectura-escritura **

### ** Simplemente agregue el VMDK a otra máquina virtual ESXi **

Bueno, eso puede sonar un poco trivial, pero ¿por qué simplemente no conectas el VMDK a la VM saludable? Conectar el disco a otra máquina virtual, por mi dinero, es la forma más fácil y confiable de obtener sus datos. Si tienes recursos suficientes en el host ESXi, o si solo puede usar un servidor más, no invente la rueda y agregue el VMDK a otra VM. Ten en cuenta que la VM en buen estado debe tener exactamente el mismo sistema operativo que la muerta para evitar cualquier problema de incompatibilidad de formato. En este artículo, todos los discos están formateados para NTFS y yo uso Windows Server 2016 para organizarlos.

Vale, empecemos. Llegue al host con ESXi Web Console para acceder al disco de destino. Recuerde, puede agregar el disco a la máquina virtual saludable sobre la marcha.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/4-1.png)](http://www.vmwareblog.org/wp-content/uploads/2018 /09/4-1.png)

Especifica la ruta al VMDK y presione **Seleccionar**. En mi caso, el disco está ubicado exactamente en el mismo host donde reside la VM en buen estado. Bueno, honestamente, eso no es inteligente para hacer nada con ese VMDK, así que haz una copia de ese disco y juega con la copia.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/5-1.png)](http://www.vmwareblog.org/wp-content/uploads/2018 /09/5-1.png)

Verifica todos los ajustes y presione **Guardar**.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/6-1.png)](http://www.vmwareblog.org/wp-content/uploads/2018 /09/6-1.png)

Vaya a **Administración de discos** y ponga en línea el disco recientemente agregado. Una vez más, la VM a la que acabo de agregar el disco se encuentra bajo la organización de Windows Server 2016.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/7-1.png)](http://www.vmwareblog.org/wp-content/uploads/2018 /09/7-1.png)

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/8-1.png)](http://www.vmwareblog.org/wp-content/uploads/2018 /09/8-1.png)

Ahora, en el Explorador de Windows, puede acceder a los datos. Ten en cuenta que puedes modificar o eliminar datos, ya que utiliza VMDK como un volumen de lectura y escritura. Deberías guardar una copia del disco en caso de que arruines las cosas.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/9-1.png)](http://www.vmwareblog.org/wp-content/uploads/2018 /09/9-1.png)

## **VMware Workstation**

Otra forma fácil de acceder al contenido de VMDK es agregar el disco a VMware Workstation. Puede descargar VMware Workstation [aquí](https://www.vmware.com/products/workstation-pro/workstation-pro-evaluation.html).

Una vez que abra VMware Workstation, vaya al menú **Archivo** y seleccione **Asignar discos virtuales** allí.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/10-1.png)](http://www.vmwareblog.org/wp-content/uploads/2018 /09/10-1.png)

A continuación, presione el botón **Mapa...**.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/11-1.png)](http://www.vmwareblog.org/wp-content/uploads/2018 /09/11-1.png)

Antes de comenzar, descarga el VMDK. En el menú **Map Virtual Disk**, busca el volumen. Desactiva la opción de modo de solo lectura y selecciona la letra de unidad. Presiona **Ok** para conectar el disco.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/12-1.png)](http://www.vmwareblog.org/wp-content/uploads/2018 /09/12-1.png)

VMware Workstation le advierte sobre el riesgo de alterar el contenido del disco. Bueno, con suerte, usted sabe lo que está haciendo, así que presione **Sí**.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/13.png)](http://www.vmwareblog.org/wp-content/uploads/2018/09 /13.png)

El Explorador de Windows se abre justo después de conectar el disco.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/14.png)](http://www.vmwareblog.org/wp-content/uploads/2018/09 /14.png)

Una vez que haya terminado con ese disco, no olvides desconectarlo. Así es como haces eso. Vaya al menú **Mapa o Desconectar discos virtuales**. Selecciona el disco y presiona **Desconectar**. Verás el mensaje que te impide desconectar el VMDK. Dice que es posible que el disco aún esté en uso y que deberías pensarlo dos veces antes de desconectarlo. Pero, si ya obtuviste los datos necesarios y no hay aplicaciones que usen datos en el disco, presiona **Forzar desconexión**.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/15.png)](http://www.vmwareblog.org/wp-content/uploads/2018/09 /15.png)

### ** VMware Virtual Disk Development Kit **

Ahora, veamos cómo acceder al disco con VMware Virtual Disk Development Kit (VDDK). VDDK es un montón de utilidades prácticas para desarrolladores. Vmware-mount.exe, la utilidad que permite realizar algunas manipulaciones con VMDK, en las que recuperar datos se encuentra entre ellas.

Primero, descargue VDDK [aquí](https://my.vmware.com/web/vmware/details?downloadGroup=VSP510-VDDK-510&productId=268). Ten en cuenta que necesitsa que la versión del kit sea anterior a 5.1 \. vmware-mount.exe no está incluido en las versiones posteriores del kit. Después de la instalación, la utilidad estará disponible de forma predeterminada por la siguiente ruta: `C:\Archivos de programa (x86)\VMware\VMware Virtual Disk Development Kit\bin`. Ahora, ejecuta CMD.EXE y vaya a `C:\Archivos de programa (x86)\VMware\VMware Virtual Disk Development Kit\bin`. A continuación, ejecuta la utilidad con la opción `/p` y especifique la ruta al archivo VMDK (`C:\temp\Win2008Serv.vmdk` en mi caso).

Observa que el volumen consta de 2 archivos. Obviamente, necesitas el más grande (el segundo en mi caso). Entonces, asigna la letra de unidad (yo uso Z: aquí) y escribe `/v:2` para montar ese volumen. Debes montar el archivo como el volumen de lectura y escritura, por lo que agrega `/m:w` antes de la ruta del archivo VMDK. También puedes habilitar el modo no persistente para garantizar que los cambios en el disco de la máquina virtual se descarten una vez que se apague la máquina virtual.

Finalice el comando con la ruta al disco VMDK **. ** En mi caso, el cmdlet completo tiene el aspecto siguiente:

```dos
C:\Archivos de programa (x86)\VMware\VMware Virtual Disk Development Kit\bin> vmware-mount.exe Z: /v:2 /m:w C:\temp\Win2008Serv.vmdk
```

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/16-1024x221.png)](http://www.vmwareblog.org/wp-content/uploads/2018 /09/16-1024x221.png)

Una vez que se haya montado el disco, ábrelo en el Explorador de Windows.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/17.png)](http://www.vmwareblog.org/wp-content/uploads/2018/09 /17.png)

Una vez que hayas terminado, desconecta el VMDK. Escribe la letra del disco y termine la línea con /f. Tenga en cuenta que el sistema le impide cualquier otra forma de desconectar el disco ya que todavía está en uso.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/18-1024x250.png)](http://www.vmwareblog.org/wp-content/uploads/2018 /09/18-1024x250.png)

Ten en cuenta que hay muchas más opciones de las que he mencionado en este artículo. Puedes averiguar más sobre ellos con `vmware-mount.exe /? cmdlet`.

## ** Métodos exclusivamente para la recuperación de datos **

### ** 7-zip **

Otra forma bastante sencilla de acceder al VMDK es abrirlo como un archivo con 7-zip. Es cierto que 7-zip es una herramienta poderosa que te permite hacer un poco más que simplemente descomprimir algunos archivos. Por ejemplo, permite abrir un archivo VMDK como un archivo regular. Puedes descargar esa aplicación [desde el sitio oficial](https://www.7-zip.org/download.html). Abrir el disco VM con 7-zip es bueno exclusivamente para la recuperación de datos, ya que el archivo se abre en modo de solo lectura. En otras palabras, no se puede hacer nada con los datos. Ahora, veamos cómo realmente puede obtener los datos.

Descarga el disco de la máquina virtual y abre el archivo con 7-zip.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/19.png)](http://www.vmwareblog.org/wp-content/uploads/2018/09 /19.png)

A continuación, abre el archivo más grande. En mi caso, es 1.ntfs.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/20.png)](http://www.vmwareblog.org/wp-content/uploads/2018/09 /20.png)

Aquí están los directorios y archivos disponibles en el disco.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/21.png)](http://www.vmwareblog.org/wp-content/uploads/2018/09 /21.png)

Copia los datos.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/22-1.png)](http://www.vmwareblog.org/wp-content/uploads/2018 /09/22-1.png)

Comprueba si ha recuperado todos los datos.

[![](http://www.vmwareblog.org/wp-content/uploads/2018/09/23-1.png)](http://www.vmwareblog.org/wp-content/uploads/2018 /09/23-1.png)

Finalmente, una vez que hayas terminado de copiar los datos, asegúrate de salir de la utilidad para evitar que se bloquee el disco hasta que se reinicie.

## ** Conclusión **

En este artículo, he analizado 4 las formas más útiles de acceder a los contenidos de VMDK sin encender la máquina virtual. Bueno, puedes encontrar muchas otras formas de extraer un contenido de disco de VM, pero las que mencioné anteriormente, por mi dinero, son las mejores. Una vez más, todos los métodos que analicé aquí funcionan solo si ninguno de los componentes del volumen VMDK está dañado. Es posible que necesite hacer otras cosas si alguno de esos archivos está dañado o encriptado. Deseo que nunca estés en la situación cuando necesites alguno de los métodos que describo aquí.

**¡Un saludo!**