//------- サーバー環境によってコンソール表示を制御-------
const allowedHostnames = ['localhost', '127.0.0.1', 'roca-inc.jp'];

if (!allowedHostnames.includes(window.location.hostname)) {
    console.log = function() {};
    console.info = function() {};
    // 必要に応じて他のメソッドも無効化
}

//
document.addEventListener('DOMContentLoaded', () => {
    const JSONData = localStorage.getItem('letterData') 
    const letterData = JSON.parse(JSONData);
    console.log(letterData);

    if (letterData) {
        const send_to = document.querySelector('#send_to');
        const content = document.querySelector('#content');
        const setDate = document.querySelector('#send_day');
        const setTime = document.querySelector('#send_time');

        send_to.value = letterData.address;
        content.value = letterData.content;
        setDate.value = letterData.sendDay;
        setTime.value = letterData.sendTime;

        localStorage.removeItem('letterData');
    }
});

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
        //getSelectedValue()関数の呼び出し
        await getSelectedValue(accessToken);
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

        // 手持ちのレターがない場合
        if (name.data.letter_num === 0) {
            modalWindow('3');
        }

        // select要素を取得
        const selectElement = document.getElementById('send_to');
        selectElement.addEventListener('change', () => {
            const selectedValue = selectElement.value;
            console.log("選択された値:", selectedValue);

            if (selectedValue === "2" && name.data.partner_user === null) {
                // 引数に"1"を指定
                modalWindow('1');
            } else {
                console.log("ok");
            }
        });
   
    } catch(error) {
        console.error(error);
    }
}

//----------手紙送信のAPI---------------
async function send(accessToken) {
    const formBtn = document.querySelector('#form-btn');
    formBtn.addEventListener('click', async function(event) {
        event.preventDefault();

        const str = document.querySelector('#send_to').value; // valueで得たデータは全て文字列で返ってくるため、数値に変換する必要がある
        let send_to = parseInt(str, 10); // 数値に変換するプログラム
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
        modalWindow('2');
        }
    );
}

//---------一時保存の関数-----------
document.querySelector(".saving__btn").addEventListener('click', () => {
    const str = document.querySelector('#send_to').value;
    let send_to = parseInt(str, 10);
    const content = document.querySelector('#content').value;
    const sendDay = document.querySelector("#send_day").value;
    const sendTime = document.querySelector('#send_time').value;

    const array = [];
    const obj = {
        'address':send_to,
        'content':content,
        'sendDay':sendDay,
        'sendTime':sendTime  
    };
    array.push(obj);

    const setjson = JSON.stringify(obj);
    localStorage.setItem('letterData', setjson);

    modalWindow('0');
});

//---------モーダルウィンドウを表示させる関数------------
function modalWindow(Id) {
    const close = document.querySelector(`#modal${Id} #close`);
    console.log (close);
    const modal = document.querySelector(`#modal${Id}`);
    const mask = document.querySelector(`#mask${Id}`);
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
        if (Id === "1") {
            modal.animate(hideKeyframes, options);
            mask.animate(hideKeyframes, options);
        } else {
            liff.closeWindow();
        }
    });

    mask.addEventListener('click', () => {
        if (Id === "1") {
            close.click();
        } else {
            liff.closeWindow();
        }
    });
}

