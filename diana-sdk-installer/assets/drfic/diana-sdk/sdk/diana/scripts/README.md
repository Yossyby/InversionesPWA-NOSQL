# Diana SDK Installers

Estos instaladores preparan un proyecto para usar Diana sin depender de `.specify`.

## PowerShell

```powershell
pwsh .drfic/diana-sdk/sdk/diana/scripts/powershell/install-diana.ps1
```

Opciones:
- `-TargetPath <ruta>`: destino del proyecto (default: `.`)
- `-Force`: sobrescribe archivos existentes del setup Diana
- `-SkipActions`: no copia `.github/prompts` y `.github/agents` de Diana

## Bash

```bash
bash .drfic/diana-sdk/sdk/diana/scripts/bash/install-diana.sh
```

Opciones:
- `--target <ruta>`: destino del proyecto (default: `.`)
- `--force`: sobrescribe archivos existentes del setup Diana
- `--skip-actions`: no copia `.github/prompts` y `.github/agents` de Diana

## Resultado minimo esperado

- `.drfic/readme.md`
- `.drfic/diana-sdk/sdk/diana/` (core)
- `.drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml`
- `.github/prompts/diana.*.prompt.md` (si no se usa skip)
- `.github/agents/diana.*.agent.md` (si no se usa skip)
