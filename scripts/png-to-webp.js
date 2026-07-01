#!/usr/bin/env node
/**
 * png-to-webp.js
 *
 * Конвертирует PNG-ассеты лендинга в WebP, удаляет исходные PNG и
 * перевешивает ссылки .png → .webp в исходниках (pug + scss), а не в
 * скомпилированном HTML (его пересоберёт gulp из pug).
 *
 * По умолчанию работает по public/img/wolfe — реальные картинки страницы.
 * Качество не агрессивное (quality 90), чтобы графики/скрины не сыпались.
 *
 * Запуск:
 *   node scripts/png-to-webp.js            # конвертировать + удалить png + переписать ссылки
 *   node scripts/png-to-webp.js --dry-run  # только показать, что будет сделано
 *   node scripts/png-to-webp.js --keep-png # не удалять исходные png
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import imageminWebp from 'imagemin-webp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

// --- конфиг ---------------------------------------------------------------
const IMG_DIR = path.join(root, 'public/img/wolfe') // где лежат картинки
const REF_DIRS = [path.join(root, 'source/pug')] // где искать ссылки (pug + scss)
const REF_EXT = new Set(['.pug', '.scss'])
const QUALITY = 90 // не сильно жёстко
// Переписываем только пути, указывающие на наши картинки, чтобы не зацепить чужое.
const REF_RE = /(img\/wolfe\/[^"'`)\s]+?)\.png/g
// -------------------------------------------------------------------------

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const keepPng = args.has('--keep-png')

function walk(dir, filter) {
	const out = []
	if (!fs.existsSync(dir)) return out
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name)
		if (entry.isDirectory()) out.push(...walk(full, filter))
		else if (filter(full)) out.push(full)
	}
	return out
}

const fmt = (bytes) => `${(bytes / 1024).toFixed(1)} KB`

async function convertImages() {
	const pngs = walk(IMG_DIR, (f) => f.toLowerCase().endsWith('.png'))
	let before = 0
	let after = 0
	console.log(`\n→ Конвертация PNG → WebP (quality ${QUALITY}) в ${path.relative(root, IMG_DIR)}`)
	console.log(`  найдено PNG: ${pngs.length}\n`)

	for (const png of pngs) {
		const rel = path.relative(root, png)
		const webpPath = png.replace(/\.png$/i, '.webp')
		const input = fs.readFileSync(png)
		before += input.length

		if (dryRun) {
			console.log(`  [dry] ${rel} → ${path.basename(webpPath)}`)
			continue
		}

		const output = await imageminWebp({ quality: QUALITY, method: 6 })(input)
		fs.writeFileSync(webpPath, output)
		after += output.length
		if (!keepPng) fs.unlinkSync(png)
		console.log(
			`  ✓ ${rel}  (${fmt(input.length)} → ${fmt(output.length)}, -${(
				(1 - output.length / input.length) *
				100
			).toFixed(0)}%)`,
		)
	}

	if (!dryRun && pngs.length) {
		console.log(
			`\n  итого: ${fmt(before)} → ${fmt(after)} (экономия ${(
				(1 - after / before) *
				100
			).toFixed(0)}%)`,
		)
		if (!keepPng) console.log(`  удалено PNG: ${pngs.length}`)
	}
	return pngs.length
}

function rewriteReferences() {
	const files = REF_DIRS.flatMap((d) => walk(d, (f) => REF_EXT.has(path.extname(f))))
	console.log(`\n→ Перевешивание ссылок .png → .webp в исходниках (pug/scss)`)
	let touched = 0
	let replacements = 0

	for (const file of files) {
		const src = fs.readFileSync(file, 'utf8')
		let count = 0
		const next = src.replace(REF_RE, (_m, base) => {
			count++
			return `${base}.webp`
		})
		if (count > 0) {
			replacements += count
			touched++
			const rel = path.relative(root, file)
			if (dryRun) {
				console.log(`  [dry] ${rel}: ${count} ссыл.`)
			} else {
				fs.writeFileSync(file, next)
				console.log(`  ✓ ${rel}: ${count} ссыл.`)
			}
		}
	}
	console.log(`\n  файлов затронуто: ${touched}, ссылок переписано: ${replacements}`)
}

async function main() {
	console.log(dryRun ? '=== DRY RUN (ничего не меняю) ===' : '=== png-to-webp ===')
	await convertImages()
	rewriteReferences()
	console.log(
		dryRun
			? '\nГотово (dry-run). Убери --dry-run, чтобы применить.'
			: '\nГотово. Пересобери pug: `npm run build` (или gulp dev).',
	)
}

main().catch((err) => {
	console.error('Ошибка:', err)
	process.exit(1)
})
