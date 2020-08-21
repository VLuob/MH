import { observable, action, runInAction } from 'mobx'
import { message } from 'antd'
import { statisticsApi } from '@api'
import { toJS } from 'mobx'

export class StatisticsStore {
  @observable statAdditions: object
  @observable statTrend: Array<any>
  @observable statDetail: Array<any>

  constructor(initialData = {}) {
    this.statAdditions = initialData.statAdditions || {}
    this.statTrend = initialData.statTrend || []
    this.statDetail = initialData.statDetail || {
      list: [],
      total: 0,
      page: 1,
      size: 20,
    }
  }

  @action.bound
  async fetchStatAdditions(option) {
    try {
      const response = await statisticsApi.queryStatisticsAdditions(option)
      if (response.success) {
        this.statAdditions = response.data || {}
      } else if (response.data.code === 'E100009') {
        message.destroy()
        message.error('您在无权限访问')
        location.href = '/'
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }
  @action.bound
  async fetchStatTrend(option) {
    try {
      const response = await statisticsApi.queryStatisticsTrend(option)
      if (response.success) {
        this.statTrend = response.data || {}
      } else if (response.data.code === 'E100009') {
        message.destroy()
        message.error('您在无权限访问')
        location.href = '/'
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }
  @action.bound
  async fetchStatDetail(option) {
    try {
      const response = await statisticsApi.queryStatisticsDetail(option)
      if (response.success) {
        const list = response.data ? (response.data.data || [])  : []
        this.statDetail = {
          ...toJS(this.statDetail),
          list,
          total: response.data.total_count || 0,
          page: option.page || 1,
          size: option.size || 20,
        }
      } else if (response.data.code === 'E100009') {
        message.destroy()
        message.error('您在无权限访问')
        location.href = '/'
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }
  

}


export default new StatisticsStore()