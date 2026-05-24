package com.esenciavainilla.esenciavainilla.dto;

public record RegistroManager(
    int id_usuario, 
    String nombre,
    String correo,
    String contrasena, 
    String telefono, 
    Boolean estado, 
    int id_rol 
) {}
