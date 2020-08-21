import { Component } from 'react'

import HeadComponent from '@components/common/HeadComponent'
import ResultContainer from '@containers/unsubscribe/ResultContainer'


export default class Composition extends Component {
    static async getInitialProps(ctx) {
      const { req, query, asPath } = ctx
  
        return { 
          asPath, 
          query, 
        }
    }

    render() {
        const { query } = this.props
  

        return (
            <>
                <HeadComponent title={'邮件退订成功 - 梅花网'} />
                <ResultContainer query={query} />
            </>
        )
    }
}