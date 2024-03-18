// ../../packages/utils-pure/index.ts
function randomHex(length) {
  return Array.from({
    length: length,
  })
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('')
}
function createLogger(options) {
  let wrap = (type, ...args) => {
    if (options && options.pushData) {
      let msg = args.reduce((str, cur) => `${str} ${cur}`, '').substring(1)
      options.pushData.push({
        msg: msg,
        type: type,
        date: /* @__PURE__ */ new Date(),
      })
    }
    console[type](...args)
  }
  return {
    info: (...args) => wrap('info', ...args),
    error: (...args) => wrap('error', ...args),
    debug: (...args) => wrap('info', ...args),
  }
}
// ../../core/alipan/api.ts
function createApi(http) {
  let memberUrl = 'https://member.aliyundrive.com',
    aliyundriveUrl = 'https://api.aliyundrive.com',
    authUrl = 'https://auth.aliyundrive.com',
    apiUrl = 'https://api.alipan.com'
  return {
    refreshToken: function (refreshToken2) {
      return http.post(`${aliyundriveUrl}/token/refresh`, {
        refresh_token: refreshToken2,
      })
    },
    getAccessToken: function (refreshToken2) {
      return http.post(`${authUrl}/v2/account/token`, {
        refresh_token: refreshToken2,
        grant_type: 'refresh_token',
      })
    },
    signInList: function () {
      return http.post(`${memberUrl}/v2/activity/sign_in_list?_rx-s=mobile`, {
        '_rx-s': 'mobile',
      })
    },
    signIn: function () {
      return http.post(`${memberUrl}/v2/activity/sign_in_info?_rx-s=mobile`, {})
    },
    signInReward: function (signInDay) {
      return http.post(`${memberUrl}/v1/activity/sign_in_reward?_rx-s=mobile`, {
        signInDay: signInDay,
      })
    },
    signInTaskReward: function (signInDay) {
      return http.post(`${memberUrl}/v2/activity/sign_in_task_reward`, {
        signInDay: signInDay,
      })
    },
    updateDeviceExtras: function () {
      return http.post(`${apiUrl}/users/v1/users/update_device_extras`, {
        albumAccessAuthority: !0,
        albumBackupLeftFileTotal: 0,
        albumBackupLeftFileTotalSize: 0,
        albumFile: 0,
        autoBackupStatus: !0,
        // totalSize: 0,
        // useSize: 0,
        brand: 'xiaomi',
        systemVersion: 'Android 13',
      })
    },
    createSession: function (
      deviceId,
      refreshToken2,
      pubKey,
      deviceName,
      modelName,
    ) {
      return http.post(
        'https://api.alipan.com/users/v1/users/device/create_session',
        {
          deviceName: deviceName,
          modelName: modelName,
          nonce: '0',
          pubKey: pubKey,
          refreshToken: refreshToken2,
        },
        {
          headers: {
            'x-device-id': deviceId,
          },
        },
      )
    },
    getDeviceAppletList: function () {
      return http.post(
        `${apiUrl}/adrive/v2/backup/device_applet_list_summary`,
        {},
      )
    },
    getDeviceList: function () {
      return http.post(`${apiUrl}/users/v2/users/device_list`, {})
    },
    getAlbumsInfo: function () {
      return http.post(`${aliyundriveUrl}/adrive/v1/user/albums_info`, {})
    },
    getDeviceRoomList: function () {
      return http.post(
        'https://user.aliyundrive.com/v1/deviceRoom/listDevice',
        {},
      )
    },
    getDeviceRoomRewardInfoToday: function () {
      return http.post(`${memberUrl}/v1/deviceRoom/rewardInfoToday`, {})
    },
    getDeviceRoomRewardEnergy: function (deviceId) {
      return http.post(`${memberUrl}/v1/deviceRoom/rewardEnergy`, {
        deviceId: deviceId,
      })
    },
    createFile: function (deviceId, driveId) {
      let size = Math.floor(Math.random() * 3e4)
      return http.post(
        `${aliyundriveUrl}/adrive/v2/biz/albums/file/create`,
        {
          drive_id: driveId,
          part_info_list: [
            {
              part_number: 1,
              part_size: size,
            },
          ],
          parent_file_id: 'root',
          name: Math.floor(Math.random() * 1e8) + '.jpg',
          type: 'file',
          check_name_mode: 'auto_rename',
          size: size,
          create_scene: 'album_autobackup',
          hidden: !1,
          content_type: 'image/jpeg',
        },
        {
          headers: {
            'x-device-id': deviceId,
          },
        },
      )
    },
    completeUpload: function (deviceId, driveId, fileId, uploadId) {
      return http.post(
        `${aliyundriveUrl}/v2/file/complete`,
        {
          drive_id: driveId,
          upload_id: uploadId,
          file_id: fileId,
        },
        {
          headers: {
            'x-device-id': deviceId,
          },
        },
      )
    },
    completeAlbumsUpload: function (deviceId, driveId, fileId, contentHash) {
      return http.post(
        `${aliyundriveUrl}/adrive/v2/biz/albums/file/complete`,
        {
          drive_id: driveId,
          file_id: fileId,
          content_hash: contentHash,
          content_hash_name: 'sha1',
        },
        {
          headers: {
            'x-device-id': deviceId,
          },
        },
      )
    },
    deleteFile: function (deviceId, driveId, fileId) {
      return http.post(
        `${apiUrl}/adrive/v4/batch`,
        {
          requests: [
            {
              body: {
                drive_id: driveId,
                file_id: fileId,
              },
              id: fileId,
              method: 'POST',
              url: '/file/delete',
            },
          ],
          resource: 'file',
        },
        {
          headers: {
            'x-device-id': deviceId,
          },
        },
      )
    },
    home: function () {
      return http.post(`${aliyundriveUrl}/apps/v2/users/home/widgets`, {})
    },
  }
}
// ../../core/alipan/index.ts
function request($, api, name, ...args) {
  try {
    let { success, message, result } = api(...args)
    if (!success) $.logger.error(`${name}\u5931\u8D25`, message)
    else return result
  } catch (error) {
    $.logger.error(`${name}\u5F02\u5E38`, error.message)
  }
  return {}
}
function refreshToken($, token) {
  try {
    let data = $.api.getAccessToken(token)
    if (!data.access_token) {
      $.logger.error('获取 access_token 失败', JSON.stringify(data))
      return
    }
    return data
  } catch (error) {
    $.logger.error('获取 access_token 异常', error.message)
  }
}
function createDeviceApi($, refreshToken2, deviceId) {
  try {
    let { success } = $.api.createSession(
      deviceId,
      refreshToken2,
      randomHex(32),
      'XiaoMi 14Pro',
      'xiaomi',
    )
    return success
      ? ($.logger.info('创建虚拟设备成功'), !0)
      : ($.logger.error(
          `\u521B\u5EFA\u865A\u62DF\u8BBE\u5907${deviceId}\u5931\u8D25`,
        ),
        !1)
  } catch (error) {
    $.logger.error(
      `\u521B\u5EFA\u865A\u62DF\u8BBE\u5907${deviceId}\u5F02\u5E38`,
      error.message,
    )
  }
  return !1
}
function getDeviceRoomListApi($) {
  try {
    let { items } = $.api.getDeviceRoomList()
    if (!items) {
      $.logger.error('获取设备间列表失败')
      return
    }
    return items
  } catch (error) {
    $.logger.error('获取设备间列表异常', error.message)
  }
}
function getDeviceRoomRewardInfo($) {
  return request($, $.api.getDeviceRoomRewardInfoToday, '获取设备间领取信息')
}
function getAlbumsDriveId($) {
  try {
    let { code, message, data } = $.api.getAlbumsInfo()
    if (code !== '200') {
      $.logger.error('获取相册文件夹失败', message)
      return
    }
    return data.driveId
  } catch (error) {
    $.logger.error('获取相册文件夹异常', error.message)
  }
}
function createDevice($) {
  let needNum = 5 - getDeviceRoomListApi($).length
  if (!(needNum <= 0)) {
    $.logger.info(
      `\u9700\u8981\u521B\u5EFA${needNum}\u4E2A\u865A\u62DF\u8BBE\u5907`,
    )
    for (let i = 0; i < needNum; i++)
      createDeviceApi($, $.DATA.refreshToken, randomHex(64))
  }
}
function uploadFile($, deviceId, driveId) {
  try {
    let { file_id, upload_id } = $.api.createFile(deviceId, driveId)
    if (file_id)
      return (
        $.sleep(1e3),
        $.api.completeUpload(deviceId, driveId, file_id, upload_id),
        $.api.completeAlbumsUpload(
          deviceId,
          driveId,
          file_id,
          'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709',
        ),
        {
          file_id: file_id,
          upload_id: upload_id,
        }
      )
    $.logger.error(`${deviceId}\u4E0A\u4F20\u6587\u4EF6\u5931\u8D25`)
  } catch (error) {
    $.logger.error('上传文件异常', error.message)
  }
  return {}
}
function deviceRoomListHandle(deviceRooms) {
  let nofinishDevices = /* @__PURE__ */ new Set(),
    rewardEnergys = /* @__PURE__ */ new Set(),
    okNum = 0
  for (let { canCollectEnergy, id, gmtCollectEnergy } of deviceRooms)
    !canCollectEnergy &&
    new Date(gmtCollectEnergy).getDate() !==
      /* @__PURE__ */ new Date().getDate()
      ? nofinishDevices.add(id)
      : canCollectEnergy
        ? rewardEnergys.add(id)
        : okNum++
  return {
    nofinishDevices: Array.from(nofinishDevices),
    rewardEnergys: Array.from(rewardEnergys),
    okNum: okNum,
  }
}
function getDeviceRoomRewardApi($, id) {
  return request(
    $,
    $.api.getDeviceRoomRewardEnergy,
    `\u9886\u53D6${id}\u8BBE\u5907\u7A7A\u95F4`,
    id,
  ).size
}
function deleteFileApi($, deviceId, driveId, fileId) {
  try {
    $.api.deleteFile(deviceId, driveId, fileId)
  } catch (error) {
    $.logger.error(
      `\u5220\u9664\u6587\u4EF6${fileId}\u5F02\u5E38`,
      error.message,
    )
  }
}
function deleteFiles($, needDeleteFiles, driveId) {
  for (let [fileId, deviceId] of needDeleteFiles)
    deleteFileApi($, deviceId, driveId, fileId), $.sleep(1e3)
}
function deviceRoomTask($) {
  let { rewardCountToday, rewardTotalSize } = getDeviceRoomRewardInfo($)
  if (rewardCountToday >= 5) {
    $.logger.info(
      `\u4ECA\u65E5\u5DF2\u9886\u53D6${rewardCountToday}\u6B21\u8BBE\u5907\u95F4\u7A7A\u95F4\uFF0C\u5386\u53F2\u603B\u5171${rewardTotalSize}M`,
    )
    return
  }
  let driveId = getAlbumsDriveId($)
  if (!driveId) {
    $.logger.error('未获取到文件夹故跳过执行')
    return
  }
  let needDeleteFiles = /* @__PURE__ */ new Map()
  for (createDevice($); _deviceRoomTask(); ) $.sleep(2e3)
  deleteFiles($, needDeleteFiles, driveId)
  function _deviceRoomTask() {
    let items = getDeviceRoomListApi($)
    if (!items) return $.logger.error('无法获取虚拟设备，跳过执行'), !1
    if (items.length === 0)
      return $.logger.error('无法创建虚拟设备，跳过执行'), !1
    let { nofinishDevices, rewardEnergys, okNum } = deviceRoomListHandle(items)
    if (okNum >= 5) return !1
    let tempNum = 0
    for (let deviceId of rewardEnergys) {
      let size = getDeviceRoomRewardApi($, deviceId)
      if (
        (size &&
          ($.logger.info(
            `\u9886\u53D6\u8BBE\u5907\u95F4\u6210\u529F\uFF0C\u83B7\u5F97${size}M`,
          ),
          tempNum++),
        tempNum + okNum >= 5)
      )
        break
      $.sleep(1e3)
    }
    for (let deviceId of nofinishDevices) {
      let { file_id } = uploadFile($, deviceId, driveId) || {}
      file_id && needDeleteFiles.set(file_id, deviceId), $.sleep(1e3)
    }
    return !0
  }
}
function signIn($) {
  let { rewards, signInDay } = request($, $.api.signIn, '签到')
  if (rewards) {
    for (let { status, type } of rewards)
      if (status === 'finished')
        switch (type) {
          case 'dailySignIn':
            request($, $.api.signInReward, '领取签到奖励', signInDay)
            break
          case 'dailyTask':
            request($, $.api.signInTaskReward, '领取每日任务奖励', signInDay)
            break
          default:
            break
        }
  }
}
function getDeviceList($) {
  try {
    let data = $.api.getDeviceAppletList()
    if (!data.deviceItems) {
      $.logger.error('获取设备信息失败', JSON.stringify(data))
      return
    }
    if (data.deviceItems.length === 0) {
      $.logger.error('获取到的设备列表未空')
      return
    }
    return data.deviceItems
  } catch (error) {
    $.logger.error('获取设备信息异常', error.message)
  }
}
function getDevice($) {
  let devices = getDeviceList($)
  return devices ? devices.find(({ deviceId }) => deviceId) : void 0
}
function signInTask($) {
  let { rewards } = request($, $.api.signIn, '签到')
  if (
    rewards.find(
      ({ type, status }) =>
        type === 'dailyTask' &&
        (status === 'verification' || status === 'finished'),
    )
  )
    return
  let { deviceId, backupViews } = getDevice($) || {}
  if (!deviceId) {
    $.logger.error('未获取到设备 id，跳过每日任务执行')
    return
  }
  $.DATA.deviceId = deviceId
  let backupView = backupViews.find(({ view }) => view === 'album')
  if (!backupView) {
    $.logger.error('未获取到文件夹 id，跳过每日任务执行')
    return
  }
  request($, $.api.updateDeviceExtras, '上报备份')
  let needDeleteFiles = /* @__PURE__ */ new Map()
  for (let i = 0; i < 10; i++) {
    let { file_id } = uploadFile($, deviceId, backupView.driveId)
    file_id && needDeleteFiles.set(file_id, deviceId), $.sleep(2e3)
  }
  $.DATA.afterTask.push(() =>
    deleteFiles($, needDeleteFiles, backupView.driveId),
  )
}
function printSignInInfo($) {
  let { rewards } = request($, $.api.signIn, '签到')
  if (!rewards) return
  let statusMap = {
    unfinished: '未完成',
    finished: '未领取奖励',
    verification: '已领取奖励',
    notStart: '未开始',
  }
  rewards.forEach(({ remind, name, status }) => {
    $.logger.info(`${remind}/${name}/${statusMap[status]}`)
  })
}
function run($) {
  let taskList = [deviceRoomTask, signInTask, signIn, printSignInInfo]
  for (let task of taskList) task($), $.sleep(1e3)
  for (let task of $.DATA.afterTask) task(), $.sleep(1e3)
}
// ../../core/push/index.ts
function _send({ logger, http }, name = '自定义消息', options) {
  try {
    let requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 1e4,
      ...options,
    }
    Reflect.has(options, 'data') &&
      Reflect.has(options.data, 'agent') &&
      ((requestOptions.agent = options.data.agent), delete options.data.agent)
    let data = http.fetch(requestOptions),
      { errcode, code, err } = data
    if (errcode || err || ![0, 200, void 0].some((c) => code === c))
      return logger.error(
        `${name}\u53D1\u9001\u5931\u8D25`,
        JSON.stringify(data),
      )
    logger.info(`${name}\u5DF2\u53D1\u9001\uFF01`)
  } catch (error) {
    logger.info(`${name}\u53D1\u9001\u5931\u8D25: ${error.message}`)
  }
}
function pushplus(apiOption, { token, ...option }, title, text) {
  return _send(apiOption, 'pushplus', {
    url: 'http://www.pushplus.plus/send',
    method: 'POST',
    data: {
      token: token,
      title: title,
      content: text,
      ...option,
    },
  })
}
function serverChan(apiOption, { token, ...option }, title, text) {
  return _send(apiOption, 'Server酱', {
    url: `https://sctapi.ftqq.com/${token}.send`,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    data: {
      text: title,
      desp: text,
      ...option,
    },
  })
}
function workWeixin(
  apiOption,
  { msgtype = 'text', touser = '@all', agentid, corpid, corpsecret, ...option },
  title,
  text,
) {
  try {
    let { access_token } = apiOption.http.fetch({
      url: 'https://qyapi.weixin.qq.com/cgi-bin/gettoken',
      method: 'POST',
      data: {
        corpid: corpid,
        corpsecret: corpsecret,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return _send(apiOption, '企业微信推送', {
      url: `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${access_token}`,
      data: {
        touser: touser,
        msgtype: msgtype,
        agentid: agentid,
        [msgtype]: {
          content: `${title}

${text}`,
        },
        ...option,
      },
    })
  } catch (error) {
    apiOption.logger.error('企业微信推送失败'), apiOption.logger.error(error)
  }
}
function workWeixinBot(
  apiOption,
  { url, msgtype = 'text', ...option },
  title,
  text,
) {
  return _send(apiOption, '企业微信Bot推送', {
    url: url,
    data: {
      msgtype: msgtype,
      [msgtype]: {
        centent: `${title}

${text}`,
      },
      ...option,
    },
  })
}
// ../utils/index.ts
function createRequest({ cookieJar, getHeaders }) {
  return {
    get: (url, options) => {
      var _resp_
      let resp = HTTP.get(url, {
        headers: {
          ...getHeaders(url),
          ...(options && options.headers),
        },
      })
      return (
        cookieJar && cookieJar.setCookie(resp.headers['set-cookie']),
        options
          ? options.native
            ? resp
            : (_resp_ = resp[options.responseType || 'json']) === null ||
                _resp_ === void 0
              ? void 0
              : _resp_.call(resp)
          : resp.json()
      )
    },
    post: (url, data, options) => {
      var _resp_
      let resp = HTTP.post(url, JSON.stringify(data), {
        headers: {
          ...getHeaders(url),
          ...(options && options.headers),
        },
      })
      return (
        cookieJar && cookieJar.setCookie(resp.headers['set-cookie']),
        options
          ? options.native
            ? resp
            : (_resp_ = resp[options.responseType || 'json']) === null ||
                _resp_ === void 0
              ? void 0
              : _resp_.call(resp)
          : resp.json()
      )
    },
  }
}
function getPushConfig() {
  let usedRange2 = Application.Sheets.Item('推送').UsedRange,
    cells = usedRange2.Columns.Cells,
    columnEnd = Math.min(50, usedRange2.ColumnEnd),
    rowEnd = Math.min(50, usedRange2.RowEnd),
    pushConfig = {}
  for (let option = usedRange2.Column; option <= columnEnd; option++) {
    let t = {},
      item = cells.Item(option)
    if (item.Text) {
      pushConfig[item.Text] = t
      for (let kv = 1; kv <= rowEnd; kv++) {
        let key = item.Offset(kv).Text
        key.trim() && (t[key] = valueHandle(item.Offset(kv, 1).Text.trim()))
      }
    }
  }
  let base = pushConfig.base
  if (!base) return pushConfig
  return (
    delete pushConfig.base,
    {
      ...pushConfig,
      ...base,
    }
  )
  function valueHandle(value) {
    return value === 'TRUE' || value === '是'
      ? !0
      : value === 'FALSE' || value === '否'
        ? !1
        : value
  }
}
function email({ logger }, email2, title, text) {
  try {
    if (!email2 || !email2.pass || !email2.from || !email2.host) return
    let port = email2.port || 465,
      toUser = email2.to || email2.from
    SMTP.login({
      host: email2.host,
      // 域名
      port: port,
      // 端口
      secure: port === 465,
      // TLS
      username: email2.from,
      // 账户名
      password: email2.pass,
    }).send({
      from: `${title} <${email2.from}>`,
      to: toUser,
      subject: title,
      text: text.replace(
        /\n/g,
        `\r
`,
      ),
    }),
      logger.info('邮件消息已发送')
  } catch (error) {
    logger.error('邮件消息发送失败', error.message)
  }
}
function sendNotify(op, data, title, text) {
  let cbs = {
    pushplus: pushplus,
    serverChan: serverChan,
    workWeixin: workWeixin,
    email: email,
    workWeixinBot: workWeixinBot,
  }
  for (let [name, d] of Object.entries(data)) {
    let cb = cbs[name]
    cb && cb(op, d, title, text)
  }
}
function sendWpsNotify(pushData2, pushConfig) {
  if (
    pushData2.length &&
    pushConfig &&
    !(pushConfig.onlyError && !pushData2.some((el) => el.type === 'error'))
  ) {
    let msg = pushData2
      .map((m) => `[${m.type} ${m.date.toLocaleTimeString()}]${m.msg}`)
      .join(`
`)
    msg &&
      sendNotify(
        {
          logger: createLogger(),
          http: {
            fetch: (op) => (
              op.data &&
                typeof op.data != 'string' &&
                (op.body = JSON.stringify(op.data)),
              HTTP.fetch(op.url, op).json()
            ),
          },
        },
        pushConfig,
        pushConfig.title || 'asign 运行推送',
        msg,
      )
  }
}
// index.ts
function getXSignature() {
  return '1176d75ed29c9453de0c9848e47be166e56d5cd57dd6743f71ced1f048e73d847c2847c71f8b5235105456d34054a9b30c8e364e5fee4e4cfa644cc07a45a92a01'
}
function main(index, ASIGN_ALIPAN_TOKEN, option) {
  if (!ASIGN_ALIPAN_TOKEN) return
  let logger = createLogger({
      pushData: option && option.pushData,
    }),
    DATA = {
      deviceId: ActiveSheet.Columns('C').Rows(index).Value,
      afterTask: [],
      refreshToken: '',
    },
    accessToken
  function getHeaders() {
    return {
      'content-type': 'application/json',
      referer: 'https://alipan.com/',
      origin: 'https://alipan.com/',
      'x-canary': 'client=Android,app=adrive,version=v5.3.0',
      'user-agent':
        'AliApp(AYSD/5.3.0) com.alicloud.databox/34760760 Channel/36176727979800@rimet_android_5.3.0 language/zh-CN /Android Mobile/Mi 6X',
      'x-device-id': DATA.deviceId,
      authorization: accessToken ? `Bearer ${accessToken}` : '',
      'x-signature': getXSignature(),
    }
  }
  let $ = {
      api: createApi(
        createRequest({
          getHeaders: getHeaders,
        }),
      ),
      logger: logger,
      DATA: DATA,
      sleep: Time.sleep,
    },
    rtData = refreshToken($, ASIGN_ALIPAN_TOKEN.trim())
  rtData &&
    ((DATA.refreshToken = rtData.refresh_token),
    (accessToken = rtData.access_token),
    (DATA.deviceId = rtData.device_id),
    $.logger.info('--------------'),
    $.logger.info(`\u4F60\u597D${rtData.nick_name || rtData.user_name}`),
    (ActiveSheet.Columns('A').Rows(index).Value = rtData.refresh_token),
    (ActiveSheet.Columns('B').Rows(index).Value =
      rtData.nick_name || rtData.user_name),
    run($),
    (ActiveSheet.Columns('C').Rows(index).Value = DATA.deviceId))
}
var columnA = ActiveSheet.Columns('A'),
  usedRange = ActiveSheet.UsedRange,
  len = usedRange.Row + usedRange.Rows.Count - 1,
  pushData = []
for (let i = 1; i <= len; i++) {
  let cell = columnA.Rows(i)
  cell.Text &&
    (console.log(`\u6267\u884C\u7B2C ${i} \u884C`),
    main(i, cell.Text, {
      pushData: pushData,
    }))
}
sendWpsNotify(pushData, getPushConfig())
