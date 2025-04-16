const vscode = require('vscode');
const { exec } = require('child_process');

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.pushToVercel', () => {
        const terminal = vscode.window.createTerminal('Vercel Push');
        terminal.sendText('git add .');
        terminal.sendText('git commit -m "trigger Vercel redeploy"');
        terminal.sendText('git push');
        terminal.show();
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}; 