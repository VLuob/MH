import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import classnames from 'classnames'
import moment from 'moment'
import { Tooltip } from 'antd'

import { ProductTipType } from '@base/enums'
import { utils } from '@utils'

import './index.less'

@inject(stores => {
  const { productStore } = stores.store
  const { productData, actionProductClick } = productStore
  return {
    productData,
    actionProductClick,
  }
})
@observer
class SideProductBox extends Component {

  getLinkAttr(item) {
    const attr: any = {}
    if ((item.link || '').trim() !== '') {
      attr.href = utils.addHttp(item.link)
      attr.target = '_blank'
    }
    return attr
  }

  handleClick = (id) => {
    const { actionProductClick } = this.props
    actionProductClick({id})
  }

  render() {
    const { 
      className, 
      productData,
    } = this.props
    const {list=[], loading} = productData
    const filterList = list.filter(item => moment(item.gmtExpire).isAfter(moment()))
    const hasProduct = filterList.length > 0

    return (
      hasProduct ? <div className={classnames('side-box side-product-box', className)}>
        <div className="side-box-title">推荐产品服务</div>
        <div className="side-box-content">
          <ul className="side-product-list">
            {filterList.map(item => {
              const isBubbleType = item.tipType === ProductTipType.BUBBLE_TEXT
              const isMarkType = item.tipType === ProductTipType.MARK_RED
              const isTipExpire = !item.tipGmtExpire ? true : moment(item.tipGmtExpire).isBefore(moment()) // 到期时间，如果为空则不显示
              const showBubble = isBubbleType && !isTipExpire && (item.tipTitle || '').trim() !== ''
              const showMark = isMarkType && !isTipExpire
              const showLogo = !!item.logo
              const linkAttr = this.getLinkAttr(item)

              return (
                <li key={item.id} className={classnames({mark: showMark})}>
                  <a {...linkAttr} onClick={e => this.handleClick(item.id)}>
                    {showLogo && <img src={item.logo} alt={item.name} title={item.name}/>}
                    <Tooltip title={item.name}><span className="name">{item.name}</span></Tooltip>
                    {showBubble && <span className="bubble">
                      {item.tipTitle}
                    </span>}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </div> : null
    )
  }
}

export default SideProductBox