import json


def apply_nexus_guardrails(user_input: str) -> bool:
    """
    Evaluates input strings for injection attacks or out-of-bounds vectors.
    Returns True if safe, False if the input triggers a violation.
    """
    injection_keywords = [
        "ignore previous instructions",
        "system prompt",
        "reveal your instructions",
        "you are now a chat bot named",
        "dan mode",
        "output raw markdown",
    ]

    financial_advice_flags = [
        "should i buy tsla",
        "give me financial advice",
        "predict bitcoin price",
        "is palantir a buy",
    ]

    normalized_input = user_input.lower()

    if any(keyword in normalized_input for keyword in injection_keywords):
        return False

    if any(flag in normalized_input for flag in financial_advice_flags):
        return False

    return True


def handle_nexus_query(user_input: str, api_callback) -> str:
    """
    Main entrypoint for processing user queries via the Nexus AI engine.
    """
    if not apply_nexus_guardrails(user_input):
        return json.dumps(
            {
                "status": "error",
                "message": "[NEXUS_SYSTEM_NOTICE]: Input out of bounds. The Nexus Context Engine only processes queries relative to James Wei's portfolio architecture, enterprise automation pipelines, or professional background.",
            }
        )

    return api_callback(user_input)
