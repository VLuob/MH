import classnames from 'classnames'
import { ServiceStatus } from '@base/enums'

const ServiceFilter = (props) => {
  const { statusData = {}, status, onChange } = props

  const handleChange = (s) => {
    if (onChange && s !== status) {
      onChange(s)
    }
  }

  return (
    <div className="user-filter-box">
      <div className="filter-label">状态</div>
      <div className="filter-list">
        <div
          className={classnames('filter-item', { active: status === ServiceStatus.PASSED })}
          onClick={e => handleChange(ServiceStatus.PASSED)}
        >
          已通过（{statusData.passed}）
        </div>
        <div
          className={classnames('filter-item', { active: status === ServiceStatus.AUDITING })}
          onClick={e => handleChange(ServiceStatus.AUDITING)}
        >
          待审核（{statusData.auditing}）
        </div>
        <div
          className={classnames('filter-item', { active: status === ServiceStatus.REFUSE })}
          onClick={e => handleChange(ServiceStatus.REFUSE)}
        >
          未通过（{statusData.refused}）
        </div>
        <div
          className={classnames('filter-item', { active: status === ServiceStatus.DRAFT })}
          onClick={e => handleChange(ServiceStatus.DRAFT)}
        >
          草稿（{statusData.draft}）
        </div>
      </div>
    </div>
  )
}

export default ServiceFilter