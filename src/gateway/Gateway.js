'use strict';

const url = require('url');
const request = require('request');

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
    }
    
    getUrl() {
        return url.format({
            protocol: this.protocol,
            slashes: true,
            hostname: this.hostname,
            port: this.port
        });
    }
    
    ping(callback) {
        let r = request.defaults({'proxy': this.getUrl()});
        
        r.get('http://www.example.com', {timeout: 10000}, (error, response) => {
            callback(!error && response.statusCode === 200);
        });
    }
};