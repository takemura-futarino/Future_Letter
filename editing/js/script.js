//------- サーバー環境によってコンソール表示を制御-------
const allowedHostnames = ['localhost', '127.0.0.1', 'roca-inc.jp'];

if (!allowedHostnames.includes(window.location.hostname)) {
    console.log = function() {};
    console.info = function() {};
    // 必要に応じて他のメソッドも無効化
}

//　ローカルホストからデータを引っ張ってきた
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
        await tool();

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
            let selectedValue = selectElement.value;
            console.log("選択された値:", selectedValue);

            if (selectedValue === "2" && name.data.partner_user === null) {
                // 選択を無効にする
                selectElement.selectedIndex = -1;
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

// //----------手紙送信のAPI---------------
async function send(accessToken) {
    const formBtn = document.querySelector('#form-btn');
    formBtn.addEventListener('click', async function(event) {
        event.preventDefault();

        const str = document.querySelector('#send_to').value; // valueで得たデータは全て文字列で返ってくるため、数値に変換する必要がある
        let send_to = parseInt(str, 10); // 数値に変換するプログラム
        const content = document.querySelector('#content').value;
        const sendDay = document.querySelector("#send_day").value;
        console.log(sendDay);
        const sendTime = document.querySelector('#myButton').textContent;
        const send_at = sendDay + sendTime;

        // 今日の日付を取得
        const today = moment();
        // sendDayをDateオブジェクトに変換
        const sendDayDate = moment(sendDay, 'YYYY-MM-DD');

        // すべての項目が入力されているかのチェック
        if (str.trim() === '' || content.trim() === '' || sendDay.trim() === '' || sendTime.trim() === '' ) {
            alert('全ての項目を入力してください');
            return;
        } 
        // 日付が今日から一年以内かのチェック
        else if (!sendDayDate.isValid() || sendDayDate.isBefore(today) || sendDayDate.diff(today, 'years') >= 1) {
            alert('日付は今日から一年以内に設定してください')
            return;
        }
        else {
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

                modalWindow('2');

            } catch (error) {
                // エラーハンドリング
                console.error(error.code, err.message);
                return null;
            }
        }
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

    // 一時保存の場合
    if (Id === "0") {
        let Content = "<div class='modal_content'><img src='image/black_save.png' alt='保存確認のマーク'><h1 class='blue_save'>保存しました</h1></div><button id='close'>>ホームへ</button>";
        modal.innerHTML = Content;
        console.log(modal);

        const close = document.querySelector("#close");
        console.log(close);

        close.addEventListener('click', () => {
            sentMessage("0");
            liff.closeWindow();
        });

        mask.addEventListener('click', () => {
            sentMessage("0");
            liff.closeWindow();
        });
    }
    // パートナー連係が出来ていない場合
    else if (Id === "1") {
        let Content = "<div id='close' style='text-align: left;'>✕</div><div class='modal_content'><img src='image/warning.png' alt='注意！パートナー連係していません'><h1 class='h1_kome'>注意!</h1><p><span>相手に</span><span>コトノハをおくるには</span><span>ペア登録が必要です。</span></p><a href='https://liff.line.me/2000014015-QqLAlNmW/linkage/' class='send_link'>ペア登録に進む</a></div>";
        modal.innerHTML = Content;
        console.log(modal);

        const close = document.querySelector("#close");
        console.log(close);

        close.addEventListener('click', () => {
            modal.animate(hideKeyframes, options);
            mask.animate(hideKeyframes, options);
        });

        mask.addEventListener('click', () => {
            modal.animate(hideKeyframes, options);
            mask.animate(hideKeyframes, options);
        });
    } 
    // コトノハを送ったとき
    else if (Id === "2") {
        let Content = "<div class='modal_content'><img src='image/black_letter.png' alt='送信が完了しました'><h1 class='h1_kome'>コトノハを寝かせました…</h1><p><span>変更・キャンセルは</span><span>寝かせ中のコトノハで操作できます</span></p><button id='close'>>ホームへ</button></div>";
        modal.innerHTML = Content;
        console.log(modal);

        const close = document.querySelector("#close");
        console.log(close);

        close.addEventListener('click', () => {
            sentMessage("2");
            liff.closeWindow();
        });

        mask.addEventListener('click', () => {
            sentMessage("2");
            liff.closeWindow();
        });
    }
    // 手持ちのコトノハがなかった場合
    else if (Id === "3") {
        let Content = " <div id='close' style='text-align: left;'>✕</div><div class='modal_content'><p style='padding-top: 30px;'>手持ちのコトノハがありません</p><a href='https://liff.line.me/2000014015-QqLAlNmW/purchase_screen/' class='send_link'>コトノハを購入する</a></div>";
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
function sentMessage(Id) {
    try {
        // 一時保存の場合
        if (Id === "0") {
            liff.sendMessages([
                {
                    type: "text",
                    text: "一時保存しました",
                },
            ]);
    
            console.log("message sent");
        }
        // コトノハを送った場合
        else if (Id === "2") {
            liff.sendMessages([
                {
                    type: "text",
                    text: "コトノハを送りました",
                },
            ]);
    
            console.log("message sent");
        }

    } catch (error) {
        // エラーハンドリング
        console.error(error.code, err.message);
        return null;
    }
}

// ----------ツールチップの表示-----------
async function tool() {
    try {
        const myButton = document.querySelector("#myButton");
        const tooltip = document.querySelector("#tooltip");

        let tooltipVisible = false;

        myButton.addEventListener('click', async (event) => {
            event.preventDefault();
            // tooltipVisible の中身が true(ある) なら
            if (tooltipVisible) {
                hideTooltip();
            // tooltipVisible の中身が false(ない) なら
            } else {
                await showTooltip();
                await getlistitem();
            }
            });

        function showTooltip() {
        
            // ツールチップの位置を設定
            tooltip.style.bottom = 0;
            tooltip.style.right = 0;
        
            // ツールチップを表示
            tooltip.style.display = "block";
            tooltipVisible = true;
        
        }

        function hideTooltip() {
            tooltip.style.display = "none";
            tooltipVisible = false;
        }

        function getlistitem() {
            const tooltipList = document.querySelector('#tooltipList')

            tooltipList.addEventListener('click', (event) => {
                if (event.target.tagName === 'LI') {
                    const clickedItemContent = event.target.textContent;
                    console.log(clickedItemContent);
                    myButton.textContent = clickedItemContent;
                }
                hideTooltip();
            });
        }

    } catch (error) {
        console.error(error.code, err.message);
    }
}




