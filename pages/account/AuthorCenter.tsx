import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import jsHttpCookie from 'cookie'
import {parseCookies} from 'nookies'
import { utils, config } from '@utils'
import { toJS } from 'mobx'

import { MineType, TeamMenuType } from '@base/enums'
import UserLayout from '@containers/layout/UserLayout'
import HeadComponent from '@components/common/HeadComponent'
import AuthorCenterSider from '@containers/usercenter/AuthorCenterSider'
import AuthorCenterContent from '@containers/usercenter/AuthorCenterContent'

const authorMenuMap = {
  [TeamMenuType.CREATION]: '创作管理',
  [TeamMenuType.SERVICE]: '服务管理',
  [TeamMenuType.STATISTICS]: '创作统计',
  [TeamMenuType.MEMBER]: '成员管理',
  [TeamMenuType.DATA]: '资料与账户',
}

interface Props {
  query: any,
}

interface State {

}

@inject(stores => {
  const { userCenterStore } = stores.store
  const { curClientUserInfo, commonAuthor } = userCenterStore

  return {
    curClientUserInfo,
    commonAuthor,
  }
})
@observer
export default class AuthorCenter extends Component<Props, State> {
  static async getInitialProps(appContext) {
    const { asPath, query, req, res, mobxStore } = appContext
    const { accountStore, userCenterStore } = mobxStore
    const { currentUser } = accountStore
    const { fetchGetSettingCommon } = userCenterStore
    const { id, menu, tab } = query

    if (req && req.headers) {
      let token = parseCookies(appContext)[config.COOKIE_MEIHUA_TOKEN]

      // 未登录用户和错误的token，跳转到登录页面
      if (!token || (currentUser.code === 'E100000' && (currentUser.msg || '').toUpperCase() === 'ERROR TOKEN')) {
        res.writeHead(307, { Location: `/signin?c=${asPath}` })
        res.end()
        return
      }

      const params = { token, org_id: id }
      const commonResult = await fetchGetSettingCommon(params)
      // 无权访问
      if (!commonResult.success && commonResult.data.code === 'E100009') {
        res.writeHead(307, { Location: '/' })
        res.end()
      }
    }

    return { query }
  }

  handlePageTitle() {
    const { query } = this.props
    const { id, menu } = query
    let title = `${authorMenuMap[menu] || authorMenuMap[TeamMenuType.CREATION]}-创作者管理中心-梅花网`
    return title
  }

  render() {
    const { query, commonAuthor } = this.props
    const pageTitle = this.handlePageTitle()

    return (
      <>
        <HeadComponent title={`${pageTitle}`} />
        <UserLayout
          query={query}
          userCenterInfo={commonAuthor}
          // bgEditable={true}
          sider={
            <AuthorCenterSider
              query={query}
            />
          }
        >
          <AuthorCenterContent
            query={query}
          />
        </UserLayout>
      </>
    )
  }
}