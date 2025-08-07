let scrollPosition = 0

export const disableScroll = (): void => {
	scrollPosition = window.scrollY

	// для body
	document.body.style.position = 'fixed'
	document.body.style.top = `-${scrollPosition}px`
	document.body.style.width = '100%'
	document.body.style.overflow = 'hidden'

	// iOS Safari
	document.body.style.webkitOverflowScrolling = 'touch'
	document.body.style.overscrollBehavior = 'contain'
}

export const enableScroll = (): void => {
	// Восстанавливаем стили body
	document.body.style.position = ''
	document.body.style.top = ''
	document.body.style.width = ''
	document.body.style.overflow = ''
	document.body.style.webkitOverflowScrolling = ''
	document.body.style.overscrollBehavior = ''

	window.scrollTo(0, scrollPosition)
}

export const preventScroll = (element: HTMLElement): void => {
	element.addEventListener('touchmove', (e) => e.preventDefault(), {
		passive: false,
	})
	element.addEventListener('wheel', (e) => e.preventDefault(), {
		passive: false,
	})
}

export const allowScroll = (element: HTMLElement): void => {
	element.removeEventListener('touchmove', (e) => e.preventDefault())
	element.removeEventListener('wheel', (e) => e.preventDefault())
}
