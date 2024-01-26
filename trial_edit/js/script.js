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
        //has_Firstletter()関数の呼び出し
        await has_Firstletter(accessToken);
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

//---------初回レターの有無の確認----------
async function has_Firstletter(accessToken) {
    try {
        const first_letter = await fetch("https://dev.2-rino.com/api/v1/has_first_letter/", {
            headers:{
                Authorization: `Bearer ${accessToken}`
            }
        });
        const check = await first_letter.json();
        console.log(check);

        if (check.data.result === "no") {
            modalWindow("1");
        }

    } catch(error) {
        console.error(error);
    }
}



//----------手紙送信のAPI---------------
async function send(accessToken) {
    const formBtn = document.querySelector('#form-btn');
    formBtn.addEventListener('click', async function(event) {
        event.preventDefault();

        const content = document.querySelector('#content').value;

        // すべての項目が入力されているかのチェック
        if (content.trim() === '') {
            alert('全ての項目を入力してください。');
            return;
        } 

        try {
            const sendApi = await fetch(
                `https://dev.2-rino.com/api/v1/first_letter/`,{
                    method: "POST",
                    headers: {
                        Authorization : `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'  // JSON形式のデータを送信する場合に必要
                    },
                    body: JSON.stringify({
                        content: content,
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

        modalWindow('0');
        }
    );
}

//---------モーダルウィンドウを表示させる関数------------

function modalWindow(Id) {
    let modal = document.querySelector("#modal");
    const mask = document.querySelector("#mask");
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

    // 初回コトノハ送信の場合
    if (Id === "0") {
        let Content = "<div class='modal_content'><img src='image/black_letter.png' alt='送信が完了しました'><h1 class='h1_kome'>コトノハを寝かせました…</h1><p><span>変更・キャンセルは</span><span>寝かせ中のコトノハで操作できます</span></p><button id='close'>>ホームへ</button></div>";
        modal.innerHTML = Content;
        console.log(modal);

        const close = document.querySelector("#close");
        console.log(close);

        close.addEventListener('click', () => {
            sentMessage();
            liff.closeWindow();
        });

        mask.addEventListener('click', () => {
            sentMessage();
            liff.closeWindow();
        });
    }
    // 初回コトノハがない場合
    else if (Id === "1") {
        let Content = "<div id='close' style='text-align: left;'>✕</div><div class='modal_content'><img src='image/warning.png' alt='注意！パートナー連係していません'><h1 class='h1_kome'>注意!</h1><p>初回コトノハは既に使用済みです</p></div>";
        modal.innerHTML = Content;
        console.log(modal);

        const close = document.querySelector("#close");
        console.log(close);

        close.addEventListener('click', () => {
            liff.closeWindow();
        });

        mask.addEventListener('click', () => {
            liff.closeWindow();
        });
    } 
}


//----------メッセージを送信-----------
function sentMessage() {
    try {
        liff.sendMessages([
            {
                type: "text",
                text: "初めてのコトノハを送りました",
            },
        ]);

        console.log("message sent");

    } catch (error) {
        // エラーハンドリング
        console.error(error.code, err.message);
        return null;
    }
}

