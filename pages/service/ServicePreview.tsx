import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { parseCookies } from 'nookies'
import HeadComponent from '@components/common/HeadComponent'
import DetailContainer from '@containers/service/ServiceDetail/Preview'
import Error from '@components/common/Error'

import { config, utils } from '@utils'

@inject(stores => {
  const { globalStore, serviceStore } = stores.store
  const { isMobileScreen } = globalStore
  const { servicePreview } = serviceStore
  return {
    globalStore,
    isMobileScreen,
    servicePreview,
  }
})
@observer
export default class ServiceDetail extends Component {
  static async getInitialProps(ctx) {
    const { req, res, query, asPath, mobxStore } = ctx
    const { globalStore, serviceStore } = mobxStore
    const { isMobileScreen, setMobileNavigationData, serverClientCode } = globalStore

    let statusCode = res.statusCode > 200 ? res.statusCode : 0

    if (req && req.headers) {
      if (isMobileScreen) {
        setMobileNavigationData({ hide: true })
      }
      const cookies = parseCookies(ctx)
      const token = cookies[config.COOKIE_MEIHUA_TOKEN]
      const clientCode = serverClientCode
      const previewCode = query.id
      const param = { previewCode, clientCode }
      if (token) {
        param.token = token
      }
      if (!previewCode) {
        statusCode = 404
      } else {
        let detailRes = await serviceStore.fetchServicePreview(param)
        let isSuccess = detailRes.success
        let serviceData = detailRes.data
        if (serviceData && serviceData.code === 'E100000' && (serviceData.msg || '').toUpperCase() === 'ERROR TOKEN') {
          delete param.token
          detailRes = await serviceStore.fetchServicePreview(param)
          isSuccess = detailRes.success
          serviceData = detailRes.data
        }
        if (!isSuccess || !serviceData || serviceData.code === 'E100000') {
          statusCode = 404
        } else {
          // const recommendRes = await fetchRecommendEnquirys({token, enquiryId, pageIndex: 1, pageSize: 8})
          // console.log({token, enquiryId, pageIndex: 1, pageSize: 8},recommendRes)
        //   const authorServiceId = previewCode
        //   const recommendRes = await serviceStore.fetchRecommendServices({authorServiceId, limit: 4})
        //   const historyRes = await serviceStore.fetchViewHistoryServices({authorServiceId, limit: 4, clientCode, token})
        }
      }

    }

    return {
      statusCode,
      query,
    }
  }

  render() {
    const { query, statusCode, servicePreview, ...rest } = this.props

    if (statusCode) {
      return <Error statusCode={statusCode} />
    }

    const title = `${servicePreview.name} - 梅花网`
    const keywords = `服务，询价，营销服务商，销售线索，营销案例，营销作品，营销服务`
    const description = utils.getSubstr(servicePreview.description, 200)

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