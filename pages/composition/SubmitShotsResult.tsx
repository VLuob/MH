import { Component } from 'react'

import HeadComponent from '@components/common/HeadComponent'
import SubmitShotsResultContainer from '@containers/composition/SubmitShotsResult'


export default class SubmitShotsResult extends Component {
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
                <HeadComponent title={'作品提交结果 - 梅花网'} />
                <SubmitShotsResultContainer query={query} />
            </>
        )
    }
}