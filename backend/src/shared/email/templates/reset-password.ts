export const resetPasswordTemplate = (
  name: string,
  otp: string,
): {
  subject: string;
  html: string;
} => {
  return {
    subject: 'Reset Your Password',

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Reset Your Password</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            font-family: Arial, Helvetica, sans-serif;
          "
        >
          <div
            style="
              max-width: 600px;
              margin: 0 auto;
              padding: 40px 20px;
            "
          >
            <div
              style="
                background-color: #ffffff;
                border-radius: 16px;
                padding: 40px;
              "
            >
              <h1
                style="
                  margin: 0 0 20px;
                  font-size: 28px;
                  color: #111111;
                "
              >
                Reset your password
              </h1>

              <p
                style="
                  margin: 0 0 16px;
                  font-size: 16px;
                  line-height: 1.6;
                  color: #555555;
                "
              >
                Hi ${name},
              </p>

              <p
                style="
                  margin: 0 0 24px;
                  font-size: 16px;
                  line-height: 1.6;
                  color: #555555;
                "
              >
                We received a request to reset your LinkForge
                password. Use the verification code below to continue.
              </p>

              <div
                style="
                  margin: 30px 0;
                  padding: 24px;
                  text-align: center;
                  background-color: #f5f5f5;
                  border-radius: 12px;
                "
              >
                <p
                  style="
                    margin: 0 0 8px;
                    font-size: 13px;
                    color: #777777;
                  "
                >
                  Your verification code
                </p>

                <div
                  style="
                    font-size: 32px;
                    font-weight: 700;
                    letter-spacing: 8px;
                    color: #111111;
                  "
                >
                  ${otp}
                </div>
              </div>

              <p
                style="
                  margin: 0 0 16px;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #777777;
                "
              >
                This code will expire in 10 minutes.
              </p>

              <p
                style="
                  margin: 0;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #777777;
                "
              >
                If you did not request a password reset, you can
                safely ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
};
