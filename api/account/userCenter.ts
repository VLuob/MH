import { config, http } from '@utils'
import basic from '@base/system/basic'


const token = basic.token
const api = config.API_MEIHUA

export default {
    /**
     * 设置邮件,功能,域名设置
     * @return {[type]} [description]
     */
    setSetting(option) {
        const url = api + '/composition/author/setting/info'

        return http.post(url, option)
    },
    /**
     * 获取邮件,功能,域名设置
     * @return {[type]} [description]
     */
    getSetting(option) {
        const url = api + '/composition/author/setting/other-setting'

        return http.get(url, option)
    },
    /**
     * 获取邮件,功能,域名设置
     * @return {[type]} [description]
     */
    getSettingMember(option) {
        const url = api + '/composition/subscription/authors'

        return http.get(url, option)
    },
    /**
     * 获取机构服务信息
     * @return {[type]} [description]
     */
    getOrgService(option) {
        const url = api + '/composition/author/setting/org-service'

        return http.get(url, option)
    },
    /**
     * 保存机构服务信息
     * @return {[type]} [description]
     */
    postOrgService(option) {
        const url = api + '/composition/author/setting/org-service'

        return http.post(url, option)
    },
    /**
     * 上传图片
     * @return {[type]} [description]
     */
    uploadImg(option) {
        const url = api + '/composition/author/setting/upload'

        return http.put(url, option)
    },
    /**
     * 获取个人/机构简要信息
     * @return {[type]} [description]
     */
    getSettingCommon: option => {

        return http.get(`${api}/composition/author/setting/common`, option)
    },
    /**
     * 获取个人/机构简要信息
     * @return {[type]} [description]
     */
    getSettingBaseInfo: option => {
        const url = api + '/composition/author/setting/base-info'

        return http.get(url, option)
    },
    /**
     * 保存个人/机构简要信息
     * @return {[type]} [description]
     */
    setSettingBaseInfo: option => {
        const url = api + '/composition/author/setting/base-info'

        return http.post(url, option)
    },
    // /composition/author/setting/upload
    /**
     * 获取我的机构
     * @return {[type]} [description]
     */
    getOrgList: option => {
        // const url = api + '/composition/author/setting/org-list'
        const url = api + `/composition/author/setting/management/${option.user_id}`

        return http.get(url, option)
    },
    /**
     * 获取设置喜欢作品文章
     * @return {[type]} [description]
     */
    getSettingFavor: option => {
        const url = api + '/composition/author/setting/favor'

        return http.get(url, option)
    },
    /**
     * 获取文章/作品的收藏夹（包含的文章作品数）
     * @return {[type]} [description]
     */
    getSettingCollection: option => {
        const url = api + '/composition/author/setting/collection'

        return http.get(url, option)
    },
    /**
     * 获取收藏作品/文章
     * @return {[type]} [description]
     */
    getSettingAuthorCollection: option => {
        const url = api + '/composition/author/setting/author-collection'

        return http.get(url, option)
    },
    /**
     * 获取设置关注信息
     * @return {[type]} [description]
     */
    getSettingFollow: option => {
        const url = api + '/composition/author/setting/follow'

        return http.get(url, option)
    },
    /**
     * 获取个人/机构过滤筛选文章作品的条件数据
     * @return {[type]} [description]
     */
    getSettingCompositionFilter: option => {
        return http.get(`${api}/composition/author/setting/composition-filter`, option)
    },
    /**
     * 获取个人/机构创作
     * @return {[type]} [description]
     */
    getSettingComposition: option => {
        const url = api + '/composition/author/setting/composition'

        return http.get(url, option)
    },
    /**
     * 新增文件夹
     * @return {[type]} [description]
     */
    addCollectionFolder: option => {
        const url = api + '/composition/collection/add'

        return http.post(url, option)
    },
    /**
     * 设置操作文章作品信息
     * @return {[type]} [description]
     */
    setSettingOperator: option => {
        const param = { token, ...option }
        const result = http.post(`${api}/composition/author/setting/operator`, param)

        return result
    },
    /**
     * 显示隐藏创作
     * @return {[type]} [description]
     */
    operateComposition: option => {
        const param = { token, ...option }
        const result = http.get(`${api}/composition/composition/${option.compositionId}/show`, param)

        return result
    },
    /**
     * 删除创作
     * @return {[type]} [description]
     */
    deleteComposition: option => {
        const param = { token, ...option }
        const result = http.delete(`${api}/composition/composition/${option.compositionId}`, param)

        return result
    },
    /**
     * 创建机构
     * @return {[type]} [description]
     */
    createInstitution: option => {
        const param = { token, ...option }
        const result = http.post(`${api}/composition/author/setting/org-create`, param)

        return result
    },
    /**
     * 获取创作者昵称
     * @return {[type]} [description]
     */
    getCreatorNickName: option => {
        const param = { token, ...option }
        const url = api + '/composition/author/setting/nickname-suggestion'

        return http.get(url, param)
    },
    /**
     * 创作者验证手机
     * @return {[type]} [description]
     */
    creatorPhoneVerify: option => {
        const param = { token, ...option }
        const url = api + '/user/phone-bind'
        return http.get(url, param)
    },
    /**
     * 创建创作者
     * @return {[type]} [description]
     */
    createSetBaseInfo: option => {
        const param = { token, ...option }
        const result = http.post(`${api}/composition/author/setting/base-info`, param)

        return result
    },
    /** 
     * 获取订阅
     * @return {[type]} [description]
     */
    getSubscriptions: option => {
        const param = { token }
        const result = http.get(`${api}/composition/subscription`, param)

        return result
    },
    /**
    * 设置订阅
    * @return {[type]} [description]
    */
    setSubscriptions: option => {
        const param = { token, ...option }
        const result = http.post(`${api}/composition/subscription`, param)

        return result
    },


    /**
     * 设置独立作品库官网域名
     * @param option 
     */
    setShotsWebsiteDomain(option) {
        return http.post(`${api}/composition/author/setting/work_website/domain`, {token, ...option})
    },
}