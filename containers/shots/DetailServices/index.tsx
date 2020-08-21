
import { Tooltip } from 'antd'
import './index.less'

const DetailServices = (props) => {
  const { services=[] } = props
  return (
    <div className="shots-detail-service">
      {services.map(item => {
        const jumpUrl = `/service/${item.id}`
        return (
          <div className="shots-service-item" key={item.id}>
            <div className="service-cover">
              <a href={jumpUrl} target="_blank" title={item.name}><img src={item.cover} alt={item.name} title={item.name} /></a>
              <Tooltip title={`创意形式：${item.formName}`}>
                <span className="form-tag">{item.formName}</span>
              </Tooltip>
            </div>
            <div className="service-info">
              <div className="service-name">
                <Tooltip title={`服务名称：${item.name}`}>
                  <a href={jumpUrl} target="_blank" title={item.name}>{item.name}</a>
                </Tooltip>
              </div>
              <div className="service-price">
                中位价≈ {item.minPrice}元
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default DetailServices