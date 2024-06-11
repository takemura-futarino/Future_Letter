//------- サーバー環境によってコンソール表示を制御(templete)-------
const allowedHostnames = ['localhost', '127.0.0.1', 'roca-inc.jp'];

if (!allowedHostnames.includes(window.location.hostname)) {
  console.log = function () {};
  console.info = function () {};
  // 必要に応じて他のメソッドも無効化
}

// ページ読み込み後の2秒遅延表示設定(templete)
window.addEventListener("load", function () {
  setTimeout(function () {
    document.body.style.opacity = "1";
  }, 2000); // 2000ミリ秒 = 2秒
});

// // LIFFの初期化-----------------------------------------------------------------------------
liff
  .init({
    // LIFF IDを入力する
    liffId: "2000014015-QqLAlNmW"
}).then(async() => { // 初期化完了. 以降はLIFF SDKの各種メソッドを利用できる

    if (!liff.isLoggedIn() && !liff.isInClient()) {
      liff.login();
    } else {
      // ユーザーのLINEアカウントのアクセストークンを取得
      let accessToken = liff.getAccessToken();
      console.log(accessToken);
      // callApi()関数の呼び出し
      await callApi(accessToken);
      // getinfo()関数の呼び出し
      const getInfo = await getinfo(accessToken);
      // delete()関数の呼び出し
      // await Delete(getInfo);
      // userInfo()関数の呼び出し
      await userInfo(accessToken);
    }
  })
  .catch((err) => {
    // 初期化中にエラーが発生します
    console.error(err.code, err.message);
  });

//--------アクセストークンを登録する--------
async function callApi(accessToken) {
    try {
        //パラメータ（line_access_token）を付与するために、クエリ文字列を作成する
        let queryString = `?line_access_token=${accessToken}`;

        //アクセストークンが登録済みか未登録か判定する----------------
        const api = await fetch(`https://dev.2-rino.com/api/v1/is_registed` + queryString);
        const res = await api.json();
        console.log(res.data);

        //フタリノに登録していない（false）の場合に実行するAPI
        if (res.data.result === "false") {
            const apiReg = await fetch(`https://dev.2-rino.com/api/v1/regist` + queryString);
            const reg = await apiReg.json();
            console.log(reg.data);
        }
    } catch (error) {
        console.error(error);

    }
}

// // ------- 会員登録情報の取得 ----------------------------------------------------------------
async function getinfo(accessToken) {

    try {
        const getUserInfo = await fetch(`https://dev.2-rino.com/api/v1/user`,{
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const postdata = await getUserInfo.json();
        const userInfo = postdata.data;
        console.log(userInfo);

        return userInfo;

    } catch (error) {
        console.log(error);
    }
}

// // ------- 会員登録画面を消す -----------------------------------------------------------------
// async function Delete(getinfo) {
//   if (getinfo.gender !== null) {
//     console.log("会員登録済み");

//     const slide = document.querySelector("#slide");
//     const Member = document.querySelector("#Member");
//     const Maincontent = document.querySelector("#Maincontent");

//     // 差分を調整
//     slide.style.width = "100%";
//     Member.style.display = "none";
//     Maincontent.style.width = "100%";
//   }
// }

// // ------- 会員登録情報を送る（＋作成画面に飛ぶ） -----------------------------------------------
async function userInfo(accessToken) {
  const next = document.querySelector("#buttonLink");
   // タッチイベントも追加する
   next.addEventListener("click", handleClick);
   next.addEventListener("touchstart", handleClick);
 
   async function handleClick(event) {
     event.preventDefault(); // デフォルトのフォーム送信動作を防ぐ
    // お名前
    const name = document.querySelector("#username").value;
    console.log(name);
    // 性別
    const gender = document.getElementById("gender").value;
    console.log(gender);
    // 誕生日
    const birthday = yearSelect.value + "-" + monthSelect.value + "-" + daySelect.value;
    console.log(birthday);
    // ステータス
    const state = document.getElementById("status").value;
    console.log(state);
    // 居住地
    const pref = document.getElementById("from").value;
    console.log(pref);
    // チェックボックス
    const accept = document.querySelector("#agree").checked;
    
    // すべての項目が入力され、チェックボックスがオンになっていることを確認します
    if (
      name.trim() === "" ||
      gender.trim() === "" ||
      birthday.trim() === "" ||
      state.trim() === "" ||
      pref.trim() === "" ||
      !accept
    ) {
      alert("全ての項目を入力してください。");
      return;
    }
    
    // const sei = JSON.stringify({
      //   name: name,
      //   gender: gender,
      //   birthday: birthday,
      //   state: state,
      //   accept: accept,
      // });
      // console.log(sei);
      
      fetch(`https://dev.2-rino.com/api/v1/user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json", // JSON形式のデータを送信する場合に必要
        },
        body: JSON.stringify({
          name: name,
          gender: gender,
          birthday: birthday,
          state: state,
          pref: pref,
          accept: accept,
        }),
      })
      .then(response => {
        // レスポンスオブジェクトから JSON データを抽出
        if (!response.ok) {
          throw new Error('ネットワークのレスポンスが正常ではありませんでした');
        }
        return response.json();
    })
    .then(data => {
      console.log(JSON.stringify(data));
      
      // ---- 会員登録情報を送ると同時に次のページに飛ぶ機能も付けておく ----
      console.log("次のページへ");
      const delay = 2000; 
      setTimeout(() => {
        nextClick(); // 参照：『スライドショー（初回）』
      }, delay);
    })
    // .catch(error => {
      //   console.error('フェッチ操作に問題が発生しました:', error.message);
      //   return null;
      // });
    }
  }
  


// 誕生日---------------------------------------------------------------------------------------
const yearSelect = document.getElementById("year");
const monthSelect = document.getElementById("month");
const daySelect = document.getElementById("day");

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1; // 月は0から11の範囲で取得されるため、+1する
const currentDay = currentDate.getDate();

// 年プルダウンを生成
for (let i = currentYear; i >= currentYear - 100; i--) {
    const option = document.createElement("option");
    option.value = i;
    option.text = i;
    yearSelect.appendChild(option);
}

// 月プルダウンを生成
for (let i = 1; i <= 12; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = i;
    monthSelect.appendChild(option);
}

// 選択された年と月に基づいて日プルダウンを生成する関数
function populateDays(year, month) {
    daySelect.innerHTML = ''; // 既存の日付オプションをクリア

    const daysInMonth = new Date(year, month, 0).getDate(); // 月の日数を取得

    for (let i = 1; i <= daysInMonth; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.text = i;
        daySelect.appendChild(option);
    }
}

// 現在の年、月、日を初期選択状態にする
yearSelect.value = currentYear;
monthSelect.value = currentMonth;
populateDays(currentYear, currentMonth);
daySelect.value = currentDay;

// 年または月が変更されたときに日プルダウンを更新
yearSelect.addEventListener('change', function() {
    populateDays(yearSelect.value, monthSelect.value);
});

monthSelect.addEventListener('change', function() {
    populateDays(yearSelect.value, monthSelect.value);
});

// 次のページに飛ぶ関数---------------------------------------------------------------------------------
async function nextClick() {
  const nextPageUrl = "https://roca-inc.jp/mirai/Future_Letter/home/"; // 飛びたいページのURLを指定
  window.location.href = nextPageUrl;
}

