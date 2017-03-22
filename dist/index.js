'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _immutable = require('immutable');

function doSetOp(param1, param2, op) {
  var type = param1.constructor.name;
  if (type === 'Set' || type === 'OrderedSet') {
    return param1[op](param2);
  }
  return param1.toOrderedSet()[op](param2)['to' + type]();
}

function customMerge(param1, param2, mergeFnc) {
  if (typeof mergeFnc === 'function') {
    return mergeFnc(param1, param2);
  }

  switch (mergeFnc) {
    case 'append':
      if (!_immutable.Iterable.isIterable(param1)) {
        throw new Error('Non-iterable passed to \'append\' merge function');
      }
      return param1.concat(param2);
    case 'prepend':
      if (!_immutable.Iterable.isIterable(param2)) {
        throw new Error('Non-iterable passed to \'prepend\' merge function');
      }
      return param2.concat(param1);
    case 'union':
      if (_immutable.Map.isMap(param1)) {
        return param1.merge(param2);
      }
      if (!_immutable.Iterable.isIterable(param1)) {
        throw new Error('Non-iterable passed to \'union\' merge function');
      }
      return doSetOp(param1, param2, 'union');
    default:
      throw new Error('Unknown merge function \'' + mergeFnc + '\'');
  }
}

function mergeDeep(param1, param2, schema) {
  // there's no schema defined => native merge or override
  if (!schema || (typeof schema === 'undefined' ? 'undefined' : _typeof(schema)) === 'object' && Object.keys(schema).length === 0) {
    return _immutable.Iterable.isIterable(param1) && !_immutable.Stack.isStack(param1) ? param1.mergeDeep(param2) : param2;
  }

  var schemaType = typeof schema === 'undefined' ? 'undefined' : _typeof(schema);

  // no keys in schema, merging is handled by custom merge function
  if (schemaType === 'string' || schemaType === 'function') {
    return customMerge(param1, param2, schema);
  }

  // at this point anything other than object as a schema should be handled above
  if (schemaType !== 'object') {
    throw new Error('Invalid schema');
  }

  if (!_immutable.Iterable.isIterable(param1) || !_immutable.Iterable.isIterable(param2)) {
    throw new Error('Only immutable iterables can be merged using merge schema');
  }

  if (_immutable.Set.isSet(param1) || _immutable.Set.isSet(param2) || _immutable.Stack.isStack(param1) || _immutable.Stack.isStack(param2)) {
    throw new Error("Sets and Stacks can't be merged with schema");
  }

  var immutableType = param1.constructor.name;
  var merged = void 0;
  switch (immutableType) {
    case 'List':
      merged = new _immutable.List();break;
    case 'Map':
      merged = new _immutable.Map();break;
    case 'OrderedMap':
      merged = new _immutable.OrderedMap();break;
    default:
      throw new Error('Unsupported type');
  }

  param1.forEach(function (value, key) {
    if (param2.has(key)) {
      var subSchema = schema ? schema[key] || schema['*'] : undefined;
      merged = merged.set(key, mergeDeep(param1.get(key), param2.get(key), subSchema));
    } else {
      merged = merged.set(key, param1.get(key));
    }
  });

  param2.forEach(function (value, key) {
    if (!param1.has(key)) {
      merged = merged.set(key, param2.get(key));
    }
  });

  return merged;
}

module.exports = mergeDeep;