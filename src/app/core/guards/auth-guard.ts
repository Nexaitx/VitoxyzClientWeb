import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  // Check if the user is authenticated
  if(auth.isAuthenticated()){
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const redirectIfAuthenticated: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  // Check if the user is authenticated
  if(auth.isAuthenticated()){
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
