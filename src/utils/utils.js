'use strict';

/**
 * Waits for a defined state
 */
const _waitFor = $config => {
    $config._start = $config._start || new Date();

    if ($config.timeout && new Date - $config._start > $config.timeout) {
        if ($config.error) $config.error();
        if ($config.debug) console.log('timedout ' + (new Date - $config._start) + 'ms');
        return;
    }

    if ($config.check()) {
        if ($config.debug) console.log('success ' + (new Date - $config._start) + 'ms');
        return $config.success();
    }

    setTimeout(_waitFor, $config.interval || 0, $config);
};

module.exports = {
    waitFor: _waitFor
};