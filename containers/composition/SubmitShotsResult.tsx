import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Icon, Button, Input, message } from 'antd'
import { CompositionTypes, EditionType } from '@base/enums'
import moment from 'moment'
import sysOrder  from '@base/system/order'
import './SubmitShotsResult.less'

const typeNameMap = {
  [CompositionTypes.ARTICLE]: 'article',
  [CompositionTypes.SHOTS]: 'shots',
}

const freeInfo = {
  1: {label: '常规算法', percentage: 0 },
  2: {label: '每月10个', percentage: 10 },
  3: {label: '720P', percentage: 30 },
  4: {label: '无', percentage: 0 },
}
const standardInfo = {
  1: {label: '常规算法加成50%', percentage: 50 },
  2: {label: '每月30个', percentage: 30 },
  3: {label: '1080P', percentage: 60 },
  4: {label: '每月10个', percentage: 30 },
}
const advancedInfo = {
  1: {label: '常规算法加成100%', percentage: 100 },
  2: {label: '不限', percentage: 100 },
  3: {label: '4k', percentage: 100 },
  4: {label: '每月30个', percentage: 100 },
}

const functionList = [
  {id: 1, label: '作品曝光率', icon: '/static/images/composition/eye_circle.svg'},
  {id: 2, label: '发布量', icon: '/static/images/composition/upload_circle.svg'},
  {id: 3, label: '视频播放最高质量', icon: '/static/images/composition/diamond_circle.svg'},
  {id: 4, label: '作品代发服务', icon: '/static/images/composition/send_circle.svg'},
]

const functionListFree = [...functionList].map(item => ({ ...item,infoLeft: freeInfo[item.id],infoRight: standardInfo[item.id],}))
const functionListStandard = [...functionList].map(item => ({ ...item, infoLeft: standardInfo[item.id], infoRight: advancedInfo[item.id],}))

const editionMap = sysOrder.filters.editionMap

export interface Props {
  query: any
}

@inject(stores => {
  const { compositionStore } = stores.store
  return {
    compositionStore,
  }
})
@observer
export default class SubmitShotsResultContainer extends Component<Props> {
  state = {
    previewLoading: false
  }

  handlePreview = () => {
    const { query, compositionStore } = this.props
    const compositionId = query.id
    // const typeName = typeNameMap[query.type]
    this.setState({previewLoading: true})
    compositionStore.fetchCompositionPreviewCode({compositionId}, (res) => {
      this.setState({previewLoading: false})
      if (res.success) {
        window.open(`/shots/preview/${res.data}`)
      }
    })
  }
  render() {
    const { query } = this.props
    const { previewLoading } = this.state
    const orgId = query.orgId
    const compositionId = query.id
    const authorId = query.aid
    const code = query.code
    const expire = Number(query.expire)
    const editionType = Number(query.v)
    const isFreeEdition = editionType === EditionType.FREE
    const isStandardEdition = editionType === EditionType.STANDARD
    const isAdvancedEdition  = editionType === EditionType.ADVANCED
    const currentFunctions = isFreeEdition ?  functionListFree : functionListStandard
    
    const isSuccess = code === 'S100000'
    const isCountError = code === 'E100006'
    const creationUrl = `/teams/${authorId}/creation?type=shots&status=${isSuccess ? 1 : 3}`

    let isFastExpire = false
    let currentEditionLabel = ''
    let nextEditionLabel = ''
    let alertText = ''
    let upgradeUrl = ''
    let expireDays = 0

    switch(editionType) {
      case EditionType.FREE:
        currentEditionLabel = '免费版'
        nextEditionLabel = '标准版'
        alertText = '梅小花提醒您：建议您现在升级到标准版账户，累计可发布100个作品，作品曝光率还可以加成50%！'
        upgradeUrl = `/pricing?v=${EditionType.STANDARD}&aid=${authorId}`
        break
      case EditionType.STANDARD:
        currentEditionLabel = '标准版'
        nextEditionLabel = '高级版'
        alertText = '梅小花提醒您：建议您现在升级到标准版账户，累计可发布100个作品，作品曝光率还可以加成100%！'
        upgradeUrl = `/pricing?v=${EditionType.ADVANCED}&aid=${authorId}`
        break
      case EditionType.ADVANCED:
        expireDays = moment(expire).diff(moment(), 'days')
        isFastExpire = [30,7,3].includes(expireDays)
        // isFastExpire = moment(expire).subtract(30, 'days').isBefore(moment())
        alertText = `梅小花提醒您：您的账户高级版还剩${expireDays}天时间就到期，现在续费高级版账户，可继续享受不限量发布作品，4K视频上传！`
        upgradeUrl = `/pricing?v=${EditionType.ADVANCED}&aid=${authorId}`
        break
    }

    const isAdvancedFastExpire = isAdvancedEdition && isFastExpire


    return (
      <div className="submit-result-container">
          <div className="submit-result-content">
            <div className="submit-result-info">
              <div className="submit-result-info-text">
                {isSuccess && 
                <>
                <div className="title success">
                  <span className="title-icon"><Icon type="check-circle" theme="filled" /></span><span className="title-text">提交成功</span>
                </div>
                <div className="desc"> 梅花网将会尽快审核您的作品，对不符合<a href="/rule/shots" target="_blank">《梅花网作品库收录规范和编辑规范》</a>的作品不予收录。 </div>
                </>}
                {isCountError && 
                <>
                  <div className="title fail">
                    <span className="title-icon"><Icon type="close-circle" theme="filled" /></span><span className="title-text">提交失败</span>
                  </div>
                  <div className="desc"> 您的账户本月发布作品量已超过限额，该作品已自动保存草稿，您可下架其他作品后继续提交该作品。</div>
                </>}
              </div>
            </div>
            {(!isAdvancedEdition || isAdvancedFastExpire) && <div className="submit-result-alert">
              <Icon type="info-circle" theme="filled" />{alertText}
            </div>}
            <div className="submit-result-btns">
              <Button onClick={this.handlePreview} loading={previewLoading}>预览作品</Button>
              <Button href={creationUrl} target="_blank">管理作品</Button>
              {isAdvancedFastExpire && <Button type="primary" href={upgradeUrl} target="_blank">续费版本</Button>}
              {!isAdvancedEdition && <Button type="primary" href={upgradeUrl} target="_blank">升级版本</Button>}
            </div>
              {!isAdvancedEdition &&
              <>
              <div className="submit-result-function">
                <div className="function-title">
                  <div className="title title-left">当前版本-{currentEditionLabel}</div>
                  <div className="title title-right">{nextEditionLabel}</div>
                </div>
                <div className="function-list">
                  {currentFunctions.map(item => (
                    <div className="function-item" key={item.id}>
                      <div className="function-item-box box-left">
                        {item.infoLeft && <>
                          <div className="label">{item.infoLeft.label}</div>
                          <div className="progress-wrapper">
                            <div className="progress" style={{width: `${item.infoLeft.percentage}%`}}></div>
                          </div>
                        </>}
                      </div>
                      <div className="function-item-box box-mid">
                        <div className="mid-icon"><img src={item.icon} alt=""/></div>
                        <div className="label">{item.label}</div>
                      </div>
                      <div className="function-item-box box-right">
                        {item.infoRight && <>
                          <div className="label">{item.infoRight.label}</div>
                          <div className="progress-wrapper">
                            <div className="progress" style={{width: `${item.infoRight.percentage}%`}}></div>
                          </div>
                        </>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>}
          </div>
      </div>
    )
  }
}