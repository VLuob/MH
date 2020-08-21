import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import jsCookie from 'js-cookie'
import moment from 'moment'
import { toJS } from 'mobx'
import {
  Icon,
  Button,
  Tag,
  message,
  Select,
  Tooltip,
  Avatar,
} from 'antd'
import Swiper from 'swiper'

import { config, utils } from '@utils'
import { Router, Link } from '@routes'
import {
  FavorTypes,
  AuthorType, ActionType, CommentTypes, CompositionTypes,
  LetterSendType, LetterSenderTypes, LetterReceiverTypes, LetterSources,
  FollowTypes,
} from '@base/enums'

import { composition } from '@base/system'
import CustomIcon from '@components/widget/common/Icon'
import NewArticles from './NewArticles'
import AuthorInfo from './AuthorInfo'
import RelatedArticles from './RelatedArticles'
import RenderShareShiftOut from './RenderShareShiftOut'
import RelatedCompositions from '../shots/RelatedCompositions'
import RelatedCollections from '../shots/RelatedCollections'
import SubscribeComp from '@components/common/SubscribeComp'
import ShareGroup from '@containers/shots/ShareGroup'
import Members from '@components/common/Members'
import FavorIcon from '@components/widget/common/FavorIcon'
import CommentBox from '@containers/comment/CommentBox'
// import CardModal from '@containers/card/CardModal'
import MiniappIcon from '@containers/widget/MiniappIcon'
import QRCodeIcon from '@components/widget/common/QRCodeIcon'
import CurrentFavoritesModal from '@containers/collection/CurrentFavoritesModal'
import RelatedTags from '@components/article/RelatedTags'
import ActionSuccessModal from '@containers/composition/ActionSuccessModal'
import DetailBottomActionBar from '@containers/shots/DetailBottomActionBar'
import SideProductBox from '@containers/common/SideProductBox'


// const iconBrand = '/static/images/icon/icon_brand.svg'
// const iconForm = '/static/images/icon/icon_form.svg'
// const iconPublishTime = '/static/images/icon/icon_pulish_time.svg'
// const iconProduction = '/static/images/icon/icon_production.svg'

// const RelatedCompositions = dynamic(() => import('../shots/RelatedCompositions'), {ssr: false})
// const RelatedArticles = dynamic(() => import('./RelatedArticles'), {ssr: false})
// const CardModal = dynamic(() => import('@containers/card/CardModal'), {ssr: false})
const CardIcon = dynamic(() => import('@containers/card/CardIcon'), { ssr: false, loading: () => <span></span> })

let token

interface Props {

}

interface State {
  authorInfoFixed: boolean
  shareCardModal: boolean
  favoritesModal: boolean
  favorModal: boolean
}

const getView = (view) => {
  let label = ''
  if (view >= 10000) {
    label = `${Math.floor(view / 10000)}万`
  } else {
    label = view || 0
  }
  return label
}

@inject(stores => {
  const { compositionStore, adStore, globalStore, letterStore } = stores.store
  const { compositionDetail, authorInfo } = compositionStore

  return {
    compositionStore,
    adStore,
    globalStore,
    letterStore,
    authorInfo: authorInfo.info,
    detail: compositionDetail.composition || {},
    articleDetailAds: adStore.articleDetailAds,
    navigationData: globalStore.navigationData,
    isMobileScreen: globalStore.isMobileScreen,
    currentWxacode: globalStore.currentWxacode,
  }
})
@observer
export default class DetailContainer extends Component<Props, State> {
  state = {
    authorInfoFixed: false,

    shareCardModal: false,
    favoritesModal: false,

    favorModal: false,
  }

  componentDidMount() {
    this.initInnerShots()
    this.initEvents()
    this.initLazyload()
  }

  componentWillUnmount() {
    this.removeEvents()
  }

  initEvents() {
    document.addEventListener('scroll', this.handleScrollEvent, false)
    window.addEventListener('scroll', this.initInnerShots, false)
  }

  removeEvents() {
    document.removeEventListener('scroll', this.handleScrollEvent, false)
    window.removeEventListener('scroll', this.initInnerShots, false)
  }

  handleScrollEvent = (e) => {
    // console.log('scroll sider', rect)
    const rect = this.sideRef.getBoundingClientRect()
    let authorInfoFixed
    if (rect.bottom < 0) {
      authorInfoFixed = true
    } else {
      authorInfoFixed = false
    }
    this.setState({ authorInfoFixed })

    const userBrief = document.querySelector('.user-brief-box')
    const commonSubFooter = document.querySelector('.common-sub-footer')
    const shareRef = document.querySelector('.article-share-bar .share-container')

    if (userBrief && commonSubFooter) {
      const briefRect = userBrief.getBoundingClientRect()
      const footerRect = commonSubFooter.getBoundingClientRect()
      if (briefRect.bottom > (footerRect.top + 10)) {
        this.setState({ authorInfoFixed: false })
      }
    }

    if (shareRef && commonSubFooter) {
      const shareRect = shareRef.getBoundingClientRect()
      const bottomRect = commonSubFooter.getBoundingClientRect()
      if (shareRef && shareRef.style.position === '') {
        const shareRect = shareRef.getBoundingClientRect()
        shareRef.style.position = 'fixed'
        shareRef.style.top = `108px`
        shareRef.style.left = `${shareRect.left}px`

      }

      if (shareRect.bottom > bottomRect.top + 10) {
        shareRef.classList.add('hidden')
      } else {
        shareRef.classList.remove('hidden')
      }

    }

  }


  initLazyload() {
    if (typeof window === 'undefined' && typeof lazyload === 'undefined') {
      return
    }
    // const $ = window.$
    // $(function() {
    //     $('.content img').addClass('lazyload').lazyload({effect: 'fadeIn'})
    // })
    let images = document.querySelectorAll(".content img");
    lazyload(images, { effect: "fadeIn" });
  }

  initSwiper() {
    const winWidth = window.innerWidth;
    let slidesPreview = 2
    if (winWidth < 560) {
      slidesPreview = 1
    }

    this.mySwiper = new Swiper('.swiper-container', {
      slidesPerView: slidesPreview,
      spaceBetween: 30,
      slidesPerGroup: slidesPreview,
      // loop: true,
      // loopFillGroupWithBlank: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    })
  }

  checkElementIntoWindowView(currentEl) {
    const offset = currentEl.getBoundingClientRect();
    const offsetTop = offset.top;
    const offsetBottom = offset.bottom;
    const offsetHeight = offset.height;
    // 进入可视区域
    if (offsetTop <= window.innerHeight && offsetBottom >= 0) {
      // console.log('进入可视区域');
      // do something...
      // currentEl.setAttribute('requested', '1')
      return true
    }
    return false
  }

  initInnerShots = () => {
    const contentEl = document.querySelector('#article-content-html')
    if (!contentEl) {
      return
    }
    const innerShotsEls = contentEl.querySelectorAll('.inner-shots-placeholder')
    // console.log(innerShotsEls)
    for (let k in innerShotsEls) {
      const innerShotsEl = innerShotsEls[k]
      if (innerShotsEl.nodeType === 1) {
        if (this.checkElementIntoWindowView(innerShotsEl)) {
          if (!innerShotsEl.getAttribute('requested')) {
            innerShotsEl.setAttribute('requested', '1')
            this.handleRequestInnerShots(innerShotsEl)
          }
        }
        // const idsStr = innerShotsEl.getAttribute('data-ids')
        // if (idsStr && idsStr.trim()) {
        //   const idsArr = JSON.parse(idsStr)
        //   this.requestInnerShots(idsArr, (res) => {
        //     if (res.success) {
        //       const list = res.data.list || []
        //       this.appendInnerShots(list, innerShotsEl)
        //     }
        //   })
        // }
      }
    }
  }

  handleRequestInnerShots(innerShotsEl) {
    const idsStr = innerShotsEl.getAttribute('data-ids')
    if (idsStr && idsStr.trim()) {
      const idsArr = JSON.parse(idsStr)
      this.requestInnerShots(idsArr, (res) => {
        if (res.success) {
          const list = res.data.list || []
          this.appendInnerShots(list, innerShotsEl)
        }
      })
    }
  }

  async requestInnerShots(idsArr, callback) {
    const { compositionStore } = this.props;
    const response = await compositionStore.fetchInnerShots({
      terms: {
        term: {
          compositionIds: idsArr,
        },
        page: 1,
        limit: idsArr.length,
      }
    })
    if (callback) callback(response)
  }

  appendInnerShots(shots, innerShotsEl) {
    const innerShotsString = composition.getInnerShotsString(shots)

    innerShotsEl.innerHTML = innerShotsString

    this.initSwiper();
  }

  handleEnquiry = () => {
    const { letterStore, authorInfo, currentUser, detail } = this.props
    const compositionId = detail.compositionId
    const author = authorInfo.author || {}

    letterStore.openEnquiry({
      type: LetterSendType.SEND,
      senderType: LetterSenderTypes.USER, // 1梅花网用户 2 创作者
      // senderAvatar: currentUser.avatar,
      receiverType: LetterReceiverTypes.AUTHOR,
      receiverId: author.id,
      // receiverNickName: author.nickname,
      source: LetterSources.ARTICLE_DETAIL,
      relationId: compositionId,
    })
  }

  handleFollow = () => {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (!token) {
      window.location.href = `/signin?c=${window.location.pathname}`
      return
    }
    const { compositionStore, authorInfo } = this.props
    const author = authorInfo.author || {}
    const id = author.id
    const type = FollowTypes.AUTHOR
    const action = authorInfo.followed ? ActionType.UNFOCUS : ActionType.FOCUS
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)

    compositionStore.fetchActionFollowAuthor({ id, type, action, client_code })
  }

  handleFavor = () => {
    const { detail, query, compositionStore } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (!token && detail.favored) {
      message.destroy()
      message.warning('您已点击喜欢')
      return
    }

    const nextAction = detail.favored ? ActionType.UNFOCUS : ActionType.FOCUS
    const id = query.id
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    const params = {
      client_code,
      id,
      action: nextAction,
      type: FavorTypes.ARTICLE,
    }
    if (token) {
      params.token = token
    }
    compositionStore.fetchActionFavor(params).then(res => {
      if (res.success && !!nextAction) {
        // this.handleFavorVisible(true)
      }
    })
  }

  handleCollection = () => {
    const { compositionStore, detail, query } = this.props;
    token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)

    if (!token) {
      message.warning('请先登录后操作！')
      setTimeout(() => {
        window.open('/signin?c=' + location.href)
      }, 200)
      return
    }

    this.handleFavoritesVisible(true)

    // const clientCode = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    // const compositionId = query.id
    // const action = detail.collected ? ActionType.UNFOCUS : ActionType.FOCUS
    // const type = CollectionTypes.ARTICLE
    // compositionStore.fetchActionCollection({token, clientCode, compositionId, type, action})
  }

  handleCollectionSuccess = (option) => {
    const { compositionStore } = this.props
    compositionStore.setCollections(option.action)
    if (option.action === ActionType.FOCUS) {
      message.destroy()
      message.success('收藏成功')
      this.handleFavoritesVisible(false)
    }
  }

  handleDownloadAttach = (attachId, name) => {
    const { compositionStore, detail, query } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (!token) {
      location.href = '/signin?c=' + location.href
      return
    }

    const attachFiles = detail.attachFiles || []
    const client = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    const params = {
      compositionId: query.id,
      token,
      client,
    }
    compositionStore.downloadAttach({
      ...params,
      attachId,
    }, (url) => {
      // utils.downloadFile(url)
      // window.open(url)
      utils.down(`${url}?attname=${name}`, name)
    })
    // attachFiles.forEach(item => {
    //   compositionStore.downloadAttach({
    //     ...params,
    //     attachId: item.id,
    //   }, (url) => {
    //     utils.downloadFile(url)
    //   })
    // })
  }

  handleAnchor = (anchor) => {
    // location.hash = ''
    // location.hash = anchor

    return false
  }

  handleCardModal = (flag) => {
    this.setState({ shareCardModal: !!flag })
  }

  handleFavoritesVisible = (flag) => {
    this.setState({ favoritesModal: !!flag })
  }

  handleFavorVisible = (flag) => {
    this.setState({ favorModal: !!flag })
  }

  render() {
    const {
      detail,
      resultContent,
      articleDetailAds,
      resultAuthorInfo,
      resultNewArticles,
      query,
      navigationData,
      isMobileScreen,
      adStore,
      currentWxacode,
      authorInfo,
    } = this.props
    const { authorInfoFixed, shareCardModal, favoritesModal, favorModal } = this.state

    const tags = detail.tags || []
    const hasTags = tags.length > 0
    const attachFiles = detail.attachFiles || []
    const hasAttach = attachFiles.length > 0
    const hideAttachBar = !hasTags && !hasAttach

    const hasClassification = !!detail.classificationName
    const hasCategory = !!detail.categoryName
    const hasForm = !!detail.formName
    const hasBrand = !!detail.brandName
    const hasProduct = !!detail.productName
    const members = detail.members || []
    const hasMembers = members.length > 0

    const hasBrandProduct = hasBrand && hasProduct
    const hasClassTags = hasClassification && hasTags


    const adImage = articleDetailAds['f_a_d_l_t_1'] || []

    const author = authorInfo.author || {}
    // console.log(toJS(authorInfo))
    const showEnquiry = [AuthorType.PERSONAL, AuthorType.SERVER].includes(author.type)

    return (
      <>
        <div className='article-contanier detail'>
          <div className="article-layout">
            <main className='article-content'>
              <article className="article-detail">
                <header>
                  <h1 className="title">{detail.title}</h1>
                  {!isMobileScreen && <RelatedTags
                    type={detail.type}
                    compositionId={detail.compositionId}
                    rankingListType={detail.rankingListType}
                    featureQuantity={detail.featureQuantity}
                    collectionQuantity={detail.collectionQuantity}
                  />}
                  {!isMobileScreen ? <div className="subinfo">
                    <span className="info">
                      <span className="info-item">
                        <Icon type="clock-circle" theme="filled" /> <Tooltip title={`发布时间：${moment(detail.gmtCreate).format('YYYY-MM-DD HH:mm')}`}>{utils.timeago(detail.gmtCreate)}</Tooltip>
                      </span>
                      {/* <span className="info-item">
                                <Icon type="eye" theme="filled" />  <Tooltip title={`${detail.views} 次阅读`}>{detail.views} 次阅读</Tooltip>
                                </span> */}
                    </span>
                    <span className="info-item fast-comment"><Link route="#comment"><a ><CustomIcon name="edit" /> <Tooltip title="快速评论">快速评论</Tooltip></a></Link></span>
                    {hasMembers && <Members members={members} />}
                  </div>
                    : <div className="author-info-box">
                      <div className="author-avatar">
                        <a href={`/author/${author.code}`} target="_blank"><Avatar src={author.avatar} size={40} /></a>
                      </div>
                      <div className="author-content">
                        <div className="nickname">
                          <a href={`/author/${author.code}`} target="_blank">{author.nickname}</a>
                        </div>
                        <div className="info">
                          <span className="info-item">
                            {utils.timeago(detail.gmtCreate)}
                          </span>
                          <span className="dot">·</span>
                          <span className="info-item">{detail.views}次阅读</span>
                        </div>
                      </div>
                      <div className="author-actions">
                        {authorInfo.followed ? <Button className='followed' onClick={this.handleFollow}>已关注</Button>
                          : <Button className="no-follow" onClick={this.handleFollow}>关注</Button>}
                        {/* {showEnquiry ? <Button type="primary" onClick={this.handleEnquiry}>询价</Button>
                              : <Button type="primary">关注</Button>} */}
                      </div>
                    </div>}
                  <div className="summary">
                    {detail.summary}
                  </div>
                </header>
                <section id="article-content-html" className="content" dangerouslySetInnerHTML={{ __html: resultContent }} />
                <footer>
                  {!isMobileScreen && <div className="favors-container">
                    <FavorIcon
                      favors={detail.favors}
                      isActive={detail.favored}
                      onClick={this.handleFavor}
                    />
                  </div>}
                  {/* {isMobileScreen && 
                          <div className="share-bar article mobile">
                            <ShareGroup 
                              className="left"
                              showCard
                              title={detail.title}
                              description={detail.summary}
                              cover={detail.cover}
                              authorName={detail.authorName}
                              favors={detail.favors}
                              collections={detail.collections}
                              favored={detail.favored}
                              collected={detail.collected}
                              comments={detail.comments}
                              onFavor={this.handleFavor}
                              onCollection={this.handleCollection}
                              // onCard={e => this.handleCardModal(true)}
                              cardIcon={<CardIcon 
                                type={'compositionDetail'}
                                cardName={detail.compositionId}
                                title={detail.title}
                                item={detail}
                              />}
                            />
                          </div>} */}
                  {hasBrandProduct &&
                    <div className="type-item first-type-item">
                      {detail.brandName && <span className="brand"><CustomIcon name="brand" /><a href={`/brand/${detail.brandId}/article`} target="_blank"><Tooltip title={'品牌：' + detail.brandName}><Tag>{detail.brandName}</Tag></Tooltip></a></span>}
                      {detail.productName && <span className="product"><CustomIcon name="production" /><Tooltip title={'产品：' + detail.productName}><span>{detail.productName}</span></Tooltip></span>}
                    </div>}
                  {hasBrandProduct && <div><hr className="separator" /></div>}
                  {detail.classificationName &&
                    <div className="type-item">
                      <span className="classification"><CustomIcon name="classification" /><Tooltip title={'分类：' + detail.classificationName}><a href={`/channel/${detail.classificationId}`} target="_blank">{detail.classificationName}</a></Tooltip></span>
                    </div>}
                  {hasTags &&
                    <div className="type-item">
                      <span className="tags">
                        <CustomIcon name="tag" />
                        {tags.map((item, i) => (<a href={`/tag/${item.tagId}`} target="_blank" key={i}><Tooltip title={item.tagName}><span key={item.id}>{i > 0 && <i>·</i>}{item.tagName}</span></Tooltip></a>))}
                      </span>
                    </div>}
                  {hasClassTags && <div><hr className="separator" /></div>}
                  <div className="type-item">
                    <div className="download-list">
                      {attachFiles.map((item, index) => {
                        return (
                          <div key={index} className="download-item">
                            <div className="download-name" onClick={e => this.handleDownloadAttach(item.id, item.title)}><Icon type="paper-clip" /> <Tooltip title="点击下载此附件">{item.title}</Tooltip></div>
                            <div className="download-info">{item.size}  {item.downloads}次下载</div>
                          </div>)
                      })
                      }
                    </div>
                  </div>
                </footer>
                {!isMobileScreen &&
                  <RenderShareShiftOut render={({ref}) => (
                    <div className="article-share-bar" ref={ref}>
                      <ShareGroup
                        className="left"
                        showCard
                        title={detail.title}
                        description={detail.summary}
                        cover={detail.cover}
                        authorName={detail.authorName}
                        favors={detail.favors}
                        collections={detail.collections}
                        favored={detail.favored}
                        collected={detail.collected}
                        comments={detail.comments}
                        onFavor={this.handleFavor}
                        onCollection={this.handleCollection}
                        // onCard={e => this.handleCardModal(true)}
                        cardIcon={<CardIcon
                          type={'compositionDetail'}
                          cardName={detail.compositionId}
                          title={detail.title}
                          item={detail}
                        />}
                        // miniappIcon={<MiniappIcon
                        //   placement="rightCenter"
                        //   params={{ scene: `id=${detail.compositionId}`, page: 'pages/article/article-detail/article-detail', width: 320 }}
                        // />}
                        miniappIcon={<QRCodeIcon
                          placement="right"
                          url={config.CURRENT_DOMAIN + `/article/${detail.compositionId}`}
                        />}
                      />
                    </div>
                  )} />}
              </article>
              <div>
                {adImage[0] &&
                  <div className="ad-banner">
                    <a href={adImage[0].link || 'javascript:;'} onClick={e => adStore.actionAdClick({ id: adImage[0].id })} target="_blank">
                      <img src={adImage[0].image} alt={adImage[0].title} />
                    </a>
                  </div>}
              </div>
              {!isMobileScreen && <div className="comment-container">
                <CommentBox compositionId={query.id} type={CommentTypes.ARTICLE} />
              </div>}
              <RelatedArticles compositionId={query.id} />
              <RelatedCompositions compositionId={query.id} />
              <div>
                {isMobileScreen &&
                  <div className="comment-container">
                    <CommentBox compositionId={query.id} type={CommentTypes.ARTICLE} hideFirstForm />
                  </div>}
              </div>
              <RelatedCollections compositionId={query.id} compositionType={CompositionTypes.ARTICLE} />
            </main>
            <aside ref={el => this.sideRef = el} className="article-sider article-detail-sider">
              <AuthorInfo compositionId={query.id} fixed={authorInfoFixed} navHide={navigationData.hide} />
              <hr className="separator" />
              <SideProductBox className="article-detail-side-box" />
              <NewArticles />
              <SubscribeComp
                className='side-position'
                wxName={`微信公众号：梅花网`}
                smName={`微信小程序：梅花网`}
              />
            </aside>
          </div>
          {/* {shareCardModal &&
            <CardModal
                visible={shareCardModal}
                type={'compositionDetail'}
                cardName={detail.compositionId}
                title={detail.title}
                item={detail}
                onCancel={e => this.handleCardModal(false)}
            />} */}
        </div>
        {isMobileScreen && <DetailBottomActionBar
          detail={detail}
          commentType={CommentTypes.ARTICLE}
          cardType={'compositionDetail'}
          favored={detail.favored}
          collected={detail.collected}
          comments={detail.comments}
          onFavor={this.handleFavor}
          onCollection={this.handleCollection}
        />}
        <CurrentFavoritesModal
          compositionId={query.id}
          visible={favoritesModal}
          onClose={e => this.handleFavoritesVisible(false)}
          onSuccess={this.handleCollectionSuccess}
        />
        {favorModal && <ActionSuccessModal
          compositionType={CompositionTypes.ARTICLE}
          compositionId={query.id}
          visible={favorModal}
          onClose={e => this.handleFavorVisible(false)}
        />}
      </>
    )
  }
}