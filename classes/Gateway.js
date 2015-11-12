'use strict';

const url = require('url');
const request = require('request');

module.exports = class Gateway {
    constructor(ip, port, protocol, anonymity, country, region, city, uptime) {
        const args = ip || {};
        
        this.ip = args.ip || ip;
        this.port = args.port || port;
        this.protocol =  args.protocol || protocol;
        this.anonymity = args.anonymity || anonymity;
        this.country = args.country || country;
        this.region = args.region || region;
        this.city = args.city || city;
        this.uptime = args.uptime || uptime;
    }
    
    getUrl() {
        return url.format({
            protocol: this.protocol,
            slashes: true,
            hostname: this.ip,
            port: this.port
        });
    }
    
    ping(callback) {
        const r = request.defaults({'proxy': this.getUrl()});
        
        r.get('http://www.google.com', {timeout: 5000}, (error, response) => {
            callback(!error && response.statusCode === 200);
        });
    }
};