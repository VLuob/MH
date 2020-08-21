import { Component } from 'react'

import HeadComponent from '@components/common/HeadComponent'
import RuleContainer from '@containers/rule/shots'



export default class RuleShots extends Component {
    static async getInitialProps(ctx) {
        const { req, query, asPath } = ctx

        return {
            asPath,
            query,
        }
    }

    render() {
        const { asPath, userInfo } = this.props

        return (
            <>
              <HeadComponent title={`梅花网作品库收录规范和编辑规范-梅花网`} />
              {/* <CommonHeader asPath={asPath} userInfo={userInfo} /> */}
              <RuleContainer />
            </>
        )
    }
}