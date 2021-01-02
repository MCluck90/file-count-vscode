import * as vscode from 'vscode'
import * as fs from 'fs'

interface Config {
  include: string
  exclude: string
  useGitignore: boolean
}

export const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> => {
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

const getCustomCount = async (): Promise<number> => {
  const include =
    (await vscode.window.showInputBox({
      prompt: 'Glob(s) of files to include',
      value: '**',
    })) || '**'
  const exclude =
    (await vscode.window.showInputBox({
      prompt: 'Glob(s) of files to exclude',
      value: '',
    })) || ''
  return getNumOfFiles(include.split(','), exclude.split(','))
}

const reportCounting = (countFn: () => Thenable<number>): Thenable<number> =>
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Counting files...',
      cancellable: true,
    },
    countFn
  )

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('file-count.showNumOfFiles', async () => {
      const count = await reportCounting(countFiles)
      vscode.window.showInformationMessage(`File Count: ${count.toString()}`)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'file-count.insertNumOfFiles',
      async (textEditor) => {
        const count = await reportCounting(countFiles)
        textEditor.edit((edit) => {
          edit.insert(textEditor.selection.start, count.toString())
        })
      }
    )
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'file-count.showNumOfFilesCustom',
      async () => {
        const count = await reportCounting(getCustomCount)
        vscode.window.showInformationMessage(`File Count: ${count.toString()}`)
      }
    )
  )

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'file-count.insertNumOfFilesCustom',
      async (textEditor) => {
        const count = await reportCounting(getCustomCount)
        textEditor.edit((edit) => {
          edit.insert(textEditor.selection.start, count.toString())
        })
      }
    )
  )
}

export function deactivate(): void {}
