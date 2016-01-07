'use strict';

const async = require('async');
const HideMyAss = require('./src/providers/hidemyass');
const FreeProxyLists = require('./src/providers/freeproxylists');

/** Overture main class */
module.exports = class Overture {

    /**
     * Creates an Overture instance.
     *
     * @param {string} logLevel The log level to be shown in the console
     */
    constructor(logLevel) {
        this._interval = null,
        this._running = false,
        this._healthyGateways = [];
    }

    /**
     * Checks gateways healthy.
     *
     * @param {Gateway[]} newGateways
     * @param {function} done Callback
     */
    healthCheck(newGateways, done) {
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

            this._healthyGateways = healthyOnes;
            if (done) {
                done(this._healthyGateways);
            }
        });
    }

    /**
     * Finds a healthy gateway.
     *
     * @param {number} index The gateway index (from list method)
     * @param {function} callback Callback
     */
    findHealthyGateway(index, callback) {
    	if (!this._running) {
    		this.start(null, gateways => {
                callback(gateways[0]);
                this.stop();
            });
            return;
    	}

    	if (!index) {
    		callback(this._healthyGateways[0]);
    		return;
    	}

        try {
            callback(this._healthyGateways[index]);
        } catch (err) {
            console.log('No gateway with the given index was found');
        }
    }

    /**
     * Lists the current verified gateways.
     */
    list() {
        for (let i = 0, len = this._healthyGateways.length; i < len; i++) {
            let gtw = this._healthyGateways[i];
            console.log(`${i}: ${gtw.provider}: ${gtw.getUrl()}`);
        }

        return this._healthyGateways;
    }

    /**
     * Starts the crawler service.
     *
     * @param {number} interval The verification interval
     * @param {function} callback Callback
     */
    start(interval, callback) {
        if (this._running) {
            console.log('Already running');
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
                    return console.error(err);
                }

                this.healthCheck(gatewaysList, callback);
            });
        };

        verify();

        this._interval = setInterval(verify, interval || 120000);
        this._running = true;
        console.log('Service started');
    }

    /**
     * Stops the crawler service.
     */
    stop() {
        if (!this._running) {
            return console.log('Already stopped');
        }
        clearInterval(this._interval);
        this._running = false;
        console.log('Service stopped');
    }

    /**
     * Returns if the service is running.
     *
     * @returns {boolean}
     */
    isRunning() {
        return this._running;
    }
};
