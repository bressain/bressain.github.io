import React from 'react'
import Helmet from 'react-helmet'

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
    return (
      <div>
        <Helmet
          link={[
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
            { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico' }
          ]}
        />
        {this.props.children}
      </div>
    )
  }
})
