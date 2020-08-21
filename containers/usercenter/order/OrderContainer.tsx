import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'
import { Tabs, Table, Button, Modal, message, Dropdown, Menu, Icon, Progress } from 'antd'
import moment from 'moment'
import md5 from 'md5'

import { CompositionType, OrderStatus } from '@base/enums'
import PartLoading from '@components/features/PartLoading'
import UserIdentityTag from '@components/widget/common/UserIdentityComp'
import EmptyComponent from '@components/common/EmptyComponent'

import InvoiceForm from './InvoiceForm'
import { orderApi, payApi } from '@api'
import { config, utils, helper } from '@utils'
import sysOrder from '@base/system/order'
import { EditionType, EditionScope, AddedServiceType, PayType, InvoiceStatus } from '@base/enums'

import './style.less'

const { TabPane } = Tabs

const editionMap = sysOrder.filters.editionMap
const serviceMap = sysOrder.filters.serviceMap

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

@inject(stores => {
  const { orderStore, globalStore } = stores.store
  const { qiniuToken } = globalStore
  const { authorEditions, orderData, invoiceData } = orderStore
  
  return {
    globalStore,
    qiniuToken,
    orderStore,
    authorEditions,
    orderData,
    invoiceData,
  }
})
@observer
export default class OrderContainer extends Component {
  state = {
    selectedRowKeys: [], // Check here to configure the default column
    applyInvoiceTradeIds: [],
    loading: false,

    invoiceModalVisible: false,

    voucherVisible: false,
    voucherLoading: false,
    voucherUploadStatus: '',
    voucherPrecentage: 0,
    voucherBaseUrl: '',
    voucherUploadUrl: '',
  };

  hasVoucherSave = false

  columns = [
    {
      title: '订单编号',
      dataIndex: 'tradeNo',
      key: 'tradeNo',
    },
    {
      title: '购买时间',
      dataIndex: 'gmtCreate',
      key: 'gmtCreate',
      render: (val, record) => <span>{moment(val).format('YYYY-MM-DD HH:mm')}</span>
    },
    {
      title: '创作者',
      dataIndex: 'authorNickName',
      render: (val, record) => {
        if (record.authorId) {
          return <a href={`/teams/${record.authorId}/creation`} target="_blank">{val}</a>
        } else {
          return <span>{val}</span>
        }
      }
    },
    {
      title: '订单类型',
      dataIndex: 'editionType',
      key: 'editionType',
      render: (val, record) => {
        let editionNames = []
        if (val) {
          editionNames.push(editionMap[val])
        }
        if (record.serviceType) {
          const serviceTypeArr = record.serviceType.split(',').map(v => Number(v))
          serviceTypeArr.forEach((v,i) => {
            editionNames.push(serviceMap[v])
          })
        }

        return <div style={{width:'140px'}}>{editionNames.join(' + ')}</div>
      }
    },
    {
      title: '订单时长',
      dataIndex: 'unit',
      key: 'unit',
      render: (val, record) => <span>{!!record.editionType ? `${val}年` : moment(record.gmtCreate).format('YYYY-MM-DD')}</span>
    },
    {
      title: '支付类型',
      dataIndex: 'mode',
      key: 'mode',
      render: (val) => {
        const payMap = {
          [PayType.ALIPAY]: '支付宝',
          [PayType.WXPAY]: '微信',
          [PayType.BANKPAY]: '银行电汇',
        }
        return <span>{payMap[val]}</span>
      }
    },
    {
      title: '订单金额',
      dataIndex: 'extendDescription',
      key: 'extendDescription',
      render: (val) => {
        const extendData = val ? JSON.parse(val) : {}
        return <span>{extendData.totalFee}元</span>
      }
    },
    {
      title: '实付金额',
      dataIndex: 'totalFee',
      key: 'totalFee',
      render: (val) => <span>{val}元</span>
    },
    {
      title: '交易状态',
      dataIndex: 'status',
      key: 'status',
      render: (val, record) => {
        if (val === OrderStatus.PAID) {
          if (record.totalFee < 500) {
            return <span>已支付</span>
          } else if (record.invoiceStatus === InvoiceStatus.NOT_APPLIED) {
            return <span>已支付/<a onClick={e => this.handleApplyInvoice(record)}>申请发票</a></span>
          } else {
            return <span>已支付/已申请发票</span>
          }
        } else if (val === OrderStatus.CANCELLED) {
          return <span style={{color: '#ff6969'}}>已取消</span>
        } else {
          if (record.mode === PayType.BANKPAY) {
            if (record.payVoucher) {
              return <span>已提交/<a href={record.payVoucher} target="_blank">查看付款凭证</a> <a onClick={e => this.handleVoucherVisible(true, record)}>重新上传</a></span>
            } else {
              return <span>已提交/<a onClick={e => this.handleVoucherVisible(true, record)}>上传付费凭证</a></span>
            }
          } else {
            return <span>未支付/<a style={{color: '#168dd7'}} onClick={e => this.handlePayClick(record)}>去支付</a></span>
          }
        }
      }
    },
    {
      title: '发票状态',
      dataIndex: 'invoiceStatus',
      key: 'invoiceStatus',
      render: (val, record) => {
        const invoiceMap = {
          [InvoiceStatus.NOT_APPLIED]: '未申请',
          [InvoiceStatus.PENDING]: <span style={{color: 'red'}}>{'待处理'}</span>,
          [InvoiceStatus.PROCESSED]: <span style={{color: '#168dd7'}}>{'已处理'}</span>,
          [InvoiceStatus.DELIVERY]: <span style={{color: '#52c41a'}}>{'已邮寄'}</span>,
        }
        if (val === InvoiceStatus.DELIVERY) {
          const postRecord = JSON.parse(record.postRecord || '{}')
          const menu = <Menu>
            <Menu.Item>邮寄时间：{postRecord.gmtPost ? moment(postRecord.gmtPost).format('YYYY-MM-DD') : ''}</Menu.Item>
            <Menu.Item>快递单号：{postRecord.postNo} <input style={{opacity: 0, position: 'absolute', left: '0px', width: '100%'}} onClick={this.handleCopy} defaultValue={postRecord.postNo} /></Menu.Item>
            <Menu.Item>快递公司：{postRecord.postCompany}</Menu.Item>
            <Menu.Item>发票号码：{postRecord.invoiceNo}</Menu.Item>
          </Menu>
          return <Dropdown overlay={menu} placement="bottomRight"><a style={{color: '#52c41a'}}>{invoiceMap[val]} <Icon type="down" /></a></Dropdown>
        } else {
          return <span>{invoiceMap[val]}</span>
        }
        // return <span>{val === InvoiceStatus.NOT_APPLIED ? '未申请' : '已申请'}</span>
      }
    },
    {
      title: '操作',
      render: (val,record) => {
        if (record.status === OrderStatus.UNPAID) {
          return <a style={{color: '#ff6969'}} onClick={e => this.handleCancelOrder(record)}>取消订单</a>
        } else {
          return ''
        }
      }
    },
  ]

  componentDidMount() {
    this.requestOrders()
    this.initQiniuToken()
  }

  initQiniuToken() {
    const { globalStore, qiniuToken } = this.props
    if (!qiniuToken) {
      globalStore.fetchQiniuToken()
    }
  }

  requestOrders() {
    const { orderStore } = this.props
    orderStore.fetchOrders()
  }


  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  handleCopy = (e) => {
    const obj = e.target
    obj.select();
    document.execCommand("Copy");
    // const inputJs = obj.createTextRange();
    // inputJs.execCommand("Copy")
    // var clipBoardContent=this.location.href;
    // window.clipboardData.setData("Text",postNo);
    message.success("复制成功!");
  }

  handleApplyInvoice = (record) => {
    this.setState({applyInvoiceTradeIds: [record.id]})
    this.handleInvoiceApply()
  }

  handleApplyInvoiceBetch = () => {
    const { selectedRowKeys } = this.state
    this.setState({applyInvoiceTradeIds: selectedRowKeys})
    this.handleInvoiceApply()
  }

  handleInvoiceApply = () => {
    const { invoiceData, orderStore } = this.props
    const { invoice, loading } = invoiceData
    if (loading) {
      return
    }
    if (!invoice) {
      orderStore.fetchInvoice().then(res => {
        if (res.success) {
          this.handleInvoiceModalVisible(true)
        } else {
          message.error(res.data.msg)
        }
      })
    } else {
      this.handleInvoiceModalVisible(true)
    }
  }

  handleInvoiceModalVisible = (flag) => {
    this.setState({invoiceModalVisible: !!flag})
  }

  handleCancelOrder = (record) => {
    const { orderStore } = this.props
    Modal.confirm({
      title: '是否确定取消该订单？',
      cancelText: '取消',
      okText: '确定',
      onOk: () => {
        orderStore.cancelOrder({tradeId: record.id})
      }
    })
  }

  handleInvoiceSuccess = () => {
    this.requestOrders()
    this.setState({selectedRowKeys: []})
    this.handleInvoiceModalVisible(false)
  }

  handlePayClick = (record) => {
    // const fields = this.arrangeFields(record)
    // fields.scope = fields.scope + '&p=' + PayType.ALIPAY
    // const params = {
    //   ...fields,
    //   callback_url: config.CURRENT_DOMAIN + '/pricing/pay/result?',
    //   // sign 是 tradeName + totalFee + scope 的md5加密，
    //   sign: md5(fields.tradeName + parseFloat(fields.totalFee).toFixed(2) + fields.scope + 'meihua8888'),
    // }
    // // console.log(fields.tradeName + parseFloat(fields.totalFee).toFixed(2) + fields.scope + 'meihua8888')
    // payApi.alipay(params)
  }

  // arrangeFields(record) {
  //   const { pricingScope, edition, payUnit, payWay, addedTypes, authorId } = this.state
  //   const {currentEditionItem, selectAddeds, totalMoney} = this.getSelectObjects()
  //   const extendData = this.orderExtendDescription
  //   let param = {
  //     totalFee: totalMoney,
  //     extendDescription: JSON.stringify(extendData),
  //     scope: `&v=${edition}&a=${authorId}&s=${addedTypes.join(',')}&u=${payUnit}`,
  //     tradeName: '',
  //   }
  //   const serviceNames = addedTypes.map(v => serviceMap[v])
  //   if (pricingScope === EditionScope.EDITION_PACKAGE) {
  //     const labels = [currentEditionItem.name, ...serviceNames]
  //     param.tradeName = `梅花网版本订单-${labels.join(' + ')}`
  //     param.description = ''
  //   } else {
  //     param.tradeName = `梅花网增值服务订单-${serviceNames.join(' + ')}`
  //     param.description = ''
  //   }
  //   return param
  // }

  handleVoucherVisible = (flag:Boolean=false, record: any=null) => {
    const nextState: any = {voucherVisible: !!flag, voucherRecord: record}
    if (record) {
      nextState.voucherUploadStatus = ''
    }
    if (!flag) {
      this.hasVoucherSave = false
    }
    this.setState(nextState)
  }

  handleCloseVoucher = () => {
    if (this.hasVoucherSave) {
      Modal.confirm({
        title: '您上传的付款凭证还未保存提交，是否提交保存？',
        okText: '保存',
        cancelText: '关闭',
        onOk: () => {
          this.handleVoucherSubmit()
        },
        onCancel: () => {
          this.handleVoucherVisible()
        }
      })
      return
    }
    this.handleVoucherVisible()
  }

  handleUploadVoucher = () => {
    const inputFile = document.createElement('input')
    inputFile.type = 'file'
    inputFile.click()
    inputFile.addEventListener('change', (e) => {
      const file = e.target.files[0]
      // console.log(file)
      getBase64(file, (voucherBaseUrl) => {
        this.setState({voucherBaseUrl})
      })
      this.hasVoucherSave = true
      this.setState({voucherLoading: true})
      const param = {
        file,
        onProgress: (res) => {
          // console.log(res)
          this.setState({voucherPrecentage: res.total.percent, voucherUploadStatus: 'uploading'})
        },
        onError: (err) => {
          this.hasVoucherSave = false
          this.setState({voucherUploadStatus: 'error'})
        },
        onSuccess: (res) => {
          // console.log(res)
          this.setState({voucherUploadStatus: 'success', voucherBaseUrl: res.data.url})
          message.success('付款凭证上传成功')
        }
      }
      this.handleQiniuUpload(param)
    }, false)
  }

  handleQiniuUpload = ({action, data, file, filename, onProgress, onError, onSuccess}: any) => {
    const { qiniuToken } = this.props;
    const token = qiniuToken;

    helper.qiniuUpload({
      file,
      token,
      next: (res) => {
        onProgress(res)
        // const ret = {
        //   uid: file.uid,
        //   name: file.name,
        //   position: 0,
        //   percent: res.total.percent,
        //   status: 'uploading',
        // }
        // onProgress(ret, file)
      },
      error: (err) => {
        onError(err)
      },
      complete: (res) => {
        const ret = {
          data: {
            url: `${config.RESOURCE_QINIU_DOMAIN}/${res.hash}`,
          }
        }
        onSuccess(ret, file)
      },
    })
  }

  handleVoucherSubmit = () => {
    const { orderStore } = this.props
    const { voucherRecord, voucherBaseUrl } = this.state
    orderStore.savePaymentVoucher({
      tradeId: voucherRecord.id,
      payVoucher: voucherBaseUrl,
    }).then(res => {
      if (res.success) {
        message.success('提交成功')
        this.handleVoucherVisible()
      } else {
        message.error(res.data.msg)
      }
    })
  }

  render() {
    const { selectedRowKeys, applyInvoiceTradeIds, invoiceModalVisible, voucherBaseUrl, voucherLoading, voucherVisible, voucherPrecentage, voucherUploadStatus } = this.state
    const { orderData, invoiceData } = this.props
    const { totalConsure, totalInvoice, orders, editions, loading } = orderData

    const isEditionEmpty = !loading && editions.length === 0

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: record.status !== OrderStatus.PAID || record.invoiceStatus !== InvoiceStatus.NOT_APPLIED || record.totalFee < 500,
      })
    };

    return (
      <>
      <div className='common-container user-order'>
          <div className="user-header">
              <div className="title">我的订单</div>
          </div>
          {/* <div className="user-order-box">
            <Tabs className='user-tabs' size='large' defaultActiveKey={'order'} animated={false}>
                <TabPane tab={<span className="tab-text">版本套餐</span>} key={'order'}>
                  {isEditionEmpty 
                  ? <EmptyComponent text="暂无购买版本套餐" />
                  : <div className="meal-list">
                    {editions.map(item => {
                      const isFreeEdition = item.editionType === EditionType.FREE
                      const isStundardEdition = item.editionType === EditionType.STANDARD
                      const hasService = !!item.serviceType
                      let serviceTypeLabel = item.serviceType ? item.serviceType.split(',').map(v => serviceMap[Number(v)]).join(' + ') : ''
                      return (<div className="meal-item" key={item.id}>
                        <div className="author-wrap">
                          <div className="author-avatar">
                            <img src={item.authorAvatar} alt=""/>
                          </div>
                          <div className="author-info">
                            <div className="author-nick">{item.authorNickName}</div>
                            <div className="author-intro">
                              <UserIdentityTag currentType={item.authorType} />
                              <span className="author-company">{item.authorName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="meal-item-bottom">
                          <div className="text version">版本套餐：{editionMap[item.editionType]}</div>
                          {hasService && <div className="text service">增值服务：{serviceTypeLabel}</div>}
                          <div className="text expire">到期时间：{isFreeEdition ? '永久' : `${moment(item.gmtExpire).format('YYYY-MM-DD')} 到期`}</div>
                          <div className="btns">
                            {isFreeEdition && <Button className="btn-upgrade" type="primary" href={`/pricing?scope=1&v=${EditionType.STANDARD}&aid=${item.authorId}`} target="_blank">升级版本</Button>}
                            {!isFreeEdition && <Button className="btn-upgrade" type="primary" href={`/pricing?scope=1&v=${item.editionType}&aid=${item.authorId}`} target="_blank">续费套餐</Button>}
                            {isStundardEdition && <Button className="btn-upgrade primary-o" href={`/pricing?scope=1&v=${EditionType.ADVANCED}&aid=${item.authorId}`} target="_blank">升级版本</Button>}
                            {!isFreeEdition && <Button className="btn-upgrade primary-o" href={`/pricing?scope=2&added=${item.serviceType || ''}&aid=${item.authorId}`} target="_blank">购买增值功能</Button>}
                          </div>
                        </div>
                      </div>)
                    })}
                  </div>}
                </TabPane>
            </Tabs>
          </div> */}
          <div className="user-order-box">
            <div className="order-header">
              <span className="title">订单记录</span>
              <span className="intro">备注：未开发票金额满500元，才能申请增值税普通发票；发票内容为”技术服务费”，不可更改</span>
            </div>
            <div className="order-content">
              <Table 
                rowKey={'id'}
                rowSelection={rowSelection}
                dataSource={orders} 
                columns={this.columns} 
                size="middle" 
                pagination={{
                  hideOnSinglePage: true,
                }}
              />
            </div>
            <div className="order-footer">
                <span className="text">累计支付：{totalConsure}元，已开票：{totalInvoice}元，未开票：{totalConsure - totalInvoice}元</span>
                <Button className="primary-o" disabled={selectedRowKeys.length === 0} loading={invoiceData.loading} onClick={this.handleApplyInvoiceBetch} >批量申请发票</Button>
            </div>
          </div>
          {invoiceModalVisible && 
          <InvoiceForm 
            visible={invoiceModalVisible}
            handleVisible={this.handleInvoiceModalVisible}
            orderIds={applyInvoiceTradeIds}
            handleSuccess={this.handleInvoiceSuccess}
          />}
      </div>
      <Modal
        visible={voucherVisible}
        maskClosable={false}
        footer={null}
        onCancel={this.handleCloseVoucher}
      >
        <div className="voucher-uploading-container">
          <div className="voucher-content">
            {!voucherUploadStatus && 
            <div className="voucher-upload-area" onClick={this.handleUploadVoucher}>
              <span>点此上传付款凭证</span>
            </div>}
            {voucherUploadStatus && <>
            <div className="voucher-thumb">
              <img src={voucherBaseUrl} alt=""/>
            </div>
            <div className="voucher-text">
              {voucherUploadStatus === 'uploading' && <span>付款凭证上传中</span>}
              {voucherUploadStatus === 'success' && <span className="success">付款凭证上传完成</span>}
              {voucherUploadStatus === 'error' && <span className="error">付款凭证上传发生错误</span>}
            </div>
            <div className="voucher-progress">
              <Progress percent={voucherPrecentage} />
            </div>
            <div className="voucher-btns">
              {voucherUploadStatus === 'success' && <Button type="primary" onClick={this.handleVoucherSubmit}>提交</Button>}
              {voucherUploadStatus === 'error' && <Button onClick={e => this.handleVoucherVisible()}>关闭</Button>}
            </div>
            </>}
          </div>
        </div>
      </Modal>
    </>
    )
  }
}