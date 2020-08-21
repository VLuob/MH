import { Component } from 'react'
import { observer, inject } from 'mobx-react'

import isEqual from 'lodash/isEqual'
import debounce from 'lodash/debounce'
import { AutoComplete, Tag } from 'antd'

import './index.less'

const AutoOption = AutoComplete.Option

@inject(stores => {
  const { compositionStore } = stores.store
  const { brandSuggestion } = compositionStore
  return {
    compositionStore,
    brandSuggestion,
  }
})
@observer
class ServiceBrandField extends Component {
  constructor(props) {
    super(props)

    this.state = {
      brands: props.brands || [],
      inputKey: '',
    }

    this.handleBrandSearch = debounce(this.handleBrandSearch, 500)
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEqual(nextProps.brands, prevState.brands)) {
      return {
        brands: nextProps.brands,
      }
    }
    return {}
  }

  handleInputChange = (e) => {
    const inputKey = e.target.value
    this.setState({ inputKey })
  }

  handleClose = (record) => {
    const { brands } = this.state
    const newBrands = brands.filter(item => item.brandId !== record.brandId)
    this.setState({ brands: newBrands })
    this.handleConfirm(newBrands)
  }

  handleBrandSelect = (value, option) => {
    const { brands } = this.state
    const record = option.props.item
    if (!brands.some(item => item.brandId === record.brandId)) {
      const newBrands = [...brands, record]
      this.setState({ brands: newBrands })
      this.handleConfirm(newBrands)
    }
  }

  handleBrandSearch = (keywords) => {
    const { compositionStore } = this.props;
    compositionStore.fetchBrandSuggestion({ keywords })
  }

  handleConfirm(brands) {
    const { onChange } = this.props;
    if (onChange) {
      onChange(brands);
    }
  }

  renderBrandOption(item) {
    const labelText = `${item.chName}（${item.spellCode}）`;
    return (
      <AutoOption key={item.id} item={item} text={labelText}>
        <div className="global-search-item">
          <span className="global-search-item-name">
            {labelText}
          </span>
        </div>
      </AutoOption>
    )
  }

  render() {
    const {
      brandSuggestion
    } = this.props
    const { brands, inputKey } = this.state
    const brandOptions = brandSuggestion.map(this.renderBrandOption)

    return (
      <div className="brand-field-wrapper">
        <AutoComplete
          className="global-search"
          style={{ width: '100%' }}
          allowClear
          dataSource={brandOptions}
          onSelect={this.handleBrandSelect}
          onSearch={this.handleBrandSearch}
          // onChange={this.handleInputChange}
          placeholder="请输入服务过的品牌"
          optionLabelProp="text"
        />
        <div className="brand-tags">
          {brands.map((item, index) => {
            return (
              <Tag
                key={item.id + index}
                closable
                onClose={e => this.handleClose(item)}
              >{item.chName}</Tag>
            )
          })}
        </div>
      </div>
    )
  }
}

export default ServiceBrandField