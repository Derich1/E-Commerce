package br.com.derich.Cliente;

import jakarta.mail.*;
import jakarta.mail.internet.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class EmailSender {

    @Autowired
    private JavaMailSender emailSender;

    public void sendVerificationEmail(String toEmail, String verificationCode) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom("Ecommerce");
            helper.setTo(toEmail);
            helper.setSubject("Código de Verificação");
            helper.setText("Seu código de verificação é: " + verificationCode);

            emailSender.send(message);
            System.out.println("E-mail enviado com sucesso!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
