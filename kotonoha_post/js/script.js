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
        // letter_indexApi()関数の呼び出し
        const postdata = await letter_indexApi(accessToken);
        console.log(postdata);
        // letter_data()関数の呼び出し
        await letter_data(postdata);
        // change_data()関数の呼び出し
        await change_data(postdata);
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
        return postdata;

    } catch (error) {
        console.error(error);
    }
} 

//---------手紙を表示させる----------
async function letter_data(postdata) {
    try {
        if (postdata.data.from_partner.length !== 0) {
            const non_item = document.querySelector('.non_item');
            console.log(non_item);
            non_item.classList.add('comment_flash');
        }

        const post_number = postdata.data.from_partner;
        const partnerList = document.querySelector('.partner_list');

        for (let i = 0; i < post_number.length; i++) {
            // 新しい <li> 要素を作成
            const newListItem = document.createElement("li");
            // 新しい <a> 要素を作成
            const newListURL = document.createElement("a"); 
            // <a> にクラスを追加   
            newListURL.classList.add("newID"); 
            // 未開封か既読かの確認
            if (post_number[i].is_read === 0) {
                // 画像の情報
                const imageUrl = "image/unopened_male.png";
                const imageAltText = "未開封の手紙";
                // <img> 要素を作成
                const imageElement = document.createElement("img");
                imageElement.src = imageUrl;
                imageElement.alt = imageAltText;
                // <img> にクラスを追加
                imageElement.classList.add("letter_number");
                // <img> にクリックイベント追加/idを割り振った手紙閲覧ページのURL発行
                imageElement.addEventListener('click', () => {
                    const value = post_number[i].id;
                    window.location.href = `https://liff.line.me/2000014015-QqLAlNmW/view?value=${value}`;
                });
                // <a> に <img> を追加
                newListURL.appendChild(imageElement);
            
            } else if (post_number[i].is_read === 1) {
            // 既読の場合の処理
                // 画像の情報
                const imageUrl = "image/opened_male.png";
                const imageAltText = "開封済みの手紙";
                // <img> 要素を作成
                const imageElement = document.createElement("img");
                imageElement.src = imageUrl;
                imageElement.alt = imageAltText;
                // <img> にクラスを追加
                imageElement.classList.add("letter_number");
                // どの手紙を押したのかを手紙閲覧ページに伝える必要がある。 id を送る。
                // <img> にクリックイベント追加/idを割り振った手紙閲覧ページのURL発行
                imageElement.addEventListener('click', () => {
                    const value = post_number[i].id;
                    window.location.href = `https://liff.line.me/2000014015-QqLAlNmW/view?value=${value}`;
                });
                // <a> に <img> を追加
                newListURL.appendChild(imageElement);
            }
            // 新しい要素 <p> 要素を作成
            const newListDay = document.createElement("p");
            // <p> に日付の情報を入れる
            newListDay.textContent = post_number[i].send_at;
            // <a> に <p> を追加
            newListURL.appendChild(newListDay);
            // <li> に <a> を追加
            newListItem.appendChild(newListURL);
            // <ul> に <li> を追加
            partnerList.appendChild(newListItem);
        }

    } catch (error) {
        console.error(error);
    }
}

// -----------手紙を切り替える-----------
async function change_data(postdata) {
    try {
        const partnerTab = document.querySelector(".partner_tab");
        const oneselfTab = document.querySelector(".oneself_tab");

        partnerTab.addEventListener('click', () => {
            letter_data(postdata);
        });

        oneselfTab.addEventListener('click', () => {
            console.log("切り替えボタン");
        })
    } catch (error) {
        console.error(error);
    }
}