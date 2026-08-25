export type KnowledgeItem = {
  id: string;
  title: string;
  topic: string;
  region: string;
  language: string;
  content: string;
  source: string;
  confidence: string;
};

const KNOWLEDGE: KnowledgeItem[] = [
  {
    id: "crop-health-observation",
    title: "Crop health: observe before treating",
    topic: "crop health",
    region: "General smallholder context",
    language: "en",
    content: "Record the crop and growth stage, affected plant parts, pattern across the plot, recent weather, irrigation, soil condition, and whether symptoms are spreading. Similar symptoms can have different causes, so inspect first and avoid guessing chemical treatments.",
    source: "Nalima seed knowledge set",
    confidence: "Educational seed content; verify locally",
  },
  {
    id: "crop-planning-basics",
    title: "Crop planning: match crop to constraints",
    topic: "crop planning",
    region: "Southern Africa context",
    language: "en",
    content: "Compare crop duration and temperature fit with soil drainage, available water, planting window, labour, storage, market access, and downside risk. A resilient plan can combine a primary crop with a smaller trial rather than committing all land to one uncertain option.",
    source: "Nalima seed knowledge set",
    confidence: "Educational seed content; local agronomist review recommended",
  },
  {
    id: "irrigation-checks",
    title: "Irrigation: check the root zone",
    topic: "water management",
    region: "General smallholder context",
    language: "en",
    content: "Before changing irrigation, check soil moisture below the surface, drainage, recent rainfall, plant growth stage, and signs of water stress. Water needs vary with crop, soil, weather, and canopy; avoid using a fixed schedule without observation.",
    source: "Nalima seed knowledge set",
    confidence: "Educational seed content; verify against local guidance",
  },
  {
    id: "livestock-records",
    title: "Livestock illness: information to record",
    topic: "livestock",
    region: "General smallholder context",
    language: "en",
    content: "Record species, age, number affected, onset, appetite, water intake, temperature if safely measured, breathing or movement changes, stool or discharge observations, recent feed changes, treatments already given, and deaths. Isolate where practical and contact a veterinary professional for severe or rapidly spreading illness.",
    source: "Nalima seed knowledge set",
    confidence: "Educational seed content; not a veterinary diagnosis",
  },
];

export function retrieveKnowledge(question: string): KnowledgeItem[] {
  const terms = question.toLowerCase().split(/[^a-z]+/).filter((term) => term.length > 2);
  const scored = KNOWLEDGE.map((item) => {
    const searchable = `${item.title} ${item.topic} ${item.content}`.toLowerCase();
    const score = terms.reduce((total, term) => total + (searchable.includes(term) ? 1 : 0), 0);
    return { item, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, 3).map(({ item }) => item);
}