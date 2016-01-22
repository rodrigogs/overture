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

let overture = new Overture('degub');

overture.start(2);
// Starts an Overture instance that verifies the proxy lists within the given interval(in minutes).
overture.stop();
// Stops the Overture instance

overture.serve('127.0.0.1', 3000);
// Create a http server
// http://127.0.0.1:3000/list, http://127.0.0.1:3000/all, http://127.0.0.1:3000/best, http://127.0.0.1:3000/random

overture.on('ready', (currentHealthyList) => { console.log(currentHealthyList) } );
overture.on('halt', () => { console.log('Sorry, there are no proxies alive :(') } );
// Events

let rawList = overture.list;
// The current raw list
let myProxy = overture.pickBest();
// Returns a tested healthy proxy server with the lowest latency
let myProxies = overture.pickAll();
// Returns a list with all healthy gateways
let isRunning = overture.isRunning;
// Returns true if instance is running and false if it's not
let status = overture.status;
// Returns the current instance status: [ started, ready, halt, stopped ]
```

## TODO
* Better documentation

## License

[Licence](https://github.com/rodrigogs/overture/blob/master/LICENSE) © Rodrigo Gomes da Silva
