import moment from 'moment'

export function formatDate (date) {
  return moment(date).format('MMMM Do YYYY')
}

export function chopToBreak(articleBody) {
  const breakIdx = articleBody.indexOf('<!--more-->')
  return breakIdx < 0 ? articleBody : articleBody.slice(0, breakIdx)
}
