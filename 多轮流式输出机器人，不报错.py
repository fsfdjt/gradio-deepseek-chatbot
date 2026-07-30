# Windows编码兼容
import sys
import os
from dotenv import load_dotenv
load_dotenv()
sys.stdout.reconfigure(encoding="utf-8")
os.environ["PYTHONIOENCODING"] = "utf-8"

from openai import OpenAI
import gradio as gr

# DeepSeek客户端
client = OpenAI(
    api_key="替换成你的API Key",
    base_url="https://api.deepseek.com"
)

def chat_reply(user_input, chat_history, role_setting, temperature):
    user_input = user_input.strip()
    if not user_input:
        yield chat_history
        return

    sys_prompt = role_setting.strip()
    if not sys_prompt:
        sys_prompt = "你是专业英语辅导老师，风格幽默，语法讲解精准，中英双语教学"

    messages = [{"role": "system", "content": sys_prompt}]

    for msg in chat_history:
        if isinstance(msg, dict) and msg.get("role") in ("user", "assistant"):
            content = str(msg.get("content", "")).strip()
            if content:
                messages.append({"role": msg["role"], "content": content})

    messages.append({"role": "user", "content": user_input})

    # 流式请求
    try:
        stream = client.chat.completions.create(
            model="deepseek-v4-pro",
            messages=messages,
            stream=True,
            temperature=temperature
        )
    except Exception as e:
        chat_history.append({"role": "user", "content": user_input})
        chat_history.append({"role": "assistant", "content": f"API 请求失败：{str(e)}"})
        yield chat_history
        return

    chat_history.append({"role": "user", "content": user_input})
    chat_history.append({"role": "assistant", "content": ""})

    full_response = ""
    for chunk in stream:
        if not chunk.choices:
            continue
        delta = chunk.choices[0].delta
        if not delta.content:
            continue
        full_response += delta.content
        chat_history[-1]["content"] = full_response
        yield chat_history

    if not full_response.strip():
        chat_history.pop()
        chat_history.pop()
        yield chat_history

# Gradio界面
with gr.Blocks(title="DeepSeek 多轮流式对话机器人") as demo:
    gr.Markdown("# DeepSeek 英语学习助手")
    gr.Markdown("流式输出 · Markdown 渲染 · 可上下翻看历史")
    with gr.Row():
        with gr.Column(scale=3):
            role_setting = gr.Textbox(
                label="系统角色设定",
                value="你是专业英语辅导老师，风格幽默，语法讲解精准，中英双语教学。\n\n输出要求：\n- 使用 Markdown 格式美化排版\n- 适当用 emoji 点缀，不要堆砌\n- 中英双语对照讲解\n- 用小标题（###）分隔不同内容块\n- 重点词汇用 **加粗** 标出",
                lines=2
            )
            temperature = gr.Slider(
                label="Temperature",
                minimum=0.0,
                maximum=1.5,
                value=0.7,
                step=0.1
            )
        clear_btn = gr.Button("清空全部对话历史", variant="secondary")

    chatbot = gr.Chatbot(height=500, autoscroll=False, render_markdown=True)
    user_input = gr.Textbox(label="输入问题", placeholder="输入内容发送", lines=2)
    submit_btn = gr.Button("发送消息", variant="primary")

    submit_btn.click(
        fn=chat_reply,
        inputs=[user_input, chatbot, role_setting, temperature],
        outputs=[chatbot]
    )
    user_input.submit(
        fn=chat_reply,
        inputs=[user_input, chatbot, role_setting, temperature],
        outputs=[chatbot]
    )
    clear_btn.click(lambda: [], outputs=[chatbot])

if __name__ == "__main__":
    demo.launch(server_name="127.0.0.1", server_port=7860, share=False)