import * as vscode from 'vscode'

interface Config {
  include: string
  exclude: string
}

const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const results = new Set<T>()
  for (const value of a) {
    if (b.has(value)) {
      results.add(value)
    }
  }
  return results
}

const countFiles = async (
  include: string,
  exclude: string
): Promise<number> => {
  let first = true
  let results = new Set<string>()
  const includePatterns = include.split(',')
  const excludePatterns = exclude.split(',')
  for (const include of includePatterns) {
    for (const exclude of excludePatterns) {
      const res = await (
        await vscode.workspace.findFiles(include, exclude)
      ).map((uri) => uri.fsPath)

      if (first) {
        results = new Set(res)
        first = false
        continue
      }

      results = intersection(results, new Set(res))
    }
  }
  return results.size
}

const getConfig = (): Config => {
  const config = vscode.workspace.getConfiguration('file-count')
  return {
    include: config.get('include') || '**',
    exclude: config.get('exclude') || 'node_modules/',
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    'file-count.showNumOfFiles',
    async () => {
      const config = getConfig()
      const count = await countFiles(config.include, config.exclude)
      vscode.window.showInformationMessage(count.toString())
    }
  )

  context.subscriptions.push(disposable)
}

export function deactivate(): void {}
