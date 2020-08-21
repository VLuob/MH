import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import dynamic from 'next/dynamic'
import jsCookie from 'js-cookie'
import { message, Button } from 'antd'

import PartLoading from '@components/features/PartLoading'
import EmptyComponent from '@components/common/EmptyComponent'
import CustomIcon from '@components/widget/common/Icon'
import CommonIntro from '@components/common/CommonIntro'
import BottomTabBar from '@containers/common/BottomTabBar'
import SecondHeader from '@containers/common/SecondHeader'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'
import ShotsListHeaderMobile from '../ShotsListHeaderMobile'
import ShotsListHeader from '../ShotsListHeader'

import { CompositionTypes, CommonSortType } from '@base/enums'
import { Router } from '@routes'
import { config } from '@utils'

import './index.less'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
  loading: () => <p></p>,
  ssr: false
})

interface Props {

}

interface State {

}

let num = 3
let currentOption = {}
@inject(stores => {
  const { adStore, globalStore, compositionStore, shotsStore, accountStore } = stores.store
  const { currentUser } = accountStore
  const { shotsHomeAds } = adStore
  const { isMobileScreen, serverClientCode } = globalStore
  const { changeTerms, updateShotsDatas, fetchActionFavors, classificationsAll } = compositionStore
  const { shotsData, fetchCompositions, fetchListFavor } = shotsStore

  return {
    currentUser,
    adStore,
    compositionStore,
    shotsHomeAds,
    changeTerms,
    isMobileScreen,
    serverClientCode,
    updateShotsDatas,
    fetchActionFavors,
    classificationsAll,
    shotsData,
    fetchCompositions,
    fetchListFavor,
  }
})
@observer
export default class ShotsListContainer extends Component<Props, State> {

  requestCompositions(option) {
    const { fetchCompositions, serverClientCode } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const client = serverClientCode
    const terms = option.terms || {}
    const param = {
      ...option,
      terms: {
        ...terms,
        term: {
          ...terms.term,
          type: CompositionTypes.SHOTS,
        }
      },
      token, 
      client,
    }

    if (terms.recommended) {
      const mergeAds = this.getInsertAds()
      if (mergeAds) {
        param.mergeAds = mergeAds
      }
    }
    
    fetchCompositions(param)
  }

  getInsertAds() {
    const { shotsHomeAds } = this.props
    // 插入广告
    let hasAds = false
    let mergeAds = {}
    const shotsAdFields = ['f_w_s_1', 'f_w_s_2', 'f_w_s_3']
    shotsAdFields.forEach(field => {
      if (shotsHomeAds[field]) {
        mergeAds[field] = shotsHomeAds[field]
        hasAds = true
      }
    })
    return hasAds ? mergeAds : null
  }

  handleLoadMore = () => {
    const { shotsData } = this.props
    const originTerms = shotsData.terms || {}
    const terms = { ...originTerms, page: originTerms.page + 1 }
    this.requestCompositions({terms})
  }

  changeRoute(option) {
    const originQuery = { ...this.props.query }
    const query = {
      ...originQuery,
      ...option,
    }
    const sort = query.sort || CommonSortType.RECOMMEND
    const category = query.category || '0'
    const form = query.form || '0'
    const province = query.province || '0'
    const city = query.city || '0'
    const urlPath = `!${sort}!${category}!${form}!${province}!${city}`
    Router.pushRoute(`/shots${urlPath}`)
  }

  handleCategoryChange = (categoryCode, item) => {
    const { shotsData } = this.props
    const originTerms = shotsData.terms || {}
    const originTerm = originTerms.term || {}
    const terms = {
      ...toJS(originTerms),
      term: {
        ...toJS(originTerm),
        categoryCodes: Number(categoryCode) === 0 ? undefined : [categoryCode],
      },
      page: 1
    }
    this.changeRoute({ category: categoryCode })
    this.requestCompositions({ terms })
  }

  handleFormChange = (formCode, item) => {
    const { shotsData } = this.props
    const originTerms = shotsData.terms || {}
    const originTerm = originTerms.term || {}
    const terms = {
      ...toJS(originTerms),
      term: {
        ...toJS(originTerm),
        formCodes: Number(formCode) === 0 ? undefined : [formCode],
      },
      page: 1
    }
    this.changeRoute({ form: formCode })
    this.requestCompositions({ terms })
  }

  recommendClick = () => {
    const { changeTerms, shotsData, fetchCompositions, shotsHomeAds } = this.props
    const terms = shotsData.terms

    terms.term && terms.term.follower && delete terms.term.follower
    terms.sort && delete terms.sort

    const param = { ...terms, page: 1, recommended: true, term: { type: CompositionTypes.SHOTS } }

    // 插入广告
    let hasAds = false
    let mergeAds = {}
    const shotsAdFields = ['f_w_s_1', 'f_w_s_2', 'f_w_s_3']
    shotsAdFields.forEach(field => {
      if (shotsHomeAds[field]) {
        mergeAds[field] = shotsHomeAds[field]
        hasAds = true
      }
    })

    this.changeRoute({ sort: CommonSortType.RECOMMEND })
    changeTerms(param)
    fetchCompositions({ terms: param, mergeAds: hasAds ? mergeAds : null })
  }

  reqShotsList = (option, routeOption) => {
    const { changeTerms, fetchCompositions, shotsData } = this.props
    const params = { ...option, page: 1, limit: shotsData.terms.limit, recommended: false }

    currentOption = option

    changeTerms(params)

    this.changeRoute(routeOption)
    fetchCompositions({ terms: params })
  }

  handleRefresh = () => {
    const { changeTerms, shotsData, fetchCompositions, shotsHomeAds, serverClientCode } = this.props
    const client = serverClientCode
    const batch = shotsData.batch
    const terms = shotsData.terms
    const param = { ...terms, batch, page: 1, }
    const shotsParam: any = { terms: param, client }

    if (terms.recommended) {
      // 插入广告
      let hasAds = false
      let mergeAds = {}
      const shotsAdFields = ['f_w_s_1', 'f_w_s_2', 'f_w_s_3']
      shotsAdFields.forEach(field => {
        if (shotsHomeAds[field]) {
          mergeAds[field] = shotsHomeAds[field]
          hasAds = true
        }
      })
      if (hasAds) {
        shotsParam.mergeAds = mergeAds
      }
    }

    changeTerms(param)
    fetchCompositions(shotsParam)
  }

  handleAdClick = (id) => {
    const { adStore } = this.props
    adStore.actionAdClick({ id })
  }

  handleFavor = (option) => {
    const { fetchListFavor } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (!token && !option.action) {
      message.destroy()
      message.error(`您已经喜欢过该作品`)

      return
    }
    fetchListFavor(option)
  }

  handleSortChange = (sortKey) => {
    const { shotsData, currentUser } = this.props
    const originTerms = shotsData.terms || {}
    const originTerm = originTerms.term || {}
    const province = originTerm.province
    const city = originTerm.city
    const formCodes = originTerm.formCodes
    const terms:any = {
      limit: originTerms.limit,
      page: 1,
    }
    let term:any = {
      province,
      city,
      formCodes,
    }
    if (sortKey === CommonSortType.RECOMMEND) {
      terms.recommended = true
    } else {
      terms.recommended = false
      let sort
      switch (sortKey) {
        case CommonSortType.FOLLOW:
          if (!currentUser.id) {
            location.href = `/signin?c=${encodeURIComponent(location.href)}`
            return
          }
          term.follower = currentUser.id
          break
        case CommonSortType.NEWEST:
          sort = [{ key: 'gmtPublish', value: 'desc' }]
          break;
        case CommonSortType.HOT:
          sort = [{ key: 'degree', value: 'desc' }]
          break;
        case CommonSortType.SERVICE:
          sort = [{ key: 'services', value: 'desc' }]
          break;
      }
      if (sort) {
        terms.sort = sort
      }
    }
    terms.term = term
    this.changeRoute({ sort: sortKey })
    this.requestCompositions({terms})
  }

  handleAreaChange = ({ province, city }) => {
    const { shotsData } = this.props
    const originTerms = shotsData.terms || {}
    const originTerm = originTerms.term || {}
    const newTerm = {
      ...originTerm,
      province: [province],
      city: [city],
    }
    if (!province) {
      delete newTerm.province
    }
    if (!city) {
      delete newTerm.city
    }
    const terms = {
      ...originTerms,
      term: newTerm,
      page: 1,
    }
    this.changeRoute({ province, city })
    this.requestCompositions({terms})
  }

  handlePublish = () => {
    const { currentUser } = this.props
    const isLogin = !!currentUser.id
    if(isLogin) {
      if(currentUser.hasAuthor) {
          window.location.href = '/shots/new'
      } else {
          window.location.href = '/creator'
      }
    } else {
        window.location.href = `/signin?c=${encodeURIComponent(window.location.pathname)}`
    }
  }

  render() {
    const { isMobileScreen, fetchActionFavors, query, classificationsAll, shotsData } = this.props
    const classifications = classificationsAll
    const categories = classifications.categories || []
    const forms = classifications.forms || []
    const { loading, end } = shotsData
    const shotsList = shotsData.list || []
    const hasShots = shotsList.length > 0
    const isRecommendSort = !query.sort || query.sort === '0' || query.sort === CommonSortType.RECOMMEND
    const showRefreshBtn = !isMobileScreen && isRecommendSort
    
    return (
      <>
      {isMobileScreen && 
        <MbNavigatorBar 
          hideBackBtn 
          showTitle 
          title="作品" 
        />}
      {!isMobileScreen && 
      <SecondHeader 
        forms={forms} 
        formCode={query.form}
        navContainerClass="shots-list-container"
        currentPage="shots"
        navs={['author','enquiry','article']}
        onFormSelect={this.handleFormChange}
        extra={
          <div>
            <a href="/pricing" target="_blank" className="link-text">作品推广</a>
            <Button type="primary" onClick={this.handlePublish}>发布作品</Button>
          </div>
        }
      />}
        <div className='shots-content-box'>
          {isMobileScreen && <div className='sub-tab-content'>
            <ShotsListHeaderMobile
              sort={query.sort}
              provinceId={query.province}
              cityId={query.city}
              categoryCode={query.category}
              formCode={query.form}
              categories={categories}
              forms={forms}
              onCategoryChange={this.handleCategoryChange}
              onFormChange={this.handleFormChange}
              onSortChange={this.handleSortChange}
              onAreaChange={this.handleAreaChange}
            />
          </div>}
          {!isMobileScreen && <ShotsListHeader
            sort={query.sort}
            provinceId={query.province}
            cityId={query.city}
            categoryCode={query.category}
            formCode={query.form}
            categories={categories}
            forms={forms}
            onCategoryChange={this.handleCategoryChange}
            onFormChange={this.handleFormChange}
            onSortChange={this.handleSortChange}
            onAreaChange={this.handleAreaChange}
            onPublish={this.handlePublish}
          />}
          <div className='shots-list-container shots-list-wrapper'>
            {showRefreshBtn && <div className="btn-refresh" onClick={this.handleRefresh}><CustomIcon name="refresh" />换一换</div>}
            <div className="shots-list">
              {hasShots ? shotsList.map(item => {
                return (
                  <CommonIntro
                    key={item.id || item.compositionId}
                    brand
                    item={item}
                    authorDetail
                    onFavor={this.handleFavor}
                    onAdClick={this.handleAdClick}
                  />
                )
              }) : <EmptyComponent text='暂无相关作品' />}
            </div>
            {!end && hasShots &&
              <LoadMore
                name={`加载更多`}
                num={num}
                reqList={this.handleLoadMore}
              />}
            {loading && <PartLoading float mask />}
          </div>
        </div>
        {isMobileScreen && <BottomTabBar currentPath="shots" onRefresh={this.handleRefresh} />}
      </>
    )
  }
}