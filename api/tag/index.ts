import { config, http } from '@utils'
import basic from '@base/system/basic'

const api = config.API_MEIHUA
const token = basic.token

export default {
    /**
     * 获取标签详情
     * @return {[type]} [description]
     */
    getTagDetail(option) {
        return http.get(`${api}/composition/composition/tag/${option.tagId}`, option)
    },

    /**
     * 获取标签列表
     * @return {[type]} [description]
     */
    getTagList(option) {
        return http.post(`${api}/composition/compositions`, option)
    },

    /**
     * 关注标签
     * @return {[type]} [description]
     */
    tagFollow(option) {
        const param = { token, ...option }
        return http.post(`${api}/composition/author/action/follow`, param)
    }
}