import { utils, cookie, config } from '@utils'
import { AuthorType } from '@base/enums'
import { accountApi } from '@api'

function queryString(key) {
    var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i")
    var r = window.location.search.substr(1).match(reg)
    if (!r && window.location.hash.indexOf('?') >= 0) {
        var hash = window.location.hash
        r = hash.substr(hash.indexOf('?') + 1).match(reg)
    }
    return (r === null ? null : decodeURIComponent(r[2]))
}

const handleRef = () => {
    const ref = utils.getUrlParam('ref')
    let url

    // 百度推广来源页面
    if(ref === 'sem') {
        cookie.set(config.COOKIE_BAIDU_SEM, ref, { expires: 365, path: '/', domain: config.COOKIE_MEIHUA_DOMAIN })
    }
    // // 新用户跳转到完善资料页面
    // if(cookie.get(config.COOKIE_MEIHUA_FIRST_LOGIN) !== '') {
    //     url = config.DOMAIN + '/account/#/improve'
    // }
    // 新用户第一次跳转页面
    else if(cookie.get(config.COOKIE_MEIHUA_FIRST_LOGIN) === '' && cookie.get(config.COOKIE_MEIHUA_FIRST_LOGIN_URL) !== '') {
        url = decodeURIComponent(cookie.get(config.COOKIE_MEIHUA_FIRST_LOGIN_URL))
        // cookie.remove(config.COOKIE_MEIHUA_FIRST_LOGIN_URL, { path: '/', domain: cookie.COOKIE_MEIHUA_DOMAIN })
    }
    // Page应用微信授权跳转
    else if (ref === 'page_auth_wechat') {
        accountApi.getWechatAuth().then(result => {
            if(result.success) {
                cookie.set(config.COOKIE_PAGE_AUTH_WECHAT, this.prevPage || config.DOMAIN + '/', { expires: 1, domain: config.COOKIE_MEIHUA_DOMAIN, path: '/' })
                utils.redirectTo(result.data.url + '/')
            }
        })

        return
    } else {
        return
    }

    //FIXME: 修复内容
    // utils.redirectTo(url)
}

const setRefSource = () => {
    var ref = queryString('ref')

    if(ref && !cookie.get('meihua_ref_source')) {
        var refMap = {
            meihua: 'meihua',
            sem: 'meihua-sem',
            baidu: 'meihua-baidu',
            meihua: 'meihua-meihua',
            'mail-footer': 'meihua-mail-footer',
        }
        var refValue = refMap[ref] || ref
        cookie.set('meihua_ref_source', refValue, { expires: 10 * 365, path: '/', domain: '.meihua.com' })
    }
}

export const getCreatorType = (type) => {
    switch(type) {
        case AuthorType.PERSONAL:
            return `个人`
        case AuthorType.BRANDER:
            return `品牌主`
        case AuthorType.SERVER:
            return `服务商`
        case AuthorType.EDITOR:
            return `编辑`
    }

    return `个人`
}

const user = {
    init() {
        handleRef()
        setRefSource()
    },
    isLogin() {
        const token = cookie.get(config.COOKIE_MEIHUA_TOKEN)

        return !!token
    },
    getCookieUser() {
        const ls = window.localStorage
        const userStr = ls.getItem('user')
        return userStr ? JSON.parse(ls.getItem('user')) : null
        // return JSON.parse(decodeURIComponent(cookie.get('user')))
    },
}

export { user }