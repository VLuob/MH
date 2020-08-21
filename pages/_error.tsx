import { Component } from 'react'
import Error from '@components/common/Error'

interface Props {
    statusCode: number
}

export default class ErrorPage extends Component<Props> {
    static getInitialProps({ res, err }) {
        const statusCode = res ? res.statusCode : err ? err.statusCode : null;

        return { statusCode }
    }

    render() {
        return <Error statusCode={this.props.statusCode} />
    }
}