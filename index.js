'use strict';

const async = require('async');
const HideMyAss = require('./src/providers/hidemyass');
const FreeProxyLists = require('./src/providers/freeproxylists');

let _interval = null;
let _running = false;
let _healthyGateways = [];

const _healthCheck = (newGateways, done) => {
    console.log('Checking healthy gateways...');
    
    let gateways = [];
    
    if (newGateways) {
        for (let i = 0, len = newGateways.length; i < len; i++) {
            let current = newGateways[i];
            let alreadyInTheList = gateways.find((ga) => {
                return ((ga.ip === current.ip)
                    && (ga.port === current.port)
                    && (ga.protocol === current.protocol));
            });
            
            if (!alreadyInTheList) {
                gateways.push(current);
            }
        }
    }
    
    let healthyOnes = [];
    async.each(gateways, (gateway, callback) => {
        gateway.ping((success) => {
            if (!success) {
                healthyOnes.push(gateway);
            }
            callback();
        });
    }, err => {
        if (err) {
            return console.log(err);
        }
        
        _healthyGateways = healthyOnes;
        if (done) {
            done(_healthyGateways);
        }
    });
};

const _findHealthyGateway = (index, callback) => {
    if (_running) {
        if (index) {
            try {
                callback(_healthyGateways[index]);
            } catch (err) {
                console.log('No gateway with the given index was found');
            }
        } else {
            callback(_healthyGateways[0]);
        }
    } else {
        _start(null, (gateways) => {
            callback(gateways[0]);
            _stop();
        });
    }
};

const _start = (interval, callback) => {
    if (_running) {
        return console.log('Already running');
    }
    
    const verify = () => {
        let gatewaysList = [];
        async.parallel([
            cb => {
                FreeProxyLists.crawl(gateways => {
                    gatewaysList.push.apply(gatewaysList, gateways);
                    cb();
                });
            },
            cb => {
                HideMyAss.crawl(gateways => {
                    gatewaysList.push.apply(gatewaysList, gateways);
                    cb();
                });
            }
        ], err => {
            if (err) {
                return console.log(err);
            }
            
            _healthCheck(gatewaysList, callback);
        });
    };
    
    verify();
    
    _interval = setInterval(verify, interval || 120000);
    _running = true;
    console.log('Service started');
};

const _stop = () => {
    if (_running) {
        return console.log('Already stopped');
    }
    clearInterval(_interval);
    _running = false;
    console.log('Service stoped');
};

const _isRunning = () => {
    return _running;
};

_start(null, (gateways) => {
    for (var g in gateways) {
        g = gateways[g];
        console.log(`${g.getUrl()} is OK`);
    }
});

module.exports = {
    start: _start,
    stop: _stop,
    isRunning: _isRunning,
    healthCheck: _healthCheck,
    findHealthyGateway: _findHealthyGateway
};