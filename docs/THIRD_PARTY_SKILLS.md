# Third-party skills

Source: `https://github.com/solidgate-tech/solidgate-agent-skills`, main branch commit `09694b6a618ac76b38bcb3cc8a5c9a718cbf9306`.

Copied complete directories: `solidgate-payment-form`, `solidgate-h2h`, and `chargebackhit`. Upstream `README.md` and `PROMPTS.md` are preserved in `.agents/skills/` for attribution and usage context. These are reference materials, not evidence of a live integration.

To update: clone the upstream main branch to a temporary directory, review its diff and license/attribution changes, replace only these three complete directories plus attribution files, record the new commit here, then run repository checks. Never add Solidgate keys. Payment Form or the mock adapter remains the safe default; do not implement live H2H card processing before the challenge.
