# shushjax #

[![Code Climate](https://codeclimate.com/github/Team-Pr0xy/shushjax.png)](https://codeclimate.com/github/Team-Pr0xy/shushjax)  
Standalone (no jQuery) Headerless Pushstate + AJAX. 
shushjax uses ajax and pushState to deliver a fast browsing experience with real permalinks, page titles, and a working back button. shushjax works by grabbing html from your server via ajax and replacing the content of a container on your page with the ajax'd html. It then updates the browser's current url using pushState without reloading your page's layout or any resources (js, css), giving the appearance of a fast, full page load. But really it's just ajax and pushState.

For [browsers that don't support pushState](http://caniuse.com/#search=pushstate) shushjax fully degrades.
Inspired by the original PJAX, forked from PJAX-Standalone and with pjax-fw ported over. 
The design is loosely based on the original jquery implementation found at: https://github.com/defunkt/jquery-pjax  
This code is licensed under the MIT Licence

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
This code should work in in Chrome, Firefox, Opera, Safari and IE 10+. 
shushjax is supported in Chrome, Firefox, Safari and Opera, while in old IE (9 and lower) the fallbacks operate.

### Usage Instructions

To add shushjax to your page, you will need to include the shushjax.js script in to the head of your document.

Once done, shushjax can be setup in 3 ways. 

#### Option 1
Give all links a data-pjax attribute specifing where to place the content that gets loaded.:

    <a href='page1.php' data-pjax='content'>Page 1</a>

Then call:

	pjax.connect();

#### Option 2
Add links normally

	<a href='page2.php'>Page 2</a>
	
Then specify which container they should use, via either

	pjax.connect('content');

or

	pjax.connect({container: 'content'});

#### Option 3
Set all links with a specific class to use a particular container using:

```
	<a href='page2.php' class='pjaxer'>Page 2</a>
```

```
	pjax.connect('content', 'pjaxer');
```	

### Callbacks

shushjax impliments the following callbacks 

* beforeSend - Called before ajax request is made
* complete - When ajax request has completed
* success - When ajax request has completed successfully
* error - When ajax request did not complet successfully (error 404/500 etc)

The callbacks are specified as part of the original pjax.connect method:

	pjax.connect({
		'container': 'content',
		'beforeSend': function(){console.log("before send");},
		'complete': function(){console.log("done!");},
	});

In addition to the callbacks the following options can also be provided to PJAX connect.

* useClass - string - Apply shushjax only to links with the provided class.
* parseLinksOnload - true|false - Make links in loaded pages use PJAX. Enabled by default.
* smartLoad - true|false - Ensure returned HTML is correct. Enabled by default.

### Using shushjax programmatically

You can invoke a shushjax page load programmitcally by calling the pjax.invoke() method.
At minimum the invoke method must be given a url and container attribute. It can also
be provided with a title, parseLinksOnload setting and any callbacks you wish to use.

	pjax.invoke({url:'page1.php', 'container': 'content'});

or
	
	pjax.invoke('page1.php', 'content');

### Server side.

The original PJAX header-based way of doing things has been replaced with the partial file method from pjax-fw. In the root directory of your website, add a folder called "partials". Update your code to create copies of your pages under this directory with only the main content area intact. For example, if the original page was example.com/oceans/pacific.html, then the partial page should be located at example.com/partials/oceans/pacific.html. 

Unfortunately, shushjax cannot currently function on websites where you cannot place content directly under the root domain. This will be fixed in the future. 

If you are unable to create partial pages, or simply do not want to, a solution is coming. So long as smartLoad is enabled, shushjax can extract the container_divs content from the returned HTML and apply it to the current page meaning shushjax loading will still work as expect (although some of shushjax's performance gains may be lost). This functionality is not yet implemented. 
