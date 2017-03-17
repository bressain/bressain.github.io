import React from 'react'
import Helmet from "react-helmet"
import { config } from 'config'

import '../css/global.module.css'
import '../css/markdown-styles.css'
import '../css/atom-one-dark.css'

module.exports = React.createClass({
  propTypes () {
    return {
      router: React.PropTypes.object,
    }
  },
  render () {
    const post = this.props.route.page.data
    return (
      <div className="markdown">
        <Helmet
          title={`${config.siteTitle} | ${post.title}`}
        />
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.body }} />
      </div>
    )
  },
})