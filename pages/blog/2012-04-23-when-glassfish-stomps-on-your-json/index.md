---
layout: post
title: When GlassFish Stomps On Your JSON
date: '2012-04-23T22:51:00.000-06:00'
author: Bressain Dinkelman
tags:
- javascript
- backbone
- glassfish
- error
- grails
modified_time: '2012-04-23T22:51:45.145-06:00'
blogger_id: tag:blogger.com,1999:blog-6488571575423175085.post-5366582599195818182
blogger_orig_url: http://www.dinkelburt.com/2012/04/when-glassfish-stomps-on-your-json.html
permalink: /:year/:month/:title.html
---
Funny thing about learning new technologies and stacks, you run into all kinds of hard to diagnose problems. Here's one that I ran into that took a few days to figure out.<!--more-->

### The Problem

The stack I'm working on right now is a Backbone front end with a Grails back end running on Glassfish. The thing about Backbone is since everything is in Javascript, you do a lot of jQuery calls to get/update content. One of the things to consider when doing that is error handling.

In one of my Backbone views, I'm issuing an update via a button click. This sends a post up to the server and if there's a problem, it's supposed to return some JSON as an error:

```lang=js
_submitUserUpdates:function () {
    var that = this;

    var ajaxResult = that.controller.saveModel(this.model);
    ajaxResult.success(function () {
        MahFramework.showNotificationMessage('Successfully saved.');
        Backbone.history.navigate('', {trigger:true});
    });
    ajaxResult.error(MahFramework.serverErrorHandler);
}
```

If there's an error, it gets handled by a utility written to handle errors from the Grails stack:

```lang=js
MahFramework.serverErrorHandler = function(jqXHR, textStatus, errorThrown) {
    var errorText = '',
        serverErrors;

    if (!jqXHR || jqXHR.responseText)
        return;

    serverErrors = JSON.parse(jqXHR.responseText);

    if (!serverErrors || !serverErrors.errors)
        return;

    _.each(serverErrors.errors, function(serverError){
        if(serverError.message){
            errorText += serverError.message + '<br/><br/>';
        }
    });

    $('#errorMessage').flashMessage({
        error: errorText
    });
};
```

I was testing the error handling which worked fine on my box but when it would get deployed to GlassFish, the errors weren't happening. I looked at the response coming back from the server and the JSON was in it but right behind it was this big chunk of HTML from GlassFish:

```lang=json
{"errors":[{"message":"password.change.error.current"}]}
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
  <head>
    <title>GlassFish Server Open Source Edition 3.1 - Error report</title>
    <style type="text/css">
      <!--
      H1 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:22px;}
      H2 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:16px;}
      H3 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:14px;}
      BODY {font-family:Tahoma,Arial,sans-serif;color:black;background-color:white;}
      B {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;}
      P {font-family:Tahoma,Arial,sans-serif;background:white;color:black;font-size:12px;}
      A {color : black;}
      HR {color : #525D76;}
      -->
    </style>
  </head>
  <body>
    <h1>HTTP Status 400 - </h1>
    <hr/>
    <p>**type** Status report</p>
    <p>**message**</p>
    <p>**description**The request sent by the client was syntactically incorrect ().</p>
    <hr/>
    ###GlassFish Server Open Source Edition 3.1
  </body>
</html>
```

So what the hell? Now GlassFish has decided in its infinite wisdom to add to my JSON? I searched and searched for some kind of setting to change to make it not do that. Guess what, didn't find it. The controller code I was calling to was simple enough:

```lang=groovy
def update = {
    try{
        render(toJSON(domainService.update(request.JSON)))
    }
    catch(Exception exception){
        render(text: toJSON(exception.message), status: 400)
    }
}
```

Why wasn't it just giving me the JSON? Also, why was it working through the Grails stack on my box?

### Select Isn't Broken

Turns out I need to learn more about HTTP content headers. I gave up on configuring GlassFish, walked away from the problem for a while and then one day it dawned on me: in Grails, if you use render without specifying the content type it's just going to assume you're sending HTML. I made one minor tweak by specifying the content type and boom, no GlassFish in my JSON:

```lang=groovy
def update = {
    try{
        render(toJSON(domainService.update(request.JSON)))
    }
    catch(Exception exception){
        render(contentType: 'text/json', text: toJSON(exception.message), status: 400)
    }
}
```

Hope this helps someone.
