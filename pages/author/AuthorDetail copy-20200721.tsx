import { Component } from 'react'
import { AuthorType, CompositionTypes } from '@base/enums'
import { inject, observer } from 'mobx-react'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { toJS } from 'mobx'

import Error from '@components/common/Error'
import UserLayout from '@containers/layout/UserLayout'
import AuthorSider from '@containers/author/AuthorSider'
import HeadComponent from '@components/common/HeadComponent'
import AuthorContent from '@containers/author/AuthorContent'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'
import wxSignature from '@utils/wxSignature'
import { config } from '@utils'

const tabNameMap = {
    shots: '作品',
    article: '文章',
    about: '关于',
}

interface Props {
    query: object,
}

interface State {

}

@inject(stores => {
    const { authorStore, globalStore } = stores.store
    const { isMobileScreen } = globalStore
    const { authorInfos, updateAuthorInfos, briefInfo } = authorStore

    return {
        isMobileScreen,
        briefInfo,
        authorInfos,
        updateAuthorInfos,
    }
})
@observer
export default class AuthorDetail extends Component<Props, State> {
    static async getInitialProps(ctx) {
        const { asPath, query, req, res, mobxStore } = ctx
        const { tab, code } = query
        const { authorStore, globalStore } = mobxStore
        const { serverClientCode, isMobileScreen, setMobileNavigationData } = globalStore
        const { 
            articleParam,
            compositionParam,
            fetchGetAuthorAbout,
            fetchGetComposition,
            fetchGetAuthorCommon, 
            fetchGetAuthorFavorCount,
         } = authorStore
        let statusCode = false
        let initProps = {}
        let sideProps = {}
        let contentProps = {}
        let tabProps = {}

        if (res) {
            statusCode = res.statusCode > 200 ? res.statusCode : false
        }

        if(req && req.headers) {
            const host = req.headers.host
            const token = parseCookies(ctx)[config.COOKIE_MEIHUA_TOKEN]
            let client_code = serverClientCode
            let authorInfo = {}
            let articleResult
            let articleData
            let shotsResult
            let shotsData

            if (isMobileScreen) {
                setMobileNavigationData({hide: true})
            }

            // 获取个人/机构主页基本信息
            if(client_code) {
                const authorParam = { host, code, token, clientCode: client_code }

                let authorResult = await fetchGetAuthorCommon(authorParam)
                authorInfo = authorResult.data 
                if (authorInfo && authorInfo.code === 'E100000' && (authorInfo.msg || '').toUpperCase() === 'ERROR TOKEN') {
                    delete authorParam.token
                    authorResult = await fetchGetAuthorCommon(authorParam)
                    authorInfo = authorResult.data
                }
            }

            if (!authorInfo || authorInfo.code === 'E100000') {
                statusCode = 404
            } else {
                switch(tab) {
                    case 'article': 
                        articleResult = await fetchGetComposition({ host, code, type: CompositionTypes.ARTICLE, ...articleParam, page: 1 })
                        shotsResult = await fetchGetComposition({ host, code, token, client_code, type: CompositionTypes.SHOTS, ...compositionParam, page: 1 })
                        articleData = articleResult.data || {}
                        shotsData = shotsResult.data || {}
                        tabProps.artiData = articleResult.success ? articleData.data : []
                        tabProps.prodData = shotsResult.success ? shotsData.data : []
                        break
                    //TODO: 完成关于服务端渲染 
                    case 'about':
                        tabProps.aboutResultData = await fetchGetAuthorAbout({ host, code })
    
                        break
                    case 'like':
                        tabProps.favorResultData = await fetchGetAuthorFavorCount({ host, code })
        
                        break
                    case 'focus':
    
    
                        break
                    case 'fans':
    
                        break
                    case 'shots':
                    default:
                        articleResult = await fetchGetComposition({ host, code, type: CompositionTypes.ARTICLE, ...articleParam, page: 1 })
                        shotsResult = await fetchGetComposition({ host, code, token, client_code, type: CompositionTypes.SHOTS, ...compositionParam, page: 1 })
                        articleData = articleResult.data || {}
                        shotsData = shotsResult.data || {}
                        tabProps.artiData = articleResult.success ? articleData.data : []
                        tabProps.prodData = shotsResult.success ? shotsData.data : []

                        if (shotsData.total_count === 0 && articleData.total_count === 0) {
                            tabProps.aboutResultData = await fetchGetAuthorAbout({ host, code })
                        }
                        break
                }
        
                
            }

            // // 获取主页个人/机构的关于信息
            // const aboutData = await fetchGetAuthorAbout({
            //     host, code
            // })

            // // 获取主页作者喜欢
            // const favorData = await fetchGetAuthorFavor({
            //     host, code
            // })

            // // 获取主页关注创作者信息
            // const followData = await fetchGetAuthorFollow({
            //     host, code
            // })

            // // 主页创作者粉丝信息
            // const fansData = await fetchGetAuthorFans({
            //     host, code
            // })

            // // 获取主页作者喜欢数
            // const favorCountData = await fetchGetAuthorFavorCount({
            //     host, code
            // })

            initProps = {
                // fansData,
            }

            sideProps = {
                authorInfo
            }
        }
        

        return { statusCode, query, ...initProps, sideProps, tabProps, contentProps }
    }

    componentDidMount() {
        this.initWxSignature()
    }

    initWxSignature() {
        const { briefInfo } = this.props
        const authorInfo = briefInfo || {}
        wxSignature.init({
            cover: authorInfo.avatar,
        })
    }

    render() {
        const { 
            statusCode,
            query, 
            asPath, 
            isMobileScreen,
            briefInfo,
            userInfo, 
            tabProps, 
            sideProps,
            contentProps, 
            compositionData 
        } = this.props

        if (statusCode) {
            return <Error statusCode={statusCode} />
        }

        const info = briefInfo || {}
        const nickname = (info && info.nickname) ? info.nickname : ''

        const tabName = tabNameMap[query.tab] || '首页'

        let pageTitle = `${nickname}的作品官网`
        switch(query.tab) {
            case 'shots':
                pageTitle = `${nickname}的作品-${pageTitle}`
                break
            case 'article':
                pageTitle = `${nickname}的文章-${pageTitle}`
                break
            case 'about':
                pageTitle = `${nickname}的简介-${pageTitle}`
                break
        }

        return (
            <>
                <HeadComponent 
                    //title={`${nickname}营销作品 - 创意营销案例 - ${tabName}`} 
                    title={pageTitle}
                    description={`${info.profile}`}
                />
                {isMobileScreen && <MbNavigatorBar 
                    showTitle 
                    title={nickname} 
                />}
                <UserLayout 
                    query={query} 
                    info={info} 
                    bgEditable={true}
                    sider={<AuthorSider query={query} sideProps={sideProps} />}
                >
                    <AuthorContent 
                        query={query} 
                        authorInfo={info} 
                        tabProps={tabProps} 
                        userInfo={userInfo} 
                        contentProps={contentProps} 
                        compositionData={compositionData} 
                    />
                </UserLayout>
            </>
        )
    }
}