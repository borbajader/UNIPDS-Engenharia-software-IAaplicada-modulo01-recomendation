/**
 * Vibe3p AI Recommendation Platform - Firebase Client
 * Inicializa o SDK Client do Firebase para autenticar usuários via Google Sign-In.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

let firebaseConfig: any = null;

export const auth = firebaseConfig ? getAuth(getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
export const googleAuthProvider = new GoogleAuthProvider();

