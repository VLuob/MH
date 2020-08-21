import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Spin } from 'antd'
import { utils } from '@utils'

import SiderBox from '@components/widget/common/SiderBox'
import ArticleItemSmall from '@components/article/ArticleItemSmall'

export interface Props {
    
}

@inject(stores => {
  const { compositionStore } = stores.store
  const { newArticles } = compositionStore

  return {
      compositionStore,
      newArticles,
  }
})
@observer
export default class NewArticles extends Component<Props> {

  render() {
    const { newArticles } = this.props
    const articleList = newArticles.list
    const isLoading = newArticles.isLoading
    return (
      <SiderBox
        className="new-article-box"
        title="最新文章"
        moreUrl="/article"
    >
      <ul className="side-article-list hot-article">
        {!isLoading && 
          articleList.map((item, index) => (
          <ArticleItemSmall
            key={index}
            id={item.compositionId || item.id}
            title={item.title}
            code={item.authorCode}
            author={item.authorName}
            img={item.cover}
            timeago={utils.timeago(item.gmtPublish)}
          />
        ))}
        {isLoading && <li style={{height: '300px', textAlign: 'center'}}>
             <Spin />
          </li>}
      </ul>
    </SiderBox>
    )
  }
}