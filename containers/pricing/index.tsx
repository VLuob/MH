import { Component } from 'react'
import qs from 'qs'
import { observer, inject } from 'mobx-react'
import { Radio, Button, Select, Avatar, Icon, Checkbox, InputNumber, message, Modal } from 'antd'
import { toJS } from 'mobx'
import moment from 'moment'
import md5 from 'md5'
import jsCookie from 'js-cookie'

import UserIdentityComp from '@components/widget/common/UserIdentityComp'
import SelectAuthorModal from '@components/author/SelectAuthorModal'
import CustomIcon from '@components/widget/common/Icon'
import VersionSectoin from './VersionSection'
import IncreaseSection from './IncreaseSection'
import { Router } from '@routes'
import { EditionScope, EditionType, AddedServiceType, AuthorType, PayType, OrderStatus } from '@base/enums'
import { orderApi, payApi } from '@api'
import { config } from '@utils'
import sysOrder from '@base/system/order'

import AddedPaySelect from './AddedPaySelect'
import PayWaySelect from './PayWaySelect'
import PayUnitInput from './PayUnitInput'
import WxpayQrcode from './WxpayQrcode'
import './index.less'

const { Option } = Select

// const serviceDatas = [
//   {id: AddedServiceType.HOME_PAGE, name: '独立作品官网', price: 2000, desc: ['去除梅花网品牌信息', '可使用独立域名', '标准版1个模板，高级版5个模板'] },
//   {id: AddedServiceType.MINI_APP, name: '独立作品库小程序', price: 5000, desc: ['去除梅花网品牌信息','  一键制作作品库小程序', '授权绑定客户独立公司信息'] },
//   {id: AddedServiceType.UPLOAD_EXTEND, name: '支持4K高清视频上传', price: 2000, desc: ['支持最高4K高清画质视频上传和播放'] },
//   {id: AddedServiceType.SHOTS_EXTEND, name: '独立作品官网', price: 2000, desc: ['公开发布作品数量库容100条'] },
// ]

// const editionDatas = [
//   {id: EditionType.FREE, name: '免费版', price: 0,},
//   {id: EditionType.STANDARD, name: '标准版', price: 4800, prePrice: 2800}, //个人创作者 标准版使用优惠价2800
//   {id: EditionType.ADVANCED, name: '高级版', price: 7800,},
// ]

const editionDatas = sysOrder.filters.editionDatas
const serviceDatas = sysOrder.filters.serviceDatas
const editionMap = sysOrder.filters.editionMap
const serviceMap = sysOrder.filters.serviceMap

const allAddeds = [AddedServiceType.HOME_PAGE, AddedServiceType.MINI_APP, AddedServiceType.UPLOAD_EXTEND, AddedServiceType.SHOTS_EXTEND]
const onlyStandardAddeds = [AddedServiceType.UPLOAD_EXTEND, AddedServiceType.SHOTS_EXTEND]
const standardAndAdvancedAddeds = [AddedServiceType.HOME_PAGE, AddedServiceType.MINI_APP]

@inject(stores => {
  const { orderStore } = stores.store
  const { authors } = orderStore
  return {
    orderStore,
    authors,
  }
})
@observer
export default class PricingContainer extends Component {
  orderExtendDescription = ''

  state = {
    // 定价模式 1 版本套餐，2 增值功能
    pricingScope: EditionScope.EDITION_PACKAGE,
    version: 0,
    addedTypes: [],

    submitLoading: false,
    showPayContent: false,

    authorId: 0,
    authorItem: null,
    payWay: PayType.ALIPAY,
    payUnit: 1,

    wxpayVisible: false,
    wxpayQrcode: '',
    wxpayLoading: false,
    wxpayTradeNo: '',

    addedContents: [...serviceDatas],

    computedPrice: {
      "service_workextend": 0,
      "service_miniapp": 0,
      "advanced": 0,
      "service_homepage": 0,
      "service_uploadextend": 0,
    },
    expireTime: 0,

    selectAuthorVisible: false,
  }

  checkStatusTimer = null

  componentDidMount() {
    this.initData()
    // this.requestAuthors()
  }
  
  initData() {
    const { query } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const pricingScope = Number(query.scope)
    const edition = Number(query.v)
    const authorId = query.aid
    const addedTypes = query.added ? query.added.split(',').map(v => Number(v)) : []

    if (!token && (edition || query.added)) {
      Router.pushRoute(`/signin?c=${encodeURIComponent(`/pricing?${qs.stringify(query)}`)}`)
      return
    }
    
    this.setState({
      pricingScope: pricingScope || EditionScope.EDITION_PACKAGE,
      edition: edition || 0,
      addedTypes,
      authorId,
      showPayContent: !!edition || !!query.added,
    })

    if (edition || query.added) {
      this.requestAuthors()
    }

  }  
  
  async requestAuthors(cb) {
    const { orderStore, query, authors: allAuthros } = this.props
    if (allAuthros.length > 0) {
      return
    }

    let authorId = query.aid
    const res = await orderStore.fetchAuthors()
    if (cb) cb(res)

    if (res.success) {
      const authors = res.data || []

      // 无创作者的用户，跳转到创建创作者页面
      if (authors.length === 0) {
        window.open('/creator')
        return
      }

      let authorItem
      if (authorId) {
        authorItem = authors.find(item => item.id === authorId)
      } else {
        authorItem = authors[0]
        authorId = authorItem ? authorItem.id : ''
      }
      const { pricingScope } = this.state
      const nextStatus = {authorItem, authorId}
      if (pricingScope === EditionScope.EDITION_PACKAGE) {
        const extraService = (authorItem || {}).extraService || []
        // const addedTypes = pricingScope === EditionScope.EDITION_PACKAGE ? extraService.map(item => item.editionType) : []
        const addedTypes = extraService.map(item => item.editionType)
        nextStatus.addedTypes = addedTypes
      }
      this.setState(nextStatus, () => {
        this.requestFee()
      })
    }
  }

  requestFee() {
    const { edition, addedTypes, payUnit, authorId } = this.state
    orderApi.computedFee({
      authorId,
      editionType: edition,
      serviceTypes: addedTypes.join(','),
      term: payUnit,
    }).then(res => {
      if (res.success) {
        const data = res.data || {}
        this.setState({
          computedPrice: data.edition || {},
          expireTime: data.expireTime,
        })
      }
    })
  }

  async createOrderExtendDescription() {
    const { edition, payUnit, authorId, addedTypes } = this.state
    const { totalMoney } = this.getSelectObjects()
    const serviceType = addedTypes.join(',')
    const param = {
      authorId, 
      editionType: edition, 
      unit: payUnit, 
      serviceType, 
      totalFee: totalMoney,
    }
    const response = await orderApi.createOrderId(param)
    if (!response.success) {
      message.error(response.data.msg)
    }
    return response
  }

  handlePricingScope = (e) => {
    const { query } = this.props
    const pricingScope = e.target.value
    this.setState({pricingScope, addedTypes: []})
    const param = {
      ...query,
      scope: pricingScope,
    }
    Router.pushRoute(`/pricing?${qs.stringify(param)}`)

    const { authorItem } = this.state
    if (pricingScope === EditionScope.EDITION_PACKAGE) {
      const extraService = (authorItem || {}).extraService || []
      const addedTypes = extraService.map(item => item.editionType)
      this.setState({addedTypes}, () => {
        this.requestFee()
      })
    } else {
      // this.setState({showPayContent: false})
    }
  }

  handleEditionChange = (edition) => {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const { query } = this.props
    const param = {
      ...query,
      v: edition,
    }
    if (!token) {
      Router.pushRoute(`/signin?c=${encodeURIComponent(`/pricing?${qs.stringify(param)}`)}`)
      return
    }
    this.requestAuthors()
    this.setState({edition, addedTypes: [], showPayContent: true, payWay: PayType.ALIPAY})
    Router.pushRoute(`/pricing?${qs.stringify(param)}#form`)
  }

  handleAddedChange = (addedType) => {
    const { addedTypes } = this.state
    const { query } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (!addedTypes.includes(addedType)) {
      // addedTypes.push(addedType)
      const addeds = [...addedTypes, addedType]
      const param = {
        ...query,
        added: addeds.join(','),
      }
      if (!token) {
        Router.pushRoute(`/signin?c=${encodeURIComponent(`/pricing?${qs.stringify(param)}`)}`)
        return
      }

      if (!this.checkSelectTip(addedType)) {
        return
      }

      this.requestAuthors()
      this.setState({addedTypes: addeds, showPayContent: true, payWay: PayType.ALIPAY})
      Router.pushRoute(`/pricing?${qs.stringify(param)}#form`)
    }
  }

  checkSelectTip = (addedType) => {
    const { pricingScope, authorItem, addedTypes, showPayContent } = this.state
    const authorEdition = (authorItem || {}).edition || {}
    const authorEditionType = authorEdition.editionType || EditionType.FREE
    let isOk = true
    if (!showPayContent) {
      return true
    }
    if (pricingScope === EditionScope.ADDED_SERVICE) {
      if (authorEditionType === EditionType.FREE) {
        let msg = ''
        let nextEdition 
        if (onlyStandardAddeds.includes(addedType)) {
          msg = '很抱歉，该增值功能服务仅标准版创作者可以购买，请先升级版本套餐'
          nextEdition = EditionType.STANDARD
        } else {
          msg = '抱歉，该增值功能服务仅标准版、高级版创作者可以购买，请先升级版本套餐'
          nextEdition = EditionType.ADVANCED
        }
        isOk = false
        Modal.confirm({
          icon: 'info-circle',
          title: msg,
          cancelText: '取消',
          okText: '升级版本',
          onOk: () => {
            this.handleAddedChangeEdition(nextEdition)
          }
        })
      } else if (authorEditionType === EditionType.ADVANCED) {
        if (onlyStandardAddeds.includes(addedType)) {
          isOk = false
          let msg = '很抱歉，该增值功能服务高级版已享有，不必重复购买'
          let nextEdition = EditionType.ADVANCED
          Modal.confirm({
            icon: 'info-circle',
            title: msg,
            cancelText: '取消',
            okText: '查看权益',
            onOk: () => {
              if (typeof window !== undefined) {
                window.scrollTo(0, 0)
              }
              this.handleAddedChangeEdition(nextEdition)
            }
          })
        }
      }
    }
    return isOk
  }

  handleAuthorSelect = (authorId, option) => {
    const { pricingScope } = this.state
    const authorItem = option.props.item
    const extraService = (authorItem || {}).extraService || []
    const addedTypes = extraService.map(item => item.editionType)
    const nextState = {authorId, authorItem}
    if (pricingScope === EditionScope.EDITION_PACKAGE) {
      nextState.addedTypes = addedTypes
    }
    this.setState(nextState, () => {
      this.requestFee()
    })
  }

  handleAddedChangeEdition = (edition) => {
    const { query } = this.props
    const scope = EditionScope.EDITION_PACKAGE
    this.setState({edition, pricingScope: scope, showPayContent: true,})
    const param = {
      ...query,
      scope,
      v: edition,
    }
    Router.pushRoute(`/pricing?${qs.stringify(param)}`)
  }

  handleAddedPaySelect = (addedTypes) => {
    this.setState({addedTypes}, () => {
      this.requestFee()
    })
  }

  handlePayWayChange = (payWay) => {
    this.setState({payWay})
  }

  handleUnitChange = (v) => {
    this.setState({payUnit: v}, () => {
      this.requestFee()
    })
  }

  handleSubmitClick = () => {
    if (!this.checkPay()) {
      return
    }
    this.submitPay()
  }

  checkPay() {
    const { pricingScope, edition, authorItem, payUnit, payWay, addedTypes, authorId } = this.state
    if (!authorId) {
      message.error('请选择创作者')
      return false
    } 
    const authorEdition = authorItem.edition || {}
    if (pricingScope === EditionScope.ADDED_SERVICE) {
      const authorEdition = (authorItem || {}).edition || {}
      const authorEditionType = authorEdition.editionType || EditionType.FREE

      if (addedTypes.length === 0) {
        message.error('请选择增值功能')
        return false
      }

      if (authorEditionType === EditionType.FREE) {
        let msg = ''
        let nextEdition 
          msg = '很抱歉，免费版创作者不可单独购买增值功能，请先升级版本套餐'
          nextEdition = EditionType.STANDARD
        
        Modal.confirm({
          icon: 'info-circle',
          title: msg,
          cancelText: '取消',
          okText: '升级版本',
          onOk: () => {
            this.handleAddedChangeEdition(nextEdition)
          }
        })
        return false
      } else if (authorEditionType === EditionType.ADVANCED) {
        let msg = ''
        let isModal = false
        if (addedTypes.includes(AddedServiceType.UPLOAD_EXTEND)) {
          msg = '很抱歉，高级版创作者已享有“支持4K高清视频上传”增值功能，不必重复购买'
          isModal = true
        } else if (addedTypes.includes(AddedServiceType.SHOTS_EXTEND)) {
          msg = '很抱歉，高级版创作者已享有“公开作品量扩容100条”增值功能，不必重复购买'
          isModal = true
        }
        if (isModal) {
          let nextEdition = EditionType.ADVANCED
          Modal.confirm({
            icon: 'info-circle',
            title: msg,
            cancelText: '取消',
            okText: '查看权益',
            onOk: () => {
              this.handleAddedChangeEdition(nextEdition)
              if (typeof window !== undefined) {
                setTimeout(() => {
                  window.scrollTo(0, 0)
                }, 500)
              }
            }
          })
          return false
        }
        
      }
      
    }
    // 高级版创作者购买标准版套餐
    // if (pricingScope === EditionScope.EDITION_PACKAGE && edition === EditionType.STANDARD && authorEdition.editionType === EditionType.ADVANCED) {
    //   Modal.confirm({
    //     title: '很抱歉，您的套餐类型是高级版，不可购买标准版，请选择高级版或联系销售顾问',
    //     cancelText: '取消',
    //     okText: '查看权益',
    //     onOk: () => {
    //       setTimeout(() => {
    //         window.scrollTo(0, 0)
    //       })
    //     }
    //   })
    //   return false
    // }
    if (pricingScope === EditionScope.EDITION_PACKAGE) {
      // 高级版创作者购买标准版套餐
      if (edition === EditionType.STANDARD && authorEdition.editionType === EditionType.ADVANCED) {
        Modal.confirm({
          title: '很抱歉，您的套餐类型是高级版，不可购买标准版，请选择高级版或联系销售顾问',
          cancelText: '取消',
          okText: '查看权益',
          onOk: () => {
            setTimeout(() => {
              window.scrollTo(0, 0)
            })
          }
        })
        return false
      }

      if (!payUnit) {
        message.error('请填写购买年限')
        return false
      }
    }
    if (!payWay) {
      message.error('请选择支付方式')
      return false
    }

    return true
  }

  arrangeFields() {
    const { pricingScope, edition, payUnit, payWay, addedTypes, authorId } = this.state
    const {currentEditionItem, selectAddeds, totalMoney} = this.getSelectObjects()
    const extendData = this.orderExtendDescription
    const scopeParam = {
      a: authorId,
      s: addedTypes.join(','),
      u: payUnit,
      v: pricingScope === EditionScope.EDITION_PACKAGE ? edition : undefined,
    }
    let param = {
      totalFee: totalMoney,
      extendId: authorId,
      extendDescription: JSON.stringify(extendData),
      // scope: `&v=${edition}&a=${authorId}&s=${addedTypes.join(',')}&u=${payUnit}`,
      scope: qs.stringify(scopeParam),
      tradeName: '',
    }
    const serviceNames = addedTypes.map(v => serviceMap[v])
    if (pricingScope === EditionScope.EDITION_PACKAGE) {
      const labels = [currentEditionItem.name, ...serviceNames]
      param.tradeName = `梅花网版本订单-${labels.join(' + ')}`
      param.description = ''
    } else {
      param.tradeName = `梅花网增值服务订单-${serviceNames.join(' + ')}`
      param.description = ''
    }
    return param
  }

  async submitPay() {
    const res = await this.createOrderExtendDescription()
    if (res.success) {
      const { payWay } = this.state
      this.orderExtendDescription = res.data 

      if (payWay === PayType.ALIPAY) {
        this.handleAlipay()
      } else if (payWay === PayType.WXPAY) {
        this.handleWxpay()
      } else {
        this.handleUnionpay()
      }

    }
  }

  handleAlipay = () => {
    const fields = this.arrangeFields()
    fields.scope = fields.scope + '&p=' + PayType.ALIPAY
    const params = {
      ...fields,
      callback_url: config.CURRENT_DOMAIN + '/pricing/pay/result',
      // sign 是 tradeName + totalFee + scope 的md5加密，
      sign: md5(fields.tradeName + parseFloat(fields.totalFee).toFixed(2) + fields.scope + 'meihua8888'),
    }
    // console.log(fields.tradeName + parseFloat(fields.totalFee).toFixed(2) + fields.scope + 'meihua8888')
    payApi.alipay(params)
  }

   handleUnionpay = async () => {
    const fields = this.arrangeFields()
    fields.scope = fields.scope + '&p=' + PayType.BANKPAY
    this.setState({submitLoading: true})
    const response = await payApi.unionpay(fields)
    this.setState({submitLoading: false})
    if (response.success) {
      // Router.pushRoute(`/pricing/pay/result?${fields.scope}`)
      const resData = response.data || {}
      window.location.href = `/pricing/pay/result?tradeNo=${resData.tradeNo}&${fields.scope}`
    } else {
      message.error('生成订单错误，请重试')
    }
  }

  handleWxpay = async () => {
    const fields = this.arrangeFields()
    fields.scope = fields.scope + '&p=' + PayType.WXPAY
    this.setState({submitLoading: true})
    const response = await payApi.wxpay(fields)
    this.setState({submitLoading: false})
    if (response.success) {
      const wxpayData = response.data || {}
      this.setState({
        wxpayVisible: true,
        wxpayQrcode: wxpayData.qr_code_url,
        wxpayTradeNo: wxpayData.trade_id,
      }, () => {
        this.handleCheckWxpayStatus()
      })
    } else {
      message.error('支付发生错误，请重试')
    }
  }

  handleWxpayCancel = () => {
    this.handleCancelWxpayStatus()
    Modal.confirm({
      title: '订单尚未支付成功，您是否确认取消支付？',
      cancelText: '确认取消',
      okText: '继续支付',
      onCancel: () => {
        this.setState({wxpayVisible: false})
      },
      onOk: () => {
        this.handleCheckWxpayStatus()
      }
    })
  }

  handleCheckWxpayStatus = () => {
    this.checkStatusTimer = setInterval(() => {
     this.checkWxpayStatus()
    }, 1000)
  }
  handleCancelWxpayStatus = () => {
    if (this.checkStatusTimer) {
      clearInterval(this.checkStatusTimer)
    }
  }

  checkWxpayStatus = async () => {
    const { wxpayTradeNo } = this.state
    const response = await payApi.checkWxpayStatus({tradeNo: wxpayTradeNo})
    if (response.success) {
      const resData = response.data || {}
      if (resData.order_status === OrderStatus.PAID) {
        this.handleCancelWxpayStatus()
        message.error('支付成功，正在跳转...')
        window.location.href = `/pricing/pay/result${resData.callback_url}`
      }
    } 
  }

  handleShotsWebsite = (e) => {
    const { authors: allAuthors, query } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const param = {
      ...query,
    }
    if (!token) {
      Router.pushRoute(`/signin?c=${encodeURIComponent(`/pricing?${qs.stringify(param)}`)}`)
      return
    }
    
    if (allAuthors.length > 0) {
      this.handleSelectAuthorVisible(true)
    } else {
      this.requestAuthors(res => {
        if (res.success) {
          const authors = res.data || []
          if (authors.length > 0) {
            this.handleSelectAuthorVisible(true)
          }
        }
      })
    }
  }

  handleSelectAuthorVisible = (flag) => {
    this.setState({selectAuthorVisible: !!flag})
  }

  handleSelectAuthorConfirm = (authorItem) => {
    const authorId = (authorItem || {}).id
    if (authorId) {
      window.open(`/theme/author/${authorId}`)
    }
  }

  getSelectAddeds() {
    const { addedTypes, computedPrice, payUnit, pricingScope } = this.state
    const unit = pricingScope === EditionScope.ADDED_SERVICE ? 1 : payUnit
    return serviceDatas.filter(item => addedTypes.includes(item.id)).map(item => {
      // switch(item.id) {
      //   case AddedServiceType.HOME_PAGE:
      //     item.money = computedPrice.service_homepage || item.price * unit
      //     break
      //   case AddedServiceType.MINI_APP:
      //     item.money = computedPrice.service_miniapp || item.price * unit
      //     break
      //   case AddedServiceType.UPLOAD_EXTEND:
      //     item.money = computedPrice.service_uploadextend || item.price * unit
      //     break
      //   case AddedServiceType.SHOTS_EXTEND:
      //     item.money = computedPrice.service_workextend || item.price * unit
      //     break
      // }
      switch(item.id) {
        case AddedServiceType.HOME_PAGE:
          item.money = item.price * unit
          break
        case AddedServiceType.MINI_APP:
          item.money = item.price * unit
          break
        case AddedServiceType.UPLOAD_EXTEND:
          item.money = item.price * unit
          break
        case AddedServiceType.SHOTS_EXTEND:
          item.money = item.price * unit
          break
      }
      return item
    })
  }

  getSelectEdition() {
    const { edition, payUnit, authorItem } = this.state
    const editionItem = editionDatas.find(item => item.id === edition) || editionDatas[1]
    // 个人创作者 标准版 优惠价2800
    // const computedPrice = edition === EditionType.STANDARD && (authorItem || {}).type === AuthorType.PERSONAL ? editionItem.prePrice : editionItem.price
    const discount = editionItem.discount || 0
    const computedPrice = edition === EditionType.STANDARD && (authorItem || {}).type === AuthorType.PERSONAL ? editionItem.price - discount : editionItem.price
    editionItem.money = computedPrice * payUnit
    editionItem.originMoney = editionItem.price * payUnit
    editionItem.discountMoney = discount * payUnit
    return editionItem
  }

  getSelectObjects() {
    const { pricingScope, authorItem } = this.state
    const currentEditionItem = this.getSelectEdition()
    const selectAddeds = this.getSelectAddeds()
    let totalMoney = selectAddeds.reduce((sum, item) => {
      return sum += item.money
    },0)
    if (pricingScope === EditionScope.EDITION_PACKAGE) {
      totalMoney += currentEditionItem.money
    }
    return {currentEditionItem, selectAddeds, totalMoney}
  }

  render() {
    const { authors } = this.props
    const { 
      submitLoading,
      pricingScope, 
      addedContents, addedTypes, 
      payWay, payUnit, edition, showPayContent,
       expireTime, authorId, authorItem,
       selectAuthorVisible,
       wxpayVisible,
       wxpayQrcode,
       wxpayLoading,
       wxpayTradeNo,
    } = this.state
    const isEditionScope = pricingScope === EditionScope.EDITION_PACKAGE
    const isCurrentAdvancedEdition = edition === EditionType.ADVANCED
    const isCurrentStandardEdition = edition === EditionType.STANDARD
    const { currentEditionItem, selectAddeds, totalMoney } = this.getSelectObjects()
    const btnSubmitText = payWay === PayType.BANKPAY ? '提交订单' : '支付订单'

    // const selectAuthorItem = authorItem || {}
    const authorEdition = (authorItem || {}).edition || { editionType: EditionType.FREE}
    const isPersonalAuthor = (authorItem || {}).type === AuthorType.PERSONAL
    const hasEditionDiscount = isPersonalAuthor && isCurrentStandardEdition
    const payUnitText = isEditionScope && payUnit > 1 ? ` × ${payUnit}` : null


    return (
      <div className="pricing-body-bg">

        <div className="pricing-container">
          <div className="pricing-section-detail">
            <div className="pricing-detail-tabs">
              <Radio.Group value={pricingScope} onChange={this.handlePricingScope} buttonStyle="solid">
                <Radio.Button value={EditionScope.EDITION_PACKAGE}>版本套餐</Radio.Button>
                <Radio.Button value={EditionScope.ADDED_SERVICE}>增值功能</Radio.Button>
              </Radio.Group>
            </div>
            <div className="pricing-detail-content">
              {pricingScope === EditionScope.EDITION_PACKAGE && <VersionSectoin current={edition} onSelect={this.handleEditionChange} />}
              {pricingScope === EditionScope.ADDED_SERVICE && <IncreaseSection currentTypes={addedTypes} onSelect={this.handleAddedChange} onShotsWebsite={this.handleShotsWebsite} />}
            </div>

            {/* <div className="pricing-more-service">
            更多{pricingScope === 2 ? '增值功能权益' : '服务功能'}敬请期待
            </div> */}
          </div>
          {showPayContent && <div className="pricing-section-pay" id="form">
            <div className="pricing-pay-content">
              <div className="pricing-pay-item-wrapper">
                <div className="item-author-wrapper">
                  <div className="pricing-pay-item">
                    <div className="pricing-pay-item-label">选择创作者</div>
                    <div className="pricing-pay-item-content">
                      <Select
                        suffixIcon={<Icon type="caret-down" />}
                        showArrow
                        className="author-select pricing-author-select"
                        placeholder="请选择创作者"
                        value={authorId}
                        onSelect={this.handleAuthorSelect}
                      >{
                        authors.map((item, i) => {
                          const currentAuthorEdition = item.edition ||{editionType: EditionType.FREE}
                          
                          return (
                          <Option key={item.id} value={item.id} item={item} className="select-author-option" >
                            <div className="select-author-item">
                              <div className="item-avatar">
                                <Avatar icon="user" src={item.avatar} size={40} />
                              </div>
                              <div className="item-info">
                                <div className="nick">{item.nickname}</div>
                                <div className="domain"><UserIdentityComp currentType={item.type} editionType={currentAuthorEdition.editionType}  /> {item.name}</div>
                              </div>
                            </div>
                          </Option>
                        )})
                      }
                    </Select>
                    {authorItem && <div className="pricing-author-edition-info">
                      <span className="edition-type">套餐版本：{editionMap[authorEdition.editionType]}</span>
                      {authorEdition.editionType !== EditionType.FREE && <span className="edition-expire">到期时间：{`${moment(authorEdition.gmtExpire).format('YYYY-MM-DD')} 到期`}</span>}
                    </div>}
                    </div>
                  </div>
                </div>
                <div className="item-version-wrapper">
                  {isEditionScope && <div className="pricing-pay-item">
                    <div className="pricing-pay-item-label">选择版本套餐</div>
                    <div className="pricing-pay-item-content">
                    <div className="pay-item-version pay-item-select-box">
                      <span className="version-name">{currentEditionItem.name}</span>
                      <span className="version-money">{currentEditionItem.price}元/年</span>
                    </div>
                    {hasEditionDiscount && <div className="pricing-author-edition-info">
                      <span className="edition-type">个人类型创作者优惠价2800元/年</span>
                    </div>}
                    </div>
                  </div>}
                </div>
                <div className="item-time-wrapper">
                  {isEditionScope && <PayUnitInput value={payUnit} onChange={this.handleUnitChange} />}
                </div>
              </div>
              {
              // !(isEditionScope && isCurrentAdvancedEdition) 
              <AddedPaySelect
                addedContents={addedContents}
                value={addedTypes}
                isFull={isEditionScope}
                scope={pricingScope}
                edition={edition}
                author={authorItem}
                onChange={this.handleAddedPaySelect}
                onChangeEdition={this.handleAddedChangeEdition}
              />}
              {totalMoney > 0 && <div className="pricing-pay-summary">
                {isEditionScope &&
                <div className="pay-summary-item">
                  <span className="pay-summary-name">版本套餐：{currentEditionItem.name}{payUnitText}</span>
                  <span className="pay-summary-money">{currentEditionItem.originMoney}元</span>
                </div>}
                {hasEditionDiscount &&
                <div className="pay-summary-item">
                  <span className="pay-summary-name">个人类型创作者优惠{payUnitText}</span>
                  <span className="pay-summary-money">-{currentEditionItem.discountMoney}元</span>
                </div>}
                {selectAddeds.map(item => (<div className="pay-summary-item" key={item.id}>
                  <span className="pay-summary-name">{item.name}{payUnitText}</span>
                  <span className="pay-summary-money">{item.money}元</span>
                </div>))}
                <div className="pay-summary-item">
                  <span className="pay-summary-name">总计</span>
                  <span className="pay-summary-money">{totalMoney}元</span>
                </div>
              </div>}
              <PayWaySelect
                type={payWay}
                onChange={this.handlePayWayChange}
              />
            </div>
            <div className="pricting-pay-bottom">
                <div className="pricing-pay-bottom-item bottom-left">
                  {isEditionScope && <div className="pay-expire">购买后到期日期为 {expireTime ? moment(expireTime).format('YYYY 年 MM 月 DD 日') : '--'}</div>}
                  <div className="pay-desc">如需发票，请到个人中心-订单与套餐-购买记录，选择消费的订单申请</div>
                </div>
                <div className="pricing-pay-bottom-item bottom-right">
                  <span className="pay-total-label">订单金额：</span>
                  <span className="pay-total-money">{totalMoney}元</span>
                  <Button type="primary" onClick={this.handleSubmitClick} loading={submitLoading}>{btnSubmitText}</Button>
                </div>
            </div>
          </div>}
          <div className="pricing-section-contact">
            {/* <div className="pricing-contact-title">
              欢迎来电与我们沟通
            </div> */}
            <div className="pricing-contact-phone">
              <Icon type="phone" theme="filled" />400-800-4636
            </div>
            <div className="pricing-contact-btn">
              <Button type="primary" href="https://mingdao.com/form/4fea509732d6474d8704f0fdb4ba2e75" target="_blank">联系顾问</Button>
            </div>
          </div>
          
        </div>
        {selectAuthorVisible && <SelectAuthorModal
          visible={selectAuthorVisible}
          authorId={(authors[0] || {}).id}
          authors={authors}
          onCancel={e => this.handleSelectAuthorVisible(false)}
          onConfirm={this.handleSelectAuthorConfirm}
        />}
        {<WxpayQrcode 
          url={wxpayQrcode}
          loading={wxpayLoading}
          visible={wxpayVisible}
          onCancel={this.handleWxpayCancel}
        />}
      </div>
    )
  }
}