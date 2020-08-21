import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Radio, Spin } from 'antd'
import { utils } from '@utils'

import { HotTypes } from '@base/enums'
import SiderBox from '@components/widget/common/SiderBox'
import ArticleItemSmall from '@components/article/ArticleItemSmall'

export interface Props {
    
}

const RadioGroup = Radio.Group

const hotTypeMap = {
  1: 'week',
  2: 'month',
}

@inject(stores => {
  const { compositionStore } = stores.store
  const { hotArticles } = compositionStore

  return {
      compositionStore,
      hotArticles,
  }
})
@observer
export default class HotArticles extends Component<Props> {
  state = {
      type: HotTypes.WEEK,
  }

  handleTypeChange = (e) => {
    const { hotArticles, compositionStore } = this.props
    const type = e.target.value
    this.setState({type})
    if (hotArticles[`${hotTypeMap[type]}List`].length === 0) {
      compositionStore.fetchHotArticles({type})
    }
  }

  render() {
    const { hotArticles } = this.props
    const { type } = this.state
    const articleList = hotArticles[`${hotTypeMap[type]}List`]
    const isLoading = hotArticles.isLoading

    return (
      <SiderBox
        title="热门文章"
        hideMore
        customHead={
        <span className="hot-head-tab">
            <RadioGroup defaultValue={HotTypes.WEEK} buttonStyle="solid" size="small" onChange={this.handleTypeChange}>
                <Radio.Button value={HotTypes.WEEK}>周</Radio.Button>
                <Radio.Button value={HotTypes.MONTH}>月</Radio.Button>
            </RadioGroup>
        </span>}
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