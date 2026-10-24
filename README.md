# Claude Mods

A collection of small, installable mods that customise the Claude Code interface. Each mod lives in its own folder with its own README, and installs on its own with one line.

## Mods

| Mod | What it does |
| --- | --- |
| [usage-bar](usage-bar/README.md) | A responsive, full-width status bar above the prompt with live context, 5-hour and weekly usage meters, in fifteen themes. |
| [themes](themes/README.md) | Full-interface themes for terminal and desktop: restyled messages, tool rows, spinner and usage bar. Fifteen themes, switch live with `/themes`. |

![usage-bar](usage-bar/docs/img/classic.svg)

## Installing a mod

Add this repository as a marketplace once, then install any mod from it.

In a terminal session:

```
/plugin install <mod> --marketplace itsmemac/Claude-Mods
```

From a shell:

```bash
claude plugin install <mod> --marketplace itsmemac/Claude-Mods
```

On an older Claude Code that rejects `--marketplace`, add the marketplace first and install by name:

```bash
claude plugin marketplace add itsmemac/Claude-Mods
claude plugin install <mod>@claude-mods
```

In the desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `itsmemac/Claude-Mods`, then **Add plugin**.

Installed at the user scope, a mod loads in every session you start afterwards.

## Repository layout

```
.claude-plugin/marketplace.json   lists every mod, so the repository is a marketplace
<mod-name>/
  README.md                       what it does, how to install, how to configure
  .claude-plugin/plugin.json      the mod's manifest
  hooks/hooks.json                points at the hooks module
  hooks/register.tsx              the mod itself
  types/index.d.ts                the contract for any state the mod keeps
```

## Adding a mod

1. Create `<mod-name>/` with the files above and a `README.md`.
2. Add an entry to `.claude-plugin/marketplace.json`: `{ "name": "<mod-name>", "source": "./<mod-name>", "description": "..." }`.
3. Add a row to the table above, linking the mod's README.
4. Run `claude plugin validate .` and `claude plugin validate <mod-name>`.

A mod must work on any machine: no hard-coded paths, no personal settings, nothing that assumes a particular account, plan or operating system. Where something may be unavailable, show a fallback instead of failing.

## License

MIT, see [LICENSE](LICENSE).
