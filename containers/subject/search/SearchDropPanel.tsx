import { Component } from 'react'
import classnames from 'classnames'

import SearchHotBox from './SearchHotBox'
import SearchPopupBox from './SearchPopupBox'



export default class SearchDropPanel extends Component {


    render() {
      const { show, keywords, onSelectHot, className } = this.props
      const hasKeywords = keywords && keywords.trim() !== ''

        return (
          <div 
            className={classnames(
              'search-drop-panel', 
              'show',
              className,
            )}
            >
              {hasKeywords 
              ? <SearchPopupBox
                  keywords={keywords}
                />
              : <SearchHotBox
                  onSelect={onSelectHot}
              />}
          </div>
        )
    }
}