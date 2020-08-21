import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'
import { Tabs } from 'antd'

import { CompositionType } from '@base/enums'
import PartLoading from '@components/features/PartLoading'

const ProductionContainerWithNoSSR = dynamic(() => import('./ProductionContainer'), {loading: () => <PartLoading />, ssr: false})
const ArticleContainerWithNoSSR = dynamic(() => import('./ArticleContainer'), {loading: () => <PartLoading />, ssr: false})

const { TabPane } = Tabs

@inject(stores => {
  const { userCenterStore } = stores.store
  const { perSettingData, fetchGetSettingFavor, articleFavorParam, compositionFavorParam } = userCenterStore
  return {
    
    perSettingData, 
    fetchGetSettingFavor, 
    articleFavorParam, 
    compositionFavorParam,
  }
})
@observer
export default class FavorContainer extends Component {
  state = {
    favorShotsVal: '',
    favorArtiVal: '',
  }

  componentDidMount() {
    const { query } = this.props
    this.favorChangeTabs(query.tab)
  }

  // 喜欢切换
  favorChangeTabs = key => {
    const { perSettingData, fetchGetSettingFavor, articleFavorParam, compositionFavorParam } = this.props

    switch(key) {
        case 'article':
            fetchGetSettingFavor({ type: CompositionType.ARTICLE, ...articleFavorParam, code: perSettingData.code, page: 1 })
            this.setState({ favorArtiVal: `` })
            break
        case 'shots':
        default:
            this.setState({ favorShotsVal: `` })
            fetchGetSettingFavor({ type: CompositionType.COMPOSITION, ...compositionFavorParam, code: perSettingData.code, page: 1 })
            break
    }
  }

  //喜欢部分搜索
  handleFavorChange = (e, type) => {
    switch(type) {
        case CompositionType.COMPOSITION:
            this.setState({ favorShotsVal: e.target.value })

            break
        case CompositionType.ARTICLE:
            this.setState({ favorArtiVal: e.target.value })

            break
    }
  }

  render() {
    const { query } = this.props
    const { favorShotsVal, favorArtiVal } = this.state

    return (
      <div className='common-container'>
        <Tabs className='user-tabs' size='large' defaultActiveKey={query.menu || 'shots'} animated={false} onChange={this.favorChangeTabs}>
            <TabPane tab='喜欢作品' key='shots'>
                <ProductionContainerWithNoSSR 
                    query={query}
                    value={favorShotsVal}
                    onFavorChange={this.handleFavorChange}
                />
            </TabPane>
            <TabPane tab='喜欢文章' key='article'>
                <ArticleContainerWithNoSSR 
                    query={query} 
                    value={favorArtiVal}
                    onFavorChange={this.handleFavorChange}
                />
            </TabPane>
        </Tabs>
      </div>
    )
  }
}