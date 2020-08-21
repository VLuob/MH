import { Component } from 'react'
import { Avatar, Icon, Menu, Button, Checkbox, Dropdown, message } from 'antd'
import { inject, observer } from 'mobx-react'
import { utils } from '@utils'
import { toJS } from 'mobx'

const CheckboxGroup = Checkbox.Group

function onChange(checkedValues) {
    // console.log('checked = ', checkedValues)
}

const options = [
    { label: '每天', value: 'day' },
    { label: '每周', value: 'week' },
    { label: '每月', value: 'month' },
]

@inject(stores => {
    const { userCenterStore } = stores.store
    const { emailOrgMemberList } = userCenterStore

    return {
        emailOrgMemberList
    }
})
@observer
export default class InsEmailSubContainer extends Component {
    menuClick = ({ key }) => {
        // console.log(key)
        // message.info(`Click on item ${key}`)
    }

    menu = (
        <Menu className='ins-email-list selected-email-list' onClick={this.menuClick}>
            <Menu.Item key='0'>
                <Avatar size={40} className='email-avatar' icon='user' />
                <div className='email-detail'>
                    <div className='email-name'>胡LILI </div>
                    <div className='email-email'>283942048@qq.com</div>
                </div>
            </Menu.Item>
            <Menu.Item key='1'>
                <Avatar size={40} className='email-avatar' icon='user' />
                <div className='email-detail'>
                    <div className='email-name'>胡LILI </div>
                    <div className='email-email'>283942048@qq.com</div>
                </div>
            </Menu.Item>
        </Menu>
    )

    render() {
        const { emailOrgMemberList } = this.props

        return (
            <div className='ins-data-content'>
                <div className='email-box'>
                    <div className='title'>账户活动</div>
                    <div className='account-exercise-box'>
                        <CheckboxGroup options={options} defaultValue={['day']} onChange={onChange} />
                    </div>
                    <div className='title'>接收邮箱</div>
                    <div className='receive-box'>
                        <Dropdown overlay={this.menu} trigger={['click']}>
                            <a className='ant-dropdown-link' href='#'>
                                在团队中选择接收邮箱的用户 <Icon type='caret-down' className='icon-caret' />
                            </a>
                        </Dropdown>
                        <ul className='ins-email-list'>
                            <li>
                                <Avatar size={40} className='email-avatar' icon='user' />
                                <div className='email-detail'>
                                    <div className='email-name'>胡LILI </div>
                                    <div className='email-email'>283942048@qq.com</div>
                                </div>
                                <Icon type='close-circle' className='email-close' theme='filled' />
                            </li>
                            <li>
                                <Avatar size={40} className='email-avatar' icon='user' />
                                <div className='email-detail'>
                                    <div className='email-name'>胡LILI </div>
                                    <div className='email-email'>283942048@qq.com</div>
                                </div>
                                <Icon type='close-circle' className='email-close' theme='filled' />
                            </li>
                        </ul>
                    </div>
                </div>
                <Button type='primary' className='themes' style={{ borderRadius: '3px', border: 'none', outline: 'none' }}>保存</Button>
            </div>
        )
    }
}