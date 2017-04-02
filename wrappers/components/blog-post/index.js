import React from 'react'
import Disqus from 'react-disqus-comments'
import { Link } from 'react-router'

const { arrayOf, object, shape, string } = React.PropTypes

import { config } from 'config'
import css from './index.module.css'
import Footer from '../../../components/footer'
import Header from '../header'
import * as pathUtil from '../../../utils/pathUtil'
import * as textUtil from '../../../utils/textUtil'

function renderUpdatedDate(date, modified) {
  if (date !== modified)
    return ` (updated ${modified})`
}

function renderPrevLink (post) {
  if (post)
    return <Link to={post.path} className={css.prev}>{post.data.title}</Link>
}

function renderNextLink (post) {
  if (post)
    return <Link to={post.path} className={css.next}>{post.data.title}</Link>
}

export default function BlogPost (props) {
  const { route: { page: { data: post }, pages, path } } = props
  const prevNext = pathUtil.getPrevAndNextPages(path, pathUtil.getAllBlogPosts(pages))
  const date = textUtil.formatDate(post.date)
  const modifiedTime = textUtil.formatDate(post.modified_time)

  return (
    <div>
      <Header />
      <section className={css.container}>
        <header className={css.titleContainer}>
          <h1 className={css.title}>{post.title}</h1>
          <div className={css.date}>{date}{renderUpdatedDate(date, modifiedTime)}</div>
        </header>
        <article dangerouslySetInnerHTML={{ __html: post.body }} />
      </section>
      <nav className={css.nav}>
        {renderPrevLink(prevNext.prev)}
        {renderNextLink(prevNext.next)}
      </nav>
      <div className={css.comments}>
        <Disqus
          identifier={path.replace('/blog/', '').replace('/', '')}
          shortname="bressain"
          title={post.title}
          url={config.baseUrl + path} />
      </div>
      <Footer />
    </div>
  )
}
BlogPost.propTypes = {
  route: shape({
    page: object,
    pages: arrayOf(object),
    path: string
  }).isRequired
}
