import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import classnames from 'classnames'
import moment from 'moment'
import jsCookie from 'js-cookie'
import { toJS } from 'mobx'
import { 
  Icon,
  Button, 
  Tag,
  Row,
  Col,
  Avatar,
  message,
  Modal,
  Tooltip,
} from 'antd'

import { Link } from '@routes'
import { config } from '@utils/'
import { CompositionTypes, AuthorType, FavorTypes, ActionType, FollowTypes } from '@base/enums'
import ShotsGallery from './ShotsGallery'
// import GalleryFullScreen from './GalleryFullScreen'
import CIcon from '@components/widget/common/Icon'
import PartLoading from '@components/features/PartLoading'
import RelatedCompositions from './RelatedCompositions'
import ShareGroup from './ShareGroup'
import Members from '@components/common/Members'
import FavorIcon from '@components/widget/common/FavorIcon'
import AuthorInfo from '@components/author/AuthorInfo'

const iconBrand = '/static/images/icon/icon_brand.svg'
const iconForm = '/static/images/icon/icon_form.svg'
const iconPublishTime = '/static/images/icon/icon_pulish_time.svg'
const iconProduction = '/static/images/icon/icon_production.svg'


let token

interface Props {
    
}

interface State {
    current: number
}


@inject(stores => {
    const { compositionStore } = stores.store
    const { compositionPreview, authorInfo } = compositionStore

    return {
        compositionStore,
        detail: compositionPreview.composition || {},
        author: compositionPreview.author || {},
        authorInfo: authorInfo.info,
    }
})
@observer
export default class PreviewContainer extends Component<Props, State> {
  state = {
    fullScreenModal: false
  }

  componentDidMount() {
      const { compositionStore, resultCompositionPreview, query} = this.props
      const compositionId = query.id
      // if (!query.id) {
      //   message.destroy()
      //   message.error('id参数错误')

      //   return
      // }
      // token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
      // const client = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
      // // compositionStore.resetCompositionDetail()
      // compositionStore.fetchComposition({ compositionId, client, token, op: 2 })
      

      compositionStore.resetCompositionPreview(resultCompositionPreview)
      compositionStore.fetchAuthor({compositionId})
      // compositionStore.fetchRelatedCompositions({
      //   compositionId,
      //   type: CompositionTypes.SHOTS,
      //   page: 1,
      //   limit: 9,
      // })

  }

  handleOpenFullScreen = () => {
    this.setState({fullScreenModal: true})

  }

  handleCloseFullScroll = () => {
    this.setState({fullScreenModal: false})
  }

  handleFollow = () => {
      message.success('感谢关注')
  }
    
  handleFavor = () =>  {
      message.success('感谢喜欢')
  }


  render() {
      const { detail, authorInfo, query, author } = this.props
      // const author = authorInfo.author || {}
      const authorCompositions = (authorInfo.latestCompositions || []).slice(0,4)
      const files = detail.files || []
      const attachFiles = detail.attachFiles || []
      const hasAttach = attachFiles.length > 0
      const members = detail.members || []
      const hasMembers = members.length > 0
      const tags = detail.tags || []
      const hasTags = tags.length > 0

      const isLogin = !!token

      // console.log('detail', toJS(detail), toJS(author))

      return (
        <>
          <div className='shots-detail-contanier'>
              <header>
                <div className="header-container">
                  <div className="header-wrapper">
                    <AuthorInfo
                      authorName={author.name}
                      authorCode={author.code}
                      authorAvatar={author.avatar}
                      type={author.type}
                      editionType={author.editionType}
                      // authorFollowed={detail.authorFollowed}
                      // onFollow={this.handleFollow}
                    />
                    {/* {hasMembers && <Members members={members} />} */}
                  </div>
                </div>
              </header>
              <div className="shots-gallery-container">
              <div className="composition-preview-intro">
                此为发布预览的临时链接，仅用于临时预览，地址将在短期内失效
              </div>
                <div className="shots-gallery">
                  <ShotsGallery 
                    files={files}
                    detail={detail}
                    author={author}
                    onFavor={e => message.success('欢迎喜欢')}
                    onCollection={e => message.success('欢迎收藏')}
                  />
                  <div className="shots-info-container">
                    <div className="shots-info-content">
                      <div className="title-group">
                        <div className="title">
                        {detail.title}
                        </div>
                        <div className="info">
                          <span className="info-item"><Icon type="clock-circle" theme="filled" /> <Tooltip title={`发布时间：${moment(detail.gmtPublished).format('YYYY-MM-DD HH:mm')}`}>{moment(detail.gmtPublished).format('YYYY-MM-DD')}</Tooltip></span>  
                          <span className="info-item"><Icon type="eye" theme="filled" /> <Tooltip title={`${detail.views} 次阅读`}>{detail.views} 次阅读</Tooltip></span>
                          <span className="info-item fast-comment"><Link route="#comment"><a><CIcon name="edit" /><Tooltip title="快速评论">快速评论</Tooltip></a></Link></span>
                        </div>
                        <div className="summary">
                          <pre>{detail.summary}</pre>
                        </div>
                      </div>
                      {/* <div className="favors-container">
                        <FavorIcon
                          favors={detail.favors}
                          isActive={detail.favored}
                          onClick={this.handleFavor}
                        />
                      </div> */}
                    </div>
                    <div className="shots-info-sider">
                      <ul className="type-list">
                        {detail.brandName && <li className="type-item"><img src={iconBrand} /> <a href={`/brand/${detail.brandId}/shots`} target="_blank"><Tooltip title={'品牌：' + detail.brandName}><Tag>{detail.brandName}</Tag></Tooltip></a></li>}
                        {detail.productName && <li className="type-item"><img src={iconProduction} /> <Tooltip title={'产品：' + detail.productName}><span>{detail.productName}</span></Tooltip></li>}
                        {(detail.brandName || detail.productName) && <li className="type-item"><hr className="separator"/></li>}
                        <li className="type-item"><Icon type="appstore" theme="filled" /> <Tooltip title={'品类：' + detail.categoryName}><span>{detail.categoryName}</span></Tooltip></li>
                        <li className="type-item"><img src={iconForm} /> <Tooltip title={'形式：' + detail.formName}><span>{detail.formName}</span></Tooltip></li>
                        {detail.gmtFirstRelease && <li className="type-item"><img src={iconPublishTime} /> <Tooltip title={'发表月度：' + moment(detail.gmtFirstRelease).format('YYYY-MM')}><span>{moment(detail.gmtFirstRelease).format('YYYY-MM')}</span></Tooltip></li>}
                        {hasTags && 
                          <li className="type-item tags">
                            <Icon type="tag" /> 
                            {tags.map((item, i) => (<a href={`/tag/${item.tagId}/shots`} target="_blank"><Tooltip title={item.tagName}><span key={item.id}>{i > 0 && <i>·</i>}{item.tagName}</span></Tooltip></a>))}
                          </li>}
                        <li className="type-item"><hr className="separator"/></li>
                        <li className="type-item">
                          <div className="download-list">
                          {attachFiles.map((item, index) => {
                            return (
                            <div key={index} className="download-item">
                              <div className="download-name" onClick={e => message.success('感谢下载')}><Icon type="paper-clip" /> <Tooltip title="点击下载此附件">{item.title}</Tooltip></div>
                              <div className="download-info">{item.size}  {item.downloads}次下载</div>
                            </div>)
                          })
                        }
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </>
      )
  }
}