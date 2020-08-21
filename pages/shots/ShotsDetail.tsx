import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { parseCookies, destroyCookie } from 'nookies'
import { toJS } from 'mobx'

import { CompositionTypes, RelatedCompositionScope, UploadFileTypes } from '@base/enums'
import { config, utils } from '@utils'
import wxSignature from '@utils/wxSignature'

import Error from '@components/common/Error'
import HeadComponent from '@components/common/HeadComponent'
import ShotsContainer from '@containers/shots/DetailContainer'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'

@inject(stores => {
  const { globalStore, compositionStore, shotsStore } = stores.store
  const { isMobileScreen } = globalStore
  const { compositionDetail } = compositionStore
  const { detail } = shotsStore
  return {
    globalStore,
    isMobileScreen,
    compositionDetail,
    detail,
  }
})
@observer
export default class ShotsDetail extends Component {
  static async getInitialProps(ctx) {
    const { req, res, query, asPath, mobxStore } = ctx
    let statusCode = res.statusCode > 200 ? res.statusCode : false
    const { compositionStore, shotsStore, globalStore } = mobxStore
    const { serverClientCode, isMobileScreen, setMobileNavigationData, setFixedActionData } = globalStore

    let datas = {}

    if (req && req.headers) {
      const host = req.headers.host
      const compositionId = query.id
      const client = serverClientCode
      const allCookies = parseCookies(ctx)
      const token = allCookies[config.COOKIE_MEIHUA_TOKEN]
      const autoPlay = allCookies[config.COOKIE_DETAIL_AUTO_PLAY]

      setFixedActionData({ hide: true })
      if (isMobileScreen) {
        setMobileNavigationData({ hide: true })
      }

      shotsStore.setAutoPlay(!!autoPlay)

      const params = { compositionId, token, client, op: 2 }
      let detailResult = await shotsStore.fetchComposition(params)
      let resultDetailData = detailResult.data
      if (resultDetailData && resultDetailData.code === 'E100000' && (resultDetailData.msg || '').toUpperCase() === 'ERROR TOKEN') {
        destroyCookie(ctx, config.COOKIE_MEIHUA_TOKEN, { path: '/', domain: config.COOKIE_MEIHUA_DOMAIN })
        delete params.token
        detailResult = await shotsStore.fetchComposition(params)
        resultDetailData = detailResult.data
      }

      const composition = (resultDetailData || {}).composition || {}
      if (!resultDetailData || !resultDetailData.composition || resultDetailData.code === 'E100000' || composition.type !== CompositionTypes.SHOTS) {
        statusCode = 404
      } else {
        datas.resultDetailData = resultDetailData
        const compositionDetail = resultDetailData.composition || {}
        const files = compositionDetail.files || []
        const hasVideo = files.some(item => item.type === UploadFileTypes.WORKS_VIDEO)
        const serviceResult = await shotsStore.fetchShotsServices({ compositionId })
        const resultAuthorInfo = await compositionStore.fetchAuthor({ host, token, compositionId })
        const resultRelatedShots = await compositionStore.fetchRelatedCompositions({
          compositionId,
          type: CompositionTypes.SHOTS,
          scope: hasVideo ? RelatedCompositionScope.VIDEO : RelatedCompositionScope.ALL,
          page: 1,
          limit: 5,
          client,
          // pc端分页数据不追加
          notAppend: !isMobileScreen,
        })
        // console.log('related', toJS(resultRelatedShots))
        // console.log('param', {
        //     compositionId,
        //     type: CompositionTypes.SHOTS,
        //     scope: hasVideo ? RelatedCompositionScope.VIDEO : RelatedCompositionScope.ALL,
        //     // excludeIds: recordIds,
        //     page: 1,
        //     limit: 5,
        //     client,
        //     // 分页数据不追加
        //     notAppend: true,
        // })
        const resultRelatedCollections = await compositionStore.fetchCompositionFavorites({
          compositionId,
          orderType: 2,
          pageIndex: 1,
          pageSize: 3,
        })
      }

    }

    return {
      statusCode,
      asPath,
      query,
      ...datas,
    }
  }

  componentDidMount() {
    this.initWxSignature()
  }

  initWxSignature() {
    const { resultDetailData } = this.props
    if (!resultDetailData) {
      return
    }
    const composition = resultDetailData.composition || {}
    wxSignature.init({
      title: composition.title,
      describe: composition.summary,
      cover: composition.cover,
      // cover: composition.cover + '?imageMogr2/thumbnail/!200x200r/gravity/center/crop/200x200',
    })
  }

  render() {
    const { statusCode, query, resultDetailData, isMobileScreen } = this.props

    if (statusCode) {
      return <Error statusCode={statusCode} />
    }

    const composition = (resultDetailData || {}).composition || {}
    const title = composition.title
    const summary = composition.summary || ''
    const authorNickname = composition.authorName
    const description = utils.getSubstr(summary, 60)
    const keywordsArr = []
    if (authorNickname) {
      keywordsArr.push(authorNickname)
    }
    if (composition.brandName) {
      keywordsArr.push(composition.brandName)
    }
    if (composition.categoryName) {
      keywordsArr.push(composition.categoryName)
    }
    if (composition.formName) {
      keywordsArr.push(composition.formName)
    }
    if (composition.productName) {
      keywordsArr.push(composition.productName)
    }
    if (composition.tags && composition.tags.length > 0) {
      const tagNames = composition.tags.map(item => item.tagName)
      keywordsArr.push(...tagNames)
    }
    keywordsArr.push('营销作品', '营销案例', '创意案例')
    const keywords = keywordsArr.join('、')

    // console.log('composition', composition)

    return (
      <>
        <HeadComponent
          title={`${title}-梅花网`}
          description={description}
          keywords={keywords}
        />
        {/* {isMobileScreen && <MbNavigatorBar 
                    showTitle 
                    btnType="back"
                    backUrl="/shots"
                    title={authorNickname} 
                />} */}
        <ShotsContainer
          query={query}
          isMobile={isMobileScreen}
        />
        <div style={{ display: 'none' }}><img className="cover" src={`${composition.cover}?imageView2/2/w/200`} /></div>
      </>
    )
  }
}