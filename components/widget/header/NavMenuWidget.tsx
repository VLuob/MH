import { Menu, Dropdown, Icon } from 'antd'
import { Component } from 'react'
import { navList } from '@constants/common/header'


const isNewIcon = '/static/images/icon/jiaobiao_new.svg'

let curRouter
class NavMenuWidget extends Component {
    state = {
        selectedKeys: []
    }

    componentDidMount() {
        const { asPath } = this.props
        // const pathname = location.pathname
        // if (pathname === '/') {
        //     curRouter = ['0']
        // } else 
        if (['/topics', '/top', '/collection'].some(v => asPath.indexOf(v) >= 0)) {
            curRouter = ['discover']
        } else if (asPath.indexOf('/pricing') >= 0) {
            curRouter = ['pricing']
        } else {
            const path = navList.filter(l => l.link === asPath)[0]
            // const path = navList.filter(l => (pathname.indexOf(l.link) >= 0 && l.link !== '/'))[0]
            curRouter = path ? [String(path.id)] : []
        }
    }

    linkClick = e => this.setState({ selectedKeys: e.keyPath })

    render() {
        const { list } = this.props

        return (
            <Menu
                theme='dark'
                mode='horizontal'
                className='common-menu'
                onClick={e => this.linkClick(e)}
                selectedKeys={curRouter}
            >
                {list.map(l =>
                    <Menu.Item key={l.id}>
                        <a href={l.link}>{l.name}</a>
                    </Menu.Item>
                )}
                <Menu.Item key="discover">
                    <Dropdown overlay={
                        <Menu>
                            <Menu.Item><a href="/enquiry" className="common-header-nav-item">询价
                            {/* <span className="is-new"><img src={isNewIcon} alt="询价-梅花网" /></span> */}
                            </a></Menu.Item>
                            <Menu.Item><a href="/topics">专题</a></Menu.Item>
                            <Menu.Item><a href="/top">榜单</a></Menu.Item>
                            <Menu.Item><a href="/collection" className="common-header-nav-item">收藏
                            {/* <span className="is-new"><img src={isNewIcon} alt="收藏-梅花网"/></span> */}
                            </a></Menu.Item>
                        </Menu>
                    }>
                        <a className="nav-menu-item discover">发现 <Icon type="down" style={{ marginRight: '0' }} />
                            {/* <span className="is-new" style={{ right: '-25px' }}><img src={isNewIcon} alt="发现-梅花网" /></span> */}
                        </a>
                    </Dropdown>
                </Menu.Item>
                <Menu.Item key="pricing">
                    <a href="/pricing" className="nav-menu-item discover">服务商推广
                    {/* <span className="is-new" style={{right: '-25px'}}><img src={isNewIcon} alt="服务商推广-梅花网"/></span> */}
                    </a>
                </Menu.Item>
            </Menu>
        )
    }
}

export default NavMenuWidget