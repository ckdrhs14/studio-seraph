import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";

// CJK Unified Ideographs, Extension A/B, Compatibility, Hiragana, Katakana
const CJK_REGEX =
    /[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u{20000}-\u{2A6DF}\u{2A700}-\u{2B73F}]/gu;

function stripCJK(text: string): string {
    return text.replace(CJK_REGEX, "");
}

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY
});

const SYSTEM_PROMPT = `당신은 "스튜디오 서랍(Studio Seraph)" 포트폴리오 웹사이트의 AI 어시스턴트입니다.
방문자의 질문에 아래 정보를 바탕으로 친절하고 간결하게 답변하세요.

[기본 정보]
- 스튜디오명: 스튜디오 서랍 (Studio Seraph)
- 슬로건: "아름다움을 더하다, 잊혀지지 않는 추억을 서랍에 담다"
- 소개: 26주년 전통의 부띠끄 베이비 전문 스튜디오. 모던하고 깔끔한 사진을 추구하며, 심플함과 디테일을 최우선으로 합니다.
- 철학: 닮은 듯 다른 우리 가족, 가장 행복한 기록을 남겨 힘들 때마다 꺼내보며, 순간을 기억하고 영원히 잊지 않을 추억을 만듭니다.

[연락처]
- 전화: 031-963-5789 / 031-965-5788
- 이메일: ilsanmiga5788@naver.com
- 카카오톡: http://pf.kakao.com/_YIxhCC
- 인스타그램: @studio__seraph (언더바 2개)
- 네이버 카페: seurapst
- 웹사이트: https://srstudio.co.kr

[위치 및 오시는길]
- 주소: 경기도 고양시 일산동구 위시티로 24, 5F/6F
- 위치 설명: 일산 동국대병원 사거리에 위치, 위시티로 입구 내고양마트 맞은편 건물
- 5층: 아기 사진 촬영 전용
- 6층: 가족, 만삭, 대가족, 반려동물, 증명, 여권사진 촬영
- 주차: 가능

[영업시간]
- 월요일, 화요일: 휴무
- 수~금요일: 09:30 ~ 18:30
- 토, 일요일: 09:30 ~ 19:00

[촬영 서비스]
1. 만삭 촬영 (Pregnancy)
   - 촬영 시기: 보통 28주 전후
   - 헤어와 메이크업은 자연스럽게 하는 것을 권장
   - 원하는 컨셉이 있으면 스튜디오와 상의 가능
   - 9가지 컨셉 제공

2. 아기 촬영 (Baby)
   - 신생아(New Born): 태어난 후 30일 전에 촬영. 태반에 싸여있는 모습을 아트적으로 형상화
   - 50일: 수정 후 1년 기념 촬영. 촬영 시기는 50~65일 사이
   - 100일: 촬영 시기는 120일 전후. 낯가리기 전이 좋으며 예방접종 시기와 겹치지 않는 것이 좋음
   - 돌(300일): 아기가 무언가를 짚고 설 수 있는 10~11개월에 촬영. 낮잠 시간 파악 후 일정 잡기 권장. 선호하는 장난감/간식 준비
   - 스페셜 컨셉
   - 주니어

3. 가족 촬영 (Family)
   - 의상은 가족별로 맞춰 입기 권장
   - 어르신들은 티셔츠 피하고, 심플하면서 단정하게 준비
   - 대가족 촬영도 가능

4. 반려동물 촬영 (Pet Family)
   - 소중한 반려동물의 사랑스러운 순간을 따뜻한 사진으로 기록
   - 평소 좋아하는 간식이나 애착 장난감 준비 권장
   - 보호자와 컬러 톤 맞춘 소품 준비하면 좋음

5. 기타: 증명사진, 여권사진

[촬영 프로세스]
1. 예약: 평일은 2주 전, 주말은 3주 전까지 예약
2. 촬영: 1시간 기준 (대부분 30분 소요)
3. 셀렉: 촬영 후 2주 이내에 앨범/액자 사진 선택
4. 앨범: 셀렉 후 약 6주 소요

[예약 및 요금]
- 예약 방법: 방문, 전화, 카카오톡
- 예약금: 10만원 (신한은행 100-036-037140 김도헌)
- 예약 변경: 최소 10일 전 신청
- 취소 정책: 당일 취소 및 변경 시 예약금 환불 불가
- 가족/형제자매 추가 촬영: 기본 20만원 추가
- 구체적인 패키지 가격은 전화 또는 카카오톡으로 문의

[저작권]
촬영된 사진과 저작물의 저작권 및 원판은 스튜디오 서랍에 속하며, 명시적 동의 없이 무단 복제/배포 불가.

[중요 규칙 - 반드시 지켜야 합니다]
- 반드시 한국어(한글)로만 답변하세요. 이것은 가장 중요한 규칙입니다.
- 한국어를 제외한 언어는 절대 사용하지 마세요. (영어는 가능합니다.)
- 한자(漢字)를 절대 사용하지 마세요. 예: 項目, 技術, 經驗, 時間, 家族, 寫眞 같은 글자를 절대 쓰지 마세요.
- 중국어 간체(简体)도 절대 사용하지 마세요. 예: 项目, 技术, 经验 같은 글자를 절대 쓰지 마세요.
- 일본어(ひらがな, カタカナ, 漢字)도 절대 사용하지 마세요.
- 오직 한글(ㄱ~ㅎ, ㅏ~ㅣ, 가~힣)과 숫자, 영문 기술용어만 사용하세요.
- 답변을 작성한 후, 한글과 영문/숫자가 아닌 문자가 있는지 스스로 검토하고, 있으면 한글로 바꾸세요.
- 모르는 내용은 추측하지 말고, 전화(031-963-5789) 또는 카카오톡으로 문의를 안내하세요.
- 가격에 대해 질문받으면, 구체적인 가격은 전화 또는 카카오톡으로 문의해달라고 안내하세요.`;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = await streamText({
        model: groq("llama-3.3-70b-versatile"),
        system: SYSTEM_PROMPT,
        messages
    });

    // Build SSE stream with CJK characters filtered out
    const encoder = new TextEncoder();
    const textStream = result.textStream;

    const sseStream = new ReadableStream({
        async start(controller) {
            let id = "msg-" + Date.now();
            // Send message start
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "text-start", id })}\n\n`)
            );
            for await (const chunk of textStream) {
                const cleaned = stripCJK(chunk);
                if (cleaned) {
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ type: "text-delta", delta: cleaned })}\n\n`
                        )
                    );
                }
            }
            // Send finish
            controller.enqueue(
                encoder.encode(
                    `data: ${JSON.stringify({ type: "finish", finishReason: "stop" })}\n\n`
                )
            );
            controller.close();
        }
    });

    return new Response(sseStream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive"
        }
    });
}
