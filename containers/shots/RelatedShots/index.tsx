import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import dynamic from 'next/dynamic'
import classnames from 'classnames'
import jsCookie from 'js-cookie'
import { toJS } from 'mobx'
import { Icon, Switch, Avatar, Tooltip } from 'antd'

import PartLoading from '@components/features/PartLoading'
import CustomIcon from '@components/widget/common/Icon'
import RelatedShotsItem from './RelatedShotsItem'

import { CompositionTypes, RelatedCompositionScope } from '@base/enums'
import { storage, config, utils } from '@utils'

import './index.less'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
  loading: () => <p></p>,
  ssr: false
})

export interface Props {
    compositionId: string|number
}

@inject(stores => {
  const { compositionStore, shotsStore, globalStore } = stores.store
  const { isMobileScreen, serverClientCode } = globalStore
  const { relatedShotsData } = compositionStore
  const { autoPlay, hasVideo } = shotsStore

  return {
      compositionStore,
      shotsStore,
      isMobileScreen,
      serverClientCode,
      relatedShotsData, 
      autoPlay,
      hasVideo,
  }
})
@observer
export default class RelatedCompositions extends Component {
  componentDidMount() {
    this.initAutoPlay()
    var storage = window.sessionStorage;
    storage.setItem('name', 'jerry');
    // console.log('name', storage.getItem('name'))
  }

  initAutoPlay() {
    const { shotsStore } = this.props
    const autoPlay = jsCookie.get(config.COOKIE_DETAIL_AUTO_PLAY)
    shotsStore.setAutoPlay(!!autoPlay)
  }

  handleRefresh = () => {
    const { compositionStore, compositionId, relatedShotsData, hasVideo, isMobileScreen, serverClientCode } = this.props
    // const isEnd = relatedShotsData.isLastPage
    const terms = relatedShotsData.terms
    compositionStore.fetchRelatedCompositions({
      compositionId,
      type: CompositionTypes.SHOTS,
      scope: hasVideo ? RelatedCompositionScope.VIDEO : RelatedCompositionScope.ALL,
      page: 1, // 后端逻辑，page固定为1
      limit: terms.limit,
      client: serverClientCode,
      // pc端分页数据不追加
      notAppend: !isMobileScreen,
    })
  }

  
  handleAuthPlay = () => {
    const { shotsStore, autoPlay } = this.props
    const nextStatus = !autoPlay
    shotsStore.setAutoPlay(nextStatus)
    if (nextStatus) {
      jsCookie.set(config.COOKIE_DETAIL_AUTO_PLAY, '1', {path: '/', expires: 365, domain: config.COOKIE_MEIHUA_DOMAIN})
    } else {
      jsCookie.remove(config.COOKIE_DETAIL_AUTO_PLAY,{path: '/', expires: -1, domain: config.COOKIE_MEIHUA_DOMAIN})
    }
  }

  computeFileInfo(record) {
    const isVideoType = (record.fileTypes || []).includes('video')
    const resolution = JSON.parse(record.resolution || '{}')
    const duration = resolution.duration || 0
    const width = resolution.width || 0
    const height = resolution.height || 0
    const isHorizontal = width >= height
    const is4K = (isHorizontal && (width >= 3840 || height >= 2160) || !isHorizontal && (width >= 2160 || height >= 3840))

    const hours = Math.floor(duration / (60 * 60))
    const minuteLevel = duration % (60 * 60)
    const minutes = Math.floor(minuteLevel / 60)
    const secondLevel = minuteLevel % 60
    const seconds = Math.floor(secondLevel)
    let durationFormat = ''
    if (hours > 0) {
      durationFormat += hours < 10 ? `0${hours}:` : hours
    } 
    durationFormat += minutes < 10 ? `0${minutes}:` : minutes
    durationFormat += seconds < 10 ? `0${seconds}` : seconds
    
    return {isVideoType, isHorizontal, is4K, width, height, duration, durationFormat}
  }

  render() {
    const { relatedShotsData, compositionStore, isMobileScreen, autoPlay, hasVideo } = this.props
    const relatedCompositions = relatedShotsData.list || []
    const relatedIsLastPage = relatedShotsData.isLastPage
    const relatedIsLoading = relatedShotsData.isLoading
    const isEmpty = !relatedIsLoading && relatedCompositions.length === 0
    
    return (
      <>
      {!isEmpty ? <div className="related-shots">
      <div className="related-shots-container">
        <div className="header">
          <span className="title">相关推荐</span>
          {!isMobileScreen && <span className="change" onClick={this.handleRefresh}><Icon type="sync" /> 换一换</span>}
          {hasVideo && !isMobileScreen && <span className="auto">自动播放 <Switch onClick={this.handleAuthPlay} checked={autoPlay} /></span>}
        </div>
        <div className="list related-shots-list">
          {relatedCompositions.map((item, i) => {
            const {isVideoType, isHorizontal, is4K, width, height, duration, durationFormat} = utils.computeFileInfo(item)
            return (
              <RelatedShotsItem
                key={item.compositionId}
                item={item}
                isVideoType={isVideoType}
                is4K={is4K}
                durationFormat={durationFormat}
              />
            )
          })}
          {relatedIsLoading && <PartLoading />}
        </div>
        {isMobileScreen && <div className="loading-more" onClick={this.handleRefresh}>加载更多作品</div>
        // <>
        // {relatedShotsData.isLastPage ? <div className="page-end">-- 没有更多作品 --</div> : <div className="loading-more" onClick={this.handleRefresh}>加载更多作品</div>}
        // </>
        }
      </div>
    </div> : null}
    </>
    )
  }
}