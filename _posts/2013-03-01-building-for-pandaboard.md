---
layout: post
title: 'Building Firefox OS for Pandaboard'
author: 'Przemyslaw Pietrak'
published: true
---

Building Firefox os for Pandaboard.

Our first task - running Firefox OS on Pandaboard - was mostly following other's recipes.  
But you'll need to google a lot, before you'll be able to take the mouse and play with the device. 
In this post, we'll sum up all the needed actions step by step, assuming you have a new Panda and
fresh installation of Ubuntu. 

<!--more-->

Prerequisities
--------------

What you will need is:

*   Pandaboard (you can read about it and order one from [pandaboard.org](http://pandaboard.org) )
*   SD card with 4Gigs at minimum
*   Smartcard reader (to format SD card)
*   &gt;30 GB free hdd space
*   Ubuntu 10.04-12.04 64-bit (documentation says 10.04-11.10, but it works on 12.04 in our case)

Beware, it will take some time, especially if you are doing it for the first time. We're about to download, configure and build several gigs of tools and sourcecodes. 

Install Java JDK and Android SDK.
---------------------------------

If you are Firefox OS newbie (like us), you may be surprised.
In fact, the whole lower layer of Firefox OS (below Gecko) is directly taken from Android Open Source Project. 
This is quite a clever move, as it allows to use many existing devices with their latest Android-targetted drivers. From the application level perspective, the underlying Android system is completely invisible (Firefox OS runs it's web applications on Gecko level), so current marriage with Android doesn't have to last forever. In the future, Gecko may easily migrate to other lower-layer system. But for now, we'll work with Android+Gecko.

Therefore, you will need to use many of the tools of Android SDK in order to work with the device (flash it, debug, see logcat etc). 
 
There are two tutorials you may follow. You can pick one you wish, in case of troubles having the other one as reference.
The first is a nice step-by-step tutorial on [rootzwiki](http://rootzwiki.com/topic/20770-guideinstall-java-android-sdk-adb-and-fastboot-in-linux-ubuntu-and-mint12/) 
Just remember you are having Ubuntu 64bit and follow it.
The other is [the official one at android.com](http://source.android.com/source/initializing.html)

Please don't forget to configure USB access. After this step is done, you should be able to launch ADB and communicate with an Android phone via USB. 

We will now follow the instructions listed [here](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox_OS/Pandaboard?redirectlocale=en-US&redirectslug=Firefox_OS%2FPandaboard) 

Format SD Card
--------------

The description at [omappedia.org](http://omappedia.org/wiki/Minimal-FS_SD_Configuration) is quite long as it lists several alternative methods. The quickest is:

-   download the script at http://git.openembedded.org/openembedded/tree/contrib/angstrom/omap3-mkcard.sh
-   modify the script, by changing "Angstrom" to "rootfs"
-   run the script: 

        sudo ./omap3-mkcard.sh /dev/sd<x>
    
    If you are not sure which device is your smartcard reader, then you may unplug it, list devices (ls /dev/sd*), plug it and list devices again.

Pull B2G source and configure it 
--------------------------------

    git clone git://github.com/mozilla-b2g/B2G.git
    cd B2G
    ./config.sh pandaboard

The instructions are at [Preparing for your first B2G build](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox_OS/Preparing_for_your_first_B2G_build)

Build and flash B2G
-------------------

Now, follow the [Pandaboard Building and Flashing](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox_OS/Pandaboard#Building_and_flashing)

The instructions suggest to pull and build Negatus, an automation tool used for testing and debugging. You can probably skip it for now, thus saving yourself from installing Android NDK required by Negatus. If you prefer to follow the instructions, please notice that it advises to use rc5 version of NDK, which is not the current one. You'll have to manually modify the file path during download.

Known Issues
------------

Take a look at the known issues listed at the [Pandaboard Building and Flashing](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox_OS/Pandaboard#Building_and_flashing). You'll probably run over these sooner or later.
The particularly annoying one is **"Sometimes, flashing will claim to be successful, but it isn't."**. This happened to us several times. Usually, it is easy to recognize unsuccesfull flashing, as the flash contents get corrupted and board wouldn't boot up. But once or twice we experienced a situation, when the flashing claimed to be succesfull, while in fact it didn't happen at all. 
If that happens, you may spend quite a lot time wondering why your latest sourcecode modifications misteriously didn't work as expected. The device boots up and behaves just like no modifications were made...

It works!
---------

After all this hard fight you can observe your Panda to boot Firefox OS. It will look like this:

![](/images/ffos-panda-1-initial.jpg)

To see logs, type:

    adb logcat


It works, but it's quite unusable yet. 

There are several annoyances now:

*   the screen is rotated
*   there is no mouse cursor (although mouse does work, it's just you cannot see the cursor)
*   physical keyboard doesn't work except for HOME key
*   the device constantly goes into sleep mode (you can wake it up with HOME)
*   if you configure wifi, the device goes mad
*   The fonts are a little blurred, and it seems that there is something wrong with the screen resolution configuration, causing some scalling to occur

We'll see now how to make Firefox OS on Pandaboard usable.
