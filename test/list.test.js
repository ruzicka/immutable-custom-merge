import {List} from 'immutable'
import testList from './list.common'
import merge from '../src/index'

testList('Map', 'List')
testList('OrderedMap', 'List')

describe('lists with native arrays', () => {
  it('merge native array', () => {
    expect(merge(new List([1, 2, 3, 4]), [5, 6]))
      .toEqual(new List([5, 6, 3, 4]))
  })

  it('append native array', () => {
    expect(merge(new List([1, 2, 3, 4]), [5, 6], 'append'))
      .toEqual(new List([1, 2, 3, 4, 5, 6]))
  })
})
