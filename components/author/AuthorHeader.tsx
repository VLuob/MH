import { Icon, Input } from 'antd'

const Search = Input.Search

const AuthorHeader = ({ placeholder, searchFn, meta }) => {
    return (
        <div className='author-header clearfix'> 
            <span className='header-count'>{meta}</span>
            <Search 
                className='header-input'
                prefix={<Icon type='search' />}
                placeholder={placeholder}
                onSearch={value => searchFn(value)}
                style={{ width: 200 }}
            />
        </div>
    )
}

export default AuthorHeader