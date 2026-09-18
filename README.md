TaradomeMusik Platform — Advanced Engineering Artifacts
Generated: 2026-02-21T22:32:51.681908Z

Contents:
- openapi/taradome-openapi-v1.yaml (production-grade baseline; 167 operations)
- migrations/*.sql (PostgreSQL DDL migration pack)
- terraform/aws/* (AWS baseline templates)
- terraform/azure/* (Azure baseline templates)

Additional PDFs (in /mnt/data):
- TaradomeMusik_STRIDE_Threat_Model.pdf
- TaradomeMusik_3Year_Tech_CAPEX_Roadmap.pdf

---

## Design work

The Next.js site lives under `Website/` (`npm run dev` → http://localhost:3000).

Design and redesign work runs through the Taradome design toolkit — see
[DESIGN-WORKFLOW.md](DESIGN-WORKFLOW.md) for setup and the house workflow.
Playwright is pre-wired in [`.mcp.json`](.mcp.json).
