export function getAllBlogPosts (pages) {
  return pages.filter(x => x.data.layout && x.data.layout === 'post')
}

export function getPrevAndNextPages (currPath, pages) {
  const allBlogPosts = getAllBlogPosts(pages)
  const currIdx = pages.findIndex(x => x.path === currPath)

  return {
    prev: currIdx > 0 ? allBlogPosts[currIdx - 1] : null,
    next: currIdx < allBlogPosts.length && currIdx > -1 ? allBlogPosts[currIdx + 1] : null
  }
}
