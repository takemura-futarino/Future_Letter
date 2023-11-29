// ページ読み込み後の2秒遅延表示設定
window.addEventListener("load", function() {
    setTimeout(function() {
        document.body.style.opacity = "1";
    }, 2000);  // 2000ミリ秒 = 2秒
});


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
    console.log(accessToken); 
    // callApi()関数の呼び出し
    await callApi(accessToken);
    // linkage()関数の呼び出し
    await linkage(accessToken);
    // piker()関数の呼び出し
    await  picker();

    let partnerData = await partnerUser(accessToken);
        if(partnerData.data.partner_user){
            // 連携完了ページに遷移
            window.location.href = ("https://liff.line.me/2000014015-QqLAlNmW/completed/index.html");
            return ;
        }
    }
})
.catch((err) => {
// 初期化中にエラーが発生します
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


//--------パートナー連携するための招待URLを発行-------
async function linkage(accessToken) {
    // async関数の中でawaitキーワードを使う
    try {
        // fetchメソッドでAPIのURLを指定してリクエストを送る
        const partres = await fetch("https://dev.2-rino.com/api/v1/invite_url",{
            headers:{
                Authorization: `Bearer ${accessToken}`
            }
        });
        // レスポンスからjsonメソッドでデータを取り出す
        const partResData = await partres.json();
        console.log(partResData.data);

        //パートナー連携URLを代入する
        let partnerUrl = partResData.data.invite_url;
        // <a>タグのhref属性にURLを代入する
        document.querySelector(".inviteArea a").href = partnerUrl;
        document.getElementById("urlLink").textContent = partnerUrl;
        // document.querySelector(".inviteArea a").textContent = partnerUrl;

    } catch (error) {
      // エラーが発生した場合は、コンソールに出力する
        console.error(error);
    }
}


//--------パートナー連携しているか確認する-------
async function partnerUser(accessToken) {
    try {
        const getUser = await fetch("https://dev.2-rino.com/api/v1/user",{
        headers:{
            Authorization: `Bearer ${accessToken}`
        }
    });
    const partnerData = await getUser.json();
    console.log(partnerData.data);
    return partnerData;
    } catch (error) {
      // エラーが発生した場合は、コンソールに出力する
        console.error(error);
    }
}


// --------shareTargetPicker（LIFFで用意されているAPI）-------
async function picker() {
    try {
        const friends = document.getElementById('shareTargetPicker');
        // console.log(friends.outerHTML);
        friends.addEventListener("click", async function() {
            console.log("クリックしました");
            if (liff.isApiAvailable('shareTargetPicker')) {
                const linkText = document.querySelector(".inviteArea a").href;
                console.log(linkText);
                await liff.shareTargetPicker([{
                    'type': 'text',
                    'text': '【フタリノの招待URL】\n以下のリンクをクリックして、パートナー登録をしてね！\n'+ linkText
                }])
                .then(() => {
                    console.log("ShareTargetPicker was launched");
                })
                .catch((res) => {
                    console.log("Failed to launch ShareTargetPicker");
                });
                // console.log("shareTargetPicker:",liff.shareTargetPicker());
            }
        });
    }  catch (error) {
        console.error('Error: ' + error);
    }
}


