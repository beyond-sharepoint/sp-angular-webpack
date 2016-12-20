import jQuery from 'jquery'
jQuery.noConflict();

var ajax = function(request, origin) {

			request.success = function(data, textStatus, jqXHR) {
				postMessage({
					postMessageId: request.postMessageId,
					result: "success",
					data: data,
					textStatus: textStatus,
					jqXHR: jqXHR
				}, origin);
			};
			
			request.error = function(jqXHR, textStatus, errorThrown) {
				postMessage({
					postMessageId: request.postMessageId,
					result: "error",
					jqXHR: jqXHR,
					textStatus: textStatus,
					errorThrown: errorThrown
				}, origin);
			};
			
			jQuery.ajax(request);
		};

		var validateOrigin = function(origin) {
			//if (origin !== "{{siteUrl}}")
			//	return false;
			
			return true;
		}
			
		var postMessage = function(data, domain) {
				if (!domain) {
					domain = "*";
				}
				
				window.parent.postMessage(JSON.stringify(data), domain);
			};
				
		jQuery(document).ready(function(){

			jQuery(window).bind("message", function(event) {
				if (!event.originalEvent.data)
					return;
					
				var origin = event.origin;
				if (!validateOrigin(origin))
					return;
					
				var request = JSON.parse(event.originalEvent.data);

				switch(request.command) {
					case "Fetch":
						ajax(request, origin);
						break;
					case "Ping":
						postMessage(request, origin);
						break;
					default:
						postMessage({
							command: request.command,
							postMessageId: request.postMessageId,
							result: "error",
							errorMessage: "Unknown or unsupported command: " + request.command,
							responseAvailable: false
						}, origin);
						break;
				}
			});
		});