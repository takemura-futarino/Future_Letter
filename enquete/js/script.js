//------- サーバー環境によってコンソール表示を制御-------
const allowedHostnames = ['localhost', '127.0.0.1', 'roca-inc.jp'];

if (!allowedHostnames.includes(window.location.hostname)) {
    console.log = function() {};
    console.info = function() {};
    // 必要に応じて他のメソッドも無効化
}


// LIFFの初期化を行う
liff
.init({
// 自分のLIFF IDを入力する
liffId: "2000014015-QqLAlNmW"
}).then(async() => { // 初期化完了. 以降はLIFF SDKの各種メソッドを利用できる

if(!liff.isLoggedIn() && !liff.isInClient()) {
    liff.login();
} else {
    // ユーザーのLINEアカウントのアクセストークンを取得
    let accessToken = liff.getAccessToken();
    await fetch(`https://dev.2-rino.com/api/v1/is_registed?line_access_token=${accessToken}`);
    console.log(accessToken); 
    await enquete(accessToken);
    }
})
.catch((err) => {
// 初期化中にエラーが発生します
console.error(err.code, err.message);
});

//-------アンケート回答のAPI-------
async function enquete(accessToken) {
    let line_access_token = accessToken;//相手のアクセストークンにする

    document.querySelector('form').addEventListener('submit', async function(event) {
        event.preventDefault();

    const name = document.getElementById('name').value;
    const gender = document.getElementById('gender').value;
    const birthday = document.getElementById('birthday').value;
    const pref = document.getElementById('pref').value;
    const state = document.getElementById('state').value;
    const accept = document.getElementById('accept').checked;

    // すべての項目が入力され、チェックボックスがオンになっていることを確認します
    if (name.trim() === '' || gender.trim() === '' || birthday.trim() === '' || pref.trim() === '' || state.trim() === '' || !accept) {
        alert('全ての項目を入力してください。');
        return;
    }

    try {
        const enqueteApi = await fetch(
            `https://dev.2-rino.com/api/v1/user`,{
                method: "POST",
                headers: {
                    Authorization : `Bearer ${line_access_token}`,
                    'Content-Type': 'application/json'  // JSON形式のデータを送信する場合に必要
                },
                body: JSON.stringify({  // ボディにJSON形式でデータを含める
                    name: name,
                    gender: gender,
                    birthday: birthday,
                    pref: pref,
                    state: state,
                    accept: accept
                })
            });
        console.log(line_access_token);
        // レスポンスオブジェクトから JSON データを抽出
        const response = await enqueteApi.json();
        console.log(JSON.stringify(response));

        // エラーが存在する場合のみ、エラーメッセージを表示
        if (response.errors && response.errors.name) {
            const nameErrors = response.errors.name;
            alert(nameErrors[0]);
        } else {
            console.log(response.data); // JSON データをコンソールに出力
            // alert(response.data.result);
            await sentMessage();
            await liff.closeWindow();
        }
        
        // let debug = document.getElementById("debug");
        // debug.innerText = response;

        } catch (error) {
            // エラーハンドリング
            console.error(error.code, err.message);
            return null;
        }
    });
}

//-------メッセージを送信-------
async function sentMessage() {
    try {
        await liff.sendMessages([
            {
                type: "text",
                text: "回答が完了しました",
            },
        ]);

        console.log("message sent");

    } catch (error) {
        // エラーハンドリング
        console.error(error.code, err.message);
        return null;
    }
}
