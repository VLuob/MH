import classnames from 'classnames'
import { PublicEnquiryStatus } from '@base/enums'

const PublicEnquiryFilter = (props) => {
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
          className={classnames('filter-item', { active: status === PublicEnquiryStatus.PASSED })}
          onClick={e => handleChange(PublicEnquiryStatus.PASSED)}
        >
          已通过（{statusData.passed}）
        </div>
        <div
          className={classnames('filter-item', { active: status === PublicEnquiryStatus.AUDITING })}
          onClick={e => handleChange(PublicEnquiryStatus.AUDITING)}
        >
          待审核（{statusData.auditing}）
        </div>
        <div
          className={classnames('filter-item', { active: status === PublicEnquiryStatus.REFUSE })}
          onClick={e => handleChange(PublicEnquiryStatus.REFUSE)}
        >
          未通过（{statusData.refused}）
        </div>
      </div>
    </div>
  )
}

export default PublicEnquiryFilter