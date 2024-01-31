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
        const postdata = await letter_indexApi(accessToken);
        console.log(postdata);
        //partnerLetter()関数の呼び出し
        await partnerLetter(postdata);

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
        //手紙一覧を取得
        const getLetter = await fetch('https://dev.2-rino.com/api/v1/letter/',{
            headers:{
                Authorization: `Bearer ${accessToken}`
            }
        });
        const postdata = await getLetter.json();
        // 取得した手紙一覧の情報を関数の呼び出し元に返す
        return postdata;

    } catch (error) {
        console.error(error);
    }
} 


//-------- 起動時の挙動＆パートナーからの手紙一覧 ---------
async function partnerLetter(postdata) {
        let letterList = document.querySelector(".letter_list");

        if (postdata.data.from_partner === null && postdata.data.from_me === null) {
            letterList.innerHTML += "<div class='non_item'><p>このフォルダーは空です</p><span>想いを手紙に載せて届けましょう。</span></div>";
        } else {
            const parterList = document.querySelector(".partner_list");
            const post_number = postdata.data.is_sending;
            console.log(post_number);

            for (let i = 0; i < post_number.length; i++) {
                // 新しい <li> 要素を作成
                const newListItem = document.createElement("li");
                // 新しい <div> 要素を作成
                const newListURL = document.createElement("div"); 
                // <div> にクラスを追加   
                newListURL.classList.add("newID"); 

                // パートナー宛か自分宛かの確認
                // パートナー宛の場合
                if (post_number[i].send_to === 2) {
                    // 画像の情報
                    const imageUrl = "image/closed_letter.png";
                    const imageAltText = "パートナー宛てのコトノハ";
                    // <img> 要素を作成
                    const imageElement = document.createElement("img");
                    imageElement.src = imageUrl;
                    imageElement.alt = imageAltText;
                    // <img> にクラスを追加
                    imageElement.classList.add("letter_number");
                    // <img> にクリックイベント追加/idを割り振った手紙閲覧ページのURL発行
                    imageElement.addEventListener('click', () => {
                        const value = post_number[i].id;
                        window.location.href = `https://liff.line.me/2000014015-QqLAlNmW/view_custody?value=${value}`;
                    });
                    // <div> に <img> を追加
                    newListURL.appendChild(imageElement);
                    // <div>要素を追加
                    const newListContent = document.createElement("div");
                    // <p>要素を作成
                    const who_you = document.createElement("p");
                    who_you.textContent = "相手へ";
                    newListContent.appendChild(who_you);

                    // 新しい要素 <p> 要素を作成
                    const newListDay = document.createElement("p");

                    // 変換した日付情報
                    const newDateinfo = post_number[i].send_at;
                    // Dateオブジェクトを作成して日付文字列を解析
                    var dateObject = new Date(newDateinfo);
                    // 年、月、日を取得
                    var year = dateObject.getFullYear();
                    var month = dateObject.getMonth() + 1; // 月は0から11で表されるため、1を加える
                    var day = dateObject.getDate();
                    // フォーマットした日付文字列を作成
                    var formattedDateString = year + "年" + month + "月" + day + "日";
                    // 結果をコンソールに表示
                    console.log(formattedDateString);

                    // <p> に日付の情報を入れる
                    newListDay.textContent = formattedDateString;
                    // <div> に <p> を追加
                    newListContent.appendChild(newListDay);
                    // <div> に <div> を追加
                    newListURL.appendChild(newListContent);
                    // <img> 要素を作成
                    const editImg = document.createElement("img");
                    editImg.classList.add("edit_img");
                    editImg.src = "image/black_pen.png";
                    editImg.alt = "編集可能";
                    newListURL.appendChild(editImg);
                    // <li> に <a> を追加
                    newListItem.appendChild(newListURL);
                    // <ul> に <li> を追加
                    parterList.appendChild(newListItem);
                
                // 自分宛の場合
                } else if (post_number[i].send_to === 1) {
                    // 画像の情報
                    const imageUrl = "image/closed_letter.png";
                    const imageAltText = "自分宛てのコトノハ";
                    // <img> 要素を作成
                    const imageElement = document.createElement("img");
                    imageElement.src = imageUrl;
                    imageElement.alt = imageAltText;
                    // <img> にクラスを追加
                    imageElement.classList.add("letter_number");
                    // <div> に <img> を追加
                    newListURL.appendChild(imageElement);
                    // <div>要素を追加
                    const newListContent = document.createElement("div");
                    // <p>要素を作成
                    const who_me = document.createElement("p");
                    who_me.textContent = "自分へ";
                    newListContent.appendChild(who_me);

                    // 新しい要素 <p> 要素を作成
                    const newListDay = document.createElement("p");

                    // 変換した日付情報
                    const newDateinfo = post_number[i].send_at;
                    // Dateオブジェクトを作成して日付文字列を解析
                    var dateObject = new Date(newDateinfo);
                    // 年、月、日を取得
                    var year = dateObject.getFullYear();
                    var month = dateObject.getMonth() + 1; // 月は0から11で表されるため、1を加える
                    var day = dateObject.getDate();
                    // フォーマットした日付文字列を作成
                    var formattedDateString = year + "年" + month + "月" + day + "日";
                    // 結果をコンソールに表示
                    console.log(formattedDateString);
                    
                    // <p> に日付の情報を入れる
                    newListDay.textContent = formattedDateString;
                    // <div> に <p> を追加
                    newListContent.appendChild(newListDay);
                    // <div> に <div> を追加
                    newListURL.appendChild(newListContent);
                    // <li> に <a> を追加
                    newListItem.appendChild(newListURL);
                    // <ul> に <li> を追加
                    parterList.appendChild(newListItem);
                }
            }
        }

}