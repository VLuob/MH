import { observable, action, runInAction } from 'mobx'
import { enquiryApi } from '@api'
import { toJS } from 'mobx'

export class EnquiryStore {
  @observable enquiryListData: Array<any>
  @observable enquiryDetail: any
  @observable enquiryPreview: any
  @observable enquiryEdit: any
  @observable enquiryContact: any
  @observable enquiryRecommendData: any
  constructor(initialData: any = {}) {
    this.enquiryListData = initialData.enquiryListData || {
      list: [],
      total: 0,
      terms: {
        pageIndex: 1,
        pageSize: 10,
      },
      loading: false,
      end: false,
    }
    this.enquiryDetail = initialData.enquiryDetail || {}
    this.enquiryPreview = initialData.enquiryPreview || {}
    this.enquiryEdit = initialData.enquiryEdit || {}
    this.enquiryContact = initialData.enquiryContact || {}
    this.enquiryRecommendData = initialData.enquiryRecommendData || {
      list: [],
      total: 0,
      terms: {
        pageIndex: 1,
        pageSize: 10,
      },
      loading: false,
      end: false,
    }
  }

  @action.bound
  setEnquiryListData(data, option) {
    const originList = this.enquiryListData.list || []
    const newList = data.dataSet || []
    const list = option.pageIndex > 1 ? [...originList, ...newList] : newList
    const total = data.totalQuantity || 0
    const pageIndex = option.pageIndex || 1
    const pageSize = option.pageSize || 10
    const end = Math.ceil(total / pageSize) <= pageIndex
    const terms = {
      // ...toJS(this.enquiryListData.terms),
      ...option,
      pageIndex,
      pageSize,
    }
    this.enquiryListData = {list, total, terms, end, isLoad: true, loading: false} 
  }

  @action.bound
  changeEnquiryListTerms(option) {
    const total = this.enquiryListData.total
    const terms = this.enquiryListData.terms
    const newTerms = { ...terms, ...option }
    const pageIndex = newTerms.pageIndex 
    const pageSize = newTerms.pageSize 
    const end = Math.ceil(total / pageSize) <= pageIndex
    this.enquiryListData.terms = newTerms
    this.enquiryListData.end = end
  }

  @action.bound
  setEnquiryRecommendData(data, option) {
    const originList = this.enquiryRecommendData.list || []
    const newList = data.dataSet || []
    const list = option.pageIndex > 1 ? [...originList, ...newList] : newList
    const total = data.totalQuantity || 0
    const pageIndex = option.pageIndex || 1
    const pageSize = option.pageSize || 8
    const end = Math.ceil(total / pageSize) <= pageIndex
    const terms = {
      ...option,
      pageIndex,
      pageSize,
    }
    this.enquiryRecommendData = {list, total, terms, end, isLoad: true, loading: false} 
  }

  @action.bound
  setEnquiryEdit(data={}) {
    this.enquiryEdit = data
  }

  @action.bound
  async fetchEnquirys(option) {
    try {
      const response = await enquiryApi.queryEnquirys(option)
      if (response.success) {
        const data = response.data || {}
        this.setEnquiryListData(data, option)
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
  async fetchEnquiry(option) {
    try {
      const response = await enquiryApi.queryEnquiry(option)
      if (response.success) {
        this.enquiryDetail = response.data || {}
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
  async fetchEnquiryEdit(option) {
    try {
      const response = await enquiryApi.queryEnquiryEdit(option)
      if (response.success) {
        // this.enquiryEdit = response.data.data || {}
        this.setEnquiryEdit(response.data.data || {})
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
  async fetchEnquiryPreview(option) {
    try {
      const response = await enquiryApi.queryEnquiryPreview(option)
      if (response.success) {
        this.enquiryPreview = response.data || {}
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async fetchEnquiryPreviewCode(option) {
    try {
      const response = await enquiryApi.queryEnquiryPreviewCode(option)
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async addEnquiry(option) {
    try {
      const response = await enquiryApi.addEnquiry(option)
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }
  @action.bound
  async editEnquiry(option) {
    try {
      const response = await enquiryApi.editEnquiry(option)
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }
  @action.bound
  async deleteEnquiry(option) {
    try {
      const response = await enquiryApi.deleteEnquiry(option)
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async fetchEnquiryContact(option) {
    try {
      const response = await enquiryApi.queryEnquiryContact(option)
      if (response.success) {
        const contact = response.data || {}
        // if (this.enquiryContact.authorId !== option.authorId) {
        //   const contactViews = this.enquiryDetail.contactViews || 0
        //   this.enquiryDetail.contactViews = contactViews + 1
        // }
        this.enquiryContact = {...contact, authorId: option.authorId}
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async betchSendEnquiry(option) {
    try {
      const response = await enquiryApi.betchSendEnquiry(option)
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async fetchRecommendAuthors(option) {
    try {
      const response = await enquiryApi.queryRecommendAuthors(option)
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async fetchEnquiryChatId(option) {
    try {
      const response = await enquiryApi.queryEnquiryChatId(option)
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }
  
  @action.bound
  async fetchRecommendEnquirys(option) {
    try {
      const response = await enquiryApi.queryRecommendEnquirys(option)
      if (response.success) {
        const data = response.data || {}
        this.setEnquiryRecommendData(data, option)
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }
  
}

export default new EnquiryStore()