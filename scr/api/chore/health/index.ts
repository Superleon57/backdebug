import { Router } from "express";

import * as statusServices from "src/services/status";

const router = Router();

router.get("/", async(req, res, next) => {
  try {
    const { dbHealth } = await statusServices.getStatus();

    if (dbHealth) {
      return res.status(200).json({ payload: { status: "OK" }, dbHealth });
    } else {
      return res.status(503).json({ payload: { status: "KO" } });
    }
  } catch (error) {
    return next(error);
  }
});

export default router;
