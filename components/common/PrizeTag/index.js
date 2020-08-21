import classnames from 'classnames'
import { Tooltip } from 'antd'
import './index.less'

const iconPrize = '/static/images/icon/icon_prize.svg'

const PrizeTag = (props) => {
  const { url, logo, text, className, tooltip } = props
  return (
    <div className={classnames('prize-tag-wrapper', className)}>
      <a href={url ? url : null} target="_blank">
        <Tooltip title={tooltip || ''}>
          <div className="prize-tag">
            <div className="prize-logo">
              {logo || <img src={iconPrize} />}
            </div>
            <div className="prize-text">
              {text || ''}
            </div>
          </div>
        </Tooltip>
      </a>
    </div>
  )
}

export default PrizeTag