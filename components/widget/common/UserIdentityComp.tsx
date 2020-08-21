import { Tooltip } from 'antd'
import classnames from 'classnames'
import { AuthorType, EditionType } from '@base/enums'


export interface Props {
    isPerson?: boolean
    currentType: number
    editionType?: number
    style?: any
    noTip?: boolean
    mini?: boolean
}


const UserIdentityComp: React.SFC<Props> = ({
    currentType,
    editionType,
    style,
    noTip,
    mini,
}) => {
    let tipText = ''
    let name = ''
    let iconUrl = ''

    switch(currentType) {
        case AuthorType.PERSONAL:
            if (editionType === EditionType.ADVANCED) {
                name = '金牌个人'
                iconUrl = 'advanced_personal.png'
            } else if (editionType === EditionType.STANDARD) {
                name = '银牌个人'
                iconUrl = 'standard_personal.png'
            } else {
                name = '个人'
                iconUrl = 'personal.svg'
            }
            tipText = `${name}创作者`
            break
        case AuthorType.BRANDER:
            if (editionType === EditionType.ADVANCED) {
                name = '金星品牌主'
                iconUrl = 'advanced_brand.png'
            } else if (editionType === EditionType.STANDARD) {
                name = '银星品牌主'
                iconUrl = 'standard_brand.png'
            } else {
                name = `品牌主`
                iconUrl = 'brand.svg'
            }
            tipText = `${name}创作者`
            break
        case AuthorType.SERVER:
            if (editionType === EditionType.ADVANCED) {
                name = '金牌服务商'
                iconUrl = 'advanced_service.png'
            } else if (editionType === EditionType.STANDARD) {
                name = '银牌服务商'
                iconUrl = 'standard_service.png'
            } else {
                name = '服务商'
                iconUrl = 'service.svg'
            }
            tipText = `${name}创作者`
            break
        case AuthorType.EDITOR:
            name = `编辑`
            iconUrl = 'editor.svg'
            tipText = '梅花网官方编辑'
            break
    }

    return (
        <span className="user-identity" style={{ ...style }}>
            <Tooltip title={noTip ? '' : tipText}>
                <img 
                    src={`/static/images/author/${iconUrl}`} 
                    style={{position: 'relative', top: '-2px', maxHeight: '17px'}} 
                />
            </Tooltip>
        </span>
    )
}

export default UserIdentityComp