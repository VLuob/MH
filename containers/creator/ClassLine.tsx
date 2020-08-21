import { Component } from 'react'

export default class ClassLine extends Component<Props, State> {
    render() {
        const { name } = this.props
        return (
            <div className='classLine'>
                <span>{name}</span>
                <div className='line'></div>
            </div>
        )
    }
}