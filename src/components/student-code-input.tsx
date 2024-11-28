'use client'

import { useEffect, useState } from 'react'

import { Button } from 'ui/button'
import { Textarea } from 'ui/textarea'

const StudentCodeInput = () => {
	const [studentCode, setStudentCode] = useState<string>('')

	useEffect(() => {
		const savedCode = localStorage.getItem('studentCode')
		if (savedCode) {
			setStudentCode(savedCode)
		}
	}, [])

	const saveStudentCode = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const code = formData.get('studentCode')

		if (typeof code === 'string') {
			localStorage.setItem('studentCode', code)
			setStudentCode(code)
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setStudentCode(e.target.value)
	}

	return (
		<form onSubmit={saveStudentCode} className='w-full max-w-md space-y-4'>
			<Textarea
				name='studentCode'
				placeholder='Enter student code...'
				className='min-h-[150px] max-h-[250px]'
				aria-label='Student code'
				value={studentCode}
				onChange={handleChange}
			/>
			<Button type='submit' className='w-full' variant='outline'>
				Save student code
			</Button>
		</form>
	)
}

export default StudentCodeInput
