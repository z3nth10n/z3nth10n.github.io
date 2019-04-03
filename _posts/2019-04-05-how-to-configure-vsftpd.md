---
layout: post
section-type: post
title: How to configure VSFTPD on Linux
date:   2019-04-05 16:00:00 +0100
categories: tutorial
language: en
locale: 'en'
permalink: "/:language/:year/:month/:day/how-to-configure-vsftpd.html"
---

All the tutorials that I have read at the moment about **how to install vsftpd** start at the same place, **warning that the FTP protocol is insecure because it is not encrypted**. This is true, but it is also true that if you want to set up a local FTP server for your own use, using vsftpd is the fastest and easiest solution. For this reason I decided to write this **tutorial on how to install vsftpd on Linux Ubuntu and configure it correctly step by step**.

![How to install vsftpd in Linux Ubuntu and configure it correctly](https://www.vozidea.com/wp-content/uploads/2017/03/como-instalar-vsftpd-en-Linux-Ubuntu.png "How to install vsftpd in Linux Ubuntu and configure it correctly")

It is also necessary that you know the alternatives to FTP considered secure, where we find the protocols **sFTP** and **SCP** as the most used. We can also configure vsftpd to use a secure connection under SSL / TLS.

**Although it is relatively easy to configure vsftp with SSL / TLS, I will not include it in this tutorial, since the objective is to make a quick and simple explanation.** You may dedicate a tutorial to that aspect later.

How to install vsftpd on Linux Ubuntu and configure it step by step.
--------------------------------------------------------------------

I will try to make this tutorial valid for both recent versions of Ubuntu and for older versions. At the time of writing this article I am working with [Ubuntu 18.04] (http://releases.ubuntu.com/18.04/), but the tutorial will also be compatible with Ubuntu 16.04 and will surely also work for previous versions.

Before fully entering the **vsftpd** configuration, remember that in this tutorial **I am not going to include the firewall configuration**, since each user will have installed the one they like the most. With this I want to remind you to manage the rules of the firewall to allow connections to the FTP server, which usually use ports 20 and 21 unless we configure it in another way. **If you use no firewall, you will not need to do any of this.**

**I have chosen vsftpd as FTP server because it is very easy to install and use.** We also find it in the official Ubuntu repositories, which simplifies our task much more.

### Install vsftpd in Ubuntu.

To **install vsftpd in Ubuntu 16.04 && 18.04** we can use the command:
```bash
$ sudo apt install vsftpd
```

If we use the version **Ubuntu 14.04**, the command that we will use is:
```bash
$ sudo apt-get install vsftpd
```

Before proceeding further, we must know the commands to start, stop and restart the vsftpd daemon. **In Ubuntu 16.04 && 18.04 the commands to start, stop and restart vsftpd are:**
```bash
$ sudo systemctl restart vsftpd
```
```bash
$ sudo systemctl start vsftpd
```
```bash
$ sudo systemctl stop vsftpd
```

**In Ubuntu 10.04 the commands to start, stop and restart vsftpd are:**
```bash
$ sudo service vsftpd restart
```
```bash
$ sudo service vsftpd start
```
```bash
$ sudo service vsftpd stop
```

### Configure vsftpd in Ubuntu.

To configure vsftpd I'm going to start from scratch, adding a new user to give him the appropriate permissions so he can upload and download files to a certain folder. This user will be locked in his `home` folder, so he will not be able to access any other part of the operating system. In this way, we get a more secure configuration.

To add the user we execute the command:
```bash
$ sudo adduser z3nth10n
```

After executing this command, you will ask us to enter a password.

I make a small paragraph to remember the tutorial of [how to add and remove users in Linux](https://www.vozidea.com/como-anadir-y-deliminar-usuarios-en-linux) that we wrote some time ago.

We will use this user `z3nth10n` to access the FTP server. We should know that the chroot security system of vsftp encloses the user in its `home` folder, so in our case the chroot would be `/home/z3nth10n`. In addition, vsftp handles chroot cages so that two conditions must be met:

* ** The owner of the chroot folder and the user who connects via FTP can not be the same. **
* ** The chroot folder can not have write permissions. **

So we must change the owner of this folder with the following command:
```bash
$ sudo chown root:root /home/z3nth10n
```

If we want the user to be able to upload files to the FTP server, we will need to create a folder:
```bash
$ sudo mkdir /home/z3nth10n/ftp_subidas
```
```bash
$ sudo chown z3nth10n:z3nth10n /home/z3nth10n/ftp_subidas
```

**Something very important is to remove the access to the command interpreter _(shell)_ from the user `z3nth10n` that we added. I insist that it is very important because it can pose a serious security risk.** The problem is that when removing access to the shell, vsftpd does not allow us to access the FTP server because the user does not have a valid shell assigned. To solve this **we are going to create a custom shell, which we will add to the list of valid shells and finally we will assign this shell to our user**.

We start by running the following command:
```bash
$ sudo nano /bin/ftponly
```

We add the following lines and save the file:

```bash
#!/bin/sh
echo "This account only has FTP access."
```

We give execution permissions to the `ftponly` shell with the command:
```bash
$ sudo chmod a+x /bin/ftponly
```

We edit the list of valid shells with the command:
```bash
$ sudo nano /etc/shells
```

We add `/bin/ftponly` to the end of the list:

```bash
# /etc/shells: valid login shells
/bin/sh
/bin/dash
/bin/bash
/bin/rbash
/bin/ftponly
```

We assign the `ftponly` shell to our user:
```bash
$ sudo usermod z3nth10n -s /bin/ftponly
```

**Important note:** In some tutorials that I have been able to read, do not create this custom `ftponly` shell, but use the system shell `/usr/sbin/nologin` or `/sbin/nologin`. As there are several system services that use this shell `nologin`, **we should not use it or we will be creating a serious security problem**.

At this point, we have our user ready. Now we proceed to **edit the configuration file of vsftpd** with the command:
```bash
$ sudo nano /etc/vsftpd.conf
```

You have to modify the file by removing the `#` character in the corresponding parts and making the changes as shown below:

```apache
...
 
# Allow anonymous FTP? (Disabled by default).
anonymous_enable = NO
#
# Uncomment this to allow local users to log in.
local_enable = YES
#
# Uncomment this to enable any form of FTP write command.
write_enable = YES
#
 
...
 
# You can restrict local users to their home directories. See the FAQ for
# the possible risks in this before using chroot_local_user or
# chroot_list_enable below.
chroot_local_user = YES
#
...
```

We only need to restart vsftpd with the command that we showed you at the beginning of this tutorial and we went on to prove that everything works correctly. It's that simple to install vsftpd on Linux Ubuntu.

![Test server vsftpd](https://www.vozidea.com/wp-content/uploads/2017/03/probar-servidor-vsftpd.png "Test server vsftpd")

To test the FTP server you can try to connect using [an FTP client such as FileZilla](https://dl3.cdn.filezilla-project.org/client/FileZilla_3.41.2_win64-setup.exe?h=zYebHHH4N4ZjxSQ0IsqTmQ&x=1554261497).

## Troubleshooting

Maybe it has already happened to you like me that you still can't connect... Here I will collect a list of possible error cases:

* **Error: 500 OOPS: vsftpd: refusing to run with writable root inside chroot()**
    * The solution is simple, you just have to add this line to your `vsftpd.conf`:` allow_writeable_chroot = YES`
    * Restart the service
    
* **How to change port from 21 to another?**
    * Add this line to your `vsftpd.conf`: `listen_port=<port numer>` (example: `listen_port=2121`)
    * Restart the service
    
* **Failed to retrieve directory listing**
    * This is because you need to configure the FTP in passive mode since a Firewall from your Ubuntu or from the client-side is blocking the connection
    * You will need to enable passive mode in your `vsftpd.conf`:
    
```apache
pasv_enable = YES
pasv_min_port = 9010
pasv_max_port = 9020
```

    * These ports must be open (on the server-side, via port-forwarind or by using Firewall rules)...
    * Restart the service
    * Configure a new session in your Filezilla to be able to access in passive mode, [there is a tutorial](https://hoststud.com/resources/resolved-error-connection-timeout-after-20-seconds-of-inactivity.368/).
    * It would not be necessary to change the general options to Passive, within your new site, go to "Transfer Options" and change to passive mode.

**Best regards!**