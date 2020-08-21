import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { parseCookies } from 'nookies'

import HeadComponent from '@components/common/HeadComponent'
import Error from '@components/common/Error'
import DetailContainer from '@containers/enquiry/DetailContainer'

import { config } from '@utils'
import { toJS } from 'mobx'

@inject(stores => {
  const { globalStore, enquiryStore } = stores.store
  const { isMobileScreen } = globalStore
  const { enquiryDetail } = enquiryStore
  return {
      globalStore,
      isMobileScreen,
      enquiryDetail,
  }
})
@observer
export default class EnquiryDetail extends Component {
  static async getInitialProps(ctx) {
    const { req, res, query, asPath, mobxStore } = ctx
    const { globalStore, enquiryStore } = mobxStore
    const { isMobileScreen, setMobileNavigationData, serverClientCode } = globalStore
    const { fetchEnquiry, fetchRecommendEnquirys } = enquiryStore

    let statusCode = res.statusCode > 200 ? res.statusCode : 0

    if (req && req.headers) {
      if (isMobileScreen) {
        setMobileNavigationData({ hide: true })
      }
      const enquiryId = query.id
      const clientCode = serverClientCode
      const allCookies = parseCookies(ctx)
      const token = allCookies[config.COOKIE_MEIHUA_TOKEN]

      if (!enquiryId) {
        statusCode = 404
      } else {
        const param = {
          token,
          clientCode,
          enquiryId,
        }
        let enquiryRes = await fetchEnquiry(param)
        let isSuccess = enquiryRes.success
        let enquiryData = enquiryRes.data
        if (enquiryData && enquiryData.code === 'E100000' && (enquiryData.msg || '').toUpperCase() === 'ERROR TOKEN') {
          delete param.token
          enquiryRes = await fetchEnquiry(param)
          isSuccess = enquiryRes.success
          enquiryData = enquiryRes.data
        }
        if (!isSuccess || !enquiryData || enquiryData.code === 'E100000') {
          statusCode = 404
        } else {
          const recommendRes = await fetchRecommendEnquirys({token, enquiryId, pageIndex: 1, pageSize: 8})
          // console.log({token, enquiryId, pageIndex: 1, pageSize: 8},recommendRes)
        }
      }
    }

    return {
      query,
      statusCode,
    }
  }

  render() {
    const { query, statusCode, enquiryDetail } = this.props

    if (statusCode) {
      return <Error statusCode={statusCode} />
    }

    const title = `${enquiryDetail.contactOrg}询价详情 - 营销作品宝库 - 梅花网`
    const keywords = `${enquiryDetail.formName}，${enquiryDetail.contactOrg}，询价，发需求，找外包，企业需求，业务线索`
    const description = enquiryDetail.content

    return (
      <>
        <HeadComponent
          title={title}
          keywords={keywords}
          description={description}
        />
        <DetailContainer query={query} />
      </>
    )
  }
}