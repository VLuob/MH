import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'
import jsCookie from 'js-cookie'
import classnames from 'classnames'
import { Button, Tag, Icon, Avatar, Select, Tooltip, message } from 'antd'

import {Router} from '@routes'
import { config } from '@utils'

import ArticleItem from '@components/article/ArticleItem'
import ShareGroup from '@containers/shots/ShareGroup'

import TopItem from './TopItem'
import TopShotsItem from './TopShotsItem'
import TopAuthorItem from './TopAuthorItem'

import { TopTypes, TopStatTypes, FollowTypes, LetterSendType, LetterSenderTypes, LetterReceiverTypes, LetterSources } from '@base/enums'

const CardModal = dynamic(() => import('@containers/card/CardModal'), {ssr: false})
const CardIcon = dynamic(() => import('@containers/card/CardIcon'), {ssr: false, loading: () => <span></span>  }) 

const Option = Select.Option

const imgShotsTab = 'https://resource.meihua.info/FtSXutZ8mfyc4bOSd0QYSQUduUEv'
const imgArticleTab = 'https://resource.meihua.info/Fhcjz94xtWa4VKZ6wh94wHXHjs6X'
const imgAuthorTab = 'https://resource.meihua.info/FlJV1whHu7rdumy-msD7o8MsceUG'
const imgShotsTabHover = 'https://resource.meihua.info/FtIoAv3Bzun7KIuK_aemEonufKOZ'
const imgArticleTabHover = 'https://resource.meihua.info/FtvbslwCUAFJAVO8vQP4VfN-CtbJ'
const imgAuthorTabHover = 'https://resource.meihua.info/Fhy7R6ccZiVvgzZ8WNgFHG5_7ao1'
const topCover = 'https://resource.meihua.info/Fi7tzB4xen_Xkx15WpYcW4gJVG3Y'

const typeTabs = [
  {type: TopTypes.SHOTS, name: '作品榜', img: imgShotsTab, hoverImg: imgShotsTabHover},
  {type: TopTypes.ARTICLE, name: '文章榜', img: imgArticleTab, hoverImg: imgArticleTabHover},
  {type: TopTypes.AUTHOR, name: '创作者榜', img: imgAuthorTab, hoverImg: imgAuthorTabHover},
]

const typeRouteMap = {
  [TopTypes.SHOTS]: 'shots',
  [TopTypes.ARTICLE]: 'article',
  [TopTypes.AUTHOR]: 'author',
}

const rankRouteMap = {
  [TopStatTypes.TOTAL] : 'total',
  [TopStatTypes.WEEK]: 'week',
  [TopStatTypes.SHARP]: 'sharp',
}

const statTypeMap = {
  [TopStatTypes.TOTAL]: '总榜',
  [TopStatTypes.WEEK]: '周榜',
  [TopStatTypes.FAVOR]: '喜欢最多',
  [TopStatTypes.COLLECTION]: '收藏最多',
  [TopStatTypes.COMMENT]: '评论最多',
  [TopStatTypes.VIEW]: '浏览最多',
  [TopStatTypes.FAN]: '粉丝最多',
  [TopStatTypes.COMPOSITION]: '作品最多',
  [TopStatTypes.SHARP]: '新锐榜',
}

// const statTypeGroups = {
//   [TopTypes.SHOTS]: [TopStatTypes.SHARP,TopStatTypes.TOTAL,TopStatTypes.FAVOR,TopStatTypes.COLLECTION,TopStatTypes.COMMENT,TopStatTypes.VIEW],
//   [TopTypes.ARTICLE]: [TopStatTypes.SHARP,TopStatTypes.TOTAL,TopStatTypes.FAVOR,TopStatTypes.COLLECTION,TopStatTypes.COMMENT,TopStatTypes.VIEW],
//   [TopTypes.AUTHOR]: [TopStatTypes.TOTAL,TopStatTypes.FAN,TopStatTypes.COMPOSITION,TopStatTypes.VIEW],
// }
const statTypeGroups = {
  [TopTypes.SHOTS]: [TopStatTypes.SHARP,TopStatTypes.WEEK],
  [TopTypes.ARTICLE]: [TopStatTypes.SHARP,TopStatTypes.WEEK],
  [TopTypes.AUTHOR]: [TopStatTypes.WEEK, TopStatTypes.TOTAL],
}

@inject(({store}) => {
  const { topStore, globalStore, letterStore, accountStore } = store
  return {
    letterStore,
    topStore,
    globalStore,
    topSchedules: topStore.topSchedules || [],
    topsData: topStore.topsData || {},
    qiniuToken: globalStore.qiniuToken,
    currentUser: accountStore.currentUser || {},
  }
})
@observer
export default class TopContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      type: props.type,
      rankingId: props.rankingId,
      rankStatType: props.rankStatType,
      shareCardModal: false,
      cardItem: {},
      cardType: '',
      shareUrl: '',
    }  
  }

  componentDidMount() {
    this.initQiniuToken()
  }


  initQiniuToken() {
    const { qiniuToken, globalStore } = this.props
    if (!qiniuToken) {
      globalStore.fetchQiniuToken()
    }
  }

  requestTops(option) {
    const { topStore, topsData } = this.props
    const { type, rankStatType, rankingId } = this.state
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const client = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    const param = {
      type,
      client,
      token,
      limit: topsData.terms.limit,
      rankListType: rankStatType,
      rankingId,
      ...option,
    }
    if (param.type === TopTypes.AUTHOR && param.rankListType === TopStatTypes.TOTAL) {
      topStore.fetchTotalTopAuthors({token})
    } else {
      topStore.fetchTops(param)
    }
  }

  handleTypeChange = (type) => {
    const { query } = this.props
    if (this.state.type === type) {
      return
    }
    const statTypeGroup = statTypeGroups[type] || []
    let rankListType = this.state.rankStatType
    if (!statTypeGroup.includes(rankListType)) {
      rankListType = type === TopTypes.AUTHOR ? TopStatTypes.TOTAL : TopStatTypes.SHARP
    }

    this.requestTops({type, rankListType})
    this.setState({type, rankStatType: rankListType})
    const rankingStr = query.ranking ? `!${query.ranking}` : ''
    Router.pushRoute(`/top/${typeRouteMap[type]}!${rankListType}${rankingStr}`)
    setTimeout(() => {
      this.setState({shareUrl: location.href})
    }, 100)
  }

  handleStatTypeChange = (rankStatType) => {
    const { query } = this.props
    if (this.state.rankStatType === rankStatType) {
      return
    }
    this.requestTops({rankListType: rankStatType})
    this.setState({rankStatType})
    const rankingStr = query.ranking ? `!${query.ranking}` : ''
    Router.pushRoute(`/top/${query.type || 'shots'}!${rankStatType}${rankingStr}`)
    setTimeout(() => {
      this.setState({shareUrl: location.href})
    }, 100)
  }

  handleScheduleSelect = (rankingId) => {
    const { query } = this.props
    const { rankStatType } = this.state
    if (this.state.rankingId === rankingId) {
      return
    }
    this.requestTops({rankingId})
    this.setState({rankingId})
    let urlStr = `/top/${query.type || 'shots'}!${rankStatType}!${rankingId}`
    Router.pushRoute(urlStr)
  }

  handleAuthorFollow = (id, action) => {
    const { topStore } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    if (!token) {
      window.location.href = `/signin?c=${window.location.href}`
      return
    }
    topStore.fetchActionFollowAuthor({
      id,
      action,
      type: FollowTypes.AUTHOR,
      token,
      client_code,
    })
  }

  handleMessage = (author) => {
    const { letterStore, currentUser } = this.props
    letterStore.openEnquiry({
      type: LetterSendType.SEND,
      senderType: LetterSenderTypes.USER, // 1梅花网用户 2 创作者
      // senderAvatar: currentUser.avatar,
      receiverType: LetterReceiverTypes.AUTHOR,
      receiverId: author.id,
      // receiverNickName: author.nickname,
      source: LetterSources.TOP,
      relationId: author.id,
    })
  }

  handleCardShare = (item, type) => {
    const cardType = type === TopTypes.AUTHOR ? 'authorTop' : 'compositionTop'
    this.setState({cardItem: item, cardType})
    this.handleCardModal(true)
  }

  handleCardModal = (flag) => {
    this.setState({shareCardModal: !!flag})
  }

  render() {
    const { topSchedules, topsData } = this.props
    const { rankingId, type, rankStatType, shareCardModal, cardItem, cardType, shareUrl } = this.state

    const topList = topsData.list || []
    const isLoading = topsData.isLoading
    const isTotalRank = rankStatType === TopStatTypes.TOTAL
    const statTypeGroup = statTypeGroups[type] || []
    const rankingLabel = (topSchedules.find(item => item.id === rankingId) || {}).title

    let shareCardTitle = ''
    switch (type) {
      case TopTypes.ARTICLE:
        shareCardTitle = `梅花网榜单收录作品：${cardItem.title}`
        break;
      case TopTypes.SHOTS:
        shareCardTitle = `梅花网榜单收录文章：${cardItem.title}`
        break
      case TopTypes.AUTHOR:
        shareCardTitle = `梅花网榜单收录创作者：${cardItem.nickname}`
        break
      default:
        break;
    }

    return (
      <div className="top-container">
        <div className="top-header">
          <div className="top-banner">
            <div className="top-banner-bg">
              <img src={topCover} alt=""/>
            </div>
            {/* <div className="top-title">
              梅花网榜单
            </div> */}
          </div>
          <div className="top-navigator">
              <ul className="top-nav">
                {typeTabs.map(item => (
                  <li 
                    key={item.type} 
                    className={classnames({'active': type === item.type})}
                    onClick={e => this.handleTypeChange(item.type)}
                  >
                    {/* <img src={type === item.type ? item.hoverImg : item.img}/> */}
                    <img className="default" src={item.img}/>
                    <img className="hover" src={item.hoverImg}/>
                  </li>
                ))}
              </ul>
              <ul className="top-subnav">
                {statTypeGroup.map(t => (
                  <li key={t}><Button type={rankStatType === t ? 'primary' : ''} onClick={e => this.handleStatTypeChange(t)}>{statTypeMap[t]}</Button></li>
                ))}
              </ul>
              <ul className="top-nav-mb">
                {typeTabs.map(item => (
                  <li key={item.type} className={classnames({active: item.type === type})} onClick={e => this.handleTypeChange(item.type)}>{item.name}</li>
                ))}
              </ul>
          </div>
        </div>
        <div className="top-content-wrapper">
          <div className="top-box">
            <div className="top-actions">
              {!isTotalRank && <div className="top-schedule">
                <Select
                  value={rankingId}
                  onSelect={this.handleScheduleSelect}
                >
                  {topSchedules.map(item => (
                    <Option className="top-select-item" key={item.id} value={item.id}><div className="top-schedule-label"><div className="name">{item.title}</div> <div className="time-scope">{item.name}</div></div></Option>
                  ))}
                </Select>
              </div>}
              <div className="top-explain">
                <Icon type="question-circle" theme="filled" /> 梅花网榜单规则说明
                <div className="top-explain-box">
                  <p>1、榜单只显示前50条排行数据； </p>
                  <p>2、周榜显示的是周期内的增量数据，总榜显示的是累计数据； </p>
                  <p>3、一旦发现恶意刷榜行为，将永久取消该作品和创作者上榜资格。 </p>
                  <p>4、周榜于每周一9：00进行更新，总榜于每日0：00进行更新。 </p>
                </div>
              </div>
              <div className="top-subnav-mb">
                <Select
                  value={rankStatType}
                  onSelect={this.handleStatTypeChange}
                > 
                  {statTypeGroup.map(t => (
                    <Option className="top-select-item" key={t} value={t}>{statTypeMap[t]}</Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="top-content">
              <ul className="top-list">
                {topList.map((topItem, topIndex) => {
                  let renderChildren = null
                  switch(topItem.type) {
                    case TopTypes.ARTICLE: {
                      const item = topItem.composition || {}
                      renderChildren = <ArticleItem
                                        showCard
                                        item={item}
                                        key={item.compositionId}
                                        id={item.compositionId}
                                        title={item.title}
                                        cover={item.cover}
                                        summary={item.summary}
                                        authorCode={item.authorCode}
                                        author={item.authorName}
                                        view={item.views}
                                        time={item.gmtPublish}
                                        classification={item.classificationName}
                                        // onCard={e => this.handleCardShare(item, TopTypes.ARTICLE)}
                                        cardIcon={<CardIcon 
                                          noReqQiniu
                                          type={'compositionTop'}
                                          rankingLabel={rankingLabel}
                                          cardName={item.compositionId}
                                          title={shareCardTitle}
                                          item={item}
                                        />}
                                    />
                      break
                    }
                    case TopTypes.SHOTS: {
                      const item = topItem.composition || {}
                      renderChildren = <TopShotsItem
                                        item={item}
                                        // onCard={e => this.handleCardShare(item, TopTypes.SHOTS)}
                                        cardIcon={<CardIcon 
                                          noReqQiniu
                                          type={'compositionTop'}
                                          rankingLabel={rankingLabel}
                                          cardName={item.compositionId}
                                          title={shareCardTitle}
                                          item={item}
                                        />}
                                      />
                      break
                    }
                    case TopTypes.AUTHOR: {
                      const author = topItem.author || {}
                      renderChildren = <TopAuthorItem
                                        author={author}
                                        onFollow={this.handleAuthorFollow}
                                        onMessage={this.handleMessage}
                                        // onCard={e => this.handleCardShare(author, TopTypes.AUTHOR)}
                                        cardIcon={<CardIcon 
                                          noReqQiniu
                                          type={'authorTop'}
                                          rankingLabel={rankingLabel}
                                          cardName={author.id}
                                          title={shareCardTitle}
                                          item={author}
                                        />}
                                      />
                    }
                  }
                  return (
                    <TopItem
                      key={topItem.id || topIndex}
                      currRanking={topIndex + 1}
                      ranking={topItem.ranking}
                      latestRanking={topItem.latestRanking}
                      rankingShow={topItem.rankingShow}
                      loading={isLoading}
                      isTotalRank={isTotalRank}
                    >
                      {renderChildren}
                    </TopItem>
                  )
                })}
              </ul>
            </div>
            <ShareGroup
              hideActions
              shareUrl={shareUrl}
              scope="top"
              title={"梅花网排行榜"}
              cover={topCover}
            />
          </div>
        </div>
        {/* {shareCardModal &&
          <CardModal
              visible={shareCardModal}
              type={cardType}
              rankingLabel={rankingLabel}
              cardName={cardItem.id}
              title={shareCardTitle}
              item={cardItem}
              onCancel={e => this.handleCardModal(false)}
          />} */}
      </div>
    )
  }
}