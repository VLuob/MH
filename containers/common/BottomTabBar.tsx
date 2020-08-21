
import classnames from 'classnames'

import CustomIcon from '@components/widget/common/Icon'

import './BottomTabBar.less'

const tabs = [
  {key: 'home', name: '首页', icon: 'tab-home', url: '/'},
  {key: 'shots', name: '作品', icon: 'tab-shots', url: '/shots'},
  {key: 'article', name: '文章', icon: 'tab-article', url: '/article'},
  {key: 'discover', name: '发现', icon: 'tab-discover', url: '/discover'},
  // {key: 'user', name: '我的', icon: 'tab-user', url: '/user'},
]

const BottomTabBar = (props) => {
  const { asPath='', currentPath='home', onClick, onRefresh } = props    
  let routerPath
  if (currentPath) {
    routerPath = currentPath
  } else {
    const paramIndex = asPath.indexOf('?')
    const paramLength = paramIndex > 0 ? paramIndex : asPath.length
    const currPath = asPath.substring(0, paramLength)
    if (['/discover', '/author', '/topics','/top','/collection', '/pricing'].some(v => currPath.indexOf(v) >= 0)) {
      routerPath = 'discover'
    } else if (currPath === '/') {
      routerPath = 'home'
    } else {
      const path = tabs.find(l => l.url !== '/' && currPath.indexOf(l.url) >= 0)
      routerPath = path ? path.key : ''
    }
  }

  const handleClick = (record) => {
    const isCurrent = record.key === routerPath
    if (isCurrent && onRefresh) {
      onRefresh()
    }
  }
  
  return (
    <div className="bottom-tab-bar">
      <ul className="bottom-tabs">
          {tabs.map(item => {
            const isCurrent = routerPath === item.key
            return (
              <li className={classnames('tab-item', {active: isCurrent})} key={item.key}>
                <a href={isCurrent ? null : item.url} onClick={e => handleClick(item)}>
                  <div className="tab-icon">
                    <CustomIcon name={item.icon} />
                  </div>
                  <div className="name">{item.name}</div>
                </a>
              </li>
            )
          })}
      </ul>
    </div>
  )
}

export default BottomTabBar