import { Component } from 'react'
import { Row, Col, Icon, Menu, Dropdown } from 'antd'

import BriefWidget from '@components/widget/common/BriefWidget'

export default class MemberManagermentContainer extends Component {
    addNewMember = () => {
        // console.log(`添加新成员`)
    }

    render() {
        return (
            <div className='common-container'>
            <div className='member-managerment-container'>
                <div className='title-line'>
                    成员管理
                    <a onClick={this.addNewMember}><Icon type='plus-circle' />&nbsp; 添加新成员</a>
                </div>
                <ul className='member-managerment-content'>
                    <li className='member-li'>
                        <Row type='flex' align='middle' justify='center'>
                            <Col span={11}>
                                <div className='member-info'>
                                    <BriefWidget 
                                        size={31}
                                        name={`特斯拉中国`}
                                        meta={`zhangguangshang66@163.com`} />
                                </div>
                            </Col>
                            <Col span={6}>
                                <div className='member-role'>管理员</div>
                            </Col>
                            <Col span={4}>
                                <div className='member-tag member-unconfirm'>待确认</div>
                                {/* <div className='member-tag member-confirm'>已确认</div> */}
                            </Col>
                            <Col span={2}>
                                <Icon type="redo" />
                                <Dropdown overlay={
                                    <Menu>
                                        <Menu.Item key='0'>设为普通用户</Menu.Item>
                                        <Menu.Item key='1'>移除成员</Menu.Item>
                                    </Menu>        
                                } trigger={['click']}>
                                    <Icon type='form' />
                                </Dropdown>
                            </Col>
                        </Row> 
                    </li>
                    <li className='member-li'>
                        <Row type='flex' align='middle' justify='center'>
                            <Col span={11}>
                                <div className='member-info'>
                                    <BriefWidget size={31}
                                        name={`特斯拉中国`}
                                        meta={`zhangguangshang66@163.com`} />
                                </div>
                            </Col>
                            <Col span={6}>
                                <div className='member-role'>管理员</div>
                            </Col>
                            <Col span={4}>
                                {/* <div className='member-tag member-unconfirm'>待确认</div> */}
                                <div className='member-tag member-confirm'>已确认</div>
                            </Col>
                            <Col span={2}>
                                <Icon type="redo" />
                                <Dropdown overlay={
                                    <Menu>
                                        <Menu.Item key='0'>设为普通用户</Menu.Item>
                                        <Menu.Item key='1'>移除成员</Menu.Item>
                                    </Menu>
                                } trigger={['click']}>
                                    <Icon type='form' />
                                </Dropdown>
                            </Col>
                        </Row> 
                    </li>
                </ul>
            </div>
            </div>
        )
    }
}