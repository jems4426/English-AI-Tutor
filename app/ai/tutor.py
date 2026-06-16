from ollama import chat


def get_ai_response(conversation_history):

    response = chat(
        model='phi3:mini',
        messages=conversation_history,
        options={
            "temperature": 0.2,
            "num_predict": 100,
            "num_ctx": 512,
            "top_p": 0.9
        }
    )

    return response['message']['content']