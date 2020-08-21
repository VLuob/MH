import { config, http } from '@utils'
import basic from '@base/system/basic'

const srvutils = require('@utils/srvutils')

const api = config.API_MEIHUA
const token = basic.token

export default {

  queryComments({composition_id, ...params}) {
    return http.get(`${api}/composition/comment/${composition_id}`,{...params})
  },

  queryCommentReplies({comment_id, ...params}) {
    return http.get(`${api}/composition/comment/subcomment/${comment_id}`, {...params})
  },

  /**
   * 个人中心评论列表
   */
  queryAccountComments(params) {
    return http.get(`${api}/composition/author/setting/comment`, {token, ...params})
  },

  addComment(params) {
    return http.post(`${api}/composition/comment`, {token, ...params})
  },

  deleteComment({comment_id, ...params}) {
    return http.post(`${api}/composition/comment/${comment_id}`, {token, ...params})
  },

  queryCommentMessageCount() {
    return http.get(`${api}/composition/author/setting/comment/message`, {token})
  },
}
