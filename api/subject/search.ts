import { http, config } from '@utils'

const api = config.API_MEIHUA

export default {
    /**
     * 首页添加搜索记录
     * @return {[type]} [description]
     */
    getSearchAdd(option) {
        return http.post(`${api}/composition/search/add`, option)
    },
    /**
     * 首页获取热门搜索建议
     * @return {[type]} [description] 
     */
    getSearchHot(option) {
        return http.get(`${api}/composition/search/hot`, option)
    },
    /**
     * 搜索过滤条件（作品、文章、创作者对应类型的数量）
     * @return {[type]} [description]
     */
    getSearchFilter(option) {
        return http.get(`${api}/composition/search/filter`, option)
    },
    /**
     * 获取搜索结果
     * @return {[type]} [description]
     */
    getSearchContent({host, ...option}) {
        return http.post(`${api}/composition/search/content`, option)
    },
    
    /**
     * 热搜建议
     * @param param 
     */
    querySimilarWords({host, ...option}) {
        return http.get(`${api}/composition/search/similar-words`, option)
    },

    /**
     * 搜索默认下拉弹窗
     * @param option 
     */
    querySearchPopup(option) {
        return http.get(`${api}/composition/search/pop-up`, option)
    },
    
}