import { Router } from 'express';

import {
  changePassword,
  completeOnboarding,
  forgotPassword,
  getOnboarding,
  listSessions,
  login,
  logout,
  logoutAll,
  me,
  patchOnboarding,
  refresh,
  register,
  requireAuth,
  resendVerification,
  resetPassword,
  updateMe,
  verifyEmail,
} from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
authRouter.post('/logout-all', requireAuth, logoutAll);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/verify-email', verifyEmail);
authRouter.post('/resend-verification', requireAuth, resendVerification);

authRouter.get('/me', requireAuth, me);
authRouter.patch('/me', requireAuth, updateMe);
authRouter.patch('/me/password', requireAuth, changePassword);
authRouter.get('/me/sessions', requireAuth, listSessions);

export const onboardingRouter = Router();
onboardingRouter.use(requireAuth);
onboardingRouter.get('/', getOnboarding);
onboardingRouter.patch('/', patchOnboarding);
onboardingRouter.post('/complete', completeOnboarding);
