# shushjax #

[![Code Climate](https://codeclimate.com/github/Team-Pr0xy/shushjax.png)](https://codeclimate.com/github/Team-Pr0xy/shushjax)  [![Scrutinizer Quality Score](https://scrutinizer-ci.com/g/Team-Pr0xy/shushjax/badges/quality-score.png?s=1a51e1f05b984d9558b93c872d7b3045f0a2ec58)](https://scrutinizer-ci.com/g/Team-Pr0xy/shushjax/)  
Standalone (no jQuery) Headerless pUSHstate + aJAX. Makes your pages load crazy fast by only loading the new content and injecting it into the current CSS and layout. Doesn't require special backends or other plugins like jQuery. shushjax uses ajax and pushState to deliver a fast browsing experience with real permalinks, page titles, and a working back button. shushjax works by grabbing html from your server via ajax and replacing the content of a container on your page with the ajax'd html. It then updates the browser's current url using pushState without reloading your page's layout or any resources (js, css), giving the appearance of a fast, full page load. But really it's just ajax and pushState. Inspired by the [original PJAX](https://github.com/defunkt/jquery-pjax), forked from [PJAX-Standalone](https://github.com/thybag/PJAX-Standalone) and with pjax-fw ported over. It's about 3kb minified + gzipped. This code is licensed under the MIT License. For [browsers that don't support pushState](http://caniuse.com/#search=pushstate), or any of the other features it requires, shushjax gracefully degrades.  

Documentation: http://shushjax.teampr0xy.net  
By JC Hulce: http://www.jchulce.com

### PJAX-Standalone ###
Originally by thybag at https://github.com/thybag/PJAX-Standalone  
A standalone implementation of push state AJAX, designed for use on non-JQuery web pages.

### pjax-fw ###
Originally by JoahG at https://github.com/JoahG/pjax-fw  
A purely frontend pjax framework, for use without a special backend

## Why? ##
Compared to the original PJAX, shushjax offers additional flexibility, performance, and ease of implementation. 
* No server header or special backend requirements means that shushjax can be used on static hosts and CDNs like GitHub pages and S3
* No jQuery required means that the browser does not need to load and process tens of kilobytes of unused javascript, increasing performance

## Compatability ##
This code should work in in Chrome, Firefox, Opera, Safari, Android, iOS, and IE7,8, 9, and 10+. 
shushjax is supported in Chrome, Firefox, Safari, Android, iOS, and Opera, while in old IE the fallbacks operate.

### Usage Instructions

To add shushjax to your page, you will need to include the shushjax.js script in to the head of your document. It's best to use a version that's minified + gzipped and served from a CDN. 

Once done, shushjax can be setup in 3 ways. 

#### Option 1
Give all links a data-shushjax attribute specifing where to place the content that gets loaded.:

    <a href='page1.php' data-shushjax='content'>Page 1</a>

Then call:

	shushjax.connect();

#### Option 2
Add links normally

	<a href='page2.php'>Page 2</a>
	
Then specify which container they should use, via 

	pjax.connect({container: 'content'});

#### Option 3
Set all links with a specific class to use a particular container using:

```
	<a href='page2.php' class='jaxer'>Page 2</a>
```

```
	shushjaxjax.connect('content', 'jaxer');
```	

### Callbacks

shushjax implements the following callbacks 

* beforeSend - Called before ajax request is made
* complete - When ajax request has completed
* success - When ajax request has completed successfully
* requestError - When ajax request did not complet successfully (error 500 etc)
* generalError - When a problem occurs elsewhere, like parsing the document

The callbacks are specified as part of the original shushjax.connect method:

	shushjaxjax.connect({
		'container': 'content',
		'beforeSend': function(){console.log("before send");},
		'complete': function(){console.log("done!");},
	});

In addition to the callbacks the following options can also be provided to shushjax.connect: 

* useClass - string - Apply shushjax only to links with the provided class.
* parseLinksOnload - true|false - Make links in loaded pages use shushjax. Enabled by default.
* smartLoad - true|false - Ensure returned HTML is correct. Enabled by default.
* partial - true|false - Use partial file support. Disabled by default. When enabled, shushjax will load pages using partial files located under the /partials directory

### Using shushjax programmatically

You can invoke a shushjax page load programmitcally by calling the shushjax.invoke() method.
At minimum the invoke method must be given a url and container attribute. It can also
be provided with a title, parseLinksOnload setting and any callbacks you wish to use.

	shushjax.invoke({url:'page1.php', 'container': 'content'});

or
	
	shushjax.invoke('page1.php', 'content');

### Server side.

You don't need to make any changes to your backend to benefit from shushjax. If you are unable to change the backend code, or simply do not want to, so long as smartLoad is enabled (which it is by default), shushjax will extract the container_divs content from the returned HTML and apply it to the current page meaning shushjax loading will still work as expected (although some of the performance gains may be lost).

#### Partial pages  

Partial pages contain only the contents of the container div, saving bandwidth. When partial page support is enabled, shushjax looks for partial pages under the /partials directory. 
