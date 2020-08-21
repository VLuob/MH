import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Spin, Avatar, Tag, Button, message } from 'antd'
import ReactTooltip from 'react-tooltip'
import moment from 'moment'
import jsCookie from 'js-cookie'
import { toJS } from 'mobx'
import classnames from 'classnames'
import debounce from 'lodash/debounce'

import SiderBox from '@components/widget/common/SiderBox'
import IntroBoxArticle from '@components/author/IntroBoxArticle'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'
import { AuthorType, FollowTypes, ActionType } from '@base/enums'
import { config } from '@utils'
import { user } from '@base/system'

export interface Props {
    
}

export default class AuthorInfo extends Component<Props> {
  constructor(props) {
    super(props)
    // this.handleScrollEvent = debounce(this.handleScrollEvent, 80)
  }
  state = {
    currentUser: {},
  }





  render() {
    const { authorInfo, isLoading, fixed, navHide, isPreview } = this.props
    const { currentUser } = this.state
    const currentAuthor = currentUser.author || {}
    const author = authorInfo
    const articleList = authorInfo.latestCompositions || []
    const isSelf = currentAuthor.code === author.code || author.currentUserOrg



    // console.log('preview author info', toJS(authorInfo))

    return (
      <div className='sider-author-info user-info-box'>
        <div 
          key="userinfobox"
          className={classnames(
            'user-brief-box',
            {fixed: fixed},
          )} 
          style={{top: navHide ? '20px' : '78px'}}
        >
          <IntroBoxArticle 
              hideNetAge
              isSelf={isSelf}
              id={author.id}
              code={author.code}
              authorInfo={author}
              currentUserOrg={author.currentUserOrg}
              createTime={author.gmtCreate}
              avatar={author.avatar}
              name={author.nickname}
              city={author.cityName}
              netAge={author.degree}
              intro={author.signature}
              onFollow={this.authorFollow}
              followed={authorInfo.followed}
              type={Number(author.type)}
              onMessage={this.authorMessage}
              provice={author.provinceName}
              follow={authorInfo['author-fans']}
              article={authorInfo['author-articles']}
              production={authorInfo['author-works']}
              hideFooter
              hideCount
          />
        </div>
       
      </div>
    )
  }
}