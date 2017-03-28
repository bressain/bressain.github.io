import React from 'react'

const { object, shape } = React.PropTypes

import css from './index.module.css'
import Footer from '../../../components/footer'
import Header from '../header'
import * as textUtil from '../../../utils/textUtil'

function renderLastUpdated (post) {
  if (post.modified_time) {
    return <div className={css.updated}>Last updated: {textUtil.formatDate(post.modified_time)}</div>
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
      <Footer />
    </div>
  )
}
Page.propTypes = {
  route: shape({
    page: object
  }).isRequired
}