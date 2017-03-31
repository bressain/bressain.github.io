const Feed = require('feed')
const moment = require('moment')
const markdownIt = require('markdown-it')
const fs = require('fs')
const frontMatter = require('front-matter')

const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true
})

module.exports = (pages, callback) => {
  generateAtomFeed(pages)
  callback()
}

function chopToBreak(articleBody) {
  const breakIdx = articleBody.indexOf('<!--more-->')
  return breakIdx < 0 ? articleBody : articleBody.slice(0, breakIdx)
}

function generateAtomFeed(pages) {
  feed = new Feed({
    title: 'Bressain',
    description: 'A software development blog by Bressain Dinkelman',
    link: 'https://bressain.com',
    id: 'https://bressain.com',
    copyright: 'All rights reserved 2016, Bressain Dinkelman',
    author: {
      name: 'Bressain Dinkelman'
    }
  })

  const sortedPages = [...pages]
    .filter(x => x.data && x.data.title && !x.data.draft)
    .sort((a, b) => {
      return new Date(b.data.date) - new Date(a.data.date)
    })
    .slice(0, 10)
    .forEach(page => {
      feed.addItem({
        title: page.data.title,
        id: `https://bressain.com${page.path}`,
        link: `https://bressain.com${page.path}`,
        date: moment(page.data.date).toDate(),
        content: md.render(
          chopToBreak(
            frontMatter(fs.readFileSync(`${__dirname}/pages/${page.requirePath}`, 'utf-8')).body
          )
        ),
        author: [{
          name: 'Bressain Dinkelman',
          link: 'https://bressain.com'
        }]
      })
    })

  feed.addContributor({
    name: 'Bressain Dinkelman',
    link: 'https://bressain.com'
  })

  fs.writeFileSync(`${__dirname}/public/atom.xml`, feed.render('atom-1.0'))
}
