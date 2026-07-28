export function resetPasswordTemplate(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Reset your password</title>
</head>

<body
  style="
    font-family: Arial, Helvetica, sans-serif;
    background:#f5f5f5;
    padding:40px;
  "
>

<div
  style="
    max-width:600px;
    margin:auto;
    background:white;
    padding:32px;
    border-radius:12px;
  "
>

<h2>Hello ${name}, 👋</h2>

<p>
We received a request to reset your password.
</p>

<p>
Click the button below to choose a new password.
</p>

<p style="margin:32px 0">
<a
href="${resetUrl}"
style="
background:#dc2626;
color:white;
padding:14px 24px;
text-decoration:none;
border-radius:8px;
display:inline-block;
"
>
Reset Password
</a>
</p>

<p>
If you didn't request this, you can safely ignore this email.
</p>

<p>
This link will expire in 15 minutes.
</p>

</div>

</body>
</html>
`;
}
