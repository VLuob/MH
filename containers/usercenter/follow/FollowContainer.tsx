import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import dynamic from 'next/dynamic'

import { Tabs, Icon, message } from 'antd'
import { MessageType } from '@base/enums'
import {Router} from '@routes'

import PartLoading from '@components/features/PartLoading'

const FollowShotsBox = dynamic(() => import('./FollowShotsBox'), {loading: () => <PartLoading />, ssr: false})
const FollowArticleBox = dynamic(() => import('./FollowArticleBox'), {loading: () => <PartLoading />, ssr: false})
const FollowAuthorBox = dynamic(() => import('./FollowAuthorBox'), {loading: () => <PartLoading />, ssr: false})
const FollowFavoritesBox = dynamic(() => import('./FollowFavoritesBox'), {loading: () => <PartLoading />, ssr: false})
const FollowTagBox = dynamic(() => import('./FollowTagBox'), {loading: () => <PartLoading />, ssr: false})

const { TabPane } = Tabs

const FollowTabType = {
  SHOTS: 'shots',
  ARTICLE: 'article',
  AUTHOR: 'author',
  FAVORITES: 'favorites',
  TAG: 'tag',
}

@inject(stores => {
  const { followStore } = stores.store
  return {
    followStore,
  }
})
export default class FollowContainer extends Component {
  state = {
    type: FollowTabType.SHOTS,
  }

  componentDidMount() {
    const { query } = this.props
    this.handleTabChange(query.tab)
  }

  handleTabChange = (key='') => {
    this.setState({type: key || FollowTabType.SHOTS})
    if (key) {
      Router.pushRoute(`/personal/follow/${key}`)
    }
  }

  render() {
    const { type } = this.state

    return (
      <div className='common-container user-follow'>
          <Tabs className='user-tabs' size='large' activeKey={type} animated={false} onChange={this.handleTabChange}>
              <TabPane tab={<span className="tab-text">作品</span>} key={FollowTabType.SHOTS}>
              {type === FollowTabType.SHOTS && <FollowShotsBox />}
              </TabPane>
              <TabPane tab={<span className="tab-text">文章</span>} key={FollowTabType.ARTICLE}>
              {type === FollowTabType.ARTICLE && <FollowArticleBox />}
              </TabPane>
              <TabPane tab={<span className="tab-text">创作者</span>} key={FollowTabType.AUTHOR}>
              {type === FollowTabType.AUTHOR && <FollowAuthorBox />}
              </TabPane>
              <TabPane tab={<span className="tab-text">收藏夹</span>} key={FollowTabType.FAVORITES}>
              {type === FollowTabType.FAVORITES && <FollowFavoritesBox />}
              </TabPane>
              <TabPane tab={<span className="tab-text">标签</span>} key={FollowTabType.TAG}>
              {type === FollowTabType.TAG && <FollowTagBox />}
              </TabPane>
          </Tabs>
      </div>
    )
  }
}