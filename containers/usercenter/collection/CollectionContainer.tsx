import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'
import { Tabs, message, Avatar } from 'antd'

import { Router } from '@routes'
import { CompositionType } from '@base/enums'
import PartLoading from '@components/features/PartLoading'
import CustomIcon from '@components/widget/common/Icon'

// import InputModal from '@components/widget/common/InputModal'

const CollectionProdWithNoSSR = dynamic(() => import('./CollectionProd'), {loading: () => <PartLoading />, ssr: false})
const CollectionArticleWithNoSSR = dynamic(() => import('./CollectionArticle'), {loading: () => <PartLoading />, ssr: false})
const EditFavoritesModal = dynamic(() => import('@containers/collection/EditFavoritesModal'), {loading: () => <span></span>, ssr: false})

const { TabPane } = Tabs

@inject(stores => {
  const { userCenterStore, collectionStore, globalStore } = stores.store
  const { collectArticleData, collectCompositionData, fetchGetSettingAuthorCollection, fetchAddCollectionFolder } = userCenterStore
  const { favoritesDetail } = collectionStore
  const { serverClientCode } = globalStore
  return {
    collectionStore,
    collectArticleData, 
    collectCompositionData, 
    fetchGetSettingAuthorCollection,
    fetchAddCollectionFolder,
    favoritesDetail,
    serverClientCode,
  }
})
@observer
export default class CollectionContainer extends Component {
  state = {
    collectionShotsVal: '',
    collectionArtiVal: '',
    collectVal: '',
    collectVisible: false,

    editVisible: false,
  }

  componentDidMount() {
    const { query } = this.props
    this.requestFavoritesDetail()
    this.collectChangeTabs(query.tab)
  }

  requestFavoritesDetail() {
    const { collectionStore, serverClientCode, query } = this.props
    const id = query.collectionId
    const clientCode = serverClientCode
     collectionStore.fetchFavoritesDetail({ clientCode, id }) 
  }

  //跳转到老梅花网收藏数据
  collectClick = () => {
    window.open(`/u/favor`)
    // this.setState({ collectVal: '', collectVisible: true })
  }

 
  handleCollectionChange = (e, type) => {
    switch(type) {
        case CompositionType.COMPOSITION:
            this.setState({ collectionShotsVal: e.target.value })
            break
        case CompositionType.ARTICLE:
            this.setState({ collectionArtiVal: e.target.value })
            break
    }
  }

  // 收藏切换
  collectChangeTabs = key => {
    const { collectArticleData, collectCompositionData, fetchGetSettingAuthorCollection, query } = this.props
    const collection_id = query.collectionId

    switch(key) {
        case 'article':
          this.setState({ collectionShotsVal: '' })
          fetchGetSettingAuthorCollection({ type: CompositionType.ARTICLE, collection_id, page: 1, size: collectCompositionData.size })

          break
        case 'shots':
          this.setState({ collectionArtiVal: '' })
          fetchGetSettingAuthorCollection({ type: CompositionType.COMPOSITION, collection_id, page: 1, size: collectArticleData.size })
          break
        case 'all':
        default:
          this.setState({ collectionArtiVal: '' })
          fetchGetSettingAuthorCollection({ collection_id, page: 1, size: collectArticleData.size })
          break
    }
  }

  handleReturn = () => {
    Router.pushRoute('/personal/collections')
  }

  handleEditVisible = (flag) => {
    this.setState({editVisible: !!flag})
  }

  handleEditSubmit = (values) => {
    const { collectionStore } = this.props
    collectionStore.editFavorites({isDetail: true, ...values}).then(res => {
      if (res.success) {
        this.handleEditVisible(false)
        message.success('修改成功')
      } else {
        message.error(res.data.msg)
      }
    })
  }

  render() {
    const { query, favoritesDetail } = this.props
    const { collectionShotsVal, collectionArtiVal, editVisible } = this.state

    return (
      <div className='collection-container common-container'>
        <div className="usercenter-breadcrumb">
            <a onClick={this.handleReturn}>我的收藏</a> / 收藏夹详情
        </div>
        <div className='user-header collection-header'>
          <div className='header-title'> 
              <span className='name'><a href={`/collection/${favoritesDetail.id}`} target="_blank">{favoritesDetail.name}</a></span> {!favoritesDetail.published &&<span className="published"><CustomIcon name="lock" /></span>}
          </div>
          <div className="header-intro">
            <span className="header-userinfo">
              <a className="avatar">
                  <Avatar icon="user" size={20} src={favoritesDetail.userAvatar} />  
              </a>
              <span className="name">{favoritesDetail.userNickname}</span>
            </span>
          </div>
        </div>
        
        <Tabs 
          className='user-tabs user-collection-tabs' 
          // size='large' 
          defaultActiveKey={query.tab || 'all'} 
          animated={false} 
          onChange={this.collectChangeTabs}
          tabBarExtraContent={<a onClick={e => this.handleEditVisible(true)} style={{lineHeight: '50px', color: '#888888', cursor: 'pointer'}}>编辑收藏夹</a>}
        >
            <TabPane tab={`全部 ${(favoritesDetail.worksQuantity + favoritesDetail.articleQuantity) || 0}`} key='all'>
                <CollectionProdWithNoSSR 
                  query={query}
                  value={collectionShotsVal}
                  onCollectionChange={this.handleCollectionChange}
                />
            </TabPane>
            <TabPane tab={`作品 ${favoritesDetail.worksQuantity || 0}`} key='shots'>
                <CollectionProdWithNoSSR 
                  query={query}
                  value={collectionShotsVal}
                  onCollectionChange={this.handleCollectionChange}
                />
            </TabPane>
            <TabPane tab={`文章 ${favoritesDetail.articleQuantity || 0}`} key='article'>
                <CollectionArticleWithNoSSR
                  query={query}
                  value={collectionArtiVal}
                  onCollectionChange={this.handleCollectionChange}
                />
            </TabPane>
        </Tabs>
        {editVisible && <EditFavoritesModal
          visible={editVisible}
          values={{
            id: favoritesDetail.id,
            name: favoritesDetail.name,
            description: favoritesDetail.description,
            published: favoritesDetail.published,
          }}
          onClose={e => this.handleEditVisible(false)}
          onSubmit={this.handleEditSubmit}
        />}
      </div>
    )
  }
}