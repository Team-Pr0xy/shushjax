/**
 * shushjax
 * A standalone implementation of Pushstate AJAX, for non-JQuery webpages.
 * @version 0.1
 * @author JC Hulce
 * @source https://github.com/Team-Pr0xy/shushjax
 * @license MIT
 */
(function(){
	// Object to store private values/methods.
	var internal = {
		// Is this the first usage of shushjax? (Ensure history entry has required values if so.)
		"firstrun": true,
		// Attempt to check that a device supports pushstate before attempting to use it.
		"is_supported": window.history && window.history.pushState && window.history.replaceState && !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/)
	};
	/**
	 * AddEvent
	 * Cross browser compatable method to add event listeners
	 * @scope private
	 * @param obj Object to listen on
	 * @param event Event to listen for.
	 * @param callback Method to run when event is detected.
	 */
	internal.addEvent = function(obj, event, callback){
		if(window.addEventListener){
				// Browsers that don't suck
				console.log("Adding event listener to " + obj + " on event " + event);
				obj.addEventListener(event, callback, false);
		}else{
				// IE8/7
				console.info("Adding fallback event listeners for old IE versions");
				console.log("Adding event listener to " + obj + " on event " + event);
				obj.attachEvent('on'+event, callback);
		}
	};
	/**
	 * Clone
	 * Util method to create copies of the options object (so they do not share references)
	 * This allows custom settings on differnt links.
	 * @scope private
	 * @param obj
	 * @return obj
	 */
	internal.clone = function(obj){
		object = {};
		//For every option in object, create it in the duplicate.
		for (var i in obj) {
                        if (obj.hasOwnProperty(i)){
			object[i] = obj[i];
			}
		}
		return object;
	};
	/**
	 * triggerEvent
	 * Fire an event on a given object (used for callbacks)
	 * @scope private
	 * @param node. Objects to fire event on
	 * @return event_name. type of event
	 */
	internal.triggerEvent = function(node, event_name){
		if (document.createEvent) {
		// Good browsers
		evt = document.createEvent("HTMLEvents");
		evt.initEvent(event_name, true, true);
		node.dispatchEvent(evt);
		}else{
		// old IE versions
		evt = document.createEventObject();
		evt.eventType = 'on'+ event_name;
		node.fireEvent(evt.eventType, evt);
		console.info("Using createEvent fallbacks for old IE versions");
		}
		console.log("Firing event " + event_name);
	};
	/**
	 * popstate listener
	 * Listens for back/forward button events and updates page accordingly.
	 */
	internal.addEvent(window, 'popstate', function(st){
		if(st.state !== null){
			var opt = {	
				'url': st.state.url, 
				'container': st.state.container, 
				'history': false
			};
                        // Merge original in original connect options
                        if(typeof internal.options !== 'undefined'){
                                for(var a in internal.options){ 
                                        if(typeof opt[a] === 'undefined') opt[a] = internal.options[a];
                                }         
                        }

                        // Convert state data to shushjax options
                        var options = internal.parseOptions(opt);
			// If somthing went wrong, return.
			if(options === false){
			console.error("Failed to read state data " + st);
			internal.triggerEvent(options.container,'generalError');
			return;
			}
			// If there is a state object, handle it as a page load.
			internal.handle(options);
			console.log("Handling state " + st);
		}
	});
	/**
	 * attach
	 * Attach shushjax listeners to a link.
	 * @scope private
	 * @param link_node. link that will be clicked.
	 * @param content_node. 
	 */
	internal.attach = function(node, options){
		// if no pushstate support, dont attach and let stuff work as normal.
		if(!internal.is_supported){
		console.info("No pushstate support in browser, shushjax is disabled");
		return;
		}
		// Ignore external links.
		if ( node.protocol !== document.location.protocol ||
			node.host !== document.location.host ){
			console.log("Ignoring external anchor " + node.href);
			return;
		}
		// Ignore anchors on the same page
                if(node.pathname === location.pathname && node.hash.length > 0) {
                        console.log("Ignoring same-page anchor " + node.hash);
                        return true;
                 }
		// Add link href to object
		options.url = node.href;
		// If data-shushjax is specified, use as container
		if(node.getAttribute('data-shushjax')){
			options.container = node.getAttribute('data-shushjax');
			console.log("Using " + options.container + " as container for " + node.href + " as specified with data-shushjax");
		}
		// If data-title is specified, use as title.
		if(node.getAttribute('data-title')){
			options.title = node.getAttribute('data-title');
			console.log("Using " + options.title + " as title for " + node.href + " as specified with data-title");
		}
		// Check options are valid.
		options = internal.parseOptions(options);
		if(options === false){
                        console.error("Invalid options error");
                        internal.triggerEvent(options.container,'generalError');
		return;
		}
		// Attach event.
		internal.addEvent(node, 'click', function(event){
			// Allow middle click (pages in new windows)
			if ( event.which > 1 || event.metaKey ) return;
			// Dont fire normal event
			if(event.preventDefault){event.preventDefault();}else{event.returnValue = false;}
			// Take no action if we are already on said page?
			if(document.location.href === options.url){
			console.log("Ignoring same-page anchor " + options.url);
			return false;
			}
			// handle the load.
			internal.handle(options);
		});
	};
	/**
	 * parseLinks
	 * Parse all links within a dom node, using settings provided in options.
	 * @scope private
	 * @param dom_obj. Dom node to parse for links.
	 * @param options. Valid Options object.
	 */
	internal.parseLinks = function(dom_obj, options){
		if(typeof options.useClass !== "undefined"){
			// Get all nodes with the provided classname.
			nodes = dom_obj.getElementsByClassName(options.useClass);
			console.log("Attaching to links with class " + options.useClass);
		}else{  // If no class was provided, just get all the links
			nodes = dom_obj.getElementsByTagName('a');
			console.log("Attaching to all links, useClass is unspecified");
		}
		// For all returned nodes
		for(var i=0,tmp_opt; i < nodes.length; i++){
			node = nodes[i];
			// Override options history to true, else link parsing could be triggered by backbutton (which runs in no-history mode)
			tmp_opt = internal.clone(options);
			tmp_opt.history = true;
			internal.attach(node, tmp_opt);
		}
	};
	/**
	 * SmartLoad
	 * Smartload checks the returned HTML to ensure shushjax ready content has been provided rather than
	 * a full HTML page. If a full HTML has been returned, it will attempt to scan the page and extract
	 * the correct html to update our container with in order to ensure shushjax still functions as expected.
	 * @scope private
	 * @param html (HTML returned from AJAX)
	 * @param options (Options object used to request page)
	 * @return HTML to append to our page.
	 */
	internal.smartLoad = function(html, options){
		// Create tmp node (So we can interact with it via the DOM)
		var tmp = document.createElement('div');
		// Add html
		tmp.innerHTML = html; 
		// Grab the title if there is one (maintain IE7 compatability)
		var title = tmp.getElementsByTagName('title')[0].innerHTML;
		if(title){
		console.log("Using returned document title: " + title);
		document.title = title;
		}
		//Look through all returned divs.
		tmpNodes = tmp.getElementsByTagName('div');
		for(var i=0;i<tmpNodes.length;i++){
			if(tmpNodes[i].id === options.container.id){
				// If our container div is within the returned HTML, we both know the returned content is
				// not partial pages ready, but instead likely the full HTML content. In addition we can also guess that
				// the content of this node is what we want to update our container with.
				// Thus use this content as the HTML to append in to our page via shushjax.
				console.info("Found container div in the returned HTML, treating as full HTML content and processing with smartLoad");
				// break;
				return tmpNodes[i].innerHTML;
			}else console.log("Didn't find container div in the returned HTML, processing as a partial page");
		}
		// If our container was not found, HTML will be returned as is.
		return html;
	};
	/**
	 * handle
	 * Handle requests to load content via shushjax.
	 * @scope private
	 * @param url. Page to load.
	 * @param node. Dom node to add returned content in to.
	 * @param addtohistory. Does this load require a history event.
	 */
	internal.handle = function(options){
		// Fire beforeSend Event.
		internal.triggerEvent(options.container, 'beforeSend');
		// Do the request
		internal.request(options.url, options.partial, function(html){
                        // If no HTML was provided
                        if(html === false || html === "undefined"){ //Somthing went wrong
				internal.triggerEvent(options.container,'requestError');
				return;
			}
			// Ensure we have the correct HTML to apply to our container.
			console.log("smartLoad is " + options.smartLoad);
			if(options.smartLoad) html = internal.smartLoad(html, options);
			// Update the dom with the new content
			options.container.innerHTML = html;
			// Initalise any links found within document (if enabled).
			console.log("parseLinksOnLoad is " + options.parseLinksOnload);
			if(options.parseLinksOnload){
				internal.parseLinks(options.container, options);
			}
			// If no title was provided
			if(typeof options.title === "undefined"){
				// Attempt to grab title from page contents.
				if(options.container.getElementsByTagName('title').length !== 0){
					options.title = options.container.getElementsByTagName('title')[0].innerHTML;
				}else{
					options.title = document.title;
					console.log("No title was provided");
				}
			}
			// Do we need to add this to the history?
			if(options.history){
				// If this is the first time shushjax has run, create a state object for the current page.
				if(internal.firstrun){
					window.history.replaceState({'url': document.location.href, 'container':  options.container.id}, document.title);
					internal.firstrun = false;
				}
				// Update browser history
				window.history.pushState({'url': options.url, 'container': options.container.id }, options.title , options.url);
			}
			// Fire Events
			internal.triggerEvent(options.container,'complete');
			if(html === false || html === "undefined"){ //Somthing went wrong
				internal.triggerEvent(options.container,'generalError');
				return;
			}else{ //got what we expected.
				internal.triggerEvent(options.container,'success');
			}
			// If Google analytics is detected push a trackPageView, so shushjax pages can be tracked successfully.
			if(window._gaq){
			console.log("Pushing Google Analytics pageview");
			_gaq.push(['_trackPageview']);
			}
			// Set new title
			document.title = options.title;
		});
	};
	/**
	 * Request
	 * Performs AJAX request to page and returns the result.
	 * @scope private
	 * @param location. Page to request.
	 * @param partial. Use partial pages?
	 * @param callback. Method to call when a page is loaded.
	 */
	internal.request = function(location, partial, callback){
		console.log("Requesting page " + location);
		// Create xmlHttpRequest object.
		xmlhttp = window.XMLHttpRequest?new XMLHttpRequest(): new ActiveXObject("Microsoft.XMLHTTP");
			// Check if the browser supports XHR2
			if (typeof xmlhttp.onload !== "undefined"){
			console.log("Using XHR2");
			xmlhttp.onload = function(){ // Successful load
			console.log("Fetch complete, HTTP status code " + xmlhttp.status);
			callback(xmlhttp.responseText); // Success, Return HTML
			};
			xmlhttp.onerror = function(){ // Error during loading
			if (xmlhttp.status === 0){
			console.error("Failed to connect to the server, network error " + xmlhttp.status);
			}else{
			console.error("Fetch error, HTTP status code " + xmlhttp.status);
			}
			// return error page if present
			callback(xmlhttp.responseText);
			return false; // Failure, return false
			};
			}else{ // old browsers that don't support XHR2
			console.info("Falling back to basic XHR");
			// Add the old state listener
			xmlhttp.onreadystatechange = function(){
				if ((xmlhttp.readyState === 4) && (xmlhttp.status === 200)) {
					// Success, Return html
					callback(xmlhttp.responseText);
					console.log("Fetch complete");
				}else if((xmlhttp.readyState === 4) && (xmlhttp.status !== 200)){
					// error, return error page if present
					console.error("Fetch error, HTTP status code " + xmlhttp.status);
					callback(xmlhttp.responseText);
					return false;} // Failure, return false
				};
			}
			// re-format the URL so we can modify it
			// Check for browser support of URL()
			if (typeof(URL) === "function"){
			formaturl = new URL(location);
			console.log("Using URL() to process location");
			// Some browsers implement URL() as webkitURL()
			}else{
			if (typeof(webkitURL) === "function"){
			formaturl = new webkitURL(location);
			console.info("Using webkitURL() instead of URL()");
			// if the client doesn't support URL() or webkitURL(), disable partial file support
			}else{
			partial = false;
			console.info("Disabling partial file support, browser does not support URL()");
			}}
			// Use partial file support if it's enabled
			if(partial === true){
			getlocation = formaturl.protocol + "//" + formaturl.host + "/partials" + formaturl.pathname;
			console.log("Fetching a partial HTML file");
			}else{
			getlocation = location;
			console.log("Fetching a full HTML file");
			}
			// Actually send the request
			console.log("Fetching " + getlocation);
			xmlhttp.open("GET", getlocation, true);
			// Add headers so things can tell the request is being performed via AJAX.
			xmlhttp.setRequestHeader('X-shushjax', 'true'); // shushjax header, kept so you can see usage in server logs
			xmlhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); // Standard AJAX header.
			xmlhttp.send(null);
	};
	/**
	 * parseOptions
	 * Validate and correct options object while connecting up any listeners.
	 * @scope private
	 * @param options
	 * @return false | valid options object
	 */
	internal.parseOptions = function(options){
		// Defaults. (if somthing isn't provided)
		opt = {};
		opt.history = true;
		opt.parseLinksOnload = true;
		opt.smartLoad = true;
		opt.partial = false;
		// Ensure a url and container have been provided.
		if(typeof options.url === "undefined" || typeof options.container === "undefined"){
			console.error("URL and Container must be provided");
			internal.triggerEvent(options.container,'generalError');
			return false;
		}
		// Find out if history has been provided
		if(typeof options.history === 'undefined'){
			// use default
			options.history = opt.history;
		}else{
			// Ensure its bool.
			options.history = (!(options.history === false));
		}
		// Parse Links on load? Enabled by default.
		// (Proccess pages loaded via shushjax and setup shushjax on any links found.)
		if(typeof options.parseLinksOnload === "undefined"){
			options.parseLinksOnload = opt.parseLinksOnload;
		}
		// Use partial file support? Disabled by default
		if(typeof options.partial === "undefined"){
			options.partial = opt.partial;
		}
		// Smart load (enabled by default). Tries to ensure the correct HTML is loaded.
		// If you are certain your backend will only return shushjax ready content this can be disabled
		// for a slight perfomance boost.
		if(typeof options.smartLoad === "undefined"){
			options.smartLoad = opt.smartLoad;
		}
		// Get container (if its an id, convert it to a dom node.)
		if(typeof options.container === 'string' ) {
			container = document.getElementById(options.container);
			if(container === null){
				console.error("Could not find container with id:" + options.container);
				internal.triggerEvent(options.container,'generalError');
				return false;
			}
			options.container = container;
		}
		// If everything went ok thus far, connect up listeners
		if(typeof options.beforeSend === 'function'){
			internal.addEvent(options.container, 'beforeSend', options.beforeSend);
			console.log("shushjax request initiating");
		}
		if(typeof options.complete === 'function'){
			internal.addEvent(options.container, 'complete', options.complete);
			console.log("shushjax request complete");
		}
		if(typeof options.generalError === 'function'){
			internal.addEvent(options.container, 'generalError', options.generalError);
			console.error("An error occurred");
		}
		if(typeof options.requestError === 'function'){
			internal.addEvent(options.container, 'requestError', options.requestError);
			console.error("An error occurred during the shushjax request");
		}
		if(typeof options.success === 'function'){
			internal.addEvent(options.container, 'success', options.success);
			console.log("shushjax request completed successfully");
		}
		// Return valid options
		return options;
	};
	/**
	 * connect
	 * Attach links to shushjax handlers.
	 * @scope public
	 * Can be called in 3 ways.
	 * Calling as connect(); will look for links with the data-shushjax attribute.
	 * Calling as connect(container_id) will try to attach to all links, using the container_id as the target.
	 * Calling as connect(container_id, class_name) will try to attach any links with the given classname, using container_id as the target.
	 * Calling as connect({	
	 * 'url':'somepage.php',
	 * 'container':'somecontainer',
	 * 'beforeSend': function(){console.log("sending");}
	 * })
	 * Will use the provided json to configure the script in full (including callbacks)
	 */
	this.connect = function(/* options */){
		// connect();
		var options = {};
		// connect(container, class_to_apply_to)
		if(arguments.length === 2){
			options.container = arguments[0];
			options.useClass = arguments[1];
		}
		// Either json or container id
		if(arguments.length === 1){
			if(typeof arguments[0] === 'string' ) {
				// connect(container_id)
				options.container = arguments[0];
			}else{
				// Else connect({url:'', container: ''});
				options = arguments[0];
			}
		}
		// Delete history and title if provided. These options should only be provided via invoke();
		delete options.title;
		delete options.history;
		internal.options = options;
		if(document.readyState === 'complete') {
			internal.parseLinks(document, options);
		} else {
			// Dont run until the window is ready.
			internal.addEvent(window, 'load', function(){	
				// Parse links using specified options
				internal.parseLinks(document, options);
			});
		}
	};
	/**
	 * invoke
	 * Directly invoke a shushjax page load.
	 * invoke({url: 'file.php', 'container':'content'});
	 * @scope public
	 * @param options  
	 */
	this.invoke = function(/* options */){
		// url, container
		if(arguments.length === 2){
			options = {};
			options.url = arguments[0];
			options.container = arguments[1];
		}else{
			options = arguments[0];
		}
		// If shushjax isn't supported by the current browser, push user to specified page.
		if(!internal.is_supported){
			document.location = options.url;
			console.info("Browser does not support shushjax. Pushing user directly to the specified page instead");
			return;	
		} 
		// Proccess options
		options = internal.parseOptions(options);
		// If everything went ok, activate shushjax.
		if(options !== false) internal.handle(options);
		console.log("Everything is okay, activating shushjax");
	};
	var shushjax_obj = this;
        if (typeof define === 'function' && define.amd) {
                // register shushjax as AMD module
                define( function() {
            return shushjax_obj;
        });
        }else{
                // Make shushjax object accessible in global namespace
                window.shushjax = shushjax_obj;
        }
}).call({});
