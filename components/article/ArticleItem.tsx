import { Component } from 'react'
import { Tag, Icon, Avatar, Dropdown, Tooltip } from 'antd'
import { CreationType, CreationShowType } from '@base/enums'
import moment from 'moment'
import classnames from 'classnames'
import LazyLoad from '@static/js/LazyLoad'
import { toJS } from 'mobx'
import { utils, config } from '@utils';

import AuthorPopupBox from '@containers/author/AuthorPopupBox'
import MiniappIcon from '@containers/widget/MiniappIcon'
import QRCodeIcon from '@components/widget/common/QRCodeIcon'

const emptyImage = '/static/images/common/full-empty.png'
const recommendSvg = '/static/images/icon/icon_recommend.svg'

export interface Props {
  id: number | string
  menu: Array<any> | any
  removeMenu: Array<any> | any
  cover: string
  title: string
  summary: string
  status: number
  published: number
  author: string
  authorCode: number
  isDropdown: boolean
  view: number
  time: number | string
  timeago: string
  classification: string
}

export default class ArticleItem extends Component<Props> {
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

  handleLinkClick = (e) => {
    const { isPreview, onPreview, id } = this.props
    if (isPreview && onPreview) {
      onPreview(id)
    }
  }

  render() {
    const {
      id,
      item,
      menu,
      view,
      time,
      title,
      cover,
      status,
      author,
      timeago,
      summary,
      showCard,
      cardIcon,
      isShow,
      isRemove,
      isPreview,
      isTiming,
      published,
      removeMenu,
      isDropdown,
      authorCode,
      onPageShow,
      onPageRemove,
      onFavorRemove,
      onCard,
      classification,
      isInsComposition,
    } = this.props
    const { showPopup } = this.state
    const momentTime = moment(time)
    const timeLabel = moment().diff(momentTime, 'days') > 3 ? momentTime.format('YYYY-MM-DD') : utils.timeago(time)

    return (
      <div className='article-item'>
        <div className='article-item-cover'>
          <a href={!isPreview ? `/article/${id}` : null} onClick={this.handleLinkClick} target='_blank' title={title}>
            <LazyLoad
              className='image-lazy-load'
              offsetVertical={300}
              loaderImage
              originalSrc={`${cover}?imageMogr2/thumbnail/!504x360r/size-limit/50k/gravity/center/crop/504x360`}
              imageProps={{
                src: emptyImage,
                ref: 'image',
                alt: title,
              }}
            />
            {status === CreationType.AUDITED &&
              <div className='article-img-cover'>
                <Tag color='#191919' className='article-img-tag'>待审核</Tag>
              </div>}
            {published === CreationShowType.HIDDEN && <div className='article-img-cover'>
              <Tag color='#191919' className='article-img-tag'>隐藏</Tag>
            </div>}
            {status === CreationType.DRAFT && <Tag className='article-img-tag' color='#191919'>草稿</Tag>}
            {status === CreationType.REJECT && <Tag className='article-img-tag' color='#FF3B30'>未通过</Tag>}
            {isTiming && <Tooltip title={`该作品已审核通过，发布时间是 ${moment(item.gmtPublished).format('YYYY-MM-DD HH:mm')} 定时发布，该时间即可公开查看`}><Tag className='article-img-tag' color='#191919'>定时发布</Tag></Tooltip>}
          </a>
        </div>
        <div className='article-item-content'>
          <div className='title'><a href={!isPreview ? `/article/${id}` : null} onClick={this.handleLinkClick} target='_blank'><Tooltip title={title}>{item.editorRecommend && <Avatar src={recommendSvg} size={20} shape='square' style={{ marginBottom: '5px' }} />} {title}</Tooltip></a></div>
          <div className='intro'>{summary}</div>
          <div className='footer' id='article-footer'>
            <span className='text-tag'>
              <a
                href={`/author/${authorCode}`}
                target='_blank'
                onMouseEnter={this.handleAvatarMouseEnter}
                onMouseLeave={this.handleAvatarMouseLeave}
              >
                {author}
              </a>
              <div
                className={classnames('author-popup', { show: showPopup })}
                onMouseOver={this.handlePopupMouseOver}
                onMouseOut={this.handlePopupMouseOut}
              >
                {(showPopup || this.isPopupLoaded) &&
                  <AuthorPopupBox
                    code={authorCode}
                    onLoad={this.handlePopupLoad}
                  />}
              </div>
            </span>
            {author && <span className='dot'>·</span>}
            <span className='text-tag'><Tooltip title={`发布时间：${momentTime.format('YYYY-MM-DD HH:mm:ss')}`}>{timeLabel}</Tooltip></span>
            {/* <span className='dot'>·</span>
                    <span className='text-tag'><Tooltip title={`阅读 ${utils.formatViews(view)}`}>阅读 {utils.formatViews(view)}</Tooltip></span> */}
            <span className='dot'>·</span>
            <a target='_blank' href={`/channel/${item.classificationId}`} className='text-tag'><Tooltip title={`分类：${classification}`}>{classification}</Tooltip></a>

            <span className="footer-right">
              {!isPreview &&
                <span className="wx-mini-icon">
                  {/* <MiniappIcon
                    placement="topLeft"
                    params={{ scene: `id=${item.compositionId || item.id}`, page: 'pages/article/article-detail/article-detail', width: 320 }}
                  /> */}
                <QRCodeIcon
                  placement="topRight"
                  url={config.CURRENT_DOMAIN + `/article/${item.compositionId}`}
                />
                </span>}
              {showCard && <span className="btn-icon-card" onClick={onCard}>{cardIcon}</span>}
              {onFavorRemove &&
                <span className='operation'>
                  <Dropdown overlay={removeMenu} trigger={['hover']} placement='bottomRight' getPopupContainer={() => document.getElementById('article-footer')}>
                    <a onClick={e => onFavorRemove(item)} className='intro-dropdown'><Icon type='ellipsis' style={{ fontSize: '16px' }} /></a>
                  </Dropdown>
                </span>}
              {!isInsComposition && <span className='operation'>
                {isDropdown &&
                  <Dropdown overlay={menu} trigger={['hover']} placement='bottomRight' getPopupContainer={() => document.getElementById('article-footer')}>
                    <a onClick={e => { e.stopPropagation() }} className='intro-dropdown'><Icon type='ellipsis' style={{ fontSize: '16px' }} /></a>
                  </Dropdown>}
              </span>}
              {/* {isInsComposition && <div className='page-setting-operation'>
                    {isShow && <span onClick={e => onPageShow(e, item)}><Icon type='plus-circle' theme='filled' /> 机构主页显示</span>}
                    {isRemove && <span onClick={e => onPageRemove(e, item)}><Icon type="close-circle" theme="filled" /> 移除</span>}
                    {isShow && item.pageSetting &&
                        <Tag className='tag-status' color='#00BF75' style={{ zIndex: 1 }}>机构主页显示</Tag>
                    }
                </div>} */}
            </span>
          </div>

        </div>
      </div>
    )
  }
}