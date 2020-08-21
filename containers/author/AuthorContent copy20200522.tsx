import { Component } from 'react'
import dynamic from 'next/dynamic'
import { Tabs } from 'antd'
import { Router } from '@routes'
import { AuthorType } from '@base/enums'
import { inject, observer } from 'mobx-react'
import { CompositionType } from '@base/enums'
import { toJS } from 'mobx'


const { TabPane } = Tabs

// import FavoriteContainer from './FavoriteContainer'
// import FansContainer from './FansContainer'
// import FocusContainer from './FocusContainer'
import ArticleContainer from './ArticleContainer'
import ProductionContainer from './ProductionContainer'
import AboutPersonContainer from './AboutPersonContainer'
import AboutInstitutionContainer from './AboutInstitutionContainer'
import PartLoading from '@components/features/PartLoading'

// const ProductionContainerWithNoSSR = dynamic(() => import('./ProductionContainer'), {
//     loading: () => <PartLoading />,
//     ssr: false
// })

// const FavoriteContainerWithNoSSR = dynamic(() => import('./FavoriteContainer'), {
//     loading: () => <PartLoading />,
//     ssr: false
// })

// const AboutInstitutionContainerWithNoSSR = dynamic(() => import('./AboutInstitutionContainer'), {
//     loading: () => <PartLoading />,
//     ssr: false
// })

// const ArticleContainerWithNoSSR = dynamic(() => import('./ArticleContainer'), {
//     loading: () => <PartLoading />,
//     ssr: false
// })

// const FocusContainerWithNoSSR = dynamic(() => import('./FocusContainer'), {
//     loading: () => <PartLoading />,
//     ssr: false
// })

// const FansContainerWithNoSSR = dynamic(() => import('./FansContainer'), {
//     loading: () => <PartLoading />,
//     ssr: false
// })

// const AboutPersonContainerWithNoSSR = dynamic(() => import('./AboutPersonContainer'), {
//     loading: () => <PartLoading />,
//     ssr: false
// })

interface Props {
    id: number,
    tab: string,
    type: number,
    query: any,
}

interface State {

}

const tabList = [`shots`, `article`, `about`, `like`, `focus`, 
    `followers`, `shots`, `article`, `followers`]

@inject(stores => {
    const { authorStore, accountStore } = stores.store
    const { currentUser } = accountStore
    const { 
        briefInfo,
        favorData,
        fansParam,
        followParam, 
        articleParam,
        favorCondition, 
        fetchFavorList, 
        compositionData,
        compositionParam,
        articleData,
        fetchGetComposition,
        fetchGetClientAuthorFans,
        fetchGetAuthorAbout,
        fetchGetClientAuthorFollow,
        fetchGetAuthorFavorCount, 
    } = authorStore

    return {
        currentUser,
        briefInfo,
        favorData,
        fansParam,
        followParam,
        articleParam,
        favorCondition,
        fetchFavorList,
        compositionData,
        compositionParam,
        articleData,
        fetchGetClientAuthorFans,
        fetchGetComposition,
        fetchGetAuthorAbout,
        fetchGetClientAuthorFollow,
        fetchGetAuthorFavorCount,
    }
})
@observer
export default class AuthorContent extends Component<Props, State> {
    state = {
        loadingTab: true
    }

    componentDidMount() {
        this.setState({ loadingTab: false })
    }

    personalChangeTabs = key => {
        const {
            query,
            currentUser,
            briefInfo,
            fansParam,
            followParam,
            articleParam,
            compositionParam,
            fetchGetComposition,
            fetchGetAuthorAbout,
            fetchGetClientAuthorFans,
            fetchGetClientAuthorFollow,
            fetchGetAuthorFavorCount,
        } = this.props
        const { code, tab, type } = query

        console.log('curr user', toJS(currentUser), toJS(briefInfo))

        switch (key) {
            case 'article':
                fetchGetComposition({ code, type: CompositionType.ARTICLE, ...articleParam, page: 1 })

                break
            case 'about':
                fetchGetAuthorAbout({ code })

                break
            case 'like':
                fetchGetAuthorFavorCount({ code })

                break
            case 'focus':
                fetchGetClientAuthorFollow({ code, ...followParam })

                break
            case 'followers':
                fetchGetClientAuthorFans({ code, ...fansParam })

                break
            case 'shots': 
            default:
                fetchGetComposition({ code, type: CompositionType.COMPOSITION, ...compositionParam, page: 1 })

                break
        }

        //FIXME: 修复Router.pushRoute和window.location.href
        if(type) {
            if(key) {
                // window.location.href = `/teams/${code}/${key}`
                // Router.pushRoute(`/teams/${code}/${key}`)
            } else {
                // window.location.href = `/teams/${code}`
                // Router.pushRoute(`/teams/${code}`)
            }
        } else {
            if(key) {
                Router.pushRoute(`/author/${code}/${key}`)
            } else {
                Router.pushRoute(`/author/${code}`)
            }
        }
    }

    changeTabs = key => {
        const { 
            query,
            fansParam,
            followParam,
            articleParam,
            compositionParam, 
            fetchGetComposition,
            fetchGetClientAuthorFans,
            fetchGetAuthorAbout,
            fetchGetClientAuthorFollow,
            fetchGetAuthorFavorCount,
        } = this.props
        const { code, tab, type } = query

        switch(key) {
            case 'article':
                fetchGetComposition({ code, type: CompositionType.ARTICLE, ...compositionParam, page: 1 })

                break
            case 'followers':

                break
            case 'about':
                fetchGetAuthorAbout({ code })

                break
            case 'shots':
            default:
                fetchGetComposition({ code, type: CompositionType.COMPOSITION, ...compositionParam, page: 1 })

                break
        }

        //FIXME: 修复Router.pushRoute和window.location.href
        if(type) {
            if(key) {
                // window.location.href = `/teams/${code}/${key}`
                // Router.pushRoute(`/teams/${code}/${key}`)
            } else {
                // window.location.href = `/teams/${code}`
                // Router.pushRoute(`/teams/${code}`)
            }
        } else {
            if(key) {
                Router.pushRoute(`/author/${code}/${key}`)
            } else {
                Router.pushRoute(`/author/${code}`)
            }
        }
        // Router.pushRoute(`/author/${key}/${type}/${code}`)
    }

    getActiveKey() {
        const { query, tabProps } = this.props
        let key = 'shots'
        if (query.tab) {
            key = query.tab
        } else if (tabProps && tabProps.prodData && tabProps.prodData.count > 0) {
            key = 'shots'
        } else if (tabProps && tabProps.artiData && tabProps.artiData.count > 0) {
            key = 'article'
        } else {
            key = 'about'
        }
        return key
    }

    render() {
        const { loadingTab } = this.state
        const { query, tabProps, briefInfo, authorInfo, contentProps } = this.props
        const { id, tab, code } = query 
        //FIXME: 修正
        const isPerson = (briefInfo.type === AuthorType.PERSONAL)

        const activeKey = this.getActiveKey()

        if(tabList.some(l => l === tab) || tab === undefined) {
            return (
                // <div className='common-container org-content-container'>
                <div className='org-content-container'>
                    {isPerson ?
                        <Tabs
                            size={`large`}
                            animated={false}
                            forceRender={true}
                            className='user-tabs'
                            activeKey={activeKey}
                            onChange={this.personalChangeTabs || {}}
                        >
                            <TabPane tab='作品' key='shots'>
                                <ProductionContainer query={query} prodData={tabProps.prodData || {}} />
                            </TabPane>
                            <TabPane tab='文章' key='article'>
                                <ArticleContainer query={query} artiData={tabProps.artiData || {}} />
                            </TabPane>
                            <TabPane tab='关于' key='about'>
                                <AboutPersonContainer query={query} aboutResultData={tabProps.aboutResultData || {}} />
                            </TabPane>
                            {/* <TabPane tab='喜欢' key='like'>
                                <FavoriteContainer query={query} favorResultData={tabProps.favorResultData} />
                            </TabPane>
                            <TabPane tab='关注' key='focus'>
                                <FocusContainerWithNoSSR query={query} />
                            </TabPane>
                            <TabPane tab='粉丝' key='followers'>
                                <FansContainerWithNoSSR query={query} />
                            </TabPane> */}
                        </Tabs> :
                        <Tabs 
                            className='user-tabs' 
                            size={`large`} 
                            defaultActiveKey={activeKey} 
                            animated={false} 
                            onChange={this.changeTabs}
                        >
                            <TabPane tab='作品' key='shots'>
                                <ProductionContainer query={query} prodData={tabProps.prodData || {}} />
                            </TabPane>
                            <TabPane tab='文章' key='article'>
                                <ArticleContainer query={query} artiData={tabProps.artiData || {}} />
                            </TabPane>
                            <TabPane tab='关于' key='about'>
                                <AboutInstitutionContainer query={query} authorInfo={authorInfo} insAboutResultData={tabProps.aboutResultData || {}} />
                            </TabPane>
                            {/* <TabPane tab='粉丝' key='followers'>
                                <FansContainerWithNoSSR query={query} />
                            </TabPane> */}
                        </Tabs>
                    }
                </div>
            )
        } else {
            return (
                <div>404</div>
            )
        }
    }
}