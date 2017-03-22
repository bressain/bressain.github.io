import React from 'react'
import Helmet from "react-helmet"
import { config } from 'config'

import BlogPost from './components/blog-post'
import Page from './components/page'

export default function Md (props) {
  const post = props.route.page.data

  return (
    <div className="markdown">
      <Helmet
        title={`${config.siteTitle} | ${post.title}`}
      />
      {post.layout === 'post' ? <BlogPost route={props.route} /> : <Page route={props.route} />}
    </div>
  )
}
Md.propTypes = {
  router: React.PropTypes.object
}
