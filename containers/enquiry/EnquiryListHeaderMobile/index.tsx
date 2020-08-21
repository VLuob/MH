import { Dropdown, Menu, Button, } from 'antd'
import { EnquirySortType } from '@base/enums'
import ClassifyDropdown from '@components/common/ClassifyDropdown'
import CustomIcon from '@components/widget/common/Icon'

import './index.less'

const sortFilters = [
  { id: EnquirySortType.RECOMMEND, label: '推荐' },
  { id: EnquirySortType.HOT, label: '热门' },
  { id: EnquirySortType.NEWEST, label: '最新' },
]

const budgetFilters = [
  { id: 0, label: '全部' },
  { id: 1, label: '0-2万' },
  { id: 2, label: '2-5万' },
  { id: 3, label: '5-20万' },
  { id: 4, label: '20-50万' },
  { id: 5, label: '50万以上' },
  { id: 6, label: '按质定价' },
]

const EnquiryListHeader = (props) => {
  const { onSortChange, onBudgetChange, onFormChange, onAreaChange, onPublish, categories = [], forms = [], sort, budgetType = 0, formCode = 0, provinceId, cityId } = props
  const handleSortChange = (e) => {
    if (onSortChange) onSortChange(e.key)
  }
  const handleFormChange = (code) => {
    if (onFormChange) onFormChange(code)
  }
  const handleBudgetChange = (e) => {
    if (onBudgetChange) onBudgetChange(e.key)
  }

  const sortItem = sortFilters.find(item => item.id === Number(sort)) || sortFilters[0]
  const budgetItem = budgetFilters.find(item => item.id === Number(budgetType)) || { id: '', label: '预算' }

  return (
    <div className="enquiry-top-bar mb-enquiry-top-bar">
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
              <div>
                <span className="text">{sortItem.label}</span>
                <CustomIcon name="arrow-down" />
              </div>
            </Dropdown>
          </div>
          <div className="enquiry-nav-item">
            <ClassifyDropdown
              classifyName="形式"
              currentId={Number(formCode)}
              dataSource={forms}
              onChange={handleFormChange}
              renderTitle={(record) => <div>
                <span className="text">{record.name || '形式'}</span>
                <CustomIcon name="arrow-down" />
              </div>}
            />
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
              <div>
                <span className="text">{budgetItem.id ? budgetItem.label : '报价'}</span>
                <CustomIcon name="arrow-down" />
              </div>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnquiryListHeader