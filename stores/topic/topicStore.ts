import { observable, action, runInAction, toJS } from 'mobx'
import { message } from 'antd'
import { topicApi as api, authorApi } from '@api'

import { FavorTypes, ActionType } from '@base/enums'

import basic from '@base/system/basic'

const token = basic.token

interface ITopicsData {
  list: Array<any>
  total: number
  isLastPage: boolean
  isLoading: boolean
  terms: object
}
interface ITopicClassificationData {
  list: Array<any>
  total: number
}

interface CompositionTopicData {
  list: Array<any>
  total: number
  title: string
  isEnd: boolean
  isLoad: boolean
  loading: boolean
  terms: any
}

// interface InitialData {
//   topicsData: ITopicsData
//   topicDetail: object
//   topicClassificationData: ITopicClassificationData
//   topicStatistics: object
//   compositionTopicData: CompositionTopicData
// }

export class TopicStore {

  @observable topicsData: ITopicsData
  @observable topicDetail: any
  @observable topicClassificationData: ITopicClassificationData
  @observable topicStatistics: any
  @observable compositionTopicData: CompositionTopicData

  constructor(initialData:any = {}) {
    this.topicsData = initialData.topicsData || {
      list: [],
      total: 0,
      isLastPage: false,
      isLoading: false,
      terms: {
        page: 1,
        limit: 20,
      }
    }
    this.topicDetail = initialData.topicDetail || {}
    this.topicClassificationData = initialData.topicClassificationData || {
      list: [],
      total: 0,
    }
    this.topicStatistics = initialData.topicStatistics || {}
    this.compositionTopicData = initialData.compositionTopicData || {
      list: [],
      total: 0,
      title: '',
      isEnd: false,
      isLoad: false,
      loading: false,
      terms: {
        pageIndex: 1,
        pageSize: 20,
      }
    }
  }


  @action setTopicData(data, option) {
    const oldList = this.topicsData.list || []
    const newList = data.data || []
    const list = option.page > 1 ? [...oldList, ...newList] : newList
    const total = data.total_count || 0
    const page = option.page || 1
    const size = option.size || 20
    this.topicsData = {
      list,
      total,
      isLastPage: Math.ceil(total / size) <= page,
      isLoading: false,
      terms: {
        ...option,
        page,
        size,
      }
    }
  }

  @action setTopicDetail(data) {
    this.topicDetail = data || {}
  }

  @action setTopicClassifications(data) {
    this.topicClassificationData = {
      list: data.data || [],
      total: data.total_count || 0,
    }
  }

  @action saveFavor(option) {
    const topicModuleList = this.topicDetail.cfmList || []
    topicModuleList.map(moduleItem => {
      const contentList = moduleItem.cpList || []
      contentList.map(contentItem => {
        if (option.id === contentItem.compositionId) {
          contentItem.favored = !!option.action
          if (option.action === ActionType.FOCUS) {
            contentItem.favors += 1
          } else {
            contentItem.favors -= 1
          }
        }
        return toJS(contentItem)
      })
      return toJS(moduleItem)
    })
    this.topicDetail.cfmList = toJS(topicModuleList)
  }

  @action setModuleContents(data, option) {
    const moduleList = this.topicDetail.cfmList || []
    const newModuleList = moduleList.map(item => {
      if (item.id === option.module_id) {
        item.cpList = data.data || []
        item.terms = {
          page: option.page || 1,
          size: option.size || 8,
        }
        item.isLoading = false
      }
      return item
    })

    this.topicDetail.cfmList = newModuleList
  }

  @action setTopicStatistics(data) {
    this.topicStatistics = data || {}
  }

  @action.bound
  async fetchTopics(option) {
    try {
      this.topicsData.isLoading = true
      const response = await api.queryTopics(option)
      this.topicsData.isLoading = false
      if(response.success) {
        const data = response.data || {}
        this.setTopicData(data, option)
      } 
      return response
    } catch (err) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async fetchTopic(option) {
    try {
      const response = await api.queryTopic(option)
      if(response.success) {
        const data = response.data || {}
        this.setTopicDetail(data)
      }
      return response
    } catch (err) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async fetchTopicClassifications(option) {
    try {
      const response = await api.queryTopicClassifications(option)
      if (response.success) {
        const data = response.data || {}
        this.setTopicClassifications(data);
      } 
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async fetchModuleContents(option, callback) {
    try {
      const response = await api.queryTopicModuleContents(option)
      if(response.success) {
        const data = response.data || {}
        this.setModuleContents(data, option)
      }
      if (callback) callback(response)
      return response.success ? (response.data || {}) : response
    } catch (err) {
        return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async fetchTopicStatistics(option) {
    try {
      const response = await api.queryTopicStatistics(option)
      if(response.success) {
        const data = response.data || {}
        this.setTopicStatistics(data)
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }


  @action.bound
  async fetchActionFavor(option) {
    try {
      if (!token && !option.action) {
          message.destroy()
          message.error(`您已经喜欢过该作品`)

          return
      }
      const param = { ...option, type: FavorTypes.SHOTS }
      const response = await authorApi.actionFavor(param)
      message.destroy()
      if (response.success) {
        this.saveFavor(option)
        if (option.action === ActionType.FOCUS) {
          message.success('喜欢成功')
        } else {
          message.success('已取消喜欢成功')
        }
      } else {
        message.error(response.data.msg)
      }
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async fetchCompositionTopics(option) {
    try {
      const response = await api.queryCompositionTopics(option)
      if (response.success) {
        const originList = this.compositionTopicData.list ||[]
        const newList = response.data.data || []
        const list = option.pageIndex > 1 ? [...originList, ...newList] : newList
        const pageIndex = option.pageIndex || 1
        const pageSize = option.pageSize || 40
        const title = response.data.title
        const total = response.data.total_count
        const isEnd = Math.ceil(total / pageSize) <= pageIndex
        delete option.host
        this.compositionTopicData = {
            loading: false,
            isLoad: true,
            isEnd,
            list,
            title,
            total,
            terms: {
                ...option,
                pageIndex,
                pageSize,
            },
        }
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }
}

export default new TopicStore()
