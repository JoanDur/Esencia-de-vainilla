
async function registrar(){

    const usuario = {
        id_usuario:0,
        nombre:document.getElementById("nombre").value,
        correo:document.getElementById("correo").value,
        contrasena:document.getElementById("contrasena").value,
        telefono:document.getElementById("telefono").value,
        estado:true,
        id_rol:1
    };

    try{

        const respuesta = await fetch("/usuarios/registro",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(usuario)
        });

        if(respuesta.ok){

            document.getElementById("mensaje").innerHTML =
                "Usuario registrado correctamente. Redirigiendo al login...";

            setTimeout(() => {
                window.location.href = "/login.html";
            }, 1500);

        }else{

            document.getElementById("mensaje").innerHTML =
                "No fue posible registrar el usuario";
        }

    }catch(error){

        document.getElementById("mensaje").innerHTML =
            "Error al registrar usuario";
    }
}