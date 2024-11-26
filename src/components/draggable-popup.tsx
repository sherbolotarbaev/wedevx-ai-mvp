'use client'

import { X } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

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

	useEffect(() => {
		if (isOpen && dragRef.current) {
			const { innerWidth, innerHeight } = window
			const rect = dragRef.current.getBoundingClientRect()
			setPosition({
				x: (innerWidth - rect.width) / 2,
				y: (innerHeight - rect.height) / 2,
			})
		}
	}, [isOpen])

	const handleDragStart = useCallback((e: React.MouseEvent) => {
		const target = dragRef.current
		if (!target) return

		const rect = target.getBoundingClientRect()
		const offsetX = e.clientX - rect.left
		const offsetY = e.clientY - rect.top

		const handleDrag = (moveEvent: MouseEvent) => {
			const { innerWidth, innerHeight } = window
			const popupWidth = rect.width
			const popupHeight = rect.height

			const newX = Math.min(
				Math.max(moveEvent.clientX - offsetX, 0),
				innerWidth - popupWidth
			)
			const newY = Math.min(
				Math.max(moveEvent.clientY - offsetY, 0),
				innerHeight - popupHeight
			)

			setPosition({ x: newX, y: newY })
		}

		const handleDragEnd = () => {
			document.removeEventListener('mousemove', handleDrag)
			document.removeEventListener('mouseup', handleDragEnd)
		}

		document.addEventListener('mousemove', handleDrag)
		document.addEventListener('mouseup', handleDragEnd)
	}, [])

	if (!isOpen) {
		return <div onClick={() => setIsOpen(true)}>{trigger}</div>
	}

	return (
		<Card
			ref={dragRef}
			style={{
				position: 'fixed',
				left: `${position.x}px`,
				top: `${position.y}px`,
				width: '550px',
				maxWidth: '550px',
				zIndex: 1000,
			}}
			className='shadow-md border border-input bg-primary-foreground/50 backdrop-blur-sm rounded-xl'
		>
			<CardHeader
				className='cursor-move pt-2 pb-0 px-2'
				onMouseDown={handleDragStart}
			>
				<CardTitle className='flex justify-end items-center'>
					<X
						onClick={() => setIsOpen(false)}
						size={18}
						className='cursor-pointer'
					/>
				</CardTitle>
			</CardHeader>

			<CardContent className='px-3 py-2 max-w-full h-[600px] max-h-[600px] overflow-y-auto flex flex-col'>
				{children}
			</CardContent>
		</Card>
	)
}

export default DraggablePopup
