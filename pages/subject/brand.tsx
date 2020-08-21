import { Component } from 'react'
import jsHttpCookie from 'cookie'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'

import wxSignature from '@utils/wxSignature'
import HeadComponent from '@components/common/HeadComponent'
import Error from '@components/common/Error'
import BrandLayout from '@containers/subject/brand/BrandLayout'
import NavContainer from '@containers/subject/brand/NavContainer'
import BrandContent from '@containers/subject/brand/BrandContent'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'

@inject(stores => {
    const { brandStore, adStore, globalStore } = stores.store
    const { pageData, isMobileScreen } = globalStore
    const { 
        fetchBrandFollow, 
        brandClientDetail, 
        updateBrandDetail, 
        updateBrandListData,
        updateBrandArtiListData, 
        updateBrandOwner, 
        brandOwner,
    } = brandStore

    return {
        adStore,
        isMobileScreen,
        pageData,
        fetchBrandFollow,
        brandClientDetail,
        updateBrandDetail,
        updateBrandListData,
        updateBrandArtiListData,
        updateBrandOwner,
        brandOwner,
    }
})
@observer
export default class BrandContainer extends Component {
    static async getInitialProps(ctx) {
        const { req, res, asPath, query, mobxStore } = ctx
        const { id, tab } = query
        const { brandStore, globalStore, adStore } = mobxStore
        const { serverClientCode, fetchPageData, isMobileScreen, setMobileNavigationData } = globalStore
        const { brandListData, fetchBrandDetail, fetchBrandOwner, brandArtiListData, fetchGetBrandShotsList } = brandStore
        let statusCode = false
        let appProps = {}

        if(req && req.headers) { 
            const host = req.headers.host 
            const cookies = req.headers.cookie 
            let token 
            let client_code = serverClientCode
            statusCode = res.statusCode > 200 ? res.statusCode : false

            if(typeof cookies === 'string') {
                token = jsHttpCookie.parse(cookies).token
            } 

            if (isMobileScreen) {
                setMobileNavigationData({hide: true})
            }
            
            if(client_code) {
                // 获取品牌详情 
                const detailParam = { token, host, client: client_code, brandId: id }
                const resultBrandDetail = await fetchBrandDetail(detailParam) 
                
                if (!resultBrandDetail) {
                    statusCode = 404
                } else {
                    // appProps.brandDetail = resultBrandDetail

                    // 获取品牌作品列表 
                    brandListData.terms && brandListData.terms.term && (brandListData.terms.term.brands = [id])
                    const brandParam = { host, terms: { ...brandListData.terms, page: 1 }, client: client_code }
                    const resultShotsList = await fetchGetBrandShotsList(brandParam)
                    // appProps.brandListSvrData = resultShotsList
    
                    // 获取品牌文章列表 
                    brandArtiListData.terms && brandArtiListData.terms.term && (brandArtiListData.terms.term.brands = [id])
                    const brandArtiParam = { host, terms: { ...brandArtiListData.terms, page: 1 }, client: client_code }
                    const brandArtiListSvrData = await fetchGetBrandShotsList(brandArtiParam) || {}
        
                    // // 获取品牌详情 
                    // const detailParam = { token, host, client: client_code, brandId: id }
                    // appProps.brandDetail = await fetchBrandDetail(detailParam) || {}
    
                    const brandOwnerParam = { token, host, client: client_code, brandId: id}
                    const brandOwnerData = await fetchBrandOwner(brandOwnerParam)
    
                    const adParam = { token, host, page_code: 'f_b', relation_id: id}
                    const brandAds = await adStore.fetchAdvertisement(adParam)

                    
                    const pageDataResult = await fetchPageData({relationId: id})
                }
            }
        }

        return {
            statusCode,
            query, 
            asPath,
            ...appProps
        }
    }

    componentDidMount() {
        this.initWxSignature()
    }

    initWxSignature() {
        wxSignature.init({
            cover: 'https://resource.meihua.info/FkVLmZ_FSwR9MdOWPmFMY8RjVJur?imageView2/2/w/200/',
        })
    }

    render() {
        const { statusCode, query, brandOwner, brandDetail, brandClientDetail, pageData, isMobileScreen } = this.props
        if (statusCode) {
            return <Error statusCode={statusCode} />
        }

        const brandDetails = brandClientDetail || brandDetail
        const name = brandDetails && brandDetails.brand && brandDetails.brand.chName || ''
        const pageTitle = pageData.title || `${name}品牌创意营销案例 - 营销作品宝库 - 梅花网`
        const pageKeyworks = pageData.keywork || name
        const pageDescription = pageData.description

        const hasOwner = !!brandOwner.author

        return (
            <>
                <HeadComponent
                    title={pageTitle}
                    keywords={pageKeyworks}
                    description={pageDescription}
                />
                {isMobileScreen && <MbNavigatorBar 
                    showTitle 
                    title="品牌" 
                />}
                <BrandLayout 
                    hasOwner={hasOwner}
                    NavContainer={<NavContainer brandDetail={brandDetails} />}
                >
                    <BrandContent 
                        query={query} 
                    />
                </BrandLayout>
            </>
        )
    }
}