import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { toJS } from 'mobx'

import { config } from '@utils'
import { composition as compositionSys } from '@base/system'
import { CommonSortType } from '@base/enums'

import wxSignature from '@utils/wxSignature'
import ShotsListContainer from '@containers/shots/ShotsContainer'
import HeadComponent from '@components/common/HeadComponent'
import areas from '@base/system/area'
import filters from '@base/system/filters'

const commonSortTypeMap = filters.commonSortTypeMap

const getScopeName = (query) => {
  let label = ''
  if (query.follow === '') {
    label = '关注'
  } else if (query.popular === '' || query.like === '' || query.read === '' || query.collection === '' || query.comment === '') {
    label = '热门'
  } else if (query.newest === '') {
    label = '最新'
  } else {
    label = '推荐'
  }
  return label
}

const getArea = (provinceId, cityId) => {
  let label = ''
  const provinces = []
  const cities = []
  areas.forEach(area => {
    area.provinces.forEach(province => {
      cities.push(...province.cities)
    })
    provinces.push(...area.provinces)
  })
  const currProvince = provinces.find(p => p.id === provinceId) || {}
  const currCity = cities.find(c => c.id === cityId) || {}
  label += currProvince.name || ''
  label += currCity.name || ''
  return label
}

@inject(stores => {
  const { compositionStore } = stores.store
  const { classificationsAll } = compositionStore
  return {
    classificationsAll,
  }
})
@observer
export default class Shots extends Component {
  static async getInitialProps(ctx) {
    const { req, res, asPath, query, mobxStore } = ctx
    const { compositionStore, shotsStore, accountStore, adStore, globalStore } = mobxStore
    const { fetchGetClassifications } = compositionStore
    const { shotsData, fetchCompositions } = shotsStore
    const { currentUser } = accountStore
    const { serverClientCode, isMobileScreen } = globalStore

    let clientCode = serverClientCode
    let apps = {}

    if (req && req.headers) {
      const host = req.headers.host
      const token = parseCookies(ctx)[config.COOKIE_MEIHUA_TOKEN]

      if (['form=', 'category=', 'province=', 'city=', 'newest', 'recommend', 'popular', 'read', 'follow', 'comment', 'collection'].some(v => asPath.indexOf(v) >= 0)) {
        res.writeHead(307, { Location: `/shots` })
        res.end()
      }

      const originTerms = { ...toJS(shotsData.terms) }
      const originTerm = originTerms.term || {}
      const limit: number = isMobileScreen ? 10 : 45
      let terms: any = {}
      let sort: Array<any> = []
      let term: any = {}
      if (!!query.category && query.category !== '0') term.categoryCodes = [query.category]
      if (!!query.form && query.form !== '0') term.formCodes = [query.form]
      if (!!query.province && query.province !== '0') term.province = [query.province]
      if (!!query.city && query.city !== '0') term.city = [query.city]
      terms.recommended = false
      switch (query.sort) {
        case CommonSortType.NEWEST:
          sort = [{ key: 'gmtPublish', value: 'desc' }]
          break
        case CommonSortType.HOT:
          sort = [{ key: 'degree', value: 'desc' }]
          break
        case CommonSortType.SERVICE:
          sort = [{ key: 'services', value: 'desc' }]
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
        case CommonSortType.RECOMMEND:
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

      // 获取作品列表 
      const shotsParam = { terms: newTerms, client: clientCode, token }
      let resultShotsAds = {}
      // let resultShotData = {}
      if (terms.recommended) {
        const shotsAdParam = { page_code: `f_w_s`, field_code: JSON.stringify(['f_w_s_1', 'f_w_s_2', 'f_w_s_3']) }
        resultShotsAds = await adStore.fetchAdvertisement(shotsAdParam)
        shotsParam.mergeAds = resultShotsAds
        await fetchCompositions(shotsParam)
      } else {
        await fetchCompositions(shotsParam)
      }

      // 获取分类、品类、形式列表
      await fetchGetClassifications({})

    }

    return {
      asPath,
      query,
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

  getTitleName() {
    const { classificationsAll, query } = this.props
    const forms = classificationsAll.forms || []
    // const scopeName = getScopeName(query)
    const scopeName = commonSortTypeMap[query.sort] || commonSortTypeMap[CommonSortType.RECOMMEND]
    const areaName = getArea(Number(query.province), Number(query.city))
    let formName = ''
    if (query.form) {
      const formId = Number(query.form)
      const currForm = forms.find(f => f.id === formId) || {}
      formName += currForm.name || ''
    }
    return `${scopeName}${areaName}${formName}作品 - 营销作品宝库 - 梅花网`
  }

  render() {
    const { query, userInfo } = this.props

    const titleName = this.getTitleName()
    const description = '营销案例、创意作品的集中展示，作品形式包括且不限于平面海报、互动广告、H5、网站、插画与动画、微电影、快闪店、包装设计等的营销作品。'
    const keywords = '营销案例、作品发布、视频制作、H5制作、海报设计、包装设计、广告片拍摄、微电影、宣传片'

    return (
      <>
        <HeadComponent
          title={titleName}
          keywords={keywords}
          description={description}
        />
        <ShotsListContainer
          query={query}
          userInfo={userInfo}
        />
      </>
    )
  }
}