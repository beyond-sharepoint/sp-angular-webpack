import jQuery from 'jquery'
jQuery.noConflict();
import hostWebProxyConfig from './HostWebProxy.config.json'

var ajax = function (request) {

	request.success = function (data, textStatus, jqXHR) {
		postMessage({
			postMessageId: request.postMessageId,
			result: "success",
			data: data,
			textStatus: textStatus,
			jqXHR: jqXHR
		});
	};

	request.error = function (jqXHR, textStatus, errorThrown) {
		postMessage({
			postMessageId: request.postMessageId,
			result: "error",
			jqXHR: jqXHR,
			textStatus: textStatus,
			errorThrown: errorThrown
		});
	};

	jQuery.ajax(request);
};

var postMessage = function (data) {
	let targetOrigin = hostWebProxyConfig.originUrl;
	if (!targetOrigin)
		targetOrigin = "*";

	window.parent.postMessage(JSON.stringify(data), targetOrigin);
};

jQuery(document).ready(function () {

	jQuery(window).bind("message", function (event) {
		if (!event.originalEvent.data)
			return;

		var request = JSON.parse(event.originalEvent.data);

		switch (request.command) {
			case "Fetch":
				ajax(request);
				break;
			case "Ping":
				postMessage(request);
				break;
			default:
				postMessage({
					command: request.command,
					postMessageId: request.postMessageId,
					result: "error",
					errorMessage: "Unknown or unsupported command: " + request.command,
					responseAvailable: false
				});
				break;
		}
	});
});