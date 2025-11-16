/*****************************



*****************************/

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");

const BongoState = {
    IDLE: "idle",
    ANGRY: "angry",
    SHOTGUN: "shotgun"
};

const shotgunText = ["acsdk;l,o/e", "ipajk;mdscl", "iaepljk;dcmfs", "iajk;M<EDSCq,plc", "[piokqwd3er", "sadfciojklm"];
const keyword = [
    {key: {full: '오빠', parital: '오' }, return: ['아', '저', '씨'] },
    {key: {full:'onichan', partial: 'oni' }, return: ['아', '저', '씨'] },
    {key: {full: '나츠키', partial: '나츠' }, return: ['아', '줌', '마'] },
    {key: {full: '오니',  partial: '오' }, return: ['아', '줌', '마'] },
    {key: {full: '오버더월',  partial: '오버' }, return: ['오', '바', '다', '월', '드'] },
    {key: {full: '테리',  partial: '테' }, return: ['꼰', '대'] },
    {key: {full: '온하루', partial: '온'}, return: ['옹', '하', '루'] },
    {key: {full: '아테', partial: '김아'}, return: ['노', '란', '거'] },
    {key: {full: '오소리', partial: '오소'}, return: ['소리소리', '오토노', '소리'] } 
];

// ----------------------------------------------------------------
// extention 활성화 시 실행 함수
// ----------------------------------------------------------------
function activate({ subscriptions, extensionUri }) {
    // commend 등록
    subscriptions.push(vscode.commands.registerCommand('bongohane.bongohane', () => {
        // window 생성
        const panel = vscode.window.createWebviewPanel('bongohane', 'Bongo Hane', vscode.ViewColumn.Two, { enableScripts: true });
        
        // img uri 로드
        const bongo_IDLE_0_Path = vscode.Uri.joinPath(extensionUri, 'media', 'BongoHane_IDLE_0.png'); const bongo_IDLE_0_Uri = panel.webview.asWebviewUri(bongo_IDLE_0_Path);
        const bongo_IDLE_1_Path = vscode.Uri.joinPath(extensionUri, 'media', 'BongoHane_IDLE_1.png'); const bongo_IDLE_1_Uri = panel.webview.asWebviewUri(bongo_IDLE_1_Path);
        const bongo_IDLE_2_Path = vscode.Uri.joinPath(extensionUri, 'media', 'BongoHane_IDLE_2.png'); const bongo_IDLE_2_Uri = panel.webview.asWebviewUri(bongo_IDLE_2_Path);
        const bongo_ANGRY_0_Path = vscode.Uri.joinPath(extensionUri, 'media', 'BongoHane_ANGRY_0.png'); const bongo_ANGRY_0_Uri = panel.webview.asWebviewUri(bongo_ANGRY_0_Path);
        const bongo_ANGRY_1_Path = vscode.Uri.joinPath(extensionUri, 'media', 'BongoHane_ANGRY_1.png'); const bongo_ANGRY_1_Uri = panel.webview.asWebviewUri(bongo_ANGRY_1_Path);
        const bongo_ANGRY_2_Path = vscode.Uri.joinPath(extensionUri, 'media', 'BongoHane_ANGRY_2.png'); const bongo_ANGRY_2_Uri = panel.webview.asWebviewUri(bongo_ANGRY_2_Path);
        const bongo_SHOTGUN_1_Path = vscode.Uri.joinPath(extensionUri, 'media', 'BongoHane_SHOTGUN_1.png'); const bongo_SHOTGUN_1_Uri = panel.webview.asWebviewUri(bongo_SHOTGUN_1_Path);
        const bongo_SHOTGUN_2_Path = vscode.Uri.joinPath(extensionUri, 'media', 'BongoHane_SHOTGUN_2.png'); const bongo_SHOTGUN_2_Uri = panel.webview.asWebviewUri(bongo_SHOTGUN_2_Path);
        const bongoFrameGenerator = getBongoState(); bongoFrameGenerator.next();
        
        // squence event
        let activeTimeouts = [];
        let sequenceID = 0;

        function process(editor, sequence, panel, sequenceId) {
            // clear current timeouts
            activeTimeouts.forEach(timer => clearTimeout(timer));
            activeTimeouts = [];

            if (sequenceId !== sequenceID) return; 
            
            let state = sequence.state;
            let typing = sequence.typing;
            let backspace = sequence.backspace;

            let delayBackspace = 50;
            let delayTyping = 100;

            let delay = 100;
            
            // backspace
            for (let i=0; i<backspace; i++) {
                const timer = setTimeout(() => {
                    if (sequenceId !== sequenceID) return; 
                    
                    panel.webview.postMessage(state);
                    editor.edit(editBuilder => {
                        const startPosition = editor.selection.active.with({ character: editor.selection.active.character - 1 });
                        const rangeToDelete = new vscode.Range(startPosition, editor.selection.active);
                        editBuilder.delete(rangeToDelete);
                    });
                }, delay);

                activeTimeouts.push(timer);
                delay += delayBackspace;
            }

            // typing
            if (typing.length == 0) { 
                panel.webview.postMessage(state);
                return 
            } else {
                for (const ch of typing) {
                    const timer = setTimeout(() => {
                        if (sequenceId !== sequenceID) return; 
    
                        panel.webview.postMessage(state);
                        editor.edit(editBuilder => {
                            editBuilder.insert(editor.selection.active, ch);
                        });
                    }, delay);
    
                    activeTimeouts.push(timer);
                    delay += delayTyping;
                }
            }
            
            if (state == BongoState.SHOTGUN) {
                const timer = setTimeout(() => {panel.dispose()}, delay + delayTyping);
                activeTimeouts.push(timer);  
                delay += delayTyping;
            } else {
                const timer = setTimeout(() => {panel.webview.postMessage(BongoState.IDLE)}, delay + delayTyping);
                activeTimeouts.push(timer);  
                delay += delayTyping;
            }
        }

        // html 설정
        panel.webview.html = getWebviewContent(
            bongo_IDLE_0_Uri, 
            bongo_IDLE_1_Uri, 
            bongo_IDLE_2_Uri, 
            bongo_ANGRY_0_Uri,
            bongo_ANGRY_1_Uri, 
            bongo_ANGRY_2_Uri, 
            bongo_SHOTGUN_1_Uri, 
            bongo_SHOTGUN_2_Uri
        );
        
        // triger
        let typeCommand = vscode.commands.registerCommand('type', async (...args) => {
            await vscode.commands.executeCommand('default:type', ...args);

            const editor = vscode.window.activeTextEditor;
            if (!editor) return;
            sequenceID++;
            
            const position = editor.selection.active;
            const lineText = editor.document.lineAt(position.line).text;
            
            
            // Bongo 상태 계산
            const nextState = bongoFrameGenerator.next(lineText).value;
            // update
            process(editor, nextState, panel, sequenceID);
        });
        
        subscriptions.push(typeCommand);
        
        // disable
        panel.onDidDispose(() => {
            typeCommand.dispose();
        }, null, subscriptions);
    }));
}
exports.activate = activate;

// ----------------------------------------------------------------
// HTML
// ----------------------------------------------------------------
function getWebviewContent(
            bongo_IDLE_0_Uri, 
            bongo_IDLE_1_Uri, 
            bongo_IDLE_2_Uri, 
            bongo_ANGRY_0_Uri,
            bongo_ANGRY_1_Uri, 
            bongo_ANGRY_2_Uri, 
            bongo_SHOTGUN_1_Uri, 
            bongo_SHOTGUN_2_Uri
        ) {
    return `
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Bongo Cat</title>
		</head>
		<body>
			<img id="IDLE_0" src=${bongo_IDLE_0_Uri} width="100%"/>
			<img id="IDLE_1" src=${bongo_IDLE_1_Uri} width="100%" hidden/>
			<img id="IDLE_2" src=${bongo_IDLE_2_Uri} width="100%" hidden/>
			<img id="ANGRY_0" src=${bongo_ANGRY_0_Uri} width="100%" hidden/>
			<img id="ANGRY_1" src=${bongo_ANGRY_1_Uri} width="100%" hidden/>
			<img id="ANGRY_2" src=${bongo_ANGRY_2_Uri} width="100%" hidden/>
			<img id="SHOTGUN_1" src=${bongo_SHOTGUN_1_Uri} width="100%" hidden/>
			<img id="SHOTGUN_2" src=${bongo_SHOTGUN_2_Uri} width="100%" hidden/>
		</body>
		<script>
            const IDLE_0 = document.getElementById('IDLE_0');
            const IDLE_1 = document.getElementById('IDLE_1');
            const IDLE_2 = document.getElementById('IDLE_2');
            const ANGRY_0 = document.getElementById('ANGRY_0');
            const ANGRY_1 = document.getElementById('ANGRY_1');
            const ANGRY_2 = document.getElementById('ANGRY_2');
            const SHOTGUN_1 = document.getElementById('SHOTGUN_1');
            const SHOTGUN_2 = document.getElementById('SHOTGUN_2');

			let timeout;
            let hand = 0;
            let delay = 50;

			window.addEventListener('message', event => {
				const message = event.data;
				clearTimeout(timeout);

                
                hand = 1 + (hand % 2);

                // animation
				if(message == 'idle'){
                    if (hand == 1) {
                        IDLE_0.hidden = true;
                        IDLE_1.hidden = false;
                        IDLE_2.hidden = true;
                        ANGRY_0.hidden = true;
                        ANGRY_1.hidden = true;
                        ANGRY_2.hidden = true;
                        SHOTGUN_1.hidden = true;
                        SHOTGUN_2.hidden = true;
                    } else {
                        IDLE_0.hidden = true;
                        IDLE_1.hidden = true;
                        IDLE_2.hidden = false;
                        ANGRY_0.hidden = true;
                        ANGRY_1.hidden = true;
                        ANGRY_2.hidden = true;
                        SHOTGUN_1.hidden = true;
                        SHOTGUN_2.hidden = true;    
                    }

                    timeout = setTimeout(() => {
                        IDLE_0.hidden = false;
                        IDLE_1.hidden = true;
                        IDLE_2.hidden = true;
                        ANGRY_0.hidden = true;
                        ANGRY_1.hidden = true;
                        ANGRY_2.hidden = true;
                        SHOTGUN_1.hidden = true;
                        SHOTGUN_2.hidden = true;
                    }, delay);

				} else if(message == 'angry'){
                    if (hand == 1) {
                        IDLE_0.hidden = true;
                        IDLE_1.hidden = true;
                        IDLE_2.hidden = true;
                        ANGRY_0.hidden = true;
                        ANGRY_1.hidden = false;
                        ANGRY_2.hidden = true;
                        SHOTGUN_1.hidden = true;
                        SHOTGUN_2.hidden = true;
                    } else {
                        IDLE_0.hidden = true;
                        IDLE_1.hidden = true;
                        IDLE_2.hidden = true;
                        ANGRY_0.hidden = true;
                        ANGRY_1.hidden = true;
                        ANGRY_2.hidden = false;
                        SHOTGUN_1.hidden = true;
                        SHOTGUN_2.hidden = true;
                    }
                    
                    timeout = setTimeout(() => {
                        IDLE_0.hidden = true;
                        IDLE_1.hidden = true;
                        IDLE_2.hidden = true;
                        ANGRY_0.hidden = false;
                        ANGRY_1.hidden = true;
                        ANGRY_2.hidden = true;
                        SHOTGUN_1.hidden = true;
                        SHOTGUN_2.hidden = true;
                    }, delay);

                } else if (message == 'shotgun'){
                    IDLE_0.hidden = true;
                    IDLE_1.hidden = true;
                    IDLE_2.hidden = true;
                    ANGRY_0.hidden = true;
                    ANGRY_1.hidden = true;
                    ANGRY_2.hidden = true;
                    SHOTGUN_1.hidden = true;
                    SHOTGUN_2.hidden = false;

                    timeout = setTimeout(() => {
                        IDLE_0.hidden = true;
                        IDLE_1.hidden = true;
                        IDLE_2.hidden = true;
                        ANGRY_0.hidden = true;
                        ANGRY_1.hidden = true;
                        ANGRY_2.hidden = true;
                        SHOTGUN_1.hidden = false;
                        SHOTGUN_2.hidden = true;
                    }, delay);
                }
			});
		</script>
	</html>`;
}

// ----------------------------------------------------------------
// main
// ----------------------------------------------------------------
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

function getNextTyping(state, line) {
    if (state == BongoState.SHOTGUN) return { backspace: 0, typing: shuffleArray(shotgunText)};

    for (const key of keyword) {
        let k = key.key.full;
        let k_partial = key.key.partial;

        let target = (state == BongoState.IDLE) ? k : k_partial;
        let p = line.indexOf(target);
        if (p == -1) continue;
        
        return { backspace: line.length - p, typing: key.return };
    }

    return { backspace: 0, typing: []};
}

function* getBongoState() {
    let state = BongoState.IDLE;
    let line = yield { state: state, text: [], backspace: 0};
    let feathers = 0;

    while (true) {
        let typing = getNextTyping(state, line);

        if (typing.typing.length == 0) feathers = 0;
        else feathers++; 
        
        if (feathers > 5) state = BongoState.SHOTGUN;
        else if (feathers > 0) state = BongoState.ANGRY;
        else state = BongoState.IDLE;


        line = yield { 
            state: state, 
            typing: typing.typing, 
            backspace: typing.backspace
        };
    }
}
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;