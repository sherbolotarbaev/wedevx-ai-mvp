'use client'

import { useEffect, useState } from 'react'

import { Button } from 'ui/button'
import { Input } from 'ui/input'

const ExerciseIdInput = () => {
	const [exerciseId, setExerciseId] = useState<string>('')

	useEffect(() => {
		const savedId = localStorage.getItem('exerciseId')
		if (savedId) {
			setExerciseId(savedId)
		}
	}, [])

	const saveExerciseId = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const id = formData.get('exerciseId')

		if (typeof id === 'string') {
			localStorage.setItem('exerciseId', id)
			setExerciseId(id)
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setExerciseId(e.target.value)
	}

	return (
		<form onSubmit={saveExerciseId} className='w-full max-w-md space-y-4'>
			<Input
				name='exerciseId'
				placeholder='Enter your exercise ID...'
				aria-label='Exercise ID'
				value={exerciseId}
				onChange={handleChange}
			/>
			<Button type='submit' className='w-full' variant='outline'>
				Save exercise ID
			</Button>
		</form>
	)
}

export default ExerciseIdInput
