import { Icon, Menu, Input, Dropdown } from 'antd'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const Search = Input.Search

const menu = (
    <Menu>
        <Menu.Item key='0'>
            按时间排序
        </Menu.Item>
        {/* <Menu.Item key='1'>
            bbb
        </Menu.Item> */}
    </Menu>
)

const DetailHeader = ({ meta, type, value, searchFn, onChange, placeholder, extraContent }) => {
    return (
        <div className='author-detail-header clearfix'>
            <span className='header-count'>{meta}</span>
            {searchFn && <Search
                value={value}
                onChange={value => onChange(value, type)}
                style={{ width: 200 }}
                className='header-input'
                placeholder={placeholder}
                onSearch={value => searchFn(value)}
            />}
            {extraContent && <div className="extra-content">
                {extraContent}
            </div>}
        </div>
    )
}

export default DetailHeader