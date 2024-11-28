'use server'

import { unstable_noStore as noStore } from 'next/cache'
import { cookies, headers as requestHeaders } from 'next/headers'
import { userAgent as getUserAgent } from 'next/server'

export async function getMe(): Promise<
	| {
			user: User
	  }
	| undefined
> {
	const session = cookies().get('session')?.value
	if (!session) return

	noStore()

	const { os, device } = getUserAgent({ headers: requestHeaders() })
	const userAgent = `${os.name} ${os.version} (${device.vendor}, ${device.model})`

	try {
		const headers = new Headers(requestHeaders())
		headers.set('user-agent', userAgent)
		headers.set('authorization', `${encodeURIComponent(session)}`)
		headers.set('origin', 'http://localhost:3000')

		const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/me`, {
			method: 'GET',
			headers,
			credentials: 'include',
		})
		if (!response.ok) return
		const me = await response.json()
		return me
	} catch (error) {
		return
	}
}
