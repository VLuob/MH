import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import classnames from 'classnames'
import { Popover, Button, message, Spin } from 'antd'
import { serviceApi } from '@api'
import CustomIcon from '@components/widget/common/Icon'
// import EmptyComponent from '@compositionId/common/EmptyComponent'
import { LetterSendType, LetterSenderTypes, LetterReceiverTypes, LetterSources } from '@base/enums'
import filters from '@base/system/filters'
import './index.less'

const enquiryBudgets = filters.enquiryBudgets

@inject(stores => {
  const { letterStore, enquiryStore } = stores.store
  return {
    letterStore,
    enquiryStore,
  }
})
@observer
class ServiceTag extends Component {
  state = {
    services: [],
    fetching: false,
    loaded: false,
  }

  handleHover = () => {
    const { fetching, loaded } = this.state
    if (!loaded && !fetching) {
      this.requestServices()
    }
  }

  async requestServices() {
    const { compositionId } = this.props
    if (!compositionId) {
      return
    }
    this.setState({ fetching: true })
    const response = await serviceApi.queryCompositionServices({ compositionId })
    this.setState({ fetching: false })
    if (response.success) {
      const list = response.data || []
      this.setState({ services: list, loaded: true })
    } else {
      message.destroy()
      message.error(response.data.msg || '获取关联服务信息失败')
    }
  }

  handleEnquiry = (record) => {
    const { letterStore } = this.props
    const serviceId = record.id

    letterStore.openEnquiry({
      type: LetterSendType.SEND,
      senderType: LetterSenderTypes.USER, // 1梅花网用户 2 创作者
      // senderAvatar: currentUser.avatar,
      receiverType: LetterReceiverTypes.AUTHOR,
      receiverId: record.authorId,
      // receiverNickName: author.nickname,
      source: LetterSources.SERVICE,
      relationId: serviceId,
    })
  }

  render() {
    const { count, className, placement } = this.props
    const { fetching, services } = this.state
    // const hasService = services.length > 0
    return (
      <Popover
        placement={placement || 'bottom'}
        content={
          <div className="service-popover-wrapper">
            {fetching && <div className="loading"><Spin /></div>}
            {!fetching && <>
              {services.map(item => (
                <div className="service-popover-item" key={item.id}>
                  <div className="name"><a href={`/service/${item.id}`} target="_blank">{item.name}</a></div>
                  <div className="price">中位价≈ {item.minPrice || 0}元</div>
                  <div className="btns">
                    <Button type="primary" onClick={e => this.handleEnquiry(item)}>询价</Button>
                  </div>
                </div>
              ))
              }
            </>}
          </div>
        }
      >
        <span className={classnames('service-tag', className)} onMouseEnter={this.handleHover}><CustomIcon name="shopping-cart" /> {count}个服务</span>
      </Popover>
    )
  }
}

export default ServiceTag