
        function notification(mensaje) {
            let notification = new Notification('Chat',
                {
                    body: mensaje,
                    icon: "./img/icono192.png",
                    onclick: e => console.log("Notificacion")
                });
                //notification.onclick = e=>{console.log("Nuevo")}
        }
        function solicitar(mensaje) {
            if (!("Notification" in window)) {
                alert("This browser does not support desktop notification")
            }
            else if (Notification.permission === "granted") {
                notification(mensaje)
            }
            else if (Notification.permission !== 'denied') {
                Notification.requestPermission(function (permission) {
                    if (permission === "granted") {
                        notification(mensaje)
                    }
                })
            }
        }