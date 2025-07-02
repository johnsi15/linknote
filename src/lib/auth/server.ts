import { auth, currentUser } from '@clerk/nextjs/server'

export async function getUser() {
  try {
    const user = await currentUser()

    if (!user) {
      return {
        id: process.env.DEFAULT_USER_ID ?? '',
        fullName: 'Guest',
      }
    }

    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return {
      id: 'error',
      fullName: 'Error loading user',
    }
  }
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
