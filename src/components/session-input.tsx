'use client'

import { Button } from 'ui/button'
import { Textarea } from 'ui/textarea'

import { setCookie } from 'cookies-next'

const SessionInput = () => {
	const saveCookieSession = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const session = formData.get('session')

		if (typeof session === 'string') {
			setCookie('session', encodeURIComponent(session))
		}

		window.location.reload()
	}

	return (
		<form onSubmit={saveCookieSession} className='w-full max-w-md space-y-4'>
			<Textarea
				name='session'
				placeholder='Enter your session...'
				className='min-h-[150px] max-h-[250px]'
				aria-label='Session data'
			/>
			<Button type='submit' className='w-full' variant='outline'>
				Save session
			</Button>
		</form>
	)
}

export default SessionInput
