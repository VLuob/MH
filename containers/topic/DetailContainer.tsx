import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'
import debounce from 'lodash/debounce';
import jsCookie from 'js-cookie'
import { Row, Col, Pagination } from 'antd'
import classnames from 'classnames'

import ArticleBox from './ArticleBox'
import ShotsBox from './ShotsBox'
import ShareGroup from '@containers/shots/ShareGroup'
import CommentBox from '@containers/comment/CommentBox'

import { TopicModuleTypes, CommentTypes } from '@base/enums'
import { utils, config } from '@utils'


interface Props {
    
}

interface State {
    current: number
}

@inject(stores => {
    const { topicStore, commentStore, globalStore } = stores.store
    const { commentData } = commentStore
    const { isMobileScreen } = globalStore

    return {
        topicStore,
        commentData,
        isMobileScreen,
        detail: topicStore.topicDetail || {},
    }
})
@observer
export default class TopicContainer extends Component<Props, State> {
    constructor(props) {
      super(props)
      this.handleResize = debounce(this.handleResize, 500)
    }

    state = {
      gutter: 30,

      moduleNav: '',
    }

    componentDidMount() {
      this.handleResize()
      this.initEvents()
      this.initModuleNav()
    }

    componentWillUnmount() {
      this.removeEvents()
    }

    initEvents() {

      window.addEventListener('resize', this.handleResize, false)
    }

    removeEvents() {
      window.removeEventListener('resize', this.handleResize, false)
    }

    handleResize = (e) => {
      const winWidth = window.innerWidth
      const gutter = winWidth > 768 ? 30 : 15
      this.setState({gutter})
    }


    initModuleNav() {
      const hash = location.hash
      this.setState({moduleNav: hash})
    }

    handleModuleNav = (moduleNav) => {
      this.setState({moduleNav})
    }

    handlePagination = (page, size, module_id, index) => {
      const { query, topicStore } = this.props
      const topic_id = query.id
      const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
      topicStore.fetchModuleContents({
        client_code,
        feature_id: topic_id,
        module_id,
        page,
        size,
      }, (res) => {
        if (res.success) {
          location.hash = ''
          location.hash = `#module-${index}`
        }
      })
    }

    handleFavor = (option) => {
      const { topicStore } = this.props
      topicStore.fetchActionFavor(option)
    }

    render() {
        const { isMobileScreen, detail, query, commentData, works_limit } = this.props
        const { gutter, moduleNav } = this.state

        const commentList = commentData.list || []
        const commentCount = commentList.length

        const moduleList = (detail.cfmList || [])
        const moduleNavList = moduleList.filter(item => item.showNavigation)
        const hasModuleNav = moduleNavList.length > 0

        const banners = detail.banner ? detail.banner.split('|') : []
        const hasBanners = !isMobileScreen && banners.length >= 18 || isMobileScreen && banners.length >= 6

  
        return (
            <div className='topic-contanier detail'>
                <div className={classnames('topic-header', {nocover: !hasBanners})}>
                    <div className={classnames({'topic-header-cover': hasBanners})}>
                        {/* <img className="img-banner" src={`${detail.banner}?imageMogr2/thumbnail/!1920x360r/gravity/center/crop/1920x360`} alt=""/>
                        <img className="img-cover" src={`${detail.cover}?imageMogr2/thumbnail/!760x542r/gravity/center/crop/760x542`} alt=""/> */}
                        {hasBanners && banners.map((banner, index) => (
                          <img key={index} src={`${banner}?imageMogr2/thumbnail/!200x134r/gravity/center/crop/200x134`} />
                        ))}
                    </div>
                  <div className="topic-header-wrapper">
                    {detail.showTitle &&
                    <div className="title-container">
                      <h1 className="title topic-box">{detail.title}</h1>
                    </div>}
                  </div>
                </div>
                <div className="topic-top-section">
                  <div className="topic-summary-container">
                    <div className="topic-box">
                      <div className="topic-summary">{detail.summary}</div>
                    </div>
                  </div>
                  {hasModuleNav &&
                  <div className="topic-module-nav">
                    <div className="topic-box">
                      <ul className="nav">
                        {moduleNavList.map((item, index) => {
                          const navHash = `#module-${index}`
                          return (
                          <li key={item.id}>
                            <a 
                              href={navHash} 
                              className={classnames({'active': navHash === moduleNav})}
                              onClick={e => this.handleModuleNav(navHash)}
                            >
                              {item.title}
                            </a>
                          </li>
                        )})}
                      </ul>
                    </div>
                  </div>}
                </div>
                <div className="topic-box">
                  <div className="module-box">
                    {moduleList.map((item, index) => {
                      const isArticle = item.type === TopicModuleTypes.ARTICLE
                      return (
                        <div className="topic-module" key={item.id}>
                          <a name={`module-${index}`}></a>
                          <div className="title">{item.title}</div>
                          {item.summary && <div className="summary">{item.summary}</div>}
                          <div className="module-list-container">
                            {isArticle 
                            ? <ArticleBox
                                totalCount={item.totalCount}
                                terms={item.terms || {}}
                                articles={item.cpList || []}
                                onPagination={(page, size) => this.handlePagination(page, size, item.id, index)}
                              />
                            : <ShotsBox
                                gutter={gutter}
                                totalCount={item.totalCount}
                                worksLimit={works_limit}
                                terms={item.terms || {}}
                                shots={item.cpList || []}
                                onFavor={this.handleFavor}
                                onPagination={(page, size) => this.handlePagination(page, size, item.id, index)}
                              />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="comment-container topic-comment">
                    <CommentBox compositionId={query.id} type={CommentTypes.TOPIC} />
                  </div>
                  <ShareGroup
                    hideCollection
                    hideFavor
                    comments={commentCount}
                    scope="topic-detail"
                    title={detail.title}
                    description={detail.summary}
                    cover={detail.cover}
                  />
                </div>

              
            </div>
        )
    }
}