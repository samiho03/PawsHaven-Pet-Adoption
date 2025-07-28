package com.example.PostApet.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final String from;

    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.username}") String from) {
        this.mailSender = mailSender;
        this.from = from;
    }

    public void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);


            String fullText = text + "\n\n--\nPaws-Haven - The Pet Adoption Web\n" +
                    "Find your perfect furry friend today!\n" +
                    "Website: https://www.paws-haven.com\n" +
                    "Contact: support@paws-haven.gmail.com";

            message.setText(fullText);

            mailSender.send(message);
        } catch (Exception ignored) {
            // ignore failures in demo environment
        }
    }
}
