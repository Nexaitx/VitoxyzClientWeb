import { Routes } from '@angular/router';
import { Header } from './layouts/header/header';

export const routes: Routes = [
    {
        path: '',
        component: Header,
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
            },
            {
                path: 'book-staff',
                loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
            },
            {
                path: 'user-onboarding',
                loadComponent: () => import('./pages/user-onboarding/user-onboarding').then(m => m.UserOnboarding),
            },
            {
                path: 'user-profile',
                loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
            },
            {
                path: 'plans',
                loadComponent: () => import('./pages/plans/plans').then(m => m.Plans),
            },
            {
                path: 'meera-ai',
                loadComponent: () => import('./pages/meera-ai/meera-ai').then(m => m.MeeraAi),
            },
            {
                path: 'support',
                loadComponent: () => import('./pages/support/support').then(m => m.Support),
            },
            {
                path: 'login',
                loadComponent: () => import('./pages/login/login').then(m => m.Login),
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];