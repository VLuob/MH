import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'
import { Tabs } from 'antd'
import jsCookie from 'js-cookie'
import { Router } from '@routes'

import { CompositionType, CreationType, CreationShowType } from '@base/enums'
import PartLoading from '@components/features/PartLoading'

import { utils, config } from '@utils'

const InsShotsContainerWithNoSSR = dynamic(() => import('./InsShotsContainer'), { loading: () => <PartLoading />, ssr: false })
const InsArticleContainerWithNoSSR = dynamic(() => import('./InsArticleContainer'), { loading: () => <PartLoading />, ssr: false })

const { TabPane } = Tabs

let insCreationParam = {}
let insArticleParam = {}

@inject(stores => {
  const { userCenterStore } = stores.store
  const {
    commonAuthor,
    resetCreateKeys,
    fetchGetCreationStat,
    createCompositionParam,
    fetchGetSettingComposition,
  } = userCenterStore
  return {
    commonAuthor,
    resetCreateKeys,
    fetchGetCreationStat,
    createCompositionParam,
    fetchGetSettingComposition,
  }
})
@observer
export default class CompositionContainer extends Component {
  state = {
    statStatus: 0,
    showStatus: 0,
    statArticleStatus: 0,
    showArticleStatus: 0,
  }

  componentDidMount() {
    const { query } = this.props
    this.insCreateChangeTabs(query.type, true)
  }

  // 机构创作
  insCreateChangeTabs = (key, boolean) => {
    const { query, commonAuthor, createArticleParam, fetchGetCreationStat, createCompositionParam, fetchGetSettingComposition } = this.props
    const insStatus = Number(utils.getUrlParam(`status`)) > 3 ? 0 : Number(utils.getUrlParam(`status`)) || 0
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const { id, } = query
    let currentKey = 0

    switch (Number(insStatus)) {
      case 1:
        currentKey = 2

        break
      case 2:
        currentKey = 5

        break
      case 3:
        currentKey = 1

        break
      case 0:
      default:
        currentKey = 3

        break
    }

    switch (key) {
      case 'article':
        if (!boolean) {
          this.setInsArticleStatStatus(0)
          insArticleParam = { type: 0, composition_type: CompositionType.ARTICLE, status: CreationType.PASS, org_id: commonAuthor.authorId, ...createArticleParam, page: 1 }
        } else {
          this.setInsArticleStatStatus(insStatus)
          insArticleParam = { type: 0, composition_type: CompositionType.ARTICLE, status: currentKey || CreationType.PASS, org_id: commonAuthor.authorId, ...createArticleParam, page: 1 }
        }

        this.setInsArticleShowStatus(0)
        fetchGetCreationStat({ token, composition_type: CompositionType.ARTICLE, org_id: commonAuthor.authorId })
        fetchGetSettingComposition(insArticleParam)

        break
      case 'shots':
      default:
        if (!boolean) {
          this.setInsStatStatus(0)
          insCreationParam = { type: 0, composition_type: CompositionType.COMPOSITION, ...createCompositionParam, status: CreationType.PASS, published: CreationShowType.SHOW, org_id: commonAuthor.authorId, page: 1 }
        } else {
          this.setInsStatStatus(insStatus)
          insCreationParam = { type: 0, composition_type: CompositionType.COMPOSITION, ...createCompositionParam, status: currentKey || CreationType.PASS, published: CreationShowType.SHOW, org_id: commonAuthor.authorId, page: 1 }
        }

        this.setInsShowStatus(0)

        fetchGetCreationStat({ token, composition_type: CompositionType.COMPOSITION, org_id: commonAuthor.authorId })
        fetchGetSettingComposition(insCreationParam)

        break
    }

    const keys = key || `shots`

    if (!boolean) {
      Router.pushRoute(`/teams/${id}/creation?type=${keys}&status=0`)
    } else {
      const status = Number(utils.getUrlParam(`status`)) > 3 ? 0 : Number(utils.getUrlParam(`status`)) || 0

      Router.pushRoute(`/teams/${id}/creation?type=${keys}&status=${status}`)
    }
  }

  setInsStatStatus = key => {
    this.setState({ insStatStatus: key })
  }

  setInsShowStatus = key => {
    this.setState({ insShowStatus: key })
  }

  setInsArticleStatStatus = key => {
    this.setState({ insArticleStatStatus: key })
  }

  setInsArticleShowStatus = key => {
    this.setState({ insArticleShowStatus: key })
  }

  render() {
    const { insStatStatus, insShowStatus, insArticleStatStatus, insArticleShowStatus } = this.state
    const { query, commonAuthor } = this.props

    return (
      <div className='common-container'>
        <Tabs className='user-tabs' size='large' defaultActiveKey="shots" activeKey={query.type} animated={false} onChange={this.insCreateChangeTabs}>
          <TabPane tab='作品' key='shots'>
            <InsShotsContainerWithNoSSR
              query={query}
              currentAuthor={commonAuthor}
              insStatStatus={insStatStatus}
              insShowStatus={insShowStatus}
              insCreationParam={insCreationParam}
              setInsStatStatus={this.setInsStatStatus}
              setInsShowStatus={this.setInsShowStatus}
            />
          </TabPane>
          <TabPane tab='文章' key='article'>
            <InsArticleContainerWithNoSSR
              query={query}
              currentAuthor={commonAuthor}
              insArticleParam={insArticleParam}
              insArticleStatStatus={insArticleStatStatus}
              insArticleShowStatus={insArticleShowStatus}
              setInsArticleStatStatus={this.setInsArticleStatStatus}
              setInsArticleShowStatus={this.setInsArticleShowStatus}
            />
          </TabPane>
        </Tabs>
      </div>
    )
  }
}