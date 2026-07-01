import { describe, it, expect } from 'vitest'
import { parse } from 'node-html-parser'
import { renderBlock } from './helpers/render-block.js'

// ---------------------------------------------------------------------------
// sCatalog block
// ---------------------------------------------------------------------------
describe('sCatalog block', () => {
	it('renders without throwing', () => {
		expect(() => renderBlock('sCatalog')).not.toThrow()
	})

	it('contains .product-item elements', () => {
		const html = renderBlock('sCatalog')
		const root = parse(html)
		const items = root.querySelectorAll('.product-item')
		expect(items.length).toBeGreaterThanOrEqual(1)
	})

	it('each product-item has an img-wrap anchor with aria-label', () => {
		const html = renderBlock('sCatalog')
		const root = parse(html)
		const anchors = root.querySelectorAll('.product-item__img-wrap')
		expect(anchors.length).toBeGreaterThanOrEqual(1)
		for (const a of anchors) {
			expect(a.getAttribute('aria-label')).toBeTruthy()
		}
	})

	it('each product-item has a button link', () => {
		const html = renderBlock('sCatalog')
		const root = parse(html)
		const btns = root.querySelectorAll('.product-item__btn')
		expect(btns.length).toBeGreaterThanOrEqual(1)
		for (const btn of btns) {
			expect(btn.text.trim()).toBeTruthy()
		}
	})

	it('matches HTML snapshot', () => {
		const html = renderBlock('sCatalog')
		expect(html).toMatchSnapshot()
	})
})

// ---------------------------------------------------------------------------
// product-item mixin (called standalone)
// ---------------------------------------------------------------------------
describe('product-item mixin', () => {
	it('renders title, text and price from arguments', () => {
		const html = renderBlock('sCatalog', {
			call: "+product-item('1', 'My Title', 'My text', '$42')",
		})
		const root = parse(html)
		expect(root.querySelector('.product-item__title')?.text.trim()).toBe('My Title')
		expect(root.querySelector('.product-item__text')?.text.trim()).toBe('My text')
		expect(root.querySelector('.product-item__price')?.text.trim()).toBe('$42')
	})

	it('aria-label uses the supplied title', () => {
		const html = renderBlock('sCatalog', {
			call: "+product-item('2', 'Aria Title', '', '')",
		})
		const root = parse(html)
		expect(root.querySelector('.product-item__img-wrap')?.getAttribute('aria-label')).toBe(
			'Aria Title',
		)
	})

	it('falls back to default aria-label when title is empty', () => {
		const html = renderBlock('sCatalog', { call: "+product-item('3', '', '', '')" })
		const root = parse(html)
		// mixin uses `(t || 'Товар')` so empty string falls back to 'Товар'
		expect(root.querySelector('.product-item__img-wrap')?.getAttribute('aria-label')).toBe('Товар')
	})
})

// ---------------------------------------------------------------------------
// form-wrap / input mixin
// ---------------------------------------------------------------------------
describe('form-wrap input mixin', () => {
	it('renders without throwing', () => {
		expect(() =>
			renderBlock('form-wrap', {
				call: "+input('Your name', 'text', 'Name label')",
			}),
		).not.toThrow()
	})

	it('renders an input with the given placeholder', () => {
		const html = renderBlock('form-wrap', {
			call: "+input('Your name', 'text', 'Name label')",
		})
		const root = parse(html)
		const input = root.querySelector('input.form-control')
		expect(input?.getAttribute('placeholder')).toBe('Your name')
	})

	it('renders a label when label arg is provided', () => {
		const html = renderBlock('form-wrap', {
			call: "+input('Placeholder', 'text', 'Label text')",
		})
		const root = parse(html)
		expect(root.querySelector('label')).toBeTruthy()
		expect(root.querySelector('.input-title')?.text.trim()).toBe('Label text')
	})

	it('matches HTML snapshot', () => {
		const html = renderBlock('form-wrap', {
			call: "+input('Snapshot placeholder', 'text', 'Snapshot label')",
		})
		expect(html).toMatchSnapshot()
	})
})
