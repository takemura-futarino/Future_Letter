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
        //letter_showApi()関数の呼び出し
        await letter_showApi(accessToken);

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

//------- 手紙を既読状態にする -------
async function letter_showApi(accessToken) {
    try {
        // URLからvalueデータ値を受け取る　// myself_postページから飛ばないとvalueを取得できない
        const urlParams = await new URLSearchParams(window.location.search);
        const value = await urlParams.get('value');
        console.log(value);

        const getLetter = await fetch(`https://dev.2-rino.com/api/v1/letter/${value}/`,{
            headers:{
                Authorization: `Bearer ${accessToken}`
            }
        });
        const postdata = await getLetter.json();
        console.log(postdata);

        //JSONデータを記入する
        const Partner = document.querySelector('.partner');
        const Thought = document.querySelector('.thought');
        const Me = document.querySelector('.me');
        const Days = document.querySelector(".days");
        
        // 内容は？
        Thought.textContent = postdata.data.result.content;
        // 日付は？
        const newDateinfo = postdata.data.result.send_at;
        // Dateオブジェクトを作成して日付文字列を解析
        var dateObject = new Date(newDateinfo);
        // 年、月、日を取得
        var year = dateObject.getFullYear();
        var month = dateObject.getMonth() + 1; // 月は0から11で表されるため、1を加える
        var day = dateObject.getDate();
        // フォーマットした日付文字列を作成
        var formattedDateString = year + "年" + month + "月" + day + "日";
        Days.textContent = formattedDateString;

    } catch(error) {
        console.error(error);
    }
}


