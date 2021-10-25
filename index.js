const c = require('compact-encoding')

const port = c.uint16

const address = (family, address) => {
  return {
    preencode (state, m) {
      address.preencode(state, m.address)
      port.preencode(state, m.port)
    },
    encode (state, m) {
      address.encode(state, m.address)
      port.encode(state, m.port)
    },
    decode (state) {
      return {
        family,
        address: address.decode(state),
        port: port.decode(state)
      }
    }
  }
}

const ipv4Address = {
  preencode (state, m) {
    state.end += 4
  },
  encode (state, m) {
    const ip = parseIPv4(m)
    for (let i = 0; i < 4; i++) {
      c.uint.encode(state, ip[i])
    }
  },
  decode (state) {
    return (
      c.uint.decode(state) + '.' +
      c.uint.decode(state) + '.' +
      c.uint.decode(state) + '.' +
      c.uint.decode(state)
    )
  }
}

const ipv4 = address('IPv4', ipv4Address)

const ipv6Address = {
  preencode (state, m) {
    state.end += 16
  },
  encode (state, m) {
    const ip = parseIPv6(m)
    for (let i = 0; i < 8; i++) {
      c.uint16.encode(state, ip[i])
    }
  },
  decode (state) {
    return (
      c.uint16.decode(state).toString(16) + ':' +
      c.uint16.decode(state).toString(16) + ':' +
      c.uint16.decode(state).toString(16) + ':' +
      c.uint16.decode(state).toString(16) + ':' +
      c.uint16.decode(state).toString(16) + ':' +
      c.uint16.decode(state).toString(16) + ':' +
      c.uint16.decode(state).toString(16) + ':' +
      c.uint16.decode(state).toString(16)
    )
  }
}

const ipv6 = address('IPv6', ipv6Address)

const ip = {
  preencode (state, m) {
    state.end += 1 // Version
    if (m.family === 'IPv4') ipv4.preencode(state, m)
    else ipv6.preencode(state, m)
  },
  encode (state, m) {
    if (m.family === 'IPv4') {
      c.uint.encode(state, 4)
      ipv4.encode(state, m)
    } else {
      c.uint.encode(state, 6)
      ipv6.encode(state, m)
    }
  },
  decode (state) {
    return c.uint.decode(state) === 4
      ? ipv4.decode(state)
      : ipv6.decode(state)
  }
}

module.exports = {
  port,
  ipv4,
  ipv6,
  ip
}

function parseIPv4 (string) {
  const ip = new Array(4)

  let i = 0
  let j = 0
  let c

  while (i < string.length && j < 4) {
    let n = 0

    while (i < string.length && (c = string.charCodeAt(i++)) !== /* . */ 0x2e) {
      n = n * 10 + (c - /* 0 */ 0x30)
    }

    ip[j++] = n
  }

  return ip
}

function parseIPv6 (string) {
  const ip = new Array(8)

  let i = 0
  let j = 0
  let s = null
  let c

  while (i < string.length && j < 8) {
    let n = 0

    while (i < string.length && (c = string.charCodeAt(i++)) !== /* : */ 0x3a) {
      if (c >= 0x30 && c <= 0x39) {
        n = n * 0x10 + (c - /* 0 */ 0x30)
      } else if (c >= 0x41 && c <= 0x46) {
        n = n * 0x10 + (c - /* A */ 0x41 + 10)
      } else if (c >= 0x61 && c <= 0x66) {
        n = n * 0x10 + (c - /* a */ 0x61 + 10)
      }
    }

    ip[j++] = n

    if (i < string.length && string.charCodeAt(i) === /* : */ 0x3a) {
      i++
      s = j
    }
  }

  if (s !== null) {
    const n = 8 - j
    for (let i = j - 1; i >= s; i--) ip[i + n] = ip[i]
    for (let i = s; i < s + n; i++) ip[i] = 0
  }

  return ip
}
