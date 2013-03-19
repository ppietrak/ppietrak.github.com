---
layout: post
title: 'Quick video playback test on Linaro'
author: 'Piotr Ziomacki'
published: true
---

We made a test on Android [Linaro](http://www.linaro.org/) build for Pandaboard. We wanted to see if it use HW decoding to play video files. If it does, then we could probably use Linaro source code as reference for enabling video test on B2G. Unfortunately results were just like on Firefox OS.

<!--more-->

Below you can watch [“Big Buck Bunny” video](http://camendesign.com/code/video_for_everybody/test.html) playback on linaro. In the first part of video you can see that homescreen current build of Linaro on Pandaboard is quite fast and responsive. Ater starting a video you can tell right away that it is software decoded, because it is jamming constantly. In the video you have also a glimpse on logcat output, where you can see that SW codec was loaded to play the video.

<iframe width="640" height="360" src="http://www.youtube.com/embed/wLDk6FCD-yY" frameborder="0" allowfullscreen></iframe>






