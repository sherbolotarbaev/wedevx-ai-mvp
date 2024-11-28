import { cookies } from 'next/headers'

import AIChatInterface from 'components/ai-chat-interface'
import DraggablePopup from 'components/draggable-popup'
import ExerciseIdInput from 'components/exercise-ID-input'
import ModeToggle from 'components/mode-toggle'
import SessionInput from 'components/session-input'
import StudentCodeInput from 'components/student-code-input'
import { Button } from 'ui/button'

import { getMe } from 'lib/ssr'

export default async function AIStreamPage() {
	const me = await getMe()
	const session = cookies().get('session')?.value || ''

	return (
		<div className='container mx-auto p-4 flex flex-col gap-7'>
			<h2 className='font-semibold italic text-primary/80'>
				WEDEVX AI ASSISTANT MVP VERSION
			</h2>

			<div className='flex flex-col gap-2'>
				<p className='text-md text-muted-foreground'>Mode:</p>

				<ModeToggle />

				{!me && (
					<>
						<p className='text-md text-muted-foreground'>Session:</p>

						<SessionInput />
					</>
				)}

				<p className='text-md text-muted-foreground'>Exercise ID:</p>

				<ExerciseIdInput />

				<p className='text-md text-muted-foreground'>Student Code:</p>

				<StudentCodeInput />
			</div>

			<DraggablePopup
				trigger={
					<Button className='bg-gradient text-white mt-2'>AI Assistant</Button>
				}
			>
				<AIChatInterface me={me} session={session} />
			</DraggablePopup>
		</div>
	)
}
