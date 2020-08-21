import { Component } from 'react'

import HeadComponent from '@components/common/HeadComponent'
import InviteContainer from '@containers/composition/InviteContainer'


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
                <HeadComponent title={'邀请共同创作者 - 梅花网'} />
                <InviteContainer query={query} />
            </>
        )
    }
}