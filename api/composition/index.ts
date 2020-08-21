import { config, http } from '@utils'
import basic from '@base/system/basic'

const api = config.API_MEIHUA
const token = basic.token

export default {

  queryAuthors({...params}) {
    return http.get(`${api}/composition/composition/authors`,{token, ...params})
  },

  queryClassifications(params) {
    return http.get(`${api}/composition/composition/classifications`, params)
  },

  queryBrandSuggestion(params) {
    return http.get(`${api}/composition/brand/suggestion`, params)
  },

  queryTagSuggestion(params) {
    return http.get(`${api}/composition/tag/suggestion`, params)
  },

  queryMemberSuggestion(params) {
    return http.get(`${api}/composition/composition/member/suggestion`, {token, ...params})
  },

  queryImageMark(params) {
    return http.get(`${api}/composition/composition/image-mark`,{token, ...params})
  },

  queryInitByUrl(params) {
    return http.get(`${api}/composition/composition/init-by-url`, params)
  },

  queryCompositions({...params}) {
    return http.post(`${api}/composition/compositions`, {...params})
  },

  queryComposition({compositionId, ...params}) {
    return http.get(`${api}/composition/composition/${compositionId}`, params)
  },

  queryCompositionPreviewCode({compositionId}) {
    return http.post(`${api}/composition/composition/${compositionId}/preview-code?`, {token})
  },

  queryCompositionPreview(option) {
    return http.post(`${api}/composition/composition/preview`, {token, ...option})
  },

  // queryCompositionPreview({compositionId}) {
  //   return http.get(`${api}/composition/composition/${compositionId}/preview`)
  // },

  queryCompositionByUrl({url}) {
    return http.get(`${api}/composition/composition/init-by-url`, {token, url})
  },

  addComposition(params) {
    return http.post(`${api}/composition/composition`, {token, ...params})
  },

  editComposition({compositionId, ...params}) {
    return http.post(`${api}/composition/composition/${compositionId}`, {token, ...params})
  },

  queryAuthor({compositionId, ...params}) {
    return http.get(`${api}/composition/composition/${compositionId}/author`, {...params})
  },

  downloadAttach({compositionId, attachId, ...params}) {
    return http.get(`${api}/composition/composition/${compositionId}/attach/${attachId}/download`, {token, ...params})
  },

  queryHotArticles({...params}) {
    return http.post(`${api}/composition/hot-articles`, {...params})
  },

  queryNewArticles({...params}) {
    return http.get(`${api}/composition/latest-articles`, {...params})
  },

  queryRelatedCompositions({compositionId, ...params}) {
    return http.post(`${api}/composition/composition/${compositionId}/related-compositions`, {...params})
  },

  /**
   * 热门作品
   * @param param
   */
  queryHotShots({...params}) {
    return http.get(`${api}/composition/hot-works`, {...params})
  },
  //server api
  /**
  * 获取分类
  * @return {[type]} [description]
  */
  getClassifications(option) {
    return http.get(`${api}/composition/composition/classifications`, option)
  },
  /**
    * 获取作品列表
    * @return {[type]} [description]
  */
  getShotsList(option) {
      return http.post(`${api}/composition/compositions`, option)
  },

  /**
   * 验证共同创作者code
   * @param option 
   */
  verifyMemberInvite({code}) {
    return http.get(`${api}/composition/composition-member-invite`, {code})
  },

  /**
   * 同意邀请共同创作者code
   * @param param0 
   */
  confirmMemberInvite({code}) {
    return http.post(`${api}/composition/composition-member-invite`, {code})
  },
  
  /**
   * 收藏了该作品的用户还收藏了的关联作品
   * @param option 
   */
  queryCollectionRelateds(option) {
    return http.get(`${api}/composition/author/action/composition/collection-relation`, {token, ...option})
  },

  /**
   * 喜欢了该作品的用户还喜欢了的关联作品
   * @param option 
   */
  queryFavorRelateds(option) {
    return http.get(`${api}/composition/author/action/composition/favor-relation`, {token, ...option})
  },

  /**
   * 同步至梅花创新奖
   * @param option 
   */
  syncMawarks(option) {
    return http.post(`http://mawards_api.meihua.info/api/works/create`, option)
  },
  // syncMawarks({userName, authCode, authorInfo}) {
  //   return http.post(`http://mawards_api.meihua.info/api/works/create?userName=${userName}&authCode=${authCode}`, {authorInfo})
  // }
}