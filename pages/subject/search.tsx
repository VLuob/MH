import { Component } from 'react'
import { parseCookies } from 'nookies'
import { utils } from '@utils'
import { toJS } from 'mobx'

import { SearchType, CommonSortType } from '@base/enums'
import { config } from '@utils'
import { inject, observer } from 'mobx-react'
import Error from '@components/common/Error'
import HeadComponent from '@components/common/HeadComponent'
import SearchContainer from '@containers/subject/search/SearchContainer'

const typeNameMap = {
  [SearchType.SHOTS]: '作品',
  [SearchType.ARTICLE]: '文章',
  [SearchType.AUTHOR]: '创作者',
  [SearchType.BRAND]: '品牌',
  [SearchType.TAG]: '标签',
  [SearchType.TOPIC]: '专题',
  [SearchType.ENQUIRY]: '询价',
  [SearchType.SERVICE]: '服务',
}

const getSearchType = (key) => {
  let type = SearchType.SHOTS

  switch (key) {
    case 'article':
      type = SearchType.ARTICLE
      break
    case 'author':
      type = SearchType.AUTHOR
      break
    case 'enquiry':
      type = SearchType.ENQUIRY
      break
    case 'service':
      type = SearchType.SERVICE
      break
    case 'brand':
      type = SearchType.BRAND
      break
    case 'tag':
      type = SearchType.TAG
      break
    case 'topic':
      type = SearchType.TOPIC
      break
    case 'shots':
    default:
      type = SearchType.SHOTS
      break
  }
  return type
}

@inject(stores => {
  const { searchStore } = stores.store
  const { updateKeywords, setSearchHotList, clientKeywords, updateFilterData, searchClientFilterData, setSimilarWords } = searchStore

  return {
    updateKeywords,
    setSearchHotList,
    clientKeywords,
    updateFilterData,
    searchClientFilterData,
    setSimilarWords,
  }
})
@observer
export default class SearchPage extends Component {
  static async getInitialProps(ctx) {
    const { req, res, asPath, query, mobxStore } = ctx
    const { searchStore, globalStore } = mobxStore
    const { type, k, sort: sortKey, category, form, classification, authorType, budgetType } = query
    const { serverClientCode } = globalStore
    const { fetchSearchHot, fetchGetSearchFilter, searchResultTerms } = searchStore
    let statusCode = 0
    let navProps = {}
    let mainProps = {}
    let searchType = getSearchType(type)

    if (req && req.headers) {
      statusCode = res.statusCode > 200 ? res.statusCode : 0
      const host = req.headers.host
      const url = req.url

      // 获取热门标签
      const hotParam = { host, limit: 8 }
      const searchHotList = await fetchSearchHot(hotParam)

      if (!k) {
        statusCode = 404
      } else {
        const key = decodeURIComponent(k.replace(/\s+/g, ''))

        const searchFilterResult = await fetchGetSearchFilter({ host, key })
        const searchFilterData = searchFilterResult.filterData || {}

        // TODO: 根据路由重定向
        const urlArr = []
        urlArr.push(encodeURIComponent(key))
        if (sortKey || category || form || classification || authorType || budgetType) {
          urlArr.push(sortKey || '')
          urlArr.push(category || '')
          urlArr.push(form || '')
          urlArr.push(classification || '')
          urlArr.push(authorType || '')
          urlArr.push(budgetType || '')
        }
        const urlPath = urlArr.join('!')

        if (!['shots', 'author', 'enquiry', 'service', 'article', 'brand', 'tag', 'topic'].includes(type)) {
          let locationUrl = ''
          if (searchFilterData.shots && searchFilterData.shots.count > 0) {
            locationUrl = `/search/shots!${urlPath}`
          } else if (searchFilterData.author && searchFilterData.author.count > 0) {
            locationUrl = `/search/author!${urlPath}`
          } else if (searchFilterData.enquiry && searchFilterData.enquiry.count > 0) {
            locationUrl = `/search/enquiry!${urlPath}`
          } else if (searchFilterData.service && searchFilterData.service.count > 0) {
            locationUrl = `/search/service!${urlPath}`
          } else if (searchFilterData.article && searchFilterData.article.count > 0) {
            locationUrl = `/search/article!${urlPath}`
          } else if (searchFilterData.brand && searchFilterData.brand.count > 0) {
            locationUrl = `/search/brand!${urlPath}`
          } else if (searchFilterData.tag && searchFilterData.tag.count > 0) {
            locationUrl = `/search/tag!${urlPath}`
          } else if (searchFilterData.topic && searchFilterData.topic.count > 0) {
            locationUrl = `/search/topic!${urlPath}`
          }
          if (locationUrl) {
            res.writeHead(307, { Location: locationUrl })
            res.end()
          }
        }

        const searchSimilarWords = await searchStore.fetchSimilarWords({ host, keywords: key })
        const client_code = serverClientCode
        const token = parseCookies(ctx)[config.COOKIE_MEIHUA_TOKEN]
        const terms = { ...searchResultTerms }
        const term = searchResultTerms.term || {}
        let sort = searchResultTerms.sort || []

        if (query.category) {
          term.categoryCodes = [query.category]
        }
        if (query.form) {
          term.formCodes = [query.form]
        }
        if (query.classification) {
          term.classificationCodes = [query.classification]
        }
        if (query.budgetType) {
          term.budgetType = query.budgetType
        }
        switch (query.sort) {
          case CommonSortType.NEWEST:
            if (searchType === SearchType.AUTHOR) {
              sort = [{ key: 'gmtCreate', value: 'desc' }]
            } else {
              sort = [{ key: 'gmtPublish', value: 'desc' }]
            }
            break
          case CommonSortType.HOT:
            sort = [{ key: 'degree', value: 'desc' }]
            break
          case CommonSortType.MATCH:
          default:
            sort = [{ key: 'match', value: 'asc' }]
            break
        }
        let contentParam = {
          host,
          token,
          client_code,
          search_type: searchType,
          terms: {
            ...terms,
            term,
            sort,
            keywords: key,
          },
        }

        if (query.authorType) {
          contentParam.author_type = query.authorType
        }
        // console.log('content param', contentParam)
        const resultContent = await searchStore.fetchGetSearchContent(contentParam)

        searchStore.updateKeywords(key)
        searchStore.updateFilterData(searchFilterData)

        navProps = {
          keywords: encodeURIComponent(key),
          searchHotList,
          searchSimilarWords,
        }

        mainProps = {
          searchFilterData
        }
      }
    }

    return {
      query,
      asPath,
      navProps,
      mainProps,
      searchType,
      statusCode,
    }
  }

  render() {
    const { query, statusCode, navProps, mainProps, searchType, clientKeywords, searchClientFilterData } = this.props
    const keyword = clientKeywords || decodeURIComponent(navProps.keywords)
    const typeName = typeNameMap[searchType]

    if (statusCode) {
      return <Error statusCode={statusCode} />
    }

    return (
      <>
        <HeadComponent
          title={`${keyword}相关${typeName} - 创意营销案例 - 营销作品宝库 - 梅花网`}
        />
        <SearchContainer
          query={query}
          searchType={searchType}
          keyword={keyword}
          navProps={navProps}
          searchFilterData={searchClientFilterData}
          searchSrvFilterData={mainProps.searchFilterData}
        />
      </>
    )
  }
}