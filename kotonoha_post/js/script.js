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
        //tabMenu()関数の呼び出し
        await tabMemu(postdata);
        //unread()関数の呼び出し
        await unread(postdata);
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

//-------- 起動時の挙動＆パートナーからの手紙一覧 ---------
async function partnerLetter(postdata) {
    try {
        let letterList = document.querySelector(".letter_list");

        if (postdata.data.from_partner === null) {
            letterList.innerHTML += "<div class='non_item'><p>このフォルダーは空です</p><span>想いを手紙に載せて届けましょう。</span></div>";
        } else {
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
                    const imageUrl = "image/kotonoha.png";
                    const imageAltText = "未開封のコトノハ";
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
                    const imageUrl = "image/kotonoha.png";
                    const imageAltText = "開封済みのコトノハ";
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
        }
    } catch (error) {
        console.error(error);
    }
}

//--------- 自分自身の手紙一覧 ----------
async function myselfLetter(postdata) {
    try {
        if (postdata.data.from_me === null) {
            letterList.innerHTML += "<div class='non_item'><p>このフォルダーは空です</p><span>想いを手紙に載せて届けましょう。</span></div>";
        } else {
            const post_number = postdata.data.from_me;
            const myselfList = document.querySelector('.myself_list');
    
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
                    const imageUrl = "image/kotonoha.png";
                    const imageAltText = "未開封のコトノハ";
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
                    const imageUrl = "image/kotonoha.png";
                    const imageAltText = "開封済みのコトノハ";
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
                myselfList.appendChild(newListItem);

            } 
        }
  
    } catch (error) {
        console.error(error);
    }
}

//--------- タブメニュー ----------
async function tabMemu(postdata) {
    try {
        const partnerTab = document.querySelector(".icon-partner");
        let letterList = document.querySelector(".letter_list");
        partnerTab.addEventListener('click', () => {
            toggleTabs("partner");
            // 重複を避けるために<ul>内を一度空にする必要がある
            letterList.innerHTML = "";
            partnerLetter(postdata);
        });

        const oneself_tab = document.querySelector(".icon-oneself");
        oneself_tab.addEventListener('click', () => {
            toggleTabs("oneself");
            letterList.innerHTML = "";
            myselfLetter(postdata);
        })
    } catch (error) {
        console.error(error);
    }
}

//----------- activeとhiddenの切り替え ------------
function toggleTabs(tabType) {
    // クリックされたタブの要素を取得
    const clickedTab = document.querySelector(`.icon-${tabType}`);

    // クリックされたタブに対して 'active' クラスをトグル
    clickedTab.classList.remove('hidden');
    clickedTab.classList.add('active');

    // クリックされたタブの反対のタブの要素を取得
    const otherTabType = (tabType === 'partner') ? 'oneself' : 'partner';
    const otherTab = document.querySelector(`.icon-${otherTabType}`);
    
    // 反対のタブに対して 'active' クラスを削除し、'hidden' クラスを追加
    otherTab.classList.remove('active');
    otherTab.classList.add('hidden');
}


//---------- 未読の表記 -----------
async function unread(postdata) {
    try {
        let partner_unreadletterCount = 0;
        if (postdata.data.from_partner){
            for (let i = 0; i < postdata.data.from_partner.length; i++) {
                if (postdata.data.from_partner[i].is_read === 0) {
                    partner_unreadletterCount++;
                }
            }
        }
        console.log(partner_unreadletterCount);
        const iconPartner = document.querySelector(".icon-partner");
        if (partner_unreadletterCount > 0) {
            // <span class="partner_badge">を作成
            const badge = document.createElement("span");
            badge.classList.add("partner_badge");
            // 未読の数字を入れる
            badge.innerHTML = partner_unreadletterCount;
            // <div> に <span> を入れる
            iconPartner.appendChild(badge);
        }

        let myself_unreadletterCount = 0;
        if (postdata.data.from_me) {
            for (let i = 0; i < postdata.data.from_me.length; i++) {
                if (postdata.data.from_me[i].is_read === 0) {
                    myself_unreadletterCount++;
                }
            }
        }
        console.log(myself_unreadletterCount);
        const iconMyself = document.querySelector(".icon-oneself");
        if (myself_unreadletterCount > 0) {
            // <span class="oneself_badge">を作成
            const badge = document.createElement("span");
            badge.classList.add("oneself_badge");
            // 未読の数字を入れる
            badge.innerHTML = myself_unreadletterCount;
            // <div> に <span> を入れる
            iconMyself.appendChild(badge);
        }
    } catch (error) {
        console.error(error);
    }
}

