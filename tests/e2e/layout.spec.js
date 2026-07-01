import { test, expect } from '@playwright/test'

const PAGES = ['/', '/00-modal.html']
const VIEWPORTS = [
	{ name: 'mobile', width: 375, height: 812 },
	{ name: 'tablet', width: 768, height: 1024 },
	{ name: 'desktop', width: 1280, height: 900 },
]

for (const page of PAGES) {
	for (const vp of VIEWPORTS) {
		test(`${page} — no horizontal overflow at ${vp.name} (${vp.width}px)`, async ({ page: pw }) => {
			await pw.setViewportSize({ width: vp.width, height: vp.height })
			await pw.goto(page)
			const overflow = await pw.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth + 1,
			)
			expect(overflow).toBe(true)
		})
	}
}

test('index.html — sCatalog row uses Bootstrap row (display flex or grid)', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 })
	await page.goto('/')

	// The .sCatalog__row.row is a Bootstrap row — should be display:flex
	const display = await page.evaluate(() => {
		const el = document.querySelector('.sCatalog__row.row')
		if (!el) return null
		return window.getComputedStyle(el).display
	})
	// Bootstrap row uses flexbox
	expect(display).toBe('flex')
})

test('index.html — all product-item cards in a row have equal offsetHeight', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 })
	await page.goto('/')

	const heights = await page.evaluate(() => {
		const items = Array.from(document.querySelectorAll('.product-item'))
		return items.map((el) => el.offsetHeight)
	})

	expect(heights.length).toBeGreaterThan(0)
	// All heights should be identical (CSS equalises card heights via flex)
	const first = heights[0]
	for (const h of heights) {
		expect(h).toBe(first)
	}
})

test('index.html — container has positive width at desktop', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 })
	await page.goto('/')

	const width = await page.evaluate(() => {
		const el = document.querySelector('.container')
		if (!el) return 0
		return el.getBoundingClientRect().width
	})
	expect(width).toBeGreaterThan(200)
})
