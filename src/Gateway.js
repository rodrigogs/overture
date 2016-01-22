'use strict';

const url = require('url');
const request = require('request');
const Agent = require('socks5-http-client/lib/Agent');
const TEST_URL = 'http://httpbin.org/get';

module.exports = class Gateway {
    constructor(hostname, port, protocol, anonymity, country, region, city, uptime, provider) {
        let args = hostname || {};

        this.hostname = args.hostname || hostname;
        this.port = args.port || port;
        this.protocol =  args.protocol || protocol;
        this.anonymity = args.anonymity || anonymity;
        this.country = args.country || country;
        this.region = args.region || region;
        this.city = args.city || city;
        this.uptime = args.uptime || uptime;
        this.provider = args.provider || provider;
        this.attempts = 0;
        this.isEngaged = false;
        this.isHealthy = undefined;
        this.verifiedAt = undefined;
        this.latency = undefined;
    }

    get url() {
        return url.format({
            protocol: this.protocol,
            slashes: true,
            hostname: this.hostname,
            port: this.port
        });
    }

    ping(callback) {
        let r;
        if (this.protocol && (this.protocol.indexOf('socks') > -1)) {
            r = request.defaults({
                agentClass: Agent,
                agentOptions: {
                    socksHost: this.hostname,
                    socksPort: this.port
                }
            });
        } else {
            r = request.defaults({'proxy': this.url});
        }

        r.get(TEST_URL, {timeout: 10000, time: true}, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                try {
                    body = body ? JSON.parse(body) : null;
                } catch (ex) {
                    body = null;
                } finally {
                    if (body && body.url === TEST_URL) {
                        return callback(response.elapsedTime);
                    }
                }
            }

            callback(false);
        });
    }
};