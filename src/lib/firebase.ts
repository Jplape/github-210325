// Mock Firebase implementation with specific credentials
const ADMIN_EMAIL = 'admin@esttmco.com';
const ADMIN_PASSWORD = 'admin';

interface MockUser {
  email: string;
  id: string;
}

class MockAuth {
  private currentUser: MockUser | null = null;

  async signInWithEmailAndPassword(email: string, password: string): Promise<MockUser> {
    return new Promise((resolve, reject) => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const user = { email: ADMIN_EMAIL, id: '1' };
        this.currentUser = user;
        resolve(user);
      } else {
        reject(new Error('Email ou mot de passe incorrect'));
      }
    });
  }

  onAuthStateChanged(callback: (user: MockUser | null) => void): () => void {
    callback(this.currentUser);
    return () => {};
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    return Promise.resolve();
  }

  getCurrentUser(): MockUser | null {
    return this.currentUser;
  }
}

export const auth = new MockAuth();