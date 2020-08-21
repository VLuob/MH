import { useState, useEffect } from 'react'
import classnames from 'classnames'
import CustomIcon from '@components/widget/common/Icon'

import './index.less'

const ServiceItem = (props) => {
  const { defaultShow, checked, item={}, onClick } = props
  const [down, setDown] = useState(defaultShow)
  const [selected, setSelected] = useState(false)

  useEffect(() => {
    setSelected(checked)
  }, [checked])

  const toggleDown = (e) => {
    e.stopPropagation()
    setDown(!down)
  }
  const toggleSelected = () => {
    // setSelected(!selected)
    if (onClick) {
      onClick(item)
    }
  }

  return (
    <div className={classnames('collapse-panel', {active: selected})}>
      <div className="collapse-header" onClick={toggleSelected}>
        <div className="name">{item.name}</div>
        <div className="right">
          <div className="price">
            <span className="price-label">中位价≈ </span><span className="price-value">{item.price || 0}元</span>
          </div>
          <div className={classnames('btn-arrow', {up: down})}>
            <CustomIcon name="arrow-down-o" />
          </div>
        </div>
      </div>
      {checked && <div className="collapse-content">
        <div className="content-text" dangerouslySetInnerHTML={{__html: item.content}} />
      </div>}
    </div>
  )
}

export default ServiceItem