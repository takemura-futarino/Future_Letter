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
        //get_userApi()関数の呼び出し
        const userName = await get_userApi(accessToken);
        //letter_indexApi()関数の呼び出し
        const postData = await letter_indexApi(accessToken);

        //user_input()関数の呼び出し
        await userName_input(userName);
        //letter_number()関数の呼び出し
        await letter_number(userName, postData);
        //hitorino()関数の呼び出し
        await hitorino(userName);
        //liff.getProfileでユーザーの情報取得
        const profile = await liff.getProfile();
        console.log(profile);
        await icon(profile);
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

//--------- 手紙一覧の情報取得 ----------
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

//--------- アイコン表示 -----------
async function icon(profile) {
    try {
        const iconImg = document.querySelector('.icon');
        iconImg.src = profile.pictureUrl;

    } catch (error) {
        console.error(error);
    }
}

//------------------------------ データの入力 -----------------------------------
// 名前のデータ取得
const userName_input = (userName) => {
    const user = document.querySelector(".user__name__content");
    user.textContent = userName.data.name;
} 

// 各手紙情報の取得
const letter_number = (userName, postData) => {
    const onHand = document.querySelector(".onhand__letter");
    onHand.textContent = userName.data.letter_num;

    const custody = document.querySelector(".custody__letter");
    custody.textContent = postData.data.is_sending.length;
}

// ヒトリノデーの情報の取得
const hitorino = (userName) => {
    const hitorinoDate = document.querySelector(".user__hitorino__date");
    const DateInfo = userName.data.birthday;
    const dateObject = new Date(DateInfo);
    const day = dateObject.getDate();
    hitorinoDate.textContent = day;
}