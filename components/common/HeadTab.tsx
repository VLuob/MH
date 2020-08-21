import { Component } from 'react'
import { Tabs, Row, Col } from 'antd'

const TabPane = Tabs.TabPane

interface Props {
    headTabList: Array<any>
    query: any
    reqList: Function
    originalCondition: any
}

interface State {
    
}

export default class HeadTab extends Component<Props, State> {
    callback = key => {
        const { reqList, callbackFn, originalCondition } = this.props
        const param = { 
            ...originalCondition, 
            term: { 
                ...originalCondition.term, 
                type: Number(key) === 0 ? null : Number(key) 
            }, 
            page: 1 }
        reqList && reqList(param)
        callbackFn && callbackFn(key)
    }

    renderTabPane = () => this.props.headTabList.map(l => <TabPane tab={l.name} key={l.key} />)

    render() {
        const { query } = this.props 
        const type = (query && query.type) + ''
        const tabLists = this.renderTabPane() 

        return (
            <Row 
                type='flex' 
                justify='center' 
                align='middle'
            >
                <Col span={24}>
                    <Tabs 
                        className="head-tabs"
                        defaultActiveKey={type || `0`} 
                        type='line' 
                        size='large'
                        onChange={this.callback} 
                        animated={false}
                    >
                        {tabLists}
                    </Tabs>
                </Col>
            </Row>
        )
    }
}