import { Component } from 'react'
import { Row, Col, Icon } from 'antd'
import classNames from 'classnames'
import Item from 'antd/lib/list/Item'

interface State {
    currentKey: number
}

interface Props {
    tabName: string,
    tabList: Array<any>
}

export default class ClassifyTab extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            showMore: false
        }
    }

    componentDidMount() {
        const { currentKey } = this.state
        const { initialFn } = this.props
 
        initialFn && this.handleClick(currentKey)
    }

    handleClick = (currentKey, item) => {
        const { changeFn } = this.props

        changeFn && changeFn(currentKey, item)
    }

    handleClickMore = e => this.setState(prevState => ({ showMore: !prevState.showMore }))

    render() {
        const { showMore } = this.state
        const { keys, notMore, tabName, tabList, borderless, isCode } = this.props

        if(!tabName) {
            return (
                <div className='classify-tab'>
                    <Row type='flex' justify='start' align='top' gutter={30}>
                        <Col span={24}>
                            <ul className='menu-list title-list' style={{ height: showMore ? `auto` : '' }}>
                                {tabList.map((l, i) => {
                                    const currId = isCode ? l.code : l.id
                                    return (
                                        <li key={i} onClick={e => this.handleClick(currId, l)}>
                                            <a className={classNames(
                                                { selected: currId === keys }
                                            )}>{l.name}&nbsp;{l.totalCount || ''}</a>
                                        </li>
                                    )
                                })}
                            </ul>
                        </Col>
                    </Row>
                </div>
            )
        }

        return (
            <div className='classify-tab'>
                {!borderless && <Row type='flex' justify='start' align='top' gutter={30}>
                    <Col xxl={1} xl={1} sm={1} md={1} xs={2}></Col>
                    <Col xxl={22} xl={22} sm={22} md={22} xs={20}>
                        <Row type='flex' justify='start' align='top' gutter={24}>
                            <Col className='classify-tab-title' xxl={1} xl={2} sm={2} md={2} xs={2}>
                                <span className='tab-name'>{tabName}</span>
                            </Col>
                            <Col xxl={21} xl={20} sm={19} md={19} xs={18}>
                                <ul className='menu-list' style={{ height: showMore ? `auto` : '' }}>
                                    {tabList.map((l, i) => {
                                    const currId = isCode ? l.code : l.id
                                        return (
                                            <li key={i} onClick={e => this.handleClick(currId, l)}>
                                                <a className={classNames(
                                                    { selected: currId === keys }
                                                )}>{l.name}&nbsp;{l.totalCount || ''}</a>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </Col>
                            {!notMore && <Col xxl={2} xl={2} sm={3} md={3} xs={4} style={{ textAlign: 'right', marginLeft: '8px', paddingRight: '0' }}>
                                <span className='see-more' style={{ color: showMore ? '#008CD6' : '' }} onClick={this.handleClickMore}>
                                    {showMore ? `收起` : `更多`} <Icon type={showMore ? `caret-up` : `caret-down`} />
                                </span>
                            </Col>}
                        </Row>
                    </Col>
                    <Col xxl={1} xl={1} sm={1} md={1} xs={2}></Col>
                </Row>}
                {borderless &&
                    <Row type='flex' justify='start' align='top' gutter={30}>
                        <Col span={24}>
                            <Row type='flex' justify='start' align='top' gutter={24}>
                                {/* <Col className='classify-tab-title' xxl={2} xl={3} sm={3} md={3} xs={4}> */}
                                <Col className='classify-tab-title' xxl={2} xl={2} sm={2} md={2} xs={2}>
                                    <span className='tab-name'>{tabName}</span>
                                </Col>
                                <Col xxl={20} xl={20} sm={18} md={18} xs={16}>
                                    <ul className='menu-list' style={{ height: showMore ? `auto` : '' }}>
                                        {tabList.map((l, i) => {
                                            const currId = isCode ? l.code : l.id
                                            return (
                                                <li key={i} onClick={e => this.handleClick(currId, l)}>
                                                    <a className={classNames(
                                                        { selected: currId === keys }
                                                    )}>{l.name}&nbsp;{l.totalCount || ''}</a>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </Col>
                                {!notMore && <Col xxl={2} xl={2} sm={3} md={3} xs={4} style={{ textAlign: 'right', marginLeft: '8px', paddingRight: '0' }}>
                                    <span className='see-more' style={{ color: showMore ? '#008CD6' : '' }} onClick={this.handleClickMore}>
                                        {showMore ? `收起` : `更多`} <Icon type={showMore ? `caret-up` : `caret-down`} />
                                    </span>
                                </Col>}
                            </Row>
                        </Col>
                    </Row>}
            </div>
        )
    }
}