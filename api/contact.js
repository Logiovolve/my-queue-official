export default async function handler(req, res) {
  // POSTリクエストのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, shopName, email, plan, option, message } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({ error: 'お名前とメールアドレスは必須です' });
    }

    // LINEに送信する通知メッセージのテキストを整形
    const lineMessageText = 
`📩 【新規お問い合わせ】

■ お名前: ${name}
■ 店舗・団体名: ${shopName || '未記入'}
■ メールアドレス: ${email}
■ ご希望プラン: ${plan || '未選択'}
■ 初期設定オプション: ${option || '未選択'}

■ お問い合わせ内容:
${message || 'なし'}`;

    // LINE Messaging API (Push Message) の呼び出し
    const lineResponse = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ADMIN_LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        to: process.env.ADMIN_LINE_USER_ID,
        messages: [
          {
            type: 'text',
            text: lineMessageText
          }
        ]
      })
    });

    if (lineResponse.ok) {
      return res.status(200).json({ success: true, message: '送信が完了しました' });
    } else {
      const errorDetail = await lineResponse.json();
      console.error('LINE API Error:', errorDetail);
      return res.status(500).json({ error: 'LINEへの通知送信に失敗しました' });
    }
  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ error: 'サーバー内部エラーが発生しました' });
  }
}
