import axios from 'axios'
import qs from 'qs'

const fetchLog = (data, host) => {
  let api = ''
  if (host) {
    api = host.indexOf('www.') >= 0 ? `https://${host}` : `http://${host}`
  }
  console.log('current api', api)
  axios.post(`${api}/record-log`, qs.stringify(data))
}

const error = (option, host) => {
  const data = typeof option === 'string' ? {msg: option} : data
  fetchLog({type: 'error', ...data}, host)
}

const info = (option, host) => {
  const data = typeof option === 'string' ? {msg: option} : data
  fetchLog({type: 'info', ...data}, host)
}

export default { error, info }