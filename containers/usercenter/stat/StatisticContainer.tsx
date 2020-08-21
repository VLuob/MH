import { Component } from 'react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'

import { Tabs } from 'antd'

import PartLoading from '@components/features/PartLoading'

const StatisticsContainerNoSSR = dynamic(() => import('./StatisticBox'), {loading: () => <PartLoading />, ssr: false})

const { TabPane } = Tabs

export default class StatisticContainer extends Component {

  render() {
    const { query } = this.props
    return (
      <div className="common-container user-statistics">
          <Tabs className='user-tabs' size='large' defaultActiveKey={query.menu || 'statistics'} animated={false} >
              <TabPane tab="创作统计" key='statistics'>
                  <StatisticsContainerNoSSR query={query} />
              </TabPane>
          </Tabs>
      </div>
    )
  }
}