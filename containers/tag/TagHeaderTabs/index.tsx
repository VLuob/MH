import classnames from 'classnames'

import './index.less'

const TagHeaderTabs = (props) => {
  const { onChange, list=[], type } = props
  const handleTabChange = (key) => {
    if (onChange) onChange(key)
  }
  return (
    <div className="tag-header-tabs">
      {list.map(item => (
        <div key={item.key} className={classnames('tag-header-tab', {active: type === item.key})} onClick={e => handleTabChange(item.key)}>{item.name}</div>
      ))}
    </div>
  )
}

export default TagHeaderTabs