import '../lib/docReady.js'
import hostWebProxyConfig from './HostWebProxy.config.json'
import Promise from 'promise-polyfill';

// To add to window
if (!window.Promise) {
	window.Promise = Promise;
}

//When the document is ready, bind to the 'message' event to recieve messages passed
//from the parent window via window.postMessage
docReady(() => {
	/**
	 * Utility method to post messages back to the parent.
	 */
	let postMessage = async (message, request, response) => {
		let responseOrigin = hostWebProxyConfig.responseOrigin || "*";

		//If a response object is specified, get the properties
		if (message.result !== "error" && response) {
			//IE/Edge do not support 'keys', 'entries', 'values', nor '..of' so whitelist the properties.
			for (let propertyKey of ["ok", "redirected", "status", "statusText", "type", "url"]) {
				message[propertyKey] = response[propertyKey];
			}

			message.headers = {};

			if (typeof response.headers.forEach === "function") {
				response.headers.forEach((value, key, object) => {
					message.headers[key] = value;
				});
			}

			message.data = await response.arrayBuffer();
		}

		window.parent.postMessage(message, responseOrigin, message.data ? [message.data] : undefined);
	};

	window.addEventListener("message", async (event, origin) => {
		origin = event.origin || event.originalEvent.origin;

		//Validate the requesting origin.
		if (hostWebProxyConfig.trustedOriginAuthorities && hostWebProxyConfig.trustedOriginAuthorities.length) {
			let trusted = false;
			for (let i = 0; i < hostWebProxyConfig.trustedOriginAuthorities.length; i++) {
				let trustedOriginAuthority = hostWebProxyConfig.trustedOriginAuthorities[i];
				if (RegExp(trustedOriginAuthority, "ig").test(origin)) {
					trusted = true;
					break;
				}
			}

			if (!!!trusted)
				throw new Error(`The specified origin is not trusted by the HostWebProxy: ${origin}`);
		}

		if (!event.data)
			return;

		let request = event.data;

		switch (request.command) {
			case "Fetch":

				let fetchRequestInit = {
					cache: request.cache,
					credentials: request.credentials,
					method: request.method,
					mode: "same-origin",
				};

				//IE/Edge fails when the header object is not explictly
				//a headers object.
				if (request.headers) {
					fetchRequestInit.headers = new Headers();
					for (let property of Object.keys(request.headers)) {
						fetchRequestInit.headers.append(property, request.headers[property]);
					}
				}

				//IE/Edge fails with a TypeMismatchError when GET 
				//requests have any body, including null.
				if (request.method.toUpperCase() !== "GET") {
					fetchRequestInit.body = request.body;
					fetchRequestInit.bodyUsed = true;
				}

				//Actually perform the fetch
				try {
					let response = await fetch(request.url, fetchRequestInit);
					postMessage({
						postMessageId: request.postMessageId,
						result: "success"
					}, request, response);
				}
				catch (err) {
					postMessage({
						postMessageId: request.postMessageId,
						result: "error",
						error: err,
						message: err.message,
						name: err.name
					}, request);
				}
				break;
			case "Ping":
				postMessage(request);
				break;
			default:
				postMessage({
					command: request.command,
					postMessageId: request.postMessageId,
					result: "error",
					errorMessage: "Unknown or unsupported command: " + request.command
				}, request);
				break;
		}
	});
});