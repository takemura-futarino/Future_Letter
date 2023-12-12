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
        //letter_indexApi()関数の呼び出し
        await letter_indexApi(accessToken);

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

//--------手紙一覧の取得----------
async function letter_indexApi(accessToken) {
    try {
        const getLetter = await fetch('https://dev.2-rino.com/api/v1/letter/',{
            headers:{
                Authorization: `Bearer ${accessToken}`
            }
        });
        const postdata = await getLetter.json();
        console.log(postdata);
        console.log(postdata.data.from_me[0]);
        const post_number = postdata.data.from_me;
        console.log(post_number); //届いている手紙の数の確認

        //　パートナーからの手紙がある場合の挙動
        const non_item = document.querySelector('.non_item');
        if (postdata.data.from_me) {
            non_item.classList.add('comment_flash');
            await letter_data(post_number);
        }
    } catch (error) {
        console.error(error);
    }
} 

async function letter_data(post_number) {
    const letter_list = document.querySelector('.letter_list');

    for (let i = 0; i < post_number.length; i++) {
        // 新しい <li> 要素を作成
        const newListItem = document.createElement("li");
        // 画像の情報
        const imageUrl = "image/unopened_male.png";
        const imageAltText = "未開封の手紙";
        // <img> 要素を作成
        const imageElement = document.createElement("img");
        imageElement.src = imageUrl;
        imageElement.alt = imageAltText;
        // <img> にクラスを追加
        imageElement.classList.add("letter_list_item_"+i);
        imageElement.classList.add("letter_number");
        // <li> に <img> を追加
        newListItem.appendChild(imageElement);
        // <ul> に <li> を追加
        letter_list.appendChild(newListItem);

        
    }
}


