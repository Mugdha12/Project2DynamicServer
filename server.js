// Built-in Node.js modules
var fs = require('fs')
var path = require('path')

// NPM modules
var express = require('express')
var sqlite3 = require('sqlite3')


var public_dir = path.join(__dirname, 'public');
var template_dir = path.join(__dirname, 'templates');
var db_filename = path.join(__dirname, 'db', 'usenergy.sqlite3');
var images_dir = path.join(__dirname, 'images');

var app = express();
var port = 8000;

// open usenergy.sqlite3 database
var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
    }
});


app.use(express.static(public_dir));


// GET request handler for '/'
app.get('/', (req, res) => {
    ReadFile(path.join(template_dir, 'index.html')).then((template) => {
        let response = template;
        // modify `response` here
        WriteHtml(res, response);
    }).catch((err) => {
        Write404Error(res);
    });
});

// GET request handler for '/year/*'
app.get('/year/:selected_year', (req, res) => {
    ReadFile(path.join(template_dir, 'year.html')).then((template) => {
        let response = template;
		var year = req.params.selected_year;
		var coal_count=0;
		var naturalGas_count=0;
        var nuclear_count=0;
        var petroleum_count=0;
        var renewable_count=0; 
        var table = "";
        var total  = 0;
		db.all("SELECT * FROM Consumption WHERE year = ?", [year], (err,data) => {
			if(err)
			{
				console.log("Error accessing the tables");
			}
			else
			{
                var i;
                for (i=0; i<data.length;i++)
                {
                    //console.log(data[i]["coal"]);
                    coal_count = coal_count+Number(data[i]["coal"]);
                    naturalGas_count=naturalGas_count+Number(data[i]["natural_gas"]);
                    nuclear_count=nuclear_count+Number(data[i]["nuclear"]);
                    petroleum_count=petroleum_count+Number(data[i]["petroleum"]);
                    renewable_count=renewable_count+Number(data[i]["renewable"]);
                    total  = coal_count + naturalGas_count + nuclear_count + petroleum_count + renewable_count;
                    table = table + " <tr> <td>" +  data[i]["state_abbreviation"] + "</td> <td>" + coal_count + "</td> <td> " + naturalGas_count + " </td> <td>" + nuclear_count + "</td> <td> " + petroleum_count + "</td> <td> " + renewable_count + "</td> <td> " + total + "</td> </tr>";

                }
                table = table + "</tr>";
                response=response.replace("!!!year!!!", year);
                response = response.replace("National Snapshot", year);
                var hold = "/Year/";
                if(year == 2017)
                {
                    response=response.replace("!!!next!!!", hold + year);
                }
                else
                {
                    response=response.replace("!!!next!!!", hold + (Number(year)+1));
                    response = response.replace("National Snapshot", Number(year)+1);
                }
                if(year == 1960)
                {
                    response=response.replace("!!!prev!!!", hold + year);
                }
                else
                {
                    response=response.replace("!!!prev!!!", hold + (Number(year)-1));
                    response = response.replace("National Snapshot", Number(year)-1);
                }
              //  console.log(response);
                response=response.replace("!!!CoalCount!!!",coal_count);
                response=response.replace("!!!Naturalcount!!!", naturalGas_count);
                response=response.replace("!!!Nuclearcount!!!", nuclear_count);
                response=response.replace("!!! PetroleumCount!!!", petroleum_count);
                response=response.replace("!!!RenewableCount!!!", renewable_count);
                response=response.replace("Data to be inserted", table);
				WriteHtml(res, response);
			}
		});
    }).catch((err) => {
        Write404Error(res);
    });
});

// GET request handler for '/state/*'
app.get('/state/:selected_state', (req, res) => {
    ReadFile(path.join(template_dir, 'state.html')).then((template) => {
        let response = template;
        var state = req.params.selected_state;
        var coal_counts=[];  // e.g. [1234, 2567, ...]
        var naturalGas_counts= [];
        var nuclear_counts = [];
        var petroleum_counts= [];
        var renewable_counts = []; 
        var table = "";
        var total = 0;
        var states = ["AK", "AL", "AR", "AZ","CA", "CO", "CT", "DC", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA","WI", "WV", "WY"];
        var fStates = ["Alaska", "Albama", "Arkansas", "Arizona", "California", "Colorado", "Connecticut", "District of Columbia", "Delaware", "Florida", "Georgia", "Hawaii", "Iowa", "Idaho", "Illinois", "Indiana", 
                    "Kansas", "Kentucky", "Louisiana", "Massachusetts", "Maryland", "Maine", "Michigan", "Minnesota", "Missouri", "Mississippi", "Montana", "North Carolina","North Dakota", "Nebraska", "New Hampshire",
                     "New Jersey","New Mexico","Nevada", "Newyork", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Virginia", "Vermont", "Washington", "Wisconsin", "West Virginia", "Wyoming"];
        var index = states.indexOf(state);
        db.all("SELECT * FROM Consumption WHERE state_abbreviation = ?", [state], (err,data) =>{
            if(err)
			{
				console.log("Error accessing the tables");
			}
			else
			{
                var i;
                for (i=0; i<data.length;i++)
                {
                    //console.log(data[i]["coal"]);
                    coal_counts[i] = Number(data[i]["coal"]);
                    naturalGas_counts[i]=Number(data[i]["natural_gas"]);
                    nuclear_counts[i]=Number(data[i]["nuclear"]);
                    petroleum_counts[i]=Number(data[i]["petroleum"]);
                    renewable_counts[i]=Number(data[i]["renewable"]);
                    total = coal_counts[i]+naturalGas_counts[i] + nuclear_counts[i] + petroleum_counts[i] + renewable_counts[i];
                    table = table + " <tr> <td>" +  data[i]["year"] + "</td> <td>" + data[i]["coal"] + "</td> <td> " + data[i]["natural_gas"] + " </td> <td>" + data[i]["nuclear"] + "</td> <td> " + data[i]["petroleum"] + "</td> <td> " + data[i]["renewable"] + "</td> <td> " + total + "</td> </tr>";

                }
                response = response.replace ("Yearly Snapshot", fStates[index] + " Yearly Snapshot");
                var hold = "/State/";
                if(state === "WY")
                {
                    response=response.replace("XXX", "Alaska");
                    response=response.replace("NextLink", hold+"AK");
                }
                else
                {
                    response=response.replace("NextLink", hold + states[index+1]);
                    response = response.replace("XXX", fStates[index+1]);
                }
                if(state === "AK")
                {
                    response=response.replace("XX", "Wyoming" );
                    response=response.replace("prevLink", hold + "WY" );
                }
                else
                {
                    response=response.replace("prevLink", hold + states[index-1]);
                    response = response.replace("XX", fStates[index-1]);
                }
                //console.log("arr to str", "[" + coal_counts.toString() + "]");
                response=response.replace("!!!state!!!", state);
                response=response.replace("!!!coal!!!","[" + coal_counts.toString() + "]");
                response=response.replace("!!!gas!!!", "[" + naturalGas_counts.toString() + "]");
                response=response.replace("!!!nuclear!!!","[" + nuclear_counts.toString() + "]");
                response=response.replace("!!!petrol!!!", "[" + petroleum_counts.toString() + "]");
                response=response.replace("!!!renew!!!", "[" + renewable_counts.toString() + "]");
                response=response.replace("Data to be inserted here", table);
				response=response.replace("noimage.jpg", state + ".jpg");
				response=response.replace("description", "Image by Clker-Free-Vector-Images from Pixabay");
				WriteHtml(res, response);

            }

        });

    }).catch((err) => {
        Write404Error(res);
    });
});

// GET request handler for '/energy-type/*'
app.get('/energy-type/:selected_energy_type', (req, res) => {
    ReadFile(path.join(template_dir, 'energy.html')).then((template) => {
        let response = template;
        var energyType = req.params.selected_energy_type;
        var energyCounts = {};
		var energyTypes = ["coal", "natural_gas", "nuclear", "petroleum", "renewable"];
		var index = energyTypes.indexOf(energyType);       
	   db.all("SELECT * FROM Consumption",  (err,data) => {
            if(err)
			{
				console.log("Error accessing the tables");
            }
            else
            {
                var i;
               for (i=0; i<data.length;i++)
			   {
                //    energyCounts[i] = data[state_abbreviation]:{data[year] : data[energyType]};
                }
				response = response.replace("Consumption Snapshot", energyType + " Consumption Snapshot");
				var hold = "/energy-type/";
                if(energyType === "renewable")
                {
                    response=response.replace("XXX", "Coal");
					response=response.replace("NextLink", hold + "renewable" );
                }
                else
                {
                    response = response.replace("NextLink", hold + energyTypes[index+1]);
                    response = response.replace("XXX", energyTypes[index+1]);
                }
                if(energyType === "coal")
                {
                    response=response.replace("XX", "Renewable" );
                    response=response.replace("prevLink", hold + "renewable" );
                }
                else
                {
                    response=response.replace("PrevLink", hold + energyTypes[index-1]);
                    response = response.replace("XX", energyTypes[index-1]);
                }
				
				
				
				
				if(energyType === "natural_gas")
				{
					response=response.replace("noimage.jpg", "NaturalGas.jpg");

				}
				else
				{
					response=response.replace("noimage.jpg", energyType + ".jpg");
				}
				
				response=response.replace("description", "Image by Clker-Free-Vector-Images from Pixabay");
				response=response.replace("description", "Image by Clker-Free-Vector-Images from Pixabay");
				WriteHtml(res, response);
            }
        });
        
    }).catch((err) => {
        Write404Error(res);
    });
});

function ReadFile(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data.toString());
            }
        });
    });
}

function Write404Error(res) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('Error: file not found');
    res.end();
}

function WriteHtml(res, html) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(html);
    res.end();
}


var server = app.listen(port);
