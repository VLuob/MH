import classNames from 'classnames'
import { Component } from 'react'
import { utils } from '@utils'
import { Tabs, Menu, Icon, Input, message, AutoComplete } from 'antd'
import basic from '@base/system/basic'
import { CompositionTypes, SearchType, CommonSortType } from '@base/enums' 
import { toJS } from 'mobx'

import area from '@base/system/area'

const token = basic.token

const TabPane = Tabs.TabPane
const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup

interface Props {
    subTabList: Array<any>
}

interface State {

}

let key = ''
let dataCompletedSource = []
area.forEach(item => {
    dataCompletedSource = [...dataCompletedSource, ...item.provinces]

    item.provinces.forEach(t => {
        dataCompletedSource = [...dataCompletedSource, ...t.cities]
    })
})

const dataSource = Array.from(new Set(dataCompletedSource.map(l => l.name)))

// let currentKey = '1'
export default class SubTab extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            areaPanal: false,
            currentTab: `热门`,
            currentArea: '创作者所在地区'
        }
    }

    componentDidMount() {
        document.addEventListener('click', this.documentClick, false)
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.documentClick, false)
    }

    documentClick = e => {
        const node = utils.findNode(e.target, 'id', 'area-panel')
        const className = String(e.target.className)

        if(className.indexOf(`area-menu`) <= -1 && !node) {
            this.setState({ areaPanal: false })
        }

        if(node && node.className === 'author-containers') {
            this.setState({ areaPanal: false })
        }

        if(className.indexOf(`area-cities`) > -1) {
            this.setState({ areaPanal: false })
        }

        if(e.target.className === 'area-meta') {
            this.setState({ areaPanal: false })
        }

        if(e.target.className === 'area-provinces') {
            this.setState({ areaPanal: false })
        }

        if(e.target && (typeof e.target.className !== 'object') && e.target.className.indexOf('ant-select-dropdown-menu-item-selected') > -1) {
            this.setState({ areaPanal: false })
        }
    }

    callback = key => {
        // console.log(key)
    }

    handleClick = (e) => {
        const { condition, reqList, gmtState, searchType, compositionType } = this.props
        const userInfo = this.props.userInfo || {}
        let param = {}

        const currentType = compositionType || CompositionTypes.SHOTS

        switch(e.key) {
            case `degree`:
                if(key !== 'degree') {
                    key = 'degree'
                
                    param = { term: { type: searchType === SearchType.AUTHOR ? undefined : currentType }, sort: [{ key: e.key, value: 'desc' }], recommended: false }
                    // let routeOption = {popular: ''}
                    let routeOption = {sort: CommonSortType.HOT}
                    reqList && reqList(param, routeOption)
                }

                this.setState({ currentTab: `热门` })

                break
            case `favors`:
                if(key !== 'favors') {
                    key = 'favors'
                
                    param = { term: { type: searchType === SearchType.AUTHOR ? undefined : currentType }, sort: [{ key: e.key, value: 'desc' }], recommended: false }
                    let routeOption = {like: ''}
                    reqList && reqList(param, routeOption)
                }

                this.setState({ currentTab: `喜欢` })

                break
            case `views`:
                if(key !== 'views') {
                    key = 'views'

                    param = { term: { type: searchType === SearchType.AUTHOR ? undefined : currentType }, sort: [{ key: e.key, value: 'desc' }], recommended: false }
                    let routeOption = {read: ''}
                    reqList && reqList(param, routeOption)
                }

                this.setState({ currentTab: `浏览` })

                break
            case `collections`:
                if(key !== 'collections') {
                    key = 'collections'

                    param = { term: { type: currentType }, sort: [{ key: e.key, value: 'desc' }], recommended: false }
                    let routeOption = {collection: ''}
                    reqList && reqList(param, routeOption)
                }

                this.setState({ currentTab: `收藏` })

                break
            case `comments`:
                if(key !== 'comments') {
                    key = 'comments'

                    param = { term: { type: currentType }, sort: [{ key: e.key, value: 'desc' }], recommended: false }
                    let routeOption = {comment: ''}
                    reqList && reqList(param, routeOption)
                }

                this.setState({ currentTab: `评论` })

                break
            case `follower`:
                if(key !== 'follower') {
                    key = 'follower'

                    if(token) {
                        const follower = userInfo.id

                        param = { term: { type: searchType === SearchType.AUTHOR ? undefined : currentType, follower }, recommended: false}
                        // let routeOption = {follow: ''}
                        let routeOption = {sort: CommonSortType.FOLLOW}
                        reqList && reqList(param, routeOption)
                    } else {
                        message.destroy()
                        message.warning(`请登录后查看`)

                        setTimeout(() => {
                            window.location.href = `/signin?c=${encodeURIComponent(window.location.pathname)}`
                        }, 2000)
                    }
                }

                break
            case 'match':
                if (key !== 'match') {
                    key = 'match'
                    param = { term: { type: searchType === SearchType.AUTHOR ? undefined : currentType }, sort: [{ key: e.key, value: 'asc' }], recommended: false }
                    // let routeOption = {match: ''}
                    let routeOption = {sort: CommonSortType.MATCH}
                    reqList && reqList(param, routeOption)
                }
                break
            case `gmtCreate`:
                if(key !== 'gmtCreate') {
                    switch(gmtState) {
                        case `gmtCreate`:
                            key = 'gmtCreate'

                            break
                        default: 
                            key = 'gmtPublish'
                        
                            break
                    }

    
                    param = { term: { type: searchType === SearchType.AUTHOR ? undefined : currentType }, sort: [{ key, value: `desc` }], recommended: false }
                    // let routeOption = {newest: ''}
                    let routeOption = {sort: CommonSortType.NEWEST}
                    reqList && reqList(param, routeOption)
                }

                break

            // 作者部分
            case `fans`:
                if(key !== 'fans') {
                    key = 'fans'

                    param = { term: { type: null }, sort: [{ key: e.key, value: 'desc' }], recommended: false }
                    let routeOption = {fan: ''}
                    reqList && reqList(param, routeOption)
                }

                this.setState({ currentTab: `粉丝` })

                break
            // 作者部分
            case `worksQuantity`:
                if(key !== 'worksQuantity') {
                    key = 'worksQuantity'

                    param = { term: { type: null }, sort: [{ key: e.key, value: 'desc' }], recommended: false }
                    let routeOption = {shots: ''}
                    reqList && reqList(param, routeOption)
                }

                this.setState({ currentTab: `作品` })

                break
                
            case `area`:
                this.setState(prevState => ({ areaPanal: !prevState.areaPanal }))

                break
        }
    }

    searchFn = val => {
        // console.log(123)
    }
    
    onSelect = e => {
        const { reqList, condition } = this.props
        let param = { ...condition }
        let routeOption = {}
        const current = dataCompletedSource.filter(l => l.name === e)[0]

        if(Object.keys(current).some(l => l === `cities`)) {
            param = {
                ...param,
                term: {
                    ...condition.term,
                    province: [current.id]
                }
            }
            routeOption = {province: current.id}
        } else {
            param = {
                ...param,
                term: {
                    ...condition.term,
                    city: [current.id]
                }
            }
            routeOption = {city: current.id}
        }

        this.setState({ currentArea: current.name })
        reqList && reqList(param, routeOption)
    }

    areaClick = option => {
        const { reqList, condition } = this.props
        const { type, val, name } = option
        let param = { ...condition }
        let routeOption = {}

        if(type === `provinces`) {
            param = {
                ...param,
                term: {
                    ...condition.term,
                    province: [val],
                    // city: 0
                }
            }
            routeOption = {province: val}
            // param.term.city && (delete param.term.city)
        } else {
            const { pVal } = option

            param = {
                ...param,
                term: {
                    ...condition.term,
                    province: [pVal],
                    city: [val]
                }
            }
            routeOption = {province: pVal, city: val}

            // param.term.province && (delete param.term.province)
        }

        this.setState({ currentArea: name })
        reqList && reqList(param, routeOption)
    }

    renderMenu = list => {
        const { currentTab } = this.state

        return list.map(l => {
            if(!l.menu) {
                if(l.key === 'area') {
                    return (
                        <Menu.Item key={l.key} style={l.style} className='area-menu'>
                            {l.name}
                            {l.icon && <Icon type={l.icon} />}
                        </Menu.Item>
                    )
                }

                return (
                    <Menu.Item key={l.key} className={l.key} >
                        {l.icon && <Icon type={l.icon} />}
                        {l.name}
                    </Menu.Item>
                )
            } else {
                return (
                    <SubMenu title={
                        <>
                            {/* <span>{l.name}</span>  */}
                            <span>{currentTab}</span>
                            <Icon type='caret-down' style={{ marginRight: 0 }} />
                        </>
                    } key={l.key} style={l.styles}>
                        <MenuItemGroup>
                            {this.renderSubMenu(l.menu)}
                        </MenuItemGroup>
                    </SubMenu>
                )
            }
        })
    }

    renderSubMenu = list => list.map(l => {
        return (
            l.key !== key ? <Menu.Item style={{
                fontFamily: 'PingFangSC-Light',
                fontSize: '13px',
                color: '#000000' }} key={l.key}>
                {l.name}
            </Menu.Item> : null
        )
    })

    onSelectAllArea = () => {
        const { reqList, condition } = this.props
        let param = { ...condition }
        const routeOption = {province: 0, city: 0}

        param && param.term && delete param.term.city
        param && param.term && delete param.term.province

        this.setState({ currentArea: `全部地区` })
        reqList && reqList(param, routeOption)
    }

    render() {
        const { currentArea, areaPanal } = this.state
        const { condition, subTabList, presentArea, recommendClick, showRefreshBtn } = this.props
        let sort = `0`

        if(condition && !condition.recommended) {
            sort = key
            if(condition.sort && condition.sort[0].key) {
                if(condition.sort[0].key === 'gmtPublish') {
                    sort = `gmtCreate`
                } else {
                    sort = condition.sort[0].key
                }
            }

            if(condition.term && condition.term.follower) {
                sort = key
            }
        } else {
            key = ''
        }

        subTabList[subTabList.length - 1].key === 'area' && (subTabList[subTabList.length - 1].name = (currentArea || presentArea))

        return (
            <div className='dressing-sub-title'>
                {recommendClick && <span className={classNames(
                    'recommended-btn',
                    { 'btn-selected': condition && condition.recommended }
                )} onClick={recommendClick}>推荐</span>}
                <Menu   
                    onClick={this.handleClick}
                    selectedKeys={[sort]}
                    style={{ padding: '0 70px', height: '60px', lineHeight: '60px', fontSize: '15px', borderBottom: '1px solid #EEEEEE' }}
                    mode='horizontal'>
                    {this.renderMenu(subTabList)}
                </Menu>
                {showRefreshBtn && condition.recommended && <span className="btn-refresh" onClick={recommendClick}><Icon type="sync" /> 换一换</span>}
                {areaPanal && <div className='area-panel' id='area-panel'>
                    <div className='search-part'>
                        <span className='area-meta' onClick={this.onSelectAllArea}>{`全部地区`}</span>
                            <AutoComplete 
                                dataSource={dataSource}
                                style={{ width: 200 }}
                                onSelect={this.onSelect}
                                onSearch={value => this.searchFn(value)}
                                placeholder={`请输入城市名`}
                                filterOption={(inputValue, option) =>
                                    option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                }
                            />
                    </div>
                    <Tabs className='area-tabs' onChange={this.callback} type='card'>
                        {area.map(l => {
                            return (
                                <TabPane tab={l.name} key={l.id}>
                                    {l.provinces.map(m => {
                                        return (
                                            <div className='area-address clearfix' key={m.id}>
                                                <span key={m.id} className='area-provinces' onClick={e => this.areaClick({ type: `provinces`, val: m.id, name: m.name })}>{m.name}</span>
                                                <div className='area-cities-group'>
                                                    {m.cities.map(t => {
                                                        return (
                                                            <span key={t.id} className='area-cities' onClick={e => this.areaClick({ type: `cities`, val: t.id, name: t.name, pVal: m.id })}>{t.name}</span>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </TabPane>
                            )
                        })}
                    </Tabs>
                </div>}
            </div>
        )
    }
}