package com.esenciavainilla.esenciavainilla.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.esenciavainilla.esenciavainilla.dto.LoginManager;
import com.esenciavainilla.esenciavainilla.dto.RegistroManager;
import com.esenciavainilla.esenciavainilla.repository.UsuarioRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository){
        this.usuarioRepository = usuarioRepository; 
    }

    @PostMapping("/registro")
    public String registro(@RequestBody RegistroManager usuario) {
        //TODO: process POST request for register 

        usuarioRepository.registro(usuario);
        return "usuario registrado";
    }

    @PostMapping("/login")
    public LoginManager login(@RequestBody LoginManager loginData){
        //TODO: process POST request for login

        return usuarioRepository.login(
            loginData.nombre(),
            loginData.contrasena()
        );
    }
    
    
}
