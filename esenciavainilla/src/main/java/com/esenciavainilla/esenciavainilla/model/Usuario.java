package com.esenciavainilla.esenciavainilla.model;

public class Usuario {

    private int id_usuario; 
    private String nombre; 
    private String correo;
    private String contrasena; 
    private String telefono; 
    private Boolean estado; 
    private int id_rol; 

    public int getId_usuario(){
        return id_usuario;
    }
    public void setId_usuario(int id_usuario){
            this.id_usuario= id_usuario;
    }
    public String getNombre(){
        return nombre;
    }
    public void setNombre(String nombre){
        this.nombre = nombre; 
    }
        public String geCorreo(){
        return correo;
    }
    public void setCorreo(String correo){
        this.correo = correo; 
    }
        public String getContrasena(){
        return contrasena;
    }
    public void setContrasena(String contrasena){
        this.contrasena = contrasena; 
    }

    public String geTelefono(){
        return telefono;
    }
    public void setTelefono(String telefono){
        this.telefono= telefono; 
    }
    public Boolean getEstado (){
        return estado;
    }
    public void setEstado(Boolean estado ){
        this.estado = estado; 
    }
    public int getId_rol(){
        return id_rol; 
    }
    public void setId_rol(int id_rol){
        this.id_rol = id_rol;
    }
}
