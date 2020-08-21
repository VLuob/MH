import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { parseCookies } from 'nookies'
import { toJS } from 'mobx'

import HomeContainer from '@containers/home/HomeContainer'
import HeadComponent from '@components/common/HeadComponent'

import { CommonSortType } from '@base/enums'
import { config } from '@utils'
import wxSignature from '@utils/wxSignature'
// import CommonLayout from '@containers/layout/CommonLayout'

@inject(stores => {
  const { globalStore } = stores.store
  const { isMobileScreen } = globalStore
  return {
    isMobileScreen
  }
})
@observer
export default class Index extends Component {
  static async getInitialProps(ctx) {
    const { asPath, query, req, res, mobxStore } = ctx
    const { homeStore, globalStore, adStore, accountStore, productStore, compositionStore } = mobxStore
    const { serverClientCode, isMobileScreen } = globalStore
    const { currentUser } = accountStore
    const { fetchProducts } = productStore
    const { fetchGetClassifications } = compositionStore
    const {
      shotsData,
      fetchShotsList,
      fetchGetAuthorRecommended,
      fetchGetLatestCompositions,
      fetchRecommendTopics,
    } = homeStore

    if (req && req.headers) {
      const host = req.headers.host
      const token = parseCookies(ctx)[config.COOKIE_MEIHUA_TOKEN]
      const client_code = serverClientCode

      if (['newest', 'recommend', 'popular', 'follow', 'read', 'comment', 'collection'].some(v => asPath.indexOf(v) >= 0)) {
        let locationUrl = '/'
        if (query.newest === '') {
          locationUrl += `!${CommonSortType.NEWEST}`
        } else if (query.recommend === '') {
          locationUrl += `!${CommonSortType.RECOMMEND}`
        } else if (query.popular === '') {
          locationUrl += `!${CommonSortType.HOT}`
        } else if (query.follow === '') {
          locationUrl += `!${CommonSortType.FOLLOW}`
        }
        res.writeHead(307, { Location: locationUrl })
        res.end()
      }

      // 获取首页banner 'f_h_l_t_1', 'f_h_l_t_2', 'f_h_l_t_3', 'f_h_l_t_4', 'f_h_l_t_5',
      // 侧边栏头部广告 ’f_h_l_r_1‘
      // 侧边栏底部广告 ’f_h_l_r_2‘
      const adParam = { page_code: `f_h`, field_code: JSON.stringify(['f_h_l_t_1', 'f_h_l_t_2', 'f_h_l_t_3', 'f_h_l_t_4', 'f_h_l_t_5', 'f_h_l_r_1', 'f_h_l_r_2']) }
      await adStore.fetchAdvertisement(adParam) || {}

      // 作品列表参数
      const originTerms = { ...toJS(shotsData.terms) }
      const originTerm = originTerms.term || {}
      let terms: any = {}
      let sort: Array<any> = []
      let term: any = {}
      let limit: number = isMobileScreen ? 10 : 45

      terms.recommended = false
      switch (query.sort) {
        case CommonSortType.RECOMMEND:
          terms.recommended = true
          break
        case CommonSortType.NEWEST:
          sort = [{ key: 'gmtPublish', value: 'desc' }]
          break
        case CommonSortType.HOT:
          sort = [{ key: 'degree', value: 'desc' }]
          break
        case CommonSortType.FOLLOW:
          if (!token) {
            res.writeHead(307, { Location: `/signin?c=${encodeURIComponent(req.originalUrl || req.url)}` })
            res.end()
          }
          if (currentUser && currentUser.id) {
            term.follower = currentUser.id
          }
          break
        default:
          terms.recommended = true
          break
      }

      const newTerms = {
        ...originTerms,
        ...terms,
        term: {
          ...originTerm,
          ...term
        },
        limit,
      }

      if (sort.length > 0) {
        newTerms.sort = sort
      } else {
        delete newTerms.sort
      }
      // 作品广告
      const shotsAdParam = { page_code: `f_h`, field_code: JSON.stringify(['f_h_l_w_1', 'f_h_l_w_2', 'f_h_l_w_3']) }
      const resultShotsAds = await adStore.fetchAdvertisement(shotsAdParam)

      // 获取首页作品列表 
      const shotParam = { host, terms: newTerms, client: client_code, token, mergeAds: resultShotsAds }
      const resShotsData = await fetchShotsList(shotParam) || {}

       // 获取分类、品类、形式列表
       await fetchGetClassifications({})

      // pc端右侧数据
      if (!isMobileScreen) {
        // 获取最新文章 
        const compositionParam = { host, limit: 6 }
        await fetchGetLatestCompositions(compositionParam) || {}

        // 获取首页推荐创作者 
        let recParam = { limit: 6, client_code }
        if (token) { recParam = { ...recParam, token } }
        await fetchGetAuthorRecommended(recParam)

        // 首页推荐专题
        await fetchRecommendTopics({ host, limit: 6 })

        // 右侧产品
        await fetchProducts()
      }

    }

    return {
      query,
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
    const { userInfo, query, isMobileScreen } = this.props
    const description = '梅花网聚焦行业营销案例，致力于成为国内收录数量最大、信息价值点最丰富的营销作品宝库，作品涵盖平面海报、视频制作、创意设计、公关活动等，为行业上下游打造一个合作共赢的互动交流和在线对接平台。'
    const keywords = '营销作品、营销案例网、广告创意、广告设计、市场营销、产品推广、创意市场、营销推广'
    return (
      <>
        <HeadComponent
          description={description}
          keywords={keywords}
        />
        <HomeContainer query={query} />
      </>
    )
  }
}