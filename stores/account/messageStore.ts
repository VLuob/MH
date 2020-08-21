import { observable, action, runInAction } from 'mobx'
import { message } from 'antd'
import { messageApi, commentApi } from '@api'
import { MessageType } from '@base/enums'
import { toJS } from 'mobx'


export class MessageStore {
  @observable messagesData: object 
  @observable messageStat: object

  constructor(initialData = {}) {
    this.messagesData = initialData.messagesData || {
      list: [],
      total: 0,
      page: 1,
      size: 10,
      isLoading: false,
      isLoaded: false,
    }
    this.messageStat = initialData.messageStat || {
      totalCount: 0, //未读总量
      followCount: 0, //未读关注数量
      collectionCount: 0, //未读收藏数量
      sysCount: 0, //未读通知数量
      favorCount: 0, //未读喜欢数量
      commentCount: 0, //未读评论数量
    }
  }

  @action.bound
  appendComment(data, option) {
    const list = this.messagesData.list || []
    this.messagesData.list = [data, ...list]
  }

  @action.bound
  removeComment(commentId) {
    const commentList = (this.messagesData.list || [])
    const filterList = commentList.filter(commentItem => {
      if (commentId !== commentItem.id && commentItem.type === MessageType.COMMENT) {
        const subComment = commentItem.subComment || []
        const filterReplyList = subComment.filter(replyItem => commentId !== replyItem.id)
        
        commentItem.subComment = filterReplyList
      }
      return commentId !== commentItem.id
    })
    this.messagesData.list = filterList
  }

  @action.bound
  setMessageStatView(type) {
    let statKey
    switch(Number(type)) {
      // case MessageType.ALL:
      //   statKey = 'totalCount'
      //   break
      case MessageType.COMMENT:
        statKey = 'commentCount'
        break
      case MessageType.FAVOR:
          statKey = 'favorCount'
          break
      case MessageType.COLLECTION:
        statKey = 'collectionCount'
        break
      case MessageType.FOLLOW:
          statKey = 'followCount'
          break
      case MessageType.NOTICE:
        statKey = 'sysCount'
        break
    }
    // const totalCount = Number(type) !== MessageType.ALL ? --this.messageStat.totalCount : this.messageStat.totalCount
    let totalCount =  this.messageStat.totalCount
    if (Number(type) !== MessageType.ALL) {
      totalCount -= (this.messageStat[statKey] || 0)
      totalCount = totalCount < 0 ? 0 : totalCount
    }
    this.messageStat = {
      ...toJS(this.messageStat),
      totalCount,
      [statKey]: 0,
    }
  }

  @action.bound
  async fetchMessages(option) {
    try {
      this.messagesData.isLoading = true
      const response = await messageApi.queryMessages(option)
      this.messagesData.isLoading = false
      if (response.success) {
        const data = response.data || {}
        this.setMessageStatView(option.type)
        this.messagesData = {
          list: data.data || [],
          total: data.total_count || 0,
          page: option.page || 1,
          size: option.size || 10,
          type: option.type || 0,
          isLoaded: true,
        }
      } else {
        message.error(response.data.msg)
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }
  
  @action.bound
  async fetchMessageStat(option) {
    try {
      const response = await messageApi.queryMessageStat(option)
      if (response.success) {
        this.messageStat = response.data || {}
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
      const response = await commentApi.addComment(option)
      if (response.success) {
        const data = response.data || {}
        let newComment = {
          type: option.type,
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
            nickname: data.userNickname || data.nickname || nickname,
          }
        } else {
          newComment.id = data
        }
        
        this.appendComment(newComment, option)
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
      const response = await commentApi.deleteComment(option)
      if (response.success) {
          this.removeComment(option.comment_id)
      } else {
        message.error(response.data.msg)
      }
    } catch (error) {
      
    }
  }

}


export default new MessageStore()