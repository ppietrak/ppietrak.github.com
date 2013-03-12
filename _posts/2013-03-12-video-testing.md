---
layout: post
title: 'Video testing with software decoding'
author: 'Piotr Ziomacki'
categories: Video
tags: B2G pandaboard video 
published: true
---

In this post I present results of video playback tests on B2G on Pandaboard. What we wanted to test was capability of playing mp4 files (with and without HTML <video> tag) within web browser, but also streamed content from services like [Dailymotion] (http://www.dailymotion.com) and [Youtube](http://www.youtube.com/).

<!--more-->

As a default there is only software decoding available on Pandaboard B2G build. Because of that and from our previous experience with Android on Pandaboard, we didn't expect any astonishing performance from B2G.

We started with the simplest case: launching video on Youtube and Dailymotion within web browser. On both services it was possible only to launch SD quality (h264 codec, 320x240, 512x384 resolutions, mp4 container) videos and gerneral performance was bad. Although there were no problem with sound, the video was jamming constantly.

Next step was to check mp4 file. For this case we obtained direct link to mp4 SD quality file from Dailymotion. Accessed as direct link, file wasn't played at all. When we wrapped the same link with html <video> tag file was played. There were no problem with sound. The video was slightly jamming, although it was not as sever as on Dailymotion.

The conclusion is that the video problems on original dailymotion page were caused by lack of processing power because of javascript and webpage rendering existing on the original page.

Below you can watch video how [“Big Buck Bunny” video](http://camendesign.com/code/video_for_everybody/test.html) (accessed via <video> tag) is played on B2G on Pandaboard: 

http://www.youtube.com/watch?v=zKFA4OwdGQg


We weren't able to play any HD material (h264 codec, 720p, mp4 container).Dailymotion player returned "Network problem" error. Wrapping direct link within video tag helped partially - video was not played but audio was audible.

Our next step is try to turn on hardware decoding on Pandaboard and then retest video playback.

