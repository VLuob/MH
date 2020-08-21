import { Component, Fragment } from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'
import jsCookie from 'js-cookie'
import { Avatar, Button, Tooltip, message } from 'antd'

import UserIdentityComp from '@components/widget/common/UserIdentityComp'
import CustomIcon from '@components/widget/common/Icon'
import ServiceTag from '@containers/service/ServiceTag'
import { CompositionTypes, AuthorType, FollowTypes, ActionType, LetterSendType, LetterSenderTypes, LetterReceiverTypes, LetterSources } from '@base/enums'
import { authorApi } from '@api'
import { config } from '@utils'
import './index.less'


@inject(stores => {
  const { letterStore, globalStore } = stores.store
  const { isMobileScreen } = globalStore
  return {
    letterStore,
    isMobileScreen,
  }
})
@observer
class AuthorItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      item: props.item || {}
    }
  }

  handleFollow = async () => {
    const { item } = this.state
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if(!token) {
      window.location.href = `/signin?c=${encodeURIComponent(window.location.href)}`
      return
    }
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    const followed = item.followed
    const id = item.id
    const type = FollowTypes.AUTHOR
    const action = followed ? ActionType.UNFOCUS : ActionType.FOCUS
    // const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)

    const response = await authorApi.actionFollow({id, type, action, client_code})
    message.destroy()
    if (response.success) {
      const nextItem = {
        ...item,
        followed: !!action
      }
      this.setState({item: nextItem})
      if (!!action) {
        message.success('关注成功')
      } else {
        message.success('取消关注成功')
      }
    } else {
      message.error(response.data.msg || '关注失败')
    }
  }

  handleEnquiry = () => {
    const { letterStore, source } = this.props
    const { item } = this.state

    letterStore.openEnquiry({
      type: LetterSendType.SEND,
      senderType: LetterSenderTypes.USER, // 1梅花网用户 2 创作者
      // senderAvatar: currentUser.avatar,
      receiverType: LetterReceiverTypes.AUTHOR,
      receiverId: item.id,
      // receiverNickName: author.nickname,
      source: source || LetterSources.AUTHOR_LIST,
      relationId: item.id,
    })
  }

  renderMobile(option) {
    const {
      item,
      compositionList,
      showEnquiry,
      areaStr,
    } = option

    const shotsList = compositionList.slice(0,3)

    return (
      <div className="author-item-box-mobile">
      <div className="author-info-wrapper">
        <div className="author-avatar">
        <a href={`/author/${item.code}`} target="_blank"><Avatar size={60} src={item.avatar} /></a>
        </div>
        <div className="author-content">
          <div className="nick">
            <a href={`/author/${item.code}`} target="_blank">{item.nickname}</a>
          </div>
          <div className="intro">
            <span className="type">
              <UserIdentityComp currentType={item.type} editionType={item.editionType} />
            </span>
            <span className="area">{areaStr}</span>
          </div>
          <div className="stat">
            <a className="text" href={`/author/${item.code}/service`} target="_blank">服务 {item.serviceQuantity || 0}</a>
            <span className="divider">|</span>
            <a className="text" href={`/author/${item.code}/shots`} target="_blank">作品 {item.compositionCount || 0}</a>
            <span className="divider">|</span>
            <a className="text" href={`/author/${item.code}/article`} target="_blank">文章 {item.articleCount || 0}</a>
          </div>
        </div>
        <div className="author-actions">
          {showEnquiry && <Button type="primary" className="btn-enquiry" onClick={this.handleEnquiry} >询价</Button>}
        </div>
      </div>
      <div className="author-shots-wrapper">
        <div className="author-shots-list">
          {shotsList.map((record, i) => {
            const hasService = record.serviceQuantity > 0
            const jumpUrl = CompositionTypes.ARTICLE === record.type ? `/article/${record.id}` : `/shots/${record.id}`
            return (<div className="author-shots-item" key={item.id + i}>
              <div className="cover">
                <a href={jumpUrl} target="_blank" title={item.title}>
                <img src={`${record.cover}?imageMogr2/thumbnail/!504x360r/size-limit/50k/gravity/center/crop/504x360`} alt={record.title} title={record.title} />
                </a>
              </div>
              {hasService && <ServiceTag compositionId={record.id} count={record.serviceQuantity || 0} />}
            </div>)
          })}
        </div>
      </div>
    </div>
    )
  }

  renderPc(option) {
    const {
      item,
      compositionList,
      showEnquiry,
      areaStr,
    } = option

    return (
      <div className="author-item-box">
        <div className="author-info-wrapper">
          <div className="author-avatar">
          <a href={`/author/${item.code}`} target="_blank"><Avatar size={80} src={item.avatar} /></a>
          </div>
          <div className="author-content">
            <div className="nick">
              <a href={`/author/${item.code}`} target="_blank">{item.nickname}</a>
            </div>
            <div className="intro">
              <span className="type">
                <UserIdentityComp currentType={item.type} editionType={item.editionType} />
              </span>
              <span className="area">{areaStr}</span>
            </div>
            <div className="stat">
              <a className="text" href={`/author/${item.code}/service`} target="_blank">服务 {item.serviceQuantity || 0}</a>
              <span className="divider">|</span>
              <a className="text" href={`/author/${item.code}/shots`} target="_blank">作品 {item.compositionCount || 0}</a>
              <span className="divider">|</span>
              <a className="text" href={`/author/${item.code}/article`} target="_blank">文章 {item.articleCount || 0}</a>
            </div>
            <div className="btns">
              <Button className={classnames({followed: item.followed})} onClick={this.handleFollow}>{item.followed ? '已关注' : '关注'}</Button>
              {showEnquiry && <Button type="primary" onClick={this.handleEnquiry} >询价</Button>}
            </div>
          </div>
        </div>
        <div className="author-shots-wrapper">
          <div className="author-shots-list">
            {compositionList.map((record, i) => {
              const hasForm = !!record.formName
              const hasService = record.serviceQuantity > 0
              const jumpUrl = CompositionTypes.ARTICLE === record.type ? `/article/${record.id}` : `/shots/${record.id}`
              return (<div className="author-shots-item" key={item.id + i}>
                <div className="cover">
                  <a href={jumpUrl} target="_blank" title={item.title}>
                  <img src={`${record.cover}?imageMogr2/thumbnail/!504x360r/size-limit/50k/gravity/center/crop/504x360`} alt={record.title} title={record.title} />
                  </a>
                </div>
                <div className="icon-video"></div>
                {hasForm && <Tooltip title={`创意形式：${record.formName}`}><div className="form-tag">{record.formName}</div></Tooltip>}
                {hasService && <ServiceTag compositionId={record.id} count={record.serviceQuantity || 0} />}
              </div>)
            })}
          </div>
          <div className="author-shots-extra">
            <Tooltip title="查看更多作品">
              <a className="btn-more" href={`/author/${item.code}/shots`} target="_blank">
                <CustomIcon name="ellipsis-vertical" />
              </a>
            </Tooltip>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { isMobileScreen } = this.props
    const { item = {} } = this.state
    const compositionList = (item.compositionList || []).slice(0, 4)
    const showEnquiry = [AuthorType.PERSONAL, AuthorType.SERVER].includes(item.type)
    const areaArr = []
    if (item.provinceName) {
      areaArr.push(item.provinceName)
    }
    if (item.cityName) {
      areaArr.push(item.cityName)
    }
    const areaStr = areaArr.join('/')

    const propOption = {
      item,
      compositionList,
      showEnquiry,
      areaStr,
    }

    return (
      <>
      {!isMobileScreen && this.renderPc(propOption)}
      {isMobileScreen && this.renderMobile(propOption)}
      </>
    )
  }
}

export default AuthorItem