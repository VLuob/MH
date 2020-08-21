import { observable, action, runInAction, toJS } from 'mobx'
import { message } from 'antd'
import { globalApi } from '@api'
import { config } from '@utils'
import jsCookie from 'js-cookie'

export class GlobalStore {
    @observable globalLoading: Boolean
    @observable isBigScreen: boolean
    @observable isMobileScreen: boolean
    @observable homeScreen: number
    @observable navTipShow: boolean
    @observable globalTitle: string
    @observable ip: string
    @observable ipAddress: any
    @observable serverClientCode: string
    @observable currentWxacode: string
    @observable navExpand: any
    @observable globalObstacleList: Array<any>
    @observable suggestTagList: Array<any>
    @observable navigationData: any
    @observable mobileNavigationData: any
    @observable fixedActionData: any
    @observable qiniuToken: string
    @observable wxSignatureData: any
    @observable referrerSource: string
    @observable hideFixedActions: boolean
    @observable pageData: any

    constructor(initialData:any = {}) {
        this.globalLoading = initialData.globalLoading || false
        this.isBigScreen = initialData.isBigScreen || false
        this.isMobileScreen = initialData.isMobileScreen || false
        this.homeScreen = initialData.homeScreen || 0
        this.navTipShow = initialData.navTipShow === false ? false : true
        this.globalTitle = initialData.globalTitle || ''
        this.ip = initialData.ip || ''
        this.ipAddress = initialData.ipAddress || {}
        this.serverClientCode = initialData.serverClientCode || ''
        this.currentWxacode = initialData.currentWxacode || ''
        this.navExpand = initialData.navExpand || { topic: false,top: false, }
        this.globalObstacleList = initialData.globalObstacleList || []
        this.suggestTagList = initialData.suggestTagList || []
        this.navigationData = initialData.navigationData || { fixed: false, hide: false, }
        this.mobileNavigationData = initialData.mobileNavigationData || {hide: false, title: '', backUrl: '/'}
        this.fixedActionData = initialData.fixedActionData || {hide: false}
        this.qiniuToken = initialData.qiniuToken || ''
        this.wxSignatureData = initialData.wxSignatureData || { signature: '',  appId: '',  noncestr: '', timestamp: '', }
        this.referrerSource = initialData.referrerSource || ''
        this.hideFixedActions = !!initialData.hideFixedActions
        this.pageData = initialData.pageData || {}
    }

    @action.bound
    saveClientCode(data) {
        this.clientSaveCode = data
    }

    @action.bound
    saveReferrerSource(ref) {
        this.referrerSource = ref || ''
    }

    @action.bound 
    updateNavTipShow(data) {
        this.navTipShow = data
    }

    @action.bound
    saveIp(ip) {
        this.ip = ip
    }

    @action.bound
    updateIpAddress(data) {
        this.ipAddress = data || {}
    }

    @action.bound
    updateGlobalTitle(data) {
        this.globalTitle = data
    }

    // @observable 
    @action.bound
    changeLoading(boolean) {
        this.globalLoading = boolean
    }

    @action.bound
    setFixedActions(bool) {
        this.hideFixedActions = !!bool
    }

    @action.bound
    getClientWidth(width) {
        this.isBigScreen = width > 1200
        this.isMobileScreen = width <= 768
        this.homeScreen = width
    }

    @action.bound
    setMobileScreen(status) {
        this.isMobileScreen = !!status
    }

    @action.bound
    setNavigationData(data={}) {
        this.navigationData = {
            ...this.navigationData,
            ...data,
        }
    }

    @action.bound
    setMobileNavigationData(data={}) {
        this.mobileNavigationData = {
            ...this.mobileNavigationData,
            ...data,
        }
    }

    @action.bound
    setFixedActionData(data={}) {
        this.fixedActionData = {
            ...this.fixedActionData,
            ...data,
        }
    }

    @action.bound
    setQiniuToken(qnToken) {
        this.qiniuToken = qnToken
    }

    @action.bound
    updateClientCode(data) {
        this.serverClientCode = data
    }

    @action.bound
    setNavExpand(option) {
        this.navExpand = {
            ...toJS(this.navExpand),
            ...option,
        }
    }

    @action 
    setWxSignature(data) {
        this.wxSignatureData = {
            ...this.wxSignatureData,
            ...data,
        }
    }

    @action.bound
    setWxacode(wxacode) {
        this.currentWxacode = wxacode
    }

    @action.bound
    setPageData(pageData) {
        this.pageData = pageData || {}
    }

    @action.bound
    async fetchGetTagSuggestion(option) {
        try {
            const param = { ...option }
            const result = await globalApi.getTagSuggestion(param)

            runInAction(() => {
                if(result.success) {
                    this.suggestTagList = result.data
                } else {
                    message.error(result.data.msg)
                }
            })
        } catch (err) {
            runInAction(() => {
                console.log(err)
            })
        }
    }

    @action.bound
    async fetchGetClientCode(option) {
        try {
            const param = { r: 0, d: 1, referer: '', ...option }
            const result = await globalApi.getClientCode(param)
            if(result.success) {
                this.saveClientCode(result.data)
            } 
            return result
        } catch (err) {
            return {success: false, data: {}}
        }
    }

    @action.bound
    async fetchGetSubscription(option) {
        try {
            // const param = { token, ...option }
            // const result = await globalApi.setSubscription(param)

            const result = await globalApi.setSubscribe(option) // 新api单独邮箱订阅

            message.destroy()
            runInAction(() => {
                if(result.success) {
                    message.success(`订阅成功`)
                } else {
                    message.error(result.data.msg)
                }
            })
        } catch (err) {
            console.log(err)
        }
    }
 
    @action.bound
    async fetchGetIpAddress(option) {
        try {
            const result = await globalApi.getIpAddress(option)

            if(option.host) {
                return new Promise((resolve, reject) => {
                    if(result.success) {
                        resolve(result.data)
                    } else {
                        message.destroy()
                        reject(result.data.msg)
                    }
                })
            } else {
                if(result.success) {
                    this.updateIpAddress(result.data)
                } else {
                    message.destroy()
                    message.error(result.data.msg)
                }
            }
        } catch (err) {
            console.log(err)
        }
    }

    @action.bound
    async fetchQiniuToken(option={}) {
        try {
            const response = await globalApi.queryQiniuToken(option)
            if (option.host) {
                return new Promise((resolve, reject) => {
                    if (response.success) {
                        this.setQiniuToken(response.data)
                        resolve(response.data)
                    } else {
                        reject(response.data.msg)
                    }
                })
            } else {
                if (response.success) {
                    this.setQiniuToken(response.data)
                } else {
                    message.destroy()
                    message.error(response.data.msg)
                }
            }
        } catch (error) {
            
        }
    }

    @action.bound
    async fetchWxSignature({isPsomise, ...option}) {
        try {
            const response = await globalApi.queryWxSignature(option)
            // console.log('wx sign',option, response)
            if (isPsomise) {
                return new Promise((resolve, reject) => {
                    if (response.success) {
                        this.setWxSignature(response.data)
                        resolve(response.data)
                    } else {
                        reject(response.data.msg)
                    }
                })
            } else {
                if (response.success) {
                    this.setWxSignature(response.data)
                } else {
                    message.destroy()
                    message.error(response.data.msg)
                }
            }
        } catch (error) {
            
        }
    }

    @action.bound
    async fetchWxacode(option) {
        try {
            const response = await globalApi.getWxacode(option)
            if (option.host) {
                return new Promise((resolve,  reject) => {
                    if (response.success) {
                        this.currentWxacode = response.data
                        resolve(response.data)
                    } else {
                        reject(response.data.msg)
                    }
                })
            } else {
                if (response.success) {
                    this.currentWxacode = response.data
                }
            }
        } catch (error) {
            return {success: false, data: {code: 'E100000'}}
        }
    }

    @action.bound
    async fetchPageData(option) {
        try {
            const response = await globalApi.queryPageData(option)
            if (response.success) {
                this.setPageData(response.data)
            }
            return response
        } catch (error) {
            return {success: false, data: {code: 'E100000'}}
        }
    }
}

export default new GlobalStore()
