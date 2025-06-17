// Demo authentication service for local development
export interface DemoUser {
  uid: string
  email: string | null
  displayName: string | null
  emailVerified: boolean
}

export interface DemoLoginCredentials {
  email: string
  password: string
}

export interface DemoRegisterCredentials {
  email: string
  password: string
  displayName: string
}

class DemoAuthService {
  private users: Map<string, { email: string; password: string; displayName: string; uid: string }> = new Map()
  private currentUser: DemoUser | null = null
  private authStateListeners: ((user: DemoUser | null) => void)[] = []

  constructor() {
    // Load users from localStorage
    const savedUsers = localStorage.getItem('demo-auth-users')
    if (savedUsers) {
      try {
        const usersArray = JSON.parse(savedUsers)
        usersArray.forEach((user: any) => {
          this.users.set(user.email.toLowerCase(), user)
        })
      } catch (error) {
        console.log('Failed to load demo users from localStorage')
      }
    }

    // Load current user from localStorage
    const savedCurrentUser = localStorage.getItem('demo-auth-current-user')
    if (savedCurrentUser) {
      try {
        this.currentUser = JSON.parse(savedCurrentUser)
      } catch (error) {
        console.log('Failed to load current user from localStorage')
      }
    }
  }

  private saveUsers() {
    const usersArray = Array.from(this.users.values())
    localStorage.setItem('demo-auth-users', JSON.stringify(usersArray))
  }

  private saveCurrentUser() {
    if (this.currentUser) {
      localStorage.setItem('demo-auth-current-user', JSON.stringify(this.currentUser))
    } else {
      localStorage.removeItem('demo-auth-current-user')
    }
  }

  private notifyAuthStateListeners() {
    this.authStateListeners.forEach(listener => listener(this.currentUser))
  }

  private generateUID(): string {
    return 'demo-' + Math.random().toString(36).substr(2, 9)
  }

  async login({ email, password }: DemoLoginCredentials): Promise<DemoUser> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.users.get(email.toLowerCase())
        if (!user) {
          reject(new Error('No account found with this email address'))
          return
        }

        if (user.password !== password) {
          reject(new Error('Incorrect password'))
          return
        }

        this.currentUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: true
        }

        this.saveCurrentUser()
        this.notifyAuthStateListeners()
        resolve(this.currentUser)
      }, 500) // Simulate network delay
    })
  }

  async register({ email, password, displayName }: DemoRegisterCredentials): Promise<DemoUser> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const emailLower = email.toLowerCase()
        
        if (this.users.has(emailLower)) {
          reject(new Error('An account with this email already exists'))
          return
        }

        if (password.length < 6) {
          reject(new Error('Password should be at least 6 characters'))
          return
        }

        const uid = this.generateUID()
        const newUser = {
          email,
          password,
          displayName,
          uid
        }

        this.users.set(emailLower, newUser)
        this.saveUsers()

        this.currentUser = {
          uid,
          email,
          displayName,
          emailVerified: true
        }

        this.saveCurrentUser()
        this.notifyAuthStateListeners()
        resolve(this.currentUser)
      }, 500) // Simulate network delay
    })
  }

  async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = null
        this.saveCurrentUser()
        this.notifyAuthStateListeners()
        resolve()
      }, 200)
    })
  }

  async resetPassword(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.users.get(email.toLowerCase())
        if (!user) {
          reject(new Error('No account found with this email address'))
          return
        }
        // In demo mode, just resolve successfully
        resolve()
      }, 500)
    })
  }

  getCurrentUser(): Promise<DemoUser | null> {
    return Promise.resolve(this.currentUser)
  }

  onAuthStateChange(callback: (user: DemoUser | null) => void): () => void {
    this.authStateListeners.push(callback)
    
    // Immediately call with current user
    setTimeout(() => callback(this.currentUser), 0)

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }
}

export const demoAuthService = new DemoAuthService() 