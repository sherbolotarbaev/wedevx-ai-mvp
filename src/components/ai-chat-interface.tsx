'use client'

import MDXContent from 'components/mdx-content'
import { useCallback, useEffect, useRef, useState } from 'react'
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

interface AIChatInterfaceProps {
	me:
		| {
				user: User
		  }
		| undefined
	session: string
}

const AIChatInterface: React.FC<AIChatInterfaceProps> = ({ me, session }) => {
	const [messages, setMessages] = useState<TChatMessage[]>([
		{
			role: 'assistant',
			content:
				`## Hey ${me?.user.firstName || 'there'} 👋\n` +
				"_I'm your AI mentor. How can I help you?_\n" +
				'\n' +
				"_You don't need to copy/paste your exercise requirements or code here. I'm already aware of what you are working on. Feel free to start conversation straight away._",
		},
	])

	const [isLoading, setIsLoading] = useState(false)
	const [isStreaming, setIsStreaming] = useState(false)
	const [isDisabled, setIsDisabled] = useState(true)
	const [isUserScrolling, setIsUserScrolling] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const parentRef = useRef<HTMLDivElement>(null)

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

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault()
			const content = editor?.getText() || ''
			if (!content.trim()) return

			const exerciseId = localStorage.getItem('exerciseId')
			if (!exerciseId) return

			const studentCode = localStorage.getItem('studentCode')
			if (!studentCode) return

			setIsDisabled(true)
			setIsLoading(true)
			setError(null)

			const updatedMessages: TChatMessage[] = [
				...messages,
				{ role: 'user', content },
			]
			setMessages(updatedMessages)
			editor?.commands.setContent('')

			try {
				const res = await fetch(`${API_URL}/ai/${exerciseId}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: session as string,
					},
					body: JSON.stringify({
						studentCode,
						messages: updatedMessages,
					}),
				})

				if (!res.ok) {
					throw {
						error: res.statusText,
						statusCode: res.status,
					}
				}

				const reader = res.body?.getReader()
				if (!reader) throw new Error('No reader available')

				setIsLoading(false)
				setIsStreaming(true)

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
			} catch (error: any) {
				console.error('ERROR:', error)
				if (error.statusCode === 401) {
					setError(
						'Unauthorized. Please ensure that your session is saved in the cookies and try again.'
					)
				} else
					setError(
						`An error occurred while processing your request. Please try again. Error code: ${error.statusCode}.`
					)
			} finally {
				setIsStreaming(false)
				setIsLoading(false)
			}
		},
		[messages, editor]
	)

	useEffect(() => {
		const parentContainer = parentRef.current
		if (!parentContainer) return

		const handleScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } = parentContainer
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10 // 10px threshold

			setIsUserScrolling(!isAtBottom)
		}

		parentContainer.addEventListener('scroll', handleScroll)

		return () => {
			parentContainer.removeEventListener('scroll', handleScroll)
		}
	}, [])

	useEffect(() => {
		if (parentRef.current && !isUserScrolling) {
			parentRef.current.scrollTop = parentRef.current.scrollHeight
		}
	}, [messages, isUserScrolling])

	const scrollToBottom = useCallback(() => {
		if (parentRef.current) {
			parentRef.current.scrollTop = parentRef.current.scrollHeight
		}
	}, [])

	return (
		<>
			<div
				ref={parentRef}
				className='flex-grow overflow-y-auto space-y-6 rounded-2xl mb-2'
			>
				{messages.map((message, index) => (
					<ChatMessage key={index} {...message} isStreaming={isStreaming} />
				))}
				{isLoading && (
					<div className='flex items-center gap-2'>
						<div className='size-7 min-w-7 rounded-full bg-gradient gradient-animate flex items-center justify-center'>
							<Stars className='size-4 text-white' />
						</div>

						<p className='text-gradient gradient-animate animate-pulse'>
							is thinking...
						</p>
					</div>
				)}
			</div>

			{error && (
				<p className='text-sm text-center text-red-500 my-4'>{error}</p>
			)}

			<form
				onSubmit={handleSubmit}
				className='bg-muted/20 border border-input px-3 py-2 rounded-2xl relative'
			>
				{isUserScrolling && (
					<div className='absolute rounded-b-2xl -top-10 left-0 right-0 h-8 bg-gradient-to-t from-background/90 to-transparent pointer-events-none'></div>
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
						{isLoading || isStreaming ? (
							<Loader2 className='size-9 animate-spin' />
						) : (
							<ArrowUp className='size-9' />
						)}
					</Button>
				</div>

				<BorderBeam size={150} duration={10} />
			</form>

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

			{/* {isUser && (
				<div className='size-7 min-w-7 rounded-full overflow-hidden bg-secondary border border-input flex items-center justify-center'>
					<Image
						src='https://www.sherbolotarbaev.co/images/sher.png'
						alt='User'
						width={1000}
						height={1000}
						className='w-fit'
					/>
				</div>
			)} */}
		</motion.div>
	)
}

const FYI = () => (
	<p className='text-xs text-center text-muted-foreground mt-2'>
		<span className='text-gradient'>WEDEVX AI</span> may make mistakes. Please
		use with discretion.
	</p>
)
