import { config, utils, cookie } from '@utils'
 
export default {
	 /**
     * 整理获取用户信息,用于存入cookie
     * @param data
     * @returns {{}}
     */
     arrangeUserInfo(data) {
        // console.log(data)
        let accountData = {}, totalAccounts = [], user = {}, accounts = [], account = {}, balance 

        balance = data.balance 
        
        data.totalAccounts.forEach((item, index) => {
            const totalAccount = {
                id: item.id,
                name: item.name,
            } 
            totalAccounts.push(totalAccount) 
        }) 

        account.id = data.user.accounts[0].id 
        account.name = data.user.accounts[0].name 
        account.edition = data.user.accounts[0].edition 
        account.editionDetail = data.user.accounts[0].editionDetail 
        account.type = data.user.accounts[0].type 
        account.industryId = data.user.accounts[0].industryId 
        account.mobileBound = data.user.accounts[0].mobileBound 
        account.gmtCreate = data.user.accounts[0].gmtCreate 
        account.gmtStart = data.user.accounts[0].gmtStart 
        account.gmtExpire = data.user.accounts[0].gmtExpire 

        accounts.push(account) 
        user.accounts = accounts 

        //2016/7/15
        user.id = data.user.id 
        user.email = data.user.email 
        user.username = data.user.username 
        user.realname = data.user.realname 
        user.nickname = data.user.nickname 
        user.avatar = data.user.avatar 
        user.mobilephone = data.user.mobilephone 
        user.gmtCreate = data.user.gmtCreate


        accountData.totalAccounts = totalAccounts 
        accountData.user = user 
        accountData.balance = balance 

        return accountData 
    },
    modifyCookieUserInfo(option) {
        const userInfoStr = cookie.get(config.COOKIE_MEIHUA_USER)
        if(userInfoStr) {
            const userInfo = JSON.parse(decodeURIComponent(userInfoStr))
            const newOption = this.userFieldConvert(option)
            const user = userInfo.user
            const newUser = {
                ...user,
                ...newOption
            }
            const newUserInfo = {
                ...userInfo,
                user: newUser,
            }
            const newUserInfoStr = encodeURIComponent(JSON.stringify(newUserInfo))
            const expires = 30
            const domain = config.COOKIE_MEIHUA_DOMAIN
            cookie.set(config.COOKIE_MEIHUA_USER, newUserInfoStr, {expires, path: '/', domain})
        }
    },
    userFieldConvert(option) {
        const keyMap = {realName: 'realname', jobTitle: 'job', company: 'company', address: 'address', weibo: 'wb', intro: 'intro', weiXin: 'wx', mobilePhone: 'mobilephone'}
        const newOption = {}
        for(let key in option) {
            const newKey = keyMap[key] || key
            newOption[newKey] = option[key]
        }
        return newOption
    },
    refreshNavigatorData() {
        if(window.__MEIHUA_NAVIGATOR__ && window.__MEIHUA_NAVIGATOR__.initUserInfo) {
            window.__MEIHUA_NAVIGATOR__.initUserInfo = window.__MEIHUA_NAVIGATOR__.initUserInfo.bind(window.__MEIHUA_NAVIGATOR__)
            window.__MEIHUA_NAVIGATOR__.initUserInfo()
        }
    },
    loadBcScript() {
        utils.loadScript(`${config.MEIHUA_DOMAIN}/static/js/bc-script.js?v=${+new Date()}`)
    }
}