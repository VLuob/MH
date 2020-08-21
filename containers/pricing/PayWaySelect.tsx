import classnames from 'classnames'

import { PayType } from '@base/enums'

const payways = [
  {key: PayType.ALIPAY, name: '支付宝', icon: '/static/images/pricing/alipay.svg'},
  {key: PayType.WXPAY, name: '微信支付', icon: '/static/images/pricing/wxpay.svg'},
  {key: PayType.BANKPAY, name: '银行电汇/转账', icon: '/static/images/pricing/unionpay.svg'},
]

const PayWaySelect = (props) => {
  const { type, onChange } = props
  const isUnionpay = type === PayType.BANKPAY

  
  return (
    <div className="pricing-pay-way-wrapper">
      <div className="pricing-pay-way">
        <div className="pricing-pay-way-label">支付方式</div>
        {payways.map(item => (
          <div 
            key={item.key}
            className={classnames(
              "pay-way-box pay-item-select-box", 
              {active: item.key === type}
            )}
            onClick={e => onChange(item.key)}
          >
            <div className="text-wrap">
              <img src={item.icon} alt=""/>{item.name}
            </div>
          </div>
        ))}
      </div>
      {isUnionpay && <div className="pricing-pay-bank-info">
        <div className="bank-intro">
          <div className="bank-intro-item">户名：上海梅花信息股份有限公司</div>
          <div className="bank-intro-item">开户行：招商银行上海分行天山支行</div>
          <div className="bank-intro-item">账 号：2149 8037 6210 001</div>
        </div>
        <div className="bank-desc">
          <p>付款后请拍摄凭据发送到邮箱：shots@meihua.info，或<a href="https://mingdao.com/form/4fea509732d6474d8704f0fdb4ba2e75" target="_blank">联系顾问</a>。</p>
          <p>注明“开通梅花网作品标准版/高级版”并留下您的姓名和联系电话</p>
        </div>
      </div>}
    </div>
  )
}

export default PayWaySelect