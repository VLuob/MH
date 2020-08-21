
import { useState, Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Form, Button, Modal, Input, Radio, message } from 'antd'
import { InvoiceType } from '@base/enums'

import './InvoiceForm.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group


@inject(stores => {
  const { orderStore, accountStore } = stores.store
  const { invoiceData } = orderStore
  const { currentUser } = accountStore
  return {
    orderStore,
    invoiceData,
    currentUser,
  }
})
@observer
@Form.create()
export default class InvoiceForm extends Component {
  state = {
    invoiceType: 1,
    applyLoading: false,
  }
  
  okHandle = () => {
    const { form, orderIds } = this.props
    form.validateFields((err, fieldsValue) => {
      // console.log(fieldsValue)
      if (err) return;
      // form.resetFields();
      // handleSubmit(fieldsValue);
      this.handleApply(fieldsValue)
    });
  };

  handleApply = async (fields) => {
    const { orderIds, orderStore, currentUser, handleSuccess } = this.props
    const settingStr =  {...fields, userId: currentUser.id}

    this.setState({applyLoading: true})
    const saveRes = await orderStore.setInvoice({settingStr})
    if (saveRes.success) {
      const saveInvoiceData = saveRes.data || {}
      const param = {
        invoiceId: saveInvoiceData.id,
        tradeIds: orderIds.join(','),
      }
      const applyRes = await orderStore.applyInvoice(param)
      if (applyRes.success) {
        message.success('发票申请成功')
        handleSuccess()
      } else {
        message.error('发票申请失败')
      }
    } else {
      message.error(saveRes.data.msg || '发票保存失败')
    }
    this.setState({applyLoading: false})
  } 

  changeType = (e) => {
    const type = e.target.value
    this.setState({invoiceType: type})
  }

  render() {
    const {
      form,
      visible,
      handleVisible,
      invoiceData,
    } = this.props
    const { 
      invoiceType,
      applyLoading,
    } = this.state

    const { loading } = invoiceData
    const invoice = invoiceData.invoice || {}
    
    return (
      <Modal
        destroyOnClose
        title="申请发票"
        visible={visible}
        onCancel={() => handleVisible()}
        width={600}
        footer={null}
      >
        <div className="invoice-form-container">
          <FormItem>
            <div className="invoice-form-tabs">
              {form.getFieldDecorator('type', {
                rules: [{required: true, message: '请填写注册电话'}],
                initialValue: invoiceType,
              })(
                <RadioGroup onChange={this.changeType}>
                  <Radio value={InvoiceType.BASE}>普通发票</Radio>
                  <Radio value={InvoiceType.ADDED}>增值税发票</Radio>
                </RadioGroup>
              )}
            </div>
          </FormItem>
          <FormItem label={invoiceType === 2 ? '单位名称' : '发票抬头'}>
            {form.getFieldDecorator('title', {
              rules: [{required: true, message: `请填写${invoiceType === 2 ? '单位名称' : '发票抬头'}`}],
              initialValue: invoice.title
            })(<Input placeholder={`请填写${invoiceType === 2 ? '单位名称' : '发票抬头'}`} />)}
          </FormItem>
          {invoiceType === 2 && 
          <>
          <FormItem label="注册地址">
            {form.getFieldDecorator('registeredAddress', {
              rules: [{required: true, message: '请填写注册地址'}],
              initialValue: invoice.registeredAddress
            })(<Input placeholder="请填写注册地址" />)}
          </FormItem>
          <FormItem label="注册电话">
            {form.getFieldDecorator('registeredPhone', {
              rules: [{required: true, message: '请填写注册电话'}],
              initialValue: invoice.registeredPhone
            })(<Input placeholder="请填写注册电话" />)}
          </FormItem>
          <FormItem label="开户行名称">
            {form.getFieldDecorator('bank', {
              rules: [{required: true, message: '请填写开户行名称'}],
              initialValue: invoice.bank
            })(<Input placeholder="请填写开户行名称" />)}
          </FormItem>
          <FormItem label="开户账号">
            {form.getFieldDecorator('bankAccount', {
              rules: [{required: true, message: '请填写开户账号'}],
              initialValue: invoice.bankAccount
            })(<Input placeholder="请填写开户账号" />)}
          </FormItem>
          </>}
          <FormItem label="纳税人识别号">
            {form.getFieldDecorator('taxpayerIdentity', {
              rules: [{required: true, message: '请填写纳税人识别号'}],
              initialValue: invoice.taxpayerIdentity
            })(<Input placeholder="请填写纳税人识别号" />)}
          </FormItem>
          <FormItem label="收件人">
            {form.getFieldDecorator('recipients', {
              rules: [{required: true, message: '请填写收件人'}],
              initialValue: invoice.recipients
            })(<Input placeholder="请填写收件人" />)}
          </FormItem>
          <FormItem label="收件地址">
            {form.getFieldDecorator('address', {
              rules: [{required: true, message: '请填写收件地址'}],
              initialValue: invoice.address
            })(<Input placeholder="请填写收件地址" />)}
          </FormItem>
          <FormItem label="联系电话">
            {form.getFieldDecorator('phone', {
              rules: [{required: true, message: '请填写联系电话'}],
              initialValue: invoice.phone
            })(<Input placeholder="请填写联系电话" />)}
          </FormItem>
          <div className="invoice-form-bottom">
            <Button onClick={e => handleVisible()}>取消</Button>
            <Button className="themes" onClick={this.okHandle} loading={applyLoading}>确定</Button>
          </div>
        </div>
      </Modal>
    )
  }
}
