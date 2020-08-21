import { Component } from 'react'
import dynamic from 'next/dynamic'
import { MineType } from '@base/enums'
import { toJS } from 'mobx'
import PartLoading from '@components/features/PartLoading'


// const CreateInsContainerWithNoSSR = dynamic(() => import('./authors/CreateInsContainer'), { loading: () => <PartLoading />, ssr: false })
const InstitutionContainerWithNoSSR = dynamic(() => import('./authors/InstitutionContainer'), { loading: () => <PartLoading />, ssr: false })

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

// 订单管理
const OrderContainerNoSSR = dynamic(() => import('./order/OrderContainer'), { laoding: () => <PartLoading />, ssr: false })

interface Props {
  query: any,
}

interface State {

}

export default class UserCenterContent extends Component<Props, State> {

  render() {
    const { query, userCenterInfo } = this.props
    const { menu } = query

    if (query.collectionId) {
      return (<CollectionContainerWithNoSSR query={query} />)
    }

    return (
      (() => {
        switch (menu) {
          case MineType.FOLLOW:
            // 我的关注
            return (<FollowContainerNoSSR query={query} />)
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
          case MineType.ORDER:
            // 订单与套餐
            return (<OrderContainerNoSSR />)
          case MineType.INSTITUTION:
            // 创作者管理
            return <InstitutionContainerWithNoSSR query={query} userCenterInfo={userCenterInfo} />
          // case MineType.CREATEINSTITUTION:
          //   // 创建机构
          //   return <CreateInsContainerWithNoSSR />
          case MineType.DATAANDACCOUNT:
            // 账户与资料
            return (<AccountContainerWithNoSSR query={query} userCenterInfo={userCenterInfo} />)
          case MineType.SUBSCRIPTION:
            return (<SubscribeContainerWithNoSSR query={query} />)
          default:
            // 默认显示我的关注
            return (<FollowContainerNoSSR query={query} />)
        }
      })()
    )
  }
}