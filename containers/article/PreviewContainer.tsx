import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import jsCookie from 'js-cookie'
import moment from 'moment'
import { 
  Icon,
  Button, 
  Tag,
  Row,
  Col,
  message,
  Select,
  Tooltip,
} from 'antd'
import Swiper from 'swiper'

import { config } from '@utils'
import { Link } from '@routes'
import { FavorTypes, CollectionTypes, ActionType } from '@base/enums'
import { composition } from '@base/system'
import CIcon from '@components/widget/common/Icon'
import NewArticles from './NewArticles'
import AuthorInfo from './AuthorInfoPreview'
import RelatedCompositions from '../shots/RelatedCompositions'
import RelatedArticles from './RelatedArticles'
import SubscribeComp from '@components/common/SubscribeComp'
import ShareGroup from '@containers/shots/ShareGroup'
import Members from '@components/common/Members'
import FavorIcon from '@components/widget/common/FavorIcon'
import { toJS } from 'mobx'


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

const getView = (view) => {
  let label = ''
  if (view >= 10000) {
    label = `${Math.floor(view/10000)}万`
  } else {
    label = view || 0
  }
  return label
}

@inject(stores => {
    const { compositionStore } = stores.store
    const { compositionPreview } = compositionStore

    return {
        compositionStore,
        detail: compositionPreview.composition || {},
        author: compositionPreview.author || {},
    }
})
@observer
export default class DetailContainer extends Component<Props, State> {

  componentDidMount() {
      const { compositionStore, resultCompositionPreview} = this.props
      compositionStore.resetCompositionPreview(resultCompositionPreview)

      this.initInnerShots()
      this.initLazyload()
  }

  initLazyload() {
    if (typeof window === 'undefined' && typeof lazyload === 'undefined') {
      return
    }
    let images = document.querySelectorAll(".content img");
    lazyload(images, {effect : "fadeIn"});
  }


  initSwiper() {
    this.mySwiper = new Swiper('.swiper-container', {
      slidesPerView: 2,
      spaceBetween: 30,
      slidesPerGroup: 2,
      // loop: true,
      // loopFillGroupWithBlank: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    })
  }

  initInnerShots() {
    const contentEl = document.querySelector('#article-content-html')
    if (!contentEl) {
      return
    }
    const innerShotsEls = contentEl.querySelectorAll('.inner-shots-placeholder')
    // console.log(innerShotsEls)
    for(let k in innerShotsEls) {
      const innerShotsEl = innerShotsEls[k] 
      if (innerShotsEl.nodeType === 1) {
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

  handleFavor = () =>  {
    message.success('感谢喜欢')
  }


  render() {
      const { detail, author, resultContent, resultAuthorInfo, query, compositionStore } = this.props

      console.log('detail', toJS(detail), toJS(author), toJS(compositionStore))

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
      const hasClassTags =  hasClassification && hasTags

      return (
          <div className='article-contanier detail preview'>
              <div className="composition-preview-intro">
                此为发布预览的临时链接，仅用于临时预览，地址将在短期内失效
              </div>
              <div className="article-layout">
                  <main className='article-content'>
                      <article className="article-detail">
                        <header>
                          <h1 className="title">{detail.title}</h1>
                          <div className="subinfo">
                            <span className="info">
                              <span className="info-item">
                                <Icon type="clock-circle" theme="filled" /> <Tooltip title={`发布时间：${moment(detail.gmtCreate).format('YYYY-MM-DD HH:mm')}`}>{moment(detail.gmtCreate).format('YYYY-MM-DD')}</Tooltip>
                              </span> <span className="info">
                                <Icon type="eye" theme="filled" />  <Tooltip title={`${detail.views} 次阅读`}>{detail.views} 次阅读</Tooltip>
                                </span>
                              </span> 
                              {/* <span className="info-item fast-comment"><Link route="#comment"><a ><CIcon name="edit" /> <Tooltip title="快速评论">快速评论</Tooltip></a></Link></span> */}
                              {hasMembers && <Members members={members} />}
                            </div>
                          <div className="summary">{detail.summary}</div>
                        </header>
                        <section id="article-content-html" className="content" dangerouslySetInnerHTML={{ __html: resultContent }} />
                        <footer>
                          {hasBrandProduct && <div className="type-item first-type-item">
                            {detail.brandName && <span className="brand"><img src={iconBrand} /> <a href={`/brand/${detail.brandId}/article`} target="_blank"><Tooltip title={'品牌：' + detail.brandName}><Tag>{detail.brandName}</Tag></Tooltip></a></span>}
                            {detail.productName && <span className="product"><img src={iconProduction} /> <Tooltip title={'产品：' + detail.productName}><span>{detail.productName}</span></Tooltip></span>}
                          </div>}
                          {hasBrandProduct && <div><hr className="separator"/></div>}
                          {detail.classificationName &&
                            <div className="type-item">
                              <span className="classification"><Icon type="appstore" theme="filled" /> <Tooltip title={'分类：' + detail.classificationName}><span>{detail.classificationName}</span></Tooltip></span>
                            </div>}
                          {hasTags &&
                          <div className="type-item">
                            <span className="tags">
                            <Icon type="tag" /> 
                            {tags.map((item, i) => (<a href={`/tag/${item.tagId}/article`} target="_blank" key={i}><Tooltip title={item.tagName}><span key={item.id}>{i > 0 && <i>·</i>}{item.tagName}</span></Tooltip></a>))}
                            </span>
                          </div>}
                          {hasClassTags && <div><hr className="separator"/></div>}
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
                      </article>
               
                  </main>
                  <aside className="article-sider">
                    <AuthorInfo 
                      isPreview
                      compositionId={detail.id}
                      authorInfo={author} 
                    />
                  </aside>
              </div>

          </div>
      )
  }
}