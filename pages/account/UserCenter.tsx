import { Component } from 'react'
import { CompositionType } from '@base/enums'
import { inject, observer } from 'mobx-react'
import jsHttpCookie from 'cookie'
import { utils, config } from '@utils'
import { toJS } from 'mobx'
import axios from 'axios'
import qs from 'qs'

import { MineType, TeamMenuType } from '@base/enums'

import UserLayout from '@containers/layout/UserLayout'
import HeadComponent from '@components/common/HeadComponent'
import UserCenterSider from '@containers/usercenter/UserCenterSider'
import UserCenterContent from '@containers/usercenter/UserCenterContent'


const userMenuMap = {
  [MineType.CREATION]: '我的创作',
  [MineType.FOLLOW]: '我的关注',
  [MineType.COLLECTION]: '我的收藏',
  [MineType.FAVOR]: '我的喜欢',
  [MineType.MESSAGE]: '我的消息',
  [MineType.LETTER]: '我的询价',
  [MineType.ORDER]: '我的订单',
  [MineType.INSTITUTION]: '管理创作者',
  [MineType.DATAANDACCOUNT]: '资料与账户',
  [MineType.SUBSCRIPTION]: '邮件订阅',
}

interface Props {
  query: any,
}

interface State {

}

@inject(stores => {
  const { globalStore, userCenterStore } = stores.store
  const {  updateGlobalTitle } = globalStore
  const { curClientUserInfo, updateCurUserInfo, updateCreationStat } = userCenterStore

  return {
    curClientUserInfo,
    updateCurUserInfo,
    updateGlobalTitle,
    updateCreationStat,
  }
})
@observer
export default class UserCenter extends Component<Props, State> {
  static async getInitialProps(appContext) {
    const { store, asPath, isServer, query, req, res, mobxStore } = appContext
    const { accountStore, globalStore, userCenterStore } = mobxStore
    const { userInfo } = accountStore
    const { serverClientCode } = globalStore
    const { fetchGetSettingCommon, fetchGetCreationStat } = userCenterStore
    const { id, menu, tab } = query

    let creationProp = {}
    let curUserInfo = userInfo
    let resultStat

    if (req && req.headers) {
      const host = req.headers.host
      const cookies = req.headers.cookie
      let token
      let client_code = serverClientCode

      if (typeof cookies === 'string') {
        token = jsHttpCookie.parse(cookies)[config.COOKIE_MEIHUA_TOKEN]
      }

      // 未登录用户和错误的token，跳转到登录页面
      if (!token || (userInfo.code === 'E100000' && (userInfo.msg || '').toUpperCase() === 'ERROR TOKEN')) {
        res.writeHead(307, { Location: `/signin?c=${asPath}` })
        res.end()
        return
      }

      if (curUserInfo.authorId) {
        // 获取个人中心作者信息
        const params = { host, token, org_id: curUserInfo.authorId }
        const infoResult = await fetchGetSettingCommon(params)
        if (infoResult.success) {
          const info = infoResult.data || {}
          curUserInfo = { ...curUserInfo, ...info, nickname: info.nickname || curUserInfo.nickName }

          const statResult = await fetchGetCreationStat({ host, token, org_id: userInfo.authorId, composition_type: CompositionType.COMPOSITION })
          resultStat = statResult.success ? statResult.data : {}
        } else if (infoResult.data.code === 'E100009') {
          res.writeHead(307, { Location: '/' })
          res.end()
        }
      }
    }

    const path = utils.GetRequest(asPath)

    creationProp = {
      resultStat,
      pathType: path.type
    }

    return { query, asPath, userInfo, creationProp, curUserInfo }
  }

  handlePageTitle() {
    const { query } = this.props
    const { id, menu } = query
    let title = `${userMenuMap[menu] || userMenuMap[MineType.FOLLOW]}-个人中心-梅花网`
    return title
  }

  render() {
    const { asPath, query, userInfo, curUserInfo, creationProp, curClientUserInfo } = this.props
    const curUserInfos = curClientUserInfo || curUserInfo || {}
    const pageTitle = this.handlePageTitle()
    // console.log('user center', toJS(curClientUserInfo), toJS(curUserInfo))

    return (
      <>
        <HeadComponent title={`${pageTitle}`} />
        <UserLayout
          query={query}
          userCenterInfo={curUserInfos}
          // bgEditable={true}
          sider={
            <UserCenterSider
              query={query}
              userCenterInfo={curUserInfos}
            />
          }
        >
          <UserCenterContent
            query={query}
            path={creationProp.pathType}
            asPath={asPath}
            userCenterInfo={curUserInfos}
            creationProp={creationProp}
          />
        </UserLayout>
      </>
    )
  }
}