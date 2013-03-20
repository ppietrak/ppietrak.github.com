---
layout: post
title: 'Hardware keyboard for Firefox OS'
author: 'Przemyslaw Pietrak'
published: true
---

After we run [this javascript key event test](http://unixpapa.com/js/testkey.html) in Firefox OS (which worked fine), we believed that launching physical keyboard would be extremely easy. Well, it was more complex.

<!--more-->

In order to find out what was wrong, we had to debug the whole key event processing from Gonk to Gaia. The only thing we knew that was working well, was virtual keyboard with its quite complicated architecture (for security reasons there is a separate process to handle virtual keyboard, you may find some details on [Chris Peterson's Blog](http://www.cpeterso.com/blog/2012/11/60-second-tour-of-b2gs-virtual-keyboard/)).

The most important thing to know, is that key event carries two fields that describe the key: one is keyCode, the other is charCode. Both fields have different meaning: keyCode describes the physical key being pressed, while charCode represents the character value entered. So, for example, if you press '1' while holding SHIFT, on typical English keyboard the resulting event should have keyCode='1', charCode='!'. More sophisticated things happen for non-English keyboards, where diacretics may be trigerred by ALTs. In case of Japanese or Korean keyboards, single characters are entered by the sequence of physical key presses (in this case, only the last key event in sequence carries charCode).

After some debugging we discovered that:

*    Synthesized virtual key events carry correct charCode, but the keyCode is always zeroed. 
*    In contrast, physical key events carry correct keyCode, but the charCode is not set!

The second issue is obviously the source of problem. In order to fix that and supply the missing charCode, we needed access to two things:

*    The metastate information. The keyboard metastate describes the current state of key interpretation (for example, if ALT or SHIFT is pressed). We debugged it a little and found out that the metastate is correctly updated by lower layers, but ignored by nsAppShell keyEvent sending.
*    The keyboard character mapping. The keyboard mapping is correctly loaded from file ("Generic.kcm" in case of generic keyboard) during device registration. Unfortunately, it is not passed nor exposed to nsAppShell. We have added a dirty hack exposing the keyboard mapping via static variable. This is of course not the proper fix; apart from the ugliness of static variable itself, the variable will be overwritten if there are more than one keyboard mappings. At the moment, we'll simply put the ugly fix for now and notify B2G team so they can propose something nicer.

Finally, we can use the physical keyboard for Pandaboard.

<iframe width="560" height="315" src="http://www.youtube.com/embed/yM69vJHXTOI" frameborder="0" allowfullscreen></iframe>

Exposing the character map:
---------------------------

widget/gonk/libui/Keyboard.cpp

	@@ -125,6 +125,11 @@ status_t KeyMap::loadKeyLayout(const InputDeviceIdentifier& deviceIdentifier,
		 return OK;
	 }
	 
	+static KeyCharacterMap *exposedMap; 

	 status_t KeyMap::loadKeyCharacterMap(const InputDeviceIdentifier& deviceIdentifier,
		     const String8& name) {
		 String8 path(getPath(deviceIdentifier, name,


	@@ -139,6 +144,10 @@ status_t KeyMap::loadKeyCharacterMap(const InputDeviceIdentifier& deviceIdentifi
		     return status;
		 }
	 
	+    exposedMap = map;
		 keyCharacterMapFile.setTo(path);
		 keyCharacterMap = map;
		 return OK;


	@@ -151,9 +160,15 @@ String8 KeyMap::getPath(const InputDeviceIdentifier& deviceIdentifier,
		         : getInputDeviceConfigurationFilePathByName(name, type);
	 }
	 
	 
	+KeyCharacterMap *getCharacterMap() //PPI
	+{
	+    return exposedMap;
	+}

	 bool isEligibleBuiltInKeyboard(const InputDeviceIdentifier& deviceIdentifier,
		     const PropertyMap* deviceConfiguration, const KeyMap* keyMap) {
		 if (!keyMap->haveKeyCharacterMap()



widget/gonk/libui/Keyboard.h:

	@@ -36,6 +36,8 @@ enum {
	 class KeyLayoutMap;
	 class KeyCharacterMap;
	 
	+KeyCharacterMap *getCharacterMap();
	+
	 /**
	  * Loads the key layout map and key character map for a keyboard device.
	  */



Adding charCode to key events:
------------------------------

widget/gonk/nsAppShell.cpp

	@@ -197,29 +208,42 @@ sendTouchEvent(UserInputData& data, bool* captured)
		 return nsWindow::DispatchInputEvent(event, captured);
	 }
	 
	+
	+#include "libui/Keyboard.h"
	+
	 static nsEventStatus
	 sendKeyEventWithMsg(uint32_t keyCode,
		                 uint32_t msg,
		                 uint64_t timeMs,
	-                    uint32_t flags)
	+                    uint32_t flags,
	+                    uint16_t charCode)
	 {
		 nsKeyEvent event(true, msg, NULL);
		 event.keyCode = keyCode;
	+    event.charCode = charCode; 
		 event.time = timeMs;
		 event.flags |= flags;
		 return nsWindow::DispatchInputEvent(event);
	 }
	 
	 static void
	-sendKeyEvent(uint32_t keyCode, bool down, uint64_t timeMs)
	+sendKeyEvent(uint32_t keyCode, bool down, uint64_t timeMs, uint16_t charCode)
	 {
		 nsEventStatus status =
	-        sendKeyEventWithMsg(keyCode, down ? NS_KEY_DOWN : NS_KEY_UP, timeMs, 0);
	+        sendKeyEventWithMsg(keyCode, down ? NS_KEY_DOWN : NS_KEY_UP, timeMs, 0, charCode);
		 if (down) {
		     sendKeyEventWithMsg(keyCode, NS_KEY_PRESS, timeMs,
		                         status == nsEventStatus_eConsumeNoDefault ?
	-                            NS_EVENT_FLAG_NO_DEFAULT : 0);
	+                            NS_EVENT_FLAG_NO_DEFAULT : 0, charCode);
		 }
	 }
	 
	@@ -227,12 +251,17 @@ sendKeyEvent(uint32_t keyCode, bool down, uint64_t timeMs)
	 #include "GonkKeyMapping.h"
	 
	 static void
	-maybeSendKeyEvent(int keyCode, bool pressed, uint64_t timeMs)
	+maybeSendKeyEvent(int keyCode, bool pressed, uint64_t timeMs, int metaState)
	 {
		 if (keyCode < ArrayLength(kKeyMapping) && kKeyMapping[keyCode])
	-        sendKeyEvent(kKeyMapping[keyCode], pressed, timeMs);
	+    {
	+        char16_t charCode = android::getCharacterMap()->getCharacter(keyCode, metaState);
	+        sendKeyEvent(kKeyMapping[keyCode], pressed, timeMs, charCode);
	+    }
		 else
	 

	@@ -470,10 +499,20 @@ GeckoInputDispatcher::dispatchOnce()
		                    status != nsEventStatus_eConsumeNoDefault);
		     break;
		 }

		 case UserInputData::KEY_DATA:
		     maybeSendKeyEvent(data.key.keyCode,
		                       data.action == AKEY_EVENT_ACTION_DOWN,
	-                          data.timeMs);
	+                          data.timeMs,
	+                          data.metaState );
		     break;
		 }
	 }



