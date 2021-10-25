import test from 'brittle'
import c from 'compact-encoding'

import { port, ipv4, ipv6, ip } from './index.js'

test('port', (t) => {
  const p = 0x1234
  const buf = Buffer.from([0x34, 0x12])

  t.alike(c.encode(port, p), buf)
  t.alike(c.decode(port, buf), p)
})

test('ipv4', (t) => {
  const i = { family: 'IPv4', address: '1.2.3.4', port: 0x1234 }
  const buf = Buffer.from([1, 2, 3, 4, 0x34, 0x12])

  t.alike(c.encode(ipv4, i), buf)
  t.alike(c.decode(ipv4, buf), i)
})

test('ipv6', (t) => {
  const i = { family: 'IPv6', address: '1:2:3:4:5:6:7:8', port: 0x1234 }
  const buf = Buffer.from([1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8, 0, 0x34, 0x12])

  t.alike(c.encode(ipv6, i), buf)
  t.alike(c.decode(ipv6, buf), i)

  t.test('abbreviated', (t) => {
    const i = { family: 'IPv6', address: '1:2::7:8', port: 0x1234 }
    const buf = Buffer.from([1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 8, 0, 0x34, 0x12])

    t.alike(c.encode(ipv6, i), buf)
    t.alike(c.decode(ipv6, buf), { ...i, address: '1:2:0:0:0:0:7:8' })
  })

  t.test('prefix abbreviated', (t) => {
    const i = { family: 'IPv6', address: '::5:6:7:8', port: 0x1234 }
    const buf = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 6, 0, 7, 0, 8, 0, 0x34, 0x12])

    t.alike(c.encode(ipv6, i), buf)
    t.alike(c.decode(ipv6, buf), { ...i, address: '0:0:0:0:5:6:7:8' })
  })

  t.test('suffix abbreviated', (t) => {
    const i = { family: 'IPv6', address: '1:2:3:4::', port: 0x1234 }
    const buf = Buffer.from([1, 0, 2, 0, 3, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x34, 0x12])

    t.alike(c.encode(ipv6, i), buf)
    t.alike(c.decode(ipv6, buf), { ...i, address: '1:2:3:4:0:0:0:0' })
  })

  t.test('any', (t) => {
    const i = { family: 'IPv6', address: '::', port: 0x1234 }
    const buf = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x34, 0x12])

    t.alike(c.encode(ipv6, i), buf)
    t.alike(c.decode(ipv6, buf), { ...i, address: '0:0:0:0:0:0:0:0' })
  })

  t.test('lowercase hex', (t) => {
    const i = { family: 'IPv6', address: '::abcd', port: 0x1234 }
    const buf = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xcd, 0xab, 0x34, 0x12])

    t.alike(c.encode(ipv6, i), buf)
    t.alike(c.decode(ipv6, buf), { ...i, address: '0:0:0:0:0:0:0:abcd' })
  })

  t.test('uppercase hex', (t) => {
    const i = { family: 'IPv6', address: '::ABCD', port: 0x1234 }
    const buf = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xcd, 0xab, 0x34, 0x12])

    t.alike(c.encode(ipv6, i), buf)
    t.alike(c.decode(ipv6, buf), { ...i, address: '0:0:0:0:0:0:0:abcd' })
  })
})

test('ip', (t) => {
  t.test('v4', (t) => {
    const i = { family: 'IPv4', address: '1.2.3.4', port: 0x1234 }
    const buf = Buffer.from([4, 1, 2, 3, 4, 0x34, 0x12])

    t.alike(c.encode(ip, i), buf)
    t.alike(c.decode(ip, buf), i)
  })

  t.test('v6', (t) => {
    const i = { family: 'IPv6', address: '1:2:3:4:5:6:7:8', port: 0x1234 }
    const buf = Buffer.from([6, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8, 0, 0x34, 0x12])
    t.alike(c.encode(ip, i), buf)
    t.alike(c.decode(ip, buf), i)
  })
})
