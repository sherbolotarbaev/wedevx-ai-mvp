'use client'

import React from 'react'

import ThemeProvider from './theme'

interface ProvidersProps {
	children: React.ReactNode
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
	return (
		<>
			<ThemeProvider
				attribute='class'
				defaultTheme='system'
				enableSystem
				disableTransitionOnChange
			>
				{children}
			</ThemeProvider>
		</>
	)
}

export default Providers
