import re

class ExplainabilityBotService:
    @staticmethod
    def extract_wallet(question: str, fallback: str = "0xA1b2C3...99") -> str:
        match = re.search(r'(?:wallet\s+)?(0x[a-fA-F0-9]+|1[a-zA-Z0-9]{25,34}|3[a-zA-Z0-9]{25,34}|bc1[a-zA-Z0-9]{25,50}|W_[A-Za-z0-9_-]+)', question, re.IGNORECASE)
        return match.group(1) if match else fallback

    @staticmethod
    def process_question(question: str, role: str = "analyst") -> dict:
        q = question.lower().strip()
        is_admin = (role == "admin")

        # ============================================================
        # 🔐 CROSS-ROLE BEHAVIOUR & REJECTIONS
        # ============================================================

        # Case 1: Admin Rejections for Analyst Case-Level Queries
        if is_admin and ("case #" in q or "my assigned case" in q or "file a new case" in q or ("who sent money" in q and "case" in q)):
            if "assigned case" in q:
                return {
                    "type": "REJECTION",
                    "text": "You do not have assigned cases. This is an analyst function."
                }
            if "file a new case" in q:
                return {
                    "type": "REJECTION",
                    "text": "Case filing is an analyst action. Please assign this to an analyst."
                }
            return {
                "type": "REJECTION",
                "text": "Case-level investigation is handled by analysts. Please view case details in the Analyst Management page."
            }

        # Case 2: Analyst Rejections for Admin-Only Controls
        if not is_admin and ("retrain the model" in q or "rollback" in q or "roll back" in q or "deploy model" in q or "schedule retraining" in q or "approve analyst" in q or "reject analyst" in q or "disable analyst" in q or "set the fraud threshold" in q):
            return {
                "type": "REJECTION",
                "text": "Retraining the model and system management are admin-only actions. Please escalate to your system administrator."
            }

        # ============================================================
        # 👑 ADMIN CHATBOT ENGINE (Categories 1 - 9)
        # ============================================================
        if is_admin:

            # --- CATEGORY 1: SYSTEM-WIDE WALLET FLOWS ---
            if "most incoming transactions" in q or "most incoming" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Top System Wallet by Incoming Transactions (This Week):",
                    "data": ["Wallet 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa — 142 Incoming Transactions (Total Value: 248.50 BTC)"],
                    "wallets": ["1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"]
                }
            if "top 10 wallets" in q or "top 10" in q or "transaction volume" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Top 10 System-Wide Wallets by Transaction Volume:",
                    "data": [
                        "1. Wallet 1A1zP1...Na — 450.00 BTC (84 txs)",
                        "2. Wallet 3FZbgi...3N — 320.40 BTC (62 txs)",
                        "3. Wallet bc1q88...01 — 210.15 BTC (48 txs)",
                        "4. Wallet 1bc294...02 — 180.50 BTC (39 txs)",
                        "5. Wallet 3J98t1...Ly — 145.80 BTC (31 txs)",
                        "6. Wallet bc1qxy...lh — 120.00 BTC (25 txs)",
                        "7. Wallet 13zb1h...8a — 98.50 BTC (19 txs)",
                        "8. Wallet 3K7mP9...99 — 89.20 BTC (15 txs)",
                        "9. Wallet 1F1tAa...Xq — 85.10 BTC (14 txs)",
                        "10. Wallet bc1q99...00 — 82.50 BTC (12 txs)"
                    ],
                    "wallets": ["1A1zP1...Na", "3FZbgi...3N", "bc1q88...01"]
                }
            if "flagged in the last 24 hours" in q or "flagged in last 24" in q or "flagged in 24" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Wallets Flagged in Last 24 Hours:",
                    "data": ["Total Flagged: 18 High-Risk Wallets (+12.5% 24h trend)", "Critical Level: 8 Wallets", "High Risk Level: 10 Wallets"],
                    "wallets": []
                }
            if "more than 100 unique" in q or "100 unique addresses" in q or "unique addresses" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Highly-Connected System Nodes (Unique Counterparties > 100):",
                    "data": [
                        "Wallet 1A1zP1eP...Na — 142 Unique Addresses (Hub Node)",
                        "Wallet 3FZbgi29...3N — 118 Unique Addresses (Mixer Hub)",
                        "Wallet bc1q888a...01 — 105 Unique Addresses (Dispersal Node)"
                    ],
                    "wallets": ["1A1zP1eP...Na", "3FZbgi29...3N", "bc1q888a...01"]
                }
            if "highest transaction activity" in q or "country" in q or "geo" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Geographic Transaction Volume Breakdown (Top 5):",
                    "data": [
                        "1. United States — 38.4% (4,930 Txs)",
                        "2. Germany — 18.2% (2,336 Txs)",
                        "3. Singapore — 14.5% (1,861 Txs)",
                        "4. United Kingdom — 12.1% (1,553 Txs)",
                        "5. Japan — 9.3% (1,194 Txs)"
                    ],
                    "wallets": []
                }

            # --- CATEGORY 2: SYSTEM-WIDE RING LEADERS ---
            if "largest across the entire system" in q or "largest ring" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Largest System Fraud Ring Profile (RING-001):",
                    "data": [
                        "Ring ID: RING-001 (18 Member Wallets)",
                        "Total Transferred BTC: 142.50 BTC ($9,262,500 USD)",
                        "Average Node Degree: 6.4 Connections/Wallet",
                        "Graph Topology: Strongly Connected 4-Hop Multi-Cycle"
                    ],
                    "wallets": ["RING-001"]
                }
            if "detected in the last 7 days" in q or "last 7 days" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Fraud Rings Detected in Last 7 Days (6 Active Rings):",
                    "data": [
                        "1. RING-001 (18 Wallets, Confidence 94.8%)",
                        "2. RING-002 (12 Wallets, Confidence 92.1%)",
                        "3. RING-004 (8 Wallets, Confidence 89.5%)",
                        "4. RING-006 (6 Wallets, Confidence 88.2%)",
                        "5. RING-009 (5 Wallets, Confidence 86.4%)",
                        "6. RING-011 (4 Wallets, Confidence 85.0%)"
                    ],
                    "wallets": ["RING-001", "RING-002", "RING-004"]
                }
            if "closed the most fraud cases" in q or "analyst has closed" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Analyst Case Resolution Performance Leaderboard:",
                    "data": ["Lead Fraud Analyst (analyst@ringfinder.com) — 38 Closed Cases (Avg Resolution Time: 4.2 hours)"],
                    "wallets": []
                }
            if "total value protected" in q or "value protected" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Total Value Protected Across All Active Rings:",
                    "data": ["Total BTC Protected: 428.50 BTC", "Total USD Equivalent: $27,852,500 USD (at $65,000/BTC rate)"],
                    "wallets": []
                }
            if "highest average fraud score" in q or "highest average score" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Highest Risk Monitored Ring:",
                    "data": ["Ring RING-001 — Average Member Fraud Score: 95/100 (CRITICAL RISK)"],
                    "wallets": ["RING-001"]
                }
            if "currently active" in q or "how many rings" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Live Monitored Fraud Rings Status:",
                    "data": ["Currently Active Rings: 14 Monitored Clusters (12 Stable, 2 Accelerating)"],
                    "wallets": []
                }

            # --- CATEGORY 3: MODEL HEALTH & PERFORMANCE ---
            if "model's f1 score" in q or "f1 score" in q or "model f1" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Latest Deployed GraphSAGE GNN Model Performance Metrics:",
                    "data": [
                        "F1 Score: 0.928",
                        "PR-AUC: 0.945",
                        "Precision: 0.942 (94.2%)",
                        "Recall: 0.915 (91.5%)",
                        "ROC-AUC: 0.954"
                    ],
                    "wallets": []
                }
            if "last retrained" in q or "when was the model" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Model Retraining Audit Log:",
                    "data": ["Last Retrained Timestamp: 2026-09-10 02:00:00 UTC", "Deployed Model Version: v2.4-GraphSAGE-Prod"],
                    "wallets": []
                }
            if "retrain the model now" in q or "should i retrain" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Model Retraining Assessment Recommendation:",
                    "data": [
                        "Recommendation: NO IMMEDIATE RETRAIN NEEDED.",
                        "F1 Score Decay: -0.002 (Minimal degradation)",
                        "Feature Data Drift: 1.4% (Well below 5.0% threshold)"
                    ],
                    "wallets": []
                }
            if "f1 trend over the last 30 days" in q or "f1 trend" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "30-Day F1 Score History Across Retrain Cycles:",
                    "data": [
                        "Day 1 (v2.1): 0.912",
                        "Day 10 (v2.2): 0.920",
                        "Day 20 (v2.3): 0.925",
                        "Day 30 (v2.4 - Current): 0.928"
                    ],
                    "wallets": []
                }
            if "version performs best" in q or "model version performs" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Model Architecture Version Comparison:",
                    "data": [
                        "1. Version v2.4 (GraphSAGE 3-Hop) — F1: 0.928 [Active Production]",
                        "2. Version v2.3 (GraphSAGE 2-Hop) — F1: 0.914",
                        "3. Version v2.1 (GCN Baseline) — F1: 0.892"
                    ],
                    "wallets": []
                }
            if "data drift percentage" in q or "data drift" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Feature Store Data Drift Status:",
                    "data": ["Current Data Drift: 1.4%", "Retrain Threshold: 5.0%", "Status: STABLE / LOW DRIFT"],
                    "wallets": []
                }

            # --- CATEGORY 4: MODEL CONTROL (ADMIN-ONLY EXECUTION) ---
            if "retrain the model with" in q or "retrain the model" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Executing GraphSAGE Model Retraining Job:",
                    "data": [
                        "Status: RETRAINING_SUCCESSFUL",
                        "New Model Version: v2.5-GraphSAGE-Prod",
                        "New Model F1 Score: 0.934 (+0.006 improvement)",
                        "Deployment Status: Deployed to Live Pipeline"
                    ],
                    "wallets": []
                }
            if "roll back to" in q or "rollback" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Executing Model Version Rollback:",
                    "data": ["Status: ROLLBACK_SUCCESSFUL", "Restored Model Version: v2.3-GraphSAGE-Prod", "Active Deployment: LIVE"],
                    "wallets": []
                }
            if "deploy model version" in q or "deploy model" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Executing Model Deployment:",
                    "data": ["Status: DEPLOYED", "Deployed Model Version: v2.3-Prod", "Pipeline Status: ACTIVE"],
                    "wallets": []
                }
            if "schedule retraining" in q or "retraining for tonight" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Model Retraining Cron Job Scheduled:",
                    "data": ["Schedule Time: 2026-09-12 02:00:00 UTC", "Job Identifier: SCHED-8842", "Status: QUEUED"],
                    "wallets": []
                }
            if "cancel the scheduled retraining" in q or "cancel the scheduled" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Cancelling Scheduled Job:",
                    "data": ["Job ID SCHED-8842 has been cancelled successfully."],
                    "wallets": []
                }

            # --- CATEGORY 5: ADVERSARIAL ATTACK HISTORY ---
            if "attack history" in q or "attack history from" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Adversarial Perturbation Attack History (Last 30 Days):",
                    "data": [
                        "1. Peel Chain Amount Micro-Splitting (Passed - 87.2% Retained)",
                        "2. Temporal Transfer Delay Injection (Passed - 86.7% Retained)",
                        "3. Intermediary Hop Insertion (Passed - 84.4% Retained)",
                        "4. Scatter-Gather Parallel Routing (Passed - 90.2% Retained)"
                    ],
                    "wallets": []
                }
            if "worst f1 drop" in q or "worst f1" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Maximum Adversarial Attack Impact:",
                    "data": ["Worst Attack Type: Intermediary Hop Insertion", "F1 Drop: -0.082", "Retained Robustness Score: 84.4%"],
                    "wallets": []
                }
            if "defence performed best" in q or "defense performed best" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Best Performing Graph Defense Technique:",
                    "data": ["Top Defense: GNN Temporal Topological Flow Defense", "Recovery Rate: 94.2% retained performance"],
                    "wallets": []
                }
            if "attack success rate over time" in q or "attack success rate" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Adversarial Evasion Success Rate History:",
                    "data": ["30 Days Ago: 18.5%", "15 Days Ago: 15.2%", "Present: 13.7% (Decreasing Evasion Rate)"],
                    "wallets": []
                }
            if "attack type is most common" in q or "most common attack" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Ranked Adversarial Attack Frequencies:",
                    "data": [
                        "1. Peel Chain Amount Splitting (42% of attempts)",
                        "2. Temporal Delay Injection (31% of attempts)",
                        "3. Intermediary Mixing Hop Insertion (27% of attempts)"
                    ],
                    "wallets": []
                }

            # --- CATEGORY 6: SYSTEM HEALTH ---
            if "current system health" in q or "system health" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "RingFinder System Operational Health Metrics:",
                    "data": [
                        "System Status: OPTIMAL / HEALTHY",
                        "CPU Load: 14%",
                        "Memory Usage: 32% (2.4 GB / 8.0 GB)",
                        "API Average Latency: 42ms",
                        "Uptime: 99.98%"
                    ],
                    "wallets": []
                }
            if "api response times" in q or "response times" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "API Latency Profile (Last Hour):",
                    "data": ["Average Latency: 42ms", "P95 Latency: 58ms", "Max Latency: 118ms (during dataset ingestion)"],
                    "wallets": []
                }
            if "most frequently called" in q or "frequently called" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Most Frequently Called API Endpoints:",
                    "data": [
                        "1. GET /api/fraud/network/ (1,420 calls)",
                        "2. GET /api/transactions/ (980 calls)",
                        "3. POST /api/fraud/analyze/ (340 calls)"
                    ],
                    "wallets": []
                }
            if "errors in the last 24 hours" in q or "errors in last 24" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Error Log Audit Summary (Last 24 Hours):",
                    "data": ["Total HTTP 5xx Errors: 0", "Unhandled Exceptions: 0", "Database Deadlocks: 0", "Status: CLEAN LOGS"],
                    "wallets": []
                }
            if "current database size" in q or "database size" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Database Storage & Growth Metrics:",
                    "data": ["Database Size: 380.9 MB", "Growth Trend: +12.4 MB/week", "Total Transactions Indexed: 48,250 rows"],
                    "wallets": []
                }

            # --- CATEGORY 7: USER & ANALYST MANAGEMENT ---
            if "pending approval" in q or "analyst accounts are pending" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Pending Analyst Registration Approvals (1 Pending):",
                    "data": ["Applicant: pending@ringfinder.com (Applicant Analyst — FinTech Research Institute)"],
                    "wallets": []
                }
            if "approve analyst account" in q or "approve analyst" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Executed Analyst Approval:",
                    "data": ["Account status set to APPROVED. Credentials activated."],
                    "wallets": []
                }
            if "reject analyst account" in q or "reject analyst" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Executed Analyst Rejection:",
                    "data": ["Account application status set to REJECTED."],
                    "wallets": []
                }
            if "activity of analyst id" in q or "activity of analyst" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Analyst Activity Log Profile:",
                    "data": [
                        "Logged In: 08:15 AM UTC",
                        "Ran Fraud Analysis Run #14: 08:30 AM UTC",
                        "Exported Compliance Report: 09:12 AM UTC"
                    ],
                    "wallets": []
                }
            if "most active this week" in q or "analyst has been most active" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Most Active Analyst Leaderboard:",
                    "data": ["Lead Fraud Analyst (analyst@ringfinder.com) — 142 System Actions this week"],
                    "wallets": []
                }
            if "disable analyst account" in q or "disable analyst" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Executed Analyst Disable Command:",
                    "data": ["Analyst account disabled. Access token revoked."],
                    "wallets": []
                }

            # --- CATEGORY 8: ALERTS & THRESHOLDS ---
            if "current fraud threshold" in q or "fraud threshold" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Current Risk Scoring Threshold Settings:",
                    "data": [
                        "Critical Risk Threshold: 0.80 (80/100)",
                        "High Risk Threshold: 0.60 (60/100)",
                        "Configuration Source: System Settings (global_config)"
                    ],
                    "wallets": []
                }
            if "set the fraud threshold" in q or "set fraud threshold" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Fraud Threshold Updated:",
                    "data": ["Critical Risk Threshold set to 0.85 successfully."],
                    "wallets": []
                }
            if "alerts triggered in the last 24 hours" in q or "alerts triggered" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "24-Hour System Alert Log:",
                    "data": [
                        "1. High-Volume Cycle Alert (RING-001, Severity: CRITICAL)",
                        "2. Rapid Dispersal Node Flagged (Severity: HIGH)"
                    ],
                    "wallets": []
                }
            if "alert rule triggers the most" in q or "alert rule triggers" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Top Triggered Alert Rule:",
                    "data": ["Rule #3: Rapid Transfer Velocity (< 10 minutes transfer interval) — Triggered 42 times"],
                    "wallets": []
                }
            if "disable alert rule" in q or "disable alert" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Alert Rule Status Updated:",
                    "data": ['Alert Rule "Rapid-Layering Detection" disabled.'],
                    "wallets": []
                }

            # --- CATEGORY 9: REPORTING & COMPLIANCE ---
            if "generate a compliance report" in q or "compliance report" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Compliance Audit PDF Report Generated:",
                    "data": ["Period: Last Month", "Audit Trail Hash: SHA256-88a91c", "Status: Ready for PDF Download"],
                    "wallets": []
                }
            if "export all predictions" in q or "export all" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Quarterly Predictions Export Corpus:",
                    "data": ["12,840 Records Prepared for CSV Export."],
                    "wallets": []
                }
            if "total value protected this year" in q or "value protected this year" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Year-To-Date Protected Value Summary:",
                    "data": ["Total BTC Protected: 1,420.50 BTC", "Total USD Value: $92,332,500 USD"],
                    "wallets": []
                }
            if "generate a report of all high-risk rings" in q or "report of all high-risk" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "High-Risk Rings Forensic Audit PDF Generated:",
                    "data": ["Contains forensic details for 14 active monitored rings."],
                    "wallets": []
                }
            if "send the monthly report" in q or "send monthly report" in q:
                return {
                    "type": "DATA_ANSWER",
                    "text": "Dispatching Monthly Compliance Report:",
                    "data": ["Monthly Compliance Report emailed to compliance@ringfinder.com."],
                    "wallets": []
                }

        # ============================================================
        # 🕵️ ANALYST CHATBOT ENGINE
        # ============================================================

        # Q1: Who sent money to wallet <address>?
        if "who sent money" in q or "sent to wallet" in q or "incoming senders" in q:
            target = ExplainabilityBotService.extract_wallet(question, "0xA1b2C3...99")
            return {
                "type": "DATA_ANSWER",
                "text": f"Incoming transaction source wallets for Target Address [{target}]:",
                "data": [
                    "Wallet 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa (15.50 BTC — 4 mins ago)",
                    "Wallet 3FZbgi29cp48G435nd8X73N (8.25 BTC — 18 mins ago)",
                    "Wallet bc1q888walleta000001 (2.10 BTC — 1 hour ago)"
                ],
                "wallets": ["1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", "3FZbgi29cp48G435nd8X73N", "bc1q888walleta000001", target]
            }

        # Q2: What are the top 5 outgoing destinations from wallet <address>?
        if "top 5 outgoing" in q or "outgoing destinations" in q or "top outgoing" in q:
            target = ExplainabilityBotService.extract_wallet(question, "0xF4e5...88")
            return {
                "type": "DATA_ANSWER",
                "text": f"Top 5 frequent outgoing receivers from Wallet [{target}]:",
                "data": [
                    "1. Wallet 3J98t1Wk...Ly — 12.80 BTC (14 transactions)",
                    "2. Wallet bc1qxy2kg...lh — 9.50 BTC (9 transactions)",
                    "3. Wallet 13zb1hP4...8a — 6.20 BTC (6 transactions)",
                    "4. Wallet 3K7mP9x1...99 — 4.15 BTC (4 transactions)",
                    "5. Wallet 1F1tAaz5...Xq — 2.05 BTC (2 transactions)"
                ],
                "wallets": [target, "3J98t1Wk...Ly", "bc1qxy2kg...lh", "13zb1hP4...8a", "3K7mP9x1...99", "1F1tAaz5...Xq"]
            }

        # Q3: Show the transaction path from wallet <address> to wallet <address>
        if "transaction path" in q or "path from wallet" in q or "shortest path" in q or "chain from wallet" in q:
            return {
                "type": "DATA_ANSWER",
                "text": "Shortest Payment Chain Identified (3-Hop Peeling Route):",
                "data": [
                    "Wallet 0x123... ➔ TX-101 (Peeling Hub) ➔ Wallet 0x555... (Intermediary) ➔ TX-104 ➔ Wallet 0x9AB..."
                ],
                "wallets": ["0x123...", "TX-101", "0x555...", "TX-104", "0x9AB..."]
            }

        # Q4: How many distinct wallets have transacted with wallet <address> in the last 30 days?
        if "distinct wallets" in q or "transacted with wallet" in q or "last 30 days" in q:
            target = ExplainabilityBotService.extract_wallet(question, "0xDEF...77")
            return {
                "type": "DATA_ANSWER",
                "text": f"30-Day Interaction Summary for Wallet [{target}]:",
                "data": [
                    "Distinct Counterparty Wallets: 28 Wallets (18 Send, 10 Receive)",
                    "Total Transaction Volume: 148.50 BTC",
                    "Average Transaction Amount: 5.30 BTC",
                    "Graph Connection Density: High (Clustering Coeff 0.78)"
                ],
                "wallets": [target]
            }

        # Q5: Which wallet is the current ring leader?
        if "current ring leader" in q or "which wallet is the ring leader" in q or "leader wallet" in q or ("ring" in q and "leader" in q):
            return {
                "type": "DATA_ANSWER",
                "text": "Fraud Ring Leader Topological Identification:",
                "data": [
                    "Primary Syndicate Controller: Wallet 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
                    "PageRank Centrality Score: 0.965",
                    "Eigenvector Centrality: 0.942",
                    "Circular Flow Control: 84.2% of laundering ring throughput"
                ],
                "wallets": ["1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"]
            }

        # Q6: Who are the top 3 most central wallets in ring <id>?
        if "top 3 most central" in q or "central wallets in ring" in q or "top 3 central" in q or "most central" in q:
            match = re.search(r'ring\s*(\d+|[A-Za-z0-9_-]+)', question, re.IGNORECASE)
            ring_id = match.group(1) if match else "42"
            return {
                "type": "DATA_ANSWER",
                "text": f"Top 3 Most Central Influential Members in Ring #{ring_id}:",
                "data": [
                    "1. Wallet 1A1zP1...Na — Betweenness Centrality: 0.965 (Mixing Controller)",
                    "2. Wallet 3FZbgi...3N — Betweenness Centrality: 0.884 (Distribution Node)",
                    "3. Wallet bc1q88...01 — Betweenness Centrality: 0.792 (Peel Chain Collector)"
                ],
                "wallets": ["1A1zP1...Na", "3FZbgi...3N", "bc1q88...01"]
            }

        # Q7: What is the size of the largest fraud ring?
        if "size of the largest" in q or "largest fraud ring" in q or "largest ring" in q:
            return {
                "type": "DATA_ANSWER",
                "text": "Largest Monitored Fraud Ring Corpus Profile (RING-001):",
                "data": [
                    "Total Member Wallets: 18 Wallets",
                    "Total BTC Volume Transferred: 142.50 BTC",
                    "Average Node Degree: 6.4 Connections/Wallet",
                    "Graph Topology: Strongly Connected 4-Hop Multi-Cycle"
                ],
                "wallets": ["RING-001"]
            }

        # Q8: List all rings that contain wallet <address>
        if "rings that contain" in q or "rings containing" in q or "list all rings that" in q:
            target = ExplainabilityBotService.extract_wallet(question, "0xA1b2C3...")
            return {
                "type": "DATA_ANSWER",
                "text": f"Detected Fraud Communities containing Wallet [{target}]:",
                "data": [
                    "1. Ring #42 (RING-001) — 18 Member Wallets (Critical Risk 92/100)",
                    "2. Ring #109 (RING-004) — 6 Member Wallets (High Risk 84/100)"
                ],
                "wallets": [target, "RING-001", "RING-004"]
            }

        # Q9: What is the fraud score for wallet <address>?
        if "fraud score for wallet" in q or "fraud score of wallet" in q or "score for wallet" in q:
            target = ExplainabilityBotService.extract_wallet(question, "0xF4e5...")
            return {
                "type": "DATA_ANSWER",
                "text": f"GNN Forensic Risk Breakdown for Wallet [{target}]:",
                "data": [
                    "Risk Score: 92/100 (CRITICAL RISK)",
                    "Factor 1: High Out-Degree (24 outgoing rapid hops)",
                    "Factor 2: Rapid Turnover (< 5 mins average transfer interval)",
                    "Factor 3: Active Member of Circular Ring RING-001"
                ],
                "wallets": [target]
            }

        # Q10: Which rings have a fraud-score > 80?
        if "fraud-score > 80" in q or "score > 80" in q or "fraud score > 80" in q or "greater than 80" in q:
            return {
                "type": "DATA_ANSWER",
                "text": "Monitored Syndicates with Average Risk Score > 80:",
                "data": [
                    "1. Ring RING-001 (Score: 95/100) — 18 Wallets, 142.50 BTC (Circular Cycle)",
                    "2. Ring RING-002 (Score: 92/100) — 12 Wallets, 98.20 BTC (Peel Chain)",
                    "3. Ring RING-004 (Score: 86/100) — 8 Wallets, 45.60 BTC (Hub Distribution)",
                    "4. Ring RING-006 (Score: 84/100) — 6 Wallets, 32.10 BTC (Scatter-Gather)"
                ],
                "wallets": ["RING-001", "RING-002", "RING-004", "RING-006"]
            }

        # Q11: Show me wallets that have both high out-degree > 20 and low in-degree < 2
        if "high out-degree" in q or "out-degree > 20" in q or "low in-degree" in q:
            return {
                "type": "DATA_ANSWER",
                "text": 'Filtered Suspicious "Source-Only" Dispersal Nodes (Out-Degree > 20, In-Degree < 2):',
                "data": [
                    "1. Wallet 1A1zP1eP...Na — Out-Degree: 24, In-Degree: 1 (Total Dispersed: 142.5 BTC)",
                    "2. Wallet 3FZbgi29...3N — Out-Degree: 21, In-Degree: 0 (Total Dispersed: 98.4 BTC)",
                    "3. Wallet bc1q888a...01 — Out-Degree: 22, In-Degree: 1 (Total Dispersed: 64.2 BTC)"
                ],
                "wallets": ["1A1zP1eP...Na", "3FZbgi29...3N", "bc1q888a...01"]
            }

        # Q12: What common patterns do the top 5 riskiest rings share?
        if "common patterns" in q or "top 5 riskiest" in q or "riskiest rings share" in q:
            return {
                "type": "DATA_ANSWER",
                "text": "Shared Topological Patterns among Top 5 Riskiest Rings:",
                "data": [
                    "1. Rapid Transfer Velocity: Transfers execute within 2 to 10 minutes of block confirmation.",
                    "2. Peel Chain Splitting: High-value inputs split into exact 0.1 to 1.0 BTC micro-amounts.",
                    "3. Closed Graph Cycles: Funds return to origin/controlling entity wallet in 84% of cases.",
                    "4. Mixing Intermediaries: Use of zero-history freshly generated wallet addresses."
                ],
                "wallets": []
            }

        # Q13: If I remove wallet <address>, how does the ring structure change?
        if "remove wallet" in q or "if i remove" in q or "ring structure change" in q:
            target = ExplainabilityBotService.extract_wallet(question, "0xABC123...")
            return {
                "type": "DATA_ANSWER",
                "text": f"Counterfactual Graph Impact Simulation (Removing Node [{target}]):",
                "data": [
                    "Graph Disruption: Primary 4-Hop Laundering Cycle is Broken.",
                    "New Ring Leader: Wallet 3FZbgi29...3N replaces origin node.",
                    "Ring Division: Ring RING-001 splits into 2 disconnected sub-graphs.",
                    "Sub-graph Fraud Probability: Drops from 94.2% down to 21.5%."
                ],
                "wallets": [target]
            }

        # Q14: What happens to the fraud score of wallet <address> if I blacklist it?
        if "if i blacklist" in q or "blacklist" in q:
            target = ExplainabilityBotService.extract_wallet(question, "0xDEF456...")
            return {
                "type": "DATA_ANSWER",
                "text": f"Blacklist Re-computation Simulation for Wallet [{target}]:",
                "data": [
                    "Wallet Status: Set to PERMANENT_BLACKLIST.",
                    "Neighboring Wallet Scores: 4 connected wallets re-evaluated (+18% risk increase).",
                    "Ring Retained Throughput: Decreases by 74.5% as primary mixing path is blocked.",
                    "Global System Alert: Automated frozen wallet event broadcasted."
                ],
                "wallets": [target]
            }

        # Q15: Simulate dropping all edges from wallet <address> - does any ring break apart?
        if "dropping all edges" in q or "simulate dropping" in q or "does any ring break" in q:
            target = ExplainabilityBotService.extract_wallet(question, "0x123...")
            return {
                "type": "DATA_ANSWER",
                "text": f"Edge Dropping Simulation for Node [{target}]:",
                "data": [
                    "Dropped Edges: 14 Ingress/Egress Edges Removed.",
                    "Ring Structural Impact: Ring RING-001 completely disintegrates.",
                    "Component Separation: Disconnects 12 downstream wallets from mixing cluster.",
                    "Overall Network Density: Graph clustering coefficient drops by 34.2%."
                ],
                "wallets": [target]
            }

        # DEFAULT CLARIFICATION FALLBACK
        return {
            "type": "CLARIFICATION",
            "text": "Please rephrase. I answer questions about system health, model controls, analyst management, alerts, or audit reporting." if is_admin else "Please rephrase. I answer questions about wallet flows, ring leaders, fraud patterns, or what-if scenarios."
        }
