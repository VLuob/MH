import { http, config } from '@utils'

const api = config.API_MEIHUA

export default {
    /**
     * 获取分类详情
     * @return {[type]} [description]
     */
    classifyDetail(option) {
        return http.get(`${api}/composition/composition/classification/${option.classificationId}`, option)
    },
}