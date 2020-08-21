import React from 'react'
import ReactDOM from 'react-dom'

interface Props {
    selector: string
}

export default class Portal extends React.Component<Props> {
    element: any
    
    componentDidMount() {
        this.element = document.querySelector(this.props.selector) || document.body
        this.forceUpdate()
    }

    render() {
        if (this.element === undefined) {
            return null
        }

        return ReactDOM.createPortal(this.props.children, this.element)
    }
}