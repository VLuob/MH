import { Component } from 'react'
import dynamic from 'next/dynamic'
import { MineType, TeamMenuType } from '@base/enums'
import { toJS } from 'mobx'
import PartLoading from '@components/features/PartLoading'


const CreateInsContainerWithNoSSR = dynamic(() => import('./authors/CreateInsContainer'), { loading: () => <PartLoading />, ssr: false })
const InstitutionContainerWithNoSSR = dynamic(() => import('./authors/InstitutionContainer'), { loading: () => <PartLoading />, ssr: false })
const MemberManagermentContainerWithNoSSR = dynamic(() => import('./authors/MemberManagermentContainer'), { loading: () => <PartLoading />, ssr: false })

const InsDataContainerWithNoSSR = dynamic(() => import('./authorAccount/InsDataContainer'), { loading: () => <PartLoading />, ssr: false })

const InsCompositionContainerWithNoSSR = dynamic(() => import('./composition/InsCompositionContainer'), { loading: () => <PartLoading />, ssr: false })

// 我的创作
const MyCompositionContainerWithNoSSR = dynamic(() => import('./composition/CompositionContainer'), { loading: () => <PartLoading />, ssr: false })

// 账户与资料
const AccountContainerWithNoSSR = dynamic(() => import('./account/AccountContainer'), { loading: () => <PartLoading />, ssr: false })

// 邮件订阅
const SubscribeContainerWithNoSSR = dynamic(() => import('./subscribe/SubscribeContainer'), { loading: () => <PartLoading />, ssr: false })

// 我的喜欢
const FavorContainerWithNoSSR = dynamic(() => import('./favor/FavorContainer'), { loading: () => <PartLoading />, ssr: false })

// 我的收藏
const FavoritesContainerWithNoSSR = dynamic(() => import('./collection/FavoritesContainer'), { loading: () => <PartLoading />, ssr: false })
const CollectionContainerWithNoSSR = dynamic(() => import('./collection/CollectionContainer'), { loading: () => <PartLoading />, ssr: false })

// 我的关注
const FollowContainerNoSSR = dynamic(() => import('./follow/FollowContainer'), { loading: () => <PartLoading />, ssr: false })

// 我的消息
// const CommentContainerNoSSR = dynamic(() => import('./comment/CommentBox'), {loading: () => <PartLoading />, ssr: false})
const MessageContainerNoSSR = dynamic(() => import('./message/MessageContainer'), { loading: () => <PartLoading />, ssr: false })

// 我的私信
const LetterContainerNoSSR = dynamic(() => import('./letter/LetterContainer'), { loading: () => <PartLoading />, ssr: false })

// 我的统计
const StatisticContainerNoSSR = dynamic(() => import('./statistic/StatisticContainer'), { loading: () => <PartLoading />, ssr: false })

// 订单管理
const OrderContainerNoSSR = dynamic(() => import('./order/OrderContainer'), { laoding: () => <PartLoading />, ssr: false })

// 服务管理
const ServiceContainerNoSSR = dynamic(() => import('./service/ServiceContainer'), { laoding: () => <PartLoading />, ssr: false })

interface Props {
  id: number,
  menu: string,
  tab: string,
  type: number,
  query: any,
}

interface State {

}

export default class UserCenterContent extends Component<Props, State> {

  render() {
    const { path, query, userCenterInfo, creationProp } = this.props
    const { id, menu } = query
    const isPerson = !id

    if (query.collectionId) {
      return (<CollectionContainerWithNoSSR query={query} />)
    }

    return (
      <>
        {isPerson ?
          <>
            {(() => {
              switch (menu) {
                case MineType.CREATION:
                  // 我的创作
                  return (<MyCompositionContainerWithNoSSR query={query} path={path} creationProp={creationProp} userCenterInfo={userCenterInfo} />)
                case MineType.COLLECTION:
                  // 收藏
                  return (<FavoritesContainerWithNoSSR query={query} />)
                // return (<CollectionContainerWithNoSSR query={query} />)
                case MineType.FAVOR:
                  // 喜欢
                  return (<FavorContainerWithNoSSR query={query} />)
                case MineType.MESSAGE:
                  // 消息
                  return (<MessageContainerNoSSR query={query} />)
                case MineType.LETTER:
                  // 询价
                  return (<LetterContainerNoSSR query={query} />)
                case MineType.STATISTICS:
                  // 统计
                  return (<StatisticContainerNoSSR query={query} />)
                case MineType.INSTITUTION:
                  // 创作者管理
                  return <InstitutionContainerWithNoSSR query={query} userCenterInfo={userCenterInfo} />
                case MineType.CREATEINSTITUTION:
                  // 创建机构
                  return <CreateInsContainerWithNoSSR />
                case MineType.DATAANDACCOUNT:
                  // 账户与资料
                  return (<AccountContainerWithNoSSR query={query} userCenterInfo={userCenterInfo} />)
                case MineType.SUBSCRIPTION:
                  return (<SubscribeContainerWithNoSSR query={query} />)
                case MineType.FOLLOW:
                  // 我的关注
                  return (<FollowContainerNoSSR query={query} />)
                case MineType.ORDER:
                  // 订单与套餐
                  return (<OrderContainerNoSSR />)
                default:
                  // 默认显示我的关注
                  return (<FollowContainerNoSSR />)
              }
            })()}
          </> :
          <>
            {(() => {
              switch (menu) {
                case TeamMenuType.SERVICE:
                  return (<ServiceContainerNoSSR query={query} userCenterInfo={userCenterInfo} />)
                  break
                case TeamMenuType.CREATION:
                  // 作者创作
                  return (<InsCompositionContainerWithNoSSR query={query} path={path} userCenterInfo={userCenterInfo} />)
                case TeamMenuType.STATISTICS:
                  return (<StatisticContainerNoSSR query={query} />)
                // case TeamMenuType.MEMBER:
                //     return (<MemberManagermentContainerWithNoSSR />)
                case TeamMenuType.DATA:
                default:
                  return (<InsDataContainerWithNoSSR query={query} userCenterInfo={userCenterInfo} />)
              }
            })()}
          </>
        }
      </>
    )
  }
}