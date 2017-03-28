---
layout: post
title: Yay RabbitMQ Part 1
date: '2013-06-05T13:13:00.000-06:00'
author: Bressain Dinkelman
tags:
- rabbitmq
modified_time: '2013-06-05T13:13:11.024-06:00'
thumbnail: http://1.bp.blogspot.com/-KGV4i38I-zs/UaevKzEzzYI/AAAAAAAABoA/sefnUfEs0dU/s72-c/rabbitmq_logo_strap.png
blogger_id: tag:blogger.com,1999:blog-6488571575423175085.post-523908644591682665
blogger_orig_url: http://www.dinkelburt.com/2013/06/yay-rabbitmq-part-1.html
permalink: /:year/:month/:title.html
---
<div markdown="1" class="inline-image">
  <img src="/blog/images/rabbitmq_logo_strap.png" alt="rabbitmq logo" />
</div>

One thing I've been working with a lot lately is [RabbitMQ](http://www.rabbitmq.com/). It was a bit confusing to work with at first but I think a lot of that was primarily because there was already a code base in place that was using it. Now that I've had a chance to understand the why's and hows, I thought I'd share some of my experiences with it.
<!--more-->

### Why Queues Or RabbitMQ?

Any kind of process that doesn't need a UI response is an excellent candidate for a queue. There are many blog posts out there about queue architecture and RabbitMQ but here are the more popular ones:

* Send an email
* Log actions to a database/Hadoop cluster
* Fire events that other services can react to
* Queue up reports to run

There are other other queuing systems out there like [MSMQ](http://msdn.microsoft.com/en-us/library/windows/desktop/ms711472(v=vs.85).aspx), [ZeroMQ](http://www.zeromq.org/), [ActiveMQ](http://activemq.apache.org/), etc. but RabbitMQ seems to be the fastest with durable message support. RabbitMQ also has some [great library support](http://www.rabbitmq.com/devtools.html) out there for many different languages including my current language of choice, .Net.

### How Does It Work?

[Setting up a cluster](http://www.rabbitmq.com/download.html) is beyond the scope of this post but I'll just mention that it can run on Windows or Linux as it ultimately runs on top of Erlang. This makes for an easier install, simple administration and great options (you can even cluster Windows and Linux boxes together... though I wouldn't recommend it). One other note is to **make sure you have the admin plugin installed** as this is a major selling point for RabbitMQ as it not only looks good, it's highly functional.

#### Email And Exchanges (no, not that Exchange)

**The best thing I've seen RabbitMQ compared to is an email system.** What do you need to send an email? Well, you need an email address for one thing. And usually you'll have a subject with the message. Once you have those things, you can send an email to someone.

To send a message through a RabbitMQ cluster, you need an exchange and a routing key. **An exchange is like an email account** in that it has a unique name on the cluster and its job is to receive messages. **A routing key is much like the subject on the message**, it's there to tell more about the message.

#### Queues, Queues, Queues

You can send an email to an address but unless there's a client pulling the messages, the email account just gets full of unread email. In order to read those emails, you connect an email client to the account and start reading messages.

With RabbitMQ **the email client is much like a queue**. When you create a queue, you tell it what exchange to listen to and then start pulling messages off.

So what about the email subject and the routing key? Here's where the abstraction starts to leak a little bit but bear with me.

When you first connect an email client to an email account, everything comes through the inbox. If you get a lot of messages that are similar, you usually want to create rules to place the messages in a specific folder or tag. If your senders are nice enough, you can filter on the subject line. This doesn't happen often but let's just assume that they're super nice.

**Routing keys are like those really reliable subject lines.** When you create a queue, you define what exchange and routing key to subscribe to. If you want all the messages (like the inbox), you can use a single routing key and everything sent to the exchange will go to the one queue. If you create a queue with a specific routing key, only messages sent through the exchange with that routing key will get sent to the queue. You can even use wildcards with topic queues to do some fancier routing.

### Makes Sense, Now What?

<div markdown="1" class="center-image captioned-image">
    <img src="/blog/images/cluster.png" alt="RabbitMQ cluster diagram" />
    <p>One exchange and two queues with different routing keys.</p>
</div>

So here's what I've covered conceptually in the image above. The `my.queue` queue is pulling messages from the `my.exchange` exchange that have a routing key of `my.key`. The `my.other.queue` queue is pulling messages from the same exchange, but only messages with a `my.other.key` routing key.

It took me a while to understand this overview of how everything works so hopefully you won't have to go through the confusion that I went through. With this knowledge in place, you're ready to learn how to actually code against a cluster. Since I'm not crazy about super long posts, I'm going to leave that to another time which is hopefully in the not-too-distant future. Thanks for reading and if there's anything you'd like me to cover, please leave a comment.
