'use client'

import MDXContent from 'components/mdx-content'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import BorderBeam from 'shared/ui/border-beam'
import { Button } from 'ui/button'

import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, Extension, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { ArrowDown, ArrowUp, Loader2, RotateCcw, Stars } from 'lucide-react'

import { AnimatePresence, motion } from 'framer-motion'

import { cn } from 'utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const PreventEmptyParagraphs = Extension.create({
	name: 'preventEmptyParagraphs',

	addKeyboardShortcuts() {
		return {
			Enter: () => {
				const { state } = this.editor
				const textContent = state.doc.textContent.trim()
				const isEmpty =
					state.selection.empty && (!textContent || textContent.length < 1)

				// Prevent adding an empty paragraph
				if (isEmpty) {
					return true // Blocks the default behavior
				}

				return false // Allows the default behavior
			},
		}
	},
})

type TChatMessage = { role: 'user' | 'assistant'; content: string }

const AIChatInterface = () => {
	const [messages, setMessages] = useState<TChatMessage[]>([
		{
			role: 'assistant',
			content:
				"## Hey there 👋\nI'm your AI mentor. How can I help you?\n\nYou don't need to copy/paste your exercise requirements or code here. I'm already aware of what you are working on. Feel free to start conversation straight away.",
		},
	])

	const [isStreaming, setIsStreaming] = useState(false)
	const [isDisabled, setIsDisabled] = useState(true)
	const [isUserScrolling, setIsUserScrolling] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const chatContainerRef = useRef<HTMLDivElement>(null)

	const editor = useEditor({
		autofocus: true,
		editable: true,
		immediatelyRender: false,
		extensions: [
			StarterKit,
			Placeholder.configure({
				placeholder: 'Let the magic begin, ask a question',
			}),
			PreventEmptyParagraphs,
		],
		editorProps: {
			attributes: {
				class:
					'flex flex-col text-start overflow-y-auto max-h-[200px] min-h-[25px] w-full text-md placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
			},
		},
		onUpdate: ({ editor }) => {
			const content = editor.getText().trim()
			setIsDisabled(content.length === 0)
		},
	})

	let userMessagesCount = messages.filter(({ role }) => role === 'user').length

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const content = editor?.getText() || ''
		if (!content.trim()) return

		setIsDisabled(true)
		setIsStreaming(true)
		setError(null)

		const updatedMessages: TChatMessage[] = [
			...messages,
			{ role: 'user', content },
		]
		setMessages(updatedMessages)
		editor?.commands.setContent('')

		try {
			const res = await fetch(`${API_URL}/ai`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: updatedMessages,
				}),
			})

			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`)
			}

			const reader = res.body?.getReader()
			if (!reader) throw new Error('No reader available')

			let aiResponse = ''
			setMessages(prev => [...prev, { role: 'assistant', content: '' }])

			while (true) {
				const { done, value } = await reader.read()
				if (done) break
				const chunk = new TextDecoder().decode(value)
				aiResponse += chunk
				setMessages(prev => [
					...prev.slice(0, -1),
					{ role: 'assistant', content: aiResponse },
				])
			}
		} catch (error) {
			console.error('Error:', error)
			setError(
				'An error occurred while processing your request. Please try again.'
			)
		} finally {
			setIsStreaming(false)
		}
	}

	useEffect(() => {
		const chatContainer = chatContainerRef.current
		if (!chatContainer) return

		const handleScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } = chatContainer
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10 // 10px threshold

			setIsUserScrolling(!isAtBottom)
		}

		chatContainer.addEventListener('scroll', handleScroll)

		return () => {
			chatContainer.removeEventListener('scroll', handleScroll)
		}
	}, [])

	useEffect(() => {
		if (chatContainerRef.current && !isUserScrolling) {
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
		}
	}, [messages, isUserScrolling])

	const scrollToBottom = () => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
		}
	}

	return (
		<>
			<div
				ref={chatContainerRef}
				className='flex-grow overflow-y-auto space-y-6 rounded-2xl mb-2'
			>
				{messages.map((message, index) => (
					<ChatMessage key={index} {...message} isStreaming={isStreaming} />
				))}
			</div>

			<form
				onSubmit={handleSubmit}
				className='bg-muted/20 border border-input px-3 py-2 rounded-2xl relative'
			>
				{isUserScrolling && (
					<div className='absolute rounded-b-2xl -top-10 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none'></div>
				)}

				<AnimatePresence>
					{isUserScrolling && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 10 }}
							transition={{ duration: 0.2 }}
							className='absolute -top-14 right-[50%]'
						>
							<Button
								onClick={scrollToBottom}
								size='icon'
								variant='secondary'
								className='rounded-full shadow-lg bg-secondary/90 backdrop-blur-sm'
							>
								<ArrowDown className='size-4' />
							</Button>
						</motion.div>
					)}
				</AnimatePresence>

				<div className='flex justify-between items-center mb-2 text-xs text-muted-foreground'>
					<span>{userMessagesCount}/5</span>
					<span>Free</span>
				</div>

				<EditorContent editor={editor} />

				<style jsx global>{`
					.ProseMirror p.is-editor-empty:first-child::before {
						content: attr(data-placeholder);
						float: left;
						color: hsl(var(--muted-foreground));
						pointer-events: none;
						height: 0;
					}
				`}</style>

				<div className='flex justify-end items-center gap-2 z-50'>
					{!isDisabled && !isStreaming && (
						<Button
							type='button'
							variant='ghost'
							size='icon'
							className='rounded-full'
							onClick={() => {
								editor?.commands.clearContent()
								setIsDisabled(true)
							}}
						>
							<RotateCcw className='size-9' />
						</Button>
					)}

					<Button
						type='submit'
						size='icon'
						className='rounded-full'
						disabled={isStreaming || isDisabled || userMessagesCount === 5}
					>
						{isStreaming ? (
							<Loader2 className='size-9 animate-spin' />
						) : (
							<ArrowUp className='size-9' />
						)}
					</Button>
				</div>

				<BorderBeam size={150} duration={10} />
			</form>

			{error && (
				<p className='text-sm text-center text-red-500 mt-2'>{error}</p>
			)}

			<FYI />
		</>
	)
}

export default AIChatInterface

const ChatMessage: React.FC<
	TChatMessage & {
		isStreaming: boolean
	}
> = ({ role, content }, { isStreaming }) => {
	const isUser = role === 'user'

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className={cn(
				'flex items-start gap-2',
				isUser ? 'justify-end' : 'justify-start'
			)}
		>
			{!isUser && (
				<div className='size-7 min-w-7 rounded-full bg-gradient flex items-center justify-center'>
					<Stars className='size-4 text-white' />
				</div>
			)}

			<motion.div
				initial={isStreaming ? { opacity: 0, y: 10 } : false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className={cn(
					'max-w-[92.5%]',
					isUser && 'px-3 py-2 bg-muted/30 border border-muted rounded-2xl'
				)}
			>
				{isUser ? (
					<p className='text-md leading-relaxed break-words whitespace-pre-wrap w-full'>
						{content}
					</p>
				) : (
					<MDXContent content={content} />
				)}
			</motion.div>

			{isUser && (
				<div className='size-7 min-w-7 rounded-full overflow-hidden bg-secondary border border-input flex items-center justify-center'>
					<Image
						src='https://www.sherbolotarbaev.co/images/sher.png'
						alt='User'
						width={1000}
						height={1000}
						className='w-fit'
					/>
				</div>
			)}
		</motion.div>
	)
}

const FYI = () => (
	<p className='text-xs text-center text-muted-foreground mt-2'>
		<span className='text-gradient'>WEDEVX AI</span> may make mistakes. Please
		use with discretion.
	</p>
)
