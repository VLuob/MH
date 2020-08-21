import React, { Component } from 'react'
import moment from 'moment'
import classnames from 'classnames'
import { Tooltip } from 'antd'
import LazyLoad from '@static/js/LazyLoad'
import AuthorPopupBox from '@containers/author/AuthorPopupBox'

const emptyImage = '/static/images/common/full-empty.png'

export interface Props {
  id: number|string
  img: string 
  code: string
  title: string 
  author: string 
  time: number|string,
  timeago: string
}

class ArticleItemSmall extends Component<Props> {
  isInPopup = false
  isPopupLoaded =false

  state = {
      showPopup: false,
  }

  handleAvatarMouseEnter = e => {
      // const avatarImg = this.avatarRef.refs.img
      // const avatarRect = avatarImg.getBoundingClientRect()
  if (this.avatarTimer) clearTimeout(this.avatarTimer)
      this.setState({showPopup: true})
  }

  handleAvatarMouseLeave = e => {
      this.closePopup()
  }

  closePopup() {
      if (this.avatarTimer) clearTimeout(this.avatarTimer)

      this.avatarTimer = setTimeout(() => {
          if (!this.isInPopup) {
              this.setState({showPopup: false})
          }
      }, 200)
  }

  handlePopupMouseOver = e => {
      this.isInPopup = true
  }

  handlePopupMouseOut = e => {
      this.isInPopup = false
      this.closePopup()
  }

  handlePopupLoad = (state) => {
      this.isPopupLoaded = state
  }

  render()  {
    const {
      id,
      img,
      code,
      title,
      author,
      time,
      timeago
    } = this.props
    const { showPopup } = this.state

    return (
      <li className='article-item-small clearfix'>
          <div className='left mode-lbox'>
            <a href={`/article/${id}`} target='_blank' title={title}>
              {/* <img src={img} /> */}
              <LazyLoad offsetVertical={300} loaderImage
                  className="image-lazy-load"
                  originalSrc={`${img}?imageMogr2/thumbnail/!560x400r/size-limit/50k/gravity/center/crop/560x400`}
                  imageProps={{
                      src: emptyImage,
                      ref: 'image',
                      className: 'box-img',
                      alt: title,
                  }} />
            </a>
          </div>
          <div className='mode-rbox'>
              <h4><a className='multi-ellipsis' href={`/article/${id}`} target='_blank'><Tooltip title={title}>{title}</Tooltip></a></h4>
              <div className='footer-bar'>
                  <span className='author'>
                    <a 
                      href={`/author/${code}`} 
                      target='_blank'
                      onMouseEnter={this.handleAvatarMouseEnter}
                      onMouseLeave={this.handleAvatarMouseLeave}
                    >
                      {author}
                    </a>
                    <div 
                        className={classnames('author-popup', {show: showPopup})}
                        onMouseOver={this.handlePopupMouseOver}
                        onMouseOut={this.handlePopupMouseOut}
                    >
                        {(showPopup || this.isPopupLoaded) &&
                        <AuthorPopupBox
                            code={code}
                            onLoad={this.handlePopupLoad}
                        />}
                    </div>
                  </span>
                  {author && (time || timeago) && <span className='dot'> · </span>}
                  {!timeago && <span className='time'>{moment(time).format('YYYY-MM-DD')}</span>}
                  {timeago && <span className='time'><Tooltip title={`发布时间：${moment(time).format('YYYY-MM-DD HH:mm:ss')}`}>{timeago}</Tooltip></span>}
              </div>
          </div>
      </li>
    )
  }
} 

export default ArticleItemSmall