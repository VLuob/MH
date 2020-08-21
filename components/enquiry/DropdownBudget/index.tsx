import { Dropdown, Menu, Button, } from 'antd'
import CustomIcon from '@components/widget/common/Icon'
import filters from '@base/system/filters'

const budgetFilters = filters.budgetFilters

const DropdownBudget = (props) => {
  const { onChange, type } = props
  const budgetItem = budgetFilters.find(item => item.id === Number(type)) || { id: '', label: '预算' }

  const handleBudgetChange = (e) => {
    if (onChange) onChange(e.key)
  }

  return (
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
  )
}
export default DropdownBudget