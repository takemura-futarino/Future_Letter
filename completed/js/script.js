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
    // パートナーのLINEアカウントのアクセストークンを取得
    let accessToken = liff.getAccessToken();
    await fetch(`https://dev.2-rino.com/api/v1/is_registed?line_access_token=${accessToken}`);
    console.log(accessToken); 

    const getUser = await fetch("https://dev.2-rino.com/api/v1/user",{
        headers:{
            Authorization: `Bearer ${accessToken}`
        }
    });
    const partnerData = await getUser.json();
    console.log(partnerData.data);

    document.getElementById('pictureImg').src = partnerData.data.partner_user.line_picture_url;
    document.getElementById('displayName').textContent = partnerData.data.partner_user.line_display_name;

    await release(accessToken);
    }
})
.catch((err) => {
// 初期化中にエラーが発生します
console.error(err.code, err.message);
});

async function release(accessToken) {
    try {
        const releasebtn = document.getElementById('button');
        releasebtn.addEventListener('click', async function() {

            const apiUrl = await fetch("https://dev.2-rino.com/api/v1/room/destroy",{
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const postResponse = await apiUrl.json();
            console.log(postResponse.data);
            alert('パートナー連携を解除しました');

            // クリックイベントが発生した後にウィンドウを閉じる
            liff.closeWindow();
            // console.log("liff.closeWindow()",liff.closeWindow());
        });
    } catch (error) {
        console.error('Error: ' + error);
    }
}

