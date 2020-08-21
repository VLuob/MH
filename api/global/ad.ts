import { http, config } from '@utils'

const api = config.API_MEIHUA

export default {
    // server api
    /**
     * 获取首页广告数据
     * @return {[type]} [description]
     */
    queryAdvertisement({host, ...params}) {
        return http.get(`${api}/sys/home/advertisement`, params)
    },

    actionAdClick(params) {
        return http.post(`${api}/sys/home/ad-click`, params)
    },
    actionSponsor(params) {
        return http.post(`${api}/sys/home/sponsor_click`, params)
    }
}