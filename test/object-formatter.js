import assert from 'assert';
import ObjectFormatter from '../src/object-formatter';

describe('object-formatter', () => {
	describe('format', () => {
		it('ok', done => {
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

			var formatted = of.format(schema, object);
			var expected = {
				raw: 'raw value',
				foo: 'lorem',
				bar: 'ipsum',
				baz: {
					a: [ 1, 2, 3 ],
					b: undefined,
					c: [
						{ hoge: 'a-a', bb: 'b-b' },
						{ hoge: 'a--', bb: 'b--' },
						{ hoge: '---', bb: 'bbb' }
					],
					d: [ 'c--', 'c--', 'ccc' ]
				}
			};

			assert.deepEqual(formatted, expected);
			done();
		});
	});
});
