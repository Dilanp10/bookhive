import express from 'express';
import { register, login, getMe} from '../controllers/auth.controller.js';
import { verifyToken as auth } from '../middlewares/auth.middleware.js';


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);

export default router;