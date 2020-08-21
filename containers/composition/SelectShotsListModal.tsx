import React, { PureComponent } from 'react';
import { observer, inject } from 'mobx-react'
import debounce from 'lodash/debounce';
import moment from 'moment';
import {
  Button,
  Input,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Radio,
  Select,
  DatePicker,
  Avatar,
  Spin,
  message,
} from 'antd'

import {
  CompositionTypes,
  CompositionStatus,
} from '@base/enums';


const FormItem = Form.Item;

const typeMap = {
  [CompositionTypes.SHOTS]: '作品',
  [CompositionTypes.ARTICLE]: '文章',
}


@inject(stores => {
  const { compositionStore, accountStore } = stores.store
  return {
      compositionStore,
      compositionsData: compositionStore.compositionsData || {},
      authors: compositionStore.authors,
      currentUser: accountStore.userClientInfo || {},
  }
})
@observer
@Form.create()
class SelectShotsListModal extends PureComponent {
  constructor(props) {
    super(props);
  }

  state = {
    keywords: '',

    selectedRowKeys: [],
  }

  columns = [
    {
      title: '标题',
      dataIndex: 'title',
      width: 600,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 80,
      render: (val) => <span>{typeMap[val]}</span>,
    },
    {
      title: '创作者',
      dataIndex: 'authorName',
      width: 230,
    },
    {
      title: '发布时间',
      dataIndex: 'gmtPublished',
      width: 220,
      render: (val) => <span>{moment(val).format('YYYY-MM-DD HH:mm')}</span>,
    },
  ]

  componentDidMount() {
    const { compositionsData } = this.props;
    const list = compositionsData.list || []
    if (list.length > 0) {
      return
    }
    this.requestCompositions();
  }

  requestCompositions(option={}) {
    const { compositionsData, compositionStore, currentUser, authors } = this.props;
    const authorIds = authors.map(item => item.id)
    const data = compositionsData || {};
    const terms = data.terms || {};
    const term = {
      type: CompositionTypes.SHOTS,
      status: CompositionStatus.PASSED,
      authors: authorIds,
      ...option.term,
    }
    
    const sort = option.sort || [
    //   {
    //     "key": "views",
    //     "value": "desc"
    // }, {
    //     "key": "favors",
    //     "value": "desc"
    // }, {
    //     "key": "degree",
    //     "value": "desc"
    // }, {
    //     "key": "comments",
    //     "value": "desc"
    // }, {
    //     "key": "collections",
    //     "value": "desc"
    // }, {
    //     "key": "downloads",
    //     "value": "desc"
    // }, 
    {
        "key": "gmtPublish",
        "value": "desc"
    }]

    compositionStore.fetchCompositions({
      terms: {
        term,
        sort,
        page: option.page || 1,
        limit: option.limit || terms.limit || 50,
        keywords: option.keywords,
      }
    })
  }


  handleSearch = () => {
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const values = {
        keywords: fieldsValue.keywords,
      }
      this.requestCompositions(values);
    });
  }

  handleConfirm = () => {
    const { onConfirm } = this.props;
    const { selectedRowKeys } =  this.state;
    if (onConfirm) {
      onConfirm(selectedRowKeys);
    }
  }


  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    // console.log('selectedRowKeys', selectedRowKeys, selectedRows)
    this.setState({ selectedRowKeys });
  };


  render() {
    const { 
      compositionsData,
      visible, 
      loading,
      onCancel,
      form, 
    } = this.props;
    const {
      keywords,
      selectedRowKeys,
    } = this.state;

    const list = compositionsData.list || [];
    const pagination = compositionsData.pagination || {};


    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
      getCheckboxProps: record => ({
        disabled: record.disabled,
      }),
    };
  
    return (
      <Modal
        destroyOnClose
        className="inner-shots-modal"
        visible={visible}
        onCancel={() => onCancel()}
        width={1200}
        footer={null}
      >
        <div className="inner-shots-list-modal">
          <div className="header">添加作品</div>
          <div className="condition-form">
            <Form layout="horizontal">
              <Row>
                <Col span={16}>
                  <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} label="搜索作品">
                    {form.getFieldDecorator('keywords', {
                      initialValue: keywords
                    })(<Input.Search placeholder="请输入关键词" onSearch={this.handleSearch}/>)}
                  </FormItem>
                </Col>
                <Col span={8}>
                    <div className="condition-btns">
                      <Button type="primary" className="themes" onClick={this.handleConfirm}>添加作品</Button>
                    </div>
                </Col>
              </Row>
            </Form>
          </div>
          <div className="shots-list-container">
            <div className="shots-list">
              <Table
                rowKey={'compositionId'}
                loading={loading}
                columns={this.columns}
                scroll={{y: 400}}
                dataSource={list}
                pagination={false}
                rowSelection={rowSelection}
              />
            </div>
            <div className="list-bottom">
                共有 {compositionsData.total || 0} 作品
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default SelectShotsListModal