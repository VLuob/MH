import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import jsHttpCookie from 'cookie'
import { toJS } from 'mobx'
import { parseCookies } from 'nookies'

import Error from '@components/common/Error'
import TagListContainer from '@containers/tag'
import HeadComponent from '@components/common/HeadComponent'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'
import wxSignature from '@utils/wxSignature'
import { CompositionTypes } from '@base/enums'

import { config } from '@utils'

@inject(stores => {
  const { tagStore, globalStore } = stores.store
  const { pageData, isMobileScreen } = globalStore
  const { tagDetail } = tagStore
  return {
    pageData,
    isMobileScreen,
    
    tagStore,
    tagDetail,
  }
})
@observer
export default class Tag extends Component {
  static async getInitialProps(ctx) {
    const { req, res, query, mobxStore } = ctx
    const { tagStore, adStore, globalStore } = mobxStore
    const { fetchPageData, serverClientCode, isMobileScreen, setMobileNavigationData } = globalStore
    const { tagData, fetchGetClientTagDetail, fetchGetClientTagList } = tagStore

    let statusCode = 0
    let apps = {}
    
    if (req && req.headers) {
      statusCode = res.statusCode > 200 ? res.statusCode : false
      const token = parseCookies(ctx)[config.COOKIE_MEIHUA_TOKEN]
      const client = serverClientCode
      const tagId = Number(query.id)
      const tagType = query.type

      // if (tagType === 'article') {
      //   res.writeHead(307, { Location: `/tag/${tagId}/${CompositionTypes.ARTICLE}` })
      //   res.end()
      // } else if (!!tagType && Number(tagType) !== CompositionTypes.ARTICLE) {
      //   res.writeHead(307, { Location: `/tag/${tagId}` })
      //   res.end()
      // }

      if (isMobileScreen) {
        setMobileNavigationData({ hide: true })
      }

      tagData.terms && (tagData.terms = {
        ...toJS(tagData.terms),
        term: {
          ...toJS(tagData.terms.term),
          tags: [tagId]
        }
      })
      const tagParam = { terms: { ...tagData.terms }, client, token }
      const detailParam = {client, token, tagId}
      if (tagType === 'article' || Number(tagType) === CompositionTypes.ARTICLE) {
        tagParam.terms.term.type = CompositionTypes.ARTICLE
        tagParam.terms.limit = 10
      } else {
        tagParam.terms.term.type = CompositionTypes.SHOTS
        tagParam.terms.limit = 50
      }
      const tagResult = await fetchGetClientTagDetail(detailParam) || {}
      if (!tagResult.success && tagResult.data.code === 'E100000') {
        statusCode = 404
      } else {
        const resultTagDetail = tagResult.data || {}
        if (resultTagDetail.works === 0 && resultTagDetail.articles > 0) {
          tagParam.terms.term.type = CompositionTypes.ARTICLE
        }
        const resultTagData = await fetchGetClientTagList(tagParam)
  
        const adParam = { page_code: 'f_t', relation_id: tagId }
        const tagAds = await adStore.fetchAdvertisement(adParam)
  
        const pageDataResult = await fetchPageData({ relationId: tagId })
      }
      
      apps = {
        tagType,
      }
    }
    return {
      query,
      statusCode,
      ...apps
    }
  }


  componentDidMount() {
    this.initWxSignature()
  }

  initWxSignature() {
    wxSignature.init({
      cover: 'https://resource.meihua.info/FkVLmZ_FSwR9MdOWPmFMY8RjVJur?imageView2/2/w/200/',
    })
  }


  render() {
    const { statusCode, tagType, tagDetail, pageData, query, isMobileScreen } = this.props

    if (statusCode) {
      return <Error statusCode={statusCode} />
    }

    const detail = tagDetail
    const titleName = detail.tag ? detail.tag.name : ''
    const pageTitle = pageData.title || `${titleName}创意营销案例 - 营销作品宝库 - 梅花网`
    const pageKeywords = pageData.keyword || titleName
    const pageDescription = pageData.description
    return (
      <>
        <HeadComponent
          title={pageTitle}
          keywords={pageKeywords}
          description={pageDescription}
        />
        {isMobileScreen && <MbNavigatorBar
          showTitle
          title="标签"
        />}
        <TagListContainer
          tagType={tagType}
          query={query}
        />
      </>
    )
  }
}