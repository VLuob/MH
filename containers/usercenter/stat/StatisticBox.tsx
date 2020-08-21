import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Icon, Spin, Row, Col } from 'antd'
import classnames from 'classnames'
import jsCookie from 'js-cookie'
import moment from 'moment'
import { toJS } from 'mobx';

import PartLoading from '@components/features/PartLoading'
import EmptyComponent from '@components/common/EmptyComponent'
import DateRangePicker from '@components/common/DateRangePicker'
import LineChart from './LineChart'
import DetailList from './DetaliList'

import { config, cookie } from '@utils/'
import { StatisticsScope } from '@base/enums'
import { user } from '@base/system'


const statScopes = [
  // {scope: StatisticsScope.SHOTS_FANS, label: '粉丝量'},
  {scope: StatisticsScope.SHOTS_EXPOSURE, label: '作品曝光量'},
  {scope: StatisticsScope.SHOTS_VIEWS, label: '作品浏览量'},
  // {scope: StatisticsScope.ARTICLE_VIEWS, label: '文章浏览量'},
  {scope: StatisticsScope.SHOTS_FAVOR, label: '作品喜欢数'},
  {scope: StatisticsScope.SHOTS_COLLECTION, label: '作品收藏量'},
  {scope: StatisticsScope.SHOTS_COMMENT, label: '作品评论量'},
  {scope: StatisticsScope.AUTHOR_VIEWS, label: '主页浏览量'},
]

// console.log(moment().endOf('week').startOf('day').format('YYYY-MM-DD HH:mm:ss'),moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'))

// console.log(moment().subtract(1, 'days').endOf('day').format('YYYY-MM-DD HH:mm:ss'))

export interface Props {
  
}

@inject(stores => {
  const { statisticsStore, accountStore } = stores.store
  const { statAdditions, statTrend, statDetail } = statisticsStore
  

  return {
    statisticsStore,
    accountStore,
    statAdditions,
    statTrend,
    statDetail,
    currentUser: accountStore.currentUser || {},
  }
})
@observer
export default class StatisticsBox extends Component {
  state = {
    currentScope: StatisticsScope.SHOTS_EXPOSURE,
    currentScopeLabel: '作品曝光量',
    
    addPickerLabel: '近一个月',
    addSd: moment().subtract(29, 'days').startOf('day'),
    addEd: moment().endOf('day'),

    trendPickerLabel: '近一个月',
    trendSd: moment().subtract(29, 'days').startOf('day'),
    trendEd: moment().endOf('day'),

    detailPickerLabel: '全部时间',
    detailSd: moment().subtract(1, 'years'),
    detailEd: moment(),
    // detailPickerLabel: '昨天',
    // detailSd: moment().subtract(1, 'days').startOf('day'),
    // detailEd: moment().subtract(1, 'days').endOf('day'),
    
  }
  componentDidMount() {
    // this.requestCurrent((res) => {
    //   if (res.success) {
    //     const currentUser = res.data || {}
    //     const authorId = currentUser.authorId
    //     this.requestAdditions({authorId})
    //     this.requestTrend({authorId})
    //     this.requestDetail({authorId})
    //   }
    // })
    const { query, currentUser } = this.props
    const authorId = query.id || currentUser.authorId
    this.requestAdditions({authorId})
    this.requestTrend({authorId})
    this.requestDetail({authorId})
  }

  requestCurrent(cb) {
    // const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const token = cookie.get(config.COOKIE_MEIHUA_TOKEN)
    // console.log('current token', token, config.COOKIE_MEIHUA_TOKEN)
    if (token) {
      const { accountStore } = this.props
      accountStore.fetchGetClientCurrent({}, cb)
    }
  }

  requestAdditions({authorId, gmtStart, gmtEnd}) {
    const { query, statisticsStore, currentUser } = this.props
    const { addSd, addEd } = this.state
    // console.log(addSd.format('YYYY-MM-DD HH:mm:ss'),addEd && addEd.format('YYYY-MM-DD HH:mm:ss'))

    statisticsStore.fetchStatAdditions({
      authorId: authorId || query.id || currentUser.authorId,
      gmtStart: gmtStart || (addSd ? addSd.valueOf() : undefined),
      gmtEnd: gmtEnd || (addEd ? addEd.valueOf() : undefined),
    })
  }

  requestTrend({authorId, scope, gmtStart, gmtEnd}) {
    const { query, statisticsStore, currentUser } = this.props
    const { currentScope, trendSd, trendEd } = this.state

    statisticsStore.fetchStatTrend({
      scope: scope || currentScope,
      authorId: authorId || query.id || currentUser.authorId,
      gmtStart: gmtStart || (trendSd ? trendSd.valueOf() : undefined),
      gmtEnd: gmtEnd || (trendEd ? trendEd.valueOf() : undefined),
    })

  } 

  requestDetail({ authorId, gmtStart, gmtEnd, page, size }) {
    const { query, statisticsStore, currentUser } = this.props
    const { detailSd, detailEd, detailPickerLabel } = this.state
    const isAll = detailPickerLabel === '全部时间'
    
    statisticsStore.fetchStatDetail({
      authorId: authorId || query.id || currentUser.authorId,
      gmtStart: gmtStart || (isAll ? undefined : (detailSd ? detailSd.valueOf() : undefined)),
      gmtEnd: gmtEnd || (isAll ? undefined : (detailEd ? detailEd.valueOf() : undefined)),
      page: page || 1,
      size: size || 20,
    })
  }

  handleTrendTab = (scope, label) => {
    this.requestTrend({scope})
    this.setState({currentScope: scope, currentScopeLabel: label})
  }

  handleDetailPagination = (page, size) => {
    this.requestDetail({page, size})
  }

  handleAdditionsPicker = (e, picker) => {
    // console.log(picker)
    const isAll = picker.chosenLabel === '全部时间'
    const addSd = isAll ? moment().subtract(1, 'years').startOf('day') : picker.startDate.startOf('day')
    const addEd = isAll ? moment().endOf('day') : picker.endDate.endOf('day')
    const gmtStart = isAll ? undefined : addSd.valueOf()
    const gmtEnd = isAll ? undefined : addEd.valueOf()
    const addPickerLabel = picker.chosenLabel || `${addSd.format('YYYY-MM-DD')} ~ ${addSd.format('YYYY-MM-DD')}`
    this.setState({addSd, addEd, addPickerLabel}, () => {
      this.requestAdditions({gmtStart, gmtEnd})
    })
  }
  
  handleTrendPicker = (e, picker) => {
    const isAll = picker.chosenLabel === '全部时间'
    const trendSd = isAll ? moment().subtract(1, 'years').startOf('day') : picker.startDate.startOf('day')
    const trendEd = isAll ? moment().endOf('day') : picker.endDate.startOf('day')
    const gmtStart = isAll ? undefined : trendSd.valueOf()
    const gmtEnd = isAll ? undefined : trendEd.valueOf()
    const trendPickerLabel = picker.chosenLabel || `${trendSd.format('YYYY-MM-DD')} ~ ${trendEd.format('YYYY-MM-DD')}`
    this.setState({trendSd, trendEd, trendPickerLabel}, () => {
      this.requestTrend({gmtStart, gmtEnd})
    })
  }

  handleDetailPicker = (e, picker) => {
    const isAll = picker.chosenLabel === '全部时间'
    const detailSd = isAll ? moment().subtract(1, 'years').startOf('day') : picker.startDate.startOf('day')
    const detailEd = isAll ? moment().endOf('day') : picker.endDate.endOf('day')
    const gmtStart = isAll ? undefined : detailSd.valueOf()
    const gmtEnd = isAll ? undefined : detailEd.valueOf()
    const detailPickerLabel = picker.chosenLabel || `${detailSd.format('YYYY-MM-DD')} ~ ${detailEd.format('YYYY-MM-DD')}`
    this.setState({detailSd, detailEd, detailPickerLabel}, () => {
      this.requestDetail({gmtStart, gmtEnd})
    })
  }

  getPickerLabel(sDate, eDate) {
    const sd = sDate ? sDate.startOf('day').valueOf() : null
    const ed = eDate ? eDate.startOf('day').valueOf() : null
    const today = moment().startOf('day').valueOf()
    const yesterday = moment().subtract(1, 'days').startOf('day').valueOf()
    const weekStart = moment().startOf('week').valueOf()
    const weekEnd = moment().endOf('week').startOf('day').valueOf()
    const monthStart = moment().startOf('month').valueOf()
    const monthEnd = moment().endOf('month').startOf('day').valueOf()
    const prevMonthStart = moment().subtract(1, 'months').startOf('month').valueOf()
    const prevMonthEnd = moment().subtract(1, 'months').endOf('month').startOf('day').valueOf()
    const latelyMonthStart = moment().subtract(29, 'days').startOf('day').valueOf()

    let label = ''
    if (!sd || !ed) {
      label = '全部时间'
    } else if (sd === yesterday && ed === yesterday) {
      label = '昨天'
    } else if (sd === weekStart && ed === weekEnd) {
      label = '本周'
    } else if (sd === monthStart && ed === monthEnd) {
      label = '本月'
    } else if (sd === prevMonthStart && ed === prevMonthEnd) {
      label = '上月'
    } else if (sd === latelyMonthStart && ed === today) {
      label = '近一个月'
    } else {
      label = `${sDate.format('YYYY-MM-DD')} ~ ${eDate.format('YYYY-MM-DD')}`
    }
    return label
  }
  
  render() {
    const { statAdditions, statTrend, statDetail } = this.props
    const { 
      currentScope, 
      currentScopeLabel,
      addPickerLabel,
      trendPickerLabel,
      detailPickerLabel,
      addSd, 
      addEd, 
      trendSd, 
      trendEd, 
      detailSd, 
      detailEd,
    } = this.state
    
    // const addPickerLabel = this.getPickerLabel(addSd, addEd)
    // const trendPickerLabel = this.getPickerLabel(trendSd, trendEd)
    // const detailPickerLabel = this.getPickerLabel(detailSd, detailEd)


    return (
      <div className="user-stat-container">
        <div className="user-stat-box">
          <div className="user-stat-additions">
            <div className="stat-header">
              <Row>
                <Col span={12}>
                  <div className="stat-title-tab">
                    <div className="tab-item">新增数据</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="time-picker-box">
                    <DateRangePicker
                      opens={'left'}
                      startDate={addSd}
                      endDate={addEd}
                      onApply={this.handleAdditionsPicker}
                    >
                      <span className="picker-label">{addPickerLabel} <Icon type="down" /></span>
                    </DateRangePicker>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="stat-content">
              <div className="stat-additions-box">
                {/* <div className="stat-additions-item">
                  <div className="number">{statAdditions.authorFansCount || 0}</div>
                  <div className="name">粉丝量</div>
                </div> */}
                <div className="stat-additions-item">
                  <div className="number">{statAdditions.exposureCount || 0}</div>
                  <div className="name">作品曝光量</div>
                </div>
                <div className="stat-additions-item">
                  <div className="number">{statAdditions.worksCount || 0}</div>
                  <div className="name">作品浏览量</div>
                </div>
                {/* <div className="stat-additions-item">
                  <div className="number">{statAdditions.articleCount || 0}</div>
                  <div className="name">文章浏览量</div>
                </div> */}
                <div className="stat-additions-item">
                  <div className="number">{statAdditions.favorCount || 0}</div>
                  <div className="name">作品喜欢数</div>
                </div>
                <div className="stat-additions-item">
                  <div className="number">{statAdditions.collectionCount || 0}</div>
                  <div className="name">作品收藏量</div>
                </div>
                <div className="stat-additions-item">
                  <div className="number">{statAdditions.commentCount || 0}</div>
                  <div className="name">作品评论量</div>
                </div>
                <div className="stat-additions-item">
                  <div className="number">{statAdditions.authorViewsCount || 0}</div>
                  <div className="name">主页浏览量</div>
                </div>
              </div>
            </div>

          </div>
          <div className="user-stat-trend">
            <div className="stat-header">
              <Row>
                <Col span={4}>
                  <div className="stat-title-tab">
                    <div className="tab-item">新增趋势</div>
                  </div>
                </Col>
                <Col span={16}>
                  <ul className="trend-nav-tab">
                    {statScopes.map(item => (
                      <li 
                        key={item.scope} 
                        className={classnames({active: item.scope === currentScope})} 
                        onClick={e => this.handleTrendTab(item.scope, item.label)}
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </Col>
                <Col span={4}>
                <div className="time-picker-box">
                    <DateRangePicker
                      opens={'left'}
                      startDate={trendSd}
                      endDate={trendEd}
                      onApply={this.handleTrendPicker}
                    >
                      <span className="picker-label">{trendPickerLabel} <Icon type="down" /></span>
                    </DateRangePicker>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="stat-content">
              <div className="stat-trend-box">
                <LineChart
                  scopeLabel={currentScopeLabel}
                  report={statTrend || {}}
                />
              </div>
            </div>
          </div>

          <div className="user-stat-detail">
            <div className="stat-header">
              <Row>
                <Col span={12}>
                  <div className="stat-title-tab">
                    <div className="tab-item">统计列表</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="time-picker-box">
                    <DateRangePicker
                      opens={'left'}
                      startDate={detailSd}
                      endDate={detailEd}
                      onApply={this.handleDetailPicker}
                    >
                      <span className="picker-label">{detailPickerLabel} <Icon type="down" /></span>
                    </DateRangePicker>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="stat-content">
                <DetailList
                  data={statDetail}
                  onPagination={this.handleDetailPagination}
                />
            </div>
          </div>
        </div>

      </div>
    )
  }
}