var http = require('http');
var fs = require('fs');
var parseString = require('xml2js').parseString;


function makeDir(){
	var dir = __dirname + '/data/';
	if (!fs.existsSync(dir)) {
    	fs.mkdirSync(dir, 0744);
	} 
}

function writeFile(year, week, type, data, callback) {
	if(week < 10) {
		week = `0${week}`;
	}
	let file = `${__dirname}/data/${year}.json`;

	if (!fs.existsSync(file)) {
    // Do something

    	let stub = {'weeks': []};
    	fs.writeFileSync(file, JSON.stringify(stub), () => {

    	});
	}

	fs.readFile(file, 'utf8', function(err, contents) {
		console.log("File: " + file);
		console.log("\n");
		contents = JSON.parse(contents);
		contents.weeks.push(data);
    	console.log(contents.weeks.length);

    	contents = JSON.stringify(contents, null, 4)

    	

    	fs.writeFile(file, contents, function(err) {
			if(err) {
			    return console.log(err);
			}

			console.log("The file was saved!");
			callback();
		});
		
	});
	/*
	fs.appendFile(file, data, function(err) {
		if(err) {
		    return console.log(err);
		}

		console.log("The file was saved!");
		callback();
	});
	*/
}


//makeDir(year, week);


function getData(year, week,type, probowl) {

	let url = `http://www.nfl.com/ajax/scorestrip?season=${year}&seasonType=${type}&week=${week}`;
	console.log(url);

	let request = http.get(url, function(response) {

	let data = '';
 
  	// A chunk of data has been recieved.
  	response.on('data', (chunk) => {
    	data += chunk;
  	});
 
  	// The whole response has been received. Print out the result.
  	response.on('end', () => {
    	parseString(data, function (err, result) {
    	
    	if(result.ss != '') {
    			//result = JSON.stringify(result, null, 4);

    			let games = result.ss.gms[0].g;
    			let _games = [];

    			games.forEach((item, i) => {
    				_games.push(item['$']);
    			});

    			let _week = {'week': week, "type":type, "games": _games };

    			

				writeFile(year, week, type, _week, () => {
					console.log("callback");
					if(week < 40){

						week +=1; 

						console.log(`Week: ${week}`);
						getData(year, week,type, probowl);


					} 
				});
				
    	} else {

    		console.log("Nothing found", year, week, type);
    		console.log("\n\n\n");

    		//type = 'POST';
    		if(type == 'REG'){
    			getData(year, week, 'POST', probowl);

    		} else if(type == 'POST' && probowl === false) {

    			probowl = true;
    			getData(year, week, 'PRO', probowl);

    		} else if(type == 'PRO' && probowl === true) {
    			getData(year, week, 'POST', true);

    		} else {

    			if(year < 2018) {
    				console.log("End....." + week );
    				year = year +=1;
    				getData(year, 01, 'REG', false);
    			}
    			

    		}
    	}

	});
  });
	
});
}

/*

for(let year=2016; year<2018; year++) {

	let type = 'REG';

	//console.log(i);
	for (let week = 1; week < 40; week++) {
		//console.log(`${year} : ${week}`);
		getData(year, week,type);
	}
}
*/

rmDir = function(dirPath) {
      try { var files = fs.readdirSync(dirPath); }
      catch(e) { return; }
      if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
          var filePath = dirPath + '/' + files[i];
          if (fs.statSync(filePath).isFile())
            fs.unlinkSync(filePath);
          else
            rmDir(filePath);
        }
      fs.rmdirSync(dirPath);
    };

rmDir('data');
makeDir();

let year = 1990;
let week = 01;
let type = 'REG';

	
getData(year, week,type,false);




