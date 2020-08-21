import { Component } from 'react'
import { Input } from 'antd'

const Search = Input.Search
 
export default class subEmailBox extends Component {
    handleSearch = e => {
        const { subFn } = this.props

        subFn({ email: e })
    }

    render() {
        return (
            <div className='sub-email-box'>
                <Search className='sub-email'
                    placeholder='请输入您的电子邮箱'
                    enterButton='订阅'
                    size='large'
                    onSearch={value => this.handleSearch(value)}
                />
            </div>
        )
    }
}