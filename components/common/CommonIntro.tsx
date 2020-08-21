import { Component } from 'react'
import { toJS } from 'mobx'
import { utils } from '@utils'
import jsCookie from 'js-cookie'
import classnames from 'classnames'
import ReactTooltip from 'react-tooltip'
import moment from 'moment'
import { Tag, Icon, Avatar, Dropdown, Button, Tooltip } from 'antd'
import { CreationType, CreationShowType, CompositionTypes } from '@base/enums'
import { config } from '@utils'

import LazyLoad from '@static/js/LazyLoad'
import AvatarComponent from '@components/common/AvatarComponent'
import AuthorPopupBox from '@containers/author/AuthorPopupBox'
import MiniappIcon from '@containers/widget/MiniappIcon'
import QRCodeIcon from '@components/widget/common/QRCodeIcon'
import CustomIcon from '@components/widget/common/Icon'
import ServiceTag from '@containers/service/ServiceTag'

const videoSvg = '/static/images/icon/video.svg'
// const fullEmpty = '/static/images/common/full-empty.png'
// const fullEmpty = 'https://resource.meihua.info/Fpk8bbmpS-ig29cdGMZW2iQSZLyl?imageMogr2/thumbnail/!7x5r/size-limit/50k/gravity/center/crop/7x5'
const fullEmpty = 'https://resource.meihua.info/Fpk8bbmpS-ig29cdGMZW2iQSZLyl?imageMogr2/thumbnail/!504x360r/size-limit/50k/gravity/center/crop/504x360'
const recommendSvg = '/static/images/icon/icon_recommend.svg'

interface Props {
  authorDetail: boolean
}

export default class CommonIntro extends Component<Props> {

  isInPopup = false
  isPopupLoaded = false

  state = {
    showPopup: false,
  }
  // 喜欢功能
  enjoyClick = current => {
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    const { onFavor } = this.props
    if (onFavor) {
      onFavor({ client_code, action: Number(!current.favored), id: current.compositionId || current.id, type: current.type })
    }
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
    const { isPreview, onPreview, item = {}, onAdClick } = this.props
    if (isPreview && onPreview) {
      onPreview(item.id)
    }
    if (item.adId && onAdClick) {
      onAdClick(item.adId)
    }
  }

  render() {
    const {
      menu,                       // 操作下拉菜单
      times,                      // 时间
      brand,                      // 品牌
      isShow,                     // 机构首页显示
      isRemove,                   // 移除功能
      isPreview,                  // 预览
      isTiming,                   // 定时
      isDropdown,                 // 下拉
      removeMenu,                 // 移除'喜欢'
      authorDetail,               // 作者详情
      hideActions,
      hideAuthorInfoBtns,         // 隐藏作者信息按钮动作
      urlSuffix,
      handlePageShow,             // '机构首页显示'操作
      handlePageRemove,           // '移除'操作
      isInsComposition,           // 作品
      onRemoveShotsFavor,         // '取消喜欢' 操作
    } = this.props
    const { showPopup, isPopupLoaded } = this.state
    const item = this.props.item || {}
    const timeago = utils.timeago(item.gmtPublished || 0)
    const isVideo = item.fileTypes && item.fileTypes.length > 0 && item.fileTypes[0] === 'video'
    const isJumpAd = !!item.isJumpAd
    const isArticle = item.type === CompositionTypes.ARTICLE
    const hasService = item.serviceQuantity > 0
    const currUrlSuffix = urlSuffix ? `?${urlSuffix}` : ''
    let componentJumpUrl = null
    if (isJumpAd) {
      componentJumpUrl = item.link
    } else if (isPreview) {
      componentJumpUrl = null
    } else {
      componentJumpUrl = `/${isArticle ? 'article' : 'shots'}/${item.compositionId || item.id}` + currUrlSuffix
    }


    return (
      <div className='common-intro'>
        <div className='common-inner-intro'>
          <a href={componentJumpUrl} onClick={this.handleLinkClick} target='_blank' title={item.title}>
            <div className={classnames(
              'imgbox',
              { 'imgbox-audited': item.status === 2 }
            )}>
              <div className='intro-show-img'>
                <LazyLoad
                  offsetVertical={300}
                  loaderImage
                  width={'100%'}
                  originalSrc={`${item.cover}?imageMogr2/thumbnail/!504x360r/size-limit/50k/gravity/center/crop/504x360` || fullEmpty}
                  imageProps={{
                    src: fullEmpty,
                    ref: 'image',
                    //alt: `${item.cover}?imageMogr2/thumbnail/!504x360r/size-limit/50k/gravity/center/crop/504x360` || fullEmpty,
                    alt: item.title,
                    className: 'box-img',
                  }} />
              </div>
              {isTiming && <Tooltip title={`该作品已审核通过，发布时间是 ${moment(item.gmtPublished).format('YYYY-MM-DD HH:mm')} 定时发布，该时间即可公开查看`}><Tag className='tag-status' color='#191919'>定时发布</Tag></Tooltip>}
              {item.published === CreationShowType.HIDDEN &&
                <div className='imgbox-cover'>
                  <Tag className='tag-status' color='#191919'>隐藏</Tag>
                </div>
              }
              {item.status === CreationType.AUDITED &&
                // <div className='imgbox-cover'>
                <Tag className='tag-status' color='#191919'>待审核</Tag>
                // </div>
              }
              {item.pageSetting &&
                <Tag className='tag-status' color='#00BF75' style={{ zIndex: 1 }}>机构主页显示</Tag>
              }
              {isShow && !item.pageSetting &&
                <Tag
                  className='tag-status'
                  color='rgba(0, 0, 0, 0.4)'
                  onClick={e => handlePageShow(e, item)}
                  style={{
                    zIndex: 1,
                    paddingLeft: '2px',
                    cursor: 'pointer'
                  }}
                >
                  <Icon type='plus' />
                                    机构首页显示
                                </Tag>
              }
              {isRemove &&
                <Tag
                  className='tag-status'
                  color='rgba(0, 0, 0, 0.4)'
                  onClick={e => handlePageRemove(e, item)}
                  style={{ zIndex: 1, paddingLeft: '2px' }}
                >
                  <Icon type='close' /> 移除
                                </Tag>
              }
              {isVideo && <img src={videoSvg} alt='video' className='shots-type-img' data-for={`shots-type-img`} data-tip={`该作品包含视频作品`} />}
              <ReactTooltip id={`shots-type-img`} effect='solid' place='top' />
              {item.formName && <span className="form-tag" data-for={`shots-type-img`} data-tip={`创意形式：${item.formName}`}>{item.formName}</span>}
              {hasService && <ServiceTag count={item.serviceQuantity} compositionId={item.compositionId} />}
            </div>
            {item.status === CreationType.DRAFT && <Tag className='tag-status' color='#191919'>草稿</Tag>}
            {item.status === CreationType.REJECT && <Tag className='tag-status' color='#FF3B30'>未通过</Tag>}
          </a>
          <div className='intro-detail clearfix'>
            <a href={componentJumpUrl} onClick={this.handleLinkClick} target='_blank'>
              <p className='title multi-ellipsis' data-for={`box-${item.compositionId || item.id}`} data-tip={item.title}>{item.editorRecommend && <Avatar src={recommendSvg} size={16} shape='square' />} {item.title}</p>
            </a>
            <div className='intro-style'>
              {!brand && <span className='style single-ellipsis'>{item.summary}</span>}
              {item.status !== CreationType.AUDITED && item.status !== CreationType.DRAFT && item.status !== CreationType.REJECT && brand &&
                <a target='_blank' href={`/brand/${item.brandId}`} className='style intro-brand'>{item.brandName && item.brandName.length > 0 &&
                  <Tag color='#F1F1F1' style={{ borderRadius: `50px`, color: '#888888' }} data-for={`brand-${item.compositionId || item.id}`} data-tip={`品牌: ${item.brandName}`}>{item.brandName}</Tag>}</a>}
              {times && <span className='style intro-times right'>{timeago}</span>}
              <ReactTooltip id={`brand-${item.compositionId || item.id}`} effect='solid' place='top' />
            </div>
            {!isInsComposition && !hideActions &&
              <div className='intro-operation' id='intro-operation'>
                {item.status !== CreationType.AUDITED && item.status !== CreationType.DRAFT && item.status !== CreationType.REJECT ? <div className='intro-status'>
                  {!isJumpAd &&
                    <>
                      <span className='seen' data-for={`box-${item.compositionId || item.id}`} data-tip={`浏览`}>
                        {/* <Icon type='eye' theme='filled' style={{ color: '#BBBBBB' }} />{item.views || 0} */}
                        <CustomIcon name='eye' style={{ color: '#BBBBBB' }} />{item.views || 0}
                      </span>
                      <ReactTooltip id={`box-${item.compositionId || item.id}`} effect='solid' place='top' />
                      <a className='comment' data-for={`box-${item.compositionId}`} data-tip={`评论`}
                        target='_blank' href={`/shots/${item.compositionId || item.id}#comment`} >
                        {/* <Icon type='message' theme='filled' style={{ color: '#BBBBBB' }} />{item.comments || 0} */}
                        <CustomIcon name='comment' style={{ color: '#BBBBBB' }} />{item.comments || 0}
                      </a>
                      <ReactTooltip id={`box-${item.compositionId}`} effect='solid' place='top' />

                      <span className='enjoy' data-for={`box-${item.compositionId || item.id}`} data-tip={`喜欢`} onClick={e => this.enjoyClick(item)}>
                        {/* <Icon type='heart' theme='filled' style={{ color: item.favored ? '#FF0050' : '#BBBBBB' }} />{item.favors || 0} */}
                        <CustomIcon name='heart' style={{ color: item.favored ? '#FF0050' : '#BBBBBB' }} />{item.favors || 0}
                      </span>
                    </>}
                </div> :
                  <span className='style intro-brand'>{item.brandName && item.brandName.length > 0 &&
                    <Tag color='#F1F1F1' style={{ borderRadius: `50px`, color: '#888888' }} data-for={`brand-${item.compositionId || item.id}`} data-tip={`品牌: ${item.brandName}`}>{item.brandName}</Tag>}</span>
                }
                <ReactTooltip id={`brand-${item.compositionId || item.id}`} effect='solid' place='top' />
                {onRemoveShotsFavor &&
                  <Dropdown overlay={removeMenu} trigger={['hover']} placement='bottomRight' getPopupContainer={() => document.getElementById('intro-operation')}>
                    <a onClick={e => { e.stopPropagation() }} className='intro-dropdown'><Icon type='ellipsis' /></a>
                  </Dropdown>
                }
                {isDropdown &&
                  <Dropdown overlay={menu} trigger={['hover']} placement='bottomRight' getPopupContainer={() => document.getElementById('intro-operation')}>
                    <a onClick={e => { e.stopPropagation() }} className='intro-dropdown'><Icon type='ellipsis' /></a>
                  </Dropdown>
                }
              </div>}
            {/* 广告位推广标识 */}
            {item.adShowRecommend && <span className="ad-spread">推广</span>}
            {/* 微信小程序码icon */}
            {!isPreview && !item.adId && !hideActions &&
              <span className="wx-mini-icon">
                {/* <MiniappIcon
                  placement="topLeft"
                  params={{ scene: `id=${item.compositionId || item.id}`, page: (isArticle ? 'pages/article/article-detail/article-detail' : 'pages/shots/shots-detail/shots-detail'), width: 320 }}
                /> */}
                <QRCodeIcon
                  placement="topRight"
                  url={config.CURRENT_DOMAIN + `/shots/${item.compositionId || item.id}`}
                />
              </span>}
          </div>
        </div>
        {authorDetail && <div className='author-box'>
          <a
            href={item.authorCode ? `/author/${item.authorCode}` : null}
            target='_blank'
            onMouseEnter={this.handleAvatarMouseEnter}
            onMouseLeave={this.handleAvatarMouseLeave}
          >
            {/* <img className='author-img' src={item.authorAvatar} /> */}
            {/* <LazyLoad offsetVertical={300} loaderImage 
                            className='author-img'
                            originalSrc={item.authorAvatar}
                            imageProps={{
                                src: emptyImage, 
                                ref: 'image', 
                                className: 'author-img' 
                            }} /> */}
            {item.authorAvatar && <AvatarComponent
              ref={el => this.avatarRef = el}
              src={item.authorAvatar + '?imageMogr2/thumbnail/!32x32r/size-limit/50k/gravity/center/crop/32x32'}
              className={'author-img'}
              style={{ fontSize: '40px', float: 'left' }}
            />}
            <span
              className='author-name single-ellipsis'
            >{item.authorName} </span>
          </a>
        </div>}
        <div
          className={classnames('author-popup', { show: showPopup })}
          onMouseOver={this.handlePopupMouseOver}
          onMouseOut={this.handlePopupMouseOut}
        >
          {(showPopup || this.isPopupLoaded) &&
            <AuthorPopupBox
              hideBtns={hideAuthorInfoBtns}
              compositionId={item.compositionId}
              code={item.authorCode}
              onLoad={this.handlePopupLoad}
            />}
        </div>
      </div>
    )
  }
}