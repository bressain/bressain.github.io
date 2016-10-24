---
layout: post
title: jQuery Autocomplete With Columns
date: '2011-06-02T21:40:00.000-06:00'
author: Bressain Dinkelman
tags:
- javascript
- jquery
modified_time: '2014-08-01T21:18:15.480-06:00'
blogger_id: tag:blogger.com,1999:blog-6488571575423175085.post-5365236804254584969
blogger_orig_url: http://www.dinkelburt.com/2011/06/jquery-autocomplete-with-columns.html
permalink: /:year/:month/:title.html
---
My current job has shifted dramatically from doing Windows application development to web development (and then back again, and then back to web, etc.). With that change has come a crash course in JavaScript & jQuery programming.

One of the things I ran into was putting columns in [jQuery's autocomplete](http://jqueryui.com/demos/autocomplete/). I found a [pretty good answer on StackOverflow](http://stackoverflow.com/questions/2744747/quick-example-of-multi-column-results-with-jqueryuis-new-autocomplete) but I wanted to avoid using tables if I could. After some experimentation and a little more research I found an implementation that works.<!--more-->

I'd love to show an example of what I'm talking about within this post but Blogger's javascript support is... lacking ([here it is on my Skydrive if you're truly curious or blogger butchers the code in this post](https://onedrive.live.com/redir?resid=661BCFC5E4E81A60!194&authkey=!AHfEn71qEc7_MX0&ithint=file%2chtml)). Since my JavaScript-fu isn't strong, I welcome any comments on doing this better but anyway, here's the code I came up with:

{% highlight javascript linenos %}
$(function(){
  var wowStuff = [
    {
      id: 1,
      value: "orc warrior",
      faction: "horde",
      race: "orc",
      wowClass: "warrior"
    },
    {
      id: 2,
      value: "orc shaman",
      faction: "horde",
      race: "orc",
      wowClass: "shaman"
    },
    {
      id: 3,
      value: "tauren shaman",
      faction: "horde",
      race: "tauren",
      wowClass: "shaman"
    },
    {
      id: 4,
      value: "tauren paladin",
      faction: "horde",
      race: "tauren",
      wowClass: "paladin"
    },
    {
      id: 5,
      value: "human paladin",
      faction: "alliance",
      race: "human",
      wowClass: "paladin"
    },
    {
      id: 6,
      value: "nelf rogue",
      faction: "alliance",
      race: "night elf",
      wowClass: "rogue"
    },
    {
      id: 7,
      value: "human warrior",
      faction: "alliance",
      race: "human",
      wowClass: "warrior"
    }
  ];

  $("#avatar").autocomplete({
    minLength: 1,
    source: wowStuff,
    select: function(event, ui) {
      $("#avatar").val(ui.item.value);
      $("#faction").text(ui.item.faction);
      $("#avatar-id").val(ui.item.id);
      return false;
    }
  })
  .data("autocomplete")._renderItem = function(ul, item) {
    return $("
<li>
")
      .data("item.autocomplete", item)
      .append("<a><div style='width:300px;'>
<div style='width:100px; float:left;'>
" + item.race + "&nbsp;</div>
<div style='width:100px; float:left;'>
" + item.wowClass + "&nbsp;</div>
<div>
(" + item.faction + ")</div>
</div>
</a>")
      .appendTo(ul);
    };
  });
{% endhighlight %}

With the associated html:

{% highlight html linenos %}
<div>
  <label for="avatar">WoW type</label>
  <input id="avatar" />&nbsp;
  <span id="faction"></span>
  <input id="avatar-id" type="hidden" />
</div>
{% endhighlight %}

It's assumed that the jquery, jquery ui and jquery ui css files are pulled in on the page.

The key to getting the columns to work lies in the _renderItem method override. The autocomplete is going to give you an unordered list tag and an item from the source. What you want to return is the unordered list with whatever list items to add added on.

The pitfalls I ran into were how the items should be formatted:

1. The information needs to be wrapped in an anchor tag to play nice with the jquery ui stuff, then you can start wrapping things in divs (I'm definitely no CSS expert so if it's done wrong, I'd love to know how it should be done).
2. I needed to make sure to set the width on the parent div so that nothing would wrap to another line.
3. Each column had its own div with a set width floated left except for the last one. Whenever I tried to mess with that, the highlighting in the drop-down would be messed up.
4. There's a space at the end of each column in case a field was null/empty. This prevents other nonsense that would happen with the drop-down highlighting.
