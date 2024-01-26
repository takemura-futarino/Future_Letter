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

// async function release(accessToken) {
//     try {
//         const releasebtn = document.getElementById('button');
//         releasebtn.addEventListener('click', async function() {

//             const apiUrl = await fetch("https://dev.2-rino.com/api/v1/room/destroy",{
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${accessToken}`,
//                 },
//             });
//             const postResponse = await apiUrl.json();
//             console.log(postResponse.data);
//             alert('パートナー連携を解除しました');

//             // クリックイベントが発生した後にウィンドウを閉じる
//             liff.closeWindow();
            
//         });
//     } catch (error) {
//         console.error('Error: ' + error);
//     }
// }

async function release(accessToken) {
    const releasebtn = document.getElementById('button');

    releasebtn.addEventListener('click', () => {
        modalWindow(accessToken);
    });
}

//---------モーダルウィンドウを表示させる関数------------
function modalWindow(accessToken) {
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

    let Content = "<div class='modal_content'><img src='image/warning.png' alt='危険のマーク'><h1 class='blue_save'>本当に？解除しますか</h1><p><span>ペア登録を解除すると</span><span>相手からもらったコトノハは</span><span>すべて消えてしまいます</span></p></div><div class='cancel_btn'><button id='cancel'>キャンセル</buttton><button id='close'>解除</button></div>";
    modal.innerHTML = Content;
    console.log(modal);

    const close = document.querySelector("#close");
    console.log(close);
    const cancel = document.querySelector("#cancel");
    console.log(cancel);

    close.addEventListener('click', async() => {
        try {
            const apiUrl = await fetch("https://dev.2-rino.com/api/v1/room/destroy",{
                method: 'POST',
                headers: {
                        'Authorization': `Bearer ${accessToken}`,
                },
            });
            const postResponse = await apiUrl.json();
            console.log(postResponse.data);
            alert('パートナー連携を解除しました');

            closeWindow();

        } catch(error) {
                console.error(error);
        }
    });

    cancel.addEventListener('click', () => {
        modal.animate(hideKeyframes, options);
        mask.animate(hideKeyframes, options);
    });

    mask.addEventListener('click', () => {
        modal.animate(hideKeyframes, options);
        mask.animate(hideKeyframes, options);
    });
    
}

