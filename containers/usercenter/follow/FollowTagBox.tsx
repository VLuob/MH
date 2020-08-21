import { Component } from 'react'
import { Tag, Icon, Tooltip } from 'antd'
import { TweenOneGroup } from 'rc-tween-one'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import jsCookie from 'js-cookie'

import LoadMore from '@components/common/LoadMore'
import DetailHeader from '@components/author/DetailHeader'

import { FollowTypes } from '@base/enums'
import { config } from '@utils'

let num = 3
@inject(stores => {
    const { followStore } = stores.store
    const { followTagData } = followStore

    return {
      followStore,
      followTagData,
    }
})
@observer
export default class FollowTagBox extends Component {
  componentDidMount() {
    this.requestTags()
  }
  
  requestTags = () => {
      const { followStore } = this.props
      followStore.fetchFollowTags({})
  }

  handleClose = (id) => {
    const { followStore } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    followStore.fetchFollowTag({
      id,
      action: 0,
      type: FollowTypes.TAG,
      token,
      client_code,
    })
  }

  forMap = (tag) => {
      return (
          <span key={tag.id} style={{ display: 'inline-block' }}>
            <span key={tag.id} className="ant-tag ant-tag-has-color" style={{backgroundColor: '#F1F1F1'}}>
              {tag.name} <Tooltip title="点此取消关注"><Icon 
                      type="close" 
                      onClick={e => {
                      e.preventDefault() 
                      this.handleClose(tag.id) 
                      }} /></Tooltip>
            </span>
          </span>
      ) 
  }

  render() {
      const { followTagData } = this.props
      const tagList = followTagData.list || []
      const { total } = followTagData
      const tagChild = tagList.map(this.forMap) 

      return (
          <div className='tag-container'>
              <DetailHeader meta={`共关注了${total}个标签`} />
              <div style={{ marginBottom: 16 }}>
                  <TweenOneGroup
                      enter={{
                          scale: 0.8, opacity: 0, type: 'from', duration: 100,
                          onComplete: (e) => {
                              e.target.style = '' 
                          },
                      }}
                      leave={{ opacity: 0, width: 0, scale: 0, duration: 200 }}
                      appear={false}>
                      {tagChild}
                  </TweenOneGroup>
                  {/* {!isLastPage && <LoadMore name={`加载更多`} num={num}
                      reqList={this.reqTag} />} */}
              </div>
          </div>
      )
  }
}