import { observable, action, runInAction } from 'mobx'
import { message } from 'antd'
import { topApi as api, authorApi } from '@api'
import { ActionType } from '@base/enums'

export class TopStore {
  @observable topsData: object
  @observable topSchedules: Array

  constructor(initialData = {}) {
    this.topsData = initialData.topsData || {
      list: [],
      total: 0,
      isLastPage: false,
      isLoading: false,
      terms: {
        page: 1,
        limit: 50,
      }
    }
    this.topSchedules = initialData.topSchedules || []
  }

  @action setTopData(data, option) {
    const list = data.list || []
    const total = data.total || 0
    const page = option.page || 1
    const limit = option.limit || this.topsData.terms.limit
    this.topsData = {
      list,
      total,
      isLastPage: Math.ceil(total / limit) <= page,
      terms: {
        page,
        limit,
      }
    }
  }


  @action setTopSchedules(data) {
    this.topSchedules = data || []
  }

  @action setTopFollow(option) {
    const list = (this.topsData.list || []).map((item: any) => {
      if (item.author.id === option.id) {
        item.author.followed = !!option.action
      }
      return item
    })
    this.topsData.list = list
  }

  @action.bound
  async fetchTops(option) {
    try {
      this.topsData.isLoading = true
      const response = await api.queryTops(option)
      this.topsData.isLoading = false
      if(response.success) {
        const data = response.data || {}
        this.setTopData(data, option)
      }
      return response
    } catch (err) {
        // console.log(err)
        return { success: false, data: {}}
    }
  }

  @action.bound
  async fetchTotalTopAuthors(option) {
    try {
      this.topsData.isLoading = true
      const response = await api.queryTotalTopAuthors(option)
      this.topsData.isLoading = false
      if (response.success) {
        const list = response.data || []
        this.setTopData({list}, option)
      }
      return response
    } catch (error) {
      return {success: false, data: {}}
    }
  }

  @action.bound
  async fetchTopSchedules(option) {
    try {
      const response = await api.queryTopSchedules(option)
      if (option.host) {
        return new Promise((resolve, reject) => {
          if(response.success) {
            const data = response.data || {}
            this.setTopSchedules(data)
            resolve(response.data || {})
          } else {
            reject(response.data.msg)
          }
        })
      } else {
        if(response.success) {
          const data = response.data || {}
          this.setTopSchedules(data)
        } else {
            message.error(response.data.msg)
        }
      }
    } catch (err) {
        return {success: false, data: {code: 'E100000'}}
    }
  }

  // 关注主页侧边作者
  @action.bound
  async fetchActionFollowAuthor(option) {
      try {
          const response = await authorApi.actionFollow(option)
          if(response.success) {
              message.destroy()
              if(Number(option.action) === ActionType.FOCUS) {
                  message.success(`已关注作者`)
              } else {
                  message.success(`已取消关注`)
              }
              this.setTopFollow(option)
          } else {
              message.error(response.data.msg)
          }
      } catch(err) {
        return {success: false, data: {code: 'E100000'}}
      }
  }

}

export default new TopStore()
