import { observable, action, computed, runInAction } from 'mobx'
import { message } from 'antd'
import jsCookie from 'js-cookie'
import basic from '@base/system/basic'
import { tagApi, compositionApi, homeApi } from '@api'
import { FavorTypes } from '@base/enums'
import { toJS } from 'mobx'
import { config } from '@utils'

const token = basic.token

export class TagStore {
  @observable batch: string
  @observable tagDetail: any
  @observable tagData: any

  constructor(initialData: any = {}) {
    this.batch = initialData.batch || ''
    this.tagDetail = initialData.tagDetail || { state: false }
    this.tagData = initialData.tagData || {
      list: [],
      total: 0,
      loading: false,
      end: true,
      state: false,
      terms: {
        term: {
          type: 2,
          tags: []
        },
        sort: [{
          key: 'gmtPublish',
          value: 'desc'
        }],
        recommended: false,
        page: 1,
        limit: 50,
      }
    }
  }

  @action.bound
  updateBatch(data) {
    this.batch = data
  }

  @action.bound
  @action changeTerms(terms) {
    runInAction(() => {
      const tagData = {
        ...toJS(this.tagData),
        terms: {
          ...toJS(this.tagData.terms),
          ...terms,
          term: {
            ...toJS(this.tagData.terms.term),
            ...toJS(terms.term)
          }
        }
      }

      this.tagData = tagData
    })
  }

  @action.bound
  updateTagDetail(data) {
    this.tagDetail = {
      ...toJS(this.tagDetail),
      ...data,
    }
  }

  @action.bound
  updateTagDatas(data) {
    this.tagData = data
  }

  @action.bound
  changeTagDatas(data) {
    if (this.tagData.terms && !data.host && this.tagData.terms.page <= 2) {
      this.updateBatch(data.batch)
      this.tagData && this.tagData.terms && delete this.tagData.terms.batch
    }

    const terms = this.tagData.terms || {}

    const page = data.page || 1
    const limit = data.limit || terms.limit
    const total = data.total

    this.tagData = {
      ...toJS(this.tagData),
      list: page > 1 ? [...toJS(this.tagData.list), ...data.list] : data.list,
      count: total || 0,
      end: Math.ceil(total / limit) <= page,
      terms: {
        ...toJS(this.tagData.terms),
        page,
        limit,
      },
      state: data.state
    }

    if (this.tagData.terms && this.tagData.terms.recommended && data.batch && data.host) {
      this.tagData && this.tagData.terms && (this.tagData.terms.batch = data.batch)
    } else if (this.tagData.terms && this.tagData.terms.recommended && !data.host) {
      this.tagData && this.tagData.terms && (this.tagData.terms.batch = this.batch)
    }
  }

  @action.bound
  changeFavor(data) {
    const list = this.tagData.list.map(l => {
      if (l.compositionId === data.id) {
        l.favored = Boolean(data.action)

        if (Boolean(data.action)) {
          l.favors += 1
        } else {
          l.favors -= 1
        }
      }

      return l
    })

    this.tagData = {
      ...toJS(this.tagData),
      ssr: false,
      state: true,
      list
    }
  }

  @action.bound
  changeFollowInfo(data) {
    this.tagFollowInfo = data
  }

  @action.bound
  async fetchGetClientTagDetail(option) {
    try {
      let params = { ...option }
      const result = await tagApi.getTagDetail(params)

      if (result.success) {
        this.updateTagDetail(result.data)
        this.tagDetail.state = true
      } else {
        this.tagDetail.state = false
      }
      return result

    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async fetchGetClientTagList({terms, ...option}) {
    try {
      let params = { ...option, terms: JSON.stringify(terms) }
      this.tagData.loading = true
      const response = await tagApi.getTagList(params)
      this.tagData.loading = false
      if (response.success) {
        const data = response.data || {}
        const newList = data.list || []
        const originList = this.tagData.list || []
        const total = data.total || 0
        const batch = data.batch || 0
        const end = Math.ceil(total / terms.limit) <= terms.page
        let list = terms.page > 1 ? [...originList, ...newList] : newList
        this.tagData = {
          list,
          total,
          batch,
          end,
          terms,
          loading: false,
        }
      }
      return response
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 标签页喜欢功能
  @action.bound
  async fetchActionFavors(option) {
    try {
      if (!token && !option.action) {
        message.destroy()
        message.error(`您已经喜欢过该作品`)

        return
      }

      const param = { ...option, type: FavorTypes.SHOTS }
      const result = await homeApi.actionFavor(param)

      if (result.success) {
        this.changeFavor(option)

        if (option.action) {
          message.destroy()
          message.success(`喜欢成功`)
        } else {
          message.destroy()
          message.success(`取消喜欢成功`)
        }
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      console.log(err)
    }
  }

  // 标签页关注功能
  @action.bound
  async fetchTagFollow(option) {
    try {
      let params = { ...option, /*client_code*/ }

      if (!token) {
        window.location.href = `/signin?c=${window.location.pathname}`
        return
      }

      const result = await tagApi.tagFollow(option)

      if (result.success) {
        message.destroy()

        if (option.action) {
          message.success(`关注成功`)
        } else {
          message.success(`已取消关注`)
        }

        this.tagDetail = {
          ...toJS(this.tagDetail),
          followed: Boolean(option.action)
        }

      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      console.log(err)
    }
  }
}

export default new TagStore()