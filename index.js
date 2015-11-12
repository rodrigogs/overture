'use strict';

const phantom = require('phantom');
const async = require('async');
const Gateway = require('./classes/Gateway');

let _gateways = [];

const _crawl = (url, callback) => {
    phantom.create(ph => {
        ph.createPage(page => {
            page.open(url, function (status) {
                console.log(`Opened page ${url} with status ${status}`);
                page.evaluate(
                    /* It runs on the virtual browser */
                    function () {
                        var gtws = [];
                        var table = $('table#listable tbody');
                        if (table) {
                            
                            var rows = table.find('tr');
                            rows.each(function (index, tr) {
                                
                                var gateway = {};
                                var cols = $(tr).find('td');
                                cols.each(function (index, col) {
                                    
                                    col = $(col);
                                    switch (col.index()) {
                                        case 1:
                                            gateway.ip = col[0].innerText.trim();
                                            break;
                                        case 2:
                                            gateway.port = col[0].innerText.trim();
                                            break;
                                        case 3:
                                            gateway.country = col[0].innerText.trim();
                                            break;
                                        case 6:
                                            gateway.protocol = col[0].innerText.trim();
                                            break;
                                        case 7:
                                            gateway.anonymity = col[0].innerText.trim();
                                            break;
                                    }
                                    
                                    gtws.push(gateway);
                                });
                            });
                        }
                        
                        return gtws;
                    }
                    /* XXX */
                , (gateways) => {
                    _gateways = gateways
                        .filter((n) => { return !!n })
                        .map((gtw) => { return new Gateway(gtw) });
                    
                    _healthCheck();
                    
                    ph.exit();
                });
            });
        });
    });
};

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
        
        console.log(_gateways);
    });
};

_crawl('http://proxylist.hidemyass.com/search-1292985#listable');

module.exports = {
    // TODO
};