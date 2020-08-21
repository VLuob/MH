import { Component } from 'react'
import { Avatar, Icon } from 'antd'
import { utils } from '@utils'
import classNames from 'classnames'
import debounce from 'lodash/debounce'
import CIcon from '@components/widget/common/Icon'

/**
 * @params scrollDistance
 */
export default class ReturnTopComp extends Component {
    constructor(props) {
        super(props)
        this.documentScroll = debounce(this.documentScroll, 200)
    }

    state = {
        show: false,
        scrollDistance: 100
    }

    static getDerivedStateFromProps(props, state) {
         return {
             scrollDistance: props.scrollDistance || state.scrollDistance
         }
    }

    componentDidMount() {
        window.addEventListener('scroll', this.documentScroll, false)
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.documentScroll, false)
    }

    documentScroll = () => {
        const { scrollDistance } = this.state
        const scrollTop = document.body.scrollTop || document.documentElement.scrollTop

        if(scrollTop > scrollDistance) {
            this.setState({ show: true })
        } else {
            this.setState({ show: false })
        }
    }

    handleReturnTop = () => {
        // let scrollToTop = window.setInterval(function() {
        //     let pos = window.pageYOffset 

        //     if(pos > 0) {
        //         window.scrollTo(0, pos - 80) 
        //     } else {
        //         window.clearInterval( scrollToTop ) 
        //     }
        // }, 16)

        window.scrollTo({ 
            top: 0, 
            behavior: "smooth" 
        });
    }

    render() {
        const { show } = this.state

        return (
            <div className="return-top-box">
                <div className={classNames(
                    'return-top-button to-return-top',
                    {'return-top-box-showing': show }
                )} onClick={this.handleReturnTop}>
                    <span className="return-top-icon">
                        <CIcon name="return-top" />
                    </span>
                    <a className='return-top-text'>
                        返回<br/>
                        顶部
                    </a>
                </div>
                <div className='return-top-line'></div>
                <div className='return-top-button'>
                    <span className="return-top-icon">
                        <CIcon name="phone" />
                    </span>
                    <a href='/contact' className='return-top-text' target='_blank'>
                        联系<br/>
                        我们
                    </a>
                </div>
                <div className='return-top-line'></div>
                <div className='return-top-button'>
                    <span className="return-top-icon">
                        <CIcon name="feedback" />
                    </span>
                    {/* <a href='https://jinshuju.net/f/0Gzacx' className='return-top-text' target='_blank'>
                        意见<br/>
                        反馈
                    </a> */}
                    <a href='https://mingdao.com/form/037ad2adcca84916b76ac4994c94994e' className='return-top-text' target='_blank'>
                        意见<br/>
                        反馈
                    </a>
                </div>
            </div>
        )
    }
}