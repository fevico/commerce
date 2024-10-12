import { MAILTRAP_PASS, MAILTRAP_USER, SIGN_IN_URL, VERIFICATION_EMAIL, PASSWORD_RESET_LINK, MAILTRAP_TOKEN } from '#/utils/variables';
import { generateTemplate } from "#/mail/template";
import path from 'path'
import nodemailer from 'nodemailer';
import { MailtrapClient } from "mailtrap";
import fs from 'fs';


const ENDPOINT = "https://send.api.mailtrap.io/";

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

interface MailtrapClientConfig {
  endpoint: string;
  token: string;
}

const clientConfig: MailtrapClientConfig = {
  endpoint: ENDPOINT,
  token: MAILTRAP_TOKEN
}

const client = new MailtrapClient(clientConfig);

interface Options{
  email: string;
  link: string;
}

interface MailtrapClientConfig {
endpoint: string;
token: string;
}

export const sendForgetPasswordLink = async (options: Options) =>{ 
    // const transport = generateMailTransporter()
    const {email, link} = options

    const message = "We just recived a request that you forget your password. No problem you can use the link below and create brand new password.";


    const sender = {
      email: VERIFICATION_EMAIL,
      name: "Yoamart",
    };
    const recipients = [
      {
        email: email,
      }
    ];

    const logoImage = fs.readFileSync(path.join(__dirname, "../mail/logo.png"))
    const forgetPasswodImage = fs.readFileSync(path.join(__dirname, "../mail/forget_password.png"))

    client
      .send({
        from: sender,
        to: recipients,
        subject: "Forget Password Email!",
        html: generateTemplate({
          title: 'Forget Password',
          message,
          logo: "cid:logo",
          banner: "cid:forget_password",
          link,
          btnTitle: "Reset Password"
        }),
      attachments:[
        {
          filename: "logo.png",
          content_id: "logo",
          content: logoImage,
          disposition: "inline",
          type: "image/png"
        },
        {
          filename: "forget_password.png",
          content_id: "forget_password",
          content: forgetPasswodImage,
          disposition: "inline",
          type: "image/png"
        }
      ],
      category: "Forget Password Link",
    
      })

    
    
    
      // transport.sendMail({
      //   to: email,
      //   from: VERIFICATION_EMAIL,
      //   subject: "Reset Password Link",
      //   html: generateTemplate({
      //       title: 'Forget Password',
      //       message,
      //       logo: "cid:logo",
      //       banner: "cid:forget_password",
      //       link,
      //       btnTitle: "Reset Password" 
      //   }),
      //   attachments: [
      //       {
      //           filename: "logo.png",
      //           path: path.join(__dirname, "../mail/logo.png"),
      //           cid: "logo"
      //       },
      //       {
      //           filename: "forget_password.png",
      //           path: path.join(__dirname, "../mail/forget_password.png"),
      //           cid: "forget_password"
      //       },
      //   ]
      // })
    }

    export const sendPassResetSuccessEmail = async (name:string, email:string) =>{ 
        // const transport = generateMailTransporter()
        
    const sender = {
      email: VERIFICATION_EMAIL,
      name: "Yoamart",
    };
    const recipients = [
      {
        email: email,
      }
    ];
        client
        .send({
    from: sender,
    to: recipients,
    template_uuid: "3f8c9528-2a56-49b6-abcf-a82005370089",
    template_variables: {
      "user_name": name,
    }
  })

    }


    export const productOrderMail = async (name:string, email:string, product: string, quantity: number, price: number, address: string) =>{ 

      const ORDER_EMAIL = process.env.ORDER_EMAIL as string
      
        // const client = new MailtrapClient( clientConfig );  
          const message = `Dear ${name} we just received your order from Yoamaet <br/>
          product name: ${product} <br/>
          quantity: ${quantity} <br/>
          price: ${price} <br/>
          address: ${address} <br/>
         
          Thank you for your order. We will send you an email when your order is shipped.`;


          const sender = {
            email: ORDER_EMAIL,
            name: "Yoamart Order", 
          }; 
        
          const recipients = [
            {
              email
            }
          ];
          
         const logoImage = fs.readFileSync(path.join(__dirname, "../mail/logo.png"))

    client
      .send({
        from: sender,
        to: recipients,
        subject: "Sucessful Order!",
        html: generateTemplate({
          title: 'New Order' ,
          message,
          logo: "cid:logo",
        }),
      attachments:[
        {
          filename: "logo.png",
          content_id: "logo",
          content: logoImage,
          disposition: "inline",
          type: "image/png"
        }
      ],
      category: "Succesful Order",
    
      })
       
          // const transport = generateMailTransporter()
            
          //   const message = `Dear ${name} we just updated your password. You can now sign in with your new password.`;
            
          //     transport.sendMail({
          //       to: email,
          //       from: VERIFICATION_EMAIL,
          //       subject: "Password Reset Succesfully",
          //       html: generateTemplate({
          //           title: 'Product Order',
          //           message,
          //           logo: "cid:logo",
          //           banner: "cid:forget_password",
          //           link: SIGN_IN_URL,
          //           btnTitle: "Login" 
          //       }),
          //       attachments: [
          //           {
          //               filename: "logo.png",
          //               path: path.join(__dirname, "../mail/logo.png"),
          //               cid: "logo"
          //           },
          //           {
          //               filename: "forget_password.png",
          //               path: path.join(__dirname, "../mail/forget_password.png"),
          //               cid: "forget_password"
          //           },
          //       ]
          //     })
        }
