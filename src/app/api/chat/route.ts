import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `당신은 개인 포트폴리오 웹사이트의 친절한 AI 어시스턴트입니다.
방문자가 포트폴리오 주인에 대해 알아보고, 기술과 프로젝트에 대해 질문하고, 일반적인 대화를 할 수 있도록 도와주세요.
친절하고 간결하며 전문적으로 답변하세요.

[중요 규칙]
- 반드시 한국어(한글)로만 답변하세요.
- 절대로 한자(漢字), 중국어, 일본어를 사용하지 마세요.
- 기술 용어(JavaScript, React 등)만 영어를 허용합니다.
- "프로젝트"를 "项目"으로 쓰지 마세요. 한글만 사용하세요.`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: SYSTEM_PROMPT,
    messages,
  });

  return result.toUIMessageStreamResponse();
}
