import { Component } from 'react'
import dynamic from 'next/dynamic'
import { inject, observer } from 'mobx-react'
import { Layout } from 'antd'
import { toJS } from 'mobx'
import isEqual from 'lodash/isEqual'
import { utils } from '@utils'

import { AuthorType } from '@base/enums'

// import BannersModify from '@containers/usercenter/common/BannersModify'

const BannersModify = dynamic(() => import('@containers/usercenter/common/BannersModify'), { ssr: false, loading: () => <span></span> })
const AuthorBannerModify = dynamic(() => import('@containers/usercenter/common/AuthorBannerModify'), { ssr: false, loading: () => <span></span> })

const { Content, Sider } = Layout

const defaultBanners = [
  'https://resource.meihua.info/meihua_author_banner_sys_default.jpg',
  'https://resource.meihua.info/meihua_author_banner_sys_1.jpg',
  'https://resource.meihua.info/meihua_author_banner_sys_2.jpg',
  'https://resource.meihua.info/meihua_author_banner_sys_3.jpg',
  'https://resource.meihua.info/meihua_author_banner_sys_4.jpg',
  'https://resource.meihua.info/meihua_author_banner_sys_5.jpg',
]

export interface Props {
  banner: any,
  sider: any,
  content: any,
}

@inject(stores => {
  const { accountStore, authorStore, userCenterStore, globalStore } = stores.store
  const { isMobileScreen } = globalStore
  const { authorInfos, briefInfo } = authorStore
  const { currentUser, userClientInfo } = accountStore
  const { fetchUploadImg, perSettingData, insSettingData, personBaseInfo, insBaseInfo } = userCenterStore

  return {
    isMobileScreen,
    currentUser,
    authorInfos,
    briefInfo,
    userClientInfo,
    fetchUploadImg,
    perSettingData,
    insSettingData,
    personBaseInfo,
    insBaseInfo,
  }
})
@observer
export default class UserLayout extends Component<Props> {

  render() {
    const {
      isMobileScreen,
      banner,
      sider,
      query,
      content,
      children,
      currentUser,
      briefInfo,
      info,
      authorInfos,
      userCenterInfo,
      perSettingData,
      insSettingData,
      bgEditable,
      personBaseInfo,
      insBaseInfo,
    } = this.props
    const { id, code, edit } = query

    const isLogin = !!currentUser.id
    // let bannerImg = info ? info.banner : `https://resource.meihua.info/author_bc.png`
    let banners
    let showBgEdit = false
    let showAuthorBannerEdit = false
    let auditingNode = null
    let isCurrentUserAuthor = false
    let bannerLink = ''
    const hasCode = !!code

    // console.log('briefInfo', toJS(briefInfo), toJS(currentUser))

    if (hasCode) {
      const authorDetail = briefInfo || {}
      banners = authorDetail.banner || `https://resource.meihua.info/author_bc.png`
      isCurrentUserAuthor = authorDetail.userId === currentUser.id
      showAuthorBannerEdit = bgEditable && isLogin && isCurrentUserAuthor && !isMobileScreen
      bannerLink = authorDetail.bannerLink ? utils.addHttp(authorDetail.bannerLink) : ''
    } else {
      const baseInfo = userCenterInfo || {}
      if (id) {
        banners = baseInfo.banner || `https://resource.meihua.info/author_bc.png`
        const authorPassed = baseInfo.authorPassed
        auditingNode = (authorPassed && !defaultBanners.includes(baseInfo.banner) && !isEqual(baseInfo.banner, authorPassed.banner)) ? <span className="author-banner-change-tips-mask">修改正在审核中</span> : null
      }
      showBgEdit = bgEditable && !!baseInfo.authorId
    }

    const showBanner = hasCode && !!banners

    return (
      <div>
        {showBanner && <div className='banner-layout'>
          <div className='intro-show-img'>
            {bannerLink ? <a href={bannerLink} target="_blank"><img src={banners} alt='' className='banner-img' /></a>
              : <img src={banners} alt='' className='banner-img' />}
            {auditingNode}
          </div>
          {/* {bgEditable && !hasCode && <BannersModify />} */}
          {showAuthorBannerEdit && <AuthorBannerModify query={query} />}
        </div>}
        <div className='main-layout'>
          <Content className='user-layout-content'>
            <Layout hasSider={true}>
              <Sider className='user-sider' width={340} style={{ position: 'relative', left: '0', top: showBanner ? '-180px' : 0, background: 'transparent' }}>
                {sider}
              </Sider>
              <Content className='user-main-content' >
                {content || children}
              </Content>
            </Layout>
          </Content>
        </div>
      </div>
    )
  }
}