function doGet(e) {
  if(buscar_correo()) return HtmlService.createTemplateFromFile("index.html").evaluate();
  //else return HtmlService.createTemplateFromFile("fake.html").evaluate();
  else return HtmlService.createTemplateFromFile("index.html").evaluate();
}

function nombre(){
  try{
    return Session.getActiveUser().getEmail().split("@")[0]; 
  }
  catch(e){
    return "Desconocido"; 
  }
}

function nombre_nivel(){
  try{
    var correo = Session.getActiveUser().getEmail();
    var nombre = correo.split("@")[0];
    var book = SpreadsheetApp.openById("18G4npeaByYpNTSGqam-ofKYMiRi-Ki9dmHQh24nNVI4");
    var hoja = book.getSheetByName("Players");
    var datos = arrToDictWindex(hoja.getRange(1, 1,hoja.getLastRow(),3).getDisplayValues(),0,1);
    Logger.log("datos:"+datos);
    var res = datos[correo] ? [nombre,datos[correo],9] : [nombre,0,9];
    return res;
  }
  catch(e){
    return ["Desconocido",0,9]
  }
}

function arrToDict(arr){
  Logger.log("arr1:"+arr);
  var dict = {};
  for(a of arr){
    dict[a] = true;
  }
  Logger.log("dict1:"+dict);
  return dict;
}

function arrToDictWindex(arr,k,v){
  Logger.log("arr2:"+arr);
  var dict = {};
  for(a of arr){
    dict[a[k]] = a[v];
  }
  Logger.log("dict2:"+dict);
  return dict;
}

function buscar_correo(){
  var correo = Session.getActiveUser().getEmail();
  var book = SpreadsheetApp.openById("18G4npeaByYpNTSGqam-ofKYMiRi-Ki9dmHQh24nNVI4");
  var hoja = book.getSheetByName("Players");
  var datos = arrToDict(hoja.getRange(1, 1,hoja.getLastRow(),1).getDisplayValues());
  var res = datos.correo ? true : false;
  return res;
  }


function include(filename){
 return HtmlService.createHtmlOutputFromFile(filename).getContent();
  }

function imagen(id){
  if(!id) var id = '1jUAWZP5BPabZ7F-ggACSMCDr2a5k-561';
  var url = DriveApp.getFileById(id).getDownloadUrl();
  return url;
}

function loadImageBytes(id){
var bytes = DriveApp.getFileById(id).getBlob().getBytes();
return Utilities.base64Encode(bytes);
}

function escribirRecord(datos){
  /*
  Mayor angulo hoyo en uno
  Mayor altura hoyo en uno 
  */
  Logger.log(datos);
  var hoy = new Date();
  var hh = hoy.getHours();
  if(hh<10)hh='0'+hh;
  var min = hoy.getMinutes();
  if(min<10)min='0'+min;
  var mm = hoy.getMonth()+1;
  if(mm<10)mm='0'+mm;
  var dd = hoy.getDate();
  if(dd<10)dd='0'+dd;
  var yy = hoy.getFullYear()-2000;
  var fecha=dd+"-"+mm+"-"+yy+" ("+hh+":"+min+")";
  var book = SpreadsheetApp.openById("18G4npeaByYpNTSGqam-ofKYMiRi-Ki9dmHQh24nNVI4");
  var hoja = book.getSheetByName("Records");
  var hoja_player = book.getSheetByName("Players");
  var data = hoja_player.getRange(1, 1,hoja_player.getLastRow(),3).getDisplayValues();
  
  for(var i = 0;i<=data.length-1;i++){
    if(data[i][0] == datos.iniciales+"@gmail.com") {
      if(datos.nivel > data[i][1]) hoja_player.getRange(i+1,2).setValue(datos.nivel);
      break;
    }
  }
  
  var distancia_hoyo = Math.abs(Math.round((datos.x_inicial-datos.hoyo_centro)*100))/100;
  var angulo_altura = Math.round((datos.angulo * datos.altura*100))/100;
  var distancia = Math.round((1/datos.rebotes)*distancia_hoyo*85*100)/100;
  var rebote = Math.round((1/datos.rebotes)*angulo_altura*0.3*100)/100;
  var golpe = Math.round((1/datos.rebotes)*puntos_golpes(datos.golpes)*100)/100;
  var inversa = Math.round((1/datos.rebotes)*datos.reversa*650*100)/100;
  var viento = Math.round((datos.angulo/90)*datos.velocidad_viento*50*100)/100;
  var total = Math.round(angulo_altura+rebote+golpe+inversa+distancia+viento);
  var top_nivel = top(datos.nivel);
 
  var score = {"puntaje_angulo_altura":angulo_altura,"puntaje_rebote":rebote,"puntaje_golpes":golpe,"puntaje_tiro_reversa":inversa,"puntaje_distancia":distancia,"puntaje_viento":viento,"puntaje_total":total,"rebotes":datos.rebotes,"golpes":datos.golpes,"angulo":(Math.round(datos.angulo*100)/100),"altura":(Math.round(datos.altura*100)/100),"distancia":distancia_hoyo,"inverso":datos.reversa,"viento":datos.velocidad_viento,"top_nivel":top_nivel,"nivel":(datos.nivel-1)};
  var values = [[datos.iniciales,fecha,datos.angulo,datos.nivel,datos.altura,datos.rebotes,datos.golpes,datos.reversa,distancia_hoyo,datos.velocidad_viento,total]];
  var rango = hoja.getRange(hoja.getLastRow()+1, 1,1,hoja.getLastColumn()).setValues(values);
  return score;
}

function top(nivel){
   var book = SpreadsheetApp.openById("18G4npeaByYpNTSGqam-ofKYMiRi-Ki9dmHQh24nNVI4");
  var hoja = book.getSheetByName(nivel);
  var datos = hoja.getRange(1,1,1,hoja.getLastColumn()).getDisplayValues();
  var datos_top = datos[0][10]+" puntos por "+datos[0][0]+" en "+datos[0][1];
  return  datos_top;
}

function puntos_golpes(golpes){
  switch (golpes){
    case 1: return 1000;
    case 2: return 800;
    case 3: return 600;
    case 4: return 500;
    case 5: return 300;
    case 6: return 200;
    case 7: return 180;
    case 8: return 150;
    case 9: return 100;
    case 10: return 50;
    default: return 10;
  }
}

function downloadData(nivel){
  if(!nivel) nivel = 0;
  //nivel = 1;
  var book = SpreadsheetApp.openById("18G4npeaByYpNTSGqam-ofKYMiRi-Ki9dmHQh24nNVI4");
  var hoja = book.getSheetByName("Datos");
  var datos = hoja.getRange(1, (nivel*2)+1,hoja.getLastRow(),2).getDisplayValues();
  if(datos[0][0]!=""){
  var data = "{";
  for(var i = 0; i<=datos.length-1;i++){
    if(datos[i][0]=="bgid"||datos[i][0]=="footer") data+='"'+datos[i][0]+'":"'+datos[i][1]+'"';
    else data+='"'+datos[i][0]+'":'+datos[i][1];
    if(i<datos.length-1) data+=',';
  }
  data+="}";
  var data = JSON.parse(data);
  console.log(data);
  data.bgid = loadImageBytes(data.bgid);
  data.footer = loadImageBytes(data.footer);
  //Logger.log(data);
  return data;
  }
  else throw new Error("No existe el nivel!");
}
