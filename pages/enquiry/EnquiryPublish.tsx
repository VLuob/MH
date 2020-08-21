import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { parseCookies } from 'nookies'

import HeadComponent from '@components/common/HeadComponent'
import EnquiryPublish from '@containers/enquiry/EnquiryPublish'

import { config } from '@utils'

export default class EnquiryDetail extends Component {
  static async getInitialProps(ctx) {
    const { req, res, query, asPath, mobxStore } = ctx
    const { globalStore, enquiryStore } = mobxStore
    const { isMobileScreen, setMobileNavigationData, serverClientCode } = globalStore
    const { fetchEnquiryEdit } = enquiryStore

    if (req && req.headers) {
      const enquiryId = query.id
      const allCookies = parseCookies(ctx)
      const token = allCookies[config.COOKIE_MEIHUA_TOKEN]

      if (token) {
        const param = {
          token,
          enquiryId,
        }
        let enquiryRes = await fetchEnquiryEdit(param)
      }

      // console.log('enquiry', enquiryRes)

      return {
        query,
      }
    }
  }

  render() {
    const { query, ...rest } = this.props


    return (
      <>
        <HeadComponent
          title="发布询价"
          description="服务商推广,营销服务商销售线索,业务推广就来梅花网,致力于成为中国最大的营销作品库,并为行业上下游提供一个合作共赢的互动交流平台。"
        />
        <EnquiryPublish query={query} />
      </>
    )
  }
}