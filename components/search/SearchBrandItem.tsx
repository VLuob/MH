import { Component } from 'react'
import { Icon, Tooltip } from 'antd'
import { utils } from '@utils';
import classnames from 'classnames'
import CIcon from '@components/widget/common/Icon'

export interface Props {
  id: number|string
}

export default class SearchBrandItem extends Component<Props> {
  render() {
    const { 
        id,
        icon,
        name,
        url,
        followed,
        articleCount,
        shotsCount,
        onFollow,
    } = this.props

    return (
      <div className='search-brand-item'>
        <div className="content">
          <CIcon name={icon || 'brand'} />
          <a className="name" href={url} target="_blank">
          {name}
          </a>
          <span className={classnames('follow', {followed: followed})} onClick={e => onFollow(id, Number(!followed))}>
            {followed ? '已关注' : '+ 关注'}
          </span>
        </div>
        <div className="stat">
          <div className="stat-item">
            <span className="stat-name">作品</span>
            <span className="stat-count">{shotsCount || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-name">文章</span>
            <span className="stat-count">{articleCount || 0}</span>
          </div>
        </div>
      </div>
    )
  }
}