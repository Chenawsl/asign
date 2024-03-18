async function g(
  { logger: r, http: t },
  e = '\u81EA\u5B9A\u4E49\u6D88\u606F',
  n,
) {
  try {
    let o = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 1e4,
      ...n,
    }
    Reflect.has(n, 'data') &&
      Reflect.has(n.data, 'agent') &&
      ((o.agent = n.data.agent), delete n.data.agent)
    let s = await t.fetch(o),
      { errcode: a, code: i, err: p } = s
    if (a || p || ![0, 200, void 0].some((c) => i === c))
      return r.error(`${e}\u53D1\u9001\u5931\u8D25`, JSON.stringify(s))
    r.info(`${e}\u5DF2\u53D1\u9001\uFF01`)
  } catch (o) {
    r.info(`${e}\u53D1\u9001\u5931\u8D25: ${o.message}`)
  }
}
async function y({ logger: r, http: t }, e, n, o) {
  try {
    if (!e || !e.url) return
    let { data: s, timeout: a, headers: i } = e,
      c = {
        method: e.method.toUpperCase() || 'POST',
        timeout: a,
        headers: i,
        url: '',
      }
    if (
      ((c.url = e.url
        .replace('{title}', encodeURIComponent(n))
        .replace('{text}', encodeURIComponent(o))),
      s && Object.keys(s).length)
    ) {
      let u = JSON.stringify(s)
        .replace(/{title}/g, n)
        .replace(/{text}/g, o)
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
      c.data = JSON.parse(u)
    }
    await t.fetch(c),
      r.info('\u81EA\u5B9A\u4E49\u6D88\u606F\u5DF2\u53D1\u9001\uFF01')
  } catch (s) {
    r.info(
      `\u81EA\u5B9A\u4E49\u6D88\u606F\u53D1\u9001\u5931\u8D25: ${s.message}`,
    ),
      r.error(s)
  }
}
async function x(r, { token: t, ...e }, n, o) {
  return g(r, 'pushplus', {
    url: 'http://www.pushplus.plus/send',
    method: 'POST',
    data: { token: t, title: n, content: o, ...e },
  })
}
async function m(r, { token: t, ...e }, n, o) {
  return g(r, 'Server\u9171', {
    url: `https://sctapi.ftqq.com/${t}.send`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: { text: n, desp: o, ...e },
  })
}
async function l(
  r,
  {
    msgtype: t = 'text',
    touser: e = '@all',
    agentid: n,
    corpid: o,
    corpsecret: s,
    ...a
  },
  i,
  p,
) {
  try {
    let { access_token: c } = await r.http.fetch({
      url: 'https://qyapi.weixin.qq.com/cgi-bin/gettoken',
      method: 'POST',
      data: { corpid: o, corpsecret: s },
      headers: { 'Content-Type': 'application/json' },
    })
    return g(r, '\u4F01\u4E1A\u5FAE\u4FE1\u63A8\u9001', {
      url: `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${c}`,
      data: {
        touser: e,
        msgtype: t,
        agentid: n,
        [t]: {
          content: `${i}

${p}`,
        },
        ...a,
      },
    })
  } catch (c) {
    r.logger.error('\u4F01\u4E1A\u5FAE\u4FE1\u63A8\u9001\u5931\u8D25'),
      r.logger.error(c)
  }
}
async function w(r, { url: t, msgtype: e = 'text', ...n }, o, s) {
  return g(r, '\u4F01\u4E1A\u5FAE\u4FE1Bot\u63A8\u9001', {
    url: t,
    data: {
      msgtype: e,
      [e]: {
        centent: `${o}

${s}`,
      },
      ...n,
    },
  })
}
async function k(
  r,
  {
    apiHost: t = 'api.telegram.org',
    token: e,
    disable_web_page_preview: n = !0,
    agent: o,
    ...s
  },
  a,
  i,
) {
  return g(r, 'Telegram Bot \u63A8\u9001', {
    url: `https://${t}/bot${e}/sendMessage`,
    data: {
      disable_web_page_preview: n,
      ...s,
      text: `${a}

${i}`,
    },
    agent: o,
  })
}
async function A(r, { key: t, level: e = 'passive', ...n }, o, s) {
  return g(r, 'Bark ios \u63A8\u9001', {
    url: `https://api.day.app/${t}`,
    data: { body: s, title: o, level: e, ...n },
  })
}
async function O(
  r,
  { key: t, sid: e, query: n, msgtype: o = 'text', ...s },
  a,
  i,
) {
  let p = new URLSearchParams({ key: t, sid: e })
  return (
    n &&
      Object.entries(n).forEach(([c, u]) => {
        p.append(c, String(u))
      }),
    g(r, 'Bark ios \u63A8\u9001', {
      url: `https://api.2im.cn/push?${p.toString()}`,
      data: { msgtype: o, content: i, title: a, ...s },
    })
  )
}
function h() {
  return {
    pushplus: x,
    serverChan: m,
    workWeixin: l,
    workWeixinBot: w,
    tgBot: k,
    bark: A,
    twoIm: O,
    customPost: y,
  }
}
async function b({ logger: r }, t, e, n) {
  try {
    if (!t || !t.pass || !t.from || !t.host) return
    let { createTransport: o } = await import('nodemailer'),
      s = Number(t.port) || 465,
      i = await o({
        host: t.host,
        port: s,
        secure: s === 465,
        auth: { user: t.from, pass: t.pass },
      }).sendMail({
        from: `${e} <${t.from}>`,
        to: t.to,
        subject: e,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        text: n.replace(
          /\n/g,
          `\r
`,
        ),
      })
    r.info(`\u90AE\u4EF6\u6D88\u606F\u5DF2\u53D1\u9001: ${i.messageId}`)
  } catch (o) {
    r.error('\u90AE\u4EF6\u6D88\u606F\u53D1\u9001\u5931\u8D25', o)
  }
}
async function P(r, t, e, n) {
  let o = { email: b, ...h() }
  for (let [s, a] of Object.entries(t)) {
    let i = o[s]
    !i || !t || (await B(r, a), await i(r, a, e, n))
  }
}
async function $(r) {
  let { HttpsProxyAgent: t } = await import('hpagent')
  return { https: new t({ maxSockets: 256, scheduling: 'lifo', proxy: r }) }
}
async function B(r, t) {
  if (typeof t.proxy == 'string')
    try {
      t.agent = await $(t.proxy)
    } catch (e) {
      r.logger.error(e)
    }
}
export {
  A as bark,
  y as customPost,
  b as email,
  h as getAllPush,
  x as pushplus,
  P as sendNotify,
  m as serverChan,
  k as tgBot,
  O as twoIm,
  l as workWeixin,
  w as workWeixinBot,
}
;(async () => {
  await module.exports.run()
})()
