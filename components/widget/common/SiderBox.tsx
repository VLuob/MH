import { Component } from 'react'
import classnames from 'classnames'

export interface Props {
  title: string
  moreUrl: string
  hideMore: boolean
  hideTitle: boolean
  customHead: any
}

export default class SiderBox extends Component<Props> {
  render() {
    const { title, moreUrl, hideTitle, hideMore, customHead, className, children } = this.props
    return (
      <div className={classnames('sider-box', className)}>
        <div className='sider-header'>
            {!hideTitle && <span className='sider-title'>{title}</span>}
            {!hideMore && <span className='sider-more'><a href={moreUrl} target='_blank'>查看更多</a></span>}
            {!!customHead && customHead}
        </div>
        <div className='sider-content'>
            {children}
        </div>
    </div>
    )
  }
}