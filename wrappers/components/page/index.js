import React from 'react'
import Disqus from 'react-disqus-comments'

const { object, shape } = React.PropTypes

import { config } from 'config'
import css from './index.module.css'
import Footer from '../../../components/footer'
import Header from '../header'
import * as textUtil from '../../../utils/textUtil'

function renderLastUpdated (post) {
  if (post.modified_time) {
    return <div className={css.updated}>Last updated: {textUtil.formatDate(post.modified_time)}</div>
  }
}

function renderComments ({ route: { page: { data: post }, path } }) {
  if (post.comments) {
    return (
      <div className={css.comments}>
        <Disqus
          identifier={path.replace('/pages/', '').replace('/', '')}
          shortname="bressain"
          title={post.title}
          url={config.baseUrl + path}/>
      </div>
    )
  }
}

export default function Page (props) {
  const { route: { page: { data: post } } } = props

  return (
    <div>
      <Header />
      <section className={css.container}>
        <h1>{post.title}</h1>
        <article dangerouslySetInnerHTML={{ __html: post.body }} />
        {renderLastUpdated(post)}
      </section>
      {renderComments(props)}
      <Footer />
    </div>
  )
}
Page.propTypes = {
  route: shape({
    page: object
  }).isRequired
}