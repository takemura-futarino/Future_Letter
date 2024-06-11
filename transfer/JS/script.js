// 文字数表示---------------------------------------------------------------------
function ShowLength( str ) {
    document.getElementById("inputlength").innerHTML = str.length + "文字";
 }

//  文字振込----------------------------------------------------------------------
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