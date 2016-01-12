'use strict';

import test from 'ava';
import Overture from './index.js';
import Gateway from './src/gateway/Gateway';

let overture = null;

test.beforeEach('reinstantiate overture', t => {
    overture = new Overture();
});

test.afterEach('stop overture', t => {
    overture.stop();
});

test.cb('start Overture service and receive a proxy list', t => {
    t.plan(2);
    overture.start(null, gateways => {
        if (gateways) {
            t.true((gateways instanceof Array) && (gateways.length > 0), 'Return should be an array');
        } else {
            t.fail('No proxy list was received');
        }
        
        overture.stop();
        t.false(overture.isRunning(), 'Service should be stopped at this point');
        
        t.end();
    });
});

test.cb('start Overture service and receive a healthy proxy', t => {
    t.plan(2);
    overture.findHealthyGateway(null, gateway => {
        if (gateway) {
            t.true((gateway instanceof Gateway), 'Return should be a Gateway');
            
            gateway.ping(success => {
                t.true((gateway instanceof Gateway), 'Returned proxy is not healthy');
                t.end();
            });
            return;
        }
        
        t.fail('No proxy was received');
        t.end();
    });
});

test.cb('list the healthy proxies found', t => {
    t.plan(1);
    overture.start(null, gateways => {
        if (gateways) {
            let list = overture.list();
            t.true(list instanceof Array);
            t.end();
            return;
        }
        
        t.fail('No proxy list was received');
        t.end();
    });
});