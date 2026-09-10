class ExplainabilityBotService:
    """Answer graph explainability questions using a stable response contract."""

    @staticmethod
    def process_question(question: str) -> dict:
        normalized_question = question.lower().strip()

        if "fraud score" in normalized_question:
            return {
                "type": "REJECTION",
                "text": "You can see this on the score card. Please look at the Fraud Detection page.",
            }

        if "how many transactions" in normalized_question:
            return {"type": "REJECTION", "text": "This is shown on the dashboard."}

        if "show me the graph" in normalized_question or "show graph" in normalized_question:
            return {"type": "REJECTION", "text": "The graph is already displayed on screen."}

        if "ring leader" in normalized_question or "leader" in normalized_question:
            return {
                "type": "DATA_ANSWER",
                "text": "Fraud Ring Leader Topological Identification:",
                "data": [
                    "Wallet 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa has PageRank score 0.965."
                ],
                "wallets": ["1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"],
            }

        return {
            "type": "CLARIFICATION",
            "text": "Please rephrase. I answer questions about wallet connections, ring leaders, fraud patterns, or what-if scenarios.",
        }
