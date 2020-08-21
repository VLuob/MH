import { InputNumber } from 'antd'

const PayUnitInput = (props) => {
  const { onChange, value } = props

  return (
    <div className="pricing-pay-item">
      <div className="pricing-pay-item-label">购买年限</div>
      <div className="pricing-pay-item-content">
        <div className="pay-item-year">
          <InputNumber 
            defaultValue={1}
            value={value}
            min={1}
            max={3}
            formatter={v => {
              if (Number(v)){
                if (Number(v) > 3) {
                  return 3
                } else if (Number(v) < 1) {
                  return 1
                } else {
                  return v
                }
              } else {
                return ''
              }
            }}
            onChange={onChange}
          />
          <div className="pay-year-text">最多可买3年</div>
        </div>
      </div>
    </div>
  )
}

export default PayUnitInput