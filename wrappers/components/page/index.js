import React from 'react'

const { object, shape } = React.PropTypes

import css from './index.module.css'
import Header from '../header'
import * as textUtil from '../../../utils/textUtil'

export default function Page (props) {
  const { route: { page: { data: post } } } = props

  return (
    <div>
      <Header />
      <section className={css.container}>
        <h1>{post.title}</h1>
        <article dangerouslySetInnerHTML={{ __html: post.body }} />
        <footer className={css.updated}>Last updated: {textUtil(post.modified_time)}</footer>
      </section>
    </div>
  )
}
Page.propTypes = {
  route: shape({
    page: object
  }).isRequired
}