'use client'

import MDXContent from 'components/mdx-content'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Button } from 'ui/button'

import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, Extension, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { ArrowUp, Loader2, RotateCcw, Stars } from 'lucide-react'

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
	})

	let userMessagesCount = messages.filter(({ role }) => role === 'user').length

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const content = editor?.getText() || ''
		if (!content.trim()) return

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
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
		}
	}, [messages])

	return (
		<>
			<div
				ref={chatContainerRef}
				className='flex-grow overflow-y-auto space-y-4 rounded-xl mb-4'
			>
				{messages.map((message, index) => (
					<div
						key={index}
						className={cn(
							'flex items-start gap-2',
							message.role === 'user' ? 'justify-end' : 'justify-start'
						)}
					>
						{message.role === 'assistant' && (
							<div
								className={cn(
									'size-7 min-w-7 rounded-full bg-gradient flex items-center justify-center',
									isStreaming && 'gradient-animate'
								)}
							>
								<Stars className='size-4 text-white' />
							</div>
						)}
						<div
							className={cn(
								'rounded-xl text-wrap max-w-[92.5%]',
								message.role === 'user' &&
									'px-3 py-2 bg-muted/30 border border-muted'
							)}
						>
							<MDXContent content={message.content} />
						</div>
						{message.role === 'user' && (
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
					</div>
				))}
			</div>

			<form onSubmit={handleSubmit} className='bg-muted px-3 py-2 rounded-xl'>
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

				<div className='flex justify-end items-center gap-2'>
					<Button
						type='button'
						size='icon'
						variant='ghost'
						className='bg-primary-foreground hover:bg-primary-foreground/50'
						onClick={() => editor?.commands.clearContent()}
					>
						<RotateCcw className='size-4' />
					</Button>

					<Button
						type='submit'
						size='icon'
						disabled={isStreaming || userMessagesCount === 5}
					>
						{isStreaming ? (
							<Loader2 className='size-4 animate-spin' />
						) : (
							<ArrowUp className='size-4' />
						)}
					</Button>
				</div>
			</form>

			{error && (
				<p className='text-sm text-center text-red-500 mt-2'>{error}</p>
			)}
			<p className='text-xs text-center text-muted-foreground mt-2'>
				<span className='text-gradient'>WEDEVX AI</span> may make mistakes.
				Please use with discretion.
			</p>
		</>
	)
}

export default AIChatInterface
