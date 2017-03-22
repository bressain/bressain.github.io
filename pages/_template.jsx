import React from 'react'

import '../css/global.css'
import '../css/markdown-styles.css'
import '../css/atom-one-dark.css'

module.exports = React.createClass({
  propTypes () {
    return {
      children: React.PropTypes.any,
    }
  },
  render () {
    return <div>{this.props.children}</div>
  }
})
