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
        // //get_userApi()関数の呼び出し
        // const userName = await get_userApi(accessToken);
        // console.log(userName);
        // //getSelectedValue()関数の呼び出し
        // await getSelectedValue();
        //send()関数の呼び出し
        await send(accessToken);

    }
})
.catch((err) => {
    //初期化中にエラーが発生します
    console.error(err.code, err.message);
});

// //---------モーダルウィンドウを表示させる関数------------
// async function modalWindow() {
//     const close = document.querySelector('#close');
//     const modal = document.querySelector('#modal');
//     const mask = document.querySelector('#mask');
//     const showKeyframes = {
//         opacity: [0,1],
//         visibility: 'visible',
//     };
//     const hideKeyframes = {
//         opacity: [1,0],
//         visibility: 'hidden',
//     };
//     const options = {
//         duration: 800,
//         easing: 'ease',
//         fill: 'fowards',
//     };

//     modal.animate(showKeyframes, options);
//     mask.animate(showKeyframes, options);

//     close.addEventListener('click', () => {
//         modal.animate(hideKeyframes, options);
//         mask.animate(hideKeyframes, options);
//     });

//     mask.addEventListener('click', () => {
//         close.click();
//     });
// }


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

// //-------- ユーザーとパートナーの名前取得 ---------
// async function get_userApi(accessToken) {
//     try {
//         const getuser = await fetch("https://dev.2-rino.com/api/v1/user",{
//             headers:{
//                 Authorization: `Bearer ${accessToken}`
//             }
//         });
//         const name = await getuser.json();
//         console.log(name);
//         return name;

//     } catch(error) {
//         console.error(error);
//     }
// }



// //--------パートナー連係をしていない状態でのパートナー選択の禁止----------
// async function getSelectedValue() {
//     // select要素を取得
//     const selectElement = document.getElementById('send_to');
    
//     // 選択されたオプションのvalue属性の値を取得
//     const selectedValue = selectElement.value;

//     // 取得した値をコンソールに表示（任意の処理に変更可能）
//     console.log("選択された値:", selectedValue);

//     // パートナー連係していないユーザーが宛先にパートナを選んだ場合
//     // if (userName.data.partner_user === null) {
//     //     if (selectedValue === "2") {
//     //         modalWindow();
//     //     }
//     // }
//   }

//----------手紙送信のAPI---------------
async function send(accessToken) {
    const decision_btn = document.querySelector('#decision-btn');
        decision_btn.addEventListener('click', async function(event) {
            event.preventDefault();

        const str = document.querySelector('#send_to').value; // valueで得たデータは全て文字列で返ってくるため、数値に変換する必要がある
        let send_to = parseInt(str, 10); // 数値に変換するプログラム
        console.log(send_to);
        const content = document.querySelector('#content').value;
        const sendDay = document.querySelector("#send_day").value;
        const sendTime = document.querySelector('#send_time').value;
        const send_at = sendDay + sendTime;

        try {
            const sendApi = await fetch(
                `https://dev.2-rino.com/api/v1/letter/`,{
                    method: "POST",
                    headers: {
                        Authorization : `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'  // JSON形式のデータを送信する場合に必要
                    },
                    body: JSON.stringify({
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
        // クリックイベントが発生した後にウィンドウを閉じる
        // liff.closeWindow();
        }
    );
}