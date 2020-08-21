import { Component } from 'react'
import { Spin, Icon } from 'antd'
import { utils } from '@utils'
import { Waypoint } from 'react-waypoint'

interface State {
    scrollSum: number
}

interface Props {
    name: string,
    num: number,
}

export default class LoadMore extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            scrollSum: 0,
            loading: false,
            quest: true,
            num: props.num < 3 ? 3 : props.num
        }
    }

    componentDidMount() {
        // window.addEventListener('scroll', utils.throttle(1000, this.documentScroll), true)
    }

    componentWillUnmount() {
        // window.removeEventListener('scroll', this.documentScroll, true)
    }

    //FIXME: 修复部分内容
    documentScroll = e => {
        const dom = this.loadMore
        const winHeight = document.documentElement.offsetHeight
        let timer

        if(!!dom) {
            timer = setTimeout(() => {     
                if(winHeight > dom.getBoundingClientRect().top) {
                    this._handleWaypointEnter(e)
                }
    
                clearTimeout(timer)
            }, 500)
        }
    }
    

    handleClickMore = e => {
        const { reqList } = this.props
        this.setState({ scrollSum: 0, loading: true })
        reqList && reqList()
    }

    _handlePositionChange = e => {
        
    }

    _handleWaypointLeave = e => {
        this.setState({ quest: false })
    }

    _handleWaypointEnter = e => {
        const { scrollSum, loading, num } = this.state
        const { reqList } = this.props

        this.setState({ scrollSum: scrollSum + 1, loading: scrollSum < num })

        if(scrollSum < num) {
            reqList && reqList()
        } 
    }
 
    render() {
        const { scrollSum, loading } = this.state
        const { name, status, reqList, visible=true, ...props } = this.props
        const antIcon = <Icon type='loading' style={{ fontSize: 13, color: '#888888', margin: '0 10px 10px 0' }} spin />

        return (
            visible ? <> 
                <Waypoint
                    scrollableAncestor={window}
                    onPositionChange={this._handlePositionChange}
                    onEnter={this._handleWaypointEnter} 
                    onLeave={this._handleWaypointLeave} 
                />
                <div className='loading-more-box' ref={el => this.loadMore = el} {...props} >
                    {!loading ? <div className='loading-more' onClick={this.handleClickMore}>{name || '加载更多'}</div> :
                        <div className='current-loading'><Spin indicator={antIcon} />加载中...</div>}
                </div>
            </>
            : null
        )
    }
}