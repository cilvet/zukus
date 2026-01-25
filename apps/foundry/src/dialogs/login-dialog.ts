import { signIn, signOut, getAuthState, onAuthStateChange } from '../supabase/auth'

/**
 * Open login dialog for Zukus authentication
 */
export async function openLoginDialog(): Promise<void> {
  const content = `
    <div class="zukus-login-dialog">
      <p>Sign in with your Zukus account to sync characters.</p>
      <form class="login-form">
        <div class="form-group">
          <label for="zukus-email">Email</label>
          <input type="email" id="zukus-email" name="email" required autocomplete="email" />
        </div>
        <div class="form-group">
          <label for="zukus-password">Password</label>
          <input type="password" id="zukus-password" name="password" required autocomplete="current-password" />
        </div>
        <p class="login-error" style="color: red; display: none;"></p>
      </form>
    </div>
  `

  const dialog = new Dialog({
    title: 'Login to Zukus',
    content,
    buttons: {
      login: {
        icon: '<i class="fas fa-sign-in-alt"></i>',
        label: 'Login',
        callback: async (html: JQuery) => {
          const email = (html.find('#zukus-email').val() as string || '').trim()
          const password = (html.find('#zukus-password').val() as string || '')

          if (!email || !password) {
            ui.notifications?.warn('Please enter email and password')
            return
          }

          try {
            await signIn(email, password)
            ui.notifications?.info('Successfully logged in to Zukus!')
          } catch (error) {
            const message = (error as Error).message || 'Login failed'
            ui.notifications?.error(`Login failed: ${message}`)
          }
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: 'Cancel',
      },
    },
    default: 'login',
  }, {
    width: 350,
    classes: ['zukus-login-dialog-window'],
  })

  dialog.render(true)
}

/**
 * Log out from Zukus
 */
export async function logoutFromZukus(): Promise<void> {
  try {
    await signOut()
    ui.notifications?.info('Logged out from Zukus')
  } catch (error) {
    const message = (error as Error).message || 'Logout failed'
    ui.notifications?.error(`Logout failed: ${message}`)
  }
}

/**
 * Check if user is currently logged in
 */
export function isUserLoggedIn(): boolean {
  return getAuthState().session !== null
}

/**
 * Get current user email
 */
export function getCurrentUserEmail(): string | null {
  return getAuthState().user?.email ?? null
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuthChanges(callback: (isLoggedIn: boolean, email: string | null) => void): () => void {
  return onAuthStateChange((state) => {
    callback(state.session !== null, state.user?.email ?? null)
  })
}
