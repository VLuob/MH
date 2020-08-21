import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { message } from 'antd'
import jsCookie from 'js-cookie'
import { toJS } from 'mobx'
import { FocusType } from '@base/enums'

import basic from '@base/system/basic'

import { config } from '@utils'
import SiderBox from '@components/widget/common/SiderBox'
import AuthorItemSmall from '@components/author/AuthorItemSmall'

const token = basic.token

export interface Props {
    
}

@inject(stores => {
  const { authorStore } = stores.store
  const { authorRecommendeds } = authorStore

  return {
      authorStore,
      authorRecommendeds,
  }
})
@observer
export default class RecommendAuthors extends Component<Props> {

  handleFollow = (item, action) => {
    const { authorStore } = this.props
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)

    if(token) {
      authorStore.fetchActionFollow({ token, client_code, id: item.id, type: FocusType.AUTHOR, action })
    } else {
        message.destroy()
        message.warning(`请登录后查看`)

        setTimeout(() => {
            window.location.href = `/signin?c=${encodeURIComponent(window.location.pathname)}`
        }, 2000)
    }
  }

  render() {
    const { authorRecommendeds } = this.props
    const authors = authorRecommendeds || []

    return (
      <SiderBox
          title={'推荐创作者'}
          moreUrl="/author"
      >
          <ul className="sider-author-list">
            {authors && authors.map((item, i) => (
              <AuthorItemSmall
                item={item}
                key={i}
                type={item.type}
                avatar={item.avatar}
                title={item.nickname}
                authorCode={item.code}
                article={item.signature}
                followed={item.followed}
                onFollow={action => this.handleFollow(item, action)}
              />
            ))}
          </ul>
      </SiderBox>
    )
  }
}