import { config, http } from '@utils'
import basic from '@base/system/basic'

const token = basic.token
const api = config.API_MEIHUA

export default {
  /**
   * 获取我关注的文章、作品
   * @param option 
   */
  queryFollowCompositions(option={}) {
    return http.get(`${api}/composition/author/setting/follow-composition`, {token, ...option})
  },

  /**
   * 获取我关注的标签
   * @param option 
   */
  queryFollowTags(option) {
    return http.get(`${api}/composition/author/setting/follow-tag`, {token, ...option})
  },

  /**
   * 获取我关注的作者
   * @param option 
   */
  queryFollowAuthors(option) {
    return http.get(`${api}/composition/author/setting/follow-author`, {token, ...option})
  },

  /**
   * 获取我关注的收藏夹
   * @param option 
   */
  queryFollowFavorites(option) {
    return http.get(`${api}/composition/author/setting/follow-collection`, {token, ...option})
  }
}