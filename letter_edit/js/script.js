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
})
.then(async() => { // 初期化完了. 以降はLIFF SDKの各種メソッドを利用できる
    if(!liff.isLoggedIn() && !liff.isInClient()) {
        liff.login();
    } else {
        //ユーザーのLINEアカウントのアクセストークンを取得
        let accessToken = liff.getAccessToken();
        console.log(accessToken);

        //callApi()関数の呼び出し
        await callApi(accessToken);
        //send()関数の呼び出し
        await send(accessToken);

    }
})
.catch((err) => {
    //初期化中にエラーが発生します
    console.error(err.code, err.message);
});


//--------アクセストークンを登録する--------
async function callApi(accessToken) {
    try {
        //パラメータ（line_access_token）を付与するために、クエリ文字列を作成する
        let queryString = `?line_access_token=${accessToken}`;

        //アクセストークンが登録済みか未登録か判定する----------------
        const api = await fetch("https://dev.2-rino.com/api/v1/is_registed" + queryString);
        const res = await api.json();
        console.log(res.data);

        //フタリノに登録していない（false）の場合に実行するAPI
        if (res.data.result === "false") {
            const apiReg = await fetch("https://dev.2-rino.com/api/v1/regist" + queryString);
            const reg = await apiReg.json();
            console.log(reg.data);
        }
    } catch (error) {
        console.error(error);
    }
}

//----------手紙送信のAPI---------------
async function send(accessToken) {
    const form_btn = document.querySelector('#form-btn');
    form_btn.addEventListener('click', async function(event) {
        event.preventDefault();

    const send_to = document.querySelector('#send_to').value;
    const title = document.querySelector('#title').value;
    const content = document.querySelector('#content').value;
    const send_at = document.querySelector('#send_at').innerHTML;

    try {
        const sendApi = await fetch(
            `https://dev.2-rino.com/api/v1/letter/`,{
                method: "POST",
                headers: {
                    Authorization : `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'  // JSON形式のデータを送信する場合に必要
                },
                body: JSON.stringify({
                    title: title,
                    content: content,
                    send_to: send_to,
                    send_at: send_at
                })
            });
        // レスポンスオブジェクトから JSON データを抽出
        const response = await sendApi.json();
        console.log(JSON.stringify(response));
        
    } catch (error) {
        // エラーハンドリング
        console.error(error.code, err.message);
        return null;
    }
    });
}