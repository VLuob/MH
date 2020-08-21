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
import RelatedFavorites from '../RelatedFavorites'
import RelatedCollections from '../RelatedCollections'
import RelatedShots from '../RelatedShots'
// import ShareGroup from './ShareGroup'
import PartLoading from '@components/features/PartLoading'
import Members from '@components/common/Members'
import FavorIcon from '@components/widget/common/FavorIcon'
import AuthorInfo from '@components/author/AuthorInfo'
import CommentBox from '@containers/comment/CommentBox'
import MiniappIcon from '@containers/widget/MiniappIcon'
import CurrentFavoritesModal from '@containers/collection/CurrentFavoritesModal'
import RelatedTags from '@components/article/RelatedTags'
import ActionSuccessModal from '@containers/composition/ActionSuccessModal'
import FixedActionButtons from '@containers/common/FixedActionButtons'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'

import Gallery from '../Gallery'
import GalleryMobile from '../GalleryMobile'
import ShotsTypeList from '../ShotsTypeList/index.tsx'
import ShotsTypeListMobile from '../ShotsTypeListMobile'
import DetailBottomActionBar from '../DetailBottomActionBar'
import ActionsBar from '../ActionsBar'
import ActionsMobileFullscreen from '../ActionsMobileFullscreen'

import helper from '@utils/helper';
import { storage, config, utils } from '@utils'

import '../DetailContainer/index.less'


const ShareGroup = dynamic(() => import('../ShareGroup'), {ssr: false, loading: () => <span></span>})
// const CardModal = dynamic(() => import('@containers/card/CardModal'), {ssr: false})
const CardIcon = dynamic(() => import('@containers/card/CardIcon'), {ssr: false, loading: () => <span></span>})

const STORAGE_SHOTS_DETAIL_OPEN_INCREMENT = 'detail_open_increment'

let token

interface Props {
    
}

interface State {
  fullScreenModal: boolean
  shareCardModal: boolean
  favoritesModal: boolean
  favorModal: boolean
  isHorizontalScreen: boolean
}

@inject(stores => {
    const { compositionStore, shotsStore, globalStore, accountStore, letterStore } = stores.store
    const { authorInfo, relatedShotsData } = compositionStore
    const { detail, files, filesCount, firstVideoIndex, autoPlay, hasVideo } = shotsStore
    const { currentUser } = accountStore
    const { qiniutoken, isMobileScreen } = globalStore

    return {
      globalStore,
      compositionStore,
      shotsStore,
      accountStore,
      letterStore,
      currentUser,
      detail,
      files,
      filesCount,
      firstVideoIndex,
      autoPlay,
      hasVideo,
      authorInfo: authorInfo.info,
      qiniutoken,
      isMobileScreen,
      relatedShotsData,
    }
})
@observer
export default class DetailContainer extends Component<Props, State> {
  state = {
    fullScreenModal: false,

    shareCardModal: false,
    favoritesModal: false,

    favorModal: false,

    isFullscreen: false,
    isHorizontalScreen: false,
  }

  componentDidMount() {
    this.initEvents()
  }
  
  componentWillUnmount() {
    this.removeEvents()
  }

  initEvents() {
    document.addEventListener('scroll', this.handleScrollEvent, false)
    window.addEventListener('beforeunload', this.handleBeforeUnload, false)
  }

  removeEvents() {
    document.removeEventListener('scroll', this.handleScrollEvent, false)
    window.removeEventListener('beforeunload', this.handleBeforeUnload, false)
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

  handleBeforeUnload = (e) => {
    const event = window.event || e
    // event.returnValue = "您正在编辑作品，确定要关闭网页并保存草稿吗？"
  }




  handleOpenFullScreen = () => {
    this.setState({fullScreenModal: true})
  }

  handleCloseFullScroll = () => {
    this.setState({fullScreenModal: false})
  }

  handleHerizontal = (flag, fn) => {
    // const { isHorizontalScreen } = this.state
    // const nextState = !isHorizontalScreen
    this.setState({isHorizontalScreen: !!flag}, () => {
      if (fn) fn(!!flag)
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
    const { detail, query, compositionStore, shotsStore } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (!token && detail.favored) {
      message.destroy()
      message.warning('您已点击喜欢')
      return
    }

    const nextAction = detail.favored ? ActionType.UNFOCUS : ActionType.FOCUS
    const id = query.id
    const client_code: string = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    const params: any = {
      client_code,
      id,
      action: nextAction,
      type: FavorTypes.SHOTS,
    }
    if (token) {
      params.token = token
    }
    shotsStore.fetchFavor(params).then(res => {
      message.destroy()
      if (res.success) {
        if (!!nextAction) {
          this.handleFavorVisible(true)
        } else {
          message.success('已取消喜欢')
        }
      } else {
        message.error(res.data.msg)
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

  handleCollectionSuccess = (option) => {
    const { shotsStore } = this.props
    shotsStore.setCollections(option.action)
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

  handleToggleFullscreen = (flag) => {
    this.setState({isFullscreen: flag})
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

  handlePlayerCompleted = () => {
    const { autoPlay, relatedShotsData } = this.props
    if (autoPlay) {
      const relatedCompositions = relatedShotsData.list || []
      const record = relatedCompositions[0]
      // if (record) {
      //   location.href = `/shots/${record.compositionId}`
      // }
    }
  }

  renderMobile(option) {
    const { 
      currentUser={},
      detail, 
      files, 
      filesCount, 
      firstVideoIndex, 
      autoPlay,
      hasVideo,
      authorInfo, 
      query, 
      isMobileScreen,
      relatedShotsData,
    } = this.props
    const {
      isFullscreen
    } = this.state
    const {
      author,
      authorCompositions,
      attachFiles,
      hasAttach,
      members,
      hasMembers,
      tags,
      hasTags,
    } = option

    const isLogin = !!currentUser.id

    const relatedShots = relatedShotsData.list || []

    const galleryIndex = autoPlay ? firstVideoIndex : 0

    return (
      <>
      {isMobileScreen && !isFullscreen && <MbNavigatorBar 
                    showTitle 
                    btnType="back"
                    backUrl="/shots"
                    title={detail.authorName} 
                />}
      <div className='shots-detail-contanier shots-detail-mobile'>
        <div className="shots-gallery-container">
          <div className="shots-gallery">
            <GalleryMobile
              files={files}
              detail={detail}
              filesCount={filesCount}
              index={galleryIndex}
              autoPlay={autoPlay}
              hasVideo={hasVideo}
              author={author}
              onFollow={this.handleFollow}
              onEnquiry={this.handleEnquiry}
              onFavor={this.handleFavor}
              onCollection={this.handleCollection}
              onToggleFullscreen={this.handleToggleFullscreen}
            />
            <div className="shots-info-container">
              <div className="author-wrapper mb-author-wrapper">
                <AuthorInfo
                  type={detail.authorType}
                  editionType={author.editionType}
                  onFollow={this.handleFollow}
                  onEnquiry={this.handleEnquiry}
                  authorName={detail.authorName}
                  authorCode={detail.authorCode}
                  authorAvatar={detail.authorAvatar}
                  authorFollowed={detail.authorFollowed}
                />
              </div>
              <div className="shots-info-content">
                <div className="title-group">
                  <h1 className="title">{detail.title}</h1><div className="info">
                    {/* <span className="info-item">{moment(detail.gmtPublished).format('YYYY-MM-DD')}{detail.gmtFirstRelease ? `（发布月份：${moment(detail.gmtFirstRelease).format('YYYY-MM')}）` : null}</span>   */}
                    <span className="info-item">{moment(detail.gmtPublished).format('YYYY-MM-DD')}</span>  
                    <span className="info-item">{detail.views} 次阅读</span>
                  </div>
                  <div className="summary">
                    <pre>{detail.summary}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
        <div className="composition-type-list">
          {/* <ShotsTypeListMobile
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
            onDownloadAttach={this.handleDownloadAttach}
          /> */}
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
            ranking={detail.ranking || []}
            featureQuantity={detail.featureQuantity}
            collectionQuantity={detail.collectionQuantity}
            onDownloadAttach={this.handleDownloadAttach}
          />
        </div>
        <div className="related-recommend-wrapper">
          <RelatedShots compositionId={query.id} />
        </div>
        <div className="shots-comment">
          <div className="comment-container">
            <CommentBox compositionId={query.id} type={CommentTypes.SHOTS} hideFirstForm />
          </div>
        </div>
        <dev className="related-recommend-wrapper">
          <RelatedFavorites compositionId={query.id} compositionType={CompositionTypes.SHOTS} />
        </dev>

    </div>
    </>
    )
  }

  renderPc(option) {
    const { 
      currentUser={},
      detail, 
      files, 
      filesCount, 
      firstVideoIndex, 
      autoPlay,
      hasVideo,
      authorInfo, 
      query, 
      isMobileScreen,
      relatedShotsData,
    } = this.props
    const { isHorizontalScreen } = this.state
    const {
      author,
      authorCompositions,
      attachFiles,
      hasAttach,
      members,
      hasMembers,
      tags,
      hasTags,
    } = option

    const isLogin = !!currentUser.id

    const relatedShots = relatedShotsData.list || []

    const galleryIndex = autoPlay ? firstVideoIndex : 0

    return (
      <div className="shots-detail-body">

          <div className={classnames('shots-detail-contanier shots-detail-layout', {'herizontal': isHorizontalScreen})} style={{justifyContent: 'center'}}>
            <main className="shots-detail-main">
              <div className={classnames('shots-gallery-container')}>
              <div className="composition-preview-intro">
                此为发布预览的临时链接，仅用于临时预览，地址将在短期内失效
              </div>
                <div className="shots-gallery-content">
                  {!isHorizontalScreen && <header>
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
                    <Gallery 
                      isPreview
                      detail={detail}
                      files={files}
                      filesCount={filesCount}
                      index={galleryIndex}
                      autoPlay={autoPlay}
                      hasVideo={hasVideo}
                      isHorizontalScreen={isHorizontalScreen}
                      author={author}
                      relatedShots={relatedShots}
                      onFollow={this.handleFollow}
                      onEnquiry={this.handleEnquiry}
                      onFavor={this.handleFavor}
                      onCollection={this.handleCollection}
                      onHerizontal={this.handleHerizontal}
                      onPlayerCompleted={this.handlePlayerCompleted}
                    />
                  </div>
                </div>
              </div>

              <div className="shots-content-info-wrapper">
                <div className="shots-content-main">
                  <div className="shots-actions-bar-container">
                    <ActionsBar 
                      isLogin={isLogin}
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
                      renderAuthor={
                        isHorizontalScreen ? <AuthorInfo
                          authorName={detail.authorName}
                          authorCode={detail.authorCode}
                          authorAvatar={detail.authorAvatar}
                          authorFollowed={detail.authorFollowed}
                          type={detail.authorType}
                          editionType={author.editionType}
                          onFollow={this.handleFollow}
                          onEnquiry={this.handleEnquiry}
                        /> : null
                      }
                    />
                  </div>

                  <div className="shots-info-container">
                    <div className="shots-info-content">
                      <div className="title-group">
                        <h1 className="title">{detail.title}</h1>
                        <div className="info">
                          <span className="info-item"><Tooltip title={`发布时间：${moment(detail.gmtPublished).format('YYYY-MM-DD HH:mm')}`}>{moment(detail.gmtPublished).format('YYYY-MM-DD')}</Tooltip></span>  
                          <span className="info-item"><Tooltip title={`${detail.views} 次阅读`}>{detail.views} 次阅读</Tooltip></span>
                          <span className="info-item"><Tooltip title={`品类：${detail.categoryName}`}><a href={`/shots?category=${detail.categoryId}`} target="_blank">{detail.categoryName}</a></Tooltip> - <Tooltip title={`形式：${detail.formName}`}><a href={`/shots?form=${detail.formId}`} target="_blank">{detail.formName}</a></Tooltip></span>
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
                        ranking={detail.ranking || []}
                        featureQuantity={detail.featureQuantity}
                        collectionQuantity={detail.collectionQuantity}
                        onDownloadAttach={this.handleDownloadAttach}
                      />
                    </div>
                  </div>

                  
                </div>
                
                {/* {isHorizontalScreen &&<div className="shots-content-side">
                   <div className="related-recommend-wrapper">
                    <RelatedShots compositionId={query.id} />
                    <RelatedFavorites compositionId={query.id} compositionType={CompositionTypes.SHOTS} />
                  </div>
                </div>} */}
              </div>
            </main>
            {/* {!isHorizontalScreen && <div className="shots-detail-side">
                  <div className="related-recommend-wrapper">
                    <RelatedShots compositionId={query.id} />
                    <RelatedFavorites compositionId={query.id} compositionType={CompositionTypes.SHOTS} />
                  </div>
            </div>} */}
        </div>
      </div>
    )
  }

  render() {
      const { detail, files, filesCount, authorInfo, query, isMobileScreen } = this.props
      const { shareCardModal, favoritesModal, favorModal, isHorizontalScreen, isFullscreen } = this.state
      const author = authorInfo.author || {}
      const authorCompositions = (authorInfo.latestCompositions || []).slice(0,4)
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
          {isMobileScreen && !isFullscreen && <DetailBottomActionBar
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
              onSuccess={this.handleCollectionSuccess}
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