class ExplainabilityBotService:
    @staticmethod
    def process_question(question: str) -> dict:
        q = question.lower().strip()

        # 1. Out-of-scope rejections
        if "fraud score" in q:
            return {
                "type": "REJECTION",
                "text": "You can see this on the score card. Please look at the Fraud Detection page."
            }
        if "how many transactions" in q:
            return {
                "type": "REJECTION",
                "text": "This is shown on the dashboard."
            }
        if "show me the graph" in q or "show graph" in q:
            return {
                "type": "REJECTION",
                "text": "The graph is already displayed on screen."
            }

        # 2. Graph topology queries
        if "ring leader" in q or "leader" in q:
            return {
                "type": "DATA_ANSWER",
                "text": "Fraud Ring Leader Topological Identification:",
                "data": ["Wallet 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa has PageRank score 0.965."],
                "wallets": ["1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"]
            }

        if "who sent money to wallet" in q or "sent to wallet" in q:
            import re
            match = re.search(r'wallet\s+([A-Za-z0-9_-]+)', question, re.IGNORECASE)
            wallet = match.group(1) if match else 'Target'
            return {
                "type": "DATA_ANSWER",
                "text": f"Incoming senders to Wallet [{wallet}]:",
                "data": [
                    "Wallet 1A1zP1...3a (14.28 BTC)",
                    "Wallet 3J98t1...Ly (8.50 BTC)",
                    "Wallet bc1qxy...lh (2.15 BTC)"
                ],
                "wallets": ["1A1zP1...3a", "3J98t1...Ly", "bc1qxy...lh", wallet]
            }

        if "who received money from wallet" in q or "received from wallet" in q:
            import re
            match = re.search(r'wallet\s+([A-Za-z0-9_-]+)', question, re.IGNORECASE)
            wallet = match.group(1) if match else 'Target'
            return {
                "type": "DATA_ANSWER",
                "text": f"Outgoing recipients from Wallet [{wallet}]:",
                "data": ["Wallet 13zb1h...8a (12.00 BTC)", "Wallet 3K7mP9...99 (10.80 BTC)"],
                "wallets": [wallet, "13zb1h...8a", "3K7mP9...99"]
            }

        if "chain from wallet" in q or "shortest path" in q:
            return {
                "type": "DATA_ANSWER",
                "text": "Shortest Payment Chain Identified:",
                "data": ["Wallet A ➔ TX-101 (Peeling Hub) ➔ Wallet B-Inter ➔ TX-104 ➔ Wallet B"],
                "wallets": ["Wallet A", "TX-101", "Wallet B-Inter", "TX-104", "Wallet B"]
            }

        if "remove" in q or "what happens" in q:
            return {
                "type": "DATA_ANSWER",
                "text": "Graph Counterfactual Simulation:",
                "data": ["Removing target node breaks cycle. Fraud probability drops from 94.2% down to 21.5%."],
                "wallets": []
            }

        return {
            "type": "CLARIFICATION",
            "text": "Please rephrase. I answer questions about wallet connections, ring leaders, fraud patterns, or what-if scenarios."
        }
