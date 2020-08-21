import { Component } from 'react'
import { Tabs, Row, Col } from 'antd'

const TabPane = Tabs.TabPane

interface Props {
    headTabList: Array<any>
}

interface State {

}

export default class HeadPaneTab extends Component<Props, State> {
    callback = key => {
        const { reqList } = this.props

        reqList && reqList(key)
    }

    render() {
        const { children, activeKey, extraContent } = this.props

        return (
            <Row type='flex' justify='center' align='middle'>
                <Col span={24}>
                    <Tabs 
                        className={`head-panel-tabs`}
                        activeKey={activeKey || `2`} 
                        type='line' 
                        size='large'
                        onChange={this.callback} 
                        animated={false}
                        tabBarExtraContent={extraContent}
                    >
                        {children}
                    </Tabs>
                </Col>
            </Row>
        )
    }
}