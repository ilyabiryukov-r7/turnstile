---
layout: default
title: Configuration

icon: cog
order: 100
---

# {{ page.title }}

The Turnstile server can load configuration from JSON. Pass the path of a JSON file that should be load with the `-c` flag:

```bash
./bin/server -c conf/production.json
```

Paths may be absolute or relative to the process's working directory. The following are supported parameters and their defaults:

```javascript
{
  /*
   * Set the front-end port and listen address
   */
  listen: {
    port: 9300,
    bind: '0.0.0.0'
  },

  log: {
    /*
     * Any valid Winston Console transport parameters may be defined here
     */
    level: 'info'
  },

  /*
   * Configure a correlation identifier header for forwarded requests
   */
  correlation: {
    enable: true,
    header: 'X-Request-Identifier'
  },

  local: {
    /*
     * Define the path to the JSON document containing keys and the signal that should
     * trigger reloads of the file after it is updated
     */
    db: {
      path: 'data/keys.json',
      signal: 'SIGHUP'
    },

    /*
     * Configure the HMAC signing algorithm and maximum date-header skew
     */
    algorithm: 'sha256',
    skew: 1000
  },

  /*
   * Configure the hostname and port of the upstream service that requests
   * should be forwarded to
   */
  service: {
    port: 9301,
    hostname: 'localhost'
  }
}
```

See the [Winston Console](https://github.com/winstonjs/winston/blob/master/docs/transports.md#console-transport) transport documentation for details of supported `log` parameters.
