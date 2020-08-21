import { http } from '@utils'
import basic from '@base/system/basic'
import { utils, config } from '@utils'

const api = config.API_MEIHUA
const userApi = config.API_MEIHUA_UCENTER
const token = basic.token

export default {
    /**
     * 获取创作者列表
     * @return {[type]} [description]
     */
    queryAuthorList: option => {
        return http.post(`${api}/composition/author/list`, option)

    },

    /**
     * 获取已发布创作者
     * @param param0 
     */
    queryAuthors({...params}) {
        return http.get(`${api}/composition/composition/authors`,{token, ...params})
    },

    /**
     * 获取主页个人/机构的作品/文章
     * @return {[type]} [description]
     */
    getClientComposition: option => {
        return http.get(`${api}/composition/author/${option.code}/composition`, option)
    },
    /**
     * 获取个人/机构主页基本信息
     * @return {[type]} [description]
     */
    // TODO: 完成相应数据的
    getAuthorCommon: option => {
        return http.get(`${api}/composition/author/${option.code}/common`, option)
    },
    /**
     * 获取主页个人/机构的关于信息
     * @return {[type]} [description]
     */
    getAuthorAbout: option => {
        return http.get(`${api}/composition/author/${option.code}/about`, option)
    },
    /**
     * 获取主页作者喜欢
     * @return {[type]} [description]
     */
    getClientAuthorFavor: option => {
        return http.get(`${api}/composition/author/${option.code}/favor`, option)
    },
    /**
     * 获取主页关注创作者信息
     * @return {[type]} [description]
     */
    getClientAuthorFollow: option => {
        return http.get(`${api}/composition/author/${option.code}/follow`, option)
    },
    /**
     * 主页创作者粉丝信息
     * @return {[type]} [description]
     */
    getClientAuthorFans: option => {
        return http.get(`${api}/composition/author/${option.code}/fans`, option)
    },
    /**
     * 获取主页作者喜欢数
     * @return {[type]} [description]
     */
    getAuthorFavorCount: option => {
        return http.get(`${api}/composition/author/${option.code}/favor-count`, option)
    },

    /**
     * 关注作者
     * @return {[type]} [description]
     */
    actionFollow: option => {
        return http.post(`${api}/composition/author/action/follow`, { token, ...option })

    },
    /**
     * 文章作品评论喜欢
     * @return {[type]} [description]
     */
    actionFavor: option => {
        return http.post(`${api}/composition/author/action/favor`, { token, ...option })

    },
    /**
     * 收藏作品
     * @return {[type]} [description]
     */
    actionCollection: option => {
        return http.post(`${api}/composition/author/action/collection`, { token, ...option })
    },
    /**
     * 获取文件夹列表
     * @return {[type]} [description]
     */
    getCollectionList: option => {
        return http.post(`${api}/composition/collection/list`, { token, ...option })
    },
    /**
     * 新增文件夹
     * @return {[type]} [description]
     */
    getCollectionAdd: option => {
        return http.post(`${api}/composition/collection/add`, { token, ...option })
    },

    getAuthorRecommended: ({host, ...option}) => {
        return http.get(`${api}/composition/author/home/author-recommended`, option)
    },
    
    // /**
    //  * 获取主页个人/机构的作品/文章
    //  * @return {[type]} [description]
    //  */
    getComposition: option => {
        return http.get(`${api}/composition/author/${option.code}/composition`, option)
    },
    /**
     * 主页创作者粉丝信息
     * @return {[type]} [description]
     */
    getAuthorFans: option => {
        return http.get(`${api}/composition/author/${option.code}/fans`, option)
    },
     /**
     * 获取不同分类的作者
     * @return {[type]} [description]
     */
    getClassComposition: option => {
        return http.get(`${api}/composition/author/${option.classification}`, option)
    },

    /**
     * 修改创作者封面背景
     * @param option 
     */
    setAuthorBanner(option) {
        return http.post(`${api}/composition/author/setting/banner`, {token, ...option})
    },

    /**
     * 获取作者默认封面图
     */
    queryAuthorBanners() {
        return http.get(`${api}/composition/author/setting/sys/banners`, {token})
    },
    
    /**
     * 获取浮层作者简要信息
     * @param param0 
     */
    queryAuthorPopup({code}) {
        return http.get(`${api}/composition/composition/author/${code}`, {token})
    },


}