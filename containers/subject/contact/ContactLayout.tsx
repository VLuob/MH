import { Component } from 'react'

export default class ContactLayout extends Component {
    render() {
        const { children, bannerContent } = this.props

        return (
            <div className='contact-layout'>
                <div className='contact-banner'>
                    {bannerContent}
                </div>
                <div className='contact-content'>
                    {children}
                </div>
            </div>
        )
    }
}