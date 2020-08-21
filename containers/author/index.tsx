import { Component } from 'react'
import { Col, message } from 'antd'
import { Router } from '@routes'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import dynamic from 'next/dynamic'
import jsCookie from 'js-cookie'
import { utils, config } from '@utils'

import {
  LetterSendType,
  LetterSources,
  LetterSenderTypes,
  LetterReceiverTypes,
  CommonSortType,
  SearchType,
} from '@base/enums'

import PartLoading from '@components/features/PartLoading'
import { tabList, subTabList } from '@constants/author/list'
import EmptyComponent from '@components/common/EmptyComponent'
import AuthorList from '@components/author/AuthorList'
import SubTab from '@components/widget/common/SubTab'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'
// import LoadMore from '@components/common/LoadMore'
import HeadTab from '@components/common/HeadTab'
import AuthorSubFilterBar from './AuthorSubFilterBar'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
  loading: () => <p></p>,
  ssr: false
})

@inject(stores => {
  const { authorStore, globalStore, accountStore, letterStore } = stores.store
  const { ipAddress, isMobileScreen } = globalStore
  const { currentUser } = accountStore
  const { condition, changeCondition, originalCondition, authorListData, changeAuthorList, fetchAuthorList, fetchAuthorActionFollow } = authorStore

  return {
    letterStore,
    currentUser,
    condition,
    ipAddress,
    isMobileScreen,
    authorListData,
    changeCondition,
    fetchAuthorList,
    changeAuthorList,
    originalCondition,
    fetchAuthorActionFollow,
  }
})
@observer
export default class AuthorContainer extends Component {
  clickRoute = item => {
    const type = item.type === null ? 1 : item.type
    window.location.href = `/author/${item.code}`
  }

  recommendClick = () => {
    const { condition, changeCondition, fetchAuthorList } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const originTerm = condition.term || {}
    const originProvince = originTerm.province
    const originCity = originTerm.city
    const originType = originTerm.type
    let newCondition = {
      ...condition,
      term: {
        // ...toJS(condition.term),
        type: originType,
        province: originProvince,
        city: originCity,
      },
      page: 1,
      limit: 45,
      recommended: true
    }

    fetchAuthorList({ condition: newCondition, token })
    changeCondition(newCondition)
    this.changeRoute({ sort: CommonSortType.RECOMMEND })
  }

  reqHeadAuthorList = option => {
    const { condition, changeCondition, fetchAuthorList } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const originTerm = condition.term || {}
    const originProvince = originTerm.province
    const originCity = originTerm.city
    const newTerm = option.term || {}
    const newCondition = {
      ...option,
      term: {
        ...toJS(option.term),
        province: originProvince,
        city: originCity,
        type: newTerm.type,
      },
      page: 1,
      limit: 45,
      // recommended: true, 
    }
    fetchAuthorList({ condition: newCondition, token })
    changeCondition(newCondition)
    this.changeRoute({ type: option.term.type })
  }

  changeRoute(option) {
    const originQuery = { ...this.props.query }
    const query = {
      ...originQuery,
      ...option,
    }
    let pathArr = []
    pathArr.push(query.sort || CommonSortType.RECOMMEND)
    pathArr.push(query.type || '0')
    pathArr.push(query.province || '0')
    pathArr.push(query.city || '0')
    Router.pushRoute(`/author!${pathArr.join('!')}`)
  }

  reqAuthorList = (option = {}, routeOption) => {
    const { condition, changeCondition, fetchAuthorList } = this.props
    // console.log('cond', toJS(condition))
    const originTerm = condition.term || {}
    const originProvince = originTerm.province
    const originCity = originTerm.city
    const originType = originTerm.type
    const newTerm = option.term || {}
    const newCondition = {
      ...condition,
      ...option,
      term: {
        province: originProvince,
        city: originCity,
        ...toJS(newTerm),
        type: newTerm.type || originType,
        // type: condition.term && condition.term.type,
      },
      page: 1,
      limit: 45,
    }

    // console.log('cond', toJS(condition), toJS(newCondition))

    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)

    changeCondition(newCondition)
    fetchAuthorList({ condition: newCondition, token })
    this.changeRoute(routeOption)
  }

  reqAuthorData = () => {
    const { condition, changeCondition, fetchAuthorList } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const param = { ...condition, page: condition.page + 1 }

    fetchAuthorList({ condition: param, token })
    changeCondition(param)
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
    const {
      query,
      condition,
      currentUser,
      ipAddress,
      isMobileScreen,
      serverClientCode,
      originalCondition,
      fetchAuthorActionFollow,
      authorListData,
    } = this.props
    const { state, isLastPage } = authorListData
    let presentArea

    if (ipAddress.cityName) {
      presentArea = `${ipAddress.cityName}`
    } else if (ipAddress.provinceName) {
      presentArea = `${ipAddress.provinceName}`
    }

    return (
      <>
        {isMobileScreen && <MbNavigatorBar
          showTitle
          title="创作者"
          btnType="back"
          backUrl="/discover"
        />}
        <div className='author-containers'>
          {isMobileScreen && <AuthorSubFilterBar
            query={query}
            condition={condition}
            originalCondition={originalCondition}
            onRequestList={this.reqAuthorList}
            onRecommended={this.recommendClick}
          />}
          {!isMobileScreen && <>
            <HeadTab
              query={query}
              headTabList={tabList}
              reqList={this.reqHeadAuthorList}
              originalCondition={originalCondition}
            />
            <div className='author-sub-tab'>
              <SubTab
                originalCondition={originalCondition}
                recommendClick={this.recommendClick}
                reqList={this.reqAuthorList}
                searchType={SearchType.AUTHOR}
                presentArea={presentArea}
                subTabList={subTabList}
                condition={condition}
                userInfo={currentUser}
                gmtState={`gmtCreate`}
              />
            </div>
          </>}
          <div className='author-content media-org-content' style={{ position: 'relative' }}>
            {authorListData.list.length > 0 ? <Col span={24}>
              <AuthorList
                data={authorListData}
                onRoute={this.clickRoute}
                isMobileScreen={isMobileScreen}
                fetchFollow={fetchAuthorActionFollow}
                onEnquiry={this.handleEnquiry}
              />
              {!isLastPage &&
                <LoadMore
                  name={`加载更多`}
                  num={3}
                  reqList={this.reqAuthorData}
                />}
            </Col> : <EmptyComponent text='暂无相关创作者' />}
            {!state && <PartLoading float mask />}
          </div>
        </div>
      </>
    )
  }
}