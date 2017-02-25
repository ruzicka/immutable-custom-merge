import {fromJS as _fromJS, Iterable} from 'immutable'
import merge from '../src/index'

export const fromJS = (val, mapType = 'Map', listType = 'List') => _fromJS(val, (key, value) => {
  const isIndexed = Iterable.isIndexed(value)
  return isIndexed ? value[`to${listType}`]() : value[`to${mapType}`]()
})

export const createTestMerge = (mapType, listType) => (a, b, expected) => {
  expect(merge(fromJS(a, mapType, listType), fromJS(b, mapType, listType)))
    .toEqual(fromJS(expected, mapType, listType))
}

export const createTestMergeSchema = (mapType, listType) => (a, b, schema, expected) => {
  // console.log(fromJS(expected, mapType, listType).get('a'));
  expect(merge(fromJS(a, mapType, listType), fromJS(b, mapType, listType), schema))
    .toEqual(fromJS(expected, mapType, listType))

  // make sure nothing was lost during conversion
  expect(fromJS(expected, mapType, listType).toJS())
    .toEqual(expected)
  expect(fromJS(a, mapType, listType).toJS())
    .toEqual(a)
  expect(fromJS(b, mapType, listType).toJS())
    .toEqual(b)
}

export const createTestMergeError = (mapType, listType) => (a, b, schema, expectedError) => {
  const param1 = fromJS(a, mapType, listType)
  const param2 = fromJS(b, mapType, listType)
  expect(() => merge(param1, param2, schema)).toThrowError(expectedError)
}
