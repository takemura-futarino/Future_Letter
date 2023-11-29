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
    await linkPartner(accessToken);
    }
})
.catch((err) => {
// 初期化中にエラーが発生します
console.error(err.code, err.message);
});

//-------パートナー連携するAPI-------
async function linkPartner(accessToken) {
    try {
        let line_access_token = accessToken;//相手のアクセストークンにする
        console.log(line_access_token);
        // 相手が受け取った URL から invite_tokenとline_acccesToken を取得
        let url = window.location.href;
        let inviteToken = new URL(url).searchParams.get("token");
        let invite_token = inviteToken;
        console.log(invite_token);
        const partnerApi = await fetch(
            `https://dev.2-rino.com/api/v1/relation?line_access_token=${line_access_token}&invite_token=${invite_token}`,{
                method: "POST"
            }
        );
        // レスポンスオブジェクトから JSON データを抽出
        const partnerJson = await partnerApi.json();
        console.log(partnerJson); // JSON データをコンソールに出力
    } catch (error) {
        // エラーハンドリング
        console.error(error.code, err.message);
        return null;
    }
}