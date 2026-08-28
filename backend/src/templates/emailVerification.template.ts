interface EmailVerificationTemplateProps {
  name: string;
  verificationLink: string;
}

export const emailVerificationTemplate = ({
  name,
  verificationLink,
}: EmailVerificationTemplateProps) => {
  return `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<title>Email Verification</title>
</head>

<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:10px;overflow:hidden;">

<tr>
<td style="background:#2563eb;padding:30px;text-align:center;">
<h1 style="color:white;margin:0;">
dailyDrop Grocery Shop
</h1>
</td>
</tr>

<tr>
<td style="padding:40px;">

<h2>Hello ${name},</h2>

<p style="font-size:16px;line-height:28px;">
Thank you for creating an account.
Please verify your email address by clicking the button below.
</p>

<div style="margin:40px 0;text-align:center;">

<a href="${verificationLink}"
style="
background:#2563eb;
color:white;
padding:15px 35px;
text-decoration:none;
border-radius:6px;
display:inline-block;
font-size:16px;
font-weight:bold;
">
Verify Email
</a>

</div>

<p>
If the button doesn't work, copy and paste this URL into your browser:
</p>

<p style="word-break:break-all;">
${verificationLink}
</p>

<p>
This verification link will expire in <strong>15 minutes</strong>.
</p>

<p>
If you didn't create this account, simply ignore this email.
</p>

<br>

<p>
Regards,<br>
<b>dailyDrop grocery shop</b>
</p>

</td>
</tr>

<tr>
<td
style="background:#f8f8f8;padding:20px;text-align:center;font-size:12px;color:#777;">
© ${new Date().getFullYear()} dailyDrop grocery shop
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>

</html>
`;
};
