import { Component } from 'react'
import { Row, Col } from 'antd'
import { toJS } from 'mobx'
import dynamic from 'next/dynamic'
import jsCookie from 'js-cookie'
import classNames from 'classnames'

import { inject, observer } from 'mobx-react'
import { Router } from '@routes'
import { utils, config } from '@utils'
import { CompositionTypes, CommonSortType } from '@base/enums'
import SubTab from '@components/widget/common/SubTab'
import { subTabList } from '@constants/tag/list'
import HeadTab from '@components/common/HeadTab'
import PartLoading from '@components/features/PartLoading'
import EmptyComponent from '@components/common/EmptyComponent'

import CommonIntro from '@components/common/CommonIntro'
import ArticleItem from '@components/article/ArticleItem'
import ShareGroup from '@containers/shots/ShareGroup'
import TagSubFilterBar from './TagSubFilterBar'
import TagHeaderTabs from './TagHeaderTabs'

import './index.less'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
  loading: () => <p></p>,
  ssr: false
})

const sortTypes = [{
  key: CommonSortType.NEWEST,
  name: `最新`,
}, {
  key: CommonSortType.HOT,
  name: `热门`,
}]

let num = 3

interface State {
  current: number
}

@inject(stores => {
  const { tagStore, adStore, globalStore } = stores.store
  const { isMobileScreen } = globalStore
  const { changeTerms, tagDetail, tagData, updateTagDatas, fetchGetClientTagList, fetchActionFavors, fetchTagFollow } = tagStore
  const { tagAds } = adStore

  return {
    isMobileScreen,
    changeTerms,
    tagDetail,
    tagData,
    updateTagDatas,
    fetchGetClientTagList,
    fetchActionFavors,
    fetchTagFollow,
    tagAds,
  }
})

@observer
export default class TagListContainer extends Component<Props, State> {

  reqHeadAuthorList = (option = {}) => {
    const { tagDetail, tagData, changeTerms, fetchGetClientTagList, query } = this.props
    const isArticle = option.term.type === 1
    const params = {
      term: {
        ...toJS(option.term),
        tags: tagDetail.state ? [tagDetail.tag.id] : [0],
      },
      page: 1,
      limit: isArticle ? 10 : 50,
    }
    // console.log('作品文章', params)

    // changeTerms(params)
    fetchGetClientTagList({ terms: params })
  }

  reqShotsList = (option:any = {}) => {
    const { query, tagData, fetchGetClientTagList } = this.props
    const terms = tagData.terms || {}
    const term = terms.term || {}
    const optionTerm = option.term || {}
    const isArticleType = (optionTerm.type ? optionTerm.type : term.type) === CompositionTypes.ARTICLE
    let params = {
      ...option,
      term: {
        ...toJS(term),
        ...option.term,
        tags: [query.id],
      },
      limit: isArticleType ? 10 : 50,
      page: option.page || 1,
    }

    fetchGetClientTagList({ terms: params })
  }

  reqComposition = () => {
    const { tagDetail, tagData, fetchGetClientTagList } = this.props
    const param = {
      ...tagData.terms,
      page: tagData.terms.page + 1,
      tags: [tagDetail.tag.id]
    }

    // console.log('加载更多', param)
    fetchGetClientTagList({ terms: param })
  }

  tagFollow = (e) => {
    e.stopPropagation()
    const { tagDetail, fetchTagFollow } = this.props
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    let action

    if (tagDetail.followed) {
      action = 0
    } else {
      action = 1
    }

    fetchTagFollow({ client_code, id: tagDetail.tag.id, type: 2, action })
  }

  handleJumpClick = (url) => {
    window.open(url)
  }

  handleTabChange = (type) => {
    const { query } = this.props
    // const keyLabel = type === CompositionTypes.ARTICLE ? 'article' : 'shots'
    // Router.pushRoute(`/tag/${query.id}/${keyLabel}`)
    if (type === CompositionTypes.ARTICLE) {
      Router.pushRoute(`/tag/${query.id}/${CompositionTypes.ARTICLE}`)
    } else {
      Router.pushRoute(`/tag/${query.id}`)
    }
    const param = {
      term: { type }
    }
    this.reqShotsList(param)
  }

  handleSortChange = (sort) => {
    let param = {}

    switch (sort) {
      case CommonSortType.HOT:
        param = { sort: [{ key: 'degree', value: 'desc' }], recommended: false }
        break
      case CommonSortType.NEWEST:
        param = { sort: [{ key: 'gmtPublish', value: `desc` }], recommended: false }
        break
    }
    this.reqShotsList(param)
  }

  render() {
    const { tagDetail, tagData, tagAds, isMobileScreen, fetchActionFavors, tagType, query } = this.props
    const { state, end } = tagData
    const loading = tagData.loading
    const listTerms = tagData.terms || {}
    const listTerm = listTerms.term || {}
    const listSort = listTerms.sort || []
    const tabType = listTerm.type
    const tagCompositionList = tagData.list || []
    const isListEmpty = tagCompositionList.length === 0
    const gutter = isMobileScreen ? 15 : 30
    const shotsCount = tagDetail.works || 0
    const articleCount = tagDetail.articles || 0
    const tabList = [{
      key: CompositionTypes.SHOTS,
      name: `作品 ${shotsCount}`
    }, {
      key: CompositionTypes.ARTICLE,
      name: `文章 ${articleCount}`
    }]
    const isHotSort = listSort.some(item => item.key === 'degree')
    const currentSortType = isHotSort ? CommonSortType.HOT : CommonSortType.NEWEST
    const queryID = {
      type: query.type === 'article' ? 1 : 0
    }
    const tAds = tagAds['f_t'] || []
    const adItem = tAds[0] || {}
    const bannerImage = adItem.image
    const bannerTitle = adItem.title
    const bannerLink = !adItem.link ? adItem.link : utils.addHttp(adItem.link)

    const urlSuffix = query.ref ? `ref=${query.ref}` : ''


    return (
      <div className='tag-list-container media-prod-content'>
        <div className='head-tab-content'>
          <div className={classNames(
            'tag-banner',
            { 'has-banner': bannerImage },
            { 'has-link': bannerLink },
          )}
            onClick={e => bannerLink ? this.handleJumpClick(bannerLink) : null}
          >
            {bannerImage && <div className='intro-show-img'>
              <img src={bannerImage} alt={bannerTitle} className='banner-img' />
            </div>}
            <div className="tag-title-wrapper">
              <div className='head-title-box'>
                <div className='head-title'>
                  <span>{tagDetail.tag.name}</span>
                  {tagDetail.followed ?
                    <button className='ant-btn completed' onClick={this.tagFollow}>已关注</button> :
                    <button className='ant-btn ant-btn-primary' onClick={this.tagFollow}>关注</button>
                  }
                </div>
              </div>
            </div>
          </div>
          <hr />
          {!isMobileScreen && <div className='head-tab-box'>
            <TagHeaderTabs
              type={listTerm.type}
              list={tabList}
              onChange={this.handleTabChange}
            />
          </div>}
          {isMobileScreen && <TagSubFilterBar
            query={query}
            compositionType={tabType}
            onTypeChange={this.handleTabChange}
            onRequestList={this.reqShotsList}
          />}
        </div>
        {!isMobileScreen && <div className='sub-tab-content'>
          <div className='sub-tab-box'>
            <TagHeaderTabs
              type={currentSortType}
              list={sortTypes}
              onChange={this.handleSortChange}
            />
            {/* <SubTab
              subTabList={subTabList}
              condition={tagData.terms}
              reqList={this.reqShotsList}
            /> */}
            <div className='tag-share-bar'>
              <ShareGroup
                className="right"
                // title={tagDetail.tag.name}
                // authorName={tagDetail.tag.creator}
                tagPageShare={tagDetail.tag.name}
              />
            </div>
          </div>
        </div>}
        {tabType === CompositionTypes.SHOTS ?
          <div className='production-content'>
            {!loading ?
              <>
                <Row type='flex' align='middle' justify='center' gutter={24}>
                  <Col span={24}>
                    <Row type='flex' align='middle' justify='start' gutter={gutter}>
                      {tagData.list && tagData.list.length > 0 ? tagData.list.map(item => {
                        return (
                          <Col key={item.id || item.compositionId}>
                            <CommonIntro
                              brand
                              urlSuffix={urlSuffix}
                              item={item}
                              authorDetail
                              onFavor={fetchActionFavors}
                            />
                          </Col>
                        )
                      }) : <EmptyComponent text='暂无相关作品' />}
                    </Row>
                  </Col>
                </Row>
                {!loading && !end && <LoadMore name={`加载更多`} num={num}
                  reqList={this.reqComposition} />}
              </> : <PartLoading />}
          </div>
          :
          <div className={classNames('article-list',
            { 'nobg': tagCompositionList.length <= 0 || loading})}>
            {!loading ?
              <>
                {!isListEmpty ? tagCompositionList.map(item => {
                  return (
                    <ArticleItem
                      item={item}
                      key={item.compositionId}
                      id={item.compositionId}
                      title={item.title}
                      cover={item.cover}
                      summary={item.summary}
                      authorCode={item.authorCode}
                      author={item.authorName}
                      view={item.views}
                      time={item.gmtPublish}
                      classification={item.classificationName}
                    />
                  )
                }) : <EmptyComponent text='暂无相关文章' />}
                {!loading && !end &&
                  <LoadMore
                    name={`加载更多`}
                    num={3}
                    reqList={this.reqComposition} />}
              </>
              : <PartLoading />}
          </div>}
      </div>
    )
  }
}