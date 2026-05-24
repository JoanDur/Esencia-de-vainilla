package com.esenciavainilla.esenciavainilla.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.esenciavainilla.esenciavainilla.dto.LoginManager;
import com.esenciavainilla.esenciavainilla.dto.RegistroManager;


@Repository
public class UsuarioRepository {

    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedJdbc;

    public UsuarioRepository(JdbcTemplate jdbcTemplate,
                             NamedParameterJdbcTemplate namedJdbc) {

        this.jdbcTemplate = jdbcTemplate;
        this.namedJdbc = namedJdbc;
    }

    // RowMapper del registro 
    private final RowMapper<RegistroManager> usuarioRegistroMapper = (rs, rowNum) ->
        new RegistroManager(
            rs.getInt("id_usuario"),
            rs.getString("nombre"),
            rs.getString("correo"),
            rs.getString("contrasena"),
            rs.getString("telefono"),
            rs.getBoolean("estado"),
            rs.getInt("id_rol")
        );

    //RowMapper del login

    private final RowMapper<LoginManager> usuarioLoginMapper = (rs, rowNum) ->
        new LoginManager(
            rs.getString("nombre"),
            rs.getString("contrasena")
        );

    public void registro(RegistroManager usuario){
            String sql = """
        INSERT INTO usuario
        (nombre, correo, contrasena, telefono, activo, id_rol)
        VALUES
        (:nombre, :correo, :contrasena, :telefono, :estado, :id_rol)
        """;

        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("nombre", usuario.nombre())
            .addValue("correo", usuario.correo())
            .addValue("contrasena", usuario.contrasena())
            .addValue("telefono", usuario.telefono())
            .addValue("estado", usuario.estado())
            .addValue("id_rol", usuario.id_rol());

     namedJdbc.update(sql, params);
    }

    public LoginManager login(String nombre, String contrasena) {

        String sql =
            "SELECT * FROM usuario " +
            "WHERE nombre = :nombre " +
            "AND contrasena = :contrasena";

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("nombre", nombre)
                .addValue("contrasena", contrasena);

        return namedJdbc.queryForObject(
                sql,
                params,
                usuarioLoginMapper
        );
    }

    
}