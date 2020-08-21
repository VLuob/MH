import { Component } from 'react'

export default class SearchLayout extends Component {
    render() {
        const { navContainer, children } = this.props

        return (
            <div className='search-main-layout'>
                <nav>{navContainer}</nav>
                <article>
                    {children}
                </article>
            </div>
        )
    }
}