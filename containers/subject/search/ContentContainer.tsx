import { Component } from 'react'
import { Row, Col, Tabs } from 'antd'
import { utils } from '@utils'
import dynamic from 'next/dynamic'
import { Router } from '@routes'
import { inject, observer } from 'mobx-react'
import {
    SearchType,
    FollowTypes,
    LetterSendType, 
    LetterSources, 
    LetterSenderTypes, 
    LetterReceiverTypes
  } from '@base/enums'
import classNames from 'classnames'
import jsCookie from 'js-cookie'
import { toJS } from 'mobx'

// import LoadMore from '@components/common/LoadMore'
import SubTab from '@components/widget/common/SubTab'
import AuthorList from '@components/author/AuthorList'
import HeadPaneTab from '@components/common/HeadPaneTab'
import CommonIntro from '@components/common/CommonIntro'
import ArticleItem from '@components/article/ArticleItem'
import ClassifyTabs from '@components/common/ClassifyTabs'
import PartLoading from '@components/features/PartLoading'
import EmptyComponent from '@components/common/EmptyComponent'
import SearchBrandItem from '@components/search/SearchBrandItem'
import TopicItem from '@containers/topic/TopicItem'
import CustomIcon from '@components/widget/common/Icon'
import ClassifyDropdown from '@components/common/ClassifyDropdown'
import SearchFilterBarMobile from './SearchFilterBarMobile'

import { subTabList } from '@constants/search/list'
import { config } from '@utils'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
    loading: () => <p></p>,
    ssr: false
})

const TabPane = Tabs.TabPane

let num = 3
let authorType
let searchType = SearchType.SHOTS

@inject(stores => {
    const { searchStore, globalStore, compositionStore, letterStore } = stores.store
    const { isMobileScreen } = globalStore
    const { classificationsAll, classificationData, fetchGetClientShotsList } = compositionStore
    const { 
        fetchSearchHot, 
        searchFilterData, 
        resetSearchResultTerms,
        
        fetchSearchFavor,
        resetResultTerms, 
        searchResultData, 
        searchResultTerms,
        clientKeywords,

        fetchGetSearchFilter, 
        fetchGetSearchContent, 
        changeSearchFilterData, 
        fetchSearchAuthorFollow,
        changeSearchResultTerms,
    } = searchStore

    return {
        letterStore,
        searchStore,
        fetchSearchHot,
        fetchSearchFavor,
        searchFilterData,
        fetchSearchAuthorFollow,
        changeSearchFilterData,
        resetSearchResultTerms,
        clientKeywords,

        classificationsAll, 
        classificationData,
        fetchGetClientShotsList,

        isMobileScreen,
        resetResultTerms,
        searchResultData,
        searchResultTerms,
        fetchGetSearchFilter,
        fetchGetSearchContent,
        changeSearchResultTerms,
    }
})
@observer
export default class ContentContainer extends Component {
    state = {
        cateKey: 0,
        formKey: 0,
        authorKey: 0,
        articleKey: 0,
        brandKey: 0,
        tagKey: 0,

        showFilter: false,
    }

    reqSearchResult = param => {
        const { query, searchResultTerms, fetchGetSearchFilter, fetchGetSearchContent, searchStore } = this.props
        const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
        // const key = decodeURIComponent(utils.getUrlParam(`k`))
        const key = decodeURIComponent((query.k || '').replace(/\s+/g,''))
        let terms = {
            ...toJS(searchResultTerms),
            keywords: key,
            term: {
                ...toJS(searchResultTerms.term),
                // type: param.search_type
            }
        }

        if(param.terms) {
            terms = { ...terms, ...param.terms }
        }

        delete param.terms
        const params = { terms, client_code, ...param  }

        // if(!Number(param.author_type) && Number(param.search_type) === SearchType.AUTHOR) {
        //     params.terms && params.terms.term && delete params.terms.term.type
        // }

        fetchGetSearchContent(params)
        fetchGetSearchFilter({ key })
        searchStore.updateKeywords(key)
    }

    handleCateClassify = key => {
        const { searchResultTerms, query } = this.props
        this.setState({ cateKey: key })
        const categoryCodes = Number(key) !== 0 ? [key] : []
        this.reqSearchResult({ terms: { term: { ...searchResultTerms.term, categoryCodes },  page: 1 }, search_type: SearchType.SHOTS })
        this.changeRoute({type: 'shots', category: key})
    }

    handleFormClassify = key => {
        const { searchResultTerms, query } = this.props
        this.setState({ formKey: key })
        const formCodes = Number(key) !== 0 ? [key] : []
        this.reqSearchResult({ terms: { term: { ...searchResultTerms.term, formCodes }, page: 1 }, search_type: SearchType.SHOTS })
        this.changeRoute({type: 'shots', form: key})
    }

    handleArticleClassify = key => {
        const { searchResultTerms, query } = this.props
        this.setState({ articleKey: key })
        const classificationCodes = Number(key) ? [key] : []
        this.reqSearchResult({ terms: { term: { ...searchResultTerms.term, classificationCodes },  page: 1 }, search_type: SearchType.ARTICLE })
        this.changeRoute({type: 'article', classification: key})
    }

    handleAuthorClassify = author_type => {
        this.setState({ authorKey: author_type })
        this.reqSearchResult({ terms: { term: { type: !!Number(author_type) ? author_type : undefined } , 
            sort: [{
                key: 'gmtCreate',
                value: 'desc'
            }], page: 1 }, search_type: SearchType.AUTHOR, author_type })
        this.changeRoute({type: 'author', authorType: author_type})
    }

    changeRoute(option) {
        const { query } = this.props
        const newQuery = {
            ...query,
            ...option,            
        }
        const keywords = encodeURIComponent((newQuery.k || '').replace(/\s+/g,''))
        const type = query.type || 'shots'
        const sort = newQuery.sort || ''
        const category = newQuery.category || ''
        const form = newQuery.form || ''
        const classification = newQuery.classification || ''
        const authorType = newQuery.authorType || ''
        Router.pushRoute(`/search/${type}!${keywords}!${sort}!${category}!${form}!${classification}!${authorType}`)
    }

    handlePaneTab = key => {
        const { query, resetResultTerms, resetSearchResultTerms } = this.props
        const keywords = encodeURIComponent((query.k || '').replace(/\s+/g,''))

        switch(Number(key)) {
            case SearchType.ARTICLE:
                searchType = SearchType.ARTICLE
                Router.pushRoute(`/search/article!${keywords}`)

                break
            case SearchType.AUTHOR:
                searchType = SearchType.AUTHOR
                Router.pushRoute(`/search/author!${keywords}`)

                break
            case SearchType.BRAND: 
                searchType = SearchType.BRAND
                Router.pushRoute(`/search/brand!${keywords}`)

                break
            case SearchType.TAG: 
                searchType = SearchType.TAG
                Router.pushRoute(`/search/tag!${keywords}`)

                break
            case SearchType.TOPIC:
                searchType = SearchType.TOPIC
                Router.pushRoute(`/search/topic!${keywords}`)
                break
            case SearchType.SHOTS: 
            default:
                searchType = SearchType.SHOTS
                Router.pushRoute(`/search/shots!${keywords}`)
                break
        }

        resetSearchResultTerms()

        let currentResultTerms = resetResultTerms
        // if(searchType === SearchType.AUTHOR) {
        //     currentResultTerms = {
        //         ...resetResultTerms, 
        //         sort: [{
        //             key: 'gmtCreate',
        //             value: 'desc'
        //         }], 
        //         term: { },
        //     }
        // }

        // console.log(({ terms: { ...toJS(currentResultTerms) }, search_type: key }))

        this.reqSearchResult({ terms: { ...currentResultTerms }, search_type: key })
        this.setState({
            cateKey: 0,
            formKey: 0,
            authorKey: 0,
            articleKey: 0,
        })
    }

    clickRoute = item => window.location.href = `/author/${item.code}`

    // recommendClick = () => {
    //     const { searchResultTerms, searchResultData } = this.props

    //     let params = { terms: { recommended: !searchResultTerms.recommended, page: 1 }, search_type: searchResultData.type }

    //     this.reqSearchResult(params)
    // }

    reqSearchList = (option, routeOption) => {
        const { searchResultData, searchResultTerms } = this.props
        const terms = {...searchResultTerms, ...option}
        const term = {
            ...terms.term,
            ...option.term,
        }
        let params = { terms: { ...terms, term, page: 1, }, search_type: searchResultData.type }
        this.reqSearchResult(params)
        this.changeRoute(routeOption)
    }

    handleLoadMore = () => {
        const { searchResultTerms, searchResultData } = this.props
        const param: any = { terms: { ...toJS(searchResultTerms), page: searchResultTerms.page + 1 }, search_type: searchResultData.type }
        if(searchResultData.type === SearchType.AUTHOR) {
            param.author_type = authorType
        } 
        this.reqSearchResult(param)
    }

    handleFollow = (id, action, type) => {
        const { fetchSearchAuthorFollow } = this.props
        const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
        fetchSearchAuthorFollow({
            id,
            action,
            type,
            client_code,
        })
    }

    changeTabs = tab => {
        switch(tab) {
            case 'article':
                return SearchType.ARTICLE
            case 'author':
                return SearchType.AUTHOR
            case 'brand':
                return SearchType.BRAND
            case 'tag':
                return SearchType.TAG
            case 'topic':
                return SearchType.TOPIC
            case 'shots':
            default:
                return SearchType.SHOTS
        }
    }

    handleFilterBtnClick = () => {
        this.setState({showFilter: !this.state.showFilter})
    }

    changeCategories = (key, item) => {
        this.handleCateClassify(key)
        // const { classifications, classificationData, fetchGetClientShotsList } = this.props

        // const originTerms = classificationData.terms || {}
        // const originTerm = originTerms.term || {}
        // const param = {
        //     ...toJS(originTerms),
        //     term: {
        //         ...toJS(originTerm),
        //         categories: Number(key) === 0 ? undefined : [key],
        //     },
        //     page: 1
        // }

        // const currentOption = {}
        
        // // this.changeRoute({category: key})
        // fetchGetClientShotsList({ terms: param, currentOption })

    }

    changeForms = (key, item) => {
        this.handleFormClassify(key)
        // const { classifications, classificationData, fetchGetClientShotsList } = this.props
        // const originTerms = classificationData.terms || {}
        // const originTerm = originTerms.term || {}
        // const param = {
        //     ...toJS(originTerms),
        //     term: {
        //         ...toJS(originTerm),
        //         forms: Number(key) === 0 ? undefined : [key],
        //     },
        //     page: 1
        // }

        // const currentOption = {}
        // // this.changeRoute({form: key})
        // fetchGetClientShotsList({ terms: param, currentOption })
    }

    handleEnquiry = (record) => {
        const { letterStore } = this.props;
        letterStore.openEnquiry({
          type: LetterSendType.SEND,
          senderType: LetterSenderTypes.USER, // 1梅花网用户 2 创作者
          // senderAvatar: currentUser.avatar,
          receiverType: LetterReceiverTypes.AUTHOR,
          receiverId: record.id,
          // receiverNickName: author.nickname,
          source: LetterSources.AUTHOR_LIST,
          relationId: record.id,
        })
    }

    render() {
        const { cateKey, formKey, articleKey, authorKey, showFilter } = this.state
        const { 
            query, 
            fetchSearchAuthorFollow, 
            searchResultData, 
            searchResultTerms, 
            isMobileScreen, 
            fetchSearchFavor, 
            clientKeywords, 
            searchFilterData={}, 
            classificationsAll, 
            classificationData,
        } = this.props
        const { type } = query

        const compositionCount = (searchFilterData && searchFilterData.shots && searchFilterData.shots.count) || 0
        const articleCount = (searchFilterData && searchFilterData.article && searchFilterData.article.count) || 0
        const authorCount = (searchFilterData && searchFilterData.author && searchFilterData.author.count) || 0
        const brandCount = (searchFilterData && searchFilterData.brand && searchFilterData.brand.count) || 0
        const tagCount = (searchFilterData && searchFilterData.tag && searchFilterData.tag.count) || 0
        const topicCount = (searchFilterData && searchFilterData.topic && searchFilterData.topic.count) || 0

        const classifications = classificationsAll 
        const { state, isLastPage } = classificationData

        const categories = classifications.categories || []
        const forms = classifications.forms || []

        // const condition = classificationData.terms || {}
        const condition = searchResultTerms || {}
        const conditionTerm = condition.term || {}
        const conditionCategories = (conditionTerm.categoryCodes || [])
        const conditionForms = (conditionTerm.formCodes || [])

        // console.log('category', toJS(searchResultTerms))

        const currentTab = this.changeTabs(type)

        searchType = currentTab

        const subTab = [SearchType.BRAND, SearchType.TAG].includes(searchType) 
                        ? <span className="sub-tab-title">{SearchType.TAG === searchType ? '所有标签' : '所有品牌'}</span>
                        : <SubTab 
                                subTabList={subTabList} 
                                condition={searchResultTerms} 
                                reqList={this.reqSearchList}
                                gmtState={searchType === SearchType.AUTHOR ? `gmtCreate` : ''} 
                                searchType={searchType}
                            />
        
        const showFilterBtn = [SearchType.SHOTS, SearchType.ARTICLE, SearchType.AUTHOR].includes(searchType)

        return (
            <>
            {isMobileScreen && 
            <>
            <SearchFilterBarMobile
              query={query}
              searchType={searchType}
              searchFilterData={searchFilterData}
              categoryId={Number(conditionCategories[0])}
              formId={Number(conditionForms[0])}
              categories={categories}
              forms={forms}
              onTabChange={this.handlePaneTab}
              onRequestList={this.reqSearchList}
              onChangeCategories={this.changeCategories}
              onChangeForms={this.changeForms}
              onChangeClassifications={this.handleArticleClassify}
              onChangeAuthorType={this.handleAuthorClassify}
            />
            <div className='search-result-text'>“{`${decodeURIComponent(clientKeywords)}`}”搜索结果为 {searchResultData.count || 0} 条</div>
            </>}
            <div className={classNames(
                'content-container',
                { 'search-adaption-container': searchResultData.type === SearchType.AUTHOR }
            )}>
                {!isMobileScreen && <HeadPaneTab 
                    activeKey={String(currentTab)} 
                    reqList={this.handlePaneTab}
                    extraContent={
                        showFilterBtn ? <div className="search-filter-btn" onClick={this.handleFilterBtnClick}><span>筛选</span> <CustomIcon name="screening" /></div> : null
                    }
                >
                    <TabPane tab={`作品 ${compositionCount}`} key={String(SearchType.SHOTS)}>
                        <div className='ant-border'></div>
                        {showFilter && <div className="classify-wrapper">
                            <ClassifyDropdown
                                classifyName="品类"
                                currentId={Number(conditionCategories[0])}
                                dataSource={categories}
                                onChange={this.changeCategories}
                            />
                            <ClassifyDropdown
                                classifyName="形式"
                                currentId={Number(conditionForms[0])}
                                dataSource={forms}
                                onChange={this.changeForms}
                            />
                        </div>}
                    </TabPane>
                    <TabPane tab={`文章 ${articleCount}`} key={String(SearchType.ARTICLE)}>
                        <div className='ant-border'></div>
                        {showFilter && <div className='head-content'>
                            <div className='classify-collection'>
                                <ClassifyTabs
                                    isCode
                                    tabName={`分类`}
                                    keys={Number(query.classification)}
                                    changeFn={this.handleArticleClassify}
                                    tabList={searchFilterData.article.classify}
                                    notMore={searchFilterData.article.classify < 8}
                                    borderless={true} />
                            </div>
                        </div>}
                    </TabPane>
                    <TabPane tab={`创作者 ${authorCount}`} key={String(SearchType.AUTHOR)}>
                        <div className='ant-border'></div>
                        {showFilter && <div className='head-content'>
                            <div className='classify-collection'>
                                <ClassifyTabs
                                    isCode
                                    notMore={true}
                                    keys={query.authorType}
                                    changeFn={this.handleAuthorClassify || {}}
                                    tabList={searchFilterData.author.list || []}
                                    borderless={true} />
                            </div>
                        </div>}
                    </TabPane>
                    <TabPane tab={`品牌 ${brandCount}`} key={String(SearchType.BRAND)}>
                        <div className='ant-border'></div>
                    </TabPane>
                    <TabPane tab={`标签 ${tagCount}`} key={String(SearchType.TAG)}>
                        <div className='ant-border'></div>
                    </TabPane>
                    <TabPane tab={`专题 ${topicCount}`} key={String(SearchType.TOPIC)}>
                        <div className='ant-border'></div>
                    </TabPane>
                </HeadPaneTab>}
                {!isMobileScreen && <div className='sub-tab-box'> 
                    {subTab}
                    <span className='search-result'>“{`${decodeURIComponent(clientKeywords)}`}”搜索结果为 {searchResultData.count || 0} 条</span>
                </div>}
                <div className={classNames(
                    'search-content',
                    { 'search-author-content': searchResultData.type === SearchType.AUTHOR }
                )}>
                    {!searchResultData.state && <PartLoading />}
                        {searchResultData.state && searchResultData.list && 
                            searchResultData.list.length > 0 ? 
                        <>
                            {searchResultData.type === SearchType.AUTHOR ? 
                                <AuthorList 
                                    data={searchResultData} 
                                    onRoute={this.clickRoute} 
                                    isMobileScreen={isMobileScreen}
                                    fetchFollow={fetchSearchAuthorFollow} 
                                    onEnquiry={this.handleEnquiry}
                                /> : 
                                searchResultData.type === SearchType.SHOTS ? 
                                <Row type='flex' align='middle' justify='start' gutter={isMobileScreen ? 15 : 30}>
                                    {searchResultData.list.map(item => {
                                        return (
                                            <Col key={item.id || item.compositionId}>
                                                <CommonIntro 
                                                    brand 
                                                    item={item} 
                                                    key={item.id} 
                                                    authorDetail={true} 
                                                    onFavor={fetchSearchFavor}  /> 
                                            </Col>
                                        )
                                    })}
                                </Row> : searchResultData.type === SearchType.ARTICLE ? 
                                    <div className='article-list'>
                                        {searchResultData.list.map(item => (
                                            <ArticleItem
                                                item={item}
                                                key={item.compositionId || item.id}
                                                id={item.compositionId || item.id}
                                                title={item.title}
                                                cover={item.cover}
                                                summary={item.summary}
                                                authorCode={item.authorCode}
                                                author={item.authorName}
                                                view={item.views}
                                                time={item.gmtPublish}
                                                classification={item.classificationName}
                                            />
                                        ))}
                                    </div> : searchResultData.type === SearchType.BRAND ? 
                                    <div className="search-brand-list">
                                        {searchResultData.list.map((item, index) => (
                                            <SearchBrandItem
                                                key={index}
                                                id={item.id}
                                                name={item.chName + (item.enName ? ` (${item.enName})` : '')}
                                                url={`/brand/${item.id}`}
                                                articleCount={item.articleCount}
                                                shotsCount={item.worksCount}
                                                followed={item.followed}
                                                onFollow={(id, action) => this.handleFollow(id, action, FollowTypes.BRAND)}
                                            />
                                        ))}
                                    </div> : searchResultData.type === SearchType.TAG ? <div className="search-brand-list">
                                        {searchResultData.list.map((item, index) => (
                                            <SearchBrandItem
                                                key={index}
                                                id={item.id}
                                                icon="tag"
                                                name={item.name}
                                                url={`/tag/${item.id}`}
                                                articleCount={item.articleCount}
                                                shotsCount={item.worksCount}
                                                followed={item.followed}
                                                onFollow={(id, action) => this.handleFollow(id, action, FollowTypes.TAG)}
                                            />
                                        ))}
                                    </div>  : <div className="search-brand-list topic-list">
                                        {searchResultData.list.map((item, index) => (
                                            <TopicItem
                                                key={item.id}
                                                item={item}
                                            />
                                        ))}
                                    </div> 
                            }
                        </> : searchResultData.state && <EmptyComponent text='暂无搜索结果' />}
                    {!searchResultData.isLastPage && <LoadMore name={`加载更多`} num={num}
                        reqList={this.handleLoadMore} />
                    }
                </div>
            </div>
            </>
        )
    }
}