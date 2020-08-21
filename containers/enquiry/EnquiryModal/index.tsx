import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Modal, } from 'antd'

import EnquiryForm from '../EnquiryForm'
import EnquiryAuthors from '../EnquiryAuthors'
import EnquiryResult from '../EnquiryResult'

import './index.less'

const EnquiryStep = {
  FORM_SUBMIT: 1,
  AUTHOR_SUBMIT: 2,
  COMPLETED: 3,
}

@inject((stores: any) => {
  const { accountStore, letterStore, compositionStore, globalStore } = stores.store
  const { referrerSource } = globalStore
  const { enquiryUi, enquiryData } = letterStore
  const { currentUser } = accountStore
  const { categories, forms } = compositionStore

  return {
    accountStore,
    letterStore,
    compositionStore,

    referrerSource,
    currentUser,
    enquiryUi,
    enquiryData,
    categories,
    forms,
  }
})
@observer
class EnquiryModal extends Component {
  state = {
    enquiryStep: EnquiryStep.FORM_SUBMIT,
    enquiryId: 0,
    formId: 0,
    enquiryValues: {},
  }

  handleCancel = (e) => {
    const { letterStore } = this.props
    letterStore.closeEnquiry()
    setTimeout(() => {
      this.setState({enquiryStep: EnquiryStep.FORM_SUBMIT})
    }, 1000)
  }

  handleEnquiryPublishSuccess = ({ values, formId, enquiryId }) => {
    const { enquiryData } = this.props
    this.setState({
      enquiryId,
      formId,
      enquiryValues: values,
      enquiryStep: enquiryData.disabledRecommendAuthors ? EnquiryStep.COMPLETED : EnquiryStep.AUTHOR_SUBMIT,
    })
  }

  handleEnquiryBetchSuccess = (ids) => {
    this.setState({
      enquiryStep: EnquiryStep.COMPLETED,
    })
  }

  handleResultOk = () => {
    // location.href = '/personal/letter'
    window.open('/personal/letter')
  }

  render() {
    const {
      enquiryStep,
      formId,
      enquiryValues,
    } = this.state
    const { enquiryUi, currentUser, categories, forms, enquiryData } = this.props
    const user = currentUser || {}
    const isLogin = !!user.id

    const isFormStep = enquiryStep === EnquiryStep.FORM_SUBMIT
    const isAuthorStep = enquiryStep === EnquiryStep.AUTHOR_SUBMIT
    const isCompletedStep = enquiryStep === EnquiryStep.COMPLETED
    const hasRelationExtend = !!enquiryData.relationExtend

    return (
      <>
        <Modal
          className="enquiry-modal"
          title={hasRelationExtend ? '寻个准价' : '询价'}
          destroyOnClose
          maskClosable={false}
          visible={enquiryUi.visible}
          onCancel={this.handleCancel}
          width={600}
          footer={null}
        >
          {isFormStep && <div className="enquiry-publish-section form-section">
            <EnquiryForm
              onSuccess={this.handleEnquiryPublishSuccess}
            />
          </div>}
          {isAuthorStep && <div className="enquiry-publish-section author-section">
            <EnquiryResult hideBtns />
            <EnquiryAuthors
              cancelText="关闭"
              formId={formId}
              enquiryValues={enquiryValues}
              onSuccess={this.handleEnquiryBetchSuccess}
              onCancel={this.handleCancel}
            />
          </div>}
          {isCompletedStep && <div className="enquiry-publish-section completed-section">
            <EnquiryResult
              onCancel={this.handleCancel}
              onOk={this.handleResultOk}
            />
          </div>}
        </Modal>
      </>
    )
  }
}

export default EnquiryModal