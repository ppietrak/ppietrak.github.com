---
layout: post
title: 'Making Pandaboard build usable'
author: 'Przemyslaw Pietrak'
published: true
---

Making Pandaboard Build Usable.

We managed to run Firefox OS on Pandaboard, but there are a lot of problems now - the screen is rotated, mouse cursor is invisible and physical keyboard does not work. We'll now make patches and fixes (some dirty ones) to make it look and behave better.

<!--more-->

The starting point
------------------

At [the end of our previous post](http://ppietrak.github.com/2013/03/01/building-for-pandaboard/), we reached the following:

![](/images/ffos-panda-1-initial.jpg)

Now, lets tackle the issues one by one:


The mouse cursor
----------------

The first annoying issue is lack of mouse cursor. Thankfully, this has already been tackled by Michael Wu. You need to apply two patches listed in [this ticket](https://bugzilla.mozilla.org/show_bug.cgi?id=781039).
The mouse cursor is implemented as a small div element hovering over the document:

    <div id="cursorbox" style="border: 2px solid #FF00FF; position: fixed; 
         padding-left: 2px; padding-top: 2px;"/>  

the accompanying javascript reacts to mouse events by positioning the element:

    case 'mousemove':
        var cbox = document.getElementById("cursorbox");
        cbox.style.left = (evt.screenX + 3) + "px";
        cbox.style.top = (evt.screenY + 3) + "px";

This is simple solution, easy to add and understand. Of course, this solution is far from perfect, as normally mouse cursor should be handled by the system as low-level as possible for best performance. Also, won't there be any side effects for while launching full screen video or during z-index manipulation? We'll see. 

At the moment, the solution works fine and no performance degradation is visible (although, the performance is poor in general). We'll keep it this way for now and maybe get back to the topic when we know Firefox OS better.

Wake it up
----------

Ok, now you can try to play with the device a little bit. Don't configure the wifi yet, as it will cause problems which we'll tackle later on. 
After one minute, the screen will turn off and the device will appear dead. It's not dead, it's just the screen display screen timeout. We're working on mobile system, remember? You can wake the device with HOME key on the keyboard (assuming you have plugged one, otherwise you need to reboot).
You'll probably want to deactivate the screen timout. We can do it simply from the menu (later, it's worth to change default preferences so we don't have to do it after each flashing). 

Screen rotation
---------------

In /gecko/widget/gonk/nsWindow.cpp, we have found the relevant sourcecode. The comment is:

    // Unlike nsScreenGonk::SetRotation(), only support 0 and 180 as there
    // are no known screens that are mounted at 90 or 270 at the moment.
 
Well... 
Let's add support for our unexpected rotation case:

    //	sPhysicalScreenRotation =atoi(propValue) / 90;
	
    +	sPhysicalScreenRotation = nsIScreen::ROTATION_270_DEG;

        switch (sPhysicalScreenRotation) {
        case nsIScreen::ROTATION_0_DEG:
            break;
        case nsIScreen::ROTATION_180_DEG:
            sRotationMatrix.Translate(gfxPoint(gScreenBounds.width,
                                               gScreenBounds.height));
            sRotationMatrix.Rotate(M_PI);
            break;
    +	case nsIScreen::ROTATION_270_DEG:
    +           sRotationMatrix.Translate(gfxPoint(gScreenBounds.height,
    +                                              gScreenBounds.width));
    +           sRotationMatrix.Rotate(M_PI);
    +	    break;
        default:
            MOZ_NOT_REACHED("Unknown rotation");
            break;
        }

We have hard-coded the screen rotation. It should be more likely taken from the system properties for nicer fix. The relevant property (r0.sf.hwrotation) doesn't seem to be set at all. 

Back to the mouse
-----------------

Now, after we have rotated the screen, the mouse behaviour is improper, as it is still asuming horizontal screen orientation when counting movement boundaries. We can do a small patch to solve that:

in /gecko/widget/gonk/nsAppShell.cpp: 

		void
		GeckoPointerController::move(float deltaX, float deltaY)
		{
			float minX, minY, maxX, maxY;
			getBounds(&minX, &minY, &maxX, &maxY);

	-   		mX = clamped(mX + deltaX, minX, maxX);
	-   		mY = clamped(mY + deltaY, minY, maxY);
	+   		mX = clamped(mX + deltaX, minX, maxY); // note the change of last parameter
	+   		mY = clamped(mY + deltaY, minY, maxX); 
		}

Wifi
----

Now, you can start playing with the device. The first thing you'll probably do is wifi activation. Unfortunately, after this is done, your device will probably go mad. 

Thankfully, Olivia McKenzy [found a solution](https://groups.google.com/forum/#!msg/android-building/iyGHyRvkAOg/hT0FHnmRJRgJ). The strange behaviour you'll observe is a result of HOME button being sent constantly - which is somehow triggered out by wifi activity. 

In the folder device/ti/panda there is a file named gpio-keys.kl, you need to comment out the only line there is:

    -   key 102  HOME   WAKE
    +   #key 102  HOME   WAKE

That's it. Now, you can enjoy your Firefox OS on Pandaboard. Have fun!
 

![](/images/ffos-panda-2-landscape.jpg)
![](/images/ffos-panda-3-apps.jpg)
![](/images/ffos-panda-5-3d-advanced.jpg)

A note about screenshots
------------------------

The screenshots above were taken using my mobile phone. If you worked with Android previously, you may be asking - why didn't he use adb to get a nice screenshot? Well, I tried, but with no luck. I tried "adb pull /system/bin/screencap -p", I tried getting and converting framebuffer directly ("adb pull /dev/graphics/fb0", then ffdmpeg), also I checked Android System Monitor and even Negatus command. In all cases, the result is blank image (the file is large as expected). Maybe I am missing something, but for now, we'll stick to my mobile phone for the screenshots.


