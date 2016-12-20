<%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
	<html xmlns="http://www.w3.org/1999/xhtml">
	<WebPartPages:AllowFraming runat="server" />

	<head runat="server">
		<meta http-equiv="X-UA-Compatible" content="IE=8" />
		<meta name="GENERATOR" content="Microsoft SharePoint" />
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta http-equiv="Expires" content="0" />
		<title>SharePoint Host Web Proxy</title>
	</head>

	<body>
		<script type="text/javascript">
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
			
			$.ajax(request);
		};

		var validateOrigin = function(origin) {
			if (origin !== "{{siteUrl}}")
				return false;
			
			return true;
		}
			
		var postMessage = function(data, domain) {
				if (!domain) {
					domain = "*";
				}
				
				window.parent.postMessage(JSON.stringify(data), domain);
			};
				
		$(document).ready(function(){

			$(window).bind("message", function(event) {
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
		</script>
	</body>

	</html>