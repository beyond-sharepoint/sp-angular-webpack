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

    /**
     * Fire and forget pattern that sends the command to the target without waiting for a response.
     */
    invokeDirect(command, data, targetOrigin) {
        if (!data) {
            data = {};
        }

        if (!targetOrigin) {
            targetOrigin = this.config.siteUrl;
        }

        if (!targetOrigin) {
            targetOrigin = "*";
        }

        data = _.cloneDeep(data);
        data.command = command;
        data.postMessageId = `SP.RequestExecutor_${this.messageCounter++}`;

        this._contentWindow.postMessage(JSON.stringify(data), targetOrigin);
    }

    /**
     * Invokes the specified command on the channel with the specified data, constrained to the specified domain awaiting for max ms specified in timeout 
     */
    async invoke(command, data, targetOrigin, timeout) {
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

        data = _.cloneDeep(data);
        data.command = command;
        data.postMessageId = `SP.RequestExecutor_${this.messageCounter++}`;

        let resolve, reject;
        let promise = new Promise(function () {
            resolve = arguments[0];
            reject = arguments[1];
        });

        let timeoutPromise;
        if (timeout > 0) {
            timeoutPromise = this.$timeout(function () {
                reject(new Error(`invoke() timed out while waiting for a response while executing ${data.command}`));
            }, timeout);
        }

        let self = this;
        let removeMonitor = this.$rootScope.$on(this.config.crossDomainMessageSink.incomingMessageName, function (event, response) {
            if (response.postMessageId !== data.postMessageId)
                return;

            if (response.result === "error") {
                reject(response);
            }
            else {
                resolve(response);
            }

            removeMonitor();
            if (timeoutPromise)
                self.$timeout.cancel(timeoutPromise);
        });

        this._contentWindow.postMessage(JSON.stringify(data), targetOrigin);

        return promise;
    }

    async transfer(buffer, targetOrigin, timeout) {
        if (!buffer || Object.prototype.toString.call(buffer) !== '[object ArrayBuffer]')
            throw new Error("An ArrayBuffer must be specified as the first argument.");

        if (!targetOrigin) {
            targetOrigin = this.config.siteUrl;
        }

        if (!targetOrigin) {
            targetOrigin = "*";
        }

        if (!timeout) {
            timeout = 0;
        }

        //Ensure that the response's length matches.
        let bufferLength = buffer.byteLength;

        let resolve, reject;
        let promise = new Promise(function () {
            resolve = arguments[0];
            reject = arguments[1];
        });

        let timeoutPromise;
        if (timeout > 0) {
            timeoutPromise = this.$timeout(function () {
                reject(`transfer() timed out while waiting for a response.`);
            }, timeout);
        }

        let self = this;
        let removeMonitor = this.$rootScope.$on(this.config.crossDomainMessageSink.incomingMessageName, function (event, response) {
            
            if (response.result !== bufferLength) {
                reject(response);
            }
            else {
                resolve(response);
            }

            removeMonitor();
            if (timeoutPromise)
                self.$timeout.cancel(timeoutPromise);
        });

        //While the transferrable specification allows for multiple objects,
        //IE10 only supports one. So, I'm leaving it at that for now, despite
        //how obtuse that may seem.
        this._contentWindow.postMessage(buffer, targetOrigin, [buffer]);
        return promise;
    }
}

module.exports = Channel;