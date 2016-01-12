'use strict';

const async = require('async');
const Gateway = require('./Gateway');

let _list = [];

/**
 * 
 */
const _update = () => {
    async.filter(_list, (gateway, callback) => {

        callback(gateway.attempts < 3);

    }, keep => {
        _list = keep;
        async.filter(_list, (gateway, callback) => {

            callback(!gateway.isEngaged);

        }, disengaged => {
            async.each(disengaged, (gateway, cb) => {
                _verify(gateway);
                cb();
            });
        });
    });
};

/**
 * 
 */
const _verify = (gateway) => {
    gateway.isEngaged = true;
    gateway.ping((success) => {
        if (!success) {
            gateway.isHealthy = false;
            gateway.attempts++;
            if (gateway.attempts <= 3) {
                setTimeout(() => { _verify(gateway); }, 10000);
            }
        } else {
            gateway.attempts = 0;
            gateway.latency = success;
            gateway.isHealthy = true;
            setTimeout(() => { _verify(gateway); }, 30000);
        }
    });
};

/**
 * @param {Gateway[]} gateways
 */
const _incubate = (gateways) => {
    async.filter(gateways, (gateway, callback) => {
        if (!(gateway instanceof Gateway)) {
            return callback(false);
        }

        const exists = _list.find((element) => {
            return (element.protocol === gateway.protocol)
                && (element.hostname === gateway.hostname)
                && (element.port === gateway.port);
        });

        callback(!exists);
    }, (results) => {
        _list = _list.concat(results);
        _update();
    });
};

/**
 * Returns the gateway with the smallest latency
 */
const _pick = () => {
    let healthyList = _list.filter((gateway) => {
        return gateway.isHealthy === true;
    });

    return (healthyList.length > 0) ? healthyList.reduce((previous, current) => {
        if (!previous) {
            return current;
        }
        return (previous.latency < current.latency) ? previous : current;
    }) : null;
};

/**
 * 
 */
const _listGateways = () => {
    return _list;
};

module.exports = {
    incubate: _incubate,
    pick: _pick,
    list: _listGateways
};