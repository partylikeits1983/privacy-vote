import { Router } from "express";

const router = Router();

router.get("/status", (req, res) => {
  res.send("Items list");
});

export default router;
