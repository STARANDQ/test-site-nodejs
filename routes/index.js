const express = require('express');
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const colors = require('colors');

const User = require('../models/user');
const Script = require('../models/script');
const FileData = require('../models/file');

let scriptStatus = false;
let fileContent;

router.get('/result', (req, res, next) => {
	let dataFile = null;
	let dataUser = null;

	async function PromiseFile(){
		return FileData.find({ }, (err, data) => {data});
	}

	async function PromiseUser(){
		return User.find({ }, (err, data) => { data });
	}

	dataFile = PromiseFile();
	dataUser = PromiseUser();

	dataUser.then(users => {
		dataFile.then(files => {
			return res.render('result.ejs', {
				"data": {
					"users": users,
					"files": files
				}
			})
		})
	})

});


router.get('/register', (req, res, next) => {
	User.findOne({ unique_id: req.session.userId }, (err, data) => {
		if(!data){
			return res.redirect('/login');
		}
		else if (data.role === "admin") {
			return res.render('index.ejs');
		}else
			return res.redirect('/login');
	});
});

router.get('/files', (req, res, next) => {
	FileData.find({ }, (err, data) => {
		if (!data) {
			res.redirect('/data');
		} else {
			return res.render('files.ejs', {
				"data": data,
				"userId": req.session.userId
			});
		}
	});
});



const upload = multer({ dest: 'uploads/' })
router.post('/upload', upload.single('uploadFile'), function (req, res, next) {
	FileData.findOne({}, (err, data) => {

		let newFileData = new FileData({
			unique_id: getId(data),
			fileName: (req.file.originalname).replace(".txt", ""),
			fileNameUploads: req.file.filename,
			fileStatus: "",
			fileScript: null,
			updateDate: "Файл не проходил проверку",
			userName: getFileUserName(req.file.originalname)
		});

		newFileData.save((err, newFileData) => {
			if (err)
				console.log(err);
			else
				console.log('Add File ' + req.file.originalname);
		});

	}).sort({ _id: -1 }).limit(1);
	return res.redirect('/files');
})


router.get('/userInfo', (req, res, next) => {
	User.find({ }, (err, data) => {
		if (!data) {
			res.redirect('/data');
		} else {
			return res.render('userInfo.ejs', {
				"data": data,
				"userId": req.session.userId
			});
		}
	});
});


router.get('/scriptStatus', (req, res, next) => {
	return res.render('scriptStatus.ejs', {
		"status": scriptStatus
	});
});

router.get('/scripts', (req, res, next) => {
	Script.find({ }, (err, data) => {
		return res.render('scripts.ejs', {
			"data": data,
			"userId": req.session.userId,
			"status": "Действителен"
		});
	});
});

router.post('/fileInfo', (req, res, next) => {
	FileData.findOne({unique_id: req.body.id}, (err, data) => {
		res.send({
			"Success": "getInfo",
			"Info": data.fileNameUploads
		});
	});
});

router.post('/addScript', (req, res, next) => {
	Script.findOne({}, (err, data) => {
		let newScript = new Script({
			unique_id: getId(data),
			name: req.body.name,
			script: req.body.result,
			status: "Действителен"
		});

		newScript.save((err, Script) => {
			if (err)
				console.log(err);
			else
				console.log('Add Script');
		});

	}).sort({ _id: -1 }).limit(1);
	res.send({ "Success": "reload" });
});

router.post('/editScriptStatus', (req, res, next) => {
	Script.updateOne({ unique_id: req.body.id}, {$set: {"status": req.body.status}}, function(err, result){});
	res.send({ "Success": "reload" });
});

router.post('/userInfo', (req, res, next) => {
	if(req.body.status === "remove") {
		User.remove({_id: req.body.id}, (err, data) => {
			console.log("Remove id: " + req.body.id);
			res.send({ "Success": "reload" });
		});
	}
});

router.post('/register', (req, res, next) => {
	let personInfo = req.body;
	if (!personInfo.name || !personInfo.surname || !personInfo.patronymic || !personInfo.role || !personInfo.password) {
		res.send();
	} else {
			User.findOne({ }, (err, data) => {
					let c;
					User.findOne({}, (err, data) => {

						c = getId(data);

						let newPerson = new User({
							unique_id: c,
							name: personInfo.name,
							surname: personInfo.surname,
							patronymic: personInfo.patronymic,
							role: personInfo.role,
							password: personInfo.password,
							username: (personInfo.name + "_" + personInfo.surname + "_" + personInfo.patronymic).toLowerCase()
						});

						newPerson.save((err, Person) => {
							if (err)
								console.log(err);
							else
								console.log('[Register] Success | (' + Person.unique_id + ') ФИО: ' +
									Person.name + " " + Person.surname + " " + Person.patronymic);
						});

					}).sort({ _id: -1 }).limit(1);
					res.send({ "Success": "You are regestered,You can login now." });
			});
	}
});

router.get('/login', (req, res, next) => {
	User.findOne({ unique_id: req.session.userId }, (err, data) => {
		if (data) {
			return res.redirect('/profile');
		}else
			return res.render('login.ejs');
	});
});

router.post('/login', (req, res, next) => {
	let usernameReq = (req.body.name + "_" + req.body.surname + "_" + req.body.patronymic).toLowerCase();
	User.findOne({ username: usernameReq }, (err, data) => {
		if (data) {
			if (data.password == req.body.password) {
				req.session.userId = data.unique_id;
				res.send({ "Success": "Success!" });
			} else {
				res.send({ "Success": "Wrong password!" });
			}
		} else {
			res.send({ "Success": "This Username Is not regestered!" });
		}
	});
});

router.get('/profile', (req, res, next) => {
	User.findOne({ unique_id: req.session.userId }, (err, data) => {
		if (!data) {
			res.redirect('/login');
		} else {
			return res.render('data.ejs', {
				"name": data.name,
				"surname": data.surname,
				"patronymic": data.patronymic,
				"role": data.role,
				"Success": "Success!"
			});
		}
	});
});

router.get('/logout', (req, res, next) => {
	if (req.session) {
		// delete session object
		req.session.destroy((err) => {
			if (err) {
				return next(err);
			} else {
				return res.redirect('/login');
			}
		});
	}
});

function getId(data){
	if (data) return data.unique_id + 1;
	else return 1;
}

function getFileUserName(name){
	name = name.replace(".txt", "");
	name = name.replace(".", "");
	name = name.replace("_", "");
	name = name.replace("(", "");
	name = name.replace(")", "");
	name = name.replace("!", "");
	name = name.replace("?", "");
	name = name.replace("[", "");
	name = name.replace("]", "");
	name = name.replace(",", "");
	name = name.replace("#", "");
	name = name.replace("$", "");
	name = name.replace("^", "");
	name = name.replace("&", "");
	name = name.replace("*", "");
	name = name.replace("-", "");
	name = name.replace("=", "");
	name = name.replace("+", "");
	name = name.replace("@", "");
	name = name.replace("№", "");
	name = name.replace(":", "");
	name = name.replace(";", "");
	name = name.replace("0", "");
	name = name.replace("1", "");
	name = name.replace("2", "");
	name = name.replace("3", "");
	name = name.replace("4", "");
	name = name.replace("5", "");
	name = name.replace("6", "");
	name = name.replace("7", "");
	name = name.replace("8", "");
	name = name.replace("9", "");
	//
	name = name.replace(" ", "");
	name = name.toLowerCase();
	return name;
}

function getDateNow() {
	let date = new Date();
	return date.toDateString() + " | " + date.toLocaleTimeString();
}

startScripts();

function startScripts(){

	scriptStatus = true;

	let scriptDB;
	let fileDataDB;
	let blockWeight = 0;
	let countWord = 0;
	let filesArr = [];
	let fileScript = [];

	let _nameScript = "";
	let _arrayChapter = [];
	let _nameChapter = "";
	let _arrBlocks = [];
	let _nameBlock = "";
	let _weightBlock = "";
	let _typeBlock = "";

	async function PromiseScript(){
		return Script.find({ }, (err, data) => {data});
	}

	async function PromiseFileData(){
		return FileData.find({ }, (err, data) => { data });
	}

	scriptDB = PromiseScript();
	fileDataDB = PromiseFileData();

	//({текст}.split("{ключевое слово}").length - 1)
	scriptDB.then(scripts => {
		fileDataDB.then(files => {

			files.forEach(file_ => {
				if(file_.fileStatus !== "checked2")
					filesArr.push({
						"id":file_.unique_id,
						"text": fs.readFileSync(__dirname.replace("/routes", "") +
						"/uploads/" + file_.fileNameUploads, "utf8")
					});
			});
		return filesArr;

		}).then((filesArr) => {
			//название скрипта
			//дата
			//массив разделов {
				//название раздела
				//масив блоков{
					//Название блока
					//Вес блока
					//Тип блока
				//}
			//}
			filesArr.forEach(file_ => {
				//console.log(file_.text);
				console.log(("Файл id: " + file_.id).green);
				scripts.forEach(script => {
					if(script.status === "Действителен"){
						_nameScript = script.name;
						console.log(("Скрипт: " + script.name).blue);
						console.log("");
						JSON.parse(script.script).forEach(infoScript => {
							_nameChapter = infoScript.name;
							console.log(("Раздел: " + infoScript.name).cyan);
							console.log("");
							infoScript.blockArr.forEach(block => {
								_nameBlock = block.blockName;
								console.log(("Имя блока: " + block.blockName).red);
								console.log("Количество найденых слов:");
								block.keyWords.split("\n").forEach(word => {
									console.log(word + " - " + (file_.text.split(word).length - 1));
									if(block.blockMode === "simple")
										if ((file_.text.split(word).length - 1) > 0)
											blockWeight = +block.blockWeight;

									if(block.blockMode === "complex") {
										if ((file_.text.split(word).length - 1) > 0)
											countWord++;

										if (countWord !== 0)
											blockWeight = +countWord / (block.keyWords.split("\n").length - 1) * block.blockWeight;
									}
								});
								_weightBlock = blockWeight;
								console.log(("Вес блока (итоговый): " + blockWeight).red);
								console.log(("Вес блока (изначальный): " + block.blockWeight).magenta);
								_typeBlock = block.blockMode;
								console.log(("Тип блока: " + block.blockMode).magenta);
								console.log("\n");
								countWord = 0;
								blockWeight = 0;
								_arrBlocks.push({
									"nameBlock": _nameBlock,
									"weightBlock": _weightBlock,
									"typeBlock": _typeBlock
								});
							})
							console.log("\n");
							_arrayChapter.push({
								"nameChapter":_nameChapter,
								"arrBlocks": _arrBlocks
							})
							_arrBlocks = [];
						})
						fileScript.push({
							"nameScript": _nameScript,
							"arrayChapter": _arrayChapter
						})
						_arrayChapter = [];
					}
				});
				FileData.updateOne({ unique_id: file_.id}, {$set: {"fileScript": fileScript}}, function(err, result){});
				fileScript = [];
				FileData.updateOne({ unique_id: file_.id}, {$set: {"fileStatus": "checked"}}, function(err, result){});
				FileData.updateOne({ unique_id: file_.id}, {$set: {"updateDate": getDateNow()}}, function(err, result){});
			});
		})
	});


	scriptStatus = false;
}

module.exports = router;