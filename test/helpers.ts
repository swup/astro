import { transformSync } from 'esbuild';
import { deserialise } from '../src/serialise.js';

/** Collapse the emitted script's indentation and blank lines so snapshots stay reviewable. */
export function normalise(script: string): string {
	return script
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
		.join('\n');
}

/** Names of the plugins instantiated in the `plugins: [...]` array, in emission order. */
export function plugins(script: string): string[] {
	return [...script.matchAll(/new (Swup\w+)\(/g)].map(([, name]) => name);
}

/** Raw source text of a top-level option passed to the Swup constructor. */
export function option(script: string, name: string): string | undefined {
	return script.match(new RegExp(`^\\s*${name}: (.*),$`, 'm'))?.[1];
}

/** Runtime options a plugin will receive, with regexes and functions revived. */
export function pluginOptions(script: string, plugin: string): unknown {
	const start = script.indexOf(`new ${plugin}(`);
	if (start === -1) throw new Error(`Plugin ${plugin} not found in script`);
	return evaluateArgument(readBalanced(script, script.indexOf('(', start)));
}

/** Reads a parenthesised expression starting at `open`, returning its contents. */
function readBalanced(source: string, open: number): string {
	let depth = 0;
	for (let i = open; i < source.length; i++) {
		if (source[i] === '(') depth++;
		if (source[i] === ')' && --depth === 0) return source.slice(open + 1, i);
	}
	throw new Error('Unbalanced parentheses in emitted script');
}

/** Turns emitted `deserialise("…")` / object-literal source back into a value. */
function evaluateArgument(source: string): unknown {
	const serialised = source.trim().match(/^deserialise\((".*")\)$/s);
	if (serialised) return deserialise(JSON.parse(serialised[1]));
	return JSON.parse(source.trim() || 'null');
}

/** Throws if the emitted script is not valid ES module syntax. */
export function assertParses(script: string): void {
	transformSync(script, { loader: 'js', format: 'esm' });
}
