import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { parseCookies } from 'nookies'

import HeadComponent from '@components/common/HeadComponent'
import Error from '@components/common/Error'
import PreviewContainer from '@containers/enquiry/DetailContainer/Preview'

import { config } from '@utils'

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
export default class EnquiryPreview extends Component {
    static async getInitialProps(ctx) {
        const { req, res, query, asPath, mobxStore } = ctx
    const { globalStore, enquiryStore } = mobxStore
    const { isMobileScreen, setMobileNavigationData, serverClientCode } = globalStore
    const { fetchEnquiryPreview } = enquiryStore

    let statusCode = res.statusCode > 200 ? res.statusCode : 0

    if (req && req.headers) {
      if (isMobileScreen) {
        setMobileNavigationData({ hide: true })
      }
      const previewCode = query.id
      const allCookies = parseCookies(ctx)
      const token = allCookies[config.COOKIE_MEIHUA_TOKEN]

      if (!previewCode) {
        statusCode = 404
      } else {
        const param = {
          previewCode,
        }
        if (token) {
          param.token = token
        }
        let enquiryRes = await fetchEnquiryPreview(param)
        let isSuccess = enquiryRes.success
        let enquiryData = enquiryRes.data
        if (enquiryData && enquiryData.code === 'E100000' && (enquiryData.msg || '').toUpperCase() === 'ERROR TOKEN') {
          delete param.token
          enquiryRes = await fetchEnquiryPreview(param)
          isSuccess = enquiryRes.success
          enquiryData = enquiryRes.data
        }
        if (!isSuccess || !enquiryData || enquiryData.code === 'E100000') {
          statusCode = 404
        } else {

        }
      }
    }

    return {
      query,
      statusCode,
    }
    }

    render() {
        const { query, ...rest } = this.props
        

        return (
            <>
                <HeadComponent
                    title="询价预览"
                    description="服务商推广,营销服务商销售线索,业务推广就来梅花网,致力于成为中国最大的营销作品库,并为行业上下游提供一个合作共赢的互动交流平台。"
                />
                <PreviewContainer query={query} />
            </>
        )
    }
}