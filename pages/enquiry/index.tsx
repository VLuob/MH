import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { parseCookies } from 'nookies'
import { toJS } from 'mobx'

import HeadComponent from '@components/common/HeadComponent'
import EnquiryMainContainer from '@containers/enquiry/MainContainer'

import { EnquirySortType } from '@base/enums'
import { config } from '@utils'

const getSortName = (sortKey) => {
  let name = ''
  switch (Number(sortKey)) {
    case EnquirySortType.RECOMMEND:
      name = '推荐'
      break
    case EnquirySortType.HOT:
      name = '热门'
      break
    case EnquirySortType.NEWEST:
      name = '最新'
      break
    default:
      name = '推荐'
      break
  }
  return name
}

@inject(stores => {
  const { compositionStore } = stores.store
  const { classificationsAll } = compositionStore
  return {
    classificationsAll,
  }
})
@observer
export default class Enquiry extends Component {
  static async getInitialProps(ctx) {
    const { req, res, query, asPath, mobxStore } = ctx
    const { globalStore, enquiryStore, compositionStore } = mobxStore
    const { isMobileScreen, setMobileNavigationData } = globalStore
    const { fetchGetClassifications } = compositionStore
    const { fetchEnquirys, changeEnquiryListTerms } = enquiryStore

    if (req && req.headers) {
      if (isMobileScreen) {
        setMobileNavigationData({hide: true})
      }

      const allCookies = parseCookies(ctx)
      const token = allCookies[config.COOKIE_MEIHUA_TOKEN]
      const param: any = {
        pageIndex: 1,
        pageSize: 30,  // 首次加载30条，之后每页10条
      }
      if (token) {
        param.token = token
      }
      if (query.sort) {
        param.orderType = query.sort
      }
      if (query.formCode) {
        param.formCode = query.formCode
      }
      if (query.budget) {
        param.budgetType = query.budget
      }
      const enquirysRes = await fetchEnquirys(param)
      if (enquirysRes.success) {
        // 首次加载30条之后每页10条，重新计算分页
        changeEnquiryListTerms({ pageIndex: 3, pageSize: 10 })
      }

      // 获取分类、品类、形式列表
      await fetchGetClassifications({})
    }

    return {
      query,
    }
  }

  render() {
    const { query, classificationsAll, ...rest } = this.props
    const sortName = getSortName(query.sort)
    const forms = classificationsAll.forms || []
    const formItem = forms.find(item => item.code === Number(query.formCode)) || {}
    const formName = formItem.name || '全部'
    return (
      <>
        <HeadComponent
          title={`${sortName}${formName}询价 - 营销作品宝库 - 梅花网`}
          description="梅花网询价是用户在梅花网发布自己明确询价需求，梅花网服务商在报价和需求基础上进行比较并确定后续的合作方式。"
          keywords="询价，发需求，找外包，企业需求，业务线索"
        />
        <EnquiryMainContainer query={query} />
      </>
    )
  }
}