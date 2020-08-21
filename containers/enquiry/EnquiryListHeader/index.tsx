import { Dropdown, Menu, Button, } from 'antd'
import { EnquirySortType } from '@base/enums'
import CustomIcon from '@components/widget/common/Icon'

import filters from '@base/system/filters'

import './index.less'

const sortFilters = [
  { id: EnquirySortType.RECOMMEND, label: '推荐' },
  { id: EnquirySortType.HOT, label: '热门' },
  { id: EnquirySortType.NEWEST, label: '最新' },
]

// const budgetFilters = [
//   { id: 0, label: '全部' },
//   { id: 1, label: '0-2万' },
//   { id: 2, label: '2-5万' },
//   { id: 3, label: '5-20万' },
//   { id: 4, label: '20-50万' },
//   { id: 5, label: '50万以上' },
//   { id: 6, label: '按质定价' },
// ]
const budgetFilters = filters.budgetFilters

const EnquiryListHeader = (props) => {
  const { onSortChange, onBudgetChange, onFormChange, sort, budgetType = 0 } = props
  const handleSortChange = (e) => {
    if (onSortChange) onSortChange(e.key)
  }
  const handleBudgetChange = (e) => {
    if (onBudgetChange) onBudgetChange(e.key)
  }

  const sortItem = sortFilters.find(item => item.id === Number(sort)) || sortFilters[0]
  const budgetItem = budgetFilters.find(item => item.id === Number(budgetType)) || { id: '', label: '预算' }

  return (
    <div className="enquiry-top-bar">
      <div className="enquiry-nav-wrapper">
        <div className="enquiry-nav">
          <div className="enquiry-nav-item">
            <Dropdown
              overlay={
                <Menu onClick={handleSortChange}>
                  {sortFilters.map(item => (
                    <Menu.Item key={item.id}>{item.label}</Menu.Item>
                  ))}
                </Menu>
              }
            >
              <Button>
                <span className="text">{sortItem.label}</span>
                <CustomIcon name="arrow-down" />
              </Button>
            </Dropdown>
          </div>
          <div className="enquiry-nav-item">
            <Dropdown
              overlay={
                <Menu onClick={handleBudgetChange}>
                  {budgetFilters.map(item => (
                    <Menu.Item key={item.id}>{item.label}</Menu.Item>
                  ))}
                </Menu>
              }
            >
              <Button>
                <span className="text">{budgetItem.label}</span>
                <CustomIcon name="arrow-down" />
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnquiryListHeader