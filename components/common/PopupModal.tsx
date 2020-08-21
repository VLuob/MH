import { Component } from 'react'
import { config } from '@utils'

import jsCookie from 'js-cookie'
import classNames from 'classnames'
import Portal from '@components/common/Portal'
import MaskLayer from '@components/widget/common/MaskLayer'

import { Icon } from 'antd'
import { inject, observer } from 'mobx-react'

interface Props {
    id: number,
    url: string,
    imgUrl: string,
    title: string
    actionAdClick?: (arg: any) => void
}

interface State {
    show: boolean,
    seconds: number,
}

let timer
@inject(stores => {
    const { adStore } = stores.store

    const { actionAdClick } = adStore

    return {
        actionAdClick
    }
})
@observer
export default class PopupModal extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            show: true,
            seconds: props.seconds || 10
        }
    }

    componentDidMount() {
        // this.handleSetInterval()
    }

    handleSetInterval = () => {
        timer = setInterval(() => {
            const { seconds } = this.state

            if(seconds <= 0) {
                clearInterval(timer)
                this.setState(prevState => ({ show: !prevState.show }))

                return 
            }

            this.setState({ seconds: seconds - 1 })
        }, 1000)
    }

    handleClose = e => this.setState(prevState => ({ show: !prevState.show }), () => {
        let options = {}
        const hosts = window.location.host && (window.location.host).split('.')[0]
        const { id, imgUrl } = this.props
        
        options = { 
            expires: 30, 
            domain: hosts !== 'www' ? hosts + config.COOKIE_MEIHUA_DOMAIN : config.COOKIE_MEIHUA_DOMAIN, 
            path: '/' 
        }

        jsCookie.set('popUpState', `${id}-${imgUrl}`, options)
    })

    handleClick = (e) => {
        const { id, actionAdClick } = this.props
        actionAdClick({ id })
        this.handleClose(e)
    }

    render() {
        const { show, seconds } = this.state
        const {  url, imgUrl, title } = this.props

        return (
            <Portal selector='#popupModal'>
                <div className={classNames('popup-container', {
                    close: !show
                })}>
                    <MaskLayer />
                    <div className='popup-modal'>
                        <span className='close-btn' onClick={this.handleClose}><Icon type='close'/></span>
                        {/* <span className='close-tip'><span className='second-box'>{seconds}</span>秒后自动关闭</span> */}
                        <a href={url} target='_blank' onClick={this.handleClick}>
                            <img src={imgUrl} alt={title} />
                        </a>
                    </div>
                </div>
            </Portal>
        )
    }
}