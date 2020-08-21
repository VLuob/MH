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

const MyProductionContainerWithNoSSR = dynamic(() => import('./MyProductionContainer'), {loading: () => <PartLoading />, ssr: false})
const MyArticleContainerWithNoSSR = dynamic(() => import('./MyArticleContainer'), {loading: () => <PartLoading />, ssr: false})

const { TabPane } = Tabs

let boolean = false
let myCreationParam = {}
let myArticleParam = {}

@inject(stores => {
  const { userCenterStore } = stores.store
  const {
    resetCreateKeys, 
    fetchGetCreationStat,
    createCompositionParam, 
    fetchGetSettingComposition,  
  } = userCenterStore
  return {
    
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
    this.myChangeTabs(query.type, true)
  }

  // 我的创作切换
  myChangeTabs = (key, boolean) => {
    const { 
        userCenterInfo,
        resetCreateKeys, 
        fetchGetCreationStat,
        createCompositionParam, 
        fetchGetSettingComposition, 
    } = this.props
    const myStatus = Number(utils.getUrlParam(`status`)) > 3 ? 0 : Number(utils.getUrlParam(`status`)) || 0
    let currentKey = 0
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)

    switch(Number(myStatus)) {
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

    resetCreateKeys()
    switch(key) {
      case 'article': 
          this.setShowArticleStatus(0)
          if(!boolean) {
              this.setStatArticleStatus(0)
              myArticleParam = { composition_type: CompositionType.ARTICLE, status: CreationType.PASS, published: CreationShowType.SHOW, ...createCompositionParam, org_id: userCenterInfo.authorId, page: 1 }
          } else {
              this.setStatArticleStatus(myStatus)
              myArticleParam = { composition_type: CompositionType.ARTICLE, status: currentKey || CreationType.PASS, published: CreationShowType.SHOW, ...createCompositionParam, org_id: userCenterInfo.authorId, page: 1 }
          }

          fetchGetCreationStat({ token, composition_type: CompositionType.ARTICLE, org_id: userCenterInfo.authorId })
          
          fetchGetSettingComposition(myArticleParam)

          break
      case 'shots':
      default:
          if(!boolean) {
              this.setStatStatus(0)
              myCreationParam = { composition_type: CompositionType.COMPOSITION, status: CreationType.PASS, published: CreationShowType.SHOW, ...createCompositionParam, org_id: userCenterInfo.authorId, page: 1 }
          } else {
              this.setStatStatus(myStatus)
              myCreationParam = { composition_type: CompositionType.COMPOSITION, status: currentKey || CreationType.PASS, published: CreationShowType.SHOW, ...createCompositionParam, org_id: userCenterInfo.authorId, page: 1 }
          }
          this.setShowStatus(0)

          fetchGetCreationStat({ token, composition_type: CompositionType.COMPOSITION, org_id: userCenterInfo.authorId })
          fetchGetSettingComposition(myCreationParam)
          
          break
    }

    const keys = key || `shots`
    if(!boolean) {
        Router.pushRoute(`/personal/creation?type=${keys}&status=0`)
    } else {
        const status = Number(utils.getUrlParam(`status`)) > 3 ? 0 : Number(utils.getUrlParam(`status`)) || 0

        Router.pushRoute(`/personal/creation?type=${keys}&status=${status}`)
    }
  }

  setStatStatus = key => {
    const {  } = this.props
    
    this.setState({ statStatus: key })
  }

  setShowStatus = key => {
    this.setState({ showStatus: key })
  }

  setStatArticleStatus = key => {
    this.setState({ statArticleStatus: key })
  }

  setShowArticleStatus = key => {
      this.setState({ showArticleStatus: key })
  }

  render() {
    const { statStatus,  showStatus, statArticleStatus, showArticleStatus, } = this.state
    const { path, query, userCenterInfo, creationProp } = this.props

    return (
      <div className='common-container'> 
        {/* <div className='new-folder'><Icon type='plus' /> 新建专辑</div> */}
        <Tabs className='user-tabs' size='large' activeKey={path} animated={false} onChange={this.myChangeTabs}>
            <TabPane tab='我的作品' key='shots'>
                <MyProductionContainerWithNoSSR 
                    query={query}
                    boolean={boolean}
                    statStatus={statStatus}
                    showStatus={showStatus} 
                    creationProp={creationProp}
                    userCenterInfo={userCenterInfo}
                    myCreationParam={myCreationParam} 
                    setStatStatus={this.setStatStatus} 
                    setShowStatus={this.setShowStatus} 
                />
            </TabPane>
            <TabPane tab='我的文章' key='article'>
                <MyArticleContainerWithNoSSR 
                    query={query}
                    boolean={boolean}
                    creationProp={creationProp}
                    userCenterInfo={userCenterInfo}
                    myArticleParam={myArticleParam}
                    statArticleStatus={statArticleStatus} 
                    showArticleStatus={showArticleStatus} 
                    setStatArticleStatus={this.setStatArticleStatus} 
                    setShowArticleStatus={this.setShowArticleStatus} 
                />
            </TabPane>
        </Tabs>
      </div>
    )
  }
}