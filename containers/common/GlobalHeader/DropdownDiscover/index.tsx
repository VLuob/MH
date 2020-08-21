import { Dropdown, Spin } from 'antd'
import CustomIcon from '@components/widget/common/Icon'
import filters from '@base/system/filters'
import './index.less'

const classifyIconMap = filters.classifyIconMap

const DropdownDiscover = (props) => {
  const { forms=[], formLoading, requestForms } = props
  return (
    <Dropdown 
    placement="bottomLeft"
      onVisibleChange={(visible) => {
        if (visible && requestForms) {
          requestForms()
        }
      }}
      overlay={<div className="header-discover-overlay">
        <div className="overlay-section">
          <div className="label">形式</div>
          <div className="content">
            {formLoading && <div className="loading"><Spin /></div>}
            {!formLoading && <ul className="form-list">
              {forms.map(item => {
                const settings = JSON.parse(item.settings || '{}')
                return (
                  <li key={item.id}>
                    <a href={`/shots!0!0!${item.code}!0!0`}>
                      <div className="form-icon">
                        <CustomIcon name={settings.icon || classifyIconMap[item.name] || 'classification'} />
                      </div>
                      <div className="form-name">
                        {item.name}
                      </div>
                    </a>
                  </li>
                )
              })}
            </ul>}
          </div>
        </div>
        <div className="overlay-section channel-section">
          <div className="label">频道</div>
          <div className="content">
            <ul className="channel-list">
              <li>
                <a href="/shots">
                  <div className="channel-icon shots">
                    <CustomIcon name="shots-publish" />
                  </div>
                  <div className="channel-name">
                    作品
                  </div>
                </a>
              </li>
              <li>
                <a href="/author">
                  <div className="channel-icon author">
                    <CustomIcon name="author" />
                  </div>
                  <div className="channel-name">
                    创作者
                  </div>
                </a>
              </li>
              <li>
                <a href="/enquiry">
                  <div className="channel-icon enquiry">
                    <CustomIcon name="enquiry" />
                  </div>
                  <div className="channel-name">
                    询价
                  </div>
                </a>
              </li>
              <li>
                <a href="/article">
                  <div className="channel-icon article">
                    <CustomIcon name="article-publish" />
                  </div>
                  <div className="channel-name">
                    文章
                  </div>
                </a>
              </li>
              <li className="divider"></li>
              <li>
                <a href="/top">
                  <div className="channel-icon top">
                    <CustomIcon name="statistics" />
                  </div>
                  <div className="channel-name">
                    榜单
                  </div>
                </a>
              </li>
              <li>
                <a href="/collection">
                  <div className="channel-icon collection">
                    <CustomIcon name="favorites" />
                  </div>
                  <div className="channel-name">
                    收藏夹
                  </div>
                </a>
              </li>
              <li>
                <a href="/topic">
                  <div className="channel-icon topic">
                    <CustomIcon name="topic" />
                  </div>
                  <div className="channel-name">
                    专题
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>}
    >
      <a><CustomIcon name="discover" />发现</a>
    </Dropdown>
  )
}

export default DropdownDiscover