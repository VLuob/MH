import { config, http } from '@utils'
import basic from '@base/system/basic'

const api = config.API_MEIHUA
const token = basic.token

export default {
    /**
     * 推荐标签
     * @return {[type]} [description]
     */
    getTagSuggestion: option => {
        return http.get(`${api}/composition/tag/suggestion`, option)
    },
    /**
     * 获取client_code
     * @return {[type]} [description]
     */
    getClientCode: option => {
        return http.post(`${api}/composition/common/client`, option)
    },
    /**
     * 首页邮箱订阅
     * @return {[type]} [description]
     */
    setSubscription: option => {
        return http.post(`${api}/composition/author/home/subscription`, option)
    },

    /**
     * 单独邮箱订阅
     * @param option 
     */
    setSubscribe(option) {
        return http.post(`${api}/composition/subscribe`, option)
    },

    /**
     * 获取ip地址
     * @return {[type]} [description]
     */
    getIpAddress: option => {
        return http.get(`${api}/composition/author/ip-address`, option)
    },

    /**
     * 获取骑牛TOKEN
     */
    queryQiniuToken: () => {
        return http.post(`${api}/sys/common/qn-token`)
    },

    /**
     *  获取微信sdk签名信息
     * @param option {api}
     */
    queryWxSignature({...option}) {
        return http.get(`${api}/composition/wx/signature`, {...option})
    },

    /**
     * 获取微信小程序码
     * @param param0 
     */
    getWxacode({...option}) {
        return http.post(`${api}/composition/wxapp/mini-app`, {...option})
    },

    /**
     * 获取网页设置信息
     * @param option 
     */
    queryPageData(option) {
        return http.get(`${api}/composition/webpage/settings`, {...option})
    },
}