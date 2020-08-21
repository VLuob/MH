import { Component } from 'react'

interface Props {
    children: object
    navContainer: object
}

export default class CreatorLayout extends Component<Props> {
    render() {
        const { children, navContainer } = this.props

        return (
            <div className='creator-layout'>
                {navContainer && <div className='creator-nav'>
                    {navContainer}
                </div>}
                <div className='creator-container'>
                    {children}
                </div>
            </div>
        )
    }
}