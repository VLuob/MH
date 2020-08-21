import { Icon, Menu, Dropdown, message } from 'antd'
import emptyImage from '@static/images/common/full-empty.png'
import classNames from 'classnames'

const ServerBox = ({ item, height, custom, onClicks, isDropdown }) => {
    const onClick = e => {
        e.domEvent.preventDefault()
        e.domEvent.stopPropagation()

        message.destroy()
        onClicks(item)
    }

    const menu = (
        <Menu onClick={onClick} theme='light'>
            <Menu.Item key={0}>更换</Menu.Item>
            <Menu.Item key={1}>删除</Menu.Item>
        </Menu>
    )

    return (
        <div className='server-box'>
            {/* <a href=''> */}
            <div className='server-option' id='server-option'>
                {isDropdown && <Dropdown overlay={menu} trigger={['click']} placement='bottomRight' getPopupContainer={() => document.getElementById('server-option')}>
                        <a onClick={e => { e.stopPropagation() }} className='ant-dropdown-link' href='#'><Icon type='ellipsis' /></a>
                    </Dropdown>}
                </div>
                <img src={item.image || emptyImage} className={classNames({
                    'server-img': !custom,
                    'server-cumstom-img': custom
                })} />
                <p className='explain multi-ellipsis'>
                    {item.title || '暂无'}
                </p>
            {/* </a> */}
        </div>
    )
}

export default ServerBox