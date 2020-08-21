import { observable, action, runInAction, toJS } from 'mobx'
import { message } from 'antd'
import jsCookie from 'js-cookie'
import { commentApi as api, authorApi} from '@api'
import { user } from '@base/system'
import comment from '@api/composition/comment';
import { config } from '@utils/'

export class CommentStore {
  @observable commentData: object
  @observable accountCommentData: object
  @observable messageCount: number

  constructor(initialData = {}) {
    this.commentData = initialData.commentData || {
      list: [],
      total: 0,
      isLastPage: false,
      isLoading: false,
      isLoaded: false,
      terms: {
        sortType: 2,
        page: 1,
        limit: 10,
      },
    }
    this.accountCommentData = initialData.accountCommentData || {
      list: [],
      total: 0,
      isLastPage: false,
      isLoading: false,
      isLoaded: false,
      terms: {
        type: 1,
        page: 1,
        limit: 10,
      },
    }
    this.messageCount = initialData.messageCount || 0
  }

  @action.bound 
  setCommentData(data, option) {
    const originList = this.commentData.list
    const newList = (data.data || []).map(item => {
      item.subComment = {
        list : item.subComment
      }
      return item
    })
    const list = option.page > 1 ? [...toJS(originList), ...toJS(newList)] : newList
    const limit = option.size || 20
    const page = option.page || 1
    const total = data.total_count || 0
    this.commentData = {
      list: toJS(list),
      total,
      isLastPage: Math.ceil(total / limit) <= page,
      isLoaded: true,
      terms: {
        ...option,
        page,
        limit,
      }
    }
  }

  @action.bound
  setAccountCommentData(data, option) {
    const originList = this.accountCommentData.list
    const newList = data.data || []
    // const list = option.page > 1 ? [...originList, ...newList] : newList
    const list = newList.map(item => {
      item.subComment = {
        list: item.subComment
      } 
      return item
    })
    const limit = option.size || 20
    const page = option.page || 1
    const total = data.total_count || 0
    this.accountCommentData = {
      list,
      total,
      isLastPage: Math.ceil(total / limit) <= page,
      isLoaded: true,
      terms: {
        ...option,
        page,
        limit,
      }
    }
  }

  @action.bound
  setSingleReplyData(data, option) {
    const commentData = this.commentData
    const commentList = commentData.list ? [...commentData.list] : []
    const parentComment = commentList.find(item => item.id === option.comment_id) 
    const originData = parentComment.subComment || {}
    const originList = originData.list || []
    const newList = data.data || []
    const list = option.page > 1 ? [...originList, ...newList] : newList
    const limit = option.size || 20
    const page = option.page || 1
    const total = data.total_count || 0
    parentComment.subComment = {
      list,
      total,
      isLoaded: true,
      terms: {
        ...option,
        page,
        limit,
      }
    }
    this.commentData = {
      ...commentData,
      list: [...commentList],
    }
    // console.log(toJS(this.commentData), toJS([...commentList]))
  }


  @action.bound
  appendComment(data, option) {
    const list = this.commentData.list || []
    if (!option.parent_id) {
      this.commentData.list = [data, ...list]
    } else {
      // const parentComment = list.find(item => item.id === option.comment_id) 
      // const originData = parentComment.subComment || {}
      // const originList = originData.list || []
      // const appendList = [data, ...originList]
      // originData.list = appendList
      const newList = list.map(item => {
        if (item.id === option.parent_id) {
          const subComment = item.subComment || {}
          const subOriginList = subComment.list || []
          const subNewList = [...subOriginList, data]
          item.subComment = {
            ...subComment,
            list: subNewList,
          }
        }
        return item
      })
      this.commentData.list = [...newList]
      // console.log(toJS(this.commentData))
    }
  }

  @action.bound
  appendAccountComment(data, option) {
    const list = this.accountCommentData.list || []
    this.accountCommentData.list = [data, ...list]
    // if (!option.parent_id) {
    //   this.accountCommentData.list = [data, ...list]
    // } else {
    //   const newList = list.map(item => {
    //     if (item.id === option.parent_id) {
    //       const subComment = item.subComment || []
    //       item.subComment = [...subComment, data]
    //     }
    //     return item
    //   })
    //   this.accountCommentData.list = [...newList]
    //   // console.log(toJS(this.commentData))
    // }
  }

  @action.bound
  removeComment(commentId) {
    const commentList = this.commentData.list || []
    const filterList = commentList.filter(commentItem => {
      if (commentId !== commentItem.id) {
        const subComment = commentItem.subComment || {}
        const replyList = subComment.list || []
        const filterReplyList = replyList.filter(replyItem => commentId !== replyItem.id)
        
        commentItem.subComment = {
          ...subComment,
          list: filterReplyList,
        }
      }
      return commentId !== commentItem.id
    })
    this.commentData.list = filterList
  }

  @action.bound
  removeAccountComment(commentId) {
    const commentList = this.accountCommentData.list || []
    const filterList = commentList.filter(commentItem => {
      if (commentId !== commentItem.id) {
        const subComment = commentItem.subComment || []
        const filterReplyList = subComment.filter(replyItem => commentId !== replyItem.id)
        
        commentItem.subComment = filterReplyList
      }
      return commentId !== commentItem.id
    })
    this.accountCommentData.list = filterList
  }

  @action.bound
  setCommentFavor(option) {
    const commentList = this.commentData.list || []
    const commentId = option.id
    const favored =  option.action === 1
    const filterList = commentList.map(commentItem => {
      if (commentId === commentItem.id) {
        const favors = commentItem.favorQuantity || 0
        commentItem.favorQuantity = favored ? favors + 1 : favors - 1
        commentItem.favored = favored
      } else {
        const subComment = commentItem.subComment || {}
        const replyList = subComment.list || []
        const filterReplyList = replyList.map(replyItem => {
          if (commentId === replyItem.id) {
            const replyFavors = replyItem.favorQuantity || 0
            replyItem.favorQuantity = favored ? replyFavors + 1 : replyFavors - 1
            replyItem.favored = favored
          }
          return toJS(replyItem)
        })
        
        commentItem.subComment = {
          ...toJS(subComment),
          list: toJS(filterReplyList),
        }

      }
      return toJS(commentItem)
    })
    this.commentData.list = filterList
  }


  @action.bound
  async fetchComments(option, callback) {
    try {
      this.commentData.isLoading = true
      const response = await api.queryComments(option)
      this.commentData.isLoading = false
      if (response.success) {
        this.setCommentData(response.data, option)
      } else {
        message.error(response.data.msg)
      }
      if (callback) {
        callback(res)
      }
    } catch (error) {
      
    }
  }

  @action.bound
  async fetchAccountComments(option) {
    try {
      this.accountCommentData.isLoading = true
      const response = await api.queryAccountComments(option)
      this.accountCommentData.isLoading = false
      if (response.success) {
        this.setAccountCommentData(response.data, option)
      } else {
        message.error(response.data.msg)
      }
    } catch (error) {
      
    }
  }

  @action.bound
  async fetchCommentReplies(option) {
    try {
      const response = await api.queryCommentReplies(option)
      if (response.success) {
        this.setSingleReplyData(response.data, option)
      } else {
        message.error(response.data.mag)
      }
    } catch (error) {

    }
  }

  @action.bound
  async addComment({
    commentScope,
    userId,
    nickname,
    avatar,
    gmtCreate,
    replyAuthorNickname,
    compositionTitle,
    parentComment,
    ...option
  }, callback) {
    try {
      const response = await api.addComment(option)
      if (response.success) {
        const data = response.data || {}
        let newComment = {
          relationId: option.composition_id,
          content: option.content,
          parentId: option.parent_id || 0,
          replyCommentId: option.reply_comment_id || 0,
          favorQuantity: 0,
          subCommentQuantity: 0,
          userId: userId,
          nickname: nickname,
          avatar: avatar,
          gmtCreate: gmtCreate,
          replyAuthorNickname: replyAuthorNickname,
          compositionTitle: compositionTitle,
          replyAuthorComment: parentComment,
        }
        if (typeof data === 'object') {
          newComment = {
            ...newComment,
            ...data,
            nickname: data.userNickname || data.nickname || nickname,
          }
        } else {
          newComment.id = data
        }
        console.log('new comment', newComment)
        if (commentScope === 'account') {
          this.appendAccountComment(newComment, option)
        } else {
          this.appendComment(newComment, option)

          if (option.parent_id) {
            const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
            const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
            const sortType = this.commentData.terms.sortType
            this.fetchCommentReplies({
              composition_id: option.composition_id,
              comment_id: option.parent_id,
              sort_type: sortType,
              page: 1,
              size: 500,
              token,
              client_code,
            })
          }
        }
      } else {
        message.error(response.data.msg)
      }
      if (callback) {
        callback(response)
      }
    } catch (error) {
      
    }
  }

  @action.bound
  async deleteComment({commentScope, ...option}) {
    try {
      const response = await api.deleteComment(option)
      if (response.success) {
        if (commentScope === 'account') {
          this.removeAccountComment(option.comment_id)
        } else {
          this.removeComment(option.comment_id)
        }
      } else {
        message.error(response.data.msg)
      }
    } catch (error) {
      
    }
  }

  @action.bound
  async fetchCommentMessageCount() {
    try {
      const response = await api.queryCommentMessageCount()
      if (response.success) {
        this.messageCount = response.data || 0
      } else {
        message.error(response.data.msg)
      }
    } catch (error) {
      
    }
  }

  @action.bound
  async fetchFavor(option, callback) {
    try {
      const response = await authorApi.actionFavor(option)
      if (response.success) {
        this.setCommentFavor(option)
      } else {
        message.destroy()
        message.error(response.data.msg)
      }
      if (callback) {
        callback(response)
      }
    } catch (error) {
      
    }
  }
}


export default new CommentStore()