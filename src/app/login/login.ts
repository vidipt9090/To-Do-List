import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  rememberMe = false;
  errorMessage = '';
  isSignUp = false; // toggle between login and signup

  async login() {
    try {
      // remember me logic
      const persistence = this.rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence;
      await setPersistence(auth, persistence);

      await signInWithEmailAndPassword(auth, this.email, this.password);
      // login successful - handled in app.ts
    } catch (error: any) {
      this.errorMessage = this.getFriendlyError(error.code);
    }
  }

  async signUp() {
    try {
      await createUserWithEmailAndPassword(auth, this.email, this.password);
      // signup successful - handled in app.ts
    } catch (error: any) {
      this.errorMessage = this.getFriendlyError(error.code);
    }
  }

  getFriendlyError(code: string): string {
    switch (code) {
      case 'auth/user-not-found': return 'No account found with this email!';
      case 'auth/wrong-password': return 'Wrong password!';
      case 'auth/invalid-email': return 'Invalid email address!';
      case 'auth/email-already-in-use': return 'Email already registered!';
      case 'auth/weak-password': return 'Password must be at least 6 characters!';
      case 'auth/invalid-credential': return 'Invalid email or password!';
      default: return 'Something went wrong. Try again!';
    }
  }

  toggleMode() {
    this.isSignUp = !this.isSignUp;
    this.errorMessage = '';
  }
}
