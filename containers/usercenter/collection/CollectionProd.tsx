import { Component } from 'react'
import { Row, Col, Icon, Menu } from 'antd'
import { inject, observer } from 'mobx-react'
import { CompositionType } from '@base/enums'
import jsCookie from 'js-cookie'
import { toJS } from 'mobx'
import { config } from '@utils'

import LoadMore from '@components/common/LoadMore'
import ClassifyTab from '@components/common/ClassifyTab'
import CommonIntro from '@components/common/CommonIntro'
import PartLoading from '@components/features/PartLoading'
import DetailHeader from '@components/author/DetailHeader'
import EmptyComponent from '@components/common/EmptyComponent'

let num = 3
@inject(stores => {
    const { userCenterStore } = stores.store
    const { collectionList, fetchCollectionActionCollect, fetchCollectionActionFavor, collectCompositionData, fetchGetSettingAuthorCollection } = userCenterStore

    return {
        collectionList,
        collectCompositionData,
        fetchCollectionActionFavor,
        fetchCollectionActionCollect,
        fetchGetSettingAuthorCollection
    }
})
@observer
export default class CollectionProd extends Component {
    reqSettingCollectList = () => {
        const { collectCompositionData, fetchGetSettingAuthorCollection, query } = this.props

        fetchGetSettingAuthorCollection({ type: CompositionType.COMPOSITION, collection_id: query.collectionId, size: collectCompositionData.size, page: collectCompositionData.page })
    }

    changeFn = key => {
        const { fetchGetSettingAuthorCollection } = this.props

        fetchGetSettingAuthorCollection({ type: CompositionType.COMPOSITION, collection_id: key })
    }

    handleSearch = key => {
        const { fetchGetSettingAuthorCollection, collectCompositionData } = this.props

        fetchGetSettingAuthorCollection({ type: CompositionType.COMPOSITION, size: collectCompositionData.size, page: 1, key })
    }

    removeMenu = item => {
        return (
            <Menu onClick={e => this.handleRemoveShotsCollection(e, item)}>
                <Menu.Item key='0'>取消收藏</Menu.Item>
            </Menu>
        )
    }

    handleRemoveShotsCollection = (e, item) => {
        const { fetchCollectionActionCollect } = this.props

        switch(Number(e.key)) {
            case 0:
                const clientCode = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)

                fetchCollectionActionCollect({ action: 0, compositionId: item.id, clientCode })

                break
        }
    }

    handleFavorClick = e => {
        const { fetchCollectionActionFavor } = this.props
        const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)

        fetchCollectionActionFavor({ action: 0, id: item.id, client_code })
    }

    render() {
        const { value, onCollectionChange, fetchCollectionActionFavor, collectCompositionData } = this.props
        const { state, isLastPage } = collectCompositionData

        return (
            <div className='colletion-box'>
                {/* <ClassifyTab
                    tabName={`收藏夹`}
                    // initialFn={true}
                    changeFn={this.changeFn}
                    tabList={collectionList}
                    notMore={collectionList.length < 10}
                    borderless={true} /> */}
                {!!state ? <div className='colletion-content'>
                    {/* <DetailHeader 
                        value={value}
                        placeholder={`搜索`}
                        onChange={onCollectionChange}
                        searchFn={this.handleSearch}
                        type={CompositionType.COMPOSITION}
                        meta={`共收藏了${collectCompositionData.count || 0}组作品`}
                    /> */}
                    {collectCompositionData.list && collectCompositionData.list.length > 0 ? <Row type='flex' gutter={28} align='middle' justify='start'>
                        {collectCompositionData.list.map(item => {
                            return (
                                <Col key={item.id || item.compositionId}>
                                    <CommonIntro 
                                        brand
                                        item={item} 
                                        authorDetail={true} 
                                        onFavor={fetchCollectionActionFavor}
                                        removeMenu={e => this.removeMenu(item)}
                                        onRemoveShotsFavor={this.handleFavorClick}
                                    />
                                </Col>
                            )
                        })}
                    </Row> : <EmptyComponent text='暂未收藏任何作品' />}
                    {!isLastPage && <LoadMore name={`加载更多`} num={num}
                        reqList={this.reqSettingCollectList} />}
                </div> : <PartLoading />}
            </div>
        )
    }
}