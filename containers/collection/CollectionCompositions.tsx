import { Component } from 'react'
import { Tabs, message } from 'antd'
import { inject, observer } from 'mobx-react'
import { CompositionTypes } from '@base/enums' 
import { Router } from '@routes'
import jsCookie from 'js-cookie'
import { toJS } from 'mobx'

import ShotsList from './ShotsList'
import ArticleList from './ArticleList'
import ShareGroup from '@containers/shots/ShareGroup'
import CustomIcon from '@components/widget/common/Icon'
import EditFavoritesModal from '@containers/collection/EditFavoritesModal'
import { config } from '@utils/'

const { TabPane } = Tabs

@inject(stores => {
    const { collectionStore, globalStore } = stores.store
    const { 
        favoritesArticles,
        favoritesShots,
        favoritesDetail,
    } = collectionStore
    const { serverClientCode } = globalStore

    return {
        collectionStore,
        favoritesArticles,
        favoritesShots,
        favoritesDetail,
        serverClientCode,
    }
})
@observer
export default class CollectionCompositions extends Component {
    state = {
        editVisible: false
    }
    brandChangeTabs = key => {
        const { query, collectionStore, favoritesArticles, favoritesShots, serverClientCode } = this.props
        const collectionId = query.id
        let tabs = ''

        switch(key) {
            case 'shots':
                tabs = 'shots'
                const shotsParam = { compositionType: CompositionTypes.SHOTS, collectionId, clientCode: serverClientCode, pageIndex: 1, pageSize: 40 }
                collectionStore.fetchFavoritesCompositions(shotsParam)

                break
            case 'article':
                tabs = 'article'
                if (!favoritesArticles.isLoad) {
                    const articleParam = { compositionType: CompositionTypes.ARTICLE, collectionId, clientCode: serverClientCode, pageIndex: 1, pageSize: 10 }
                    collectionStore.fetchFavoritesCompositions(articleParam)
                }
            
                break
            case 'all':
            default:
                tabs = ''
                const articleParam = { collectionId, clientCode: serverClientCode, pageIndex: 1, pageSize: 10 }
                collectionStore.fetchFavoritesCompositions(articleParam)
                break
        }

        Router.pushRoute(`/collection/${collectionId}` + (tabs ? `/${tabs}` : ''))
    }

    handleEditVisible = (flag=false) => {
        const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
        if (!token) {
          location.href = '/signin?c=' + location.href
          return
        }
  
        this.setState({editVisible: !!flag})
      }
  
    handleEditSubmit = (values) => {
    const { collectionStore } = this.props
    collectionStore.addFavorites(values).then(res => {
        if (res.success) {
        this.setState({editVisible: false})
        message.success('创建成功')
        } else {
        message.error('创建失败')
        }
    })
    }

    render() {
        const { query, favoritesDetail } = this.props
        const { editVisible } = this.state
        const { type } = query
        // const defaultTab = type ? type : (!favoritesDetail.worksQuantity && favoritesDetail.articleQuantity ? 'article' : 'shots')
        const defaultTab = type ? type : 'all'

        return (
            <>
                <Tabs
                    size={'large'}
                    animated={false}
                    forceRender={true}
                    className='user-tabs'
                    // activeKey={tab}
                    defaultActiveKey={defaultTab || 'all'}
                    onChange={this.brandChangeTabs || null}
                    tabBarExtraContent={<span className="btn-add-favorites" onClick={e => this.handleEditVisible(true)}><CustomIcon name="plus" />创建我的收藏夹</span>}
                    renderTabBar={(props, DefaultTabBar) => (
                        <div className="tabbar-wrapper">
                            <DefaultTabBar {...props}>
                                {node => node}
                            </DefaultTabBar>
                        </div>
                    )}
                >   
                    <TabPane tab={`全部 ${(favoritesDetail.worksQuantity + favoritesDetail.articleQuantity) || 0}`} key='all'>
                        <div className="brand-box collection-box">
                            <div className="brand-box-wrapper">
                                <div className="brand-main">
                                    <ShotsList query={query} />
                                </div>
                            </div>
                            <ShareGroup 
                                hideActions
                                className='right' 
                                tagPageShare={favoritesDetail.name}
                                style={{top: '30px', right: '-55px'}}
                            />
                        </div>
                    </TabPane>
                    <TabPane tab={`作品 ${favoritesDetail.worksQuantity || 0}`} key='shots'>
                        <div className="brand-box collection-box">
                            <div className="brand-box-wrapper">
                                <div className="brand-main">
                                    <ShotsList query={query} />
                                </div>
                            </div>
                            <ShareGroup 
                                hideActions
                                className='right' 
                                tagPageShare={favoritesDetail.name}
                                style={{top: '30px', right: '-55px'}}
                            />
                        </div>
                    </TabPane>
                    <TabPane tab={`文章 ${favoritesDetail.articleQuantity || 0}`} key='article'>
                        <div className="brand-box collection-box">
                            <div className="brand-box-wrapper">
                                <div className="brand-main">
                                    <ArticleList query={query} />
                                </div>
                            </div>
                            <ShareGroup 
                                hideActions
                                className='right' 
                                tagPageShare={favoritesDetail.name}
                                style={{top: '30px', right: '-55px'}}
                            />
                        </div>
                    </TabPane>
                </Tabs>
                <EditFavoritesModal 
                  visible={editVisible}
                  onClose={e => this.handleEditVisible()}
                  onSubmit={this.handleEditSubmit}
                />
            </>
        )
    }
}