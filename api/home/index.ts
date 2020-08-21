import { config, http } from '@utils'
import basic from '@base/system/basic'

const api = config.API_MEIHUA
const token = basic.token

export default {
    /**
     * 首页赞助商
     * @return {[type]} [description]
     */
    getClientSponsor: option => {
        return http.get(`${api}/sys/home/sponsor`, option)
    },

    /**
     * 获取首页广告数据
     * @return {[type]} [description]
     */
    getAdvertisement: option => {
        return http.get(`${api}/sys/home/advertisement`, option)
    },
    /**
     * 获取最新文章
     * @return {[type]} [description]
     */
    getLatestCompositions: option => {
        return http.get(`${api}/composition/index-articles`, option)
    },
    /**
     * 首页推荐创作者
     * @return {[type]} [description]
     */
    getAuthorRecommended: option => {
        return http.get(`${api}/composition/author/home/author-recommended`, option)
    },
    /**
     * 首页赞助商
     * @return {[type]} [description]
     */
    getSponsor: ({host, ...option}) => {
        return http.get(`${api}/sys/home/sponsor`, option) 
    },
    /**
     * 文章作品评论喜欢
     * @return {[type]} [description]
     */
    actionFavor: option => {
        return http.post(`${api}/composition/author/action/favor`, { token, ...option })

    },
    getFeature: option => {
        return http.get(`${api}/composition/feature`, option)
    },

    /**
     * 获取首页推荐专题
     * @param option 
     */
    getRecommendTopics({host, ...option}) {
        return http.get(`${api}/composition/feature/recommended`, option)
    }
}