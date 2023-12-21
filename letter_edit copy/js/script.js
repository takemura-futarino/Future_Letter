//------- サーバー環境によってコンソール表示を制御-------
const allowedHostnames = ['localhost', '127.0.0.1', 'roca-inc.jp'];

if (!allowedHostnames.includes(window.location.hostname)) {
    console.log = function() {};
    console.info = function() {};
    // 必要に応じて他のメソッドも無効化
}

//---------モーダルウィンドウを表示させる関数------------
function modalWindow(Id) {
    const close = document.querySelector(`#modal${Id} #close`);
    console.log (close);
    const modal = document.querySelector(`#modal${Id}`);
    const mask = document.querySelector('#mask');
    const showKeyframes = {
        opacity: [0,1],
        visibility: 'visible',
    };
    const hideKeyframes = {
        opacity: [1,0],
        visibility: 'hidden',
    };
    const options = {
        duration: 800,
        easing: 'ease',
        fill: 'forwards',
    };

    modal.animate(showKeyframes, options);
    mask.animate(showKeyframes, options);

    close.addEventListener('click', () => {
        modal.animate(hideKeyframes, options);
        mask.animate(hideKeyframes, options);
    });

    mask.addEventListener('click', () => {
        close.click();
    });
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
        await getSelectedValue(accessToken);

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

//--------パートナー連係をしていない状態でのパートナー選択の禁止----------
async function getSelectedValue(accessToken) {
    try {
        const getuser = await fetch("https://dev.2-rino.com/api/v1/user",{
            headers:{
                Authorization: `Bearer ${accessToken}`
            }
        });
        const name = await getuser.json();
        console.log(name);

        // select要素を取得
        const selectElement = document.getElementById('send_to');
        selectElement.addEventListener('change', () => {
            const selectedValue = selectElement.value;
            console.log("選択された値:", selectedValue);

            if (selectedValue === "2" && name.data.partner_user === null) {
                modalWindow('1');
            } else {
                console.log("ok");
            }
        });
   
    } catch(error) {
        console.error(error);
    }

}