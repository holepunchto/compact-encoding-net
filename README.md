# compact-encoding-net

[compact-encoding](https://github.com/compact-encoding/compact-encoding) codecs for net types.

## Installation

```sh
npm install compact-encoding-net
```

## Codecs

### `port`

Codec for 16 bit port numbers.

```js
const { port } = require('compact-encoding-net')
```

#### Encoding

```js
const buffer = cenc.encode(port, 8080)
```

#### Decoding

```js
cenc.decode(port, buffer)
// 8080
```

### `ipv4`

Codec for IPv4 addresses.

```js
const { ipv4 } = require('compact-encoding-net')
```

#### Encoding

```js
const buffer = cenc.encode(ipv4, { address: '127.0.0.1', port: 8080 })
```

#### Decoding

```js
cenc.decode(ipv4, buffer)
// { family: 'IPv4', address: '127.0.0.1', port: 8080 }
```

### `ipv6`

Codec for IPv6 addresses.

```js
const { ipv6 } = require('compact-encoding-net')
```

#### Encoding

```js
const buffer = cenc.encode(ipv6, { address: '::1', port: 8080 })
```

#### Decoding

```js
cenc.decode(ipv4, buffer)
// { family: 'IPv6', address: '0:0:0:0:0:0:0:1', port: 8080 }
```

### `ip`

Codec for general IP addresses.

```js
const { ip } = require('compact-encoding-net')
```

#### Encoding

```js
const ipv4 = cenc.encode(ip, { family: 'IPv4', address: '127.0.0.1', port: 8080 })
```

```js
const ipv6 = cenc.encode(ip, { family: 'IPv6', address: '::1', port: 8080 })
```

#### Decoding

```js
cenc.decode(ip, ipv4)
// { family: 'IPv4', address: '127.0.0.1', port: 8080 }
```

```js
cenc.decode(ip, ipv6)
// { family: 'IPv6', address: '0:0:0:0:0:0:0:1', port: 8080 }
```
