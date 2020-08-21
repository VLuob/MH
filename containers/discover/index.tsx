

import CustomIcon from '@components/widget/common/Icon'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'
import BottomTabBar from '@containers/common/BottomTabBar'

import './index.less'

const discoverList = [
  { key: 'author', name: '创作者', icon: 'author', url: '/author' },
  { key: 'enquiry', name: '询价', icon: 'enquiry', url: '/enquiry' },
  { key: 'divider' },
  { key: 'topics', name: '专题', icon: 'topic', url: '/topics' },
  { key: 'top', name: '榜单', icon: 'top', url: '/top' },
  { key: 'collection', name: '收藏夹', icon: 'favorites', url: '/collection' },
]

const DiscoverContainer = (props) => {

  return (
    <>
      <MbNavigatorBar hideBackBtn showTitle title="发现" />
      <div className="discover-container">
        <ul className="discover-list">
          {discoverList.map((item, index) => {
            if (item.key == 'divider') {
              return (<li className="discover-item divider" key={item.key + index}></li>)
            } else {
              return (
                <li className="discover-item" key={item.key}>
                  <a href={item.url}>
                    <span className="icon"><CustomIcon name={item.icon} /></span>
                    <span className="name">{item.name}</span>
                    <span className="arrow"><CustomIcon name="arrow-right-o" /></span>
                  </a>
                </li>
              )
            }
          })}
        </ul>
      </div>
      <BottomTabBar currentPath="discover" />
    </>
  )
}

export default DiscoverContainer