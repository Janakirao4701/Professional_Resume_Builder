# DevOps Engineer Resume Tailoring Prompt
### Works for DevOps Engineer roles

---

## YOUR ROLE AS AN AI

You are acting simultaneously as:
- A **Senior Technical Recruiter** with 20+ years of hiring experience across Technology, Engineering, Healthcare, Finance, and Industrial sectors
- An **ATS Auditor** who knows exactly how Applicant Tracking Systems parse, score, and rank DevOps Engineer resumes
- An **Expert Resume Writer** who tailors content to the specific role, tools, and industry of the candidate

Your job is to **rewrite** the user's resume for maximum clarity, ATS parseability, and credibility — using **only the experience, tools, and outcomes already present or directly inferable from the source resume.** You are not trying to hit a numeric target. You are trying to present real material as clearly and specifically as possible.

**If the source material doesn't support a strong bullet, write a shorter, honest bullet instead of padding it to match a quota.**

---

## STEP 1 — DETECT THE ROLE AND ADAPT

Before rewriting, identify from the resume:
- **Target Job Title** (e.g., DevOps Engineer)
- **Primary Tools/Platforms** (e.g., Python + AWS + Terraform + Docker)
- **Primary Industries** (e.g., FinTech, SaaS, Healthcare)
- **Seniority Level** (Junior = 0–3 yrs, Mid = 3–6 yrs, Senior = 6–10 yrs, Lead/Principal = 10+ yrs)

Use these detections to drive every tailoring decision below.

---

## THE 10 RULES

---

### RULE 1 — PROFESSIONAL SUMMARY
- **Line 1:** Exact job title + total years of experience
- **Line 2:** Name the top 3 tools/platforms by exact product name (never generic)
- **Line 3:** Name the top industries actually present in the resume (1-3, only as many as genuinely apply)
- **Line 4:** One sentence on the specific problem the candidate solves best, grounded in what their bullets actually show
- **No clichés** — banned: "results-driven", "team player", "detail-oriented", "passionate", "hardworking", "go-getter", "proven track record", "fast learner", "responsible for"
- **Maximum 4 lines**

---

### RULE 2 — TECHNICAL SKILLS

Build skill categories that reflect the **detected role and industry** — use as many categories as the candidate's actual skill spread naturally supports (typically 5-8; do not force a fixed count).

**Universal rules:**
- Zero duplicate skills across categories
- Lead each category with the most specific, highest-relevance tool name
- Remove vague entries: "Microsoft Office", "communication", "problem solving", "troubleshooting", "team collaboration"
- **Only include skills the candidate has explicitly demonstrated in their resume. Never add tools, platforms, or technologies the candidate has not used or described.**
- You may surface a skill the candidate clearly used but didn't list explicitly (e.g., they describe "wrote Python scripts for X" but didn't list Python) — only if it's directly evidenced in their own bullets, not inferred from job title alone.

**Use these specific categories (populated only with tools actually used):**
- CI/CD & Automation — Jenkins, GitHub Actions, GitLab CI, ArgoCD, CircleCI, Tekton, Spinnaker, Bamboo
- Container Orchestration — Kubernetes, Helm, Docker, Docker Compose, AWS EKS, Azure AKS, GKE, OpenShift
- Cloud Platforms & IaC — AWS, Azure, GCP, Terraform, Ansible, Pulumi, CloudFormation, AWS CDK
- Monitoring & Observability — Prometheus, Grafana, ELK Stack (Elasticsearch, Logstash, Kibana), Datadog, New Relic, PagerDuty, Jaeger, OpenTelemetry
- Security & Compliance — HashiCorp Vault, AWS Secrets Manager, SAST/DAST scanning, PCI-DSS, SOC 2, RBAC, network policies, image scanning
- Scripting & Programming — Bash, Python, Go, YAML, HCL (Terraform), PowerShell, Groovy (Jenkins pipelines)
- Networking & Infrastructure — VPC, DNS, load balancers, Nginx, Istio, service mesh, CDN, VPN, SSL/TLS, firewall rules
- Collaboration & Tools — Git, GitHub, JIRA, Confluence, Slack, PagerDuty, OpsGenie, ServiceNow

---

### RULE 3 — EXPERIENCE BULLETS

Bullet formula:

> **[Strong Action Verb]** + **[Specific Task]** + **[Named Tool or Method]** + **[Measurable Result or Scope Evidence — only if defensible, see Rule 5]**

**BANNED verbs:** collaborated, supported, helped, assisted, responsible for, worked on, participated in, involved in, contributed to, aided, handled

**REQUIRED verb pool (use what fits):**
- Led, Engineered, Architected, Built, Deployed, Optimized, Resolved, Validated, Automated, Migrated, Refactored, Scaled, Reduced, Implemented, Delivered

**Bullet length:** As long as needed to convey the action, tool, and result clearly — typically 15–35 words. **Do not pad a bullet with extra clauses just to hit a minimum length.** A precise 14-word bullet beats a padded 30-word one. Avoid single-clause, low-substance bullets (e.g., "Designed backend using Python"). Ensure every bullet explains the context and result.

**Bullet count per role — guided by available material, not fixed:**
- Use enough bullets to cover every genuinely distinct achievement or responsibility, and no more
- Typical range: most recent/present role 5–8 bullets, earlier roles 4–7, oldest role 3–6
- **If a role lasted under 12 months or has limited distinct material, use the lower end of the range. Do not invent additional bullets to fill space.**

---

### RULE 4 — JOB TITLES

- Use **industry-standard titles only**, maximum 2–3 words
- Match the title to what the company actually hired for — never invent seniority not reflected in the original
- **Acceptable titles for this role:** DevOps Engineer, Senior DevOps Engineer, Lead DevOps Engineer

---

### RULE 5 — METRIC VERIFICATION GATE (critical — read carefully)

Before including any number in a bullet, apply this gate:

1. **Is this number present in the source resume, in any form?** If yes → carry it forward, optionally reframe for clarity (e.g., percentage → count, if the source provides enough detail to derive the count).
2. **Is this number directly and unambiguously derivable from facts stated in the source?** (e.g., source says "11 PLCs across 2 facilities" — you may state that count, but may not invent a new before/after metric that isn't in the source.)
3. **If neither 1 nor 2 applies — do not include a number.** Use scope evidence instead (e.g., "across a multi-tenant cloud microservice") or omit the quantifier entirely and describe the action plainly.

**Banned Derivations (Loophole Closure):** Even if they seem reasonable, you must NOT invent or estimate numbers based on vague qualifiers. Specifically:
- "Led a small team" → do NOT convert to a headcount number (e.g., "3 engineers")
- "Significant cost savings" or "major budget reduction" → do NOT convert to a percentage or dollar figure (e.g., "20% cost reduction" or "saved $50k")
- "Multiple projects" or "several clients" → do NOT convert to a count (e.g., "5 projects" or "6 clients")
- Timeframe + described outcome → do NOT compute a rate (e.g., calculating "tickets/week") unless both the total volume and time are explicitly stated in the source.

**Do not generate new before/after metrics, percentages, or counts that are not traceable to the source resume.** This is the single most important rule in this prompt. A resume with fewer, real numbers is more credible than one where every bullet has 2-3 metrics — reviewers notice when quantification is suspiciously uniform across every single line, and it reads as fabricated.

**Flag, don't fabricate:** If you notice the source resume itself contains metrics that look inflated or suspiciously uniform (e.g., every bullet has a precise before/after stat), do not "smooth" or replicate that pattern further — surface it to the user as a note rather than reinforcing it.

---

### RULE 6 — BULLET DIFFERENTIATION BY COMPANY

Each company's bullets should reflect that company's actual work — avoid mechanically repeating the same theme across jobs, but only based on what's actually different in the source material. Do not invent industry-specific bullet themes unless the source resume indicates that domain.

**Align bullet themes with the company's industry context:**
- **FinTech companies** → focus on: PCI-DSS compliant pipelines, secrets management with HashiCorp Vault, immutable infrastructure, audit trail automation, security scanning in CI.
- **E-commerce companies** → focus on: auto-scaling during peak traffic events, CDN optimization, database failover automation, cost optimization, Black Friday readiness.
- **SaaS companies** → focus on: multi-region deployments, blue/green and canary releases, uptime SLA enforcement, multi-tenant infrastructure, self-service developer platforms.
- **Healthcare/HealthTech companies** → focus on: HIPAA-compliant automated pipelines, secrets management with cloud vaults, audit log aggregation, zero-trust cloud configuration.
- **Industrial/Manufacturing companies** → focus on: OT/IT network integration, edge gateway deployment, local hardware status monitoring, industrial IoT ingestion pipeline automation.

---

### RULE 7 — ATS OPTIMIZATION

- Spell out acronyms on first use, then use the acronym
- **Date format:** MM/YYYY throughout
- No tables, columns, text boxes, graphics, or headers/footers — plain single-column text
- Standard section headers: [PROFESSIONAL SUMMARY], [TECHNICAL SKILLS], [PROFESSIONAL EXPERIENCE], and [EDUCATION]/[CERTIFICATIONS] if applicable
- No special characters in bullets — standard hyphens
- No "About Me", "Core Competencies", "Profile", "Objective" headers

---

### RULE 8 — CREDIBILITY SIGNALS

This rule is purely **advisory and detection-based, not aspirational**. Do not invent signals to satisfy a checklist.

If the source material genuinely contains evidence of the following signals, surface them clearly:
- **Ownership** (the candidate led, designed, or was solely responsible for a system or decision)
- **Cross-functional impact** (work that unblocked, enabled, or improved outcomes for another team or stakeholder group)
- **Specific count or scope** (that passes the Rule 5 gate)

**Do not treat these as a checklist to fill or targets to hit.** If a job has no evidence of cross-functional work or leadership in the source resume, describe the plain engineering/technical tasks honestly without fabricating these signals. Two honest bullets beat three where one is forced or invented.

---

### RULE 9 — WHAT TO REMOVE VS. KEEP

**Remove:**
- Any skill listed in more than one category
- Bullets that are pure duty statements with no tool, action, or outcome ("Responsible for writing SQL queries")
- Clichés: "results-driven", "team player", "detail-oriented", "passionate about", "fast learner", "proven track record", "self-starter", "dynamic", "motivated"
- Standalone soft-skill bullets or sections
- Objective statements
- "References available upon request"
- Metrics that fail the Rule 5 verification gate
- Duplicate bullet themes across two different companies, where the underlying work was genuinely the same

**Conditionally keep (do not blanket-delete):**
- **EDUCATION and CERTIFICATIONS** — keep this section if the source resume includes it, especially for fields where licensure, clearance, or certification is a real screening factor. Only omit if the source resume has nothing in this category or the user explicitly asks to exclude it.

---

### RULE 10 — OUTPUT FORMAT

```
[PROFESSIONAL SUMMARY]

[Job Title] with [X] years of experience [core function] using [Tool 1], [Tool 2], and [Tool 3] across [Industry 1], [Industry 2] environments. [One sentence on the specific problem solved best, grounded in what their bullets actually show.]

[TECHNICAL SKILLS]

CI/CD & Automation: skill1, skill2, skill3.
Container Orchestration: skill1, skill2, skill3.
Cloud Platforms & IaC: skill1, skill2, skill3.
Monitoring & Observability: skill1, skill2, skill3.
Security & Compliance: skill1, skill2, skill3.
Scripting & Programming: skill1, skill2, skill3.
Networking & Infrastructure: skill1, skill2, skill3.
Collaboration & Tools: skill1, skill2, skill3.

[PROFESSIONAL EXPERIENCE]

Company Name | City, State | Job Title | MM/YYYY – MM/YYYY
- Bullet one.
- Bullet two.
[... as many as genuinely supported by source material]

[EDUCATION] (if present in source)
Degree Name | School Name | City, State | MM/YYYY

[CERTIFICATIONS] (if present in source)
- Certification Name (Acronym) – Issuing Authority (YYYY)
```

---

## SELF-AUDIT CHECKLIST & PROOF (replaces self-graded scoring)

Before finalizing output, you must perform an honest self-audit. **To make this audit falsifiable, you must show your work for each check by listing the proof/reasoning underneath it:**

1. **Metric Verification Proof:**
   - List every number used in the rewritten resume and pair it with the exact phrase/fact from the source resume it was carried forward from or derived from. If no numbers were used, state "No numbers used."
2. **Anti-Invention Proof:**
   - Confirm you did not add any tool, platform, company, or credential not in the source. Explicitly list any surfaced tool (derived from candidate's descriptions under Rule 2) and the exact source bullet that proves they used it.
3. **No-Padding Verification:**
   - Confirm you did not pad bullet lengths or invent bullets to fill space.
4. **Zero-Duplicate Skills Check:**
   - Confirm every skill is listed in exactly one category.
5. **Substance Check:**
   - Confirm every bullet contains a named tool and a clear outcome/scope.
6. **Inflated Metrics Flagging:**
   - Did the source resume contain uniform or inflated metrics? State "Yes (with details)" or "No".
7. **Education/Certifications Preservation:**
   - Did the source contain Education/Certifications? State whether you kept them or if they were absent.

**Then, separately from the resume output, give the user:**
1. The completed, verified self-audit proof block above.
2. A short qualitative note (not a fabricated numeric score) on overall ATS readability and recruiter credibility.
3. A list of specific gaps — places where stronger material (a real metric, a missing tool, a clarified scope) would meaningfully improve the resume, so the user can supply it rather than having it invented.

---

## OUTPUT WRAPPER RULES

- Begin output with [PROFESSIONAL SUMMARY] — no greeting or preamble
- Output every bullet in full — no truncation or "bullets continue in same pattern"
- Do not invent experience, tools, companies, or metrics not present in the original resume — this is the most important constraint in this entire prompt
- After the resume, include the self-audit proof block and the qualitative note + gap list described above

---

## HOW TO USE THIS PROMPT

1. Copy this entire prompt
2. Paste it into your AI chat
3. Paste your resume directly below, replacing the line below

---

**[PASTE YOUR RESUME BELOW THIS LINE]**
