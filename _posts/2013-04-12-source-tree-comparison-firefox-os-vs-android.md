---
layout: post
title: 'Source Tree Comparison Firefox OS vs Android'
author: 'Przemyslaw Pietrak'
published: true
---

When we pulled Firefox OS sources first time, we were greatly surprised to find the source tree very similar to Android. In fact, the whole lower system layer (including kernel) and many tools come directly from Android.

Today, let's compare the source trees of both projects. We believe it could be very useful to everyone, who wants to get familiar with Firefox OS, and already has some Android background.

<!--more-->

Root Folder
-----------

![](/images/comparison.png)

Taking a look at the root folder comparison clearly shows that both projects have a lot in common. Let's try to analyze the differences one by one. We skipped WORKING_DIRECTORY, download-panda, tmp, out, objdir-gecko, vendor. These are of course unimportant, either temporary or utility folders related to the build process (specifically on pandaboard which we use)

What is missing
---------------
* development

This folder was used for the application-level development, hence it is removed completely. It contained sdk, applications and aplication examples, as well as tools and documentation. All of this will need to be replaced by B2G replacements.

* packages

The packages folder included standard Android applications that were available as part of the AOSP (Camera, SMS, Dialer etc). These are of course removed, replaced by Gaia. Also, the hooks to Google services (Contacts, Calendar etc) were here, and are removed. 
Most of the removed packages will need to have their replacements in B2G, and currently are only partially covered.
From our point of view, it is worth to remember that one of the removed package is DRMProvider, which was a java interface to DRM.

* sdk

The SDK, similarly to the "development" folder, is focused on development of Android applications. As such, it is not relevant to B2G.

* cts

The Compatibility Test Suite is removed, as the tests were too high-level: written in java and working on top of dalvik, using java interfaces (which are missing in B2G).
In B2G, there is no separate test suite for the system as a whole; instead, separate test suites exist inside Gonk and Gaia.

* docs

This folder contained the static version of android.com content; as such, it is not fully relevant to B2G version. Moreover, the site and the Android trademark is owned by Google; it might have been incompliant with Mozilla's licensing. Thridly, is there really a need to have offline version of a website included? 

What is new
-----------
* gaia

A replacement of Android standard apps. It includes basic built-in apps like system settings, browser, calendar, camera, on-screen keyboard or video player. There is also application marketplace and some showcase apps like crystal skull.

* gecko

The browser engine used by Firefox browser. The engine plays the role of dalvik - it is capable of running Firefox OS applications, handles the user interface etc.

* gonk-misc

A system configuration files which start gecko on AOSP. There is really not much inside, just start and configration scripts (httpd.conf, init.rc) plus boot animation

* rilproxy

B2G's interaction with the Radio Interface Layer of Android. The RIL (located in hardware/ril) provides access to the radio hardware, which is needed to send/receive calls, SMS messages, and other things that require interaction with a cell network. 

* tools, scripts

Some tools, mostly for test automation

Hey, why is dalvik still there?
-------------------------------
Quite surprisingly at first look, dalvik folder hasn't been removed. But in fact, there is no dalvik inside. It has been replaced with fake implementation inside fake_dvm.cpp. Let's take a look inside:

	#include "jni.h"

	jint JNI_CreateJavaVM(JavaVM **vm, JNIEnv **env, void *args)
	{
	  return JNI_ERR;
	}

That's pretty much it. The whole dalvik in B2G.



