'use strict';

const async = require('async');
const HideMyAss = require('./src/providers/hidemyass');

let _gateways = [];

const _healthCheck = () => {
    async.each(_gateways, (gateway, callback) => {
        gateway.ping(function (success) {
            if (success) {
                gateway.status = 'OK';
            } else {
                gateway.status = 'BAD';
            }
            callback();
        });
    }, err => {
        if (err) {
            return console.log(err);
        }
        
        _gateways.forEach(gateway => {
            console.log(`${gateway.getUrl()} status is ${gateway.status}`);
        });
    });
};

HideMyAss.crawl(gateways => {
    _gateways = gateways;
    
    _healthCheck();
});

module.exports = {
    // TODO
};