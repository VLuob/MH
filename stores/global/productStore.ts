import { observable, action, runInAction, toJS } from 'mobx'
import { message } from 'antd'
import { productApi } from '@api'

export class ProductStore {

  @observable productData: any = {}

  constructor(initialData: any = {}) {
    this.productData = initialData.productData || {list: [], loading: false}
  }

  @action setProductData(productData) {
    this.productData = {
      ...this.productData,
      ...productData,
    }
  }
 
  // 获取产品列表
  @action.bound
  async fetchProducts(option) {
    try {
      this.productData.loading = true
      const response = await productApi.queryProducts(option)
      this.productData.loading = false
      if(response.success) {
        const list = response.data || []
        this.setProductData({list})
      }
      return response.data
    } catch (err) {
      return {success: false, data: {}}
    }
  }

  @action.bound
  async actionProductClick(option) {
    try {
      return await productApi.actionProductClick(option)
    } catch (error) {
      return {success: false, data: {}}
    }
  }

}

export default new ProductStore()
