import { Component } from 'react'
import { toJS } from 'mobx'
import { Tag, Icon, Avatar, Tooltip } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import { utils, config } from '@utils'

import CIcon from '@components/widget/common/Icon'

import AuthorPopupBox from '@containers/author/AuthorPopupBox'
import MiniappIcon from '@containers/widget/MiniappIcon'
import QRCodeIcon from '@components/widget/common/QRCodeIcon'

// import iconBrand from '@static/images/icon/icon_brand.svg'
// import iconProduction from '@static/images/icon/icon_production.svg'
// import iconForm from '@static/images/icon/icon_form.svg'
// import iconPublishTime from '@static/images/icon/icon_pulish_time.svg'

const iconBrand = '/static/images/icon/icon_brand.svg'
const iconProduction = '/static/images/icon/icon_production.svg'
const iconForm = '/static/images/icon/icon_form.svg'
const iconPublishTime = '/static/images/icon/icon_pulish_time.svg'

export default class TopShotsItem extends Component {
  isInPopup = false
  isPopupLoaded = false

  state = {
    showPopup: false,
  }

  handleAvatarMouseEnter = e => {
    // const avatarImg = this.avatarRef.refs.img
    // const avatarRect = avatarImg.getBoundingClientRect()
    if (this.avatarTimer) clearTimeout(this.avatarTimer)
    this.setState({ showPopup: true })
  }

  handleAvatarMouseLeave = e => {
    this.closePopup()
  }

  closePopup() {
    if (this.avatarTimer) clearTimeout(this.avatarTimer)

    this.avatarTimer = setTimeout(() => {
      if (!this.isInPopup) {
        this.setState({ showPopup: false })
      }
    }, 200)
  }

  handlePopupMouseOver = e => {
    this.isInPopup = true
  }

  handlePopupMouseOut = e => {
    this.isInPopup = false
    this.closePopup()
  }

  handlePopupLoad = (state) => {
    this.isPopupLoaded = state
  }

  render() {
    const { item, onCard, cardIcon } = this.props
    const { showPopup } = this.state

    return (
      <div className="top-shots-item">
        <div className="cover">
          <a href={`/shots/${item.compositionId}`} target="_blank"><img src={`${item.cover}?imageMogr2/thumbnail/!504x360r/size-limit/50k/gravity/center/crop/504x360`} alt={item.title} /></a>
        </div>
        <div className="content">
          {item.title && <div className="title"><Tooltip title={item.title}><a href={`/shots/${item.compositionId}`} target="_blank">{item.title}</a></Tooltip></div>}
          {item.authorName &&
            <div className="author">
              <a
                href={`/author/${item.authorCode}`}
                target="_blank"
                onMouseEnter={this.handleAvatarMouseEnter}
                onMouseLeave={this.handleAvatarMouseLeave}
              >
                <Avatar icon="user" size={16} src={item.authorAvatar} />
                <span className="name">{item.authorName}</span>
              </a>
              <div
                className={classnames('author-popup', { show: showPopup })}
                onMouseOver={this.handlePopupMouseOver}
                onMouseOut={this.handlePopupMouseOut}
              >
                {(showPopup || this.isPopupLoaded) &&
                  <AuthorPopupBox
                    code={item.authorCode}
                    onLoad={this.handlePopupLoad}
                  />}
              </div>
            </div>}
          {item.gmtPublish && <div className="date"><img src={iconPublishTime} /><Tooltip title={`发布时间：${moment(item.gmtPublish).format('YYYY-MM-DD HH:mm')}`}>{utils.timeago(item.gmtPublish)}</Tooltip></div>}
          {item.categoryName && <div className="category"><Icon type="appstore" theme="filled" /> <Tooltip title={'品类：' + item.categoryName}><a href={`/shots?category=${item.categoryId}`} target="_blank"><span>{item.categoryName}</span></a></Tooltip></div>}
          {item.formName && <div className="form"><img src={iconForm} /> <Tooltip title={'形式：' + item.formName}><a href={`/shots?form=${item.formId}`} target="_blank"><span>{item.formName}</span></a></Tooltip></div>}
          {item.brandName && <div className="brand"><img src={iconBrand} /><a href={`/brand/${item.brandId}/shots`} target="_blank"><Tooltip title={'品牌：' + item.brandName}><Tag>{item.brandName}</Tag></Tooltip></a></div>}
          {item.authorName &&
            <div className="author-mb">
              <a href={`/author/${item.authorCode}`} target="_blank">
                <Avatar icon="user" size={14} src={item.authorAvatar} />
                <Tooltip title={item.authorName}><span className="name">{item.authorName}</span></Tooltip>
              </a>
            </div>}
          {/* <div className="stat">
            <span className="views"><Tooltip title="浏览"><a><Icon type='eye' theme='filled' /> {item.views}</a></Tooltip></span>
            <span className="comments"><Tooltip title="评论"><a href={`/shots/${item.compositionId}#comment`}><Icon type='message' theme='filled' /> {item.comments}</a></Tooltip></span>
            <span className="favors"><Tooltip title="喜欢"><a ><Icon type='heart' theme='filled' /> {item.favors}</a></Tooltip></span>
          </div> */}
        </div>
        <div className="right-bottom">
          <span className="wx-mini-icon">
            {/* <MiniappIcon
              placement="topLeft"
              params={{ scene: `id=${item.compositionId || item.id}`, page: 'pages/article/article-detail/article-detail', width: 320 }}
            /> */}
            <QRCodeIcon
              placement="topRight"
              url={config.CURRENT_DOMAIN + `/shots/${item.compositionId}`}
            />
          </span>
          <span className="btn-icon-card" onClick={onCard}>
            {cardIcon}
          </span>
        </div>
      </div>
    )
  }
}