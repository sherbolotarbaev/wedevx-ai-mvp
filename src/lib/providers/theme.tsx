'use client'

import React from 'react'

import {
	ThemeProvider as NextThemesProvider,
	type ThemeProviderProps as NextThemeProviderProps,
} from 'next-themes'

interface ThemeProviderProps extends NextThemeProviderProps {
	children: React.ReactNode
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({
	children,
	...props
}) => {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export default ThemeProvider
