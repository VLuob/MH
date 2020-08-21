import { Component } from 'react'
import { Row, Col, Tabs } from 'antd'
import { inject, observer } from 'mobx-react'
import { CompositionTypes } from '@base/enums' 

// import ShotsContainer from './ShotsContainer'
import ArticleContainer from './ArticleContainer'

const { TabPane } = Tabs

@inject(stores => {
    const { brandStore, globalStore } = stores.store
    const { brandListData, brandArtiListData, updateBrandListData, fetchGetBrandShotsList, updateBrandArtiListData } = brandStore
    const { isMobileScreen } = globalStore

    return {
        brandListData,
        isMobileScreen,
        brandArtiListData,
        updateBrandListData,
        fetchGetBrandShotsList,
        updateBrandArtiListData,
    }
})
@observer
export default class BrandContent extends Component {
    // brandChangeTabs = key => {
    //     const { query, brandListData, brandArtiListData, updateBrandListData, updateBrandArtiListData, fetchGetBrandShotsList } = this.props
    //     const { id } = query

    //     switch(key) {
    //         case `shots`:
    //             updateBrandListData()

    //             const param = { terms: { ...brandListData.terms, page: 1, term: { type: CompositionTypes.SHOTS, brands: [id] } }}

    //             fetchGetBrandShotsList(param)

    //             break
    //         case `article`:
    //             updateBrandArtiListData()
    
    //             const articleParam = { terms: { ...brandArtiListData.terms, page: 1, term: { type: CompositionTypes.ARTICLE, brands: [id] } } }

    //             fetchGetBrandShotsList(articleParam)

    //             break
    //     }
    // }

    render() {
        const { query } = this.props

        return (
            <div className="brand-box">
                <div className="brand-box-wrapper">
                    <div className="brand-main">
                        <ArticleContainer query={query}/>
                    </div>
                </div>
            </div>
        )
    }
}