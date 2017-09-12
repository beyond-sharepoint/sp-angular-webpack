import _ from 'lodash';

/**
 * Represents a channel with which commands can be invoked.
 * 
 * Channels are one-per-origin (protocol/domain/port).
 */
class Channel {
    constructor(config, $rootScope, $timeout, contentWindow) {
        this.config = config;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this._contentWindow = contentWindow;
        this.messageCounter = 0;
    }

    ab2str(buffer) {
        let result = "";
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            result += String.fromCharCode(bytes[i]);
        }
        return result;
    };

    /**
     * Fire and forget pattern that sends the command to the target without waiting for a response.
     */
    invokeDirect(command, data, targetOrigin, transferrablePropertyPath) {
        if (!data) {
            data = {};
        }

        if (!targetOrigin) {
            targetOrigin = this.config.siteUrl;
        }

        if (!targetOrigin) {
            targetOrigin = "*";
        }

        data.command = command;
        data.postMessageId = `SP.RequestExecutor_${this.messageCounter++}`;

        let transferrableProperty = undefined;

        if (transferrablePropertyPath) {
            transferrableProperty = _.get(data, transferrablePropertyPath);
        }

        if (transferrableProperty)
            this._contentWindow.postMessage(data, targetOrigin, [transferrableProperty]);
        else
            this._contentWindow.postMessage(data, targetOrigin);
    }

    /**
     * Invokes the specified command on the channel with the specified data, constrained to the specified domain awaiting for max ms specified in timeout 
     */
    async invoke(command, data, targetOrigin, timeout, transferrablePropertyPath) {
        if (!data) {
            data = {};
        }

        if (!targetOrigin) {
            targetOrigin = this.config.siteUrl;
        }

        if (!targetOrigin) {
            targetOrigin = "*";
        }

        if (!timeout) {
            timeout = 0;
        }

        data.command = command;
        data.postMessageId = `SP.RequestExecutor_${this.messageCounter++}`;

        let resolve, reject;
        let promise = new Promise((innerResolve, innerReject) => {
            resolve = innerResolve;
            reject = innerReject;
        });

        let timeoutPromise;
        if (timeout > 0) {
            timeoutPromise = this.$timeout(() => {
                reject(new Error(`invoke() timed out while waiting for a response while executing ${data.command}`));
            }, timeout);
        }

        let removeMonitor = this.$rootScope.$on(this.config.crossDomainMessageSink.incomingMessageName, (event, response) => {
            if (response.postMessageId !== data.postMessageId)
                return;

            if (response.result === "error") {
                reject(response);
            }
            else {
                if (response.data) {
                    let contentType = response.headers["content-type"] || response.headers["Content-Type"];
                    if (contentType.startsWith("application/json")) {
                        let str = this.ab2str(response.data);
                        if (str.length > 0) {
                            try
                            {
                                response.data = JSON.parse(str);
                            }
                            catch(ex) {
                            }
                        }
                    } else if (contentType.startsWith("text")) {
                        response.data = this.ab2str(response.data);
                    }
                }

                resolve(response);
            }

            removeMonitor();
            if (timeoutPromise)
                this.$timeout.cancel(timeoutPromise);
        });

        let transferrableProperty = undefined;

        if (transferrablePropertyPath) {
            transferrableProperty = _.get(data, transferrablePropertyPath);
        }

        if (transferrableProperty)
            this._contentWindow.postMessage(data, targetOrigin, [transferrableProperty]);
        else
            this._contentWindow.postMessage(data, targetOrigin);

        return promise;
    }
}

module.exports = Channel;