import AIChatInterface from 'components/ai-chat-interface'
import DraggablePopup from 'components/draggable-popup'
import ModeToggle from 'components/mode-toggle'
import { Button } from 'components/ui/button'

export default function AIStreamPage() {
	return (
		<div className='container mx-auto p-4'>
			<ModeToggle />

			<DraggablePopup
				trigger={
					<Button className='bg-gradient text-white mt-2'>AI Assistant</Button>
				}
			>
				<AIChatInterface />
			</DraggablePopup>
		</div>
	)
}
