'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

import { cn } from 'utils'

import { Maximize, X } from 'lucide-react'

interface DraggablePopupProps {
	trigger: React.ReactNode
	children: React.ReactNode
}

const DraggablePopup: React.FC<DraggablePopupProps> = ({
	trigger,
	children,
}) => {
	const [isOpen, setIsOpen] = useState(false)
	const [position, setPosition] = useState({ x: 0, y: 0 })
	const dragRef = useRef<HTMLDivElement>(null)
	const [fullScreen, setFullScreen] = useState(false)
	const [isMobile, setIsMobile] = useState(false)

	const checkMobile = useCallback(() => {
		const isMobileView = window.innerWidth < 768
		setIsMobile(isMobileView)
		if (!isMobile) {
			setFullScreen(isMobileView)
		}
	}, [isMobile])

	useEffect(() => {
		checkMobile()
		window.addEventListener('resize', checkMobile)
		return () => window.removeEventListener('resize', checkMobile)
	}, [])

	const calculatePosition = useCallback(() => {
		if (isOpen && dragRef.current) {
			const { innerWidth, innerHeight } = window
			const rect = dragRef.current.getBoundingClientRect()
			setPosition({
				x: fullScreen ? 0 : (innerWidth - rect.width) / 2,
				y: fullScreen ? 0 : (innerHeight - rect.height) / 2,
			})
		}
	}, [isOpen, fullScreen])

	useEffect(() => {
		calculatePosition()
	}, [calculatePosition])

	const handleDragStart = useCallback(
		(e: React.MouseEvent | React.TouchEvent) => {
			const target = dragRef.current
			if (!target) return

			const rect = target.getBoundingClientRect()
			const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
			const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
			const offsetX = clientX - rect.left
			const offsetY = clientY - rect.top

			const handleDrag = (moveEvent: MouseEvent | TouchEvent) => {
				const { innerWidth, innerHeight } = window
				const popupWidth = rect.width
				const popupHeight = rect.height

				const moveClientX =
					'touches' in moveEvent
						? moveEvent.touches[0].clientX
						: moveEvent.clientX
				const moveClientY =
					'touches' in moveEvent
						? moveEvent.touches[0].clientY
						: moveEvent.clientY

				const newX = Math.min(
					Math.max(moveClientX - offsetX, 0),
					innerWidth - popupWidth
				)
				const newY = Math.min(
					Math.max(moveClientY - offsetY, 0),
					innerHeight - popupHeight
				)

				setPosition({ x: newX, y: newY })
			}

			const handleDragEnd = () => {
				document.removeEventListener('mousemove', handleDrag)
				document.removeEventListener('touchmove', handleDrag)
				document.removeEventListener('mouseup', handleDragEnd)
				document.removeEventListener('touchend', handleDragEnd)
			}

			document.addEventListener('mousemove', handleDrag)
			document.addEventListener('touchmove', handleDrag)
			document.addEventListener('mouseup', handleDragEnd)
			document.addEventListener('touchend', handleDragEnd)
		},
		[]
	)

	if (!isOpen) {
		return <div onClick={() => setIsOpen(true)}>{trigger}</div>
	}

	return (
		<Card
			ref={dragRef}
			style={{
				position: 'fixed',
				left: fullScreen ? '0' : `${position.x}px`,
				top: fullScreen ? '0' : `${position.y}px`,
				width: fullScreen ? '100vw' : '550px',
				height: fullScreen ? '100vh' : 'auto',
				maxWidth: fullScreen ? '100vw' : '550px',
				zIndex: 1000,
			}}
			className={cn(
				'shadow-md border border-input bg-background/70 backdrop-blur-sm rounded-2xl',
				fullScreen && 'rounded-none'
			)}
		>
			<CardHeader
				className={cn('cursor-move pt-2 pb-0 px-2', fullScreen && 'touch-none')}
				onMouseDown={handleDragStart}
				onTouchStart={handleDragStart}
			>
				<CardTitle className='flex justify-end items-center gap-2'>
					{!isMobile && (
						<Maximize
							onClick={() => setFullScreen(!fullScreen)}
							size={15}
							className='cursor-pointer text-muted-foreground hover:text-primary'
						/>
					)}

					<X
						onClick={() => setIsOpen(false)}
						size={18}
						className='cursor-pointer text-muted-foreground hover:text-primary'
					/>
				</CardTitle>
			</CardHeader>

			<CardContent
				className={cn(
					'px-3 py-2 max-w-full rounded-xl flex flex-col h-[600px] max-h-[600px]',
					fullScreen && 'h-full max-h-full max-w-[900px] m-auto'
				)}
			>
				{children}
			</CardContent>
		</Card>
	)
}

export default DraggablePopup
