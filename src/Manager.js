'use strict';

const EventEmitter = require('events');
const async = require('async');
const winston = require('winston');
const Kairos = require('kairos');
const HideMyAss = require('hidemyass-scrapper');
const FreeProxyLists = require('freeproxylists-scrapper');
const Gateway = require('./Gateway');

const STATUS = {
    STARTED: 'started',
    READY: 'ready',
    HALT: 'halt',
    STOPPED: 'stopped'
};

module.exports = class Manager extends EventEmitter {

    /**
     * 
     * @param {string|object} logConfig Log level as string or a winston logger config as an object
     */
    constructor(logConfig) {
        super();
        this._interval = null;
        this._statusInterval = null;
        this._status = undefined;
        this._isRunning = false;
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
     */
    start(interval) {
        if (this.isRunning) {
            return this._logger.log('info', 'Already running');
        }

        const verify = () => {
            async.each([HideMyAss, FreeProxyLists], (provider, cb) => {
                let options = {};
                if (this.status === STATUS.READY) {
                    let proxy = this.pickRandom();
                    if (proxy) {
                        proxy = proxy.url;
                    }
                    options.proxy = proxy;
                }

                this.findGateways(provider, options, this._hatchery.incubate);
                cb();
            });
        };

        const updateStatus = () => {
            let list = this.pickAll();
            if (list && (list.length > 0) && (!this._status || (this._status !== STATUS.READY))) {
                this._status = STATUS.READY;
                this.emit(STATUS.READY, list);
            } else if (this._status === STATUS.READY) {
                this._status === STATUS.HALT;
                this.emit(STATUS.HALT);
            }
        };

        this._interval = setInterval(verify, Kairos.with().setMinutes(interval || 1).toMilliseconds());
        this._statusInterval = setInterval(updateStatus, 10000);

        verify();

        this._isRunning = true;
        this._logger.log('debug', 'Service started');
        this.emit(STATUS.STARTED);
    }

    /**
     * Stops the crawler service.
     */
    stop() {
        if (!this._running) {
            this._logger.log('info', 'Already stopped');
        }
        clearInterval(this._interval);
        clearInterval(this._statusInterval);
        this._running = false;
        this._logger.log('debug', 'Service stopped');
        this.emit(STATUS.STOPPED);
    }

    /**
     * Retrieve gateways from a provider.
     * 
     * @param {module} provider A module that crawls a proxy list
     * @param {object} options Current suports "proxy" option
     * @param {function} callback Callback function to receive the proxy list
     */
    findGateways(provider, options, callback) {
        async.waterfall([
            cb => provider.getPages(options, (err, pages) => {
                if (err) {
                    this._logger.log('error', err.message);
                    pages = 0;
                }
                cb(null, pages);
            }),

            (pages, cb) => async.timesLimit(++pages, 3, (page, next) => {
                options = options || {};
                options.page = page;
                provider.crawl(options, (err, gateways) => {
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
     * Picks the best proxy found.
     * 
     * @returns {Gateway}
     */
    pickBest() {
        if (!this.isRunning) {
            return null;
        }
        return this._hatchery.pick();
    }

    /**
     * Picls a random healthy proxy server.
     * 
     * @returns {Gateway}
     */
    pickRandom() {
        if (!this.isRunning) {
            return null;
        }
        let list = this.pickAll();

        return list[Math.floor(Math.random() * list.length)];
    }

    /**
     * Picks a list with all healthy proxy servers found.
     * 
     * @returns {Gateway[]}
     */
    pickAll() {
        if (!this.isRunning) {
            return null;
        }
        return this._hatchery.listHealthy();
    }

    /**
     * Lists all the proxy servers that are being verified.
     * 
     * @returns {Gateway[]}
     */
    get list() {
        return this._hatchery.listAll();
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
     * Returns current service status.
     * 
     * @returns {string}
     */
    get status() {
        return this._status;
    }
};