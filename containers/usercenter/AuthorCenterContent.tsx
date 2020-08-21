import { Component } from 'react'
import dynamic from 'next/dynamic'
import { TeamMenuType } from '@base/enums'
import { toJS } from 'mobx'
import PartLoading from '@components/features/PartLoading'

// const MemberManagermentContainerWithNoSSR = dynamic(() => import('./authors/MemberManagermentContainer'), { loading: () => <PartLoading />, ssr: false })

// 资料与账户
const InsDataContainerWithNoSSR = dynamic(() => import('./authorAccount/InsDataContainer'), { loading: () => <PartLoading />, ssr: false })

// 创作管理
const InsCompositionContainerWithNoSSR = dynamic(() => import('./composition/InsCompositionContainer'), { loading: () => <PartLoading />, ssr: false })

// 我的统计
const StatisticContainerNoSSR = dynamic(() => import('./statistic/StatisticContainer'), { loading: () => <PartLoading />, ssr: false })

// 服务管理
const ServiceContainerNoSSR = dynamic(() => import('./service/ServiceContainer'), { laoding: () => <PartLoading />, ssr: false })

interface Props {
  query: any,
}

interface State {

}

export default class AuthorCenterContent extends Component<Props, State> {

  render() {
    const { query } = this.props
    const { id, menu } = query

    return (
      (() => {
        switch (menu) {
          case TeamMenuType.SERVICE:
            return (<ServiceContainerNoSSR query={query} />)
            break
          case TeamMenuType.CREATION:
            // 作者创作
            return (<InsCompositionContainerWithNoSSR query={query} />)
          case TeamMenuType.STATISTICS:
            return (<StatisticContainerNoSSR query={query} />)
          // case TeamMenuType.MEMBER:
          //     return (<MemberManagermentContainerWithNoSSR />)
          case TeamMenuType.DATA:
          default:
            return (<InsDataContainerWithNoSSR query={query} />)
        }
      })()
    )
  }
}