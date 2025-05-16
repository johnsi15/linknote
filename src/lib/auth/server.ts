import { auth, currentUser } from '@clerk/nextjs/server'

export async function getSecureUser() {
  const user = await currentUser()

  if (!user) {
    return {
      id: process.env.DEFAULT_USER_ID ?? '',
      fullName: 'Guest',
    }
  }

  return user
}

export async function getSecureSession() {
  const session = await auth()

  if (!session.userId) {
    return {
      userId: process.env.DEFAULT_USER_ID ?? '',
    }
  }

  return session
}
