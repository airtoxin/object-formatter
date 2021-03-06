import assert from 'assert';
import ObjectFormatter from '../src/object-formatter';

describe('object-formatter', () => {
	describe('constructor', () => {
		it('ok with default', done => {
			var of = new ObjectFormatter();

			assert.strictEqual(of.accessorSymbol, '@');
			assert.strictEqual(of.defaultSymbol, '=');
			assert.strictEqual(of.defaultValue, undefined);
			done();
		});
		it('ok with fixed accessorSymbol', done => {
			var of = new ObjectFormatter('^');

			assert.strictEqual(of.accessorSymbol, '^');
			assert.strictEqual(of.defaultSymbol, '=');
			assert.strictEqual(of.defaultValue, undefined);
			done();
		});
		it('ok with fixed defaultValue', done => {
			var of = new ObjectFormatter('@', 68);

			assert.strictEqual(of.accessorSymbol, '@');
			assert.strictEqual(of.defaultSymbol, '=');
			assert.strictEqual(of.defaultValue, 68);
			done();
		});
	});

	describe('format', () => {
		it('should return raw object when schema has no path string', done => {
			var of = new ObjectFormatter();
			var object = {
				a: 'aaa',
				b: ['b', 'bb', 'bbb']
			};
			var schema = {
				aaa: 1,
				bbb: '123',
				ccc: [1, 2, 3],
				ddd: {
					a: 1,
					b: 2,
					c: 3
				}
			};

			var formatted = of.format(schema, object);
			assert.deepEqual(formatted, schema);
			done();
		});
		it('should return formatted object by simple accessor', done => {
			var of = new ObjectFormatter();
			var object = {
				a: 'aaa',
				b: ['b', 'bb', 'bbb']
			};
			var schema = {
				aaa: '@a',
				bbb: '@b'
			};

			var formatted = of.format(schema, object);
			var expected = {
				aaa: 'aaa',
				bbb: ['b', 'bb', 'bbb']
			};
			assert.deepEqual(formatted, expected);
			done();
		});
		it('should return formatted object by simple accessor with temporary default', done => {
			var of = new ObjectFormatter();
			var object = {
				a: 'aaa',
				b: ['b', 'bb', 'bbb']
			};
			var schema = {
				aaa: '@a.a="hoge"',
				bbb: '@b.b=333'
			};

			var formatted = of.format(schema, object);
			var expected = {
				aaa: 'hoge',
				bbb: 333
			};
			assert.deepEqual(formatted, expected);
			done();
		});
		it('should return formatted object by simple accessor with default', done => {
			var defaultValue = 'not exists';
			var of = new ObjectFormatter('@', defaultValue);
			var object = {
				a: 'aaa',
				b: ['b', 'bb', 'bbb']
			};
			var schema = {
				aaa: '@a.a',
				bbb: '@b.b'
			};

			var formatted = of.format(schema, object);
			var expected = {
				aaa: defaultValue,
				bbb: defaultValue
			};
			assert.deepEqual(formatted, expected);
			done();
		});
		it('should return formatted object by collection accessor', done => {
			var of = new ObjectFormatter();
			var object = {
				a: 'aaa',
				b: [{k:'b'}, {k:'bb'}, {k:'bbb'}]
			};
			var schema = {
				aaa: '@b',
				bbb: ['@b', '@k']
			};

			var formatted = of.format(schema, object);
			var expected = {
				aaa: [{k:'b'}, {k:'bb'}, {k:'bbb'}],
				bbb: ['b', 'bb', 'bbb']
			};
			assert.deepEqual(formatted, expected);
			done();
		});
		it('should return formatted object by collection accessor with temporary default', done => {
			var of = new ObjectFormatter();
			var object = {
				b: [{k:'b'}, {k:'bb'}, {k:'bbb'}]
			};
			var schema = {
				aaa: ['@b.b="aaa temp"', '@k'],
				bbb: ['@b="bbb temp"', '@k.k="k temp"']
			};

			var formatted = of.format(schema, object);
			var expected = {
				aaa: 'aaa temp',
				bbb: ['k temp', 'k temp', 'k temp']
			};
			assert.deepEqual(formatted, expected);
			done();
		});
		it('should return formatted object by collection accessor with array temporary default', done => {
			var of = new ObjectFormatter();
			var object = {
				b: [{k:'b'}, {k:'bb'}, {k:'bbb'}]
			};
			var schema = {
				aaa: ['@b.b=["aaa", "temp"]', '@k'],
				bbb: ['@b="bbb temp"', '@k.k=["k", "temp"]']
			};

			var formatted = of.format(schema, object);
			var expected = {
				aaa: ['aaa', 'temp'],
				bbb: [["k", "temp"], ["k", "temp"], ["k", "temp"]]
			};
			assert.deepEqual(formatted, expected);
			done();
		});
		it('should return formatted object by collection accessor with default', done => {
			var defaultValue = 'not temporary default';
			var of = new ObjectFormatter('@', defaultValue);
			var object = {
				b: [{k:'b'}, {k:'bb'}, {k:'bbb'}]
			};
			var schema = {
				aaa: ['@b.b', '@k'],
				bbb: ['@b', '@k.k']
			};

			var formatted = of.format(schema, object);
			var expected = {
				aaa: defaultValue,
				bbb: [defaultValue, defaultValue, defaultValue]
			};
			assert.deepEqual(formatted, expected);
			done();
		});
		it('readme', done => {
			var of = new ObjectFormatter();
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
				raw: 'raw value',
				foo: '@a',
				bar: '@b.c.d="ipsum"',
				baz: {
					raw: 111,
					a: '@c.cb',
					b: '@c.c.c',
					c: [ '@d', {
						hoge: '@aa',
						fuga: '@bb="b default"'
					} ],
					d: [ '@d', '@cc="c default"' ]
				}
			};

			var formatted = of.format(schema, object);
			var expected = {
				raw: 'raw value',
				foo: 'lorem',
				bar: 'ipsum',
				baz: {
					raw: 111,
					a: [ 1, 2, 3 ],
					b: undefined,
					c: [
						{ hoge: 'a-a', fuga: 'b-b' },
						{ hoge: 'a--', fuga: 'b--' },
						{ hoge: '---', fuga: 'b default' }
					],
					d: [ 'c default', 'c default', 'ccc' ]
				}
			};

			assert.deepEqual(formatted, expected);
			done();
		});
	});

	describe('_isAccessor', () => {
		it('should return true', done => {
			var of = new ObjectFormatter();
			var maybeAccessors = [
				'@simple.accessor',
				'@a',
				'@a.b.c.d.e',
				'@with.default=null',
				'@with=true',
				'@a.b.c.d=222',
				'@uuu="str"',
				'@uuu=["str", "arr"]',
				'@uuu=[]',
				'@uuu=[{}, {f:""}]',
				'@uuu={ob:"ject"}',
				'@@@',
				'@@.@.@',
				['@path.to.collection', '@collection.accessor'],
				['@path.to.collection="with default"', '@collectionAccessor.uuu'],
				['@path.to.collection=111', '@collectionAccessor.uuu="strstr"'],
				['@path.to.collection=null', '@collectionAccessor.uuu=1'],
				['@path.to.collection=[null]', {schema:'object'}],
				['@path.to.collection=[null]', {}],
				['@path.to.collection=[null]', {schema:["arr"]}],
				['@path.to.collection=[null]', {a:[{b:[]}]}],
				['@@@@', '@@']
			];

			maybeAccessors.forEach(maybeAccessor => {
				assert.ok(of._isAccessor(maybeAccessor));
			});
			done();
		});
		it('should return false', done => {
			var of = new ObjectFormatter();
			var maynotbeAccessors = [
				'',
				'value',
				'null',
				null,
				undefined,
				true,
				1,
				{a:1},
				[1,2,3],
				'',
				'a.@.b',
				[[]],
				[{}],
				['not.accessor', 'hoge'],
				['aaa', '@accessor'],
				['a.b.c=1', 'c.b.a=2'],
				['@a.a', 'str@a.a'],
				['aaa', {valid: 'schema'}],
				['aaa', {valid: '@sc.he.ma'}],
				['@aaa', [1,2,3]],
				['@@@@', true],
				[true, '@a.b']
			];

			maynotbeAccessors.forEach(maynotbeAccessor => {
				assert.ok(!of._isAccessor(maynotbeAccessor));
			});
			done();
		});
		it('should return true when accessor is a simple accessor', done => {
			var of = new ObjectFormatter();
			var maybeAccessor = '@maybe';
			of._isSimpleAccessor = _maybeAccessor => {
				assert.strictEqual(_maybeAccessor, maybeAccessor);
				return true;
			};
			of._isCollectionAccessor = _maybeAccessor => {
				assert.strictEqual(_maybeAccessor, maybeAccessor);
				return false;
			};

			assert.ok(of._isAccessor(maybeAccessor));
			done();
		});
		it('should return true when accessor is a collection accessor', done => {
			var of = new ObjectFormatter();
			var maybeAccessor = '@maybe';
			of._isSimpleAccessor = _maybeAccessor => {
				assert.strictEqual(_maybeAccessor, maybeAccessor);
				return false;
			};
			of._isCollectionAccessor = _maybeAccessor => {
				assert.strictEqual(_maybeAccessor, maybeAccessor);
				return true;
			};

			assert.ok(of._isAccessor(maybeAccessor));
			done();
		});
		it('should return true when not an accessor', done => {
			var of = new ObjectFormatter();
			var maybeAccessor = '@maybe';
			of._isSimpleAccessor = _maybeAccessor => {
				assert.strictEqual(_maybeAccessor, maybeAccessor);
				return false;
			};
			of._isCollectionAccessor = _maybeAccessor => {
				assert.strictEqual(_maybeAccessor, maybeAccessor);
				return false;
			};

			assert.ok(!of._isAccessor(maybeAccessor));
			done();
		});
	});

	describe('_isSimpleAccessor', () => {
		it('should return true', done => {
			var of = new ObjectFormatter();
			var maybeSimpleAccessors = [
				'@a',
				'@a.b',
				'@a.b.c',
				'@@',
				'@@.@@.@@@',
				'@_._._',
				'@ . . ',
				'@a=null',
				'@a.b=true',
				'@a.b.c=undefined',
				'@a.b.c.d="str"',
				'@a.b.c.d.e=111',
				'@1={}',
				'@1.2={key:"val"}',
				'@1.2.3=[]',
				'@1.2.3.4=[1,{},[]]'
			];

			maybeSimpleAccessors.forEach(maybeSimpleAccessor => {
				assert.ok(of._isSimpleAccessor(maybeSimpleAccessor));
			});
			done();
		});
		it('should return true with fixed accessor symbol', done => {
			var of = new ObjectFormatter('~');
			var maybeSimpleAccessors = [
				'~a',
				'~a.b',
				'~a.b.c',
				'~@',
				'~@~',
				'~~.~~.~~',
				'~_._._',
				'~ . . ',
				'~a=null',
				'~a.b=true',
				'~a.b.c=undefined',
				'~a.b.c.d="str"',
				'~a.b.c.d.e=111',
				'~1={}',
				'~1.2={key:"val"}',
				'~1.2.3=[]',
				'~1.2.3.4=[1,{},[]]'
			];

			maybeSimpleAccessors.forEach(maybeSimpleAccessor => {
				assert.ok(of._isSimpleAccessor(maybeSimpleAccessor));
			});
			done();
		});
		it('should return false', done => {
			var of = new ObjectFormatter();
			var maynotbeSimpleAccessors = [
				1,
				false,
				null,
				undefined,
				{},
				[],
				'',
				'a',
				'a.b.c',
				'a.@hoge',
				' @'
			];

			maynotbeSimpleAccessors.forEach(maynotbeSimpleAccessor => {
				assert.ok(!of._isSimpleAccessor(maynotbeSimpleAccessor));
			});
			done();
		});
		it('should return false with fixed accessor symbol', done => {
			var of = new ObjectFormatter('?');
			var maynotbeSimpleAccessors = [
				'@a.b.c',
				'@a=null',
				'@@@',
				'@.@.@',
				1,
				false,
				null,
				undefined,
				{},
				[],
				'',
				'a',
				'a.b.c',
				'a.@hoge',
				' @'
			];

			maynotbeSimpleAccessors.forEach(maynotbeSimpleAccessor => {
				assert.ok(!of._isSimpleAccessor(maynotbeSimpleAccessor));
			});
			done();
		});
		it('should return true with default accessor symbol', done => {
			var of = new ObjectFormatter();

			assert.ok(of._isSimpleAccessor('@hoge.fuga=1'));
			done();
		});
		it('should return true with fixed accessor symbol', done => {
			var of = new ObjectFormatter('^');

			assert.ok(of._isSimpleAccessor('^hoge.fuga'));
			done();
		});
		it('should return false with fixed accessor symbol', done => {
			var of = new ObjectFormatter('^');

			assert.ok(!of._isSimpleAccessor('@hoge.fuga'));
			done();
		});
		it('should return false with no accessor symbol string', done => {
			var of = new ObjectFormatter();

			assert.ok(!of._isSimpleAccessor('hoge.fuga'));
			done();
		});
		it('should return false with non string arg', done => {
			var of = new ObjectFormatter();

			assert.ok(!of._isSimpleAccessor(1));
			assert.ok(!of._isSimpleAccessor(null));
			assert.ok(!of._isSimpleAccessor(void 0));
			assert.ok(!of._isSimpleAccessor({hoge:1}));
			assert.ok(!of._isSimpleAccessor({}));
			assert.ok(!of._isSimpleAccessor([1,2,3]));
			assert.ok(!of._isSimpleAccessor([]));
			assert.ok(!of._isSimpleAccessor(console.log));
			done();
		});
	});

	describe('_isCollectionAccessor', () => {
		it('should return true', done => {
			var of = new ObjectFormatter();
			var maybeCollectionAccessors = [
				['@a', '@a'],
				['@a.b.c', '@d.e.f'],
				['@@', '@@'],
				['@a=null', '@@=null'],
				['@a.b.c', {}],
				['@a=null', {hoge:'fuga'}],
				['@null=null', {a:{b:{c:[1,2,3]}}}],
				['@null=null', {a:{b:{c:'@a.b.c'}}}]
			];

			maybeCollectionAccessors.forEach(maybeCollectionAccessor => {
				assert.ok(of._isCollectionAccessor(maybeCollectionAccessor));
			});
			done();
		});
		it('should return true with fixed accessor symbol', done => {
			var of = new ObjectFormatter('~~');
			var maybeCollectionAccessors = [
				['~~a', '~~a'],
				['~~a.b.c', '~~d.e.f'],
				['~~@', '~~@@'],
				['~~a=null', '~~@=null'],
				['~~a.b.c', {}],
				['~~a=null', {hoge:'fuga'}],
				['~~null=null', {a:{b:{c:[1,2,3]}}}],
				['~~null=null', {a:{b:{c:'@a.b.c'}}}]
			];

			maybeCollectionAccessors.forEach(maybeCollectionAccessor => {
				assert.ok(of._isCollectionAccessor(maybeCollectionAccessor));
			});
			done();
		});
		it('should return false', done => {
			var of = new ObjectFormatter();
			var maynotbeCollectionAccessors = [
				1,
				true,
				'@a',
				{},
				[],
				['@a'],
				['@a.b.c', 'd.e.f'],
				['@@', ''],
				[true, '@a.b'],
				['@a.b.c', 1],
				['@a=null', null]
			];

			maynotbeCollectionAccessors.forEach(maynotbeCollectionAccessor => {
				assert.ok(!of._isCollectionAccessor(maynotbeCollectionAccessor));
			});
			done();
		});
		it('should return false with fixed accessor symbol', done => {
			var of = new ObjectFormatter('$');
			var maynotbeCollectionAccessors = [
				1,
				true,
				'@a',
				'$a.b',
				{},
				[],
				['$a'],
				['$a.b.c', 'd.e.f'],
				['$@', ''],
				[true, '$a.b'],
				['$a.b.c', 1],
				['$a=null', null],
				['$a', '@a'],
				['$a.b.c', '@d.e.f'],
				['$@', '@@@'],
				['$a=null', '@@=null']
			];

			maynotbeCollectionAccessors.forEach(maynotbeCollectionAccessor => {
				assert.ok(!of._isCollectionAccessor(maynotbeCollectionAccessor));
			});
			done();
		});
		it('should return true with default accessor symbol', done => {
			var of = new ObjectFormatter();

			var accessor = ['@path.to.collection=[]', '@a.b.c="default"'];
			assert.ok(of._isCollectionAccessor(accessor));
			done();
		});
		it('should return true with fixed accessor symbol', done => {
			var of = new ObjectFormatter('^');

			var accessor = ['^path.to.collection=[]', '^a.b.c="default"'];
			assert.ok(of._isCollectionAccessor(accessor));
			done();
		});
		it('should return false with fixed accessor symbol', done => {
			var of = new ObjectFormatter('^');

			var accessor = ['@path.to.collection=[]', '@a.b.c="default"'];
			assert.ok(!of._isCollectionAccessor(accessor));
			done();
		});
		it('should return false when arg is not array', done => {
			var of = new ObjectFormatter();

			var accessor = '@this.is.simple.accessor.not.a.collection';
			assert.ok(!of._isCollectionAccessor(accessor));
			done();
		});
		it('should return false when array size is not 2', done => {
			var of = new ObjectFormatter();

			var accessor0 = [];
			var accessor1 = ['@this.is.simple.accessor.not.a.collection'];
			var accessor3 = ['@this', '@is', '@array'];
			assert.ok(!of._isCollectionAccessor(accessor0));
			assert.ok(!of._isCollectionAccessor(accessor1));
			assert.ok(!of._isCollectionAccessor(accessor3));
			done();
		});
		it('should return false when collection path is not simple accessor', done => {
			var of = new ObjectFormatter();

			var accessor = ['string value', '@hoge'];
			assert.ok(!of._isCollectionAccessor(accessor));
			done();
		});
		it('should return true when accessor[1] is simple accessor', done => {
			var of = new ObjectFormatter();

			var accessor = ['@simple.accessor', '@also.simple.accessor'];
			assert.ok(of._isCollectionAccessor(accessor));
			done();
		});
		it('should return false when accessor[1] is not object', done => {
			var of = new ObjectFormatter();

			assert.ok(!of._isCollectionAccessor(['@simple.accessor', 2345]));
			assert.ok(!of._isCollectionAccessor(['@simple.accessor', [2,3,4,5]]));
			assert.ok(!of._isCollectionAccessor(['@simple.accessor', 'string']));
			assert.ok(!of._isCollectionAccessor(['@simple.accessor', null]));
			done();
		});
		it('should return true when accessor[1] is object', done => {
			var of = new ObjectFormatter();

			assert.ok(of._isCollectionAccessor(['@simple.accessor', {hoge:2345}]));
			assert.ok(of._isCollectionAccessor(['@simple.accessor', {hoge:[2,3,4,5]}]));
			assert.ok(of._isCollectionAccessor(['@simple.accessor', {hoge:'string'}]));
			assert.ok(of._isCollectionAccessor(['@simple.accessor', {hoge:null}]));
			done();
		});
	});

	describe('_getValueWithAccessor', () => {
		it('ok', done => {
			var of = new ObjectFormatter();

			var stricteqArgs = [
				{ accessor: '@a', object: null, result: undefined },
				{ accessor: '@a', object: {a:1}, result: 1 },
				{ accessor: '@a', object: {}, result: undefined },
				{ accessor: '@', object: {}, result: undefined },
				{ accessor: '@a.b.c', object: {a:{'b':{c:2}}}, result: 2 },
				{ accessor: '@a.a.a', object: {a:1}, result: undefined },
				{ accessor: '@', object: {a:1}, result: undefined },
				{ accessor: '@@', object: {'@':3}, result: 3 },
				{ accessor: '@a=null', object: {a:1}, result: 1 },
				{ accessor: '@a.b=null', object: {a:1}, result: null },
				{ accessor: '@=111', object: {a:1}, result: 111 },
				{ accessor: 'invalid', object: {a:1}, result: undefined },
				{ accessor: '@a.1', object: {a:['a', 'aa', 'aaa']}, result: 'aa' },
				{ accessor: '@a.1.b', object: {a:['a', {b:'aa'}, 'aaa']}, result: 'aa' },
				{ accessor: '@a.100', object: {a:['a', 'aa', 'aaa']}, result: undefined },
				{ accessor: '@a.100="default"', object: {a:['a', 'aa', 'aaa']}, result: 'default' },
				{ accessor: '@a.this.b', object: {a:1,b:5}, result: undefined },
				{ accessor: '@a.length', object: {a:[1,2,3]}, result: 3 }
			];
			stricteqArgs.forEach(arg => {
				assert.strictEqual(of._getValueWithAccessor(arg.accessor, arg.object), arg.result);
			});

			var deepeqArgs = [
				{ accessor: '@a', object: {a:[1,2,3]}, result: [1,2,3] },
				{ accessor: '@a.b=[{},{a:"s"}, 5]', object: {a:1}, result: [{},{a:'s'}, 5] },
				{ accessor: '@a.0.a', object: {a:[{a: ['aa']}], b:9}, result: ['aa'] },
				{ accessor: '@@.@@.@@@=5', object: {'@':{'@@':{'@@@':{'@@@@':0}}}}, result: {'@@@@':0} },
				{ accessor: ['@a.c', '@b'], object: {a:{c:[ {b:1}, {b:2}, {} ]}}, result: [1,2,undefined] },
				{ accessor: ['@a.c', '@b'], object: {a:{c:[ {b:1}, null, {} ]}}, result: [1,undefined,undefined] },
				{ accessor: ['@a.c', '@b=3'], object: {a:{c:[ {b:1}, {b:2}, {} ]}}, result: [1,2,3] },
				{ accessor: ['@a.c', {p:['@b', '@c']}], object: {a:{c:[ {b:[{c:1},{c:2}]}, {b:[{c:3}]}, {b:[{}]} ]}}, result: [{p:[1,2]},{p:[3]},{p:[undefined]}] },
			];
			deepeqArgs.forEach(arg => {
				assert.deepEqual(of._getValueWithAccessor(arg.accessor, arg.object), arg.result);
			});

			done();
		});
		it('should return value of simple accessor when accessor is simple accessor', done => {
			var of = new ObjectFormatter();
			var accessor = '@a.c';
			var object = { dummy: 'Object' };
			of._isSimpleAccessor = _accessor => {
				assert.strictEqual(_accessor, accessor);
				return true;
			};
			of._isCollectionAccessor = _accessor => {
				assert.strictEqual(_accessor, accessor);
				return false;
			};
			var value = 'this is returned value';
			of._getValueWithSimpleAccessor = (_accessor, _object) => {
				assert.strictEqual(_accessor, accessor);
				assert.deepEqual(_object, object);
				return value;
			};
			of._getValueWithCollectionAccessor = (_accessor, _object) => {
				assert.strictEqual(_accessor, accessor);
				assert.deepEqual(_object, object);
				return;
			};

			assert.strictEqual(of._getValueWithAccessor(accessor, object), value);
			done();
		});
		it('should return value of collection accessor when accessor is collection accessor', done => {
			var of = new ObjectFormatter();
			var accessor = ['@a.c', '@c.c'];
			var object = { dummy: 'Object' };
			of._isSimpleAccessor = _accessor => {
				assert.strictEqual(_accessor, accessor);
				return false;
			};
			of._isCollectionAccessor = _accessor => {
				assert.strictEqual(_accessor, accessor);
				return true;
			};
			var value = 'this is returned value';
			of._getValueWithSimpleAccessor = (_accessor, _object) => {
				assert.strictEqual(_accessor, accessor);
				assert.deepEqual(_object, object);
				return;
			};
			of._getValueWithCollectionAccessor = (_accessor, _object) => {
				assert.strictEqual(_accessor, accessor);
				assert.deepEqual(_object, object);
				return value;
			};

			assert.strictEqual(of._getValueWithAccessor(accessor, object), value);
			done();
		});
		it('should return default value when arg is not accessor', done => {
			var of = new ObjectFormatter();
			var notAccessor = 'only string';
			var object = { dummy: 'Object' };
			of._isSimpleAccessor = _accessor => {
				assert.strictEqual(_accessor, notAccessor);
				return false;
			};
			of._isCollectionAccessor = _accessor => {
				assert.strictEqual(_accessor, notAccessor);
				return false;
			};
			of._getValueWithSimpleAccessor = (_accessor, _object) => {
				assert.strictEqual(_accessor, notAccessor);
				assert.deepEqual(_object, object);
				return 'value from simple accessor';
			};
			of._getValueWithCollectionAccessor = (_accessor, _object) => {
				assert.strictEqual(_accessor, notAccessor);
				assert.deepEqual(_object, object);
				return 'value from collection accessor';
			};

			assert.strictEqual(of._getValueWithAccessor(notAccessor, object), of.defaultValue);
			done();
		});
	});

	describe('_getValueWithSimpleAccessor', () => {
		it('ok', done => {
			var of = new ObjectFormatter();

			var stricteqArgs = [
				{ accessor: '@a', object: {a:1}, result: 1 },
			];
			stricteqArgs.forEach(arg => {
				assert.strictEqual(of._getValueWithSimpleAccessor(arg.accessor, arg.object), arg.result);
			});

			var deepeqArgs = [];
			deepeqArgs.forEach(arg => {
				assert.deepEqual(of._getValueWithSimpleAccessor(arg.accessor, arg.object), arg.result);
			});

			done();
		});
		it('should return temporary default value when object has no value of path', done => {
			var of = new ObjectFormatter();
			var simpleAccessor = '@simple.accessor';
			var object = { dummy: 'Object' };
			var temporaryDefaultValue = 'temptemp';
			of._getDefaultValueFromSimpleAccessor = _simpleAccessor => {
				assert.strictEqual(_simpleAccessor, simpleAccessor);
				return temporaryDefaultValue;
			};
			var path = 'pathpath';
			of._getPathFromSimpleAccessor = _simpleAccessor => {
				assert.strictEqual(_simpleAccessor, simpleAccessor);
				return path;
			};

			assert.strictEqual(of._getValueWithSimpleAccessor(simpleAccessor, object), temporaryDefaultValue);
			done();
		});
		it('should return temporary default value when object has no value of path', done => {
			var of = new ObjectFormatter();
			var simpleAccessor = '@simple.accessor';
			var object = { dummy: 'Object' };
			var temporaryDefaultValue = 'temptemp';
			of._getDefaultValueFromSimpleAccessor = _simpleAccessor => {
				assert.strictEqual(_simpleAccessor, simpleAccessor);
				return temporaryDefaultValue;
			};
			var path = 'dummy';
			of._getPathFromSimpleAccessor = _simpleAccessor => {
				assert.strictEqual(_simpleAccessor, simpleAccessor);
				return path;
			};

			assert.strictEqual(of._getValueWithSimpleAccessor(simpleAccessor, object), 'Object');
			done();
		});
	});

	describe('_isCollectionReturned', () => {
		it('should return true', done => {
			var of = new ObjectFormatter();
			var simpleAccessors = [
				'@c',
				'@d.e',
				'@c=1',
				'@d.e=1',
				// '@a=[{a:1}]', TODO: think this
				'@e'
			];
			var object = {
				c: [ {aa:11}, {bb:22}, {cc:33} ],
				d: {
					e: [ {aaa:111}, {bbb:222}, {ccc:333} ]
				},
				e: [{}]
			};

			simpleAccessors.forEach(simpleAccessor => {
				assert.ok(of._isCollectionReturned(simpleAccessor, object));
			});
			done();
		});
		it('should return false', done => {
			var of = new ObjectFormatter();
			var simpleAccessors = [
				'@a',
				'@b',
				'@c.aa',
				'@d'
			];
			var object = {
				c: [ {aa:11}, {bb:22}, {cc:33} ],
				d: {
					e: [ {aaa:111}, {bbb:222}, {ccc:333} ]
				},
				e: [{}]
			};

			simpleAccessors.forEach(simpleAccessor => {
				assert.ok(!of._isCollectionReturned(simpleAccessor, object));
			});
			done();
		});
		it('should return false when returned value is undefined', done => {
			var of = new ObjectFormatter();
			var simpleAccessor = '@a.b.c';
			var object = { dummy: 'test' };
			of._getPathFromSimpleAccessor = (_simpleAccessor) => {
				assert.strictEqual(_simpleAccessor, simpleAccessor);
				return 'path.to.properties';
			};

			assert.ok(!of._isCollectionReturned(simpleAccessor, object));
			done();
		});
		it('should return true when returned value exactly collection', done => {
			var of = new ObjectFormatter();
			var simpleAccessor = '@a.b.c';
			var object = { exactly: [ {}, {}, {} ] };
			of._getPathFromSimpleAccessor = (_simpleAccessor) => {
				assert.strictEqual(_simpleAccessor, simpleAccessor);
				return 'exactly';
			};

			assert.ok(of._isCollectionReturned(simpleAccessor, object));
			done();
		});
	});

	describe('_getValueWithCollectionAccessor', () => {
		it('ok', done => {
			var of = new ObjectFormatter();
			var collectionAccessorWithSimple = ['@a.b', '@c.d'];
			var collectionAccessorWithSchema = ['@a.b', { x: '@c.d' }];
			var object = {
				a: {
					b: [ {
						c: { d: 1 }
					}, {
						c: { d: 2 }
					}, {
						c: 'not object'
					} ]
				}
			};

			var valueSimple = of._getValueWithCollectionAccessor(collectionAccessorWithSimple, object);
			var expectedSimple = [ 1, 2, undefined ];
			assert.deepEqual(valueSimple, expectedSimple);

			var valueSchema = of._getValueWithCollectionAccessor(collectionAccessorWithSchema, object);
			var expectedSchema = [ { x: 1 }, { x: 2 }, { x: undefined } ];
			assert.deepEqual(valueSchema, expectedSchema);

			done();
		});
		it('should return array value accessor[1] is simple accessor', done => {
			var of = new ObjectFormatter();
			var collectionAccessor = ['@path.to.collection', '@simple.accessor'];
			var object = { dummy: 'Object' };
			var collection = [{ a: 'dummy' }, { a: 'collection' }];
			of._getValueWithSimpleAccessor = (_collectionPath, _object) => {
				assert.strictEqual(_collectionPath, collectionAccessor[0]);
				assert.deepEqual(_object, object);
				return collection;
			};
			of._isCollectionReturned = (_collectionPath, _object) => {
				assert.strictEqual(_collectionPath, collectionAccessor[0]);
				assert.deepEqual(_object, object);
				return true;
			};
			of._isSimpleAccessor = _accessor => {
				assert.strictEqual(_accessor, collectionAccessor[1]);
				return true;
			};
			var arrayValue = ['arr', 'ay'];
			of._getArrayValueWithCollection = (_mapPath, _collection) => {
				assert.strictEqual(_mapPath, collectionAccessor[1]);
				assert.deepEqual(_collection, collection);
				return arrayValue;
			};
			var collectionValue = [{ c: 'o' }, { c: 'oo' }];
			of._getCollectionValueWithCollection = (_mapPath, _collection) => {
				assert.strictEqual(_mapPath, collectionAccessor[1]);
				assert.deepEqual(_collection, collection);
				return collectionValue;
			};

			var result = of._getValueWithCollectionAccessor(collectionAccessor, object);
			assert.deepEqual(result, arrayValue);
			done();
		});
		it('should return collection value accessor[1] is object', done => {
			var of = new ObjectFormatter();
			var collectionAccessor = ['@path.to.collection', { schema: 'object' }];
			var object = { dummy: 'Object' };
			var collection = [{ a: 'dummy' }, { a: 'collection' }];
			of._getValueWithSimpleAccessor = (_collectionPath, _object) => {
				assert.strictEqual(_collectionPath, collectionAccessor[0]);
				assert.deepEqual(_object, object);
				return collection;
			};
			of._isCollectionReturned = (_collectionPath, _object) => {
				assert.strictEqual(_collectionPath, collectionAccessor[0]);
				assert.deepEqual(_object, object);
				return true;
			};
			of._isSimpleAccessor = _accessor => {
				assert.strictEqual(_accessor, collectionAccessor[1]);
				return false;
			};
			var arrayValue = ['arr', 'ay'];
			of._getArrayValueWithCollection = (_mapPath, _collection) => {
				assert.strictEqual(_mapPath, collectionAccessor[1]);
				assert.deepEqual(_collection, collection);
				return arrayValue;
			};
			var collectionValue = [{ c: 'o' }, { c: 'oo' }];
			of._getCollectionValueWithCollection = (_mapPath, _collection) => {
				assert.deepEqual(_mapPath, collectionAccessor[1]);
				assert.deepEqual(_collection, collection);
				return collectionValue;
			};

			var result = of._getValueWithCollectionAccessor(collectionAccessor, object);
			assert.deepEqual(result, collectionValue);
			done();
		});
	});

	describe('_getArrayValueWithCollection', () => {
		it('ok', done => {
			var of = new ObjectFormatter();
			var collection = [
				{ a: 'a1', b: 'b1' },
				{ a: 'a2' },
				{}
			];
			var data = [
				{ simpleAccessor: '@a', result: ['a1', 'a2', undefined] },
				{ simpleAccessor: '@b', result: ['b1', undefined, undefined] },
				{ simpleAccessor: '@c', result: [undefined, undefined, undefined] },
				{ simpleAccessor: '@c="a"', result: ["a", "a", "a"] }
			];

			data.forEach(asset => {
				var value = of._getArrayValueWithCollection(asset.simpleAccessor, collection);
				assert.deepEqual(value, asset.result);
			});
			done();
		});
		it('should return mapped values', done => {
			var of = new ObjectFormatter();
			var simpleAccessor = '@simple.accessor';
			var collection = [{ a: 'dummy' }, { a: 'collection' }];
			var returnedValue = 'valval';
			var i = 0;
			of._getValueWithAccessor = (_simpleAccessor, _object) => {
				assert.strictEqual(_simpleAccessor, simpleAccessor);
				assert.deepEqual(_object, collection[i]);
				i++;
				return returnedValue;
			};

			var result = of._getArrayValueWithCollection(simpleAccessor, collection);
			assert.deepEqual(result, [returnedValue, returnedValue]);
			done();
		});
	});

	describe('_getCollectionValueWithCollection', () => {
		it('ok', done => {
			var of = new ObjectFormatter();
			var collection = [
				{ a: 'a1', b: 'b1' },
				{ a: 'a2' },
				{}
			];
			var data = [
				{ schema: {p:'q'}, result: [{p:'q'}, {p:'q'}, {p:'q'}] },
				{ schema: {p:'@a'}, result: [{p:'a1'}, {p:'a2'}, {p:undefined}] },
				{ schema: {p:'@b=1'}, result: [{p:'b1'}, {p:1}, {p:1}] },
			];

			data.forEach(asset => {
				var value = of._getCollectionValueWithCollection(asset.schema, collection);
				assert.deepEqual(value, asset.result);
			});
			done();
		});
		it('should return mapped value', done => {
			var of = new ObjectFormatter();
			var schemaObject = {
				aa: '@a.a',
				ab: '@a.b',
				b: '@b'
			};
			var collection = [{
				a: {
					a: 'this is a.a',
					b: 'this is a.b'
				},
				b: 'this is b'
			}, {
				a: {
					a: 'path: a.a',
					b: 'path: a.b'
				},
				b: 'path: b'
			}];
			var i = 0;
			var formattedObject = { u: 'uuu' };
			of.format = (_schema, _object) => {
				assert.deepEqual(_schema, schemaObject);
				assert.deepEqual(_object, collection[i]);
				i++;
				return formattedObject;
			};

			var result = of._getCollectionValueWithCollection(schemaObject, collection);
			assert.deepEqual(result, [formattedObject, formattedObject]);
			done();
		});
	});

	describe('_getDefaultValueFromSimpleAccessor', () => {
		it('ok', done => {
			var of = new ObjectFormatter();
			var data = [
				{ accessor: '@a', result: undefined },
				{ accessor: '@a.b.c.d', result: undefined },
				{ accessor: '@a=null', result: null },
				{ accessor: '@a=1', result: 1 },
				{ accessor: '@a="null"', result: "null" },
				{ accessor: '@a=undefined', result: undefined },
				{ accessor: '@a===1', result: undefined },
				{ accessor: '@a=a=a', result: undefined }
			];

			data.forEach(asset => {
				var value = of._getDefaultValueFromSimpleAccessor(asset.accessor);
				assert.deepEqual(value, asset.result);
			});
			done();
		});
		it('should return raw default value when simple accessor with no default', done => {
			var of = new ObjectFormatter('@', '-----');
			var simpleAccessor = '@a.b.c';

			assert.strictEqual(of._getDefaultValueFromSimpleAccessor(simpleAccessor), '-----');
			done();
		});
		it('should return raw default value when simple accessor is invalid', done => {
			var of = new ObjectFormatter('@', '-----');
			var simpleAccessor = '@a.b.c=hoge=fuga=iii';

			assert.strictEqual(of._getDefaultValueFromSimpleAccessor(simpleAccessor), '-----');
			done();
		});
		it('should return string temporary default value', done => {
			var of = new ObjectFormatter('@', '-----');
			var simpleAccessor = '@a.b.c="temptemp"';

			assert.strictEqual(of._getDefaultValueFromSimpleAccessor(simpleAccessor), 'temptemp');
			done();
		});
		it('should return number temporary default value', done => {
			var of = new ObjectFormatter('@', '-----');
			var simpleAccessor = '@a.b.c=86453';

			assert.strictEqual(of._getDefaultValueFromSimpleAccessor(simpleAccessor), 86453);
			done();
		});
		it('should return null temporary default value', done => {
			var of = new ObjectFormatter('@', '-----');
			var simpleAccessor = '@a.b.c=null';

			assert.strictEqual(of._getDefaultValueFromSimpleAccessor(simpleAccessor), null);
			done();
		});
		it('should return object temporary default value', done => {
			var of = new ObjectFormatter('@', '-----');
			var simpleAccessor = '@a.b.c={ temp: "temp" }';

			assert.deepEqual(of._getDefaultValueFromSimpleAccessor(simpleAccessor), { temp: 'temp' });
			done();
		});
		it('should return array temporary default value', done => {
			var of = new ObjectFormatter('@', '-----');
			var simpleAccessor = '@a.b.c=[1, 3, 5]';

			assert.deepEqual(of._getDefaultValueFromSimpleAccessor(simpleAccessor), [1, 3, 5]);
			done();
		});
	});

	describe('_getPathFromSimpleAccessor', () => {
		it('ok', done => {
			var of = new ObjectFormatter();
			var data = [
				{ accessor: '@a', result: 'a' },
				{ accessor: '@a.b.c', result: 'a.b.c' },
				{ accessor: '@a.b.c=7824', result: 'a.b.c' },
				{ accessor: '@a.b.c===', result: 'a.b.c' }
			];

			data.forEach(asset => {
				var value = of._getPathFromSimpleAccessor(asset.accessor);
				assert.strictEqual(value, asset.result);
			});
			done();
		});
		it('should return path string with no default', done => {
			var of = new ObjectFormatter();
			var simpleAccessor = '@simple.path.string';

			assert.strictEqual(of._getPathFromSimpleAccessor(simpleAccessor), 'simple.path.string');
			done();
		});
		it('should return path string with default', done => {
			var of = new ObjectFormatter();
			var simpleAccessor = '@simple.path.string=["de", "fa", "ult"]';

			assert.strictEqual(of._getPathFromSimpleAccessor(simpleAccessor), 'simple.path.string');
			done();
		});
	});
});
