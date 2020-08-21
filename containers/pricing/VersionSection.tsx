import { Button, Icon, Tooltip, Anchor } from 'antd'
import classnames from 'classnames'
import { EditionType } from '@base/enums'
import { Router } from '@routes'

const selectionQuestionTitle = '将被优先推荐至梅花网战略合作企业、甲方供应商库'
const publicQuestionTitle = '发布量指公开作品数量，当公开作品数量超过限额，可以下架其他已公开作品后，继续提交新作品'
const IconQuestionTooltip = ({title}) => (<Tooltip title={title}><Icon type="question-circle" theme="filled" /></Tooltip>)

const VersionSection = (props) => {
  const { current, onSelect } = props

  const freeClick = (e) =>{
    window.open('/creator')
  }

  return (
    <div className="pricing-list">
      <div className={classnames('pricing-box', {active: current === EditionType.FREE})} onClick={freeClick}>
        <div className="pricing-box-title">
          免费版
        </div>
        <div className="pricing-box-money">
          <span className="price-box-money-number">0</span>元/年
        </div>
        <div className="pricing-box-desc">适合个人与小团队</div>
        <div className="pricing-box-btn">
          <Button type="primary" className="light" target="_blank">免费创建</Button>
        </div>
        <div className="pricing-box-cantact">
        </div>
        <div className="pricing-box-detail">
          <div className="pricing-box-detail-item">
            <span className="item-label">作品曝光率</span>
            <span className="item-text">常规算法</span>
          </div>
          <div className="pricing-box-detail-item">
            <span className="item-label">作品发布量<IconQuestionTooltip title={publicQuestionTitle} /></span>
            <span className="item-text">10个/月</span>
          </div>
          <div className="pricing-box-detail-item">
            <span className="item-label">视频播放最高质量</span>
            <span className="item-text">720P</span>
          </div>
        </div>
      </div>
      <div className={classnames('pricing-box', {active: current === EditionType.STANDARD})} onClick={e => onSelect(EditionType.STANDARD)}>
        <div className="pricing-box-title">
          标准版
        </div>
        <div className="pricing-box-money">
          <span className="price-box-money-number">4800</span>元/年
        </div>
        <div className="pricing-box-desc">适合有曝光和推广需求的企业<br/>个人类型创作者购买优惠价<span className="money">2800元</span>/年</div>
        <div className="pricing-box-btn">
          <Button type="primary" href="#form" className={classnames({'light': current !== EditionType.STANDARD})}>升级版本</Button>
        </div>
        <div className="pricing-box-cantact">
        </div>
        <div className="pricing-box-detail">
          <div className="pricing-box-detail-item">
            <span className="item-label">作品曝光率</span>
            <span className="item-text">常规算法加成50%</span>
          </div>
          <div className="pricing-box-detail-item">
            <span className="item-label">梅花网甄选供应商<IconQuestionTooltip title={selectionQuestionTitle} /></span>
            <span className="item-text">优先推荐</span>
          </div>
          <div className="pricing-box-detail-item">
            <span className="item-label">作品发布量<IconQuestionTooltip title={publicQuestionTitle} /></span>
            <span className="item-text">30个/月</span>
          </div>
          <div className="pricing-box-detail-item">
            <span className="item-label">视频播放最高质量</span>
            <span className="item-text">1080P</span>
          </div>
          <div className="pricing-box-detail-item">
            <span className="item-label">作品代发服务</span>
            <span className="item-text">10个/月</span>
          </div>
        </div>
      </div>
      <div className={classnames('pricing-box', {active: current === EditionType.ADVANCED})} onClick={e => onSelect(EditionType.ADVANCED)}>
        <div className="pricing-recommend-tag">推荐版本</div>
        <div className="pricing-box-title">
          高级版
        </div>
        <div className="pricing-box-money">
          <span className="price-box-money-number">7800</span>元/年
        </div>
        <div className="pricing-box-desc">适合有更多曝光和推广需求的企业</div>
        <div className="pricing-box-btn">
          <Button type="primary" className={classnames({'light': current !== EditionType.ADVANCED})}>升级版本</Button>
        </div>
        <div className="pricing-box-cantact">
        </div>
        <div className="pricing-box-detail">
          <div className="pricing-box-detail-item">
            <span className="item-label">作品曝光率</span>
            <span className="item-text">常规算法加成100%</span>
          </div>
          <div className="pricing-box-detail-item">
            <span className="item-label">梅花网甄选供应商<IconQuestionTooltip title={selectionQuestionTitle} /></span>
            <span className="item-text">优先推荐</span>
          </div>
          <div className="pricing-box-detail-item">
            <span className="item-label">作品发布量<IconQuestionTooltip title={publicQuestionTitle} /></span>
            <span className="item-text">不限</span>
          </div>
          <div className="pricing-box-detail-item">
            <span className="item-label">视频播放最高质量</span>
            <span className="item-text">4k</span>
          </div>
          <div className="pricing-box-detail-item">
            <span className="item-label">作品代发服务</span>
            <span className="item-text">30个/月</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VersionSection