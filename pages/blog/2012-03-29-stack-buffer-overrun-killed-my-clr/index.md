---
layout: post
title: Stack Buffer Overrun Killed My CLR!
date: '2012-03-29T12:42:00.000-06:00'
author: Bressain Dinkelman
tags:
- error
- .Net
modified_time: '2012-03-29T12:42:50.394-06:00'
blogger_id: tag:blogger.com,1999:blog-6488571575423175085.post-5787934104109838125
blogger_orig_url: http://www.dinkelburt.com/2012/03/stack-buffer-overrun-killed-my-clr.html
permalink: /:year/:month/:title.html
---
So I ran into an interesting problem the last few days. And by ran into I mean made me lose more hair than I have already lost! It took quite a bit of research and I thought I'd help the Internet by sharing what I ran into.
<!--more-->

### The Problem

We've been working on a new version of our product that was originally built on .Net 3.5 but has been migrated to .Net 4.0. Part of that application does a DllImport on some unmanaged code which has worked great in .Net 3.5.

```lang=csharp
[DllImport("unmanagedStuff.dll", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
public static extern int UNMANAGEDSTUFF_FooBar(int id, int status, string name);
```

Now that we're using .Net 4.0 the method that uses that DllImport is crashing. And I mean crashing HARD. There's a try/catch around the method call but it's not getting that far. There's no minidump to be seen, but there is an entry in the Windows event log:

```lang=nohighlight
Faulting application name: MyAppService.exe, version: 2.0.0.2, time stamp: 0x4f738b08 Faulting module name: clr.dll, version: 4.0.30319.239, time stamp: 0x4e181a6d Exception code: 0xc0000409 Fault offset: 0x002b60d0 Faulting process id: 0x15b8 Faulting application start time: 0x01cd0dc5e21cf6a0 Faulting application path: C:\Program Files (x86)\MyCompany\MyAppService.exe Faulting module path: C:\Windows\Microsoft.NET\Framework\v4.0.30319\clr.dll Report Id: 5453534c-79b9-11e1-8970-000c29dad353
```

### Research

Wow. The freaking CLR died. No wonder no exception was caught. I looked up the exception code and it said that it was a Stack Buffer Overrun exception.

Stack buffer overrun? Can that happen in .Net? No, not really, but I *was* calling into unmanaged code which led me to believe that the unmanaged code was bad. Of course, if that code was bad, why did it work when .Net 3.5 was calling it?

Looking through StackOverflow.com I found a few things. Apparently stack buffer overrun protection has been in place in Windows for unmanaged code for a while [but was ignored until .Net 4.0](http://stackoverflow.com/a/6318675/738917). I can't say for sure that this is why I'm running into problems but seems likely.

### The Solution

Then I ran across [this](http://social.msdn.microsoft.com/Forums/en/clr/thread/a197c527-da91-4ef0-8230-330f58f9abb4) and [this](http://blogs.msdn.com/b/dsvc/archive/2009/12/28/investigating-a-gscookie-corruption.aspx?Redirected=true) that talk about changing the calling convention from `__declspec` to `__stdcall`. At first I didn't think much of it because this was all C++ code and I was dealing with .Net. And then it hit me, that `DllImport` is using `Cdecl` isn't it? So then I changed the `CallingConvention` to use the `StdCall` and things started to magically work!

```lang=csharp
[DllImport("unmanagedStuff.dll", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.StdCall)]
public static extern int UNMANAGEDSTUFF_FooBar(int id, int status, string name);
```

I wish I knew all the technical details about why this made things work but if this helps someone else out, I'll be happy enough.
