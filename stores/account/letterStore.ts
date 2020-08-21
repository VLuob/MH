import { observable, action, runInAction } from 'mobx'
import { message } from 'antd'
import { letterApi } from '@api'
import { toJS } from 'mobx'
import jsCookie from 'js-cookie'
import { LetterStatus, LetterDetailType, LetterSources } from '@base/enums'
import { config } from '@utils'

import { initializeStore } from '@stores'

export class LetterStore {
  @observable letterData: any
  @observable letterDetail: Array<any>
  @observable letterUnreadData: any
  @observable publicEnquiryData: any
  @observable publicEnquiryStatusData: any
  @observable chatUi: any
  @observable chatData: any
  @observable enquiryUi: any
  @observable enquiryData: any
  @observable unreadEnquiryCount: number

  toggleTitleMessageTimer: any
  currentPageTitle: string

  constructor(initialData: any = {}) {
    this.letterData = initialData.letterData || {
      list: [],
      total: 0,
      page: 1,
      size: 10,
      isLoading: false,
      isLoaded: false,
    }
    this.letterDetail = initialData.letterDetail || []
    
    this.letterUnreadData = initialData.letterUnreadData || {
      list: [],
      total: 0,
      isLoading: false,
    }
    this.publicEnquiryData = initialData.publicEnquiryData || {
      list: [],
      total: 0,
      loading: false,
      end: false,
      terms: {
        pageIndex: 1,
        pageSize: 10,
      }
    }
    this.publicEnquiryStatusData = initialData.publicEnquiryStatusData || {
      auditing: 0,
      updateAuditing: 0,
      passed: 0,
      refused: 0,
    }
    this.chatUi = initialData.chatUi || {
      visible: false,
      detailLoading: false,
      sendLoading: false,
    }
    this.chatData = initialData.chatData || {}
    this.enquiryUi = initialData.enquiryUi || {
      visible: false,
      loading: false,
    }
    this.enquiryData = initialData.enquiryData || {}
    this.unreadEnquiryCount = initialData.unreadEnquiryCount || 0
  }

  @action.bound
  saveLetterData(data={}) {
    this.letterData = {
      ...toJS(this.letterData),
      ...data,
    }
  }

  @action.bound
  saveLetterDetail(data) {
    this.letterDetail = data || []
  }

  @action.bound
  saveLetterUnreadData(data:any ={}) {
    this.letterUnreadData = {
      ...toJS(this.letterUnreadData),
      list: data.enquiry || [],
      notices: data.notice || [],
      total: data.total_count,
    }
  }

  @action.bound
  savePublicEnquiryData(data, option) {
    const list = data.dataSet || []
    const total = data.totalQuantity || 0
    const pageIndex = option.pageIndex || 1
    const pageSize = option.pageSize || 10
    const end = Math.ceil(total / pageSize) <= pageIndex
    const terms = {
      ...option,
      pageIndex,
      pageSize,
    }
    this.publicEnquiryData = {list, total, terms, end, loading: false} 
  }

  @action.bound
  saveDeleteLetter(id) {
    const newList = this.letterData.list.filter(item => item.id !== id)
    this.letterData.list = newList
  }

  @action.bound
  changeChatUi(option) {
    this.chatUi = {
      ...toJS(this.chatUi),
      ...option,
    }
  }

  @action.bound
  changeChatData(data: object) {
    this.chatData = data || {}
  }

  @action.bound
  changeEnquiryUi(option) {
    this.enquiryUi = {
      ...toJS(this.enquiryUi),
      ...option,
    }
  }

  @action.bound
  changeEnquiryData(data) {
    this.enquiryData = data || {}
  }

  @action.bound
  appendLetterDetail(option) {
    const chatData = this.chatData
    const chatItem = {
      id: (new Date().getTime() + Math.floor((Math.random()*900)+100)),
      content: option.content,
      status: LetterStatus.AUDITING,
      senderAvatar: chatData.senderAvatar,
      sender: true,
      sourceId: chatData.sourceId
    }
    this.letterDetail = [...toJS(this.letterDetail), chatItem]
  }

  @action.bound
  filterUnreadLetter(id) {
    const list = this.letterUnreadData.list.filter(item => item.id !== id)
    this.letterUnreadData.list = toJS(list)
    this.letterUnreadData.total = list.length
  }

  @action.bound
  changeReadLetters(id) {
    const list = this.letterData.list.map(item => {
      if (item.id === id) {
        item.read = true
      }
      return toJS(item)
    })
    this.letterData.list = list
  }

  @action.bound
  readLetter(id) {
    // this.filterUnreadLetter(id)
    this.changeReadLetters(id)
  }

  @action.bound
  open(option: any={}) {
    // message.destroy()
    // message.warn('私信功能暂未开通')
    // return

    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if(!token) {
      window.location.href = `/signin?c=${window.location.pathname}`
      return
    }

    if (option.parentId) {
      this.fetchLetterDetail({
        id: option.parentId,
        authorId: option.authorId,
        // 区分系统群发消息和询价消息
        type: option.detailType || (option.source === LetterSources.SYSTEM_NOTICE ? LetterDetailType.NOTICE : LetterDetailType.ENQUIRY),
      })
    } else if (option.receiverId) {
      this.fetchLetterHistory({authorId: option.receiverId})
    }
    this.changeChatData(option)
    this.changeChatUi({visible: true});
  }

  @action.bound
  close() {
    this.changeChatData({})
    this.changeChatUi({visible: false})
  }

  @action.bound
  openEnquiry(option: any = {}) {
    // const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    // if(!token) {
    //   window.location.href = `/signin?c=${window.location.pathname}`
    //   return
    // }
    this.changeEnquiryData(option)
    this.changeEnquiryUi({visible: true})
  }

  @action.bound
  closeEnquiry() {
    this.changeEnquiryData({})
    this.changeEnquiryUi({visible: false})
  }

  @action.bound
  toggleTitleMessage() {
    if (typeof window === 'undefined') {
      return
    }
    const letterUnreadData = this.letterUnreadData
    this.currentPageTitle = this.currentPageTitle || document.title
    let isFlag = false
    if (this.toggleTitleMessageTimer) clearInterval(this.toggleTitleMessageTimer)
    this.toggleTitleMessageTimer = setInterval(() => {
      const hasNewMessage = letterUnreadData.total > 0
      let setTitle 
      if (hasNewMessage) {
        let msgTip
        if (!isFlag) {
          isFlag = true
          msgTip = `【新消息】`
        } else {
          isFlag = false
          msgTip = `【　　　】`
        }
        setTitle = msgTip + this.currentPageTitle
      } else {
        setTitle = this.currentPageTitle
        clearInterval(this.toggleTitleMessageTimer)
      }
      document.title = setTitle
    }, 1000)
  }


  @action.bound
  async fetchLetters(option) {
    try {
      this.letterData.isLoading = true
      const response = await letterApi.queryLetters(option)
      this.letterData.isLoading = false
      if (response.success) {
        const data = response.data
        this.saveLetterData({
          list: data.data || [],
          total: data.total_count,
          page: option.page || 1,
          size: option.size || 10,
          isLoaded: true,
        })
      }
    } catch (error) {
      
    }
  }

  @action.bound
  async fetchLetterDetail(option) {
    try {
      this.chatUi.detailLoading = true
      const response = await letterApi.queryLetterDetail(option)
      this.chatUi.detailLoading = false
      if (response.success) {
        const store = initializeStore()
        this.saveLetterDetail(response.data)
        this.readLetter(option.id)
        this.fetchUnreadLetters()
        if (option.type === LetterDetailType.NOTICE) {
          store.messageStore.fetchMessageStat()
        } else {
          this.fetchUnreadEnquiryCount()
        }
      }
    } catch (error) {
      
    }
  }
  
  @action.bound
  async fetchLetterHistory(option) {
    try {
      this.chatUi.detailLoading = true
      const response = await letterApi.queryLetterHistory(option)
      this.chatUi.detailLoading = false
      if (response.success) {
        this.saveLetterDetail(response.data)
        this.readLetter(option.id)
      }
    } catch (error) {
      
    }
  }


  @action.bound
  async fetchUnreadLetters() {
    try {
      this.letterUnreadData.isLoading = true
      const response = await letterApi.queryUnreadLetters()
      this.letterUnreadData.isLoading = false
      if (response.success) {
        this.saveLetterUnreadData(response.data)
        this.toggleTitleMessage()
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  /**
   * 用户中心获取公开询价列表
   * @param option 
   */
  @action.bound
  async fetchPublicEnquirys(option) {
    try {
      this.publicEnquiryData.loading = true
      const response = await letterApi.queryPublicEnquirys(option)
      this.publicEnquiryData.loading = false
      if (response.success) {
        const data = response.data || {}
        this.savePublicEnquiryData(data, option)
      }
      return response
    } catch (error) {
      return { success: false, data: {code: 'E100000'}}
    }
  }
  /**
   * 账户中心获取公开询价状态
   * @param option 
   */
  @action.bound
  async fetchPublicEnquiryStatus(option) {
    try {
      const response = await letterApi.queryPublicEnquiryStatus(option)
      if (response.success) {
        const data = response.data || {}
        this.publicEnquiryStatusData = {
          passed: data.passedQuantity || 0,
          auditing: data.auditQuantity || 0,
          refused: data.rejectQuantity || 0,
          updateAuditing: data.updateAuditQuantity || 0,
        }
      }
      return response
    } catch (error) {
      return { success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async sendLetter(option, callback) {
    try {
      this.chatUi.sendLoading = true
      const response = await letterApi.sendLetter(option)
      this.chatUi.sendLoading = false
      if (response.success) {
        this.appendLetterDetail(option)
      }
      if (callback) callback(response)
      return response
    } catch (error) {
      
    }
  }

  @action.bound
  async sendEnquiry(option) {
    try {
      this.enquiryUi.loading = true
      const response = await letterApi.sendLetter(option)
      this.enquiryUi.loading = false
      if (response.success) {
        message.destroy()
        message.success('发送成功')
        // this.closeEnquiry()
      } else {
        message.error(response.data.msg)
      }
      return response
    } catch (error) {
      return {success: false, data: {}}
    }
  }

  @action.bound
  async deleteLetter(option) {
    try {
      const response = await letterApi.deleteLetter(option)
      if (response.success) {
        this.saveDeleteLetter(option.id)
      } else {
        message.error(response.data.msg)
      }
    } catch (error) {
      
    }
  }

  @action.bound
  async shieldLetter(option, callback) {
    try {
      const response = await letterApi.shieldLetter(option)
      if (response.success) {
        message.success('屏蔽成功')
      } else {
        message.error(response.data.msg)
      }
      if (callback) callback(response)
    } catch (error) {
      
    }
  }

  @action.bound
  async accusationLetter(option, callback) {
    try {
      const response = await letterApi.accusationLetter(option)
      if (response.success) {
        message.success('举报成功')
      } else {
        message.error(response.data.msg)
      }
      if (callback) callback(response)
    } catch (error) {
      
    }
  }

  @action.bound
  async fetchUnreadEnquiryCount() {
    try {
      const response = await letterApi.queryUnreadEnquiryCount()
      if (response.success) {
        this.unreadEnquiryCount = response.data || 0
      }
      return response
    } catch (error) {
      return {success: false, data: {}}
    }
  }
}

export default new LetterStore()