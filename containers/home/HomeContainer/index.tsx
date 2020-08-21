import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import Main from '../Main'
import Side from '../Side'
import SecondHeader from '@containers/common/SecondHeader'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'

@inject(stores => {
  const { globalStore, compositionStore } = stores.store
  const { isMobileScreen } = globalStore
  const { classificationsAll } = compositionStore
  return {
    isMobileScreen,
    classificationsAll,
  }
})
@observer
class HomeContainer extends Component {
  handleFormSelect = (code) => {
    location.href = `/shots!0!0!${code}!0!0`
  }

  render() {
    const { isMobileScreen, classificationsAll, query } = this.props
    const forms = classificationsAll.forms || []

    return (
      <>
      {isMobileScreen && 
        <MbNavigatorBar 
          hideBackBtn 
          showTitle 
          title={<img src="/static/images/logo_home_mb.svg" />} 
        />}
      
      <SecondHeader 
        hideNav 
        navContainerClass="media-main-layout"
        forms={forms} 
        onFormSelect={this.handleFormSelect} 
      />
      <div className='common-layout media-main-layout'>
        <main className='main-layout'>
          <Main
            query={query}
          />
        </main>
        {!isMobileScreen && <aside className='aside-layout'>
          <Side />
        </aside>}
      </div>
    </>
    )
  }
}

export default HomeContainer