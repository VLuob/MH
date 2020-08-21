const isOnline = process.env.NODE_SERVER_ENV === 'online'
// const isOnline = true
const mhapi = 'https://rest.meihua.info'
const mhapi_t = 'https://rest_t.meihua.info'
// let meihuaApi
const COOKIE_NAME_PREFIX = 'meihua_'
let COOKIE_CODE_PREFIX = ''
const COOKIE_PREFIX = isOnline ? 'mh_' : 'mh_t_'
const STORAGE_PREFIX = isOnline ? 'mh_' : 'mh_t_'

// console.log('process.env.NODE_ENV', process.env.NODE_ENV, process.env.NODE_SERVER_ENV, isOnline)

// let host = ''

// if(typeof window !== 'undefined') {
//     host = window.location.host || ''
//     if(window.location.host.match(/^(localhost(:[\d]+)?|metest.meihua.info(:[\d]+)?|t.meihua.info|meshare.meihuainfo.com(:[\d]+)?|share_t.meihuainfo.com)$/)) {
//         meihuaApi = 'https://rest_t.meihua.info'
//         COOKIE_CODE_PREFIX = 'test'
//     } else {
//         meihuaApi = 'https://rest.meihua.info'
//         COOKIE_CODE_PREFIX = ''
//     }
//     // meihuaApi = 'https://rest.meihua.info'
// }

export const CURRENT_DOMAIN = typeof window !== 'undefined' ? window.location.origin : 'https://www.meihua.info'

export const API_MEIHUA = isOnline ? mhapi : mhapi_t

// 账户api前缀
export const API_PREFIX_UCENTER = '/user'

// 默认来源 
export const SOURCE_MEIHUA = 'Homepage'

export const RESOURCE_QINIU_DOMAIN = 'https://resource.meihua.info'

export const MEIHUA_SHARE_DOMAIN = 'https://share.meihuainfo.com'

/**
 * cookie names
 * @type {String}
 */
export const COOKIE_MEIHUA_TOKEN = isOnline ? 'token' : 'token_t'
export const COOKIE_MEIHUA_DOMAIN = '.meihua.info'
export const COOKIE_MEIHUA_CODE_DOMAIN = COOKIE_CODE_PREFIX + `.meihua.info`
export const COOKIE_MEIHUA_USER_NAME = COOKIE_NAME_PREFIX + 'username'
export const COOKIE_MEIHUA_USER = COOKIE_NAME_PREFIX + 'user'
export const COOKIE_MEIHUA_AUTO_LOGIN = COOKIE_NAME_PREFIX + 'autoLogin'
export const COOKIE_MEIHUA_COUPON = COOKIE_NAME_PREFIX + 'coupon'
export const COOKIE_MEIHUA_CLIENT_CODE = COOKIE_NAME_PREFIX + (isOnline ? 'code' : 'code_t')
export const COOKIE_MEIHUA_REFERRER_SOURCE = COOKIE_NAME_PREFIX + (isOnline ? 'ref' : 'ref_t')
export const COOKIE_DETAIL_AUTO_PLAY_IDS = COOKIE_PREFIX + 'detail_auto_play_ids'
// 记录用户自动播放
export const COOKIE_DETAIL_AUTO_PLAY = COOKIE_PREFIX + 'auto_play'

// 用户第一次登录
export const COOKIE_MEIHUA_FIRST_LOGIN = COOKIE_NAME_PREFIX + 'firstlogin'
export const COOKIE_MEIHUA_FIRST_LOGIN_URL = COOKIE_NAME_PREFIX + 'firstlogin_url'

// 来源百度推广
export const COOKIE_BAIDU_SEM = 'bd_SEM'

// 推广来源
export const COOKIE_MEIHUA_REF_SOURCE = COOKIE_NAME_PREFIX + 'ref_source'

// 记录自动播放跳转
export const SESSION_DETAIL_AUTO_PLAY = STORAGE_PREFIX + 'is_auto_play'

/**
 * 访客编辑询价状态
 */
export const STORAGE_VISITOR_ENQUIRY_EDIT_STATUS  = STORAGE_PREFIX + 'visitor_enquiry_edit_status'


export const API_COMPLETE_MEIHUA = API_MEIHUA

// 账户API完整
export const API_MEIHUA_UCENTER = API_MEIHUA + API_PREFIX_UCENTER