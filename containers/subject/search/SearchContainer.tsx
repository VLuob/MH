import { Component } from 'react'
import { inject, observer } from 'mobx-react'

import NavContainer from '@containers/subject/search/NavContainer'
import ContentContainer from '@containers/subject/search/SearchContent'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'

@inject(stores => {
  const { globalStore } = stores.store
  const { isMobileScreen } = globalStore
  return {
    isMobileScreen,
  }
})
@observer
export default class SearchContainer extends Component {
    render() {
        const { keyword, navProps, query, searchType, searchFilterData, searchSrvFilterData, isMobileScreen } = this.props

        return (
          <>
          {isMobileScreen && <MbNavigatorBar />}
          <div className='search-container media-search-container'>
            <div className='search-main-layout'>
             {!isMobileScreen && <nav>
                <NavContainer
                  query={query}
                  clientKeywords={keyword} 
                  navProps={navProps}
                />
              </nav>}
              <article>
                <ContentContainer
                  query={query} 
                  activeSerKey={searchType} 
                  searchFilterData={searchFilterData} 
                  searchSrvFilterData={searchSrvFilterData}
                />
              </article>
            </div>
          </div>
          </>
        )
    }
}