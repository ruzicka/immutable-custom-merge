import {fromJS} from 'immutable'
import merge from '../src/index'
import testMap from './map.common'


testMap('Map', 'List')
testMap('Map', 'Set')
testMap('Map', 'OrderedSet')
testMap('Map', 'Stack')

testMap('OrderedMap', 'List')
testMap('OrderedMap', 'Set')
testMap('OrderedMap', 'OrderedSet')
testMap('OrderedMap', 'Stack')


describe('union with maps', () => {
  it('should merge maps',  () => {
    const x = fromJS({
      xx: {
        a: 11,
        b: 22,
        c: 33,
      }
    })

    const y = fromJS({
      xx: {
        c: 99,
        d: 88,
        e: 77,
      }
    })

    expect(merge(x, y, {xx: 'union'})).toEqual(fromJS({
      xx: {
        a: 11,
        b: 22,
        c: 99,
        d: 88,
        e: 77,
      }
    }))
  })
})
