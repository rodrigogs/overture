import test from 'ava';
import Overture from './index.js';
import HideMyAss from './src/providers/hidemyass';
import FreeProxyLists from './src/providers/freeproxylists';

test('Should crawl the proxy list from HideMyAss', t => {
    HideMyAss.crawl(gateways => {
        t.true((gateways instanceof Array) && (gateways.length > 0), 'Return should be an array');
        t.pass();
        t.end();
    });
});

test('Should crawl the proxy list from FreeProxyLists', t => {
    FreeProxyLists.crawl(gateways => {
        t.true((gateways instanceof Array) && (gateways.length > 0), 'Return should be an array');
        t.pass();
        t.end();
    });
});

test('Should start Overture service and receive a proxy list', t => {
    let overture = new Overture('debug');
    
    overture.start(null, gateways => {
        if (gateways) {
            t.true((gateways instanceof Array) && (gateways.length > 0), 'Return should be an array');
        } else {
            t.fail('No proxy list was received');
        }
        overture.stop();
        t.false(overture.isRunning(), 'Service should be stopped at this point');
        
        t.pass();
        t.end();
    });
});