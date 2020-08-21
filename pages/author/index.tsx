import { Component } from 'react'
import jsHttpCookie from 'cookie'
import { parseCookies } from 'nookies'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'

import wxSignature from '@utils/wxSignature'
import AuthorContainer from '@containers/author/AuthorContainer'
import HeadComponent from '@components/common/HeadComponent'
import areas from '@base/system/area'
import { config } from '@utils'
import srvUtils from '@utils/srvutils'
import { AuthorType, CommonSortType } from '@base/enums'

const authorTypeMap = {
  [AuthorType.PERSONAL]: '个人',
  [AuthorType.BRANDER]: '品牌主',
  [AuthorType.SERVER]: '服务商',
}

const getScopeName = (query) => {
  let label = ''
  if (query.follow === '') {
    label = '关注'
  } else if (query.popular === '' || query.like === '' || query.read === '' || query.shots === '' || query.fan === '') {
    label = '热门'
  }
  // else if (query.like === '') {
  //     label = '喜欢'
  // } else if (query.read === '') {
  //     label = '浏览'
  // } else if (query.shots === '') {
  //     label = '作品'
  // } else if (query.fan === '') {
  //     label = '粉丝'
  // } 
  else if (query.newest === '') {
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
  const { globalStore } = stores.store
  const { updateIpAddress } = globalStore

  return {
    updateIpAddress
  }
})
@observer
export default class Author extends Component {
  static async getInitialProps(ctx) {
    const { asPath, query, req, res, mobxStore } = ctx
    const { authorStore, globalStore, accountStore, compositionStore } = mobxStore
    const { fetchGetIpAddress, updateIpAddress, setMobileNavigationData, isMobileScreen } = globalStore
    const { fetchGetClassifications } = compositionStore
    const { fetchAuthorData } = authorStore
    const { currentUser } = accountStore
    const condition = {
      recommended: true,
      page: 1,
      limit: 20
    }
    let apps = {}

    if (req && req.headers) {
      const host = req.headers.host
      let token = parseCookies(ctx)[config.COOKIE_MEIHUA_TOKEN]

      if (['newest', 'recommend', 'popular', 'follow', 'read', 'comment', 'collection', 'type=', 'province=', 'city='].some(v => asPath.indexOf(v) >= 0)) {
        let locationUrl = '/author'
        res.writeHead(307, { Location: locationUrl })
        res.end()
      }

      if (isMobileScreen) {
        setMobileNavigationData({ hide: true })
      }

      const originCondition = { ...toJS(condition) }
      const originTerm = originCondition.term || {}
      let terms: any = {}
      let sort: Array<any> = []
      let term: any = {}
      if (!!query.type && query.type !== '0') term.type = query.type
      if (!!query.formCode && query.formCode !== '0') term.formCodes = [query.formCode]
      if (!!query.province && query.province !== '0') term.province = [query.province]
      if (!!query.city && query.city !== '0') term.city = [query.city]
      terms.recommended = false

      switch (query.sort) {
        case CommonSortType.FOLLOW:
          if (!token) {
            res.writeHead(307, { Location: `/signin?c=${encodeURIComponent(req.originalUrl || req.url)}` })
            res.end()
          }
          if (currentUser && currentUser.id) {
            term = { follower: currentUser.id }
          }
          break
        case CommonSortType.HOT:
          sort = [{ key: 'degree', value: 'desc' }]
          break
        case CommonSortType.NEWEST:
          sort = [{ key: 'gmtPublish', value: 'desc' }]
          break
        case CommonSortType.SHOTS:
          sort = [{ key: 'worksQuantity', value: 'desc' }]
          break
        case CommonSortType.SERVICE:
          sort = [{ key: 'serviceQuantity', value: 'desc' }]
          break
        case CommonSortType.RECOMMEND:
        default:
          terms.recommended = true
          break
      }

      const newCondition: any = {
        ...originCondition,
        ...terms,
        term: {
          ...originTerm,
          ...term
        },
      }
      if (sort.length > 0) {
        newCondition.sort = sort
      }
      // 获取创作者列表 
      const authorParam: any = { condition: newCondition }
      // console.log('newCondition', newCondition)
      await fetchAuthorData(authorParam)
      await fetchGetClassifications({})

      apps = {
        authorParam,
      }
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

  render() {
    const { query } = this.props
    const scopeName = getScopeName(query)
    const areaName = (query.province || query.city) ? getArea(Number(query.province), Number(query.city)) : ''
    const authorTypeName = authorTypeMap[Number(query.type)] || ''
    const description = '营销行业的创作机构合集，囊括整合营销、视频制作、平面海报、互动广告、H5、网站、插画与动画、微电影、快闪店、包装设计等。'
    const keywords = '视频制作公司、创意热店、H5制作公司、公关公司、广告公司'
    return (
      <>
        <HeadComponent
          title={`${scopeName}${areaName}${authorTypeName}创作者 - 营销服务商 - 营销作品宝库 - 梅花网`}
          keywords={keywords}
          description={description}
        />
        <AuthorContainer
          query={query}
        />
      </>
    )
  }
}