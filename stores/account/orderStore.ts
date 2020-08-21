import { observable, action, runInAction } from 'mobx'
import { message } from 'antd'
import { orderApi as api, compositionApi } from '@api'
import { OrderStatus } from '@base/enums'

export class OrderStore {
  @observable orderData: any
  @observable authors: Array<any>
  @observable payOrder: any
  @observable invoiceData: any

  constructor(initialData:any = {}) {
    this.orderData = initialData.orderData || {
      loading: false,
      editions: [],
      orders: [],
      totalInvoice: 0,
      totalConsure: 0,
    }
    this.authors = initialData.authors || []
    this.payOrder = initialData.payOrder || { 
      success: false, 
      data: {
        totalFee: 0,
        authorName: '',
        editionType: 2,
        serviceType: '',
        tradeNo: '',
        tradeType: 1,
        commitTime: 0,
        unit: null,
        editionId: null,
        serviceIds: null,
        authorId: null
      },
      error: {},
    }
    this.invoiceData = initialData.invoiceData || {
      loading: false,
      invoice: null,
    }
  }


  /**
   * 版本升级
   * @param option 
   */
  async upgrade(option) {
    try {
      const response = await api.upgrade(option)
      this.payOrder.success = response.success
      if (response.success) {
        this.payOrder.data = response.data || {}
      } else {
        this.payOrder.error = response.data || {}
      }
      return response
    } catch (error) {
      this.payOrder.success = false
      this.payOrder.error = {code: 'E100000', msg: ''}
      return this.payOrder
    }
  }

  /**
   * 获取订单与套餐列表
   * @param option 
   */
  async fetchOrders(option={}) {
    try {
      this.orderData.loading = true
      const response = await api.queryOrders(option)
      this.orderData.loading = false
      if (response.success) {
        const data = response.data || {}
        this.orderData.orders = data.trade || []
        this.orderData.editions = data.edition || []
        this.orderData.totalInvoice = data.totalInvoice || 0
        this.orderData.totalConsure = data.totalConsure || 0
      } else {
        message.error(response.data.msg)
      }
      return response
    } catch (error) {
      
    }
  }

  @action.bound
  async fetchAuthors(option={}) {
    try {
      const response = await compositionApi.queryAuthors(option)
      if (response.success) {
        this.authors = response.data || []
      } 
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async cancelOrder(option={}) {
    try {
      const response = await api.cancelOrder(option)
      if (response.success) {
        const orders = this.orderData.orders || []
        this.orderData.orders = orders.map(item => {
          if (option.tradeId === item.id) {
            item.status = OrderStatus.CANCELLED
          }
          return item
        })
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async fetchInvoice(option) {
    try {
      this.invoiceData.loading = true
      const response = await api.queryInvoice(option)
      this.invoiceData.loading = false
      if (response.success) {
        this.invoiceData.invoice = response.data || {}
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  @action.bound
  async setInvoice(option) {
    try {
      this.invoiceData.loading = true
      const response = await api.setInvoice(option)
      this.invoiceData.loading = false
      if (response.success) {
        this.invoiceData.invoice = response.data || {}
      }
      return response
    } catch (error) {
      
    }
  }

  @action.bound
  async applyInvoice(option) {
    try {
      const response = await api.applyInvoice(option)
      return response
    } catch (error) {
      return {success: false, data: {msg: '发票申请失败'}}
    }
  }

  @action.bound
  async savePaymentVoucher(option) {
    try {
      const response = await api.savePaymentVoucher(option)
      if (response.success) {
        const orders = (this.orderData.orders || []).map(item => {
          if (item.id === option.tradeId) {
            item.payVoucher = option.payVoucher
          }
          return item
        })
        this.orderData.orders = orders
      }
      return response
    } catch (error) {
      return {success: false, data: {msg: '提交失败'}}
    }
  }
}