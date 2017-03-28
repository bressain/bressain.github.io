import React from 'react'

export default function SvgWrapper (props) {
  return <svg {...props} viewBox="0 0 800 800">{props.children}</svg>
}
SvgWrapper.propTypes = {
  children: React.PropTypes.any
}
