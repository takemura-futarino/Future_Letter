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
        //letter_showApi()関数の呼び出し
        await letter_showApi(accessToken);
        //get_userApi()関数の呼び出し
        const userName = await get_userApi(accessToken);
        //letter_indexApi()関数の呼び出し
        await letter_indexApi(accessToken, userName);
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

//------- 手紙を既読状態にする -------
async function letter_showApi(accessToken) {

    // URLからvalueデータ値を受け取る　// myself_postページから飛ばないとvalueを取得できない
    const urlParams = await new URLSearchParams(window.location.search);
    const value = await urlParams.get('value');
    
    try {
        const getLetter = await fetch(`https://dev.2-rino.com/api/v1/letter/${value}/`,{
            headers:{
                Authorization: `Bearer ${accessToken}`
            }
        });
        const postdata = await getLetter.json();
        console.log(postdata);

    } catch(error) {
        console.error(error);
    }
}

//-------- ユーザーとパートナーの名前取得 ---------
async function get_userApi(accessToken) {
    try {
        const getuser = await fetch("https://dev.2-rino.com/api/v1/user",{
            headers:{
                Authorization: `Bearer ${accessToken}`
            }
        });
        const name = await getuser.json();
        console.log(name);
        return name;

    } catch(error) {
        console.error(error);
    }
}

//-------- 手紙一覧の情報取得 ----------
async function letter_indexApi(accessToken, username) {
    try {
        const getLetter = await fetch('https://dev.2-rino.com/api/v1/letter/',{
            headers:{
                Authorization: `Bearer ${accessToken}`
            }
        });
        const postdata = await getLetter.json();
        console.log(postdata);
        const post_me = postdata.data.from_me;
        console.log(post_me);

        //receopt()関数呼び出し
        const letterContain = await receipt(post_me);
        console.log(letterContain);

        //JSONデータを記入する
        const Partner = document.querySelector('.partner');
        const Thought = document.querySelector('.thought');
        const Me = document.querySelector('.me');
        const Days = document.querySelector(".days");

        // 誰に送る？　誰から？
        if (letterContain.send_to === 1) {
            Partner.textContent = "私へ";
            Me.textContent = username.data.name + "より";
        } else if (letterContain.send_to === 2) {
            Partner.textContent = username.data.partner_user.line_display_name + "へ";
            Me.textContent = username.data.name +"より";
        }
        // 内容は？
        Thought.textContent = letterContain.content;
        // 日付は？
        Days.textContent = letterContain.send_at;

    } catch (error) {
        console.error(error);
    }
}
// ↓↓
//-----------特定の手紙の情報取得------------ 
async function receipt(post_me) {
    // URLからvalueデータ値を受け取る　// myself_postページから飛ばないとvalueを取得できない
    const urlParams = await new URLSearchParams(window.location.search);
    const value = await urlParams.get('value');
    const numValue = parseInt(value, 10); //数値に変換

    for (let i = 0; i < post_me.length; i++) {
        if (post_me[i].id === numValue) {
            const letterData = post_me[i];
            
            return letterData;
        }
    }
}


