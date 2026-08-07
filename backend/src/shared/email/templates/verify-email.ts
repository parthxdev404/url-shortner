export const verifyEmailTemplate = (name: string, otp: string) => {
  return {
    subject: 'Verify your email address',

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verify your email</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background-color: #f4f4f5;
            font-family: Arial, sans-serif;
          "
        >
          <div
            style="
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 12px;
              padding: 40px;
            "
          >
            <h1 style="margin: 0 0 20px; color: #18181b;">
              Verify your email
            </h1>

            <p
              style="
                font-size: 16px;
                line-height: 1.6;
                color: #52525b;
              "
            >
              Hi ${name},
            </p>

            <p
              style="
                font-size: 16px;
                line-height: 1.6;
                color: #52525b;
              "
            >
              Thanks for creating an account. Use the verification code below
              to verify your email address.
            </p>

            <div
              style="
                margin: 30px 0;
                text-align: center;
              "
            >
              <div
                style="
                  display: inline-block;
                  padding: 16px 28px;
                  background-color: #f4f4f5;
                  border-radius: 10px;
                  font-size: 32px;
                  font-weight: bold;
                  letter-spacing: 8px;
                  color: #18181b;
                "
              >
                ${otp}
              </div>
            </div>

            <p
              style="
                font-size: 14px;
                line-height: 1.6;
                color: #71717a;
              "
            >
              This code will expire in 10 minutes.
            </p>

            <p
              style="
                font-size: 14px;
                line-height: 1.6;
                color: #71717a;
              "
            >
              If you didn't create this account, you can safely ignore this
              email.
            </p>

            <hr
              style="
                border: 0;
                border-top: 1px solid #e4e4e7;
                margin: 30px 0;
              "
            />

            <p
              style="
                font-size: 12px;
                color: #a1a1aa;
              "
            >
              This is an automated email. Please do not reply.
            </p>
          </div>
        </body>
      </html>
    `,
  };
};
