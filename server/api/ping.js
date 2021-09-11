import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    return res.status(400).json({ success: false, err });
  }
});

export default router;
