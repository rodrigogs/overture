     _____                _                  
    |  _  |              | |                 
    | | | |_   _____ _ __| |_ _   _ _ __ ___ 
    | | | \ \ / / _ \ '__| __| | | | '__/ _ \
    \ \_/ /\ V /  __/ |  | |_| |_| | | |  __/
     \___/  \_/ \___|_|   \__|\__,_|_|  \___|
                                             
                                             

[![Build Status](https://travis-ci.org/rodrigogs/overture.svg?branch=master)](https://travis-ci.org/rodrigogs/overture)

## About
Overture is a proxy crawler capable of read multiple free proxy list websites and test the results to leave only the healthy ones.

## Install
> npm install overture

## Usage
```
const Overture = require('overture');

let overture = new Overture();
overture.start(interval(millis), callback);
// starts an Overture instance that verifies the proxy lists within the interval and returns the first list received in the callback
overture.list();
// shows the current proxy list in the console, and also returns it as an array
overture.healthCheck(newGateways, done);
// checks the healthy of the current proxy list, and also adds new optional proxies if correctly provided. When done, a list with the healthy proxies is returned.
overture.findHealthyGateway(index, callback);
// returns a tested healthy proxy server. You can also choose a specific one from the list() method passing its index.
overture.stop();
// stops the Overture instance
```

## License

[Licence](https://github.com/rodrigogs/overture/blob/master/LICENSE) © Rodrigo Gomes da Silva
