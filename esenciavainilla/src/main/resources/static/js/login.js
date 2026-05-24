
async function login(){

    const datos = {
        nombre: document.getElementById("nombre").value,
        contrasena: document.getElementById("contrasena").value
    };

    try{

        const respuesta = await fetch("/usuarios/login",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(datos)
        });

        if(!respuesta.ok){
            throw new Error("Credenciales inválidas");
        }

        const usuario = await respuesta.json();

        document.getElementById("mensaje").innerHTML =
            "Bienvenido " + usuario.nombre;

        // Aquí luego puedes redirigir al dashboard
        // window.location.href = "/dashboard.html";

    }catch(error){

        document.getElementById("mensaje").innerHTML =
            "Usuario o contraseña incorrectos";
    }

}