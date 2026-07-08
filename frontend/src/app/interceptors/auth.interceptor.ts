import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = typeof globalThis.localStorage !== 'undefined'
    ? localStorage.getItem('token')
    : null;

  // ✅ skip auth endpoints
  const isAuthRequest = req.url.includes('/api/auth');

  if (token && !isAuthRequest) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
