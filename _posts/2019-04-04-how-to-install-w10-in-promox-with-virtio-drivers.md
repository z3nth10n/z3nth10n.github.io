---
layout: post
section-type: post
title: How to install Windows 10 in Proxmox with VirtIO drivers
date:   2019-04-04 16:00:00 +0100
categories: tutorial
language: en
locale: 'en'
permalink: "/:language/:year/:month/:day/how-to-install-w10-in-promox-with-virtio-drivers.html"
---

A (hopefully) fool-proof guide on how to install a Windows 10 installation on Proxmox VE.  The right way.

Given:

*   A Windows 10 ISO (Need one?  I suggest looking at the Media Creation tool [here](https://www.microsoft.com/en-us/software-download/windows10))
*   A stable VirtIO ISO (Start by looking [here](https://fedoraproject.org/wiki/Windows_Virtio_Drivers#Direct_download))
*   A Proxmox VE Installation

Instructions:

1.  Upload both the Windows 10 and VirtIO ISOs to your node’s local storage
2.  Click on “Create VM”  
    ![](https://jonspraggins.com/wp-content/uploads/2017/09/createvm.png)
3.  Assign VMID and Name, click “Next” to go to the OS tab
4.  Select “Windows 10/2016”, click “Next” to go to the CD/DVD tab
5.  Select your Windows 10 ISO, click “Next” to go to the Hard Disk tab  
    ![](https://jonspraggins.com/wp-content/uploads/2017/09/isoselect.png)
6.  Choose “VirtIO” as your Bus.  Specify your storage location and size.  Remember, the minumum storage is 16 GB for a 32-bit OS and 20 GB for a 64-bit OS.  Under cache, select “Write back” (this increases performance, but is slightly riskier).  Click “Next” to go to the CPU tab  
    ![](https://jonspraggins.com/wp-content/uploads/2017/09/harddisk.png)
7.  Assign as many sockets and cores as your environment permits.  2 cores and 2 sockets is often optimal, under normal circumstances, depending on your environment.  Enable Numa.  Click “Next” to go to the Memory tab
8.  Assign Ram as needed. Remember, the minimum memory is 1 gigabyte (GB) for 32-bit and 2 GB for 64-bit.  Click “Next” to go to the Network tab
9.  Select “VirtIO (paravirtualized)” as the Model.  All other settings are subject to your environment.  Click “Next” to go to the Confirm tab
10.  Confirm all settings and click “Finish”.
11.  After your new VM tab appears on the left, look at its hardware settings.
12.  Add a second CD/DVD, choose the VirtIO iso as the image.  
    ![](https://jonspraggins.com/wp-content/uploads/2017/09/virtioiso.png)
13.  Boot your VM, open the console.
14.  The VM should boot the Windows 10 ISO  
    ![](https://jonspraggins.com/wp-content/uploads/2017/09/win10boot-1024x829.png)
15.  Proceed with the installation as normal.  When you hit the “Which type of installation do you want?”, select “Custom: Install Windows only (advanced)”.
16.  You will get a notice that you don’t have the storage drivers necessary for Windows to detect a hard drive.  
    ![](https://jonspraggins.com/wp-content/uploads/2017/09/stordrivererror-1024x826.png)
17.    Select “Load Driver”, then browse to the virt-win CD.  Drill down to viostor > w10 > amd64 and click “OK”  
    ![](https://jonspraggins.com/wp-content/uploads/2017/09/viostorfolder-1024x826.png)
18.  Windows will detect the “Red Hat VirtIO SCSI controller” driver.  Click “Next”.  The hard drive will now appear.  Partition the drive as you see fit, or just click “Next”.
19.  Windows will begin the installation process.  Depending on your environment, this may take a few minutes.
20.  The installation will reboot.  At this point, you may remove the Windows 10 ISO (or the entire CD/DVD Drive) via the Hardware tab in Proxmox, but keep the VirtIO ISO.  We’ll need it for networking and the memory balloon drivers.
21.  Continue setting up Windows by configuring your location, keyboard, username, password, password hint, privacy settings, etc.  You’ll notice that when the “connect to a network” tab appears, there’s no options available.
22.  Once you have an actual desktop, open up the Device Manager.
23.  You’ll notice two devices with missing drivers: Ethernet Controller (The VirtIO Network Card) and PCI Device (Memory Ballooning)![](https://jonspraggins.com/wp-content/uploads/2017/09/devman-1024x826.png)
24.  Update the Ethernet Controller driver by navigating to the virtio-win CD. Drill down to NetKVM > w10 > amd64 and click “OK”.  Windows should detect and install the “Red Hat VirtIO Ethernet Adapter”.  Your VM should be able to access network features, provided your hardware was appropriately configured.
25.  Update the PCI Device driver by by navigating to the virtio-win CD. Drill down to Balloon > w10 > amd64 and click “OK”.  Windows should detect and install the “VirtIO Balloon Driver”.
26.  You can remove the virtio-win CD (or the CD/DVD Device) in the VM’s Hardware tab on the Proxmox GUI.  Bear in mind that you can remove the ISO immediately.  Removing the device requires you to shutdown the VM.
    
![](https://jonspraggins.com/wp-content/uploads/2017/09/removedevice-1024x733.png)
    
The Red lines will be there until you shutdown and start the VM from Proxmox.