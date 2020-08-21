import { Component } from 'react'

import HeadComponent from '@components/common/HeadComponent'
import SubmitServiceResultContainer from '@containers/composition/SubmitServiceResult'


export default class SubmitServiceResult extends Component {
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
                <HeadComponent title={'服务提交结果 - 梅花网'} />
                <SubmitServiceResultContainer query={query} />
            </>
        )
    }
}