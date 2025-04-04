package br.com.derich.Cliente.entity;

import br.com.derich.Cliente.dto.ClienteRequestDTO;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.*;
import java.util.stream.Collectors;

@Document(collection = "cliente")
public class Cliente {

    @Id
    private String id;
    private String name;
    private String numeroDocumento;
    private String datanascimento;
    private String telefone;
    private String email;
    private String password;
    private List<String> roles;

    private Set<String> favoritos = new HashSet<>();

    public Cliente(String email, String password, List<String> roles) {
        this.email = email;
        this.password = password;
        this.roles = roles;
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (roles == null) return Collections.emptyList();
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList());
    }

    public void adicionarFavorito(String produtoId) {
        favoritos.add(produtoId);
    }

    public void removerFavorito(String produtoId) {
        favoritos.remove(produtoId);
    }

    public Set<String> getFavoritos() {
        return favoritos;
    }

    public void setFavoritos(Set<String> favoritos) {
        this.favoritos = favoritos;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNumeroDocumento() {
        return numeroDocumento;
    }

    public void setNumeroDocumento(String numeroDocumento) {
        this.numeroDocumento = numeroDocumento;
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

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public Cliente() {

    }

    public Cliente(ClienteRequestDTO data){
        this.id = UUID.randomUUID().toString();
        this.name = data.name();
        this.numeroDocumento = data.numeroDocumento();
        this.datanascimento = data.datanascimento();
        this.telefone = data.telefone();
        this.email = data.email();
        this.password = data.password();
    }
}
