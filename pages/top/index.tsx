import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { parseCookies } from 'nookies'

import TopContainer from '@containers/top'
import HeadComponent from '@components/common/HeadComponent'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'

import { TopTypes, TopStatTypes } from '@base/enums'
import { config } from '@utils'
import { toJS } from 'mobx'

const topNameMap = {
  [TopTypes.SHOTS]: '作品',
  [TopTypes.ARTICLE]: '文章',
  [TopTypes.AUTHOR]: '创作者',
}
const getTopType = (typeStr) => {
  let type
  switch(typeStr) {
    case 'article':
      type = TopTypes.ARTICLE            
      break
    case 'shots':
      type = TopTypes.SHOTS            
      break
    case 'author':
      type = TopTypes.AUTHOR            
      break
    default:
      type = TopTypes.SHOTS
      break
  }
  return type
}
const getTopRank = (rankStr) => {
  let rank = null
  switch (rankStr) {
    case 'total':
      rank = TopStatTypes.TOTAL
      break;
    case 'week':
      rank = TopStatTypes.WEEK
      break;
    case 'sharp':
      rank = TopStatTypes.SHARP
      break;
  
    default:
      // rank = TopStatTypes.WEEK
      // rank = -1
      break;
  }
  return rank
}

const getRankTypeData = (query) => {
  let typeName = ''
  let rankName = ''
  switch(query.type) {
    case 'article':
      typeName = '文章'       
      break
    case 'shots':
      typeName = '作品'           
      break
    case 'author':
      typeName = '创作者'            
      break
    default:
      typeName = '作品'
      break
  }
  
  switch (query.rank) {
    case 'total':
      rankName = '总榜'
      break
    case 'week':
      rankName = '周榜'
      break
    case 'sharp':
      rankName = '新锐榜'
      break
  
    default:
      if (query.type === 'author') {
        rankName = '总榜'
      } else {
        rankName = '新锐榜'
      }
      break
  }
  return {rankName, typeName}
}

@inject(stores => {
  const { globalStore } = stores.store
  const { isMobileScreen } = globalStore


  return {
      isMobileScreen,
  }
})
@observer
export default class Top extends Component {
    static async getInitialProps(ctx) {
        const { req, query, asPath, mobxStore } = ctx
        const { topStore, globalStore } = mobxStore
        const { isMobileScreen, setMobileNavigationData } = globalStore
        const { topsData } = topStore

        let datas = {}

        if (req && req.headers) {
            const host = req.headers.host

            const type = getTopType(query.type)
            const rankType = Number(query.rankType) || getTopRank(query.rank)

            if (isMobileScreen) {
              setMobileNavigationData({hide: true})
            }
            
            const resultTopSchedules = await topStore.fetchTopSchedules({host})
            let resultTopData = {}
            let rankStatType = 1
            let rankingId = Number(query.ranking || query.nper)
            if (resultTopSchedules && resultTopSchedules.length > 0) {
              const client = parseCookies(ctx)[config.COOKIE_MEIHUA_CLIENT_CODE]
              const token = parseCookies(ctx)[config.COOKIE_MEIHUA_TOKEN]
              const firstTopSchedule = resultTopSchedules[0]
              // const rankListType = rankStatType = type === TopTypes.AUTHOR ? TopStatTypes.TOTAL : TopStatTypes.SHARP
              let rankStatType 
              if (!rankType) {
                rankStatType = type === TopTypes.AUTHOR ? TopStatTypes.TOTAL : TopStatTypes.SHARP
              } else {
                rankStatType = rankType
              }

              rankingId = rankingId || firstTopSchedule.id
              // console.log('rank type', rankType, rankStatType, type)
              if (type === TopTypes.AUTHOR && rankStatType === TopStatTypes.TOTAL) {
                resultTopData = await topStore.fetchTotalTopAuthors({host, token})
              } else {
                const params = {
                    host,
                    type, 
                    rankingId,
                    rankListType: rankStatType,
                    token,
                    client,
                    limit: topsData.terms.limit,
                }
                resultTopData = await topStore.fetchTops(params)
              }
            }
                        
            datas = {type, rankingId, rankStatType}
        }

         return {
            query,
            ...datas,
        }
    }

    render() {
        const { query, isMobileScreen, ...rest } = this.props
        const type = getTopType(query.type)
        // const topName = topNameMap[type]
        const { typeName, rankName } = getRankTypeData(query)
        const rankType = Number(query.rankType) || getTopRank(query.rank)
        const rankStatType = rankType || (type === TopTypes.AUTHOR ? TopStatTypes.TOTAL : TopStatTypes.SHARP)
        const param = {
          ...rest,
          rankStatType,
        }
        const description = '梅花网每周根据浏览量、点赞、评论、收藏综合评定出的最优质、最热门、最具营销力的作品、文章及创作者。'
        const keywords = '排名、榜单、作品、文章、创作人、热门广告案例、广告公司排名'

        return (
            <>
                <HeadComponent
                    // title={`${topName}排行榜 - 创意营销案例排行榜 - 营销作品宝库 - 梅花网`}
                    title={`年度营销案例${typeName}${rankName} - 营销作品宝库 - 梅花网`}
                    description={description}
                    keywords={keywords}
                />
                {isMobileScreen && <MbNavigatorBar 
                    showTitle 
                    btnType="back"
                    backUrl="/discover"
                    title="榜单" 
                />}
                <TopContainer 
                    {...param}
                    query={query}
                />
            </>
        )
    }
}