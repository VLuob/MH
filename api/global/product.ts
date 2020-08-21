import { http, config } from '@utils'

const api = config.API_MEIHUA

export default {
    // server api
    /**
     * 获取首页广告数据
     * @return {[type]} [description]
     */
    queryProducts({...params}) {
        return http.get(`${api}/sys/product/list`, params)
    },

    actionProductClick({id}) {
        return http.post(`${api}/sys/product/click/${id}`)
    },
}