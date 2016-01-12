'use strict';

import test from 'ava';
import Overture from './index.js';

let overture = null;

test.beforeEach('reinstantiate overture', t => {
    overture = new Overture();
});

test.afterEach('stop overture', t => {
    overture.stop();
});

test('start Overture service', t => {
    overture.start(1);
    t.ok(overture.isRunning, 'Failed to start overture');
});