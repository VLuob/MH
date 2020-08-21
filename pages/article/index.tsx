import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import { parseCookies } from 'nookies'
import ArticleContainer from '@containers/article'
import HeadComponent from '@components/common/HeadComponent'

import { CompositionTypes, CommonSortType } from '@base/enums'
import { config } from '@utils'
import filters from '@base/system/filters'
import wxSignature from '@utils/wxSignature'

const commonSortTypeMap = filters.commonSortTypeMap

@observer
export default class Article extends Component {
  static async getInitialProps(ctx) {
    const { req, res, query, asPath, mobxStore } = ctx
    const { compositionStore, adStore, authorStore, globalStore, accountStore, productStore } = mobxStore
    const { compositionsData } = compositionStore
    const { currentUser } = accountStore
    const { serverClientCode } = globalStore
    const { fetchProducts } = productStore

    let datas = {}

    if (req && req.headers) {
      const host = req.headers.host
      const client_code = serverClientCode
      const token = parseCookies(ctx)[config.COOKIE_MEIHUA_TOKEN]

      if (['newest', 'recommend', 'popular', 'follow', 'read', 'comment', 'collection'].some(v => asPath.indexOf(v) >= 0)) {
        let locationUrl = '/article'
        if (query.newest === '') {
          locationUrl += `!${CommonSortType.NEWEST}`
        } else if (query.popular === '') {
          locationUrl += `!${CommonSortType.HOT}`
        } else if (query.follow === '') {
          locationUrl += `!${CommonSortType.FOLLOW}`
        }
        res.writeHead(307, { Location: locationUrl })
        res.end()
      }


      const originTerms = { ...toJS(compositionsData.terms) }
      const originTerm = originTerms.term || {}
      let terms: any = { recommended: false }
      let sort: Array<any> = []
      let term: any = { type: CompositionTypes.ARTICLE }

      switch (query.sort) {
        case CommonSortType.FOLLOW:
          if (!token) {
            res.writeHead(307, { Location: `/signin?c=${encodeURIComponent(asPath)}` })
            res.end()
          }
          if (currentUser && currentUser.id) {
            term.follower = currentUser.id
          }
          break
        case CommonSortType.HOT:
          sort = [{ key: 'degree', value: 'desc' }]
          break
        case CommonSortType.NEWEST:
        default:
          sort = [{ key: 'gmtPublish', value: 'desc' }]
          break
      }

      const newTerms = {
        ...originTerms,
        ...terms,
        term: {
          ...originTerm,
          ...term
        },
      }

      if (sort.length > 0) {
        newTerms.sort = sort
      } else {
        delete newTerms.sort
      }

      const articlesParams = { terms: newTerms, client: client_code, token, page: 1, limit: 10 }
      const resultCompositionsData = await compositionStore.fetchCompositions(articlesParams)
      const resultHotArticles = await compositionStore.fetchHotArticles({ type: 1 })
      // const resultNewArticles = await compositionStore.fetchNewArticles({host, limit: 5})
      const resultAdData = await adStore.fetchAdvertisement({ host, page_code: `f_a_s`, field_code: JSON.stringify(['f_a_s_l_1', 'f_a_s_l_2', 'f_a_s_l_3', 'f_a_s_l_t_1', 'f_a_s_l_t_2', 'f_a_s_l_t_r_1']) })

      const resultAuthorRecommended = await authorStore.fetchAuthorRecommended({ host, limit: 6, client_code })
      // 右侧产品
      await fetchProducts()
    }

    return {
      asPath,
      query,
      ...datas,
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
    const { userInfo, query } = this.props

    const sortName = commonSortTypeMap[query.sort || CommonSortType.NEWEST]
    const description = '梅花网平台内全部文章内容,为营销人提供新鲜、丰富、专业的营销内容、品牌动向、行业趋势。也可自行发布文章，收藏感兴趣的文章。'
    const keywords = '营销资讯、行业热点、行业趋势、发布文章、精选案例、创意文案、广告策划、投稿'

    return (
      <>
        <HeadComponent
          title={`${sortName}文章 - 营销作品宝库 - 梅花网`}
          // title={'最新文章 - 营销作品宝库 - 梅花网（热门文章-梅花网）'}
          keywords={keywords}
          description={description}
        />
        <ArticleContainer
          userInfo={userInfo}
        />
      </>
    )
  }
}