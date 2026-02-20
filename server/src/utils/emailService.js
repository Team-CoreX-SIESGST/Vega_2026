import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SENDINBLUE_HOST,
            port: process.env.SENDINBLUE_PORT,
            secure: false,
            auth: {
                user: process.env.SENDINBLUE_USER,
                pass: process.env.SENDINBLUE_PASSWORD
            }
        });
    }

    async sendReminderEmail(user, task, reminderData) {
        try {
            // Read and compile the template
            const templatePath = path.join(__dirname, "../emailTemplates/taskReminder.html");
            const templateContent = await fs.readFile(templatePath, "utf-8");
            const template = handlebars.compile(templateContent);

            // Prepare template data
            const templateData = {
                taskTitle: task.title,
                dueDate: new Date(task.dueDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }),
                daysLeft: reminderData.daysThreshold,
                priority: task.priority || "medium",
                assignedBy: reminderData.assignedByName || "",
                customMessage: reminderData.message || "",
                taskUrl: `${process.env.FRONTEND_URL || "https://yourdomain.com"}/tasks/${task._id}`,
                isImmediate: reminderData.daysThreshold === 0,
                currentYear: new Date().getFullYear()
            };

            // Generate HTML content
            const htmlContent = template(templateData);

            // Email configuration
            const mailOptions = {
                from: `"Task Management System" <${process.env.SENDER_EMAIL}>`,
                to: user.email,
                subject: `🔔 Task Reminder: ${task.title}`,
                html: htmlContent,
                text: this.generatePlainText(templateData)
            };

            // Send email
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Email sent to ${user.email}: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    }

    generatePlainText(data) {
        return `
Task Reminder
===============

Task: ${data.taskTitle}
Due Date: ${data.dueDate}
${data.daysLeft ? `Days Remaining: ${data.daysLeft}` : "Immediate Reminder"}
Priority: ${data.priority}
${data.customMessage ? `Message: ${data.customMessage}` : ""}

View Task: ${data.taskUrl}

This is an automated reminder. Please do not reply to this email.
        `.trim();
    }

    async sendBulkReminderEmails(users, task, reminderData) {
        const emailPromises = users.map((user) =>
            this.sendReminderEmail(user, task, reminderData).catch((error) => {
                console.error(`Failed to send email to ${user.email}:`, error);
                return null;
            })
        );

        return Promise.all(emailPromises);
    }
}

export default new EmailService();
