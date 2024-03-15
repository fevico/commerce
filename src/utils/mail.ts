import { MAILTRAP_PASS, MAILTRAP_USER, SIGN_IN_URL, VERIFICATION_EMAIL, PASSWORD_RESET_LINK } from '#/utils/variables';
import { generateTemplate } from "#/mail/template";
import path from 'path'
import nodemailer from 'nodemailer';

const generateMailTransporter = () =>{
    const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: MAILTRAP_USER,
          pass: MAILTRAP_PASS
        }
      });
      return transport
}

interface Options{
    email: string;
    link: string;
  }

export const sendForgetPasswordLink = async (options: Options) =>{ 
    const transport = generateMailTransporter()
    
    const { email, link } = options
    
    const message = "We just recived a request that you forget your password. No problem you can use the link below and create brand new password.";
    
      transport.sendMail({
        to: email,
        from: VERIFICATION_EMAIL,
        subject: "Reset Password Link",
        html: generateTemplate({
            title: 'Forget Password',
            message,
            logo: "cid:logo",
            banner: "cid:forget_password",
            link,
            btnTitle: "Reset Password" 
        }),
        attachments: [
            {
                filename: "logo.png",
                path: path.join(__dirname, "../mail/logo.png"),
                cid: "logo"
            },
            {
                filename: "forget_password.png",
                path: path.join(__dirname, "../mail/forget_password.png"),
                cid: "forget_password"
            },
        ]
      })
    }

    export const sendPassResetSuccessEmail = async (name:string, email:string) =>{ 
        const transport = generateMailTransporter()
        
        const message = `Dear ${name} we just updated your password. You can now sign in with your new password.`;
        
          transport.sendMail({
            to: email,
            from: VERIFICATION_EMAIL,
            subject: "Password Reset Succesfully",
            html: generateTemplate({
                title: 'Forget Password',
                message,
                logo: "cid:logo",
                banner: "cid:forget_password",
                link: SIGN_IN_URL,
                btnTitle: "Login" 
            }),
            attachments: [
                {
                    filename: "logo.png",
                    path: path.join(__dirname, "../mail/logo.png"),
                    cid: "logo"
                },
                {
                    filename: "forget_password.png",
                    path: path.join(__dirname, "../mail/forget_password.png"),
                    cid: "forget_password"
                },
            ]
          })
        }