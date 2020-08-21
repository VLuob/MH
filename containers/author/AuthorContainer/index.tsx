import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import jsCookie from 'js-cookie'
import { Button } from 'antd'

import EmptyComponent from '@components/common/EmptyComponent'
import PartLoading from '@components/features/PartLoading'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'
import SecondHeader from '@containers/common/SecondHeader'
import AuthorListHeaderMobile from '../AuthorListHeaderMobile'
import AuthorListHeader from '../AuthorListHeader'
import AuthorItem from '../AuthorItem'
import { Router } from '@routes'
import { CommonSortType } from '@base/enums'
import { config } from '@utils'
import './index.less'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
  loading: () => <p></p>,
  ssr: false
})

@inject(stores => {
  const { authorStore, compositionStore, accountStore, globalStore } = stores.store
  const { isMobileScreen } = globalStore
  const { currentUser } = accountStore
  const { authorData } = authorStore
  const { classificationsAll } = compositionStore
  return {
    authorStore,
    isMobileScreen,
    currentUser,
    classificationsAll,
    authorData,
  }
})
@observer
class AuthorContainer extends Component {

  requestAuthors(option) {
    const { authorStore } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    authorStore.fetchAuthorData({ ...option, token })
  }

  changeRoute(option) {
    const { query } = this.props
    const newQuery = { ...query, ...option }
    Router.pushRoute(`/author!${newQuery.sort || 0}!${newQuery.type || 0}!${newQuery.province || 0}!${newQuery.city || 0}!${newQuery.formCode || 0}`)
  }

  handleFormChange = (formCode) => {
    const { authorData, currentUser, authorStore } = this.props
    const terms = authorData.terms || {}
    const originTerm = terms.term || {}
    // const province = originTerm.province
    // const city = originTerm.city
    // const formCodes = originTerm.formCodes
    const newTerm = {
      ...originTerm,
      formCodes: [formCode]
    }
    if (formCode === 0) {
      delete newTerm.formCodes
    }
    const condition = {
      ...terms,
      term: newTerm,
      page: 1,
    }
    this.requestAuthors({ condition })
    this.changeRoute({ formCode })
  }
  handleSortChange = (sortKey) => {
    const { authorData, currentUser, authorStore } = this.props
    const terms = authorData.terms || {}
    const originTerm = terms.term || {}
    const province = originTerm.province
    const city = originTerm.city
    const formCodes = originTerm.formCodes
    const condition = {
      page: 1,
    }
    let term = {
      province,
      city,
      formCodes,
    }
    if (sortKey === CommonSortType.RECOMMEND) {
      condition.recommended = true
    } else {
      condition.recommended = false
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
          sort = [{ key: 'gmtCreate', value: 'desc' }]
          break;
        case CommonSortType.HOT:
          sort = [{ key: 'degree', value: 'desc' }]
          break;
        case CommonSortType.SHOTS:
          sort = [{ key: 'worksQuantity', value: 'desc' }]
          break;
        case CommonSortType.SERVICE:
          sort = [{ key: 'serviceQuantity', value: 'desc' }]
          break;
      }
      if (sort) {
        condition.sort = sort
      }
    }
    condition.term = term
    // authorStore.fetchAuthorData({condition, token})
    this.requestAuthors({ condition })
    this.changeRoute({ sort: sortKey })
  }
  handleTypeChange = (type) => {
    const { authorData } = this.props
    const terms = authorData.terms || {}
    const originTerm = terms.term || {}
    const newTerm = {
      ...originTerm,
      type,
    }
    if (type === 0) {
      delete newTerm.type
    }
    const condition = {
      ...terms,
      term: newTerm,
      page: 1,
    }
    this.requestAuthors({ condition })
    this.changeRoute({ type })
  }
  handleAreaChange = ({ province, city }) => {
    const { authorData } = this.props
    const terms = authorData.terms || {}
    const originTerm = terms.term || {}
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
    const condition = {
      ...terms,
      term: newTerm,
      page: 1,
    }
    this.requestAuthors({ condition })
    this.changeRoute({ province, city })

  }

  handleLoadMore = () => {
    const { authorData } = this.props
    const terms = authorData.terms || {}
    const condition = {
      ...terms,
      page: terms.page + 1,
    }
    this.requestAuthors({ condition })
  }

  handlePublish = () => {
    window.open('/creator')
  }

  render() {
    const {
      query,
      isMobileScreen,
      classificationsAll,
      authorData,
    } = this.props

    const forms = classificationsAll.forms || []
    const authorList = authorData.list || []
    const { end, loading } = authorData
    const hasAuthors = authorList.length > 0

    return (
      <>
        {!isMobileScreen && 
          <SecondHeader 
            forms={forms} 
            formCode={query.formCode}
            navContainerClass="author-list-container"
            currentPage="author"
            navs={['shots','enquiry','article']}
            onFormSelect={this.handleFormChange}
            extra={
              <div>
              <a href="/pricing" target="_blank" className="link-text">服务商推广</a>
                <Button type="primary" onClick={this.handlePublish}>创建创作者</Button>
              </div>
            }
          />}
        {isMobileScreen && <MbNavigatorBar
          showTitle
          title="创作者"
          btnType="back"
          backUrl="/discover"
        />}
        <div className="author-list-body">
          {isMobileScreen && <AuthorListHeaderMobile
            sort={query.sort}
            authorType={query.type}
            provinceId={query.province}
            cityId={query.city}
            formCode={query.formCode}
            forms={forms}
            onFormChange={this.handleFormChange}
            onTypeChange={this.handleTypeChange}
            onSortChange={this.handleSortChange}
            onAreaChange={this.handleAreaChange}
          />}
          {!isMobileScreen && <AuthorListHeader
            sort={query.sort}
            authorType={query.type}
            provinceId={query.province}
            cityId={query.city}
            formCode={query.formCode}
            forms={forms}
            onFormChange={this.handleFormChange}
            onTypeChange={this.handleTypeChange}
            onSortChange={this.handleSortChange}
            onAreaChange={this.handleAreaChange}
          />}
          <div className="author-list-wrapper author-list-container">
            {hasAuthors ? <>
              <div className="author-list-panel">
                {authorList.map((item, i) => (
                  <AuthorItem
                    key={item.id + i}
                    item={item}
                  />
                ))}
              </div>
              <div className="load-more">
                <LoadMore
                  visible={!end}
                  text="加载更多"
                  num={3}
                  reqList={this.handleLoadMore}
                />
              </div>
            </> : <EmptyComponent text='暂无相关创作者' />}
            {loading && <PartLoading float mask />}
          </div>
        </div>
      </>
    )
  }
}

export default AuthorContainer