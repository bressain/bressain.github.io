---
layout: post
title: Swapping redux-thunk With redux-saga For Better Testing
date: '2017-11-10T00:00:00.000-07:00'
author: Bressain Dinkelman
tags:
- react
- redux
- testing
modified_time: '2017-11-10T00:00:00.000-07:00'
---

![redux-saga logo](/blog/images/redux-saga.png)

I think it's pretty safe to say at this point that the vast majority of React code bases that need state management are using Redux. One of the things people like about Redux (yours truly included), is the testing story is great. Because reducers don't allow mutating state, you'll get the same result with the same input every time (yay functional paradigms!). But then there's testing actions...
<!--more-->

## Action Testing With redux-thunk

Why is action testing difficult? I have talked to people that said they don't because it's too hard or they don't get enough value from it. My first follow-up question is what middleware they're using to do asynchronous things in their actions and almost always the answer is [redux-thunk](https://github.com/gaearon/redux-thunk).

Don't get me wrong, `redux-thunk` is great and I used it for quite a while. Pair `redux-thunk` up with `async`/`await` and you get some great looking code--until you try to test it. Let me illustrate.

Take [this action](https://github.com/bressain/ohai-redux-saga/blob/caefbc77e78d83e450aaf6ab92499d71e4d1197b/src/actions.js) that makes a call to the [Star Wars API](https://swapi.co/). It's simple enough: it creates a request to get information about a Star Wars film, awaits it, then dispatches a success event with the film data.

```lang=js
export function fetchFilm(filmId) {
  return async (dispatch) => {
    dispatch(fetchFilmRequest(filmId))
    const res = await api.fetchFilm.request(filmId)
    dispatch(fetchFilmSuccess(api.fetchFilm.deserializeSuccess(res)))
  }
}
```

Here's the associated [test](https://github.com/bressain/ohai-redux-saga/blob/caefbc77e78d83e450aaf6ab92499d71e4d1197b/src/__tests__/actions.spec.js):

```lang=js
describe('#fetchFilm', () => {
  let dispatch
  const res = { data: { title: 'wow', episode_id: 3, characters: [] } }
  const reqPromise = new Promise(resolve => resolve(res))

  beforeAll(async () => {
    dispatch = jest.fn()
    api.fetchFilm.request = jest.fn(() => reqPromise)

    await actions.fetchFilm(3)(dispatch)
  })

  it('dispatches fetch request', () => {
    expect(dispatch).toBeCalledWith({ type: TYPES.FETCH_FILM_REQUEST, filmId: 3 })
  })

  it('calls api', () => {
    expect(api.fetchFilm.request).toBeCalledWith(3)
  })

  it('dispatches success event', async () => {
    const film = api.fetchFilm.deserializeSuccess(res)
    await reqPromise
    expect(dispatch).toBeCalledWith({ type: TYPES.FETCH_FILM_SUCCESS, film })
  })
})
```

Let's be honest, **the test isn't terrible**. There are a few mocks but it's totally doable and it's not unusual to for tests be larger than the code that they're testing.

What happens when you need to do something like take the film result and [get all the people associated with that film](https://github.com/bressain/ohai-redux-saga/blob/819c486af90f1381d8411553e87b8783fb110d01/src/actions.js):

```lang=js
export function fetchFilm(filmId) {
  return async (dispatch) => {
    dispatch(fetchFilmRequest(filmId))

    const res = await api.fetchFilm.request(filmId)
    const film = api.fetchFilm.deserializeSuccess(res)
    dispatch(fetchFilmSuccess(film))

    await Promise.all(film.characters.map(personId => fetchPerson(personId)(dispatch)))
  }
}

export function fetchPerson(personId) {
  return async (dispatch) => {
    dispatch(fetchPersonRequest(personId))
    const res = await api.fetchPerson.request(personId)
    dispatch(fetchPersonSuccess(personId, api.fetchPerson.deserializeSuccess(res)))
  }
}
```

Good thing we went with `async`/`await`. It reads well and is (I hope) obvious what's going on. Once we get the film, we spin through the characters, request their info, and then dispatch success to be picked up by the reducer. Let's see how that affected the tests.

```lang=js
describe('#fetchFilm', () => {
  let dispatch
  const characters = ['http://swapi.co/api/people/1/', 'http://swapi.co/api/people/2/']
  const characterIds = [1, 2]
  const res = { data: { title: 'wow', episode_id: 3, characters } }
  const reqPromise = new Promise(resolve => resolve(res))
  const personPromises = []
  const peopleRes = []

  beforeAll(async () => {
    dispatch = jest.fn()
    api.fetchFilm.request = jest.fn(() => reqPromise)
    api.fetchPerson.request = jest.fn(() => {
      const pRes = { data: { name: 'Derp' } }
      const req = new Promise(resolve => resolve(pRes))
      personPromises.push(req)
      peopleRes.push(pRes)
      return req
    })

    await actions.fetchFilm(3)(dispatch)
  })

  it('dispatches fetch request', () => {
    expect(dispatch).toBeCalledWith({ type: TYPES.FETCH_FILM_REQUEST, filmId: 3 })
  })

  it('calls api', () => {
    expect(api.fetchFilm.request).toBeCalledWith(3)
  })

  it('calls api for characters', () => {
    expect(api.fetchPerson.request).toBeCalledWith(1)
    expect(api.fetchPerson.request).toBeCalledWith(2)
  })

  it('dispatches success event', async () => {
    const film = { ...api.fetchFilm.deserializeSuccess(res), characters: characterIds }
    await reqPromise
    expect(dispatch).toBeCalledWith({ type: TYPES.FETCH_FILM_SUCCESS, film })
  })

  it('dispatches person success events', async () => {
    const people = characterIds.map((id, idx) => ({ ...api.fetchPerson.deserializeSuccess(peopleRes[idx]), id }))
    await Promise.all(personPromises)

    for (let person of people) {
      expect(dispatch).toBeCalledWith({ type: TYPES.FETCH_PERSON_SUCCESS, person })
    }
  })
})
```

Oh man, those two expressions sure did result in a lot of additional complexity in the tests. If we need to include more things to do within our action, the complexity is only going to be worse and the tests will be more brittle.

This is where people start throwing up their hands because they're not getting as much value out of their tests. **If the value of the tests aren't outweighing the cost of maintaining them, good developers won't test the code.** So with that, we have a few options:

1. Throw out our action tests and lean on reducer & component testing only.
2. Find a library that abstracts this nastiness away.

I chose #2 by moving to [redux-saga](https://github.com/redux-saga/redux-saga).

## Introducing redux-saga

`redux-saga` leans on using [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) and the "effects as data" paradigm that [Elm](https://guide.elm-lang.org/architecture/effects/) users are familiar with. **Don't worry about understanding those two things right now**, only that `redux-saga` uses them and makes testing rad.

Let's [convert that action](https://github.com/bressain/ohai-redux-saga/blob/master/src/actions.js) to use `redux-saga`.

```lang=js
export function* executeFetchFilm({ filmId }) {
  const res = yield call(api.fetchFilm.request, filmId)
  const film = api.fetchFilm.deserializeSuccess(res)
  yield put(fetchFilmSuccess(film))

  for (let personId of film.characters) {
    yield put(fetchPerson(personId))
  }
}

export const fetchPerson = personId => ({
  type: TYPES.FETCH_PERSON_REQUEST,
  personId
})

export function* executeFetchPerson({ personId }) {
  const res = yield call(api.fetchPerson.request, personId)
  yield put(fetchPersonSuccess(personId, api.fetchPerson.deserializeSuccess(res)))
}
```

You might be thinking, "This looks about the same size as the `redux-thunk` version, and perhaps a bit more complicated" and you'd be **right**, especially if you didn't know what the `function*` thing is about. The asterisk indicates that this is a **generator function** and any time the `yield` keyword is used, execution effectively "pauses" until the statement completes (similar to `await`).

`call` & `put` are `redux-saga`-specific things that mean "call this method asynchronously" & "dispatch an action" respectively. You'll notice that we're not dispatching request actions anymore at the beginning of the "execute" actions and there's no clear connection between `fetchPerson` and `executeFetchPerson`. That magic happens [over here](https://github.com/bressain/ohai-redux-saga/blob/master/src/sagas.js):

```lang=js
import { takeEvery } from 'redux-saga'
import { fork } from 'redux-saga/effects'

import * as actions from './actions'
import TYPES from './types'

function watchEvery(actionType, saga) {
  return fork(function* () {
    yield* takeEvery(actionType, saga)
  })
}

export default function* () {
  yield [
    watchEvery(TYPES.FETCH_FILM_REQUEST, actions.executeFetchFilm),
    watchEvery(TYPES.FETCH_PERSON_REQUEST, actions.executeFetchPerson)
  ]
}
```

Because `redux-saga` is a redux middleware, it looks for those REQUEST actions and any time they see one, they call the respective generator function in the actions. There are fancier things that `redux-saga` can do but for now we're just trying to do a straight cutover from `redux-thunk`.

## Testing With redux-saga

Enough of that though, we're not here to learn all the nooks and crannies of `redux-saga`, **we're here to improve our testing story!** Let's see how things changed:

```lang=js
describe('#executeFetchFilm', () => {
  const characters = ['http://swapi.co/api/people/1/', 'http://swapi.co/api/people/2/']
  const characterIds = [1, 2]
  const res = { data: { title: 'wow', episode_id: 3, characters } }

  const iterator = actions.executeFetchFilm({ filmId: 3 })

  it('calls api', () => {
    expect(iterator.next().value).toEqual(call(api.fetchFilm.request, 3))
  })

  it('dispatches success event', () => {
    const film = { ...api.fetchFilm.deserializeSuccess(res), characters: characterIds }
    expect(iterator.next(res).value).toEqual(put({ type: TYPES.FETCH_FILM_SUCCESS, film }))
  })

  it('fetches characters', () => {
    expect(iterator.next().value).toEqual(put({ type: TYPES.FETCH_PERSON_REQUEST, personId: 1 }))
    expect(iterator.next().value).toEqual(put({ type: TYPES.FETCH_PERSON_REQUEST, personId: 2 }))
  })
})
```

Now _this_ is something I can get on-board with. **No mocking needed** and nearly as clear as a reducer test. Once again, we're using the `call` & `put` constructs from `redux-saga` to help us but no APIs are getting called, and no redux actions are flying around.

How these tests work is each time `iterator.next()` is called, the next `yield` is called and the result is given in the `.value`. If something that a `yield`ed statement returned is needed for the next `yield` statement, just pass in something that would work into the next `iterator.next()` call, like we did with the API call result.

One caveat: this particular set of tests need to be run _in order_ to run correctly. You could remedy this by creating the iterator in a `beforeEach` block and calling `iterator.next()` as many times as you needed in each `it` block to get to the specific thing you want to test.

## Make Action Testing Great Again

I hope I've at least piqued your interest in testing your actions or giving you some tools to fix some brittle action tests. If you're interested in seeing the whole code-base progression from `redux-thunk` to `redux-saga`, check out my repo at [https://github.com/bressain/ohai-redux-saga](https://github.com/bressain/ohai-redux-saga) and view the commit diffs.

If you've found something even better, let me know in the comments!
