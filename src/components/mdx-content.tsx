'use client'

import React, { useMemo, useState } from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark as codeTheme } from 'react-syntax-highlighter/dist/esm/styles/prism'

import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import { Check, Copy } from 'lucide-react'

interface MDXContentProps {
	content: string
}

const MDXContent: React.FC<MDXContentProps> = ({ content }) => {
	const [copiedCode, setCopiedCode] = useState<string | null>(null)

	const copyToClipboard = useMemo(() => {
		return (code: string) => {
			navigator.clipboard.writeText(code)
			setCopiedCode(code)
			setTimeout(() => setCopiedCode(null), 2000)
		}
	}, [])

	const components: Partial<Components> = useMemo(
		() => ({
			code({ node, inline, className, children, ...props }: any) {
				const match = /language-(\w+)/.exec(className || '')
				const language = match ? match[1] : 'text'
				const code = String(children).replace(/\n$/, '')
				return !inline && match ? (
					<div className='relative'>
						<div className='flex justify-between items-center bg-muted/20 border-t border-l border-r border-input px-4 py-2 rounded-t-2xl'>
							<span className='text-sm font-medium text-muted-foreground'>
								{language}
							</span>
							<button
								onClick={() => copyToClipboard(code)}
								className='text-muted-foreground hover:text-foreground transition-colors'
								aria-label='Copy code'
							>
								{copiedCode === code ? (
									<Check className='w-4 h-4' />
								) : (
									<Copy className='w-4 h-4' />
								)}
							</button>
						</div>
						<SyntaxHighlighter
							style={codeTheme}
							language={language}
							PreTag='pre'
							showLineNumbers
							codeTagProps={{
								style: {
									fontSize: '0.875rem',
									lineHeight: '1.25rem',
								},
							}}
							lineNumberStyle={{
								minWidth: '2em',
								paddingRight: '1em',
								fontSize: '0.875rem',
								lineHeight: '1.25rem',
							}}
							customStyle={{
								margin: 0,
								width: 'auto',
								minWidth: '100%',
								maxWidth: '200px',
								borderTopLeftRadius: 0,
								borderTopRightRadius: 0,
								borderBottomLeftRadius: '1rem',
								borderBottomRightRadius: '1rem',
								fontSize: '0.875rem',
								lineHeight: '1.25rem',
							}}
							{...props}
						>
							{code}
						</SyntaxHighlighter>
					</div>
				) : (
					<code
						className={`${className} bg-muted px-1 font-semibold py-0.5 rounded text-sm`}
						{...props}
					>
						{children}
					</code>
				)
			},
			h1: ({ children }) => (
				<h1 className='text-2xl font-bold mb-3'>{children}</h1>
			),
			h2: ({ children }) => (
				<h2 className='text-xl font-semibold mb-2'>{children}</h2>
			),
			h3: ({ children }) => (
				<h3 className='text-lg font-medium mb-2'>{children}</h3>
			),
			p: ({ children }) => (
				<p className='leading-relaxed mb-2 break-words whitespace-pre-wrap w-full'>
					{children}
				</p>
			),
			ul: ({ children }) => <ul className='list-disc pl-6 mb-2'>{children}</ul>,
			ol: ({ children }) => (
				<ol className='list-decimal pl-6 mb-3'>{children}</ol>
			),
			li: ({ children }) => <li className='mb-3'>{children}</li>,
			a: ({ href, children }) => (
				<a href={href} className='text-primary hover:underline'>
					{children}
				</a>
			),
			blockquote: ({ children }) => (
				<blockquote className='border-l-4 border-muted rounded-sm pl-4 italic my-4'>
					{children}
				</blockquote>
			),
			img: ({ src, alt }) => (
				<img
					src={src}
					alt={alt}
					className='max-w-full h-auto rounded-xl my-4'
				/>
			),
			table: ({ children }) => (
				<div className='overflow-x-auto my-4'>
					<table className='w-full border-collapse border border-border'>
						{children}
					</table>
				</div>
			),
			th: ({ children }) => (
				<th className='border border-border bg-muted p-2 text-left font-semibold'>
					{children}
				</th>
			),
			td: ({ children }) => (
				<td className='border border-border p-2'>{children}</td>
			),
		}),
		[copyToClipboard, copiedCode]
	)

	const remarkPlugins = useMemo(() => [remarkGfm], [])
	const rehypePlugins = useMemo(() => [rehypeRaw], [])

	return (
		<ReactMarkdown
			remarkPlugins={remarkPlugins}
			rehypePlugins={rehypePlugins}
			className='text-md flex flex-col gap-3'
			components={components}
		>
			{content}
		</ReactMarkdown>
	)
}

export default MDXContent
