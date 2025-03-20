package br.com.derich.Cliente.dto;

public class LoginResponseDTO {

    private String id;
    private String nome;
    private String email;
    private String token;
    private String numeroDocumento;

    public LoginResponseDTO(String id, String nome, String email, String numeroDocumento, String token) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.token = token;
        this.numeroDocumento = numeroDocumento;
    }

    // Getters e Setters
    public String getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getNumeroDocumento() {
        return numeroDocumento;
    }
    public String getToken() { return token; }


    public void setId(String id) { this.id = id; }
    public void setNome(String nome) { this.nome = nome; }
    public void setEmail(String email) { this.email = email; }
    public void setNumeroDocumento(String numeroDocumento) {
        this.numeroDocumento = numeroDocumento;
    }
    public void setToken(String token) { this.token = token; }
}
