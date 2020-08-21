import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Spin, Tooltip, Button, message } from 'antd'
import moment from 'moment'
import jsCookie from 'js-cookie'
import { toJS } from 'mobx'
import classnames from 'classnames'

import SiderBox from '@components/widget/common/SiderBox'
import IntroBoxArticle from '@components/author/IntroBoxArticle'
import ArticleItemSmall from '@components/article/ArticleItemSmall'
import { FollowTypes, ActionType } from '@base/enums'
import { config, utils } from '@utils'
import { user } from '@base/system'

export interface Props {
    
}

@inject(stores => {
  const { compositionStore, brandStore } = stores.store
  const { authorInfo } = compositionStore
  const { brandOwner } = brandStore

  return {
      compositionStore,
      authorInfo: authorInfo.info,
      isLoading: authorInfo.isLoading,
      
      brandStore,
      brandOwner,
  }
})
@observer
export default class BrandSider extends Component<Props> {
  constructor(props) {
    super(props)
  }
  state = {
    currentUser: {},
  }

  componentDidMount() {


    this.initCurrent()
  }

 

  initCurrent() {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (!token) {
      return
    }
    
    const currentUser = user.getCookieUser() || {}
    // console.log('current user', currentUser)
    this.setState({currentUser})

  }

  authorFollow = () => {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if(!token) {
      window.location.href = `/signin?c=${window.location.pathname}`
      return
    }
    const { brandStore, brandOwner } = this.props
    const author = brandOwner.author || {}
    const id = author.id 
    const type = FollowTypes.AUTHOR
    const action = author.followed ? ActionType.UNFOCUS : ActionType.FOCUS
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)

    brandStore.fetchFollowAuthor({id, type, action, client_code})
  }

  authorMessage = () => {
    message.destroy()
    message.warn(`私信功能暂未开启`)
  }

  render() {
    const { authorInfo, brandOwner, isLoading, fixed, navHide, isPreview } = this.props
    const { currentUser } = this.state
    const currentAuthor = currentUser.author || {}
    const author = brandOwner.author || {}
    const articleList = brandOwner.latestArticles || []
    const shotsList = brandOwner.latestWorks || []
    const isSelf = currentAuthor.code === author.code || author.currentUserOrg

    // console.log('author info', toJS(authorInfo))

    // let area = ''
    // if (author.provinceName && author.cityName) {
    //   area = author.provinceName + ' / ' + author.cityName
    // } else if (author.provinceName && !author.cityName) {
    //   area = author.provinceName
    // } else if (!author.provinceName && author.cityName) {
    //   area = author.cityName
    // } else {
    //   area = ''
    // }

    // console.log('preview author info', toJS(authorInfo))

    return (
      <aside className="brand-side">
        <div className='sider-author-info user-info-box'>
          <div 
            key="userinfobox"
            className={classnames(
              'user-brief-box',
              {fixed: fixed},
            )} 
            style={{top: navHide ? '20px' : '78px'}}
          >
            <IntroBoxArticle 
                hideNetAge
                isSelf={isSelf}
                id={author.id}
                code={author.code}
                authorInfo={author}
                currentUserOrg={author.currentUserOrg}
                createTime={author.gmtCreate}
                avatar={author.avatar}
                name={author.nickname}
                city={author.cityName}
                netAge={author.degree}
                intro={author.signature}
                onFollow={this.authorFollow}
                followed={author.followed}
                type={Number(author.type)}
                onMessage={this.authorMessage}
                provice={author.provinceName}
                follow={brandOwner['author-fans']}
                article={brandOwner['author-articles']}
                production={brandOwner['author-works']}
            />
          </div>
          <SiderBox
            title="关于"
            moreUrl={`/author/${author.code}/about`}
          >
            {author.profile}
          </SiderBox>
          <hr className="separator" />
          <SiderBox
            title='最新作品'
            moreUrl={`/author/${author.code}/shots`}
          >
            <ul className='side-shots-list'>
              {shotsList.map(item => (
                <li key={item.compositionId}>
                  <div className="cover">
                      <a href={`/shots/${item.compositionId}`} target="_blank"><img src={item.cover + '?imageMogr2/thumbnail/!504x360r/size-limit/50k/gravity/center/crop/504x360'} alt={item.title} title={item.title} /></a>
                  </div>
                  <h4>
                    <Tooltip title={item.title}>
                      <a href={`/shots/${item.compositionId}`} target='_blank'>{item.title}</a>
                    </Tooltip>
                  </h4>
                </li>
              ))}
            </ul>
          </SiderBox>
          <hr className="separator" />
          <SiderBox
            key="siderbox"
            title='最新文章'
            moreUrl={`/author/${author.code}/article`}
          >
            <ul className='side-article-list'>
              {articleList.map(item => (
                <ArticleItemSmall
                    key={item.id}
                    img={item.cover}
                    title={item.title} 
                    author={item.author}
                    timeago={utils.timeago(item.gmtPublished || item.gmtCreate)} 
                    id={item.id || item.compositionId}
                    code={item.authorCode}
                />
              ))}
            </ul>
          </SiderBox>
            {isLoading && 
            <div style={{height: '300px', textAdivgn: 'center'}}>
              <Spin />
            </div>}
        </div>
      </aside>
    )
  }
}