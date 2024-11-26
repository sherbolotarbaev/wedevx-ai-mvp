'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

interface MDXContentProps {
	content: string
}

const MDXContent: React.FC<MDXContentProps> = ({ content }) => {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			rehypePlugins={[rehypeRaw]}
			className='text-md flex flex-col gap-2'
			components={{
				code({ node, inline, className, children, ...props }: any) {
					const match = /language-(\w+)/.exec(className || '')
					return !inline && match ? (
						<SyntaxHighlighter
							style={coldarkDark}
							language={match[1]}
							PreTag='div'
							className='text-sm rounded-xl'
							showLineNumbers
							{...props}
						>
							{String(children).replace(/\n$/, '')}
						</SyntaxHighlighter>
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
					<h3 className='text-lg font-medium mb-1'>{children}</h3>
				),
				p: ({ children }) => <p className='leading-relaxed'>{children}</p>,
				ul: ({ children }) => (
					<ul className='list-disc pl-6 mb-2'>{children}</ul>
				),
				ol: ({ children }) => (
					<ol className='list-decimal pl-6 mb-4'>{children}</ol>
				),
				li: ({ children }) => <li className='mb-4'>{children}</li>,
				a: ({ href, children }) => (
					<a href={href} className='text-primary hover:underline'>
						{children}
					</a>
				),
				blockquote: ({ children }) => (
					<blockquote className='border-l-4 border-primary pl-4 italic my-4'>
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
			}}
		>
			{content}
		</ReactMarkdown>
	)
}

export default MDXContent
