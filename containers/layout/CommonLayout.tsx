import { Component } from 'react'

export default class CommonLayout extends Component {
    render() {
        const { main, side } = this.props

        return (
            <div className='common-layout media-main-layout'>
                <main className='main-layout'>
                    {main}
                </main>
                <aside className='aside-layout'>
                    {side}
                </aside>
            </div>
        )
    }
}