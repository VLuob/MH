import { config, http } from '@utils'
import basic from '@base/system/basic'

const api = config.API_MEIHUA
const token = basic.token

export default {
    /**
     * 获取专题列表
     */
    queryTopSchedules({host, ...option}) {
        return http.get(`${api}/composition/rankings`, option)
    },

    /**
     * 获取专题详情
     */
    queryTops({host, rankingId, ...option}) {
        return http.get(`${api}/composition/ranking/${rankingId}`, {token, ...option})
    },

    /**
     * 查询创作者总榜
     * @param param0 
     */
    queryTotalTopAuthors({host, ...option}) {
        return http.get(`${api}/composition/author/top`, {token, ...option})
    }
}