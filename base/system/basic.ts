import { cookie, config } from '@utils'

export default {
    token: cookie.get(config.COOKIE_MEIHUA_TOKEN),  
    userName: cookie.get(config.COOKIE_MEIHUA_USER_NAME),
    
    // 梅花网appCode
    appCode: 'c41d644656f84b779614f043aa64b208',
}