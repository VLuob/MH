import { Component } from 'react'
import { Row, Col, Icon } from 'antd'
import classNames from 'classnames'

interface State {
    currentKey: number
}

interface Props {
    tabName: string,
    tabList: Array<any>
}

export default class ClassifyTab extends Component<Props, State> {
    state = {
        currentKey: 0,
        showMore: false
    }

    componentDidMount() {
        const { currentKey } = this.state
        const { keys, initialFn } = this.props

        initialFn && this.handleClick(currentKey)
        this.setState({ currentKey: keys || 0 })
    }

    handleClick = (currentKey, item) => {
        const { changeFn } = this.props

        changeFn && changeFn(currentKey, item)
        this.setState({ currentKey })
    }

    handleClickMore = e => this.setState(prevState => ({ showMore: !prevState.showMore }))

    render() {
        const { showMore, currentKey } = this.state
        const { notMore, tabName, tabList, borderless, className } = this.props

        if(!tabName) {
            return (
                <div className={`classify-tab`}>
                    <Row type='flex' justify='space-between' align='top' gutter={30}>
                        <Col span={24}>
                            <ul className={`menu-list title-list ${className}`} style={{ height: showMore ? `auto` : '' }}>
                                {tabList.map((l, i) => {
                                    return (
                                        <li key={i} onClick={e => this.handleClick(l.id, l)}>
                                            <a className={classNames(
                                                { selected: i === currentKey || l.id === currentKey }
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
            <div className={className ? `classify-tab ${className}` : `classify-tab`}>
                {!borderless && <Row type='flex' justify='space-between' align='top' gutter={30}>
                    <Col xxl={1} xl={1} sm={1} md={1} xs={2}></Col>
                    <Col xxl={22} xl={22} sm={22} md={22} xs={20}>
                        <Row type='flex' justify='space-between' align='top' gutter={24}>
                            <Col className='classify-tab-title'>
                                <span className='tab-name'>{tabName}</span>
                            </Col>
                            <Col xxl={20} xl={20} sm={21} md={19} xs={18}>
                                <ul className={`menu-list ${className}`} style={{ height: showMore ? `auto` : '' }}>
                                    {tabList.map((l, i) => {
                                        return (
                                            <li key={i} onClick={e => this.handleClick(l.id, l)}>
                                                <a className={classNames(
                                                    { selected: i === currentKey || l.id === currentKey }
                                                )}>{l.name}&nbsp;{l.totalCount || ''}</a>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </Col>
                            {!notMore ? <Col xxl={2} xl={2} sm={2} md={3} xs={4} style={{ textAlign: 'right' }}>
                                <span className='see-more' style={{ color: showMore ? '#008CD6' : '' }} onClick={this.handleClickMore}>
                                    {showMore ? `收起` : `更多`} <Icon type={showMore ? `caret-up` : `caret-down`}  />
                                </span>
                            </Col> : <Col xxl={2} xl={2} sm={2} md={3} xs={4} style={{ textAlign: 'right' }}></Col>}
                        </Row>
                    </Col>
                    <Col xxl={1} xl={1} sm={1} md={1} xs={2}></Col>
                </Row>}
                {borderless && 
                    <Row type='flex' justify='space-between' align='top' gutter={30}>
                        <Col span={24}>
                        <Row type='flex' justify='space-between' align='top' gutter={24}>
                            <Col className='classify-tab-title'>
                                <span className='tab-name'>{tabName}</span>
                            </Col>
                            <Col xxl={20} xl={20} sm={21} md={19} xs={18}>
                                <ul className={className ? `menu-list ${className}` : `menu-list`} style={{ height: showMore ? `auto` : '' }}>
                                    {tabList.map((l, i) =>
                                        <li key={i} onClick={e => this.handleClick(l.id)}>
                                            <a className={classNames(
                                                { selected: i === currentKey || l.id === currentKey }
                                            )}>{l.name}&nbsp;{l.totalCount || ''}</a>
                                        </li>
                                    )}
                                </ul>
                            </Col>
                            {!notMore ? <Col xxl={2} xl={2} sm={2} md={3} xs={4} style={{ textAlign: 'right' }}>
                                <span className='see-more' style={{ color: showMore ? '#008CD6' : '' }} onClick={this.handleClickMore}>
                                    {showMore ? `收起` : `更多`} <Icon type={showMore ? `caret-up` : `caret-down`} />
                                </span>
                            </Col> : <Col xxl={2} xl={2} sm={2} md={3} xs={4} style={{ textAlign: 'right' }}></Col>}
                        </Row>
                    </Col>
                </Row>}
            </div>
        )
    }
}