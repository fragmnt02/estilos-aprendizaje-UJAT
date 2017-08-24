var express = require('express');
var bodyParser=require('body-parser');
var mysql=require('mysql');
var connection=mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'',
	database:'CHAEA'
});
connection.connect(function(error){
	if (!!error) {
		console.log('Error conectando');
	}else {
		console.log('Connected');
	}
});
var app= express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine','jade');

app.get('/index',function(req,res){
	res.render('index');
});

app.get('/',function(req,res){
	res.render('index');
});

app.get('/admin',function(req,res){
	res.render('administracion');
});

app.get('/cuest',function(req,res){
	connection.query('SELECT texto FROM `Grupo`',function(error,rows,fields) {
		if (!!error) {
			console.log('Error al cargar grupos '+error);
		}else {
			connection.query('SELECT * FROM `Pregunta`',function(error2,rows2,fields2) {
				if (!!error2) {
					console.log('Error al cargar preguntas '+error2);
				}else {
					console.log(rows2);
					res.render('cuestionario',{grupos:rows,preguntas:rows2});
				}
			});
		}
	});
});

app.post('/verResultado',function(req,res) {
	connection.query('SELECT * FROM `Cuestionario` WHERE alumno='+req.body.inputIdAlumno+';',function(error,rows,fields){
		if (!!error) {
		console.log('Error');
		}else {
			res.render('verResultado',{resultados:rows});
		}
	});
});

app.post('/crearGrupo',function(req,res) {
	connection.query('INSERT INTO `Grupo`(`texto`) VALUES("'+req.body.inputNombreGrupo+'");',function(error,rows,fields) {
		if (!!error) {
			console.log('Error creando grupo'+error);
		}else{
			res.render('grupoCreado');
		}
	});
});

app.post('/guardarResultados',function(req,res) {
	connection.query('SELECT id FROM `Grupo` WHERE texto="'+req.body.selectGrupo+'";',function (error,rows,fields) {
		if(!!error){
			console.log('error buscando grupos '+error);
		}else {
			var idGrupo=rows[0].id;
			connection.query('INSERT INTO `Alumno`(`grupo`) VALUES('+idGrupo+');',function(error2,rows2,fields2) {
				if (!!error2) {
					console.log('error creando alumno '+error2);
				}else {
					console.log('alumno creado');
					connection.query('SELECT id FROM `Alumno` ORDER BY id DESC LIMIT 1;',function (error3,rows3,fields3) {
						if (!!error3) {
							console.log('error obteniendo indice alumno '+error3)
						}else {
							var idAlumno=rows3[0].id;
							var activo=[req.body.pr3,req.body.pr5,req.body.pr7,req.body.pr9,req.body.pr13,req.body.pr20,req.body.pr26,req.body.pr27,req.body.pr35,req.body.pr37,req.body.pr41,req.body.pr43,req.body.pr46,req.body.pr48,req.body.pr51,req.body.pr61,req.body.pr67,req.body.pr74,req.body.pr75,req.body.pr77];
							var reflexivo=[req.body.pr10,req.body.pr16,req.body.pr18,req.body.pr19,req.body.pr28,req.body.pr31,req.body.pr32,req.body.pr34,req.body.pr36,req.body.pr39,req.body.pr42,req.body.pr44,req.body.pr49,req.body.pr55,req.body.pr58,req.body.pr63,req.body.pr65,req.body.pr69,req.body.pr70,req.body.pr79];
							var teorico=[req.body.pr2,req.body.pr4,req.body.pr6,req.body.pr11,req.body.pr15,req.body.pr17,req.body.pr21,req.body.pr23,req.body.pr25,req.body.pr29,req.body.pr33,req.body.pr45,req.body.pr50,req.body.pr54,req.body.pr60,req.body.pr64,req.body.pr66,req.body.pr71,req.body.pr78,req.body.pr80];
							var pragmatico=[req.body.pr1,req.body.pr8,req.body.pr12,req.body.pr14,req.body.pr22,req.body.pr24,req.body.pr30,req.body.pr38,req.body.pr40,req.body.pr47,req.body.pr52,req.body.pr53,req.body.pr56,req.body.pr57,req.body.pr59,req.body.pr62,req.body.pr68,req.body.pr72,req.body.pr73,req.body.pr76];
							var cantActivo=contar(activo);
							var cantReflexivo=contar(reflexivo);
							var cantTeorico=contar(teorico);
							var cantPragmatico=contar(pragmatico);
							console.log('Activo: '+cantActivo+' reflexivo: '+cantReflexivo+' teorico: '+cantTeorico+' pragmatico: '+cantPragmatico);
							connection.query('INSERT INTO `Cuestionario`(`alumno`,`fecha`,`cantActivo`,`cantReflexivo`,`cantTeorico`,`cantPragmatico`) VALUES('+idAlumno+',CURDATE(),'+cantActivo+','+cantReflexivo+','+cantTeorico+','+cantPragmatico+');',function(error4,rows4,fields4) {
								if (!!error4) {
									console.log('error guardando resultados '+error4);
								}else {
									connection.query('SELECT * FROM `Cuestionario` WHERE alumno='+idAlumno+';',function (error5,rows5,fields5) {
										if (!!error5) {
											console.log('error obteniendo resultados '+error5);
										} else {
											res.render('verResultado',{resultados:rows5});
											
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
});

function contar(arreglo) {
	var contador=0;
	for (var i = 0; i < arreglo.length; i++) {
		if(arreglo[i]!=undefined){
			contador++;
		}
	}
	return contador;
}
app.listen(8080);