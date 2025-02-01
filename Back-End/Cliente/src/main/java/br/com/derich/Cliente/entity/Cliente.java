package br.com.derich.Cliente.entity;

import br.com.derich.Cliente.dto.ClienteRequestDTO;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "cliente")
public class Cliente {

    @Id
    private String id;
    private String name;
    private String cpf;
    private String datanascimento;
    private String telefone;
    private String email;
    private String password;

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getDatanascimento() {
        return datanascimento;
    }

    public void setDatanascimento(String datanascimento) {
        this.datanascimento = datanascimento;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Cliente() {

    }

    public Cliente(ClienteRequestDTO data){
        this.name = data.name();
        this.cpf = data.cpf();
        this.datanascimento = data.datanascimento();
        this.telefone = data.telefone();
        this.email = data.email();
        this.password = data.password();
    }
}
