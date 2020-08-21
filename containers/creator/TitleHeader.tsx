import { Component } from 'react'

export default class TitleHeader extends Component<Props, State> {
    render() {
        const { name } = this.props
        return (
            <div className='titleHeader'>
                <header>
                    <span>{name}</span>
                </header>
            </div>
        )
    }
}