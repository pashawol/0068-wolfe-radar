/**
 * Render a Pug block in isolation using the validated fixture pattern.
 * Uses in-memory pug.render() with the correct basedir so that
 * include paths resolve from the project root.
 *
 * Supports two file-naming conventions found in the project:
 *   1. Canonical: source/pug/blocks/<name>/_<name>.pug  (e.g. sCatalog)
 *   2. Alternate: source/pug/blocks/<name>/<name>.pug   (e.g. form-wrap)
 *
 * @param {string} name - Block folder/mixin name (e.g. 'sCatalog')
 * @param {object} options
 * @param {string} [options.call] - Override the default `+<name>()` invocation
 * @param {string} [options.file] - Override the include path (relative to basedir)
 * @returns {string} Rendered HTML
 */
import pug from 'pug'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Project root — two levels up from tests/helpers/
const PROJECT_ROOT = path.resolve(__dirname, '..', '..')

function resolveBlockFile(name) {
	// Try canonical _<name>.pug first, then bare <name>.pug
	const candidates = [
		`source/pug/blocks/${name}/_${name}.pug`,
		`source/pug/blocks/${name}/${name}.pug`,
	]
	for (const rel of candidates) {
		if (fs.existsSync(path.join(PROJECT_ROOT, rel))) return rel
	}
	// Fall back to canonical (will surface a clear error from pug)
	return candidates[0]
}

/**
 * @param {string} name - Block folder/mixin name (e.g. 'sCatalog')
 * @param {object} options
 * @param {string} [options.call]   - Override the default `+<name>()` invocation.
 *                                    Use locals for dynamic data instead of interpolation.
 * @param {string} [options.file]   - Override the block include path (relative to basedir)
 * @param {object} [options.locals] - Variables injected into the pug template as-is
 *                                    (safe; no shell-injection risk). Preferred for fuzz data.
 */
export function renderBlock(name, { call, file, locals = {} } = {}) {
	const invocation = call ?? `+${name}()`
	const blockFile = file ?? resolveBlockFile(name)
	const src = [`include source/pug/layout/include.pug`, `include ${blockFile}`, invocation].join(
		'\n',
	)

	return pug.render(src, {
		basedir: PROJECT_ROOT,
		// `filename` makes relative includes inside the pug files resolve correctly
		filename: path.join(PROJECT_ROOT, '_fixture.pug'),
		pretty: true,
		...locals,
	})
}
