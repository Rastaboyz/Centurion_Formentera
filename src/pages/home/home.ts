import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

import { EmailComposer } from '@ionic-native/email-composer';
import { Storage } from '@ionic/storage';

import { Geolocation } from '@ionic-native/geolocation';

let coord: Array<number> = new Array();

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  public errorObtenerPosicion: boolean = false;


  constructor(public navCtrl: NavController, private alertCtrl: AlertController, private emailComposer: EmailComposer, private storage: Storage, public geolocation: Geolocation) {
    geolocation.getCurrentPosition().catch(() => {
      this.errorObtenerPosicion = true;
    });
    this.obtenerLocalizacion();
  }

  public event = {
    timeStarts: horaActual(),
    idTrabajadorStorage: this.obtenerIdTrabajador(),
    tipoFicha: "Entrada"
  }

  private obtenerIdTrabajador() {
    this.storage.get('idTrabajador').then((val) => {
      this.event.idTrabajadorStorage = val;
    });
  }
  // CREA UNA IMAGEN A PARTIR DEL TEXTO.
  private generarImagen = function () {
    // https://www.cssscript.com/demo/text-image-converter-alter-js/
    var canvasHTML = document.createElement('canvas');
    canvasHTML.setAttribute("id", "canv");
    document.body.appendChild(canvasHTML);
    var canvas = <HTMLCanvasElement>document.getElementById('canv'), ctx = canvas.getContext('2d');

    var imgHTML = document.createElement('img');
    imgHTML.setAttribute("id", "image");
    imgHTML.style.visibility = "hidden";
    document.body.appendChild(imgHTML);
    var img = <HTMLImageElement>document.getElementById('image');

    var idTrabajador = (<HTMLInputElement>document.getElementById("idTrabajador").children[0]).value;
    var hora = (<HTMLInputElement>document.getElementById("hora").children[0]).innerText;
    var tipo = this.event.tipoFicha;

    // TEXTO A CONVERTIR
    var info = "ID Trabajador: " + idTrabajador.substring(0, 10) + "\nHora: " + hora + "\nTipo: " + tipo + "\nLat: " + coord[0] + "\nLong: " + coord[1];

    var text = info.split("\n").join("\n");
    var x = 12.5; // MARGEN X
    var y = 15; // MARGEN Y
    var lineheight = 25; // MARGEN ABAJO
    var lines = text.split('\n');
    var lineLengthOrder = lines.slice(0).sort(function (a, b) {
      return b.length - a.length;
    });
    ctx.canvas.width = ctx.measureText(lineLengthOrder[0]).width + 80; // ANCHURA
    ctx.canvas.height = (lines.length * lineheight);

    // ctx.fillStyle = "#FFF"; 
    // COLOR FONDO
    var gradientColor = ctx.createLinearGradient(0, 0, 170, 0);
    gradientColor.addColorStop(0, "#08447F");
    gradientColor.addColorStop(0.1, "#1088FF");
    gradientColor.addColorStop(1, "#80C1FF");
    ctx.fillStyle = gradientColor;

    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = "middle";
    ctx.font = "bold 15px Arial"; // TAMAÑO LETRA Y TIPOFRAFIA
    ctx.fillStyle = "#000"; // COLOR LETRA
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, y + (i * lineheight));

    }
    img.src = ctx.canvas.toDataURL();

    var urlBase64 = img.src.substring(22, img.src.length);
    return "base64:centurion.png//" + urlBase64; // IMAGEN FINAL

  }

  public obtenerLocalizacion() {
    this.geolocation.getCurrentPosition().then((response) => {
      setTimeout(function () {
        coord[0] = response.coords.latitude;
        coord[1] = response.coords.longitude;
        // alert(`lat: ${this.coord[0]} lon: ${this.coord[1]}`);
      }, 1000);
    }).catch((error) => {
      let alert = this.alertCtrl.create({
        title: "Error de geolocalización",
        subTitle: "Mensaje: " + error.message,
        buttons: ['OK']
      });
      alert.present();
    });
  }

  public enviarCorreo() {
    if (!this.errorObtenerPosicion) {
      var idTrabajador = (<HTMLInputElement>document.getElementById("idTrabajador").children[0]).value;
      this.storage.set('idTrabajador', idTrabajador);
      var imagen = this.generarImagen();

      var email = {
        app: 'gmail',
        to: 'centurion.formentera@sd-a.com',
        // cc: 'tomeu@sd-a.com',
        attachments: [imagen],
        subject: 'Control horario',
        isHtml: true
      }

      this.emailComposer.open(email);
    }
  }

  public registrarEnBBDD() {
    if (!this.errorObtenerPosicion) {
      var idTrabajador = (<HTMLInputElement>document.getElementById("idTrabajador").children[0]).value;
      this.storage.set('idTrabajador', idTrabajador);
      var hora = (<HTMLInputElement>document.getElementById("hora").children[0]).innerText;
      var tipo = this.event.tipoFicha.toString();
      var latitud = coord[0].toString();
      var longitude = coord[1].toString();

      var marcaje = {
        idTrabajador: idTrabajador,
        hora: hora,
        tipo: tipo,
        latitud: latitud,
        longitude: longitude
      };

      var xhr = new XMLHttpRequest();
      var url = "";
      xhr.open("POST", url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(marcaje));
    } else {
      let alert = this.alertCtrl.create({
        title: "Error",
        subTitle: "Hubo algún problema al obtener la localización. Cierre la aplicación y vuelva a intentarlo.",
        buttons: ['OK']
      });
      alert.present();
    }
  }
}

function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function horaActual() {
  var d = new Date();
  var h = addZero(d.getHours());
  var m = addZero(d.getMinutes());
  return h + ":" + m;
}
