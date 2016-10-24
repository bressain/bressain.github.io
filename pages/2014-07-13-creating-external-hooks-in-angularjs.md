---
layout: post
title: Creating External Hooks In AngularJS Directives
date: '2014-07-13T16:02:00.000-06:00'
author: Bressain Dinkelman
tags:
- javascript
- angularjs
- jquery
modified_time: '2014-07-13T16:02:00.046-06:00'
blogger_id: tag:blogger.com,1999:blog-6488571575423175085.post-1713226070972689975
blogger_orig_url: http://www.dinkelburt.com/2014/07/creating-external-hooks-in-angularjs.html
permalink: /:year/:month/:title.html
---
I ran into an interesting problem a few weeks ago at work. I was working on a stand-alone widget/directive that had the following requirements:

* Create a widget that shows the amount of comments for a given resource.
* Pull the count from a site commenting service.
* Move focus to another widget (most likely a related commenting widget) when this widget is clicked.
  * **The other widget may or may not be an Angular widget.**
* Allow external widgets/things tell the directive to update its comment count from the service.
  * **The external "thing" may or may not be an "Angular thing".**

Since the widget would usually be in an Angular app, making an Angular directive seemed like the thing to do. The directive would also be offered as a self-bootstrapping chunk of javascript for pages that weren't using Angular but that's beyond the scope of this post.<!--more-->

Making the widget itself wasn't too bad but making those external hooks was a bear (for me anyway). The code is a little stripped down for public consumption but here's basically what I started with:

{% highlight javascript linenos %}
'use strict';

angular.module('comment-widget', []);
angular.module('comment-widget').factory('commentService', ['$http', '$q', '$window', function ($http, $q, $window) {
  return {
    getInitData: function (objectId, objectTypeId) {
      var deferred = $q.defer();

      $http.get('initdata?objectid=' + objectId + '&objecttypeid=' + objectTypeId)
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function () { deferred.reject({ commentCount: 0, resourceStrings: { commentButton: 'Comment' } }); });

      return deferred.promise;
    },

    getCommentCounts: function (objectId, objectTypeId) {
      var deferred = $q.defer();
      var payload = { "objects": [{ "objectId": objectId, "objectTypeId": objectTypeId }] };

      $http.post('counts', payload)
        .success(function (data) {
          deferred.resolve(data.counts.length > 0 ? data.counts[0].count : 0);
        })
        .error(function () { deferred.reject(0); });

      return deferred.promise;
    }
  };
}]);
angular.module('comment-widget').controller('CommentCtrl', ['commentService', '$scope', function (commentService, $scope) {
  initialize();

  $scope.refreshComments = function () {
    commentService.getCommentCounts($scope.objectId, $scope.objectTypeId)
      .then(function (result) { $scope.commentCount = result; });
  };

  function initialize() {
    commentService.getInitData($scope.objectId, $scope.objectTypeId)
      .then(function (result) {
        $scope.commentCount = result.commentCount;
        $scope.resourceStrings = result.resourceStrings;
      });
  }
}]);
angular.module('comment-widget').directive('commentWidget', function () {
  var template =
    '<div>' +
      '<button type="button" class="buttonL">{{resourceStrings.commentButton}}</button><button type="button" class="buttonR">{{commentCount}}</button>' +
    '';

  return {
    restrict: 'E',
    replace: true,
    scope: {
      objectId: '=',
      objectTypeId: '='
    },
    controller: 'commentCtrl',
    template: template
  }
});
{% endhighlight %}

### Move Focus To Another Widget

First up was moving focus to another widget. This actually wasn't too bad but my first attempt was pretty terrible (it involved some external javascript object that was difficult to use). Thanks to some tips from a coworker, it was decided to use a bit of the jqLite included to trigger a jQuery event on button click.

{% highlight javascript linenos %}
link: function (scope, element, attrs) {
  element.find('.buttonL').on('click', function () {
    element.triggerHandler($.Event('comment.click', { objectId: scope.objectId, objectTypeId: scope.objectTypeId }));
  });
}
{% endhighlight %}

And then the accompanying html:

{% highlight html linenos %}
<script>
  $(function () {
    $('#my-widget').on('comment.click', function (data) {
      alert('comments was clicked with\nobjectId: ' + data.objectId + '\nobjectTypeId: ' + data.objectTypeId);
    });
  });
</script>
{% endhighlight %}

There are a few things that may seem odd here but they are super important to remember:

* Because jqLite is being utilizing here and this seemed like a "view-like" interaction, nothing is going down to the controller.
* The triggerHandler method is being used rather than trigger because jqLite doesn't offer trigger.
* Rather than using the jQuery event construction shorthand, it's important to pass in an Event object. I'm uncertain to why, but it's the only way it would work.

### Update Widget From External Source

Like the previous requirement, my first attempt was pretty terrible until I brought jQuery events into the mix.

{% highlight javascript linenos %}
link: function (scope, element, attrs) {
  element.on('comment.refresh', function () {
    scope.refreshComments();
  });
}
{% endhighlight %}

{% highlight html linenos %}
<script>
  $(function () {
    $('#refresh-button').click(function() {
      $('#my-widget').trigger('comment.refresh');
      alert('comments were refreshed');
    });
  })
</script>
{% endhighlight %}

I love the simplicity of the solution here. Through jQuery the external script sends an event and it's picked right up by the directive. Very, very slick.

What I learned through all of this was while I was beating my head against my keyboard trying to figure out how to come up with a solution that was "The Angular Way", I forgot that at the end of the day, **it's just javascript**. And because it's just javascript, you can <i>usually</i> pull in whatever library to help you accomplish your goals or even just do something in [vanilla.js](http://vanilla-js.com/) if it comes down to it.

If you're interested in the end result, [head over to this gist here](https://gist.github.com/bressain/6b722d2310a70504b471). Getting that directive under test was half the battle as well so **all of the tests are included**. Please leave a comment if you have a question or if something is missing.
