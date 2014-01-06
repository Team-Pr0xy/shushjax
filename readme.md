# shushjax #

Standalone (no jQuery) Headerless Pushstate + AJAX. 
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
This code should work in in Chrome, Firefox, Opera and IE7,8, 9, and 10+. 
shushjax is supported in Chrome, Firefox and Opera, while in old IE the fallbacks operate.

### Usage Instructions

To add shushjax to your page, you will need to include the pjax-standalone.js script in to the head of your document.

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

The original PJAX headers are being replaced with the partial page method from pjaw-fw

Update your code to return only the main content area when the X-PJAX header is set, while returning the full website layout when it is not.
	
	<?php
	$headers = getallheaders();
	if(($headers['X-PJAX'] == 'true')){
		//Output content on its own.
	}else{
		//Output content with wrapper/layout
	}

If you are unable to change the backend code, or simply do not want to. So long as smartLoad is enabled (which it is by default), PJAX-Standalone will extract the container_divs content from the returned HTML and apply it to the current page meaning PJAX loading will still work as expect (although some of PJAX's performance gains may be lost).
