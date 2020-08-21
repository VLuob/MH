import { adApi } from '@api'

const RenderAdClick = (props) => {
  const onClick = (id) => {
    adApi.actionAdClick({id})
  }
  return (
    props.render(onClick)
  )
}

export default RenderAdClick