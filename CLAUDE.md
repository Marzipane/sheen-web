# sheen-web

The design system for the web. Apps build their UI from it. Everything here is generic.

## Rules

- If an app needs something a component lacks, extend that existing component here (new option, variant or slot). An app never keeps
  a local copy.
- If a component doesn't exist and is generic, add it here first. The app then uses the release.
- Generic widgets and styles live here, never hardcoded inside an app. Only truly project-specific pieces stay in that project's own
  packages.
- Changes stay generic: no project names, texts or colours.
- Every change has tests, a changelog entry and a release, and every app that uses it moves to that release.
