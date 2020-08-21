import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { parseCookies, destroyCookie } from 'nookies'
import moment from 'moment'

import HeadComponent from '@components/common/HeadComponent'
import { Icon, Button } from 'antd'
import { config } from '@utils'
import { PayType, EditionType, AddedServiceType } from '@base/enums'
import sysOrder from '@base/system/order'

import './PayCallback.less'

const payMap = {
    [PayType.ALIPAY]: '支付宝',
    [PayType.WXPAY]: '微信',
    [PayType.BANKPAY]: '银行电汇',
}

// const editionMap = {
//     [EditionType.FREE]: '免费版',
//     [EditionType.STANDARD]: '标准版',
//     [EditionType.ADVANCED]: '高级版',
//   }
  
// const addedMap = {
//     [AddedServiceType.HOME_PAGE]: '独立作品库官网',
//     [AddedServiceType.MINI_APP]: '独立作品库小程序',
//     [AddedServiceType.UPLOAD_EXTEND]: '支持4K高清视频上传',
//     [AddedServiceType.SHOTS_EXTEND]: '公开作品量扩容100条',
// }

const editionMap = sysOrder.filters.editionMap
const addedMap = sysOrder.filters.serviceMap

@inject(stores => {
    const { orderStore } = stores.store
    const { payOrder } = orderStore
    return {
        orderStore,
        payOrder,
    }
})
@observer
export default class PayCallback extends Component {
    static async getInitialProps(ctx) {
        const { req, query, asPath, mobxStore } = ctx
        const { orderStore } = mobxStore

        let datas:any = {}

        if (req && req.headers) {
            const host = req.headers.host
            const token = parseCookies(ctx, config.COOKIE_MEIHUA_TOKEN)[config.COOKIE_MEIHUA_TOKEN]
            
            const param: any = {
                host,
                token,
                tradeNo: query.tradeNo,
                authorId: query.a,
                mode: query.p,
                // editionType: query.v,
                // serviceTypes: query.s,
                // unit: query.u,
            }
            if (query.v) {
                param.editionType = query.v
            }
            if (query.s) {
                param.serviceTypes = query.s
            }
            if (query.u) {
                param.unit = query.u
            }
            // console.log('upgrade param', param)
            const result = await orderStore.upgrade(param)
            // console.log('upgrade result',result)
            datas.result = result
        }

         return {
            query,
            ...datas,
        }
    }

    render() {
        const { query, payOrder, ...rest } = this.props
        const isSuccess = payOrder.success
        const orderData = payOrder.data || {}
        const isBankPay = orderData.tradeType === PayType.BANKPAY
        let editionTypeLabel = ''
        const editionNames = []
        if (isSuccess) {
            if (orderData.editionType) {
                editionNames.push(editionMap[orderData.editionType])
            }
            if (orderData.serviceType) {
                orderData.serviceType.split(',').forEach(v => {
                    if (isNaN(Number(v))) {
                        editionNames.push(v)
                    } else {
                        editionNames.push(addedMap[Number(v)])
                    }
                })
            }
            editionTypeLabel = editionNames.join(' + ')
        }

        return (
            <>
                <HeadComponent
                    title={`版本定价 - 创意营销案例排行榜 - 营销作品宝库 - 梅花网`}
                />
                <div className="paycb-container">
                    {isSuccess && 
                    <div className="paycb-header">
                        <div className="paycb-title">
                            <span className="paycb-icon"><Icon type="check-circle" theme="filled" /></span>{isBankPay ? '恭喜您，订单提交成功，请尽快完成支付！' : '恭喜您，支付成功！'}
                        </div>    
                        {/* <div className="paycb-desc">{isBankPay ? '恭喜您订单提交成功,请尽快完成支付' : '恭喜你支付成功'}</div> */}
                    </div>}
                    {!isSuccess && 
                    <div className="paycb-header fail">
                        <div className="paycb-title">
                            <span className="paycb-icon"><Icon type="close-circle" theme="filled" /></span>{isBankPay ? '订单提交失败' : '支付失败'}
                        </div>    
                        <div className="paycb-desc">{payOrder.error.msg}</div>
                    </div>}

                    {isSuccess && 
                    <div className="paycb-content">
                        <div className="paycb-info">
                            <p className="paycb-info-item"><span className="label">升级创作者：</span>{orderData.authorName}</p>
                            <p className="paycb-info-item"><span className="label">订单类型：</span>{editionTypeLabel}</p>
                            <p className="paycb-info-item"><span className="label">支付金额：</span>{orderData.totalFee}元</p>
                            <p className="paycb-info-item"><span className="label">订单编号：</span>{orderData.tradeNo}</p>
                            <p className="paycb-info-item"><span className="label">支付类型：</span>{payMap[orderData.tradeType]}</p>
                            <p className="paycb-info-item"><span className="label">支付时间：</span>{moment(orderData.commitTime).format('YYYY-MM-DD HH:mm')}</p>
                        </div>
                        {isBankPay && 
                        <div className="paycb-bank-info">
                            <div className="bank-info-content">
                                <p>收款户名：上海梅花信息股份有限公司</p>
                                <p>收款开户行：招商银行上海分行天山支行</p>
                                <p>收款账 号：2149 8037 6210 001</p>
                            </div>
                            <div className="bank-info-desc">
                                <p>付款后请拍摄凭据发送到邮箱：shots@meihua.info</p>
                                <p>注明“开通梅花网作品标准版/高级版”并留下您的姓名和联系电话</p>
                            </div>
                        </div>}
                    </div>}
                    <div className="paycb-footer">
                        <Button href="https://mingdao.com/form/4fea509732d6474d8704f0fdb4ba2e75" target="_blank">联系顾问</Button>
                        <Button type="primary" href="/personal/order" target="_blank">查看订单</Button>
                    </div>
                </div>
            </>
        )
    }
}