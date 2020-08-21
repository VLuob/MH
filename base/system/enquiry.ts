import moment from 'moment'
import { config, storage } from '@utils'

/**
 * 获取游客编辑询价验证状态组
 */
export function getVisitorPhoneVerifys() {
  const phoneVerifys = storage.get(config.STORAGE_VISITOR_ENQUIRY_EDIT_STATUS) || []
  return phoneVerifys
}

/**
 * 获取游客编辑询价单个验证状态
 */
export function getVisitorPhoneVerify(enquiryId) {
  const phoneVerifys = getVisitorPhoneVerifys()
  const currentVerify = phoneVerifys.find(item => item.id === enquiryId) || {}
  return currentVerify
}

export function saveVisitorPhoneVerify(option) {
  const phoneVerifys = getVisitorPhoneVerifys()
  const newPhoneVerifys = phoneVerifys.filter(item => item.id !== option.id)
  storage.set(config.STORAGE_VISITOR_ENQUIRY_EDIT_STATUS, [...newPhoneVerifys, option])
}

export function updateVisitorPhoneVerify(option) {
  const phoneVerifys = getVisitorPhoneVerifys()
  const newPhoneVerifys = phoneVerifys.map(item => {
    if (item.id === option.id) {
      return {
        ...item,
        ...option,
      }
    }
    return item
  })
  storage.set(config.STORAGE_VISITOR_ENQUIRY_EDIT_STATUS, newPhoneVerifys)
}

export function removeVisitorPhoneVerify(enquiryId) {
  const phoneVerifys = getVisitorPhoneVerifys()
  const newPhoneVerifys = phoneVerifys.filter(item => item.id !== enquiryId)
  storage.set(config.STORAGE_VISITOR_ENQUIRY_EDIT_STATUS, newPhoneVerifys)
}

export function clearVisitorPhoneVerifys() {
  storage.remove(config.STORAGE_VISITOR_ENQUIRY_EDIT_STATUS)
}

export function checkVisitorPhoneVerify(enquiryId) {
  const phoneVerify = getVisitorPhoneVerify(enquiryId)
  // if (phoneVerify.verifyToken && moment(phoneVerify.expire).isBefore(moment())) {
  if (!!phoneVerify.token) {
    return true      
  } else {
    removeVisitorPhoneVerify(enquiryId)
    return false
  }

  // console.log('phone verify', phoneVerify, moment(phoneVerify.create).isSame(moment(), 'day'))
  // if (phoneVerify.verify && !!phoneVerify.phone && !!phoneVerify.code) {
  //   // 同一天内已验证无需重复验证
  //   // if (phoneVerify.create && moment(phoneVerify.create).isSame(moment(), 'day')) {
  //   //   return true      
  //   // } else {
  //   //   removeVisitorPhoneVerify(enquiryId)
  //   //   return false
  //   // }

  //   if (phoneVerify.verifyToken && moment(phoneVerify.expire).isBefore(moment())) {
  //     return true      
  //   } else if (phoneVerify.create && moment(phoneVerify.create).isSame(moment(), 'day')) {
  //     return true
  //   } else {
  //     removeVisitorPhoneVerify(enquiryId)
  //     return false
  //   }
  // } else {
  //   return false
  // }
  
}

export default {
  getVisitorPhoneVerifys,
  getVisitorPhoneVerify,
  saveVisitorPhoneVerify,
  updateVisitorPhoneVerify,
  removeVisitorPhoneVerify,
  clearVisitorPhoneVerifys,
  checkVisitorPhoneVerify,
}