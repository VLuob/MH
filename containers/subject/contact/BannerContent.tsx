import { Component } from 'react'

import backgroundPng from '@static/images/common/background.png'

export default class BannerContent extends Component {
    render() {
        return (
            <div className='banner-content'>
                <img src={backgroundPng} alt=''/>
            </div>
        )
    }
}