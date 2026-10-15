import { Router } from "express";

const chatRouter = Router();

chatRouter.get("/conversations");
chatRouter.get("/conversations/:id/messages");

export default chatRouter;
