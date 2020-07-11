//Utilidades

const mostrar = (e) => e.style.display = 'block'
const ocultar = (e) => e.style.display = 'none'

function formato(f){
    let d = new Date((f.seconds*1000)+f.nanoseconds)
    const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d)
    const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d)
    const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d)
    return `${da}/${mo}/${ye}`
}
let cerrar_escucha = ()=>{}

const ocultar_menu = () => {
    const es = document.getElementsByClassName("menu")
    for(let i=0;i<es.length;i++)
        ocultar(es[i])
}


const db = firebase.firestore()
const dbSalas = db.collection("salas")
const dbMensajes = db.collection("mensajes")

//Apodo
const cambiar_apodo = (e) => { 
    nombre =  e.value
    sessionStorage.setItem("nombre",nombre )
    ocultar_menu()
    mostrar(document.getElementById("_chats"))
    menuSalas()
}

//Salas
let list_salas = []

const crear_sala = () => {
    let nombre = document.getElementById("nombre-sala").value
    let contra = document.getElementById("contrasena-sala").value
    let nuevaSala = {nombre,contra}
    nuevaSala.fecha = firebase.firestore.Timestamp.fromDate(new Date())
    dbSalas.add(nuevaSala)
    ocultar_menu()
    mostrar(document.getElementById("_chats"))
}
const menuSalas = () =>{
    cerrar_escucha()
    cerrar_escucha = dbSalas.onSnapshot((querySnapshot)=>{
        list_salas = []
        querySnapshot.forEach((doc)=>{
            list_salas.push({id:doc.id,...doc.data()})
        })
        mostrar_salas()
    })    
}
const mostrar_salas = () => {
    document.getElementById("list-chat")
        .innerHTML = list_salas.reduce((acc,salas,i)=>acc+`  
      <div class="col-sm-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${salas.nombre}</h5>
            <p class="card-text"></p>
            <button class="btn btn-primary btn-sm" onclick="ver_sala(${i})">Ver</button>
            <button class="btn btn-danger btn-sm" onclick="confirmar_sala(${i})">Eliminar</button><br>
          </div>
        </div>
      </div>
        `,"")
}

const confirmar_sala = (i) => {
    ocultar_menu()
    mostrar(document.getElementById("_acion"))
    document.getElementById("nombre-acion").innerHTML = "Introduce la contraseña para eliminar la sala "+list_salas[i].nombre
    document.getElementById("boton").innerHTML = `<button class="btn btn-primary mt-3 w-100" onclick="eliminar_sala(${i})">Eliminar sala</button>`
}
const ver_sala = (i) => {
    ocultar_menu()
    mostrar(document.getElementById("_acion"))
    document.getElementById("nombre-acion").innerHTML = "Introduce la contraseña para ver la sala "+list_salas[i].nombre
    document.getElementById("boton").innerHTML = `<button class="btn btn-primary mt-3" onclick="entrar_sala(${i})">Ver sala</button>`
}

const eliminar_sala = (i) => {
    let contra = document.getElementById("contrasena-acion").value
    ocultar_menu()
    mostrar(document.getElementById("_chats"))
    if(contra == list_salas[i].contra){   
        dbSalas.doc(list_salas[i].id).delete() 
        dbMensajes.where("idSala", "==", list_salas[i].id).get().then(p=>{
            p.forEach(d=>{dbMensajes.doc(d.id).delete()})
        })
    }
}

let sala_id = 0;
const entrar_sala = (i) => {
    let contra = document.getElementById("contrasena-acion").value
    ocultar_menu()
    if(contra == list_salas[i].contra){
        mostrar(document.getElementById("_mensajes"))       
        document.getElementById("mensajes_titulo").innerHTML = `${list_salas[i].nombre}`
        sala_id = list_salas[i].id
        escuchar_sala()
    }else{
        mostrar(document.getElementById("_chats"))
        alert("Hubo un error "+ list_salas[i].contra)
    }
}

let list_mensajes = []

const mostrar_mensajes = () => {
    document.getElementById("mensajes")
    .innerHTML = list_mensajes.reduce((acc,m)=>acc+`

    
  <a href="#" class="list-group-item list-group-item-action w-100">
  <div class="d-flex w-100 justify-content-between">
    <h6 class="mb-1">${m.contenido}</h6>
    <small class="text-muted">${formato(m.fecha)}</small>
  </div>
  <small class="text-muted"> ${m.usuario} </small>
</a>
    `,"")
}

const escuchar_sala = () => { 
    cerrar_escucha()
    cerrar_escucha = dbMensajes.where("idSala", "==", sala_id).onSnapshot((querySnapshot)=>{
        list_mensajes_m = []
        querySnapshot.forEach((doc)=>{
            list_mensajes_m.push({id:doc.id,...doc.data()})
        })
        if(list_mensajes.length != list_mensajes_m.length){
            list_mensajes = list_mensajes_m.sort((a,b)=>b.fecha.seconds-a.fecha.seconds)
            let ult = list_mensajes[0]
            if(document.visibilityState == "hidden"){
                solicitar(`${ult.usuario} : ${ult.contenido}`)
            }
            mostrar_mensajes()
        }
    })
}


const agregar_mensaje = (e) => {
    dbMensajes.add({
        idSala:sala_id,
        contenido:e.value,
        usuario : nombre,
        fecha:firebase.firestore.Timestamp.fromDate(new Date())
    })
    e.value = ""
}

const regresar = () =>{
    ocultar_menu()
    mostrar(document.getElementById("_chats"))
    menuSalas()
}
const crear = () =>{
    ocultar_menu()
    mostrar(document.getElementById("_crear"))
}
const salir = () =>{
    ocultar_menu()
    mostrar(document.getElementById("_apodo"))
    sessionStorage.removeItem("nombre")
}


if(sessionStorage.getItem("nombre") == null){
    ocultar_menu()
    mostrar(document.getElementById("_apodo"))  
}
else{
    nombre = sessionStorage.getItem("nombre")
    ocultar_menu()
    mostrar(document.getElementById("_chats"))
    menuSalas()
}

