import * as vscode from 'vscode'
import * as fs from 'fs'

interface Config {
  include: string
  exclude: string
  useGitignore: boolean
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

const getGitignoreFiles = async (): Promise<string[]> => {
  const files = await vscode.workspace.findFiles('.gitignore')
  if (files.length !== 1) {
    return []
  }

  const contents = fs.readFileSync(files[0].fsPath).toString()
  return contents.split(/\r?\n/g)
}

const getNumOfFiles = async (
  includePatterns: string[],
  excludePatterns: string[]
): Promise<number> => {
  let first = true
  let results = new Set<string>()
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
    include: config.get('include', '**'),
    exclude: config.get('exclude', ''),
    useGitignore: config.get('useGitignore', true),
  }
}

const countFiles = async (): Promise<number> => {
  const config = getConfig()
  let gitignoredFiles: string[] = []
  if (config.useGitignore) {
    gitignoredFiles = await getGitignoreFiles()
  }
  const include = config.include.split(',')
  const exclude = config.exclude.split(',').concat(gitignoredFiles)
  return getNumOfFiles(include, exclude)
}

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    'file-count.showNumOfFiles',
    async () => {
      const count = await countFiles()
      vscode.window.showInformationMessage(`File Count: ${count.toString()}`)
    }
  )

  context.subscriptions.push(disposable)
}

export function deactivate(): void {}
