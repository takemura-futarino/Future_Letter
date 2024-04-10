window.addEventListener("load", function () {
  setTimeout(function () {
    document.body.style.opacity = "1";
  }, 2000);
});

// LIFFの初期化を行う
liff
  .init({
    // 自分のLIFF IDを入力する
    liffId: "2000014015-QqLAlNmW",
  })
  // ここでLineにログインしていなかったらログインする。
  .then(async () => {
    if (!liff.isLoggedIn() && !liff.isInClient()) {
      liff.login();
      // ログインしていたらLiffからアクセストークンを取得して「accessToken」という変数に格納される。
    } else {
      let accessToken = liff.getAccessToken();
      console.log(accessToken);
      // ログインしていたら「accessToken」を引数として受け取りcallApi(),linkage(),picker()関数を呼び出す。
      await callApi(accessToken);
      // ここまでは定型
      await linkage(accessToken);
      await picker();

      let partnerData = await partnerUser(accessToken);
      console.log(partnerData);
      if (partnerData.data.partner_user) {
        // 連携完了ページに遷移
        window.location.href =
          "https://liff.line.me/2000014015-QqLAlNmW/completed/index.html";
        return;
      }
    }
  })
  .catch((err) => {
    console.error(err.code, err.message);
  });

// callApi関数の定義
// この関数はアクセストークン使用してAPIの呼び出し
async function callApi(accessToken) {
  try {
    let queryString = `?line_access_token=${accessToken}`;
    const api = await fetch(
      "https://dev.2-rino.com/api/v1/is_registed" + queryString
    );
    const res = await api.json();
    console.log(res.data);
    if (res.data.result === "false") {
      const apiReg = await fetch(
        "https://dev.2-rino.com/api/v1/regist" + queryString
      );
      const reg = await apiReg.json();
      console.log(reg.data);
    }
  } catch (error) {
    console.error(error);
  }
}

// linkage関数の定義
// APIからデータを取得してユーザーに表示させるための関数
async function linkage(accessToken) {
  try {
    const partres = await fetch("https://dev.2-rino.com/api/v1/invite_url", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const partResData = await partres.json();
    console.log(partResData.data);

    let partnerUrl = partResData.data.invite_url;
    // hrefに取得したパートナーURLの設定
    document.querySelector(".inviteArea a").href = partnerUrl;
    // urlLinkに取得したパートナーURLの設定
    document.getElementById("urlLink").textContent = partnerUrl;
  } catch (error) {
    console.error(error);
  }
}

// picker関数の定義
// 共有URL取得のための関数
async function picker() {
  try {
    const friends = document.getElementById("button_friend");
    friends.addEventListener("click", async function () {
      console.log("クリックしました");
      if (liff.isApiAvailable("shareTargetPicker")) {
        const linkText = document.querySelector(".inviteArea a").href;
        console.log(linkText);
        await liff
          .shareTargetPicker([
            {
              type: "text",
              text:
                "【フタリノの招待URL】\n以下のリンクをクリックして、パートナー登録をしてね！\n" +
                linkText,
            },
          ])
          .then(() => {
            console.log("ShareTargetPicker was launched");
          })
          .catch((res) => {
            console.log("Failed to launch ShareTargetPicker");
          });
      }
    });
  } catch (error) {
    console.error("Error: " + error);
  }
}
