import { access } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import type { KnowledgeItem } from "./knowledge";

const root = path.resolve(import.meta.dirname, "../../..");

type Turn = { role: "user" | "assistant"; content: string };

function configuredPaths() {
  return {
    binary: process.env.LLAMA_CLI || path.join(root, "bin", "llama-cli"),
    model: process.env.MODEL_PATH || path.join(root, "model", "nalima-model.gguf"),
  };
}

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function runLocalModel(question: string, context: KnowledgeItem[], conversation: Turn[]) {
  const started = performance.now();
  const paths = configuredPaths();
  const modelAvailable = await exists(paths.binary) && await exists(paths.model);
  const contextText = context.map((item) => `[${item.title}] ${item.content}`).join("\n");
  const prompt = [
    "You are Nala, the offline agricultural intelligence assistant inside Nalima.",
    "Give careful, practical educational guidance. Do not invent pesticide or veterinary dosages.",
    "State uncertainty, ask for missing observations, and recommend qualified local help for serious cases.",
    `LOCAL AGRICULTURAL CONTEXT:\n${contextText || "No matching local context was found."}`,
    ...conversation.slice(-6).map((turn) => `${turn.role.toUpperCase()}: ${turn.content}`),
    `USER: ${question}`,
    "NALA:",
  ].join("\n\n");

  if (!modelAvailable) {
    return {
      answer: "The local GGUF model is not installed yet. Run `bash download_model.sh`, then start Nalima again. Your question was not sent to a cloud service.",
      sources: context,
      runtime: {
        mode: "LOCAL / OFFLINE",
        model: "GGUF model not installed",
        elapsed_ms: Math.round(performance.now() - started),
        tokens: 0,
        tokens_per_second: 0,
        model_available: false,
      },
    };
  }

  const args = ["-m", paths.model, "-p", prompt, "-n", "384", "--temp", "0.2", "--no-display-prompt"];
  const answer = await new Promise<string>((resolve, reject) => {
    const child = spawn(paths.binary, args, { cwd: root, shell: false, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => child.kill("SIGTERM"), 120_000);
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) reject(new Error(stderr.trim() || "llama.cpp exited with an error."));
      else resolve(stdout.trim());
    });
  });

  if (!answer) throw new Error("The local model returned an empty response.");
  const elapsed = Math.max(1, Math.round(performance.now() - started));
  const tokens = answer.split(/\s+/).length;
  return {
    answer,
    sources: context,
    runtime: {
      mode: "LOCAL / OFFLINE",
      model: path.basename(paths.model),
      elapsed_ms: elapsed,
      tokens,
      tokens_per_second: Number((tokens / (elapsed / 1000)).toFixed(1)),
      model_available: true,
    },
  };
}