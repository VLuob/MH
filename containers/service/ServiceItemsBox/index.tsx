import { Component } from 'react'
import { Button } from 'antd'

import ServiceItem from './ServiceItem'
import './index.less'
import { has } from 'mobx'

class ServiceItemsBox extends Component {
  state = {
    currentIndex: 0,
    currentItem: this.props.items[0] || {},
  }

  handleClick = (index, record) => {
    // const { currentIndex } = this.state
    let nextIndex = index
    let nextItem = record
    // if (index === currentIndex) {
    //   nextIndex = -1
    //   nextItem = {}
    // }
    this.setState({currentIndex: nextIndex, currentItem: nextItem})
  }

  handleEnquiry = () => {
    const { onEnquiry } = this.props
    const { currentItem } = this.state
    if (onEnquiry) onEnquiry(currentItem)
  }

  render() {
    const { items=[] } = this.props
    const { currentIndex, currentItem } = this.state
    const hasSelected = currentIndex >= 0

    return (
      <div className="collapse-wrapper service-items-wrapper">
        <div className="collapse-box">
          {items.map((item, index) => {
            return (
              <ServiceItem
                key={index}
                index={index}
                item={item}
                checked={index === currentIndex}
                defaultShow={index === 0}
                onClick={record => this.handleClick(index, record)}
              />
            )
          })}
        </div>
        <div className="collapse-bottom">
          <div className="intro">
            {hasSelected && <span>已选服务中位价≈ {currentItem.price}元</span>}
          </div>
          <div className="button-wrapper">
            <Button type="primary" onClick={this.handleEnquiry}>寻个准价</Button>
          </div>
        </div>
      </div>
    )
  }
}

export default ServiceItemsBox