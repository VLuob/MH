import { Component } from 'react'
// import { Layout } from 'antd'

// import CommonHeader from '@containers/common/CommonHeader'

// const { Content } = Layout

export default class LayoutContainer extends Component {
    render() {
        const { component } = this.props

        return (
            <div className='layout-container'>
                {component}
                {/* <Layout>
                    <Layout hasSider={true}>   
                        <Content>
                            {component}
                        </Content>
                    </Layout>
                </Layout> */}
            </div>
        )
    }
}