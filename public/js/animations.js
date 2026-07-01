// ── Lenis smooth scroll ────────────────────────────────────────────────────────
const lenis = new Lenis({
	lerp: 0.08,
	smoothWheel: true,
})

gsap.registerPlugin(ScrollTrigger)

lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

// ── Utility: split element text into per-line spans ───────────────────────────
function splitLines(el) {
	const text = el.innerText
	const words = text.split(/\s+/)
	el.innerHTML = words.map((w) => `<span class="word">${w} </span>`).join('')

	const lines = []
	let currentLine = []
	let lastTop = null

	el.querySelectorAll('.word').forEach((word) => {
		const top = word.getBoundingClientRect().top
		if (lastTop === null) lastTop = top
		if (Math.abs(top - lastTop) > 4) {
			lines.push(currentLine)
			currentLine = []
			lastTop = top
		}
		currentLine.push(word)
	})
	if (currentLine.length) lines.push(currentLine)

	el.innerHTML = lines
		.map((line) => {
			const lineText = line.map((w) => w.outerHTML).join('')
			return `<span class="line-wrap" style="display:block;overflow:hidden;"><span class="line-inner" style="display:block;">${lineText}</span></span>`
		})
		.join('')

	return el.querySelectorAll('.line-inner')
}

// ── Utility: 3D card reveal (rotateX flip-up with perspective) ───────────────
function card3D(selector, triggerSelector, staggerVal = 0.08) {
	const els = gsap.utils.toArray(selector)
	if (!els.length) return
	const trigger = (triggerSelector ? document.querySelector(triggerSelector) : null) || els[0]
	gsap.from(els, {
		rotateX: 28,
		y: 60,
		opacity: 0,
		transformPerspective: 900,
		transformOrigin: 'top center',
		duration: 0.9,
		ease: 'power3.out',
		stagger: staggerVal,
		scrollTrigger: { trigger, start: 'top 82%', once: true },
	})
}

// ── Utility: hover tilt on cards ─────────────────────────────────────────────
function addHoverTilt(selector, strength = 8) {
	document.querySelectorAll(selector).forEach((card) => {
		card.addEventListener('mousemove', (e) => {
			const r = card.getBoundingClientRect()
			const x = (e.clientX - r.left) / r.width - 0.5
			const y = (e.clientY - r.top) / r.height - 0.5
			gsap.to(card, {
				rotateY: x * strength,
				rotateX: -y * strength,
				transformPerspective: 700,
				duration: 0.35,
				ease: 'power2.out',
			})
		})
		card.addEventListener('mouseleave', () => {
			gsap.to(card, {
				rotateY: 0,
				rotateX: 0,
				duration: 0.6,
				ease: 'power3.out',
			})
		})
	})
}

// ── Utility: heading fade-up ──────────────────────────────────────────────────
function fadeUp(selector, { y = 50, duration = 0.8, start = 'top 82%' } = {}) {
	gsap.utils.toArray(selector).forEach((el) => {
		gsap.from(el, {
			y,
			opacity: 0,
			duration,
			ease: 'power3.out',
			scrollTrigger: { trigger: el, start, once: true },
		})
	})
}

// ── Text line reveal helper ───────────────────────────────────────────────────
function lineReveal(selector, { start = 'top 85%', stagger = 0.1 } = {}) {
	gsap.utils.toArray(selector).forEach((el) => {
		const lines = splitLines(el)
		if (!lines.length) return
		gsap.from(lines, {
			yPercent: 110,
			rotateX: 14,
			transformPerspective: 600,
			duration: 0.9,
			ease: 'power3.out',
			stagger,
			scrollTrigger: { trigger: el, start, once: true },
		})
	})
}

// ══════════════════════════════════════════════════════════════════════════════
// ANIMATIONS
// ══════════════════════════════════════════════════════════════════════════════

function initAnimations() {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

	// ── Hero — plays on load, no scroll ───────────────────────────────────────
	const hero = document.querySelector('.headerBlock')
	if (hero) {
		const heroLines = splitLines(hero.querySelector('.headerBlock__title'))
		const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
		tl.from('.headerBlock .sBadge', { x: -30, opacity: 0, duration: 0.6 })
			.from(
				heroLines,
				{ yPercent: 110, rotateX: 14, transformPerspective: 600, duration: 1, stagger: 0.08 },
				'-=0.3',
			)
			.from('.headerBlock__desc', { y: 30, opacity: 0, duration: 0.7 }, '-=0.5')
			.from('.headerBlock .btn', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
			.from(
				'.headerBlock__img, .headerBlock__photo',
				{ scale: 1.06, opacity: 0, duration: 1.4, ease: 'power2.out' },
				'-=1',
			)

		// Parallax on hero image
		const heroImg = document.querySelector('.headerBlock__img, .headerBlock__photo')
		if (heroImg) {
			gsap.to(heroImg, {
				y: -60,
				ease: 'none',
				scrollTrigger: {
					trigger: hero,
					start: 'top top',
					end: 'bottom top',
					scrub: true,
				},
			})
		}
	}

	// ── Badges (non-hero) ─────────────────────────────────────────────────────
	gsap.utils.toArray('section .sBadge').forEach((el) => {
		if (el.closest('.headerBlock')) return
		gsap.from(el, {
			x: -30,
			opacity: 0,
			duration: 0.6,
			ease: 'power2.out',
			scrollTrigger: { trigger: el, start: 'top 82%', once: true },
		})
	})

	// ── Section h2 line reveal ────────────────────────────────────────────────
	gsap.utils.toArray('section h2').forEach((el) => {
		const lines = splitLines(el)
		if (!lines.length) return
		gsap.from(lines, {
			yPercent: 110,
			rotateX: 14,
			transformPerspective: 600,
			duration: 0.9,
			ease: 'power3.out',
			stagger: 0.08,
			scrollTrigger: { trigger: el, start: 'top 85%', once: true },
		})
	})

	// ── Section h3 fade-up ────────────────────────────────────────────────────
	fadeUp('section h3', { y: 40, duration: 0.7 })

	// ── sFacts items — slide from left ────────────────────────────────────────
	gsap.utils.toArray('.sFacts__item').forEach((el, i) => {
		gsap.from(el, {
			x: -80,
			opacity: 0,
			duration: 0.8,
			ease: 'power3.out',
			delay: i * 0.06,
			scrollTrigger: { trigger: el, start: 'top 82%', once: true },
		})
	})

	// ── sStrategy cols & steps — clip reveal ──────────────────────────────────
	card3D('.sStrategy__col', '.sStrategy__cols', 0.1)
	card3D('.sStrategy__step', '.sStrategy__steps', 0.08)

	// ── sMethods cards — clip reveal ──────────────────────────────────────────
	card3D('.sMethods .swiper-slide', '.sMethods__cards', 0.07)
	const bigCard = document.querySelector('.sMethods__big-card')
	if (bigCard) {
		gsap.from(bigCard, {
			clipPath: 'inset(0 0 100% 0)',
			opacity: 0,
			duration: 1,
			ease: 'power3.out',
			scrollTrigger: { trigger: bigCard, start: 'top 82%', once: true },
		})
	}

	// ── sStuck traps — alternating sides ─────────────────────────────────────
	gsap.utils.toArray('.sStuck__trap-item').forEach((el, i) => {
		gsap.from(el, {
			x: i % 2 === 0 ? -50 : 50,
			opacity: 0,
			duration: 0.6,
			ease: 'power2.out',
			delay: i * 0.05,
			scrollTrigger: {
				trigger: el.closest('.sStuck__traps') || el,
				start: 'top 82%',
				once: true,
			},
		})
	})
	card3D('.sStuck__mentor-card', '.sStuck__mentor-cards', 0.1)

	// ── sAuthor q-cards — clip reveal ────────────────────────────────────────
	card3D('.sAuthor__q-card', '.sAuthor__q-cards', 0.1)

	// ── sAudience cards — clip reveal ────────────────────────────────────────
	card3D('.sAudience__card', '.sAudience__cards', 0.1)
	const audBottom = document.querySelector('.sAudience__bottom')
	if (audBottom) {
		gsap.from(audBottom, {
			y: 30,
			opacity: 0,
			duration: 0.7,
			ease: 'power2.out',
			scrollTrigger: { trigger: audBottom, start: 'top 82%', once: true },
		})
	}

	// ── sProgram rows ─────────────────────────────────────────────────────────
	gsap.utils.toArray('.sProgram__row').forEach((el) => {
		gsap.from(el, {
			y: 40,
			opacity: 0,
			duration: 0.7,
			ease: 'power2.out',
			scrollTrigger: { trigger: el, start: 'top 82%', once: true },
		})
	})
	const progSummary = document.querySelector('.sProgram__summary')
	if (progSummary) {
		gsap.from(progSummary, {
			y: 30,
			opacity: 0,
			duration: 0.8,
			scrollTrigger: { trigger: progSummary, start: 'top 82%', once: true },
		})
	}

	// ── sOutcome cards — clip reveal ──────────────────────────────────────────
	card3D('.sOutcome__card', '.sOutcome__cards', 0.06)
	const outcomeClosing = document.querySelector('.sOutcome__closing')
	if (outcomeClosing) {
		gsap.from(outcomeClosing, {
			y: 30,
			opacity: 0,
			duration: 0.7,
			scrollTrigger: { trigger: outcomeClosing, start: 'top 82%', once: true },
		})
	}

	// ── sKotin quote — fade up (container has nested elements, no splitLines) ──
	const kotinQuote = document.querySelector('.sKotin__quote')
	if (kotinQuote) {
		gsap.from(kotinQuote, {
			y: 40,
			opacity: 0,
			duration: 1,
			ease: 'power3.out',
			scrollTrigger: { trigger: kotinQuote, start: 'top 85%', once: true },
		})
	}

	// ── sClosing — time text paragraphs ──────────────────────────────────────
	gsap.utils.toArray('.sClosing__time-text p, .sClosing__time-bottom p').forEach((el, i) => {
		gsap.from(el, {
			opacity: 0,
			y: 20,
			duration: 0.6,
			delay: i * 0.08,
			scrollTrigger: { trigger: el, start: 'top 85%', once: true },
		})
	})

	// ── sClosing quote — fade up (has em tag, no splitLines) ────────────────
	const closingQuote = document.querySelector('.sClosing__quote')
	if (closingQuote) {
		gsap.from(closingQuote, {
			y: 50,
			opacity: 0,
			duration: 1,
			ease: 'power3.out',
			scrollTrigger: { trigger: closingQuote, start: 'top 85%', once: true },
		})
	}

	// ── sClosing cards — clip reveal ─────────────────────────────────────────
	card3D('.sClosing__card', '.sClosing__cards', 0.09)

	// ── sClosing list items — slide from left ────────────────────────────────
	gsap.utils.toArray('.sClosing__list li').forEach((el, i) => {
		gsap.from(el, {
			opacity: 0,
			x: -30,
			duration: 0.5,
			ease: 'power2.out',
			delay: i * 0.07,
			scrollTrigger: {
				trigger: el.closest('.sClosing__list') || el,
				start: 'top 82%',
				once: true,
			},
		})
	})

	// ── sClosing outro ────────────────────────────────────────────────────────
	const outro = document.querySelector('.sClosing__outro')
	if (outro) {
		gsap.from(outro, {
			y: 40,
			opacity: 0,
			duration: 0.9,
			scrollTrigger: { trigger: outro, start: 'top 82%', once: true },
		})
	}
	// ── FAQ & QA accordion items ──────────────────────────────────────────────
	;['.sFAQ .dd-group__item', '.sQA .dd-group__item'].forEach((sel) => {
		gsap.utils.toArray(sel).forEach((el, i) => {
			gsap.from(el, {
				opacity: 0,
				y: 20,
				duration: 0.5,
				delay: i * 0.07,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: el.closest('.dd-group') || el,
					start: 'top 80%',
					once: true,
				},
			})
		})
	})

	// ── Generic outro / CTA blocks ────────────────────────────────────────────
	gsap.utils
		.toArray('.sStrategy__outro, .sMethods__cta, .sStuck__closing, .sFacts__closing')
		.forEach((el) => {
			gsap.from(el, {
				opacity: 0,
				y: 30,
				duration: 0.8,
				scrollTrigger: { trigger: el, start: 'top 82%', once: true },
			})
		})

	// ── sProblem ──────────────────────────────────────────────────────────────
	fadeUp('.sProblem__sub', { y: 24, duration: 0.6 })
	gsap.utils.toArray('.sProblem__list-item').forEach((el, i) => {
		gsap.from(el, {
			x: -50,
			opacity: 0,
			duration: 0.55,
			ease: 'power2.out',
			delay: i * 0.08,
			scrollTrigger: { trigger: el.closest('.sProblem__list') || el, start: 'top 82%', once: true },
		})
	})
	const probStat = document.querySelector('.sProblem__stat')
	if (probStat) {
		gsap.from(probStat, {
			scale: 0.85,
			opacity: 0,
			duration: 0.9,
			ease: 'back.out(1.4)',
			scrollTrigger: { trigger: probStat, start: 'top 82%', once: true },
		})
	}
	card3D('.sProblem__card', '.sProblem__cards', 0.1)
	const probQuote = document.querySelector('.sProblem__quote')
	if (probQuote) {
		gsap.from(probQuote.querySelector('.sProblem__quote-body'), {
			x: -40,
			opacity: 0,
			duration: 0.8,
			ease: 'power3.out',
			scrollTrigger: { trigger: probQuote, start: 'top 82%', once: true },
		})
		const probPhoto = probQuote.querySelector('.sProblem__quote-photo')
		if (probPhoto)
			gsap.from(probPhoto, {
				scale: 0.9,
				opacity: 0,
				duration: 1,
				ease: 'power2.out',
				scrollTrigger: { trigger: probQuote, start: 'top 82%', once: true },
			})
	}
	gsap.utils.toArray('.sProblem__closing p').forEach((el, i) => {
		gsap.from(el, {
			opacity: 0,
			y: 20,
			duration: 0.6,
			delay: i * 0.1,
			scrollTrigger: { trigger: el, start: 'top 85%', once: true },
		})
	})

	// ── sSolution ─────────────────────────────────────────────────────────────
	fadeUp('.sSolution__stream', { y: 20, duration: 0.5 })
	gsap.utils.toArray('.sSolution__x-item').forEach((el, i) => {
		gsap.from(el, {
			x: -50,
			opacity: 0,
			duration: 0.55,
			ease: 'power2.out',
			delay: i * 0.08,
			scrollTrigger: {
				trigger: el.closest('.sSolution__x-list') || el,
				start: 'top 82%',
				once: true,
			},
		})
	})
	const solRightCard = document.querySelector('.sSolution__right-card')
	if (solRightCard) {
		gsap.from(solRightCard, {
			rotateX: 22,
			y: 50,
			opacity: 0,
			transformPerspective: 900,
			transformOrigin: 'top center',
			duration: 0.9,
			ease: 'power3.out',
			scrollTrigger: { trigger: solRightCard, start: 'top 82%', once: true },
		})
	}
	const solQuote = document.querySelector('.sSolution__quote')
	if (solQuote)
		gsap.from(solQuote, {
			opacity: 0,
			y: 30,
			duration: 0.8,
			scrollTrigger: { trigger: solQuote, start: 'top 85%', once: true },
		})
	gsap.utils.toArray('.sSolution__content-row').forEach((el, i) => {
		gsap.from(el, {
			rotateX: 20,
			y: 40,
			opacity: 0,
			transformPerspective: 800,
			transformOrigin: 'top center',
			duration: 0.7,
			ease: 'power3.out',
			delay: i * 0.04,
			scrollTrigger: { trigger: el, start: 'top 85%', once: true },
		})
	})
	gsap.utils.toArray('.sSolution__slider-caption p').forEach((el, i) => {
		gsap.from(el, {
			opacity: 0,
			y: 20,
			duration: 0.6,
			delay: i * 0.1,
			scrollTrigger: { trigger: el, start: 'top 85%', once: true },
		})
	})
	const solCta = document.querySelector('.sSolution__cta')
	if (solCta)
		gsap.from(solCta, {
			opacity: 0,
			y: 40,
			duration: 0.8,
			scrollTrigger: { trigger: solCta, start: 'top 82%', once: true },
		})

	// ── sQA cta button ────────────────────────────────────────────────────────
	const qaCta = document.querySelector('.sQA__cta')
	if (qaCta)
		gsap.from(qaCta, {
			opacity: 0,
			y: 30,
			duration: 0.7,
			scrollTrigger: { trigger: qaCta, start: 'top 85%', once: true },
		})

	// ── sKotin bio & certs ────────────────────────────────────────────────────
	gsap.utils.toArray('.sKotin__bio p').forEach((el, i) => {
		gsap.from(el, {
			opacity: 0,
			x: -30,
			duration: 0.6,
			delay: i * 0.06,
			ease: 'power2.out',
			scrollTrigger: { trigger: el.closest('.sKotin__bio') || el, start: 'top 82%', once: true },
		})
	})
	card3D('.sKotin__cert', '.sKotin__certs', 0.1)

	// ── sForm ─────────────────────────────────────────────────────────────────
	const formHead = document.querySelector('.sForm__head')
	if (formHead)
		gsap.from(formHead, {
			opacity: 0,
			y: 30,
			duration: 0.7,
			scrollTrigger: { trigger: formHead, start: 'top 85%', once: true },
		})
	fadeUp('.sForm__desc', { y: 24, duration: 0.6 })
	const formWrap = document.querySelector('.form-wrap')
	if (formWrap) {
		gsap.from(formWrap, {
			rotateX: 18,
			y: 50,
			opacity: 0,
			transformPerspective: 900,
			transformOrigin: 'top center',
			duration: 0.9,
			ease: 'power3.out',
			scrollTrigger: { trigger: formWrap, start: 'top 85%', once: true },
		})
	}

	// ── Hover 3D tilt on cards ────────────────────────────────────────────────
	addHoverTilt('.sStrategy__col', 6)
	addHoverTilt('.sStrategy__step', 5)
	addHoverTilt('.sAuthor__q-card', 7)
	addHoverTilt('.sAudience__card', 7)
	addHoverTilt('.sOutcome__card', 6)
	addHoverTilt('.sClosing__card', 8)
	addHoverTilt('.sStuck__mentor-card', 6)
	addHoverTilt('.sMethods .swiper-slide', 5)
	addHoverTilt('.sProblem__card', 8)
	addHoverTilt('.sSolution__right-card', 5)
	addHoverTilt('.sKotin__cert', 7)

	// ── Subtle parallax on section backgrounds ────────────────────────────────
	;['.sStuck', '.sKotin', '.sClosing'].forEach((sel) => {
		const section = document.querySelector(sel)
		if (!section) return
		gsap.to(section, {
			backgroundPositionY: '+=40px',
			ease: 'none',
			scrollTrigger: {
				trigger: section,
				start: 'top bottom',
				end: 'bottom top',
				scrub: true,
			},
		})
	})
}

window.addEventListener('load', initAnimations)
