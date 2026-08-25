import { Router, type IRouter } from "express";
import { ChatWithNalaBody, ChatWithNalaResponse, ListKnowledgeResponse } from "@workspace/api-zod";
import { retrieveKnowledge } from "../lib/knowledge";
import { runLocalModel } from "../lib/model-runner";

const router: IRouter = Router();

router.get("/knowledge", (_req, res) => {
  res.json(ListKnowledgeResponse.parse(retrieveKnowledge("")));
});

router.post("/chat", async (req, res) => {
  const parsed = ChatWithNalaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please provide a question between 1 and 4000 characters." });
    return;
  }

  const context = retrieveKnowledge(parsed.data.question);
  try {
    const result = await runLocalModel(parsed.data.question, context, parsed.data.conversation ?? []);
    res.json(ChatWithNalaResponse.parse(result));
  } catch (error) {
    req.log.error({ err: error }, "Local model request failed");
    res.status(503).json({ error: error instanceof Error ? error.message : "Local model unavailable." });
  }
});

export default router;