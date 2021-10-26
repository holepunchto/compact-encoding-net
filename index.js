const c = require('compact-encoding')

const port = c.uint16

const address = (host) => {
  return {
    preencode (state, m) {
      host.preencode(state, m.host)
      port.preencode(state, m.port)
    },
    encode (state, m) {
      host.encode(state, m.host)
      port.encode(state, m.port)
    },
    decode (state) {
      return {
        host: host.decode(state),
        port: port.decode(state)
      }
    }
  }
}

const ipv4 = {
  preencode (state, m) {
    state.end += 4
  },
  encode: encodeIPv4,
  decode (state) {
    if (state.end - state.start < 4) throw new Error('Out of bounds')
    return (
      state.buffer[state.start++] + '.' +
      state.buffer[state.start++] + '.' +
      state.buffer[state.start++] + '.' +
      state.buffer[state.start++]
    )
  }
}

const ipv4Address = address(ipv4)

const ipv6 = {
  preencode (state, m) {
    state.end += 16
  },
  encode: encodeIPv6,
  decode (state) {
    if (state.end - state.start < 16) throw new Error('Out of bounds')
    return (
      (state.buffer[state.start++] * 256 + state.buffer[state.start++]).toString(16) + ':' +
      (state.buffer[state.start++] * 256 + state.buffer[state.start++]).toString(16) + ':' +
      (state.buffer[state.start++] * 256 + state.buffer[state.start++]).toString(16) + ':' +
      (state.buffer[state.start++] * 256 + state.buffer[state.start++]).toString(16) + ':' +
      (state.buffer[state.start++] * 256 + state.buffer[state.start++]).toString(16) + ':' +
      (state.buffer[state.start++] * 256 + state.buffer[state.start++]).toString(16) + ':' +
      (state.buffer[state.start++] * 256 + state.buffer[state.start++]).toString(16) + ':' +
      (state.buffer[state.start++] * 256 + state.buffer[state.start++]).toString(16)
    )
  }
}

const ipv6Address = address(ipv6)

module.exports = {
  port,
  ipv4,
  ipv4Address,
  ipv6,
  ipv6Address
}

function encodeIPv4 (state, string) {
  const start = state.start
  const end = start + 4

  let i = 0

  while (i < string.length) {
    let n = 0
    let c

    while (i < string.length && (c = string.charCodeAt(i++)) !== /* . */ 0x2e) {
      n = n * 10 + (c - /* 0 */ 0x30)
    }

    state.buffer[state.start++] = n
  }

  state.start = end
}

function encodeIPv6 (state, string) {
  const start = state.start
  const end = start + 16

  let i = 0
  let split = null

  while (i < string.length) {
    let n = 0
    let c

    while (i < string.length && (c = string.charCodeAt(i++)) !== /* : */ 0x3a) {
      if (c >= 0x30 && c <= 0x39) n = n * 0x10 + (c - /* 0 */ 0x30)
      else if (c >= 0x41 && c <= 0x46) n = n * 0x10 + (c - /* A */ 0x41 + 10)
      else if (c >= 0x61 && c <= 0x66) n = n * 0x10 + (c - /* a */ 0x61 + 10)
    }

    state.buffer[state.start++] = n >>> 8
    state.buffer[state.start++] = n

    if (i < string.length && string.charCodeAt(i) === /* : */ 0x3a) {
      i++
      split = state.start
    }
  }

  if (split !== null) {
    const offset = end - state.start
    state.buffer
      .copyWithin(split + offset, split)
      .fill(0, split, split + offset)
  }

  state.start = end
}
