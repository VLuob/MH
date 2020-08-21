import { Component } from 'react'

export default class Layout extends Component {
    render() {
        const { children } = this.props

        return (
            <div className='main-layout'>
                {children}
            </div>
        )
    }
}