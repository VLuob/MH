
import { Component } from 'react'
import dynamic from 'next/dynamic'
import { inject, observer } from 'mobx-react'

import { Dropdown, Menu, Button } from 'antd'

import { Router } from '@routes'
import CustomIcon from '@components/widget/common/Icon'
import ClassifyDropdown from '@components/common/ClassifyDropdown'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'
import SecondHeader from '@containers/common/SecondHeader'
import EnquiryList from '../EnquiryList'
import EnquiryListHeader from '../EnquiryListHeader'
import EnquiryListHeaderMobile from '../EnquiryListHeaderMobile'

import { EnquirySortType } from '@base/enums'

import './index.less'
import { toJS } from 'mobx'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
  loading: () => <p></p>,
  ssr: false
})

const sortFilters = [
  { id: EnquirySortType.RECOMMEND, label: '推荐' },
  { id: EnquirySortType.HOT, label: '热门' },
  { id: EnquirySortType.NEWEST, label: '最新' },
]

const budgetFilters = [
  { id: 0, label: '全部' },
  { id: 1, label: '0-2万' },
  { id: 2, label: '2-5万' },
  { id: 3, label: '5-20万' },
  { id: 4, label: '20-50万' },
  { id: 5, label: '50万以上' },
  { id: 6, label: '按质定价' },
]


@inject(stores => {
  const { enquiryStore, compositionStore, globalStore } = stores.store
  const { isMobileScreen } = globalStore
  const { enquiryListData, fetchEnquirys, changeEnquiryListTerms } = enquiryStore
  const { classificationsAll } = compositionStore
  return {
    isMobileScreen,
    enquiryListData,
    fetchEnquirys,
    changeEnquiryListTerms,
    classificationsAll,
  }
})
@observer
class EnquiryMainContainer extends Component {
  handlePublish = () => {
    window.open('/enquiry/new')
  }

  changeRoute(option) {
    const { query } = this.props
    const newQuery = {
      ...query,
      ...option,
    }
    Router.pushRoute(`/enquiry!${newQuery.sort || ''}!${newQuery.formCode || ''}!${newQuery.budget || ''}`)
  }

  handleSortChange = (sort) => {
    const { enquiryListData = {}, fetchEnquirys, changeEnquiryListTerms } = this.props
    const { terms } = enquiryListData
    const param = {
      ...terms,
      pageIndex: 1,
      pageSize: 30,
      orderType: sort,
    }
    fetchEnquirys(param).then(res => {
      if (res.success) {
        changeEnquiryListTerms({ pageIndex: 3, pageSize: 10 })
      }
    })
    this.changeRoute({ sort: sort })
  }

  handleBudgetChange = (type) => {
    const { enquiryListData = {}, fetchEnquirys, changeEnquiryListTerms } = this.props
    const { terms } = enquiryListData
    const param = {
      ...terms,
      pageIndex: 1,
      pageSize: 30,
    }
    const budgetType = Number(type) || ''
    if (budgetType) {
      param.budgetType = budgetType
    } else {
      delete param.budgetType
    }
    fetchEnquirys(param).then(res => {
      if (res.success) {
        changeEnquiryListTerms({ pageIndex: 3, pageSize: 10 })
      }
    })
    this.changeRoute({ budget: budgetType })
  }

  handleFormChange = (code) => {
    const { enquiryListData = {}, fetchEnquirys, changeEnquiryListTerms } = this.props
    const { terms } = enquiryListData
    const param = {
      ...terms,
      pageIndex: 1,
      pageSize: 30,
    }
    const formCode = Number(code) || ''
    if (formCode) {
      param.formCode = formCode
    } else {
      delete param.formCode
    }
    fetchEnquirys(param).then(res => {
      if (res.success) {
        changeEnquiryListTerms({ pageIndex: 3, pageSize: 10 })
      }
    })
    this.changeRoute({ formCode })
  }

  handleLoadMore = () => {
    const { enquiryListData = {}, fetchEnquirys } = this.props
    const { terms, end } = enquiryListData
    // if (end) {
    //   return
    // }
    const param = {
      ...terms,
      pageIndex: terms.pageIndex + 1,
      pageSize: 10,
    }
    fetchEnquirys(param)
  }

  render() {
    const { enquiryListData, classificationsAll = {}, query, isMobileScreen } = this.props
    const { terms, end, loading } = enquiryListData
    const hasEnquirys = enquiryListData.list.length > 0
    const forms = classificationsAll.forms || []
    const sortItem = sortFilters.find(item => item.id === Number(terms.orderType)) || sortFilters[0]
    const budgetItem = budgetFilters.find(item => item.id === Number(terms.budgetType)) || { id: '', label: '预算' }

    return (
      <>
        {!isMobileScreen &&
          <SecondHeader
            forms={forms}
            formCode={query.formCode}
            className="enquiry-list-sub-nav"
            currentPage="enquiry"
            navs={['author', 'shots', 'article']}
            onFormSelect={this.handleFormChange}
            extra={
              <div>
                <Button type="primary" onClick={this.handlePublish}>发布询价</Button>
              </div>
            }
          />}
        {isMobileScreen &&
          <MbNavigatorBar
            showTitle
            title="询价"
            btnType="back"
            backUrl="/discover"
          />}
        <div className="enquiry-body">
          {isMobileScreen ?
            <EnquiryListHeaderMobile
              sort={query.sort}
              formCode={query.formCode}
              budgetType={query.budget}
              forms={forms}
              onSortChange={this.handleSortChange}
              onFormChange={this.handleFormChange}
              onBudgetChange={this.handleBudgetChange}
            />
            : <EnquiryListHeader
              sort={query.sort}
              budgetType={query.budget}
              onSortChange={this.handleSortChange}
              onBudgetChange={this.handleBudgetChange}
            />}
          <div className="enquiry-list-wrapper">
            <EnquiryList
              contentTooltipClass="enquiry-list-tooltip"
              isMobileScreen={isMobileScreen}
              loading={loading}
              list={enquiryListData.list}
            />
            <div className="load-more">
              <LoadMore
                visible={!end && hasEnquirys}
                name={`加载更多`}
                num={3}
                reqList={this.handleLoadMore}
              />
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default EnquiryMainContainer