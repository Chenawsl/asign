import dr from 'crypto'
import N from 'fs'
import Pt, { dirname as nr } from 'path'
import { fileURLToPath as xr } from 'url'
var Tt =
    typeof global == 'object' && global && global.Object === Object && global,
  R = Tt
var jt = typeof self == 'object' && self && self.Object === Object && self,
  At = R || jt || Function('return this')(),
  g = At
var Dt = g.Symbol,
  l = Dt
var z = Object.prototype,
  Et = z.hasOwnProperty,
  Nt = z.toString,
  C = l ? l.toStringTag : void 0
function Rt(t) {
  var e = Et.call(t, C),
    r = t[C]
  try {
    t[C] = void 0
    var f = !0
  } catch {}
  var s = Nt.call(t)
  return f && (e ? (t[C] = r) : delete t[C]), s
}
var M = Rt
var zt = Object.prototype,
  Mt = zt.toString
function Wt(t) {
  return Mt.call(t)
}
var W = Wt
var Bt = '[object Null]',
  Ft = '[object Undefined]',
  B = l ? l.toStringTag : void 0
function Lt(t) {
  return t == null
    ? t === void 0
      ? Ft
      : Bt
    : B && B in Object(t)
      ? M(t)
      : W(t)
}
var I = Lt
function Ht(t) {
  return t != null && typeof t == 'object'
}
var F = Ht
var $t = '[object Symbol]'
function Gt(t) {
  return typeof t == 'symbol' || (F(t) && I(t) == $t)
}
var y = Gt
function qt(t, e) {
  for (var r = -1, f = t == null ? 0 : t.length, s = Array(f); ++r < f; )
    s[r] = e(t[r], r, t)
  return s
}
var L = qt
var Kt = Array.isArray,
  b = Kt
var Ut = 1 / 0,
  H = l ? l.prototype : void 0,
  $ = H ? H.toString : void 0
function G(t) {
  if (typeof t == 'string') return t
  if (b(t)) return L(t, G) + ''
  if (y(t)) return $ ? $.call(t) : ''
  var e = t + ''
  return e == '0' && 1 / t == -Ut ? '-0' : e
}
var q = G
function kt(t) {
  var e = typeof t
  return t != null && (e == 'object' || e == 'function')
}
var x = kt
var Jt = '[object AsyncFunction]',
  Vt = '[object Function]',
  Xt = '[object GeneratorFunction]',
  Yt = '[object Proxy]'
function Zt(t) {
  if (!x(t)) return !1
  var e = I(t)
  return e == Vt || e == Xt || e == Jt || e == Yt
}
var K = Zt
var Qt = g['__core-js_shared__'],
  w = Qt
var U = (function () {
  var t = /[^.]+$/.exec((w && w.keys && w.keys.IE_PROTO) || '')
  return t ? 'Symbol(src)_1.' + t : ''
})()
function te(t) {
  return !!U && U in t
}
var k = te
var ee = Function.prototype,
  re = ee.toString
function oe(t) {
  if (t != null) {
    try {
      return re.call(t)
    } catch {}
    try {
      return t + ''
    } catch {}
  }
  return ''
}
var J = oe
var ae = /[\\^$.*+?()[\]{}|]/g,
  fe = /^\[object .+?Constructor\]$/,
  se = Function.prototype,
  pe = Object.prototype,
  ue = se.toString,
  le = pe.hasOwnProperty,
  me = RegExp(
    '^' +
      ue
        .call(le)
        .replace(ae, '\\$&')
        .replace(
          /hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,
          '$1.*?',
        ) +
      '$',
  )
function ie(t) {
  if (!x(t) || k(t)) return !1
  var e = K(t) ? me : fe
  return e.test(J(t))
}
var V = ie
function de(t, e) {
  return t == null ? void 0 : t[e]
}
var X = de
function ne(t, e) {
  var r = X(t, e)
  return V(r) ? r : void 0
}
var _ = ne
var xe = (function () {
    try {
      var t = _(Object, 'defineProperty')
      return t({}, '', {}), t
    } catch {}
  })(),
  j = xe
var ce = 9007199254740991,
  he = /^(?:0|[1-9]\d*)$/
function ge(t, e) {
  var r = typeof t
  return (
    (e = e ?? ce),
    !!e &&
      (r == 'number' || (r != 'symbol' && he.test(t))) &&
      t > -1 &&
      t % 1 == 0 &&
      t < e
  )
}
var Y = ge
function ye(t, e, r) {
  e == '__proto__' && j
    ? j(t, e, { configurable: !0, enumerable: !0, value: r, writable: !0 })
    : (t[e] = r)
}
var Z = ye
function be(t, e) {
  return t === e || (t !== t && e !== e)
}
var P = be
var _e = Object.prototype,
  ve = _e.hasOwnProperty
function Se(t, e, r) {
  var f = t[e]
  ;(!(ve.call(t, e) && P(f, r)) || (r === void 0 && !(e in t))) && Z(t, e, r)
}
var Q = Se
var Oe = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
  Ce = /^\w*$/
function Ie(t, e) {
  if (b(t)) return !1
  var r = typeof t
  return r == 'number' || r == 'symbol' || r == 'boolean' || t == null || y(t)
    ? !0
    : Ce.test(t) || !Oe.test(t) || (e != null && t in Object(e))
}
var tt = Ie
var we = _(Object, 'create'),
  m = we
function Pe() {
  ;(this.__data__ = m ? m(null) : {}), (this.size = 0)
}
var et = Pe
function Te(t) {
  var e = this.has(t) && delete this.__data__[t]
  return (this.size -= e ? 1 : 0), e
}
var rt = Te
var je = '__lodash_hash_undefined__',
  Ae = Object.prototype,
  De = Ae.hasOwnProperty
function Ee(t) {
  var e = this.__data__
  if (m) {
    var r = e[t]
    return r === je ? void 0 : r
  }
  return De.call(e, t) ? e[t] : void 0
}
var ot = Ee
var Ne = Object.prototype,
  Re = Ne.hasOwnProperty
function ze(t) {
  var e = this.__data__
  return m ? e[t] !== void 0 : Re.call(e, t)
}
var at = ze
var Me = '__lodash_hash_undefined__'
function We(t, e) {
  var r = this.__data__
  return (
    (this.size += this.has(t) ? 0 : 1),
    (r[t] = m && e === void 0 ? Me : e),
    this
  )
}
var ft = We
function v(t) {
  var e = -1,
    r = t == null ? 0 : t.length
  for (this.clear(); ++e < r; ) {
    var f = t[e]
    this.set(f[0], f[1])
  }
}
v.prototype.clear = et
v.prototype.delete = rt
v.prototype.get = ot
v.prototype.has = at
v.prototype.set = ft
var A = v
function Be() {
  ;(this.__data__ = []), (this.size = 0)
}
var st = Be
function Fe(t, e) {
  for (var r = t.length; r--; ) if (P(t[r][0], e)) return r
  return -1
}
var d = Fe
var Le = Array.prototype,
  He = Le.splice
function $e(t) {
  var e = this.__data__,
    r = d(e, t)
  if (r < 0) return !1
  var f = e.length - 1
  return r == f ? e.pop() : He.call(e, r, 1), --this.size, !0
}
var pt = $e
function Ge(t) {
  var e = this.__data__,
    r = d(e, t)
  return r < 0 ? void 0 : e[r][1]
}
var ut = Ge
function qe(t) {
  return d(this.__data__, t) > -1
}
var lt = qe
function Ke(t, e) {
  var r = this.__data__,
    f = d(r, t)
  return f < 0 ? (++this.size, r.push([t, e])) : (r[f][1] = e), this
}
var mt = Ke
function S(t) {
  var e = -1,
    r = t == null ? 0 : t.length
  for (this.clear(); ++e < r; ) {
    var f = t[e]
    this.set(f[0], f[1])
  }
}
S.prototype.clear = st
S.prototype.delete = pt
S.prototype.get = ut
S.prototype.has = lt
S.prototype.set = mt
var it = S
var Ue = _(g, 'Map'),
  dt = Ue
function ke() {
  ;(this.size = 0),
    (this.__data__ = { hash: new A(), map: new (dt || it)(), string: new A() })
}
var nt = ke
function Je(t) {
  var e = typeof t
  return e == 'string' || e == 'number' || e == 'symbol' || e == 'boolean'
    ? t !== '__proto__'
    : t === null
}
var xt = Je
function Ve(t, e) {
  var r = t.__data__
  return xt(e) ? r[typeof e == 'string' ? 'string' : 'hash'] : r.map
}
var n = Ve
function Xe(t) {
  var e = n(this, t).delete(t)
  return (this.size -= e ? 1 : 0), e
}
var ct = Xe
function Ye(t) {
  return n(this, t).get(t)
}
var ht = Ye
function Ze(t) {
  return n(this, t).has(t)
}
var gt = Ze
function Qe(t, e) {
  var r = n(this, t),
    f = r.size
  return r.set(t, e), (this.size += r.size == f ? 0 : 1), this
}
var yt = Qe
function O(t) {
  var e = -1,
    r = t == null ? 0 : t.length
  for (this.clear(); ++e < r; ) {
    var f = t[e]
    this.set(f[0], f[1])
  }
}
O.prototype.clear = nt
O.prototype.delete = ct
O.prototype.get = ht
O.prototype.has = gt
O.prototype.set = yt
var D = O
var tr = 'Expected a function'
function E(t, e) {
  if (typeof t != 'function' || (e != null && typeof e != 'function'))
    throw new TypeError(tr)
  var r = function () {
    var f = arguments,
      s = e ? e.apply(this, f) : f[0],
      p = r.cache
    if (p.has(s)) return p.get(s)
    var c = t.apply(this, f)
    return (r.cache = p.set(s, c) || p), c
  }
  return (r.cache = new (E.Cache || D)()), r
}
E.Cache = D
var bt = E
var er = 500
function rr(t) {
  var e = bt(t, function (f) {
      return r.size === er && r.clear(), f
    }),
    r = e.cache
  return e
}
var _t = rr
var or =
    /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
  ar = /\\(\\)?/g,
  fr = _t(function (t) {
    var e = []
    return (
      t.charCodeAt(0) === 46 && e.push(''),
      t.replace(or, function (r, f, s, p) {
        e.push(s ? p.replace(ar, '$1') : f || r)
      }),
      e
    )
  }),
  vt = fr
function sr(t) {
  return t == null ? '' : q(t)
}
var St = sr
function pr(t, e) {
  return b(t) ? t : tt(t, e) ? [t] : vt(St(t))
}
var Ot = pr
var ur = 1 / 0
function lr(t) {
  if (typeof t == 'string' || y(t)) return t
  var e = t + ''
  return e == '0' && 1 / t == -ur ? '-0' : e
}
var Ct = lr
function mr(t, e, r, f) {
  if (!x(t)) return t
  e = Ot(e, t)
  for (var s = -1, p = e.length, c = p - 1, i = t; i != null && ++s < p; ) {
    var u = Ct(e[s]),
      h = r
    if (u === '__proto__' || u === 'constructor' || u === 'prototype') return t
    if (s != c) {
      var T = i[u]
      ;(h = f ? f(T, u, i) : void 0),
        h === void 0 && (h = x(T) ? T : Y(e[s + 1]) ? [] : {})
    }
    Q(i, u, h), (i = i[u])
  }
  return t
}
var It = mr
function ir(t, e, r) {
  return t == null ? t : It(t, e, r)
}
var wt = ir
function Qf(t) {
  return new Promise((e) => setTimeout(() => e(t), t))
}
async function ts(t) {
  let { createConsola: e, consola: r } = await import('./dist-YAQCVLZ3.js')
  return (
    (r.options.level = 5),
    e({
      level: 5,
      reporters: [
        {
          log: ({ type: f, args: s, level: p, date: c }) => {
            if (t && t.pushData) {
              let i = s.reduce((u, h) => `${u} ${h}`, '').substring(1)
              t.pushData.push({ msg: i, type: f, level: p, date: c })
            }
            r[f].apply(r, s)
          },
        },
      ],
    })
  )
}
function es(t) {
  return dr.createHash('sha256').update(t).digest('hex')
}
function cr(t) {
  if (!N.existsSync(t)) throw new Error(`\u6587\u4EF6 ${t} \u4E0D\u5B58\u5728`)
  return new Function(`return ${N.readFileSync(t, 'utf-8')}`)()
}
function rs(t) {
  let e = (s) => Pt.resolve(process.cwd(), s),
    r = (s) => Pt.resolve(nr(xr(import.meta.url)), s),
    f = Array.from(new Set([e(t + '5'), r(t + '5'), e(t), r(t)])).find((s) =>
      N.existsSync(s),
    )
  return f ? cr(f) : void 0
}
function os(t) {
  return t && typeof t == 'object' && !Array.isArray(t)
}
export {
  ts as createLogger,
  rs as getConfig,
  os as isObject,
  cr as readJsonFile,
  wt as setIn,
  es as sha256,
  Qf as sleep,
}
/*! Bundled license information:

lodash-es/lodash.js:
  (**
   * @license
   * Lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="es" -o ./`
   * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   *)
*/
;(async () => {
  await module.exports.run()
})()
