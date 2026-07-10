# Setup audit

Audit date: 2026-07-10 (Europe/Warsaw). Secret values and credential stores are excluded.

## System

- macOS 27.0 build 26A5353q, Apple silicon arm64, zsh
- Codex CLI 0.144.0-alpha.4, bundled with `/Applications/ChatGPT.app`; authenticated with ChatGPT
- Git 2.50.1 (Apple Git-155); GitHub CLI 2.92.0, authenticated as `keksik4` via keyring; Git identity configured
- Node 22.20.0 from `/usr/local/bin`; npm 10.9.3; Corepack available; pnpm runtime 11.7.0 with project pin 11.11.0
- Python 3.9.6; uv 0.11.12; Docker not installed and not required
- No Homebrew, MacPorts, mise, asdf, fnm, nvm, or Volta detected

## Codex configuration

Backup: `/Users/keksik/codex-backups/20260710-224435`, mode 0700, 554 safe files. It includes configuration and skill/plugin files while excluding auth stores, databases, caches, and environment files.

Codex doctor reports a consistent desktop-bundled installation and healthy authentication/state. Its only actionable terminal warning (`TERM=dumb`) is specific to non-interactive execution. `codex plugin --help` is available. The official curated, bundled, and primary-runtime marketplaces are configured. Curated marketplace metadata cannot be upgraded with the Git-marketplace command because this desktop-provided snapshot is not configured as a Git marketplace.

Required official plugins already installed/enabled: OpenAI Developers, Build Web Apps, GitHub, Browser, Chrome, and Computer Use. No duplicates were added.

## Skill inventory

`~/.codex/skills` contains 35 skills: five current built-in system skills (modified 2026-07-09) plus 30 user-level skills mostly modified 2026-02-03 through 2026-05-17. Apparent sources are OpenAI/system for `.system`, official copied skills for common tool workflows, and custom/unknown for design variants. No `~/.agents/skills` or `~/.agents/plugins` existed. Exact copies are preserved in the backup. Because provenance for several custom design skills is unknown and no destructive migration was needed, they remain untouched rather than being silently archived.

Repository skills comprise three maintained Solidgate reference skills and five Team MMM custom workflows. Similar user/global capabilities are not copied into this repository. Codex discovers `.agents/skills` from the repository guidance surface; a new Codex task may be required for the UI skill list to refresh.

## Known audit limitations

The official Codex manual helper rejected a response missing its integrity header, so locally verified CLI help/doctor output and current installed capability discovery were used. Codex is desktop-managed; updating the desktop app is the supported channel, and no separate CLI was installed to avoid PATH conflict.
