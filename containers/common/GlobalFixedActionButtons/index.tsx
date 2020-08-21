import { Component } from 'react'
import { observer, inject } from 'mobx-react'

import FixedActionButtons from '../FixedActionButtons'

@inject(stores => {
  const { globalStore } = stores.store
  const { isMobileScreen,fixedActionData } = globalStore
  return {
    isMobileScreen,
    fixedActionData,
  }
})
@observer
class GlobalFixedActionButtons extends Component {

  render() {
    const { isMobileScreen, fixedActionData } = this.props

    return (
      !isMobileScreen && !fixedActionData.hide && <FixedActionButtons />
    )
  }
}

export default GlobalFixedActionButtons