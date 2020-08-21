import { message } from 'antd'
import { utils } from '@utils/'

//发送邮件Map
const mailMaps = {
    'qq.com': 'http://mail.qq.com',
    'gmail.com': 'http://mail.google.com',
    'sina.com': 'http://mail.sina.com.cn',
    '163.com': 'http://mail.163.com',
    '126.com': 'http://mail.126.com',
    'yeah.net': 'http://www.yeah.net/',
    'sohu.com': 'http://mail.sohu.com/',
    'tom.com': 'http://mail.tom.com/',
    'sogou.com': 'http://mail.sogou.com/',
    '139.com': 'http://mail.10086.cn/',
    'hotmail.com': 'http://www.hotmail.com',
    'live.com': 'http://login.live.com/',
    'live.cn': 'http://login.live.cn/',
    'live.com.cn': 'http://login.live.com.cn',
    '189.com': 'http://webmail16.189.cn/webmail/',
    'yahoo.com.cn': 'http://mail.cn.yahoo.com/',
    'yahoo.cn': 'http://mail.cn.yahoo.com/',
    'eyou.com': 'http://www.eyou.com/',
    '21cn.com': 'http://mail.21cn.com/',
    '188.com': 'http://www.188.com/',
    'foxmail.com': 'http://www.foxmail.com'
}

const filterEmail = (email, msg) => {
    const emails = email && (email.split('@')[1] || '').toLowerCase()

    for(let i in mailMaps) {
        if(emails === i) {
            window.open(mailMaps[i])

            return
        }
    }

    message.destroy()
    message.info(msg || '企业邮箱自行登录')
}

const wxReplaceHistory = () => {
    if(utils.userAgent().isWx(navigator.userAgent)) {
        function pushHistory() {
            let state = {
                title: '',
                url: window.location.href
            };
            window.history.pushState(state, state.title, state.url);
        }

        pushHistory()
        window.addEventListener("popstate", function(e) {
            if((window.location.href).indexOf(`shots`) > -1 || (window.location.href).indexOf(`article`) > -1) {
                window.location.replace(`/`)
            }
        }, false)
    }
}

export { mailMaps, filterEmail, wxReplaceHistory }