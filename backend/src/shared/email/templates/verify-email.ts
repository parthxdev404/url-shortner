export function verifyEmailTemplate(name: string, verificationUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Verify your email</title>
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
Thank you for registering.
</p>

<p>
Please verify your email address by clicking the button below.
</p>

<p style="margin:32px 0">
<a
href="${verificationUrl}"
style="
background:#2563eb;
color:white;
padding:14px 24px;
text-decoration:none;
border-radius:8px;
display:inline-block;
"
>
Verify Email
</a>
</p>

<p>
If you didn't create this account, you can safely ignore this email.
</p>

</div>

</body>
</html>
`;
}
