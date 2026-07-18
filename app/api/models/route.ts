import { CHAT_MODELS, PROVIDER_ENV_KEYS } from "@/lib/models";

export type AvailableModel = {
  id: string;
  label: string;
  available: boolean;
};

export function GET() {
  const models: AvailableModel[] = CHAT_MODELS.map((model) => ({
    id: model.id,
    label: model.label,
    available: Boolean(process.env[PROVIDER_ENV_KEYS[model.provider]]),
  }));
  return Response.json({ models });
}
