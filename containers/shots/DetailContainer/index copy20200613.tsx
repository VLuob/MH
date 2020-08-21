import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import classnames from 'classnames'
import moment from 'moment'
import jsCookie from 'js-cookie'
import { toJS } from 'mobx'
import { 
  Icon,
  message,
  Tooltip,
} from 'antd'

import { Link } from '@routes'
import { config, utils } from '@utils/'
import { 
  FavorTypes, 
  ActionType, 
  FollowTypes, 
  CollectionTypes, 
  CompositionTypes,
  CommentTypes, 
  LetterSendType, 
  LetterSources, 
  LetterSenderTypes, 
  LetterReceiverTypes
} from '@base/enums'
import CIcon from '@components/widget/common/Icon'

import RelatedCompositions from '../RelatedCompositions'
import RelatedCollections from '../RelatedCollections'
import RelatedShots from '../RelatedShots'
// import ShareGroup from './ShareGroup'
import PartLoading from '@components/features/PartLoading'
import Members from '@components/common/Members'
import FavorIcon from '@components/widget/common/FavorIcon'
import AuthorInfo from '@components/author/AuthorInfo'
import CommentBox from '@containers/comment/CommentBox'
import ShotsGallery from '../ShotsGallery'
import ShotsGalleryMobile from '../ShotsGalleryMobile'
import MiniappIcon from '@containers/widget/MiniappIcon'
import CurrentFavoritesModal from '@containers/collection/CurrentFavoritesModal'
import RelatedTags from '@components/article/RelatedTags'
import ActionSuccessModal from '@containers/composition/ActionSuccessModal'

import FixedActionButtons from '@containers/common/FixedActionButtons'
import ShotsTypeList from '../ShotsTypeList/index.tsx'
import ShotsTypeListMobile from '../ShotsTypeListMobile'
import DetailBottomActionBar from '../DetailBottomActionBar'
import ActionsBar from '../ActionsBar'
import helper from '@utils/helper';

import './index.less'


const ShareGroup = dynamic(() => import('../ShareGroup'), {ssr: false, loading: () => <span></span>})
// const CardModal = dynamic(() => import('@containers/card/CardModal'), {ssr: false})
const CardIcon = dynamic(() => import('@containers/card/CardIcon'), {ssr: false, loading: () => <span></span>})


let token

interface Props {
    
}

interface State {
  fullScreenModal: boolean
  shareCardModal: boolean
  favoritesModal: boolean
  favorModal: boolean
}


@inject(stores => {
    const { compositionStore, globalStore, accountStore, letterStore } = stores.store
    const { compositionDetail, authorInfo } = compositionStore
    const { currentUser } = accountStore

    return {
      globalStore,
      compositionStore,
      accountStore,
      letterStore,
      currentUser,
      detail: compositionDetail.composition || {},
      authorInfo: authorInfo.info,
      qiniutoken: globalStore.qiniutoken,
      isMobileScreen: globalStore.isMobileScreen,
    }
})
@observer
export default class DetailContainer extends Component<Props, State> {
  state = {
    fullScreenModal: false,

    shareCardModal: false,
    favoritesModal: false,

    favorModal: false,

    isHerizontalScreen: true,
  }

  componentDidMount() {
      this.initEvents()
  }
  
  componentWillUnmount() {
    this.removeEvents()
  }

  initEvents() {
    document.addEventListener('scroll', this.handleScrollEvent, false)
  }

  removeEvents() {
    document.removeEventListener('scroll', this.handleScrollEvent, false)
  }

  handleScrollEvent = (e) => {
    const commonSubFooter = document.querySelector('.common-sub-footer')
    const shareRef = document.querySelector('.share-bar .share-container')
    
    if (shareRef && commonSubFooter) {
      const shareRect = shareRef.getBoundingClientRect()
      const bottomRect = commonSubFooter.getBoundingClientRect()


      if (shareRef.style.position === '') {
        shareRef.style.position = 'fixed'
        shareRef.style.top = `200px`
        shareRef.style.left = `${shareRect.left}px`
        shareRef.style.width = '40px'
      }

      if (shareRect.bottom > bottomRect.top + 10) {
        shareRef.classList.add('hidden')
      } else {
        shareRef.classList.remove('hidden')
      }
    }
    
  }

  handleOpenFullScreen = () => {
    this.setState({fullScreenModal: true})
  }

  handleCloseFullScroll = () => {
    this.setState({fullScreenModal: false})
  }

  handleHerizontal = (fn) => {
    const { isHerizontalScreen } = this.state
    const nextState = !isHerizontalScreen
    this.setState({isHerizontalScreen: nextState}, () => {
      if (fn) fn(nextState)
    })
  }

  handleEnquiry = () => {
    const { letterStore, detail } = this.props;
    token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)

    letterStore.openEnquiry({
      type: LetterSendType.SEND,
      senderType: LetterSenderTypes.USER, // 1梅花网用户 2 创作者
      // senderAvatar: currentUser.avatar,
      receiverType: LetterReceiverTypes.AUTHOR,
      receiverId: detail.authorId,
      // receiverNickName: author.nickname,
      source: LetterSources.SHOTS_DETAIL,
      relationId: detail.compositionId,
    })
  }

  handleFollow = () => {
    const { compositionStore, detail, query } = this.props;
    token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)

    if (!token) {
      message.warning('请先登录后操作！')
      setTimeout(() => {
        window.open('/signin?c=' + location.href)
      }, 200)
      return
    }

    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    const id = detail.authorId
    const action = detail.authorFollowed ? ActionType.UNFOCUS : ActionType.FOCUS
    const type = FollowTypes.AUTHOR
    compositionStore.fetchActionFollow({token, client_code, id, type, action})
  }

  handleFavor = () =>  {
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
      type: FavorTypes.SHOTS,
    }
    if (token) {
      params.token = token
    }
    compositionStore.fetchActionFavor(params).then(res => {
      if (res.success && !!nextAction) {
        this.handleFavorVisible(true)
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
    // const type = CollectionTypes.SHOTS
    // compositionStore.fetchActionCollection({token, clientCode, compositionId, type, action})
  }

  handleDownloadAttach = (attachId, name) => {
    const { compositionStore, query } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (!token) {
      location.href = '/signin?c=' + location.href
      return
    }
    
    const compositionId = query.id
    const client = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    compositionStore.downloadAttach({
      compositionId,
      token,
      client,
      attachId,
    }, (url) => {
      // utils.downloadFile(url)
      // window.open(url)
      utils.down(`${url}?attname=${name}`, name)
    })
  }


  handleCardModal = (flag) => {
    this.getImageUrl((imgUrl) => {
      // console.log(imgUrl)
    })
    this.setState({shareCardModal: !!flag})
  }

  handleFavoritesVisible = (flag) => {
    this.setState({favoritesModal: !!flag})
  }

  handleFavorVisible = (flag) => {
    this.setState({favorModal: !!flag})
  }


  renderPc(option) {
    const { detail, authorInfo, query, isMobileScreen } = this.props
    const { isHerizontalScreen } = this.state
    const {
      author,
      authorCompositions,
      files,
      attachFiles,
      hasAttach,
      members,
      hasMembers,
      tags,
      hasTags,
    } = option

    return (
      <div className='shots-detail-contanier shots-detail-layout'>
        <div className={classnames('shots-gallery-container', {'herizontal': isHerizontalScreen})}>
          <div className="shots-gallery-content">
            {!isHerizontalScreen && <header>
              <div className="header-container">
                <div className="header-wrapper">
                  <AuthorInfo
                    authorName={detail.authorName}
                    authorCode={detail.authorCode}
                    authorAvatar={detail.authorAvatar}
                    authorFollowed={detail.authorFollowed}
                    type={detail.authorType}
                    editionType={author.editionType}
                    onFollow={this.handleFollow}
                    onEnquiry={this.handleEnquiry}
                  />
                  {hasMembers && <Members members={members} />}
                </div>
              </div>
            </header>}
            <div className="shots-gallery">
              <ShotsGallery 
                files={files}
                detail={detail}
                author={author}
                onFollow={this.handleFollow}
                onEnquiry={this.handleEnquiry}
                onFavor={this.handleFavor}
                onCollection={this.handleCollection}
                onHerizontal={this.handleHerizontal}
              />
            </div>
          </div>
          {!isHerizontalScreen && <div className="shots-gallery-side">
            <RelatedShots compositionId={query.id} />
          </div>}
        </div>

        <div className="shots-content-info-wrapper">
          <div className="shots-content-main">

            <div className="shots-actions-bar-container">
              <ActionsBar 
                detail={detail}
                commentType={CommentTypes.SHOTS}
                cardType={'compositionDetail'}
                favors={detail.favors}
                collections={detail.collections}
                comments={detail.comments}
                favored={detail.favored}
                collected={detail.collected}
                comments={detail.comments}
                onFavor={this.handleFavor}
                onCollection={this.handleCollection}
              />
            </div>

            <div className="shots-info-container">
              <div className="shots-info-content">
                <div className="title-group">
                  <h1 className="title">{detail.title}</h1>
                  <div className="info">
                    <span className="info-item"><Tooltip title={`发布时间：${moment(detail.gmtPublished).format('YYYY-MM-DD HH:mm')}`}>{moment(detail.gmtPublished).format('YYYY-MM-DD')}</Tooltip></span>  
                    <span className="info-item"><Tooltip title={`${detail.views} 次阅读`}>{detail.views} 次阅读</Tooltip></span>
                    {/* <span className="info-item fast-comment"><Link route="#comment"><a><CIcon name="edit" /><Tooltip title="快速评论">快速评论</Tooltip></a></Link></span> */}
                  </div>
                  <div className="summary">
                    <pre>{detail.summary}</pre>
                  </div>
                </div>
                <div className="favors-container">
                  <FavorIcon
                    favors={detail.favors}
                    isActive={detail.favored}
                    onClick={this.handleFavor}
                  />
                </div>
                <div className="share-bar shots">
                  <ShareGroup
                      className="right"
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
                      cardIcon={
                        <CardIcon 
                          type={'compositionDetail'}
                          cardName={detail.compositionId}
                          title={detail.title}
                          item={detail}
                        />}
                        miniappIcon={<MiniappIcon
                          placement="leftCenter"
                          params={{scene: `id=${detail.compositionId}`, page: 'pages/shots/shots-detail/shots-detail', width: 320}}
                        />}
                  />
                </div>
              </div>
              <div className="shots-info-list">
                <ShotsTypeList
                  brandId={detail.brandId}
                  brandName={detail.brandName}
                  productName={detail.productName}
                  categoryId={detail.categoryId}
                  categoryName={detail.categoryName}
                  formId={detail.formId}
                  formName={detail.formName}
                  gmtFirstRelease={detail.gmtFirstRelease}
                  tags={detail.tags || []}
                  attachFiles={attachFiles}
                  type={detail.type}
                  compositionId={detail.compositionId}
                  identificationList={detail.identificationList}
                  rankingListType={detail.rankingListType}
                  featureQuantity={detail.featureQuantity}
                  collectionQuantity={detail.collectionQuantity}
                  onDownloadAttach={this.handleDownloadAttach}
                />
              </div>
            </div>

            <div className="shots-comment">
              <div className="comment-container">
                <CommentBox compositionId={query.id} type={CommentTypes.SHOTS} />
              </div>
            </div>
          </div>
          
          <div className="shots-content-side">
            {isHerizontalScreen && <RelatedShots compositionId={query.id} />}
          </div>
        </div>
    </div>
    )
  }

  render() {
      const { detail, authorInfo, query, isMobileScreen } = this.props
      const { shareCardModal, favoritesModal, favorModal, isHerizontalScreen } = this.state
      const author = authorInfo.author || {}
      const authorCompositions = (authorInfo.latestCompositions || []).slice(0,4)
      const files = detail.files || []
      const attachFiles = detail.attachFiles || []
      const hasAttach = attachFiles.length > 0
      const members = detail.members || []
      const hasMembers = members.length > 0
      const tags = detail.tags || []
      const hasTags = tags.length > 0

      // console.log('shots detail', toJS(detail), toJS(author))

      const renderOption = {
        author,
        authorCompositions,
        files,
        attachFiles,
        hasAttach,
        members,
        hasMembers,
        tags,
        hasTags,
      }

      return (
        <>
          {this.renderPc(renderOption)}
          
          {isMobileScreen && <DetailBottomActionBar
            detail={detail}
            commentType={CommentTypes.SHOTS}
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
          />
          {favorModal && <ActionSuccessModal
            compositionId={query.id}
            visible={favorModal}
            onClose={e => this.handleFavorVisible(false)}
          />}
        </>
      )
  }
}