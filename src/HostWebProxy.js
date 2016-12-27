import '../lib/docReady.js'
import hostWebProxyConfig from './HostWebProxy.config.json'

//When the document is ready, bind to the 'message' event to recieve messages passed
//from the parent window via window.postMessage
docReady(function () {

	let _lastTransferredObject = null;

	/**
	 * Utility method to post messages back to the parent.
	 */
	let postMessage = function (data, request, response) {
		let responseOrigin = hostWebProxyConfig.responseOrigin || "*";

		//If a response object is specified, get the properties
		if (response) {
			for (let propertyKey of ["ok", "redirected", "status", "statusText", "type", "url"]) {
				data[propertyKey] = response[propertyKey];
			}

			data.headers = {};
			for (let key of response.headers.keys()) {
				let value = response.headers.getAll(key);
				if (value.length === 1)
					data.headers[key] = value[0];
				else
					data.headers[key] = value;
			}

			let transformPromise;

			switch (request._responseDataType) {
				case "arrayBuffer":
					response.arrayBuffer()
						.then(function (arrayBuffer) {
							data.expectArrayBuffer = true;
							window.parent.postMessage(JSON.stringify(data), responseOrigin);

							//Sending multiple transferrable objects would be beneficial,
							//but keeping it to one to satisfy IE10.
							window.parent.postMessage(arrayBuffer, responseOrigin, [arrayBuffer]);
						});
					return;
				case "formData":
					transformPromise = response.formData()
					break;
				case "text":
					transformPromise = response.text()
					break;
				case "json":
				default:
					transformPromise = response.json()
					break;
			}

			transformPromise.then(function (responseBody) {
				data.data = responseBody;
				window.parent.postMessage(JSON.stringify(data), responseOrigin);
			});

			return;
		}

		window.parent.postMessage(JSON.stringify(data), responseOrigin);
	};

	window.addEventListener("message", function (event, origin) {
		origin = event.origin || event.originalEvent.origin;

		//Validate the requesting origin.
		if (hostWebProxyConfig.trustedOriginAuthorities && hostWebProxyConfig.trustedOriginAuthorities.length) {
			let trusted = false;
			for (let trustedOriginAuthority of hostWebProxyConfig.trustedOriginAuthorities) {
				trusted = trusted || RegExp(trustedOriginAuthority, "ig").test(origin);
			}
			if (!!!trusted)
				throw new Error(`The specified origin is not trusted by the HostWebProxy: ${origin}`);
		}

		if (!event.data)
			return;

		if (Object.prototype.toString.call(event.data) === "[object ArrayBuffer]") {
			postMessage({
				command: "transfer",
				result: event.data.byteLength
			});

			_lastTransferredObject = event.data;
			return;
		}

		let dataType = typeof event.data;
		if (dataType !== "string") {
			throw new Error("HostWebProxy: Unexpected data type recieved via PostMessage");
		}

		let request = JSON.parse(event.data);

		switch (request.command) {
			case "Fetch":
				if (!!request._useTransferObjectAsBody && _lastTransferredObject) {
					request.body = _lastTransferredObject;
				}

				fetch(request.url, request)
					.then(function (response) {
						_lastTransferredObject = null;
						postMessage({
							postMessageId: request.postMessageId,
							result: "success"
						}, request, response);
					}, function (response) {
						_lastTransferredObject = null;
						postMessage({
							postMessageId: request.postMessageId,
							result: "error"
						}, request, response);
					});
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
				}, request);
				break;
		}
	});
});