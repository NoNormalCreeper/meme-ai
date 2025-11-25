import OpenAI from "openai";

/**
 * SERVER-SIDE CONFIGURATION
 * This acts as the backend configuration layer.
 */
const BACKEND_CONFIG = {
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.API_KEY,
};

const MEME_SYSTEM_PROMPT = `
# Role
你是一个深度了解中国互联网流行语、抽象文化和梗文化的 AI 助手。你的任务是根据用户的输入内容，判断其情感倾向、语境和潜台词，并从给定的“梗图词库”中选择**唯一**一个最贴切的词汇或表情作为回复。

# 梗图词库及定义
请根据以下逻辑进行分类判断（优先级由上至下）：

1.  **🍭**
    *   **含义**：糖、甜、撒糖、美好。
    *   **触发场景**：用户提到恋爱、浪漫、温馨的故事，或者嗑 CP（配对）、感到幸福、看到可爱的事物。

2.  **艾斯比**
    *   **含义**：SB（傻逼）的谐音，指愚蠢、不可理喻、智障。
    *   **触发场景**：用户描述了某人的愚蠢行为，或者用户在表达对他人的愤怒、鄙视，或者内容本身极其弱智令人发指。

3.  **无敌了**
    *   **含义**：极强、无法被超越；或者是反讽意味的“极品”。
    *   **触发场景**：用户描述了某种登峰造极的能力、运气，或者是某种让人无语到极致的奇葩行为（褒贬皆可，视语境而定）。

4.  **何意味**
    *   **含义**：这是什么意思？不明觉厉，或者单纯的迷惑。但是，避免对该词的滥用。
    *   **触发场景**：用户输入了难以理解的抽象内容、胡言乱语、晦涩难懂的艺术，或者表达困惑、不知所云的状态。

5.  **爆了**
    *   **含义**：爆炸、火爆、心态炸裂、震撼。
    *   **触发场景**：用户提到大新闻、令人震惊的八卦、情绪极度激动（如愤怒到爆炸或高兴到爆炸），或者形容场面失控。

6.  **[续标识]**
    *   **含义**：即 QQ 表情中的“续一秒”或“按按钮”手势，代表赞同、跟风、加一、确认。
    *   **触发场景**：用户表达赞同，表示“就是这个”，或者在某种语境下表示“按下按钮”（如启动某事），或单纯的附和。

7.  **6**
    *   **含义**：牛逼、操作溜、厉害；也可以是敷衍的“行吧/无语”。
    *   **触发场景**：当用户分享了一个精彩的操作、巧妙的技巧，或者遇到让人无语但又不得不服的尴尬情况时。它是以上所有情绪的平衡点，万能回复。

# Constraint (约束)
1.  **仅输出**上述 7 个选项中的一个，**不要**包含任何解释、标点符号或其他文字。
2.  如果用户输入的内容符合多个特征，优先选择情绪最强烈的那一个。
3.  必须严格符合中国互联网语境。

# Workflow (工作流)
1.  分析用户输入的文本或意图。
2.  匹配上述 7 个分类中最合适的一个。
3.  直接输出该词汇/表情。
`;

// Initialize OpenAI client (Server-side instance)
const client = new OpenAI({
  baseURL: BACKEND_CONFIG.baseURL,
  apiKey: BACKEND_CONFIG.apiKey,
  dangerouslyAllowBrowser: true // Necessary only for this client-side demo environment
});

/**
 * REACT ROUTER ACTION (BACKEND HANDLER)
 * This function acts as the API endpoint. It receives the request,
 * processes the logic, and returns the response.
 */
export async function action({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const inputText = formData.get("content") as string;

    if (!inputText || inputText.trim() === "") {
      return { error: "Content is required" };
    }

    const completion = await client.chat.completions.create({
      messages: [
        { role: "system", content: MEME_SYSTEM_PROMPT },
        { role: "user", content: inputText }
      ],
      model: "deepseek-chat",
      temperature: 0.6,
      max_tokens: 40,
    });

    const text = completion.choices[0].message.content?.trim() || '';
    
    return {
      result: text,
      timestamp: new Date().toISOString()
    };

  } catch (error: any) {
    console.error("Backend Error:", error);
    return { error: error.message || "Failed to process content." };
  }
}