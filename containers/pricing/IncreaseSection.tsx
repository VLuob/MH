import { Button, Tooltip } from 'antd'
import classnames from 'classnames'
import { AddedServiceType } from '@base/enums'

const IncreaseSection = (props) => {
  const { currentTypes, onSelect, onShotsWebsite } = props
  const selectHomePage = currentTypes.includes(AddedServiceType.HOME_PAGE)
  const selectMiniApp = currentTypes.includes(AddedServiceType.MINI_APP)
  const selectUploadExtend = currentTypes.includes(AddedServiceType.UPLOAD_EXTEND)
  const selectShotsExtend = currentTypes.includes(AddedServiceType.SHOTS_EXTEND)

  const handleShotsWebsite = (e) => {
    e.stopPropagation()
    onShotsWebsite(e)
  }

  return (
    <div className="pricing-list increase">
      <div className={classnames('pricing-box', {active: selectHomePage})}>
        <div className="pricing-box-title">
          独立作品库官网
        </div>
        <div className="pricing-box-money">
          <span className="price-box-money-number">2000</span>元/年
        </div>
        <div className="pricing-box-desc small">标准版、高级版创作者可以购买</div>
        <div className="pricing-box-intro">可移除梅花网相关品牌信息<br/>
        可绑定用户自有独立域名<br/>
        8个可一键配置的独立官网模板<br/>
        支持APP级浏览体验移动端适配</div>
        <div className="pricing-box-btn">
            <Button type="primary" className={classnames({light: !selectHomePage})} onClick={e => onSelect(AddedServiceType.HOME_PAGE)}>购买权益</Button>
        </div>
        <div className="pricing-box-cantact">
          <a onClick={handleShotsWebsite}>试用体验独立官网</a>
        </div>
      </div>
      <div className={classnames('pricing-box', {active: selectMiniApp})}>
        <div className="pricing-box-title">
        独立作品库小程序
        </div>
        <div className="pricing-box-money">
          <span className="price-box-money-number">5000</span>元/年
        </div>
        <div className="pricing-box-desc small">标准版、高级版创作者可以购买</div>
        <div className="pricing-box-intro">去除梅花网品牌信息<br/>
一键制作作品库小程序<br/>
授权绑定客户独立公司信息</div>
        <div className="pricing-box-btn">
          <Tooltip title="该功能即将上线，敬请期待…">
            <Button type="primary" disabled className={classnames({light: !selectMiniApp})} onClick={e => onSelect(AddedServiceType.MINI_APP)}>购买权益</Button>
          </Tooltip>
        </div>
        <div className="pricing-box-cantact">
        </div>
      </div>
      <div className={classnames('pricing-box', {active: selectUploadExtend})} onClick={e => onSelect(AddedServiceType.UPLOAD_EXTEND)}>
        <div className="pricing-box-title">
        支持4K高清视频上传
        </div>
        <div className="pricing-box-money">
          <span className="price-box-money-number">2000</span>元/年
        </div>
        <div className="pricing-box-desc small">标准版创作者可以购买</div>
        <div className="pricing-box-intro">支持最高4K高清画质视频<br/>
上传和播放</div>
        <div className="pricing-box-btn">
          <Button type="primary" className={classnames({light: !selectUploadExtend})}>购买权益</Button>
        </div>
        <div className="pricing-box-cantact">
        </div>
      </div>
      {/* <div className={classnames('pricing-box', {active: selectShotsExtend})} onClick={e => onSelect(AddedServiceType.SHOTS_EXTEND)}>
        <div className="pricing-box-title">
        公开作品量扩容100条
        </div>
        <div className="pricing-box-money">
          <span className="price-box-money-number">2000</span>元/年
        </div>
        <div className="pricing-box-desc small">标准版创作者可以购买</div>
        <div className="pricing-box-intro">公开发布作品数量库容100条</div>
        <div className="pricing-box-btn">
          <Button type="primary" className={classnames({light: !selectShotsExtend})}>购买权益</Button>
        </div>
        <div className="pricing-box-cantact">
        </div>
      </div> */}
    </div>
  )
}

export default IncreaseSection