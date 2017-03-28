---
layout: post
title: Don't Ask, Tell
date: '2013-06-18T00:49:00.000-06:00'
author: Bressain Dinkelman
tags:
- software craftsmanship
modified_time: '2013-06-18T00:49:04.035-06:00'
blogger_id: tag:blogger.com,1999:blog-6488571575423175085.post-645713718912004022
blogger_orig_url: http://www.dinkelburt.com/2013/06/dont-ask-tell.html
permalink: /:year/:month/:title.html
---
I just read Michael Feathers' post [Avoid Null Checks by Replacing Finders with Tellers](http://michaelfeathers.typepad.com/michael_feathers_blog/2013/06/avoid-null-checks-by-replacing-finders-with-tellers.html) and it really made me think about how I write code.
<!--more-->

### Nulls Be Ugly

I am going to concur with Michael, **null checking looks ugly**. I hate null checking so much that often I will change a null check like in his example to a one or two liner return just so the ugly is minimized:

```lang=csharp
if (person == null)
    return;
```

So what he suggests is **rather than ask the object for state, pass a message to the object** that it can handle. I've been [reading](http://www.amazon.com/Growing-Object-Oriented-Software-Guided-Tests/dp/0321503627/)/[hearing](http://rubyrogues.com/category/book-club/) about the whole message passing idea in OOP languages lately ([especially in Ruby](http://www.amazon.com/Practical-Object-Oriented-Design-Ruby-Addison-Wesley/dp/0321721330/)) and although I understand the concept, it's nice to have it illustrated in the post in a useful way.

### Not Hip At All

So there's a little bit of a love-fest going on in the post with Ruby. Or is it a hate-fest with Java? Either way, I looked at both versions and thought, this probably wouldn't look bad in C#.

Poor C# isn't even close to as hip as Ruby nor does it share the kind of heritage that Java has with 'nix OSs but it has had lambdas for several years now and the syntax is quite good. When I started replicating the code in question, I came up with this:

```lang=csharp
_dataSource.Person(id, person =>
    {
        person.PhoneNumber = phoneNumber;
        _dataSource.UpdatePerson(person);
    });
```

I'd say that it's as readable as the Ruby counterpart:

```lang=ruby
data_source.person(id) do |person|
  person.phone_number = phone_number
  data_source.update_person person
end
```

### Going Deeper

Being pleased with myself, I decided to replicate what a common data source implementation would look like and came to Michael's sad conclusion that **we usually ask for the null check pattern** so much that most base/system code is infected with it:

```lang=csharp
public void Person(int id, Action<person> actionOnPerson)
{
    var p = _database.Get<person>(id);
    if (p != null)
        actionOnPerson(p);
}
```

This can be mitigated a bit by calling something that returned an `IEnumerable` or `IList`:

```lang=csharp
public void Person(int id, Action<person> actionOnPerson)
{
    foreach (var p in _database.GetRows<person>(id))
        actionOnPerson(p);
}
```

It might not be as fancy a solution as in Ruby but it'll have to do for now.

There are a lot of interesting comments on [Michael's post](http://michaelfeathers.typepad.com/michael_feathers_blog/2013/06/avoid-null-checks-by-replacing-finders-with-tellers.html) so if you're interested in more about this pattern, I suggest seeing what others have to say about it. One interesting comment mentions including a way to actually have an "else" clause in case the Person object didn't exist. I imagine you could do that with a second lambda but there may be a more intelligent way.

My whole C# solution is [posted on GitHub](https://github.com/bressain/TellDontAsk) for those that are interested. Thanks for reading.
