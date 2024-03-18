// ../../packages/utils-pure/index.ts
function randomHex(length) {
  return Array.from({
    length: length,
  })
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('')
}
function getXmlElement(xml, tag) {
  let m = xml.match(`<${tag}>(.*)</${tag}>`)
  return m ? m[1] : ''
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
function getHostname(url) {
  return url.split('/')[2].split('?')[0]
}
function asyncForEach(array, task, cb) {
  let len2 = array.length
  for (let index = 0; index < len2; index++) {
    let item = array[index]
    task(item), index < len2 - 1 && cb && cb()
  }
}
function setStoreArray(store, key, values) {
  return Reflect.has(store, key)
    ? Reflect.set(store, key, Reflect.get(store, key).concat(values))
    : Reflect.set(store, key, values)
}
// ../../core/caiyun/garden.ts
function request($, api, name, ...args) {
  try {
    let { success, msg, result } = api(...args)
    if (!success) $.logger.error(`${name}\u5931\u8D25`, msg)
    else return result
  } catch (error) {
    $.logger.error(`${name}\u5F02\u5E38`, error.message)
  }
  return {}
}
function loginGarden($, token, phone) {
  try {
    $.gardenApi.login(token, phone)
  } catch (error) {
    $.logger.error('登录果园失败', error.message)
  }
}
function getTodaySign($) {
  let { todayCheckin } = request($, $.gardenApi.checkinInfo, '获取果园签到信息')
  return todayCheckin
}
function initTree($) {
  let { collectWater, treeLevel, nickName } = request(
    $,
    $.gardenApi.initTree,
    '初始化果园',
  )
  $.logger.info(
    `${nickName}\u62E5\u6709${treeLevel}\u7EA7\u679C\u6811\uFF0C\u5F53\u524D\u6C34\u6EF4${collectWater}`,
  )
}
function signInGarden($) {
  let todaySign = getTodaySign($)
  if (todaySign !== void 0) {
    if (todaySign) return $.logger.info('今日果园已签到')
    try {
      let { code, msg } = request($, $.gardenApi.checkin, '果园签到')
      code !== 1 && $.logger.error('果园签到失败', code, msg)
    } catch (error) {
      $.logger.error('果园签到异常', error.message)
    }
  }
}
function clickCartoon($, cartoonTypes) {
  cartoonTypes.length === 0 &&
    cartoonTypes.push('cloud', 'color', 'widget', 'mail'),
    asyncForEach(
      cartoonTypes,
      (cartoonType) => {
        let { msg, code } = request(
          $,
          $.gardenApi.clickCartoon,
          '领取场景水滴',
          cartoonType,
        )
        ;[1, -1, -2].includes(code)
          ? $.logger.debug(`\u9886\u53D6\u573A\u666F\u6C34\u6EF4${cartoonType}`)
          : $.logger.error(
              `\u9886\u53D6\u573A\u666F\u6C34\u6EF4${cartoonType}\u5931\u8D25`,
              code,
              msg,
            )
      },
      () => $.sleep(5e3),
    )
}
function getTaskList($, headers) {
  let list = request($, $.gardenApi.getTaskList, '获取任务列表', headers)
  return Array.isArray(list) ? list : []
}
function getTaskStateList($, headers) {
  let list = request(
    $,
    $.gardenApi.getTaskStateList,
    '获取任务完成情况表',
    headers,
  )
  return Array.isArray(list) ? list : []
}
function doTask($, tasks, headers) {
  let taskList = []
  return (
    asyncForEach(
      tasks,
      ({ taskId, taskName }) => {
        let { code, summary } = request(
          $,
          $.gardenApi.doTask,
          `\u63A5\u6536${taskName}\u4EFB\u52A1`,
          taskId,
          headers,
        )
        code !== 1
          ? $.logger.error(`\u9886\u53D6${taskName}\u5931\u8D25`, summary)
          : taskList.push({
              taskId: taskId,
              taskName: taskName,
            })
      },
      () => $.sleep(6e3),
    ),
    taskList
  )
}
function doTaskByHeaders($, headers) {
  try {
    let taskList = getTaskList($, headers)
    $.sleep(1e3)
    let stateList = getTaskStateList($, headers)
    if (stateList.length === 0) return _run(taskList, [])
    let _givenList = stateList
        .filter((sl) => sl.taskState === 1)
        .map((el) => taskList.find((tl) => tl.taskId === el.taskId)),
      _taskList = stateList
        .filter((sl) => sl.taskState === 0)
        .map((el) => taskList.find((tl) => tl.taskId === el.taskId))
    return _run(_taskList, _givenList)
    function _run(_taskList2, _givenList2) {
      $.sleep(5e3)
      let givenList = doTask($, _taskList2, headers)
      $.sleep(4e3),
        givenList.push(..._givenList2),
        givenWater($, givenList, headers)
    }
  } catch (error) {
    $.logger.error('任务异常', error.message)
  }
}
function givenWater($, tasks, headers) {
  asyncForEach(
    tasks,
    ({ taskName, taskId }) => {
      let { water, msg } = request(
        $,
        $.gardenApi.givenWater,
        `\u9886\u53D6${taskName}\u6C34\u6EF4`,
        taskId,
        headers,
      )
      water === 0
        ? $.logger.error(`\u9886\u53D6${taskName}\u5956\u52B1\u5931\u8D25`, msg)
        : $.logger.debug(`\u9886\u53D6${taskName}\u5956\u52B1`)
    },
    () => $.sleep(6e3),
  )
}
function gardenTask($) {
  try {
    $.logger.info('------【果园】------')
    let token = getSsoTokenApi($, $.config.phone)
    if (!token) return $.logger.error('跳过果园任务')
    loginGarden($, token, $.config.phone),
      initTree($),
      signInGarden($),
      $.sleep(2e3),
      $.logger.info('领取场景水滴'),
      clickCartoon($, []),
      $.logger.info('完成邮箱任务'),
      doTaskByHeaders($, {
        'user-agent': $.DATA.baseUA + $.DATA.mailUaEnd,
        'x-requested-with': $.DATA.mailRequested,
      }),
      $.sleep(2e3),
      $.logger.info('完成云盘任务'),
      doTaskByHeaders($, {
        'user-agent': $.DATA.baseUA,
        'x-requested-with': $.DATA.mcloudRequested,
      })
  } catch (error) {
    $.logger.error('果园任务异常', error.message)
  }
}
// ../../core/caiyun/gardenApi.ts
function createGardenApi(http) {
  let gardenUrl = 'https://happy.mail.10086.cn/jsp/cn/garden'
  return {
    login: function (token, account) {
      return http.get(
        `${gardenUrl}/login/caiyunsso.do?token=${token}&account=${account}&targetSourceId=001208&sourceid=1014&enableShare=1`,
        {
          followRedirect: !1,
          native: !0,
        },
      )
    },
    checkinInfo: function () {
      return http.get(`${gardenUrl}/task/checkinInfo.do`)
    },
    initTree: function () {
      return http.get(`${gardenUrl}/user/initTree.do`)
    },
    /**
     * 需要对应 ua
     */ getTaskList: function (headers = {}) {
      return http.get(`${gardenUrl}/task/taskList.do?clientType=PE`, {
        headers: headers,
      })
    },
    getTaskStateList: function (headers = {}) {
      return http.get(`${gardenUrl}/task/taskState.do`, {
        headers: headers,
      })
    },
    checkin: function () {
      return http.get(`${gardenUrl}/task/checkin.do`)
    },
    clickCartoon: function (cartoonType) {
      return http.get(
        `${gardenUrl}/user/clickCartoon.do?cartoonType=${cartoonType}`,
      )
    },
    doTask: function (taskId, headers = {}) {
      return http.get(`${gardenUrl}/task/doTask.do?taskId=${taskId}`, {
        headers: headers,
      })
    },
    givenWater: function (taskId, headers = {}) {
      return http.get(`${gardenUrl}/task/givenWater.do?taskId=${taskId}`, {
        headers: headers,
      })
    },
  }
}
// ../../core/caiyun/api.ts
function createApi(http) {
  let yun139Url = 'https://yun.139.com',
    caiyunUrl = 'https://caiyun.feixin.10086.cn',
    mnoteUrl = 'https://mnote.caiyun.feixin.10086.cn'
  return {
    querySpecToken: function (account, toSourceId = '001005') {
      return http.post(
        `${yun139Url}/orchestration/auth-rebuild/token/v1.0/querySpecToken`,
        {
          toSourceId: toSourceId,
          account: String(account),
          commonAccountInfo: {
            account: String(account),
            accountType: 1,
          },
        },
        {
          headers: {
            referer: 'https://yun.139.com/w/',
            accept: 'application/json, text/plain, */*',
            'content-type': 'application/json',
            'accept-language': 'zh-CN,zh;q=0.9',
          },
        },
      )
    },
    authTokenRefresh: function (token, account) {
      return http.post(
        'https://aas.caiyun.feixin.10086.cn/tellin/authTokenRefresh.do',
        `<?xml version="1.0" encoding="utf-8"?><root><token>${token}</token><account>${account}</account><clienttype>656</clienttype></root>`,
        {
          headers: {
            accept: '*/*',
            'content-type': 'application/json',
          },
          responseType: 'text',
        },
      )
    },
    getNoteAuthToken: function (token, account) {
      let headers = http.post(
        `${mnoteUrl}/noteServer/api/authTokenRefresh.do`,
        {
          authToken: token,
          userPhone: String(account),
        },
        {
          headers: {
            APP_CP: 'pc',
            APP_NUMBER: String(account),
            CP_VERSION: '7.7.1.20240115',
          },
          native: !0,
        },
      ).headers
      if (headers.app_auth)
        return {
          app_auth: headers.app_auth,
          app_number: headers.app_number,
          note_token: headers.note_token,
        }
    },
    syncNoteBook: function (headers) {
      return http.post(
        `${mnoteUrl}/noteServer/api/syncNotebook.do `,
        {
          addNotebooks: [],
          delNotebooks: [],
          updateNotebooks: [],
        },
        {
          headers: {
            APP_CP: 'pc',
            CP_VERSION: '7.7.1.20240115',
            ...headers,
          },
        },
      )
    },
    createNote: function (noteId, title, account, headers, tags = []) {
      return http.post(
        `${mnoteUrl}/noteServer/api/createNote.do`,
        {
          archived: 0,
          attachmentdir: '',
          attachmentdirid: '',
          attachments: [],
          contentid: '',
          contents: [
            {
              data: '<span></span>',
              noteId: noteId,
              sortOrder: 0,
              type: 'TEXT',
            },
          ],
          cp: '',
          createtime: String(Date.now()),
          description: '',
          expands: {
            noteType: 0,
          },
          landMark: [],
          latlng: '',
          location: '',
          noteid: noteId,
          remindtime: '',
          remindtype: 0,
          revision: '1',
          system: '',
          tags: tags,
          title: title,
          topmost: '0',
          updatetime: String(Date.now()),
          userphone: String(account),
          version: '',
          visitTime: String(Date.now()),
        },
        {
          headers: {
            APP_CP: 'pc',
            APP_NUMBER: String(account),
            CP_VERSION: '7.7.1.20240115',
            ...headers,
          },
        },
      )
    },
    deleteNote: function (noteid, headers) {
      return http.post(
        `${mnoteUrl}/noteServer/api/moveToRecycleBin.do`,
        {
          noteids: [
            {
              noteid: noteid,
            },
          ],
        },
        {
          headers: {
            APP_CP: 'pc',
            CP_VERSION: '7.7.1.20240115',
            ...headers,
          },
        },
      )
    },
    tyrzLogin: function (ssoToken) {
      return http.get(
        `${caiyunUrl}/portal/auth/tyrzLogin.action?ssoToken=${ssoToken}`,
      )
    },
    signInInfo: function () {
      return http.get(`${caiyunUrl}/market/signin/page/info?client=app`)
    },
    getDrawInWx: function () {
      return http.get(`${caiyunUrl}/market/playoffic/drawInfo`)
    },
    drawInWx: function () {
      return http.get(`${caiyunUrl}/market/playoffic/draw`)
    },
    signInfoInWx: function () {
      return http.get(`${caiyunUrl}/market/playoffic/followSignInfo?isWx=true`)
    },
    getDisk: function (account, catalogID) {
      return http.post(
        `${yun139Url}/orchestration/personalCloud/catalog/v1.0/getDisk`,
        {
          commonAccountInfo: {
            account: String(account),
          },
          catalogID: catalogID,
          catalogType: -1,
          sortDirection: 1,
          catalogSortType: 0,
          contentSortType: 0,
          filterType: 1,
          startNumber: 1,
          endNumber: 40,
        },
      )
    },
    queryBatchList: function () {
      return http.post(
        'https://grdt.middle.yun.139.com/openapi/pDynamicInfo/queryBatchList',
        {
          encodeData: 'WBvKN8KKSLovAM=',
          encodeType: 2,
          pageSize: 3,
          dynamicType: 2,
        },
      )
    },
    pcUploadFileRequest: function (
      account,
      parentCatalogID,
      contentSize,
      contentName,
      digest,
    ) {
      return http.post(
        `${yun139Url}/orchestration/personalCloud/uploadAndDownload/v1.0/pcUploadFileRequest`,
        {
          commonAccountInfo: {
            account: String(account),
          },
          fileCount: 1,
          totalSize: contentSize,
          uploadContentList: [
            {
              contentName: contentName,
              contentSize: contentSize,
              comlexFlag: 0,
              digest: digest,
            },
          ],
          newCatalogName: '',
          parentCatalogID: parentCatalogID,
          operation: 0,
          path: '',
          manualRename: 2,
          autoCreatePath: [],
          tagID: '',
          tagType: '',
          seqNo: '',
        },
      )
    },
    createBatchOprTask: function (account, contentIds) {
      return http.post(
        `${yun139Url}/orchestration/personalCloud/batchOprTask/v1.0/createBatchOprTask`,
        {
          createBatchOprTaskReq: {
            taskType: 2,
            actionType: 201,
            taskInfo: {
              contentInfoList: contentIds,
              catalogInfoList: [],
              newCatalogID: '',
            },
            commonAccountInfo: {
              account: account,
              accountType: 1,
            },
          },
        },
      )
    },
    queryBatchOprTaskDetail: function (account, taskID) {
      return http.post(
        `${yun139Url}/orchestration/personalCloud/batchOprTask/v1.0/queryBatchOprTaskDetail`,
        {
          queryBatchOprTaskDetailReq: {
            taskID: taskID,
            commonAccountInfo: {
              account: account,
              accountType: 1,
            },
          },
        },
      )
    },
    clickTask: function (id) {
      return http.get(`${caiyunUrl}/market/signin/task/click?key=task&id=${id}`)
    },
    getTaskList: function (marketname = 'sign_in_3') {
      return http.get(
        `${caiyunUrl}/market/signin/task/taskList?marketname=${marketname}&clientVersion=`,
      )
    },
    receive: function () {
      return http.get(`${caiyunUrl}/market/signin/page/receive`)
    },
    shake: function () {
      return http.post(`${caiyunUrl}/market/shake-server/shake/shakeIt?flag=1`)
    },
    beinviteHecheng1T: function () {
      return http.get(`${caiyunUrl}/market/signin/hecheng1T/beinvite`)
    },
    finishHecheng1T: function () {
      return http.get(`${caiyunUrl}/market/signin/hecheng1T/finish?flag=true`)
    },
    getOutLink: function (account, coIDLst, dedicatedName) {
      return http.post(
        `${yun139Url}/orchestration/personalCloud-rebuild/outlink/v1.0/getOutLink`,
        {
          getOutLinkReq: {
            subLinkType: 0,
            encrypt: 1,
            coIDLst: coIDLst,
            caIDLst: [],
            pubType: 1,
            dedicatedName: dedicatedName,
            period: 1,
            periodUnit: 1,
            viewerLst: [],
            extInfo: {
              isWatermark: 0,
              shareChannel: '3001',
            },
            commonAccountInfo: {
              account: account,
              accountType: 1,
            },
          },
        },
      )
    },
    getBlindboxTask: function () {
      return http.post(
        `${caiyunUrl}/market/task-service/task/api/blindBox/queryTaskInfo`,
        {
          marketName: 'National_BlindBox',
          clientType: 1,
        },
        {
          headers: {
            accept: 'application/json',
          },
        },
      )
    },
    registerBlindboxTask: function (taskId) {
      return http.post(
        `${caiyunUrl}/market/task-service/task/api/blindBox/register`,
        {
          marketName: 'National_BlindBox',
          taskId: taskId,
        },
        {
          headers: {
            accept: 'application/json',
          },
        },
      )
    },
    blindboxUser: function () {
      return http.post(
        `${caiyunUrl}/ycloud/blindbox/user/info`,
        {},
        {
          headers: {
            accept: 'application/json',
          },
        },
      )
    },
    openBlindbox: function () {
      return http.post(
        `${caiyunUrl}/ycloud/blindbox/draw/openBox?from=main`,
        {},
        {
          headers: {
            accept: 'application/json',
          },
        },
      )
    },
  }
}
// ../../core/caiyun/index.ts
function request2($, api, name, ...args) {
  try {
    let { code, message, msg, result } = api(...args)
    if (code !== 0) $.logger.error(`${name}\u5931\u8D25`, code, message || msg)
    else return result
  } catch (error) {
    $.logger.error(`${name}\u5F02\u5E38`, error.message)
  }
  return {}
}
function getSsoTokenApi($, phone) {
  try {
    let specToken = $.api.querySpecToken(phone)
    if (!specToken.success) {
      $.logger.error('获取 ssoToken 失败', specToken.message)
      return
    }
    return specToken.data.token
  } catch (error) {
    $.logger.error('获取 ssoToken 异常', error.message)
  }
}
function signInApi($) {
  return request2($, $.api.signInInfo, '网盘签到')
}
function signInWxApi($) {
  return request2($, $.api.signInfoInWx, '微信签到')
}
function refreshToken($) {
  try {
    let { token, phone } = $.config,
      tokenXml = $.api.authTokenRefresh(token, phone)
    return tokenXml
      ? getXmlElement(tokenXml, 'token')
      : $.logger.error('authTokenRefresh 失败')
  } catch (error) {
    $.logger.error('刷新 token 失败', error.message)
  }
}
function signIn($) {
  let { todaySignIn, total, toReceive } = signInApi($) || {}
  if (
    ($.logger.info(
      `\u5F53\u524D\u79EF\u5206${total}${
        toReceive ? `\uFF0C\u5F85\u9886\u53D6${toReceive}` : ''
      }`,
    ),
    todaySignIn === !0)
  ) {
    $.logger.info('网盘今日已签到')
    return
  }
  $.sleep(1e3)
  let info = signInApi($)
  if (info) {
    if (info.todaySignIn === !1) {
      $.logger.info('网盘签到失败')
      return
    }
    $.logger.info('网盘签到成功')
  }
}
function signInWx($) {
  let info = signInWxApi($)
  if (info) {
    if (
      info.todaySignIn === !1 &&
      ($.logger.error('微信签到失败'), info.isFollow === !1)
    ) {
      $.logger.info('当前账号没有绑定微信公众号【中国移动云盘】')
      return
    }
    $.logger.info('微信签到成功')
  }
}
function wxDraw($) {
  try {
    let drawInfo = $.api.getDrawInWx()
    if (drawInfo.code !== 0) {
      $.logger.error(
        `\u83B7\u53D6\u5FAE\u4FE1\u62BD\u5956\u4FE1\u606F\u5931\u8D25\uFF0C\u8DF3\u8FC7\u8FD0\u884C\uFF0C${JSON.stringify(
          drawInfo,
        )}`,
      )
      return
    }
    if (drawInfo.result.surplusNumber < 50) {
      $.logger.info(
        `\u5269\u4F59\u5FAE\u4FE1\u62BD\u5956\u6B21\u6570${drawInfo.result.surplusNumber}\uFF0C\u8DF3\u8FC7\u6267\u884C`,
      )
      return
    }
    let draw = $.api.drawInWx()
    if (draw.code !== 0) {
      $.logger.error(
        `\u5FAE\u4FE1\u62BD\u5956\u5931\u8D25\uFF0C${JSON.stringify(draw)}`,
      )
      return
    }
    $.logger.info(
      `\u5FAE\u4FE1\u62BD\u5956\u6210\u529F\uFF0C\u83B7\u5F97\u3010${draw.result.prizeName}\u3011`,
    )
  } catch (error) {
    $.logger.error('微信抽奖异常', error.message)
  }
}
function receive($) {
  return request2($, $.api.receive, '领取云朵')
}
function clickTask($, task) {
  try {
    let { code, msg } = $.api.clickTask(task)
    if (code === 0) return !0
    $.logger.error(`\u70B9\u51FB\u4EFB\u52A1${task}\u5931\u8D25`, msg)
  } catch (error) {
    $.logger.error(`\u70B9\u51FB\u4EFB\u52A1${task}\u5F02\u5E38`, error.message)
  }
  return !1
}
function pcUploadFileRequest($, path) {
  try {
    let { success, message, data } = $.api.pcUploadFileRequest(
      $.config.phone,
      path,
      0,
      randomHex(4) + '.png',
      'd41d8cd98f00b204e9800998ecf8427e',
    )
    if (success && data && data.uploadResult)
      return data.uploadResult.newContentIDList.map(
        ({ contentID }) => contentID,
      )
    $.logger.error('上传文件失败', message)
  } catch (error) {
    $.logger.error('上传文件异常', error.message)
  }
}
function deleteFiles($, ids) {
  try {
    let {
      data: {
        createBatchOprTaskRes: { taskID },
      },
    } = $.api.createBatchOprTask($.config.phone, ids)
    $.api.queryBatchOprTaskDetail($.config.phone, taskID)
  } catch (error) {
    $.logger.error('删除文件失败', error.message)
  }
}
function getParentCatalogID() {
  return '00019700101000000001'
}
function getNoteAuthToken($) {
  try {
    return $.api.getNoteAuthToken($.config.auth, $.config.phone)
  } catch (error) {
    $.logger.error('获取云笔记 Auth Token 异常', error.message)
  }
}
function uploadFileDaily($) {
  if (!clickTask($, 106)) {
    $.logger.info('接收任务失败，跳过上传任务')
    return
  }
  let contentIDs = pcUploadFileRequest($, getParentCatalogID())
  contentIDs && setStoreArray($.store, 'files', contentIDs)
}
function createNoteDaily($) {
  if (!$.config.auth) {
    $.logger.info('未配置 authToken，跳过云笔记任务执行')
    return
  }
  let headers = getNoteAuthToken($)
  if (!headers) {
    $.logger.info('获取鉴权信息失败，跳过云笔记任务执行')
    return
  }
  try {
    let id = randomHex(32)
    $.api.createNote(id, `${randomHex(3)}`, $.config.phone, headers),
      $.sleep(2e3),
      $.api.deleteNote(id, headers)
  } catch (error) {
    $.logger.error('创建云笔记异常', error.message)
  }
}
function _clickTask($, id, currstep) {
  return currstep === 0 ? clickTask($, id) : !0
}
function dailyTask($) {
  var _taskFuncList_taskItem_id
  $.logger.info('------【每日】------')
  let { day } = request2($, $.api.getTaskList, '获取任务列表')
  if (!day || !day.length) return $.logger.info('无任务列表，结束')
  let taskFuncList = {
      106: uploadFileDaily,
      107: createNoteDaily,
    },
    doingList = []
  for (let taskItem of day)
    taskItem.state === 'FINISH' ||
      taskItem.enable !== 1 ||
      (_clickTask($, taskItem.id, taskItem.currstep) &&
        ((_taskFuncList_taskItem_id = taskFuncList[taskItem.id]) === null ||
        _taskFuncList_taskItem_id === void 0
          ? void 0
          : _taskFuncList_taskItem_id.call(taskFuncList, $),
        doingList.push(taskItem.id)))
  if (doingList.length) {
    let { day: day2 } = request2($, $.api.getTaskList, '获取任务列表')
    if (!day2) return
    for (let taskItem of day2)
      doingList.includes(taskItem.id) &&
        taskItem.state === 'FINISH' &&
        $.logger.info(`\u5B8C\u6210\uFF1A${taskItem.name}`)
  }
}
function shareTime($) {
  try {
    let files = $.store.files
    if (!files || !files[0]) {
      $.logger.info('未获取到文件列表，跳过分享任务')
      return
    }
    let { code, message } = $.api.getOutLink($.config.phone, [files[0]], '')
    if (code === '0') return !0
    $.logger.error('分享链接失败', code, message)
  } catch (error) {
    $.logger.error('分享链接异常', error.message)
  }
}
function hotTask($) {
  var _taskFuncList_taskItem_id
  $.logger.info('------【热门任务】------')
  let { time } = request2($, $.api.getTaskList, '获取任务列表')
  if (!time) return
  let taskIds = [434],
    taskFuncList = {
      434: shareTime,
    }
  for (let taskItem of time)
    taskItem.state === 'FINISH' ||
      taskItem.enable !== 1 ||
      (taskIds.includes(taskItem.id) &&
        _clickTask($, taskItem.id, taskItem.currstep) &&
        ((_taskFuncList_taskItem_id = taskFuncList[taskItem.id]) === null ||
        _taskFuncList_taskItem_id === void 0
          ? void 0
          : _taskFuncList_taskItem_id.call(taskFuncList, $)) &&
        $.logger.info(`\u5B8C\u6210\uFF1A${taskItem.name}`))
}
function monthTaskOnMail($) {
  let { month } = request2(
    $,
    $.api.getTaskList,
    '获取任务列表',
    'newsign_139mail',
  )
  if (!month) return
  let doingList = []
  for (let taskItem of month)
    [1008, 1009, 1010, 1013, 1014, 1016, 1017].includes(taskItem.id) &&
      taskItem.state !== 'FINISH' &&
      _clickTask($, taskItem.id, taskItem.currstep) &&
      doingList.push(taskItem.id)
  if (doingList.length) {
    let { month: month2 } = request2(
      $,
      $.api.getTaskList,
      '获取任务列表',
      'newsign_139mail',
    )
    if (!month2) return
    for (let taskItem of month2)
      doingList.includes(taskItem.id) &&
        taskItem.state === 'FINISH' &&
        $.logger.info(`\u5B8C\u6210\uFF1A${taskItem.name}`)
  }
}
function shake($) {
  let { shakePrizeconfig, shakeRecommend } = request2($, $.api.shake, '摇一摇')
  if (shakeRecommend)
    return $.logger.debug(shakeRecommend.explain || shakeRecommend.img)
  if (shakePrizeconfig)
    return $.logger.info(shakePrizeconfig.title + shakePrizeconfig.name)
}
function shakeTask($) {
  $.logger.info(' ------【摇一摇】------')
  let { delay, num } = $.config.shake
  for (let index = 0; index < num; index++)
    shake($), index < num - 1 && $.sleep(delay * 1e3)
}
function openBlindbox($) {
  try {
    let { code, msg, result } = $.api.openBlindbox()
    switch (code) {
      case 0:
        return $.logger.info('获得', result.prizeName)
      case 200105:
      case 200106:
        return $.logger.info(msg)
      default:
        return $.logger.warn('开盲盒失败', code, msg)
    }
  } catch (error) {
    $.logger.error('openBlindbox 异常', error.message)
  }
}
function registerBlindboxTask($, taskId) {
  request2($, $.api.registerBlindboxTask, '注册盲盒', taskId)
}
function getBlindboxCount($) {
  try {
    let taskList = request2($, $.api.getBlindboxTask, '获取盲盒任务')
    if (!taskList) return
    let taskIds = taskList.reduce(
      (taskIds2, task) => (
        task.status === 0 && taskIds2.push(task.taskId), taskIds2
      ),
      [],
    )
    for (let taskId of taskIds) registerBlindboxTask($, taskId)
  } catch {}
}
function blindboxTask($) {
  $.logger.info(' ------【开盲盒】------')
  try {
    getBlindboxCount($)
    let { result, code, msg } = $.api.blindboxUser()
    if (!result || code !== 0)
      return $.logger.error('获取盲盒信息失败', code, msg), openBlindbox($)
    if (
      (result.isChinaMobile === 1 && $.logger.debug('尊敬的移不动用户'),
      (result === null || result === void 0 ? void 0 : result.chanceNum) === 0)
    ) {
      $.logger.info('今日无机会')
      return
    }
    for (let index = 0; index < result.chanceNum; index++) openBlindbox($)
  } catch (error) {
    $.logger.error('开盲盒任务异常', error.message)
  }
}
function afterTask($) {
  try {
    $.store && $.store.files && deleteFiles($, $.store.files)
  } catch (error) {
    $.logger.error('afterTask 异常', error.message)
  }
}
function run($) {
  let { config } = $,
    taskList = [
      signIn,
      signInWx,
      wxDraw,
      monthTaskOnMail,
      dailyTask,
      hotTask,
      blindboxTask,
      receive,
    ]
  config &&
    (config.garden && config.garden.enable && taskList.push(gardenTask),
    config.shake && config.shake.enable && taskList.push(shakeTask))
  for (let task of taskList) task($), $.sleep(1e3)
  afterTask($)
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
function getCookieJSON(cookie) {
  if (!cookie) return {}
  let matchArray = cookie.match(/([^;=]+)(?:=([^;]*))?/g)
  if (!matchArray) return {}
  let returns = {}
  for (let match of matchArray) {
    let [key, value] = match.trim().split('=')
    returns[key] = value
  }
  return returns
}
function getCookieString(obj) {
  let string = ''
  for (let key in obj) string += `${key}=${obj[key]}; `
  return string.substring(0, string.length - 2 || 0)
}
function getSetCookieValue(setCookieArray) {
  let cookieStr = ''
  for (let item of setCookieArray)
    item && (cookieStr += item.split('; ')[0] + '; ')
  return ''
}
function getCookie(cookie = '', setCookie) {
  return (
    Array.isArray(setCookie) || (setCookie = [setCookie]),
    !setCookie || setCookie.length === 0
      ? cookie
      : getCookieString({
          ...getCookieJSON(cookie),
          ...getCookieJSON(getSetCookieValue(setCookie)),
        })
  )
}
function createCookieJar(cookie = '') {
  let _cookie
  return (
    (_cookie = cookie),
    {
      getCookieString: function () {
        return _cookie
      },
      setCookie: function (rawCookie) {
        return (_cookie = getCookie(_cookie, rawCookie)), _cookie
      },
      toJSON: function () {
        return getCookieJSON(_cookie)
      },
    }
  )
}
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
function main(index, config, option) {
  let basicToken = config.token.startsWith('Basic')
      ? config.token
      : `Basic ${config.token}`,
    cookieJar = createCookieJar(),
    logger = createLogger({
      pushData: option && option.pushData,
    }),
    DATA = {
      baseUA:
        'Mozilla/5.0 (Linux; Android 13; 22041216C Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/121.0.6167.178 Mobile Safari/537.36',
      mailUaEnd: '(139PE_WebView_Android_10.2.2_mcloud139)',
      mailRequested: 'cn.cj.pe',
      mcloudRequested: 'com.chinamobile.mcloud',
    }
  logger.info('--------------'),
    logger.info(`\u4F60\u597D\uFF1A${config.phone}`)
  let jwtToken,
    headers = {
      'user-agent': DATA.baseUA,
      'x-requested-with': DATA.mcloudRequested,
      charset: 'utf-8',
      'content-type': 'application/json',
      accept: 'application/json',
    }
  function getHeaders(url) {
    return getHostname(url) === 'caiyun.feixin.10086.cn' && jwtToken
      ? {
          ...headers,
          cookie: cookieJar.getCookieString(),
          jwttoken: jwtToken,
        }
      : {
          ...headers,
          authorization: basicToken,
        }
  }
  let http = createRequest({
      cookieJar: cookieJar,
      getHeaders: getHeaders,
    }),
    $ = {
      api: createApi(http),
      logger: logger,
      DATA: DATA,
      sleep: Time.sleep,
      config: config,
      gardenApi: createGardenApi(http),
      store: {},
    }
  if (((jwtToken = refreshToken($, config.phone)), !!jwtToken)) return run($)
}
var columnA = ActiveSheet.Columns('A'),
  usedRange = ActiveSheet.UsedRange,
  len = usedRange.Row + usedRange.Rows.Count - 1,
  BColumn = ActiveSheet.Columns('B'),
  CColumn = ActiveSheet.Columns('C'),
  pushData = []
for (let i = 1; i <= len; i++) {
  let cell = columnA.Rows(i)
  cell.Text &&
    (console.log(`\u6267\u884C\u7B2C ${i} \u884C`),
    main(
      i,
      {
        token: BColumn.Rows(i).Text,
        phone: cell.Text,
        auth: CColumn.Rows(i).Text,
      },
      {
        pushData: pushData,
      },
    ))
}
sendWpsNotify(pushData, getPushConfig())
