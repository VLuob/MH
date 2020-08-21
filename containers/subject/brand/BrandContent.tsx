import { Component } from 'react'
import { Row, Col, Tabs } from 'antd'
import { inject, observer } from 'mobx-react'
import { CompositionTypes } from '@base/enums' 
import { Router } from '@routes'
import { toJS } from 'mobx'

import ShotsContainer from './ShotsContainer'
import ArticleContainer from './ArticleContainer'
import BrandSider from './BrandSider'
import ShareGroup from '@containers/shots/ShareGroup'
import BrandSubFilterBar from './BrandSubFilterBar'

const { TabPane } = Tabs

@inject(stores => {
    const { brandStore, globalStore } = stores.store
    const { 
        brandListData, 
        brandArtiListData, 
        resetBrandListData, 
        updateBrandListData, 
        resetBrandArtiListData, 
        updateBrandListTerms,
        fetchGetBrandShotsList, 
        updateBrandArtiListData, 
        brandClientDetail,
        brandOwner,
    } = brandStore
    const { isMobileScreen } = globalStore

    return {
        brandListData,
        isMobileScreen,
        brandArtiListData,
        resetBrandListData,
        updateBrandListData,
        updateBrandListTerms,
        fetchGetBrandShotsList,
        resetBrandArtiListData,
        updateBrandArtiListData,
        brandClientDetail,
        brandOwner,
    }
})
@observer
export default class BrandContent extends Component {
    brandChangeTabs = key => {
        const { query, resetBrandListData, resetBrandArtiListData, fetchGetBrandShotsList } = this.props
        const { id } = query
        let tabs = `shots`

        switch(key) {
            case `shots`:
                tabs = `shots`
                const param = { terms: { ...resetBrandListData.terms, page: 1, term: { type: CompositionTypes.SHOTS, brands: [id] } }}

                fetchGetBrandShotsList(param)

                break
            case `article`:
                tabs = `article`
                const articleParam = { terms: { ...resetBrandArtiListData.terms, page: 1, term: { type: CompositionTypes.ARTICLE, brands: [id] } } }

                fetchGetBrandShotsList(articleParam)

                break
        }

        Router.pushRoute(`/brand/${id}/${tabs}`)
    }

    handleCompositionTypeChange = (type) => {
        const { query } = this.props
        const keyLabel = type === CompositionTypes.ARTICLE ? 'article' : 'shots'
        Router.pushRoute(`/brand/${query.id}/${keyLabel}`)
        const param = {
            term: {type}
        }
        this.reqBrandList(param)
    }

    reqBrandList = option => {
        const { query, brandListData, updateBrandListTerms, fetchGetBrandShotsList } = this.props
        const { id } = query
        const param = { terms: { ...option, page: 1, limit: brandListData.terms.limit, term: { ...option.term, brands: [id] }, recommended: false }}

        updateBrandListTerms(param.terms)
        fetchGetBrandShotsList(param)
    }

    render() {
        const { query, brandListData, brandOwner, isMobileScreen, brandArtiListData, brandClientDetail } = this.props
        const { tab } = query
        const brandTerms = brandListData.terms || {}
        const brandTerm = brandTerms.term || {}
        const compositionType = brandTerm.type
        const isArticle = compositionType === CompositionTypes.ARTICLE
        const hasOwner = !!brandOwner.author

        const brandBoxClass = ['brand-box']
        if (hasOwner) {
            brandBoxClass.push('has-owner')
        }
        
        return (
            <>
                {isMobileScreen ? <div className="mb-brand-content">
                    <BrandSubFilterBar
                        query={query}
                        compositionType={compositionType}
                        onTypeChange={this.handleCompositionTypeChange}
                        onRequestList={this.reqBrandList}
                    />
                    <div className="brand-box-mb">
                                {isArticle ? <ArticleContainer query={query} />
                                : <ShotsContainer query={query} />}
                    </div>
                </div>
                : <Tabs
                    size={`large`}
                    animated={false}
                    forceRender={true}
                    className='user-tabs'
                    // activeKey={tab}
                    defaultActiveKey={tab || 'shots'}
                    onChange={this.brandChangeTabs || null}
                >
                    <TabPane tab={`作品 ${brandListData.count || 0}`} key='shots'>
                        <div className="brand-box">
                            <div className="brand-box-wrapper">
                                <div className="brand-main">
                                    <ShotsContainer query={query} />
                                </div>
                                {hasOwner && <BrandSider />}
                            </div>
                            {brandClientDetail.brand && <ShareGroup className='right' 
                                tagPageShare={brandClientDetail.brand.chName}
                            />}
                        </div>
                    </TabPane>
                    <TabPane tab={`文章 ${brandArtiListData.count || 0}`} key='article'>
                        <div className="brand-box">
                            <div className="brand-box-wrapper">
                                <div className="brand-main">
                                    <ArticleContainer query={query} />
                                </div>
                                {hasOwner && <BrandSider />}
                            </div>
                            {brandClientDetail.brand && <ShareGroup className='right' 
                                tagPageShare={brandClientDetail.brand.chName}
                            />}
                        </div>
                    </TabPane>
                </Tabs>}
            </>
        )
    }
}