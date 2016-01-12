     _____                _                  
    |  _  |              | |                 
    | | | |_   _____ _ __| |_ _   _ _ __ ___ 
    | | | \ \ / / _ \ '__| __| | | | '__/ _ \
    \ \_/ /\ V /  __/ |  | |_| |_| | | |  __/
     \___/  \_/ \___|_|   \__|\__,_|_|  \___|
                                             
                                             

[![Build Status](https://travis-ci.org/rodrigogs/overture.svg?branch=master)](https://travis-ci.org/rodrigogs/overture)

## About
Overture uses proxy crawlers capable of read free proxy list websites and test the results to leave only the healthy ones.
You can think of Overture as a proxy pool service.

## Install
> npm install overturejs

## Usage
```javascript
const Overture = require('overture');

let overture = new Overture();
overture.start(intervalInMinutes);
// Starts an Overture instance that verifies the proxy lists within the given interval.
let myProxy = overture.pick();
// Returns a tested healthy proxy server with the smallest latency.
overture.stop();
// Stops the Overture instance.
let isRunning = overture.isRunning;
// Returns true if instance is running and false if it's not.
```

## License

[Licence](https://github.com/rodrigogs/overture/blob/master/LICENSE) © Rodrigo Gomes da Silva
