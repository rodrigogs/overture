import test from 'ava';
import Overture from './index.js';
import HideMyAss from './src/providers/hidemyass';
import FreeProxyLists from './src/providers/freeproxylists';
import Gateway from './src/gateway/Gateway';

let overture = null;

test.beforeEach(t => {
    overture = new Overture();
    t.end();
});

test.afterEach(t => {
    overture.stop();
    t.end();
});

test('crawl the proxy list from HideMyAss', t => {
    HideMyAss.crawl(gateways => {
        t.true((gateways instanceof Array) && (gateways.length > 0), 'Return should be an array');
        t.end();
    });
});

test('crawl the proxy list from FreeProxyLists', t => {
    FreeProxyLists.crawl(gateways => {
        t.true((gateways instanceof Array) && (gateways.length > 0), 'Return should be an array');
        t.end();
    });
});

test('start Overture service and receive a proxy list', t => {
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

test('start Overture service and receive a healthy proxy', t => {
    overture.findHealthyGateway(null, gateway => {
        if (gateway) {
            t.true((gateway instanceof Gateway), 'Return should be a Gateway');
            
            gateway.ping(success => {
                t.true((gateway instanceof Gateway), 'Returned proxy is not healthy');
                t.end();
            });
        } else {
            t.fail('No proxy was received');
            t.end();
        }
    });
});

test('list the healthy proxies found', t => {
    overture.start(null, gateways => {
        if (gateways) {
            let list = overture.list();
            t.true(list instanceof Array && list.length > 0);
            t.end();
        } else {
            t.fail('No proxy list was received');
            t.end();
        }
    });
});