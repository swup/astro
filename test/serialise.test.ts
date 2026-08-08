import { describe, expect, it } from 'vitest';

import { deserialise, serialise, serialiseOptions } from '../src/serialise.js';

/** Runs a value through the exact path the emitted script takes: serialise → eval → deserialise. */
function roundTrip<T>(value: T): T {
	const source = serialise(value);
	const inner = source.match(/^deserialise\((".*")\)$/s)![1];
	return deserialise(JSON.parse(inner)) as T;
}

describe('round trip', () => {
	it.each([
		['null', null],
		['string', 'hello'],
		['number', 42],
		['boolean', true],
		['array', [1, 'two', false]],
		['nested object', { a: { b: ['c'] } }],
		['empty object', {}]
	])('preserves %s', (_name, value) => {
		expect(roundTrip(value)).toEqual(value);
	});

	it('preserves regexes including flags', () => {
		const result = roundTrip({ pattern: /\.pdf$/gi });
		expect(result.pattern).toBeInstanceOf(RegExp);
		expect(result.pattern.source).toBe('\\.pdf$');
		expect(result.pattern.flags.split('').sort().join('')).toBe('gi');
	});

	it('preserves arrow functions', () => {
		const result = roundTrip({ fn: (url: string) => url.startsWith('/api') });
		expect(result.fn('/api/users')).toBe(true);
		expect(result.fn('/blog')).toBe(false);
	});

	it('preserves shorthand methods', () => {
		const result = roundTrip({
			fn(url: string) {
				return url.length;
			}
		});
		expect(result.fn('/abc')).toBe(4);
	});

	it('preserves mixed arrays of matchers', () => {
		const result = roundTrip(['/admin', /\.pdf$/, (url: string) => url === '/x']);
		expect(result[0]).toBe('/admin');
		expect(result[1]).toBeInstanceOf(RegExp);
		expect(typeof result[2]).toBe('function');
	});

	it('escapes quotes and newlines in function bodies', () => {
		const result = roundTrip({
			fn: (url: string) => url.includes('"quoted"') && url.includes("'single'")
		});
		expect(result.fn('a"quoted"b')).toBe(false);
		expect(result.fn(`"quoted"'single'`)).toBe(true);
	});
});

describe('serialiseOptions template tag', () => {
	it('inlines objects as deserialise calls', () => {
		expect(serialiseOptions`new Plugin(${{ a: 1 }})`).toBe(
			`new Plugin(deserialise(${JSON.stringify('{"a":1}')}))`
		);
	});

	it('drops falsy substitutions', () => {
		expect(serialiseOptions`new Plugin(${false})`).toBe('new Plugin()');
	});

	it('inlines truthy primitives directly', () => {
		expect(serialiseOptions`new Plugin(${'x'})`).toBe('new Plugin(x)');
	});
});

describe('known limitations', () => {
	// The reviver sniffs any 2-element array whose second entry is a string, so user data
	// shaped like a marker tuple is silently rewritten. Documented here so a fix is a visible diff.
	it('does not yet round-trip two-element string arrays', () => {
		const result = roundTrip({ pair: [':regex:', '/x/'] });
		expect(result.pair).toBeInstanceOf(RegExp);
	});
});
