import _ from 'lodash';
import URI from 'urijs';
import Promise from 'bluebird';

import Channel from './Channel';

/**
 * Represents a message sink that uses an embedded iFrame to HostWebProxy.aspx and postMessage to bypass cross-origin policy.
 * Effectively a channel factory
 */
class CrossDomainMessageSink {
    constructor(config, $rootScope, $timeout, $resourceLoader) {
        this.config = config;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.$resourceLoader = $resourceLoader;

        this.channels = {};
    }

    /**
     * Creates a new cross-domain messaging channel to the specified proxy url.
     */
    async createChannel(proxyUrl, timeout) {

        if (!_.isString(proxyUrl))
            throw "proxyUrl must be specified as the first argument.";

        let proxyUri = new URI(proxyUrl);
        let origin = proxyUri.origin();
        if (this.channels[origin])
            return this.channels[origin];

        if (!timeout)
            timeout = this.config.crossDomainMessageSink.createChannelTimeout;

        if (!timeout)
            timeout = 5 * 1000;

        proxyUri.addQuery({ v: (new Date()).getTime() });
        let eventResult = await this.$resourceLoader.loadIFrame(proxyUri.toString(), "allow-forms allow-scripts allow-same-origin");

        let channel;
        this.channels[origin] = channel = new Channel(this.config, this.$rootScope, this.$timeout, eventResult.path[0].contentWindow);
        
        await channel.invoke("Ping", {}, null, timeout);

        return channel;
    }

    //TODO: Destroy channel.
}

export default CrossDomainMessageSink;