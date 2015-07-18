# object-formatter

format object safely

## Install

`npm i --save object-formatter`

## Usage

```javascript
var ObjectFormat = require('object-formatter');
var of = new ObjectFormat();

var object = {
    a: 'lorem',
    b: 'hoge',
    c: {
        ca: 'foo',
        cb: [ 1, 2, 3 ]
    },
    d: [
        { aa: 'a-a', bb: 'b-b' },
        { aa: 'a--', bb: 'b--' },
        { aa: '---', cc: 'ccc' }
    ]
};

var schema = {
    raw: '"raw value"',
    foo: '@a',
    bar: '@b.c.d="ipsum"',
    baz: {
        a: '@c.cb',
        b: '@c.c.c',
        c: [ '@d', {
           hoge: '@aa',
           fuga: '@bb="bbb"'
        } ],
        d: [ '@d', '@cc="c--"' ]
    }
};

of.format(schema, object);
// ->
// {
//     raw: 'raw value',
//     foo: 'lorem',
//     bar: 'ipsum',
//     baz: {
//         a: [ 1, 2, 3 ],
//         b: undefined,
//         c: [
//             { hoge: 'a-a', bb: 'b-b' },
//             { hoge: 'a--', bb: 'b--' },
//             { hoge: '---', bb: 'bbb' }
//         ],
//         d: [ 'c--', 'c--', 'ccc' ]
//     }
// };
```

## Constructor

### ObjectFormatter(accessorSymbol='@', defaultValue=undefined)

## Instance methods

### `of.format(schema, object)` -> `object`

It format the object according to the schema definition.



## Schema definitions

The schema must be an object. Schema's keys will be the key of the formatted object with no modifications. Schema's value means new value. If value is not a string, that value will be the value of the formatted object with no modifications. If value is a string but not start with of.accessor(`@`), that value will also be the value of the formatted object with no modifications.

If value is string and start with of.accessor(`@`), it means new value's path. If path doesn't exists on object, this definition will return of.default(`undefined`).

### Simple accessor (path string)

#### `@path.to.value`

It accesses `object.path.to.value`. Fields of object are separate with `.` like a javascript.

#### `@path.to.value="temporary default"`

`=` means temporary default value. That definition accesses `object.path.to.value` and returns exact value, or `'temporary default'` value when path doesn't exist.

### Collection accessor

The array value that 1st arg is path string and 2nd arg is schema object or path string, is collection accessor. (collection is objected array). 1st arg path string defines object's collection path. Its accessor returns array or collection or default value.

#### `["@path.to.collection", path]`

It returns array (maybe not collection). 2nd arg's path refers to collection's element object.

#### `["@path.to.collection", schema]`

It returns collection. 2nd arg's schema object is schema of collection's element object.
