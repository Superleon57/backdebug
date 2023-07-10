import { Router } from 'express';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    return res.json({ payload: { status: 'ok' } }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
