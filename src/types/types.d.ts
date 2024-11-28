type User = {
	id: number
	firstName: string
	lastName: string
	role: UserRole
	email: string
	password: string
	phone?: string
	photo?: string
	stripeCustomerId: string
	organizationId?: number
	isActive: boolean
	isPhoneVerified: boolean
	preferences?: Prisma.JsonValue | null
	createdAt: Date
	updatedAt: Date
	metaData: IUserMetaData
}
