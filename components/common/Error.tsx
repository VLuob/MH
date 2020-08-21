import { Component } from 'react'
import Head from 'next/head'

interface Props {
    statusCode: number
}

export default class Error extends Component<Props> {
    state = {
        countdown: 5,
    }

    componentDidMount() {
        this.startCountdown()
    }

    startCountdown = () => {
        if (this.countdownTimer) clearInterval(this.countdownTimer)
        this.countdownTimer = setInterval(() => {
            let countdown = this.state.countdown
            if (countdown === 0) {
                clearInterval(this.countdownTimer)
                location.href = '/'
            } else {
                countdown--
                this.setState({countdown})
            }
        }, 1000)
    } 

    render() {
        const { statusCode, pageTitle } = this.props
        const { countdown } = this.state

        let content

        switch(statusCode) {
            case 404:
                content = <div className='page-not-found-box'>
                      <div className="bg-color"></div>
                      <div className="not-found-wrapper">
                        <div className="bg-img">
                            <img src="/static/images/common/404-bg-pc.png" alt=""/>
                        </div>
                        <div className='inner-box'>
                            <img className='inner-img' src='/static/images/common/404-text.svg' alt='404' />
                            <p className='text'>抱歉，您访问的页面不存在，{countdown}秒之后跳转到首页</p>
                            <p className="desc"><a className='link' href='/'>返回梅花网首页</a></p>
                        </div>
                      </div>
                    </div>
                break
            case 500:
                content = <div className='page-not-found-box'>
                        <div className="bg-color"></div>
                        <div className="not-found-wrapper">
                          <div className="bg-img">
                              <img src="/static/images/common/404-bg-pc.png" alt=""/>
                          </div>
                          <div className='inner-box'>
                              <img className='inner-img' src='/static/images/common/internetservererror.svg' alt='500' />
                              <p className='text'>抱歉，服务器异常，{countdown}秒之后跳转到首页</p>
                              <p className="desc"><a className='link' href='/'>返回梅花网首页</a></p>
                          </div>
                          </div>
                    </div>
                break
        }

        return <>
            <Head><title>页面没有找到 - 梅花网 -营销作品宝库</title></Head>
            {content}
        </>
    }
}