import { Component } from 'react'

import HeadComponent from '@components/common/HeadComponent'
import SubmitResultContainer from '@containers/composition/SubmitResultContainer'


export default class Composition extends Component {
    static async getInitialProps(ctx) {
      const { req, query, asPath } = ctx
  
        return { 
          asPath, 
          query, 
        }
    }

    render() {
        const { asPath, query, userInfo } = this.props
  

        return (
            <>
                <HeadComponent title={'创作提交成功 - 梅花网'} />
                <SubmitResultContainer query={query} />
            </>
        )
    }
}