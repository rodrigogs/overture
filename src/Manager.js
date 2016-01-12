'use strict';

const async = require('async');
const winston = require('winston');
const Kairos = require('kairos');
const HideMyAss = require('hidemyass-scrapper');
const FreeProxyLists = require('freeproxylists-scrapper');
const Gateway = require('./Gateway');

module.exports = class Manager {

    /**
     * 
     * @param {string|object} logConfig Log level as string or a winston logger config as an object
     */
    constructor(logConfig) {
        this._interval = null,
        this._isRunning = false,
        this._hatchery = require('./Hatchery');
        this._logger = new winston.Logger();
        if (typeof logConfig === 'string') {
            this._logger.configure({
                level: logConfig,
                transports: [ new (winston.transports.Console)() ]
            });
        } else if (typeof logConfig === 'object') {
            this._logger.configure(logConfig);
        }
    }

    /**
     * Starts the crawler service.
     * 
     * @param {number} interval The verification interval in minutes
     * @param {function} callback Callback
     */
    start(interval, callback) {
        if (this.isRunning) {
            return this._logger.log('info', 'Already running');
        }

        this._interval = setInterval(() => {
            async.each([HideMyAss, FreeProxyLists], (provider, cb) => {
                this.findGateways(provider, this._hatchery.incubate);
                cb();
            });
        }, Kairos.with().setMinutes(interval || 1).toMilliseconds());

        this._isRunning = true;
        this._logger.log('debug', 'Service started');
    }

    /**
     * Stops the crawler service.
     */
    stop() {
        if (!this._running) {
            this._logger.log('info', 'Already stopped');
        }
        clearInterval(this._interval);
        this._running = false;
        this._logger.log('debug', 'Service stopped');
    }

    /**
     * 
     */
    findGateways(provider, callback) {
        async.waterfall([
            cb => provider.getPages({}, (err, pages) => {
                if (err) {
                    this._logger.log('error', err.message);
                    pages = 0;
                }
                cb(null, pages);
            }),

            (pages, cb) => async.timesLimit(++pages, 2, (page, next) => {
                provider.crawl({page: page}, (err, gateways) => {
                    if (err) {
                        this._logger.log('error', err.message);
                        return next();
                    }
                    next(null, gateways);
                });
            }, cb)
        ], (err, gateways) => {
            if (err) {} // never should happen

            gateways = [].concat.apply([], gateways);
            async.reduce(gateways, [], (memo, item, cb) => {
                item = new Gateway(item);
                memo.push(item);
                cb(null, memo);
            }, (err, gateways) => {
                if (err) {} // never should happen

                callback(gateways);
            });
        });
    }

    /**
     * 
     */
    pick() {
        if (!this.isRunning) {
            return null;
        }
        return this._hatchery.pick();
    }

    /**
     * Returns if the service is running.
     * 
     * @returns {boolean}
     */
    get isRunning() {
        return this._isRunning;
    }

    /**
     * Lists the current verified gateways.
     */
    get list() {
        return this._hatchery.list().filter(gateway => gateway.isHealthy);
    }
};