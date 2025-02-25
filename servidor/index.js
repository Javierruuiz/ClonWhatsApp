const express = require('express');
const { createServer } = require('http');
const path = require('path');
const app = express();
const port = 3000;
const { Server } = require('socket.io');
const serv = createServer(app);
const io = new Server(serv);

let users = [];  // Para almacenar la información de los usuarios

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

io.on('connection', (socket) => {
  let userInfo = {};

  // Evento cuando un nuevo usuario se conecta
  socket.on('newUser', (data) => {
    userInfo = data;
    users.push({ id: socket.id, ...data });
    console.log(`${data.userName} se ha conectado`);

    // Notificar a los usuarios de la entrada
    io.emit('texto', { nombre: 'Servidor', mensaje: `${data.userName} ha entrado al chat`, tipo: 'texto' });
    io.emit('userList', users); // Enviar lista actualizada de usuarios
  });

  // Evento cuando un usuario se desconecta
  socket.on('disconnect', () => {
    users = users.filter(user => user.id !== socket.id);
    console.log('Un usuario se ha desconectado');
    io.emit('userList', users); // Actualizar lista de usuarios
    io.emit('texto', { nombre: 'Servidor', mensaje: `${userInfo.userName} ha salido del chat`, tipo: 'texto' });
  });

  // Evento para recibir y emitir mensajes
  socket.on("mensaje", (datos) => {
    io.emit("texto", datos);
    console.log("Recibo mensaje con datos = " + datos);
  });
});

app.use(express.static(path.join(__dirname, '/public')));

serv.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
