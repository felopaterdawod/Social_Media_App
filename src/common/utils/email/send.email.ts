import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer';
import { BadRequestException } from '../../exceptions';
import { APPLICATION_NAME, EMAIL_APP, EMAIL_APP_PASSWORD } from '../../../config/config';


export const sendEmail = async ({
    to,
    cc,
    bcc,
    html,
    subject,
    attachments = [],
} : Mail.Options):Promise<void> => {

    if (!to && !cc && !bcc) {
        throw  new BadRequestException("Invalid recipient" )
    }

    if (!(html as string)?.length && !attachments?.length) {
        throw new BadRequestException("Invalid mail content" )
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EMAIL_APP,
            pass: EMAIL_APP_PASSWORD,
        },
    });

    const info = await transporter.sendMail({
        to,
        cc,
        bcc,
        html,
        subject,
        attachments,
        from: `"${APPLICATION_NAME}😍😍" <${EMAIL_APP}>`,

    })
}