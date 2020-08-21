import { Component } from 'react'

import HeadComponent from '@components/common/HeadComponent'
import UnsubscribeContainer from '@containers/unsubscribe/UnsubscribeContainer'


export default class Composition extends Component {
    static async getInitialProps(ctx) {
      const { req, query, asPath } = ctx
  
        return { 
          asPath, 
          query, 
        }
    }

    render() {
        const { asPath, query } = this.props

        return (
            <>
                <HeadComponent title={'邮件退订 - 梅花网'} />
                <UnsubscribeContainer query={query} />
            </>
        )
    }
}