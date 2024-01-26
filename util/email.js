const { htmlToText } = require('html-to-text');
const ejs = require('ejs');
const getMessages = require('../languages/getMessages');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = class Email {
  constructor(user, language = process.env.DEFAULT_LANGUAGE, url = `${process.env.APP_NAME}://welcome`, token = null) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.language = language;
    this.messages = getMessages(language);
    this.url = url;
    this.token = token;
    this.from = process.env.EMAIL_FROM;
  }

  async sendEmail(template, subject, localeSubject) {
    const html = await ejs.renderFile(`${__dirname}/../email/${this.language}/${template}.ejs`, {
      firstName: this.firstName,
      email: this.to,
      subject,
      localeSubject,
      date: new Date().toLocaleDateString(this.language),
      url: this.url,
      token: this.token,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    await transporter.sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.sendEmail('welcome', this.messages.emailSubjects.welcome(process.env.APP_NAME));
  }

  async sendEmailVerificationToken() {
    await this.sendEmail('token', this.messages.emailSubjects.emailConfirm, this.messages.emailMessages.emailConfirm);
  }

  async sendTwoFaToken() {
    await this.sendEmail('token', this.messages.emailSubjects.twoFaLogin, this.messages.emailMessages.twoFaLogin);
  }

  async sendEmailVerificationUrl() {
    await this.sendEmail('emailConfirm', this.messages.emailSubjects.emailConfirm);
  }

  async sendPasswordResetUrl() {
    await this.sendEmail('resetPassword', this.messages.emailSubjects.passwordReset);
  }

  async sendTwoFaUrl() {
    await this.sendEmail('signInUrl', this.messages.emailSubjects.twoFaLogin);
  }

  async sendPasswordChanged(geolocation) {
    if (geolocation) {
      console.log(geolocation);
      await this.sendEmail('passwordChanged', this.messages.emailSubjects.passwordChanged);
    } else await this.sendEmail('passwordChanged', this.messages.emailSubjects.passwordChanged);
  }

  async sendLogInDetected(geolocation) {
    if (geolocation) {
      console.log(geolocation);
      await this.sendEmail('signIn', this.messages.emailSubjects.loginDetected);
    } else await this.sendEmail('signIn', this.messages.emailSubjects.loginDetected);
  }
};
