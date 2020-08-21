import { observable, action, runInAction } from 'mobx'
import { serviceApi, compositionApi, authorApi } from '@api'
import { toJS } from 'mobx'

export class ServiceStore {
  @observable serviceListData: any
  @observable serviceDetail: any
  @observable servicePreview: any
  @observable serviceEdit: any
  @observable serviceBrands: Array<any>
  @observable authorShotsData: any
  @observable serviceStatusData: any
  @observable serviceRecommendData: Array<any>
  @observable serviceViewHistoryData: Array<any>

  constructor(initialData: any = {}) {
    this.serviceListData = initialData.serviceListData || {
      list: [],
      total: 0,
      terms: {
        pageIndex: 1,
        pageSize: 20,
      },
      loading: false,
      end: false,
    }
    this.serviceDetail = initialData.serviceDetail || {}
    this.servicePreview = initialData.servicePreview || {}
    this.serviceEdit = initialData.serviceEdit || {}
    this.serviceBrands = initialData.serviceBrands || []
    this.authorShotsData = initialData.authorShotsData || {
      list: [],
      total: 0,
      terms: {
        page: 1,
        limit: 12,
      },
      loading: false,
      end: false,
    }
    this.serviceStatusData = initialData.serviceStatusData || {
      passed: 0,
      auditing: 0,
      refused: 0,
      draft: 0,
    }
    this.serviceRecommendData = initialData.serviceRecommendData || []
    this.serviceViewHistoryData = initialData.serviceViewHistoryData || []
  }

  @action.bound
  setServiceListData(data, option) {
    const originList = this.serviceListData.list || []
    const newList = data.dataSet || []
    const list = option.pageIndex > 1 ? [...originList, ...newList] : newList
    const total = data.totalQuantity || 0
    const pageIndex = option.pageIndex || 1
    const pageSize = option.pageSize || 10
    const end = Math.ceil(total / pageSize) <= pageIndex
    const terms = {
      ...option,
      pageIndex,
      pageSize,
    }
    this.serviceListData = {list, total, terms, end, isLoad: true, loading: false} 
  }

  @action.bound
  changeServiceListTerms(option) {
    const total = this.serviceListData.total
    const terms = this.serviceListData.terms
    const newTerms = { ...terms, ...option }
    const pageIndex = newTerms.pageIndex 
    const pageSize = newTerms.pageSize 
    const end = Math.ceil(total / pageSize) <= pageIndex
    this.serviceListData.terms = newTerms
    this.serviceListData.end = end
  }

  @action.bound
  setAuthorShotsData(data, option) {
    const list = data.list || []
    const total = data.total || 0
    const page = option.page || 1
    const limit = option.limit || 10
    const end = Math.ceil(total / limit) <= page
    const terms = {
      ...option,
      page,
      limit,
    }
    this.authorShotsData = {list, total, terms, end, isLoad: true, loading: false} 
  }

  @action.bound
  setFollow(option) {
    this.serviceDetail.authorFollowed = !!option.action
  }

  @action.bound
  async fetchServices(option) {
    try {
      this.serviceListData.loading = true
      const response = await serviceApi.queryServices(option)
      this.serviceListData.loading = false
      if (response.success) {
        const data = response.data || {}
        this.setServiceListData(data, option)
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  /**
   * 询价详情
   * @param option 
   */
  @action.bound
  async fetchService(option) {
    try {
      const response = await serviceApi.queryService(option)
      if (response.success) {
        this.serviceDetail = response.data || {}
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }
  /**
   * 询价详情编辑内容
   * @param option 
   */
  @action.bound
  async fetchServiceEdit(option) {
    try {
      const response = await serviceApi.queryServiceEdit(option)
      if (response.success) {
        this.serviceEdit = response.data || {}
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }
  /**
   * 询价预览
   * @param option 
   */
  @action.bound
  async fetchServicePreview(option) {
    try {
      const response = await serviceApi.queryServicePreview(option)
      if (response.success) {
        this.servicePreview = response.data || {}
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async fetchServicePreviewCode(option) {
    try {
      const response = await serviceApi.queryServicePreviewCode(option)
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async addService(option) {
    try {
      const response = await serviceApi.addService(option)
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }
  @action.bound
  async editService(option) {
    try {
      const response = await serviceApi.editService(option)
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }
  @action.bound
  async deleteService(option) {
    try {
      const response = await serviceApi.deleteService(option)
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async fetchServiceBrands(option) {
    try {
      const response = await serviceApi.queryServiceBrands(option)
      if (response.success) {
        const brands = (response.data || []).map(item => ({...item, brandId: item.id}))
        this.serviceBrands = brands
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async fetchAuthorShots(option) {
    try {
      this.authorShotsData.loading = true
      const response = await compositionApi.queryCompositions({...option, terms: JSON.stringify(option.terms)})
      this.authorShotsData.loading = false
      if (response.success) {
        const data = response.data || []
        this.setAuthorShotsData(data, option.terms)
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async fetchServiceStatus(option) {
    try {
      const response = await serviceApi.queryServiceStatus(option)
      if (response.success) {
        const data = response.data || {}
        this.serviceStatusData = {
          passed: Number(data.passedQuantity || 0),
          auditing: Number(data.auditQuantity || 0),
          refused: Number(data.rejectQuantity || 0),
          draft: Number(data.draftQuantity || 0),
        }
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async fetchRecommendServices(option) {
    try {
      const response = await serviceApi.queryRecommendServices(option)
      if (response.success) {
        const data = response.data || {}
        this.serviceRecommendData = data
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async fetchViewHistoryServices(option) {
    try {
      const response = await serviceApi.queryViewHistoryServices(option)
      if (response.success) {
        const data = response.data || {}
        this.serviceViewHistoryData = data
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

    // 关注主页侧边作者
    @action.bound
    async fetchFollowAuthor(option) {
        try {
            const response = await authorApi.actionFollow(option)
            if(response.success) {
                this.setFollow(option)
            } 
            return response
        } catch(err) {
          return {success: false, data: {code: 'E100000'}}
        }
    }
}

export default new ServiceStore()