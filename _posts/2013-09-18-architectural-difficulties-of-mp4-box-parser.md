---
layout: post
title: 'Architectural diffuculties of MP4 Boxes parsing'
author: 'Przemyslaw Pietrak'
published: true
---

It looks like we have to completely reshape the architecture of mp4Lib. So far, it was a simple toy to familiarize with the MP4 format. Now, when we need to go deeper into fields parsing of each box, we can see that there are many difficulties that need to be handled.

<!--more-->

Dynamic box structure
---------------------
Let's start from the start. The definition of box.

![](/images/mp4-box.png)

Well, this is where we lost our hopes to prepare some static structures to which binary data could be directly mapped.
Each box starts with basic information about its type and size. But as you can see, it is not possible to say how much space will this information take, as it depends on the size value (whether we need to use largesize or not). In fact, the boxtype is the only field that can be read directly from the binary data in straightforward way, as it always occupies 4 bytes starting from offset 4.

A typical case of conditional definitions is the box versioning mechanism. The conditional definitions are not limited to just two options, there may be multiple case switches:

![](/images/mp4-sdes.png)

Loops
-----
*    Loops "till the end of file"
*    Loops "till the value of a certain field"
*    Loops "till the value of formula using a field value"

![](/images/mp4-pdin.png)

![](/images/mp4-ttst.png)

![](/images/mp4-padb.png)





Optional Fields
---------------

Just in case you thought that all fields are mandatory to be used, it is not true. Some fields may be simply skipped. 

![](/images/mp4-metx.png)

Other interesting cases that may blow your architecture off
-----------------------------------------------------------

*    One box may have different boxtypes
This is undoubtly annoying. You cannot simply map a box with boxtype one-to-one. 

![](/images/mp4-free.png)

![](/images/mp4-dref.png)

*    fields may span less than one byte.
This is just in case you believed you can process a binary file as a bytestream, reading each field one by one. Well, you cannot, because some fields take less than one byte. So either you do something like a "bitstream" instead of bytestream (where you can read just several bits), or do some other trick.

![](/images/mp4-padb2.png)



Conclusions
-----------
Box structure may be determined only during data parsing, because the structure depends on the data itself. The conditions that determine the structure may be very complex. We need the possibility to be able to program such condition using a programming language, and to be able to evaluate it in any moment of the parsing.

Hopefully, we believe we have a nice architectural solution for these problems, which we will describe in the next post.





