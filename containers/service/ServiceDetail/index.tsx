import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import moment from 'moment'
import classnames from 'classnames'
import { Avatar, Button, Tooltip, message, Modal } from 'antd'
import { toJS } from 'mobx'
import jsCookie from 'js-cookie'

import UserIdentityComp from '@components/widget/common/UserIdentityComp'
import ServiceItem from '@components/service/ServiceItem'
// import Gallery from '@containers/shots/Gallery'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'
import Gallery from '../Gallery'
import ServiceItemsBox from '../ServiceItemsBox'
import DetailBottomActionBar from '../DetailBottomActionBar'
import RenderServiceItemsShiftOut from '../ServiceItemsBox/RenderServiceItemsShiftOut'

import { LetterSendType, LetterSenderTypes, LetterReceiverTypes, LetterSources, ActionType, FollowTypes } from '@base/enums'
import filters from '@base/system/filters'
import { config } from '@utils'
import './index.less'


const enquiryBudgets = filters.enquiryBudgets

@inject(stores => {
  const { serviceStore, letterStore, enquiryStore, globalStore } = stores.store
  const { serviceDetail, serviceRecommendData, serviceViewHistoryData } = serviceStore
  const { serverClientCode, isMobileScreen } = globalStore
  return {
    serviceStore,
    letterStore,
    enquiryStore,
    isMobileScreen,
    detail: serviceDetail,
    serverClientCode,
    serviceViewHistoryData,
    serviceRecommendData,
  }
})
@observer
class ServiceDetail extends Component {
  state = {
    contentItemsVisible: false,
  }

  handleEnquiry = (record: any) => {
    const { detail, letterStore } = this.props
    const serviceId = detail.id

    letterStore.openEnquiry({
      type: LetterSendType.SEND,
      senderType: LetterSenderTypes.USER, // 1梅花网用户 2 创作者
      // senderAvatar: currentUser.avatar,
      receiverType: LetterReceiverTypes.AUTHOR,
      receiverId: detail.authorId,
      // receiverNickName: author.nickname,
      source: LetterSources.SERVICE,
      relationId: serviceId,
      relationExtend: record ? JSON.stringify(record) : undefined,
      serviceName: detail.name,
      // 询价带服务清单时候，跳过发送给其他创作者
      disabledRecommendAuthors: !!record,
    })
  }

  handleEnquiryClick = () => {
    this.handleEnquiry()
  }

  handleFollow = async () => {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (!token) {
      window.location.href = `/signin?c=${encodeURIComponent(window.location.href)}`
      return
    }
    const { detail, serverClientCode, serviceStore } = this.props
    const authorFollowed = detail.authorFollowed
    const id = detail.authorId
    const type = FollowTypes.AUTHOR
    const action = authorFollowed ? ActionType.UNFOCUS : ActionType.FOCUS
    // const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    const client_code = serverClientCode

    const response = await serviceStore.fetchFollowAuthor({ id, type, action, client_code })
    message.destroy()
    if (response.success) {
      if (!!action) {
        message.success('关注成功')
      } else {
        message.success('取消关注成功')
      }
    } else {
      message.error(response.data.msg || '关注失败')
    }
  }

  handleContentItemsVisible = (flag) => {
    this.setState({contentItemsVisible: !!flag})
  }

  handleContentEnquiryMobile = (option) => {
    this.handleEnquiry(option)
    this.handleContentItemsVisible(false)
  }

  render() {
    const { detail, serviceRecommendData, serviceViewHistoryData, isMobileScreen } = this.props
    const { contentItemsVisible } = this.state
    // console.log(toJS(detail))
    const gmtPublishedFormat = moment(detail.gmtPublished).format('YYYY-MM-DD')
    const serviceBrands = detail.authorServiceBrands || []
    const serviceItems = JSON.parse(detail.items || '[]')
    const authorFollowed = !!detail.authorFollowed
    const authorCode = detail.authorCode
    const serviceShots = detail.authorServiceCompositions || []
    const hasViewHistory = serviceViewHistoryData.length > 0

    return (
      <>
        {isMobileScreen && <MbNavigatorBar
          showTitle
          backUrl="/"
          title={'服务详情'}
        />}
        <div className="service-detail-body">
          <div className="service-detail">
            {!isMobileScreen && <div className="service-detail-top service-detail-container">
              <div className="author-wrapper">
                <div className="author-avatar">
                  <a href={`/author/${authorCode}`} target="_blank"><Avatar src={detail.authorAvatar} size={40} /></a>
                </div>
                <div className="author-info">
                  <div className="author-nick"><a href={`/author/${authorCode}`} target="_blank">{detail.authorNickName}</a></div>
                  <div className="author-intro"><UserIdentityComp currentType={detail.authorType} editionType={detail.authorEditionType} /></div>
                </div>
                <div className="author-actions">
                  <a
                    className={classnames('btn-follow', { followed: authorFollowed })}
                    onClick={this.handleFollow}
                  >
                    {authorFollowed ? '已关注' : '关注'}
                  </a>
                  <Button type="primary" onClick={this.handleEnquiryClick}>询价</Button>
                </div>
              </div>
            </div>}
            <div className="service-detail-wrapper service-detail-container">
              <div className="service-detail-main">
                <div className="service-detail-header">
                  <div className="title">
                    {detail.name}
                  </div>
                  {!isMobileScreen && <div className="intro">
                    <Tooltip title={`发布时间：${gmtPublishedFormat}`}>
                      <span className="date">{gmtPublishedFormat}</span>
                    </Tooltip>
                    <Tooltip title={`浏览人数：${detail.views}`}>
                      <span className="views">{detail.views}人浏览</span>
                    </Tooltip>
                  </div>}
                  {isMobileScreen && <div className="intro-author-info">
                    <div className="avatar">
                      <a href={`/author/${authorCode}`} target="_blank"><Avatar src={detail.authorAvatar} size={40} /></a>
                    </div>
                    <div className="info">
                      <div className="nick"><a href={`/author/${authorCode}`} target="_blank">{detail.authorNickName}</a></div>
                      <div className="intro"><span>{gmtPublishedFormat}</span><span>{detail.views}次阅读</span></div>
                    </div>
                    <div className="action">
                      <Button type="primary" onClick={this.handleEnquiryClick}>询价</Button>
                    </div>
                  </div>}
                </div>
                <div className="service-detail-content">
                  {/* shots section */}
                  <div className="service-detail-section">
                    <div className="section-header">
                      作品
                  </div>
                    <div className="section-content">
                      <div className="service-shots-wrapper">
                        {serviceShots.map((item, index) => {
                          const sortFiles = (item.compositionFiles || []).slice().sort((a, b) => a.position - b.position)
                          return (
                            <div className="service-shots-item" key={item.id}>
                              <div className="service-shots-title">
                                <Tooltip title={`作品标题：${item.compositionTitle}`}>
                                  <a href={`/shots/${item.compositionId}`} target="_blank">{index + 1}、{item.compositionTitle}</a>
                                </Tooltip>
                              </div>
                              <div className="service-shots-gallery">
                                <Gallery
                                  galleryId={index}
                                  detail={detail}
                                  files={sortFiles}
                                  filesCount={sortFiles.length}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* service description section */}
                  <div className="service-detail-section">
                    <div className="section-content">
                      <div className="service-detail-description">
                        <pre>
                          {detail.description}
                        </pre>
                      </div>

                    </div>
                  </div>

                  {/* brand section */}
                  <div className="service-detail-section">
                    <div className="section-header">
                      服务过的品牌
                  </div>
                    <div className="section-content">
                      <div className="service-brands">
                        {serviceBrands.map(item => (
                          <Tooltip key={item.id} title={`品牌：${item.brandName}`}>
                            <a className="brand-tag" href={`/brand/${item.brandId}`} target="_blank">{item.brandName}</a>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* side */}
              {!isMobileScreen && <div className="service-detail-side">
                <RenderServiceItemsShiftOut render={({ref}) => (
                  <div className="service-items-box" ref={ref}>
                    <ServiceItemsBox
                      items={serviceItems}
                      onEnquiry={this.handleEnquiry}
                    />
                  </div>
                )} />
              </div>}
            </div>
          </div>
          <div className="service-detail-extra-container">
            <div className="service-recommend service-detail-container">
              <div className="extra-header">
                相关服务推荐
            </div>
              <div className="extra-content">
                <div className="service-list">
                  {serviceRecommendData.map(item => {
                    return (
                      <ServiceItem
                        key={item.id}
                        item={item}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
            {hasViewHistory && <div className="service-history service-detail-container">
              <div className="extra-header">
                浏览记录
            </div>
              <div className="extra-content">
                <div className="service-list">
                  {serviceViewHistoryData.map(item => {
                    return (
                      <ServiceItem
                        key={item.id}
                        item={item}
                      />
                    )
                  })}
                </div>
              </div>
            </div>}
          </div>
        </div>
        {isMobileScreen && <DetailBottomActionBar
          title={detail.name}
          onEnquiry={e => this.handleContentItemsVisible(true)}
        />}
        <Modal
          visible={contentItemsVisible}
          title="寻个准价"
          footer={null}
          onCancel={e => this.handleContentItemsVisible(false)}
        >
          <div className="mb-service-content-items">
            <ServiceItemsBox
              items={serviceItems}
              onEnquiry={this.handleContentEnquiryMobile}
            />
          </div>
        </Modal>
      </>
    )
  }
}

export default ServiceDetail